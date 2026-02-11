import { test, expect } from "@playwright/test";
import {
  testUsers,
  setupCommonRoutes,
  setupOrderRoute,
  setupVerifyOrderRoute,
  setupUserMeRoute,
  loginAs,
  mockMenu,
  mockFranchises,
} from "./testUtils";

const { diner: dinerUser } = testUsers;

test.describe("Order Flow - Menu to Delivery", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page, null);
    await setupOrderRoute(page, []);
    await page.goto("/");
  });

  test("can complete full order flow from menu to delivery", async ({
    page,
  }) => {
    await loginAs(page, dinerUser);
    await setupUserMeRoute(page, dinerUser); // Update route after login

    // Navigate to menu
    await page.getByRole("button", { name: "Order now" }).click();

    // Verify on order page
    await expect(page.locator("h2")).toContainText("Awesome is a click away");

    // Select a franchise store
    await page.getByRole("combobox").selectOption("1");

    // Select pizzas
    await page.getByRole("link", { name: /Image Description Veggie/i }).click();
    await page
      .getByRole("link", { name: /Image Description Pepperoni/i })
      .click();

    // Verify selection count
    await expect(page.locator("form")).toContainText("Selected pizzas: 2");

    // Proceed to checkout
    await page.getByRole("button", { name: "Checkout" }).click();

    // Should be on payment page
    await expect(page.locator("h2")).toContainText("So worth it");
    await expect(
      page.getByText("Send me those 2 pizzas right now!"),
    ).toBeVisible();

    // Verify order summary
    await expect(page.locator("table")).toContainText("Veggie");
    await expect(page.locator("table")).toContainText("Pepperoni");
    await expect(page.locator("tfoot")).toContainText("2 pies");
    await expect(page.locator("tfoot")).toContainText("0.008 ₿");

    // Complete payment
    await page.getByRole("button", { name: "Pay now" }).click();

    // Should be on delivery page
    await expect(page.locator("h2")).toContainText("Here is your JWT Pizza!");
    await expect(page.getByText("order ID:")).toBeVisible();
    await expect(page.getByText("pie count:")).toBeVisible();
    await expect(page.getByText("total:")).toBeVisible();
  });

  test("can order without being logged in initially", async ({ page }) => {
    // Start ordering without login
    await page.getByRole("button", { name: "Order now" }).click();

    // Select items
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();

    // Should be redirected to login
    await expect(page.locator("h2")).toContainText("Welcome back");

    // Login
    await page.getByPlaceholder("Email address").fill(dinerUser.email!);
    await page.getByPlaceholder("Password").fill(dinerUser.password!);
    await page.getByRole("button", { name: "Login" }).click();
    await setupUserMeRoute(page, dinerUser); // Update route after login

    // Should return to payment page
    await expect(page.locator("h2")).toContainText("So worth it");
  });
});

test.describe("Payment Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page, null);
    await setupOrderRoute(page, []);
    await page.goto("/");
    await loginAs(page, dinerUser);
    await setupUserMeRoute(page, dinerUser); // Update route after login
  });

  test("displays order summary correctly", async ({ page }) => {
    // Navigate through order flow
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();

    // Verify payment page
    await expect(page.locator("h2")).toContainText("So worth it");
    await expect(page.getByText("Send me that pizza right now!")).toBeVisible();

    // Verify table structure
    await expect(page.getByRole("columnheader", { name: "Pie" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Price" }),
    ).toBeVisible();

    // Verify order items
    await expect(page.locator("tbody")).toContainText("Veggie");
    await expect(page.locator("tbody")).toContainText("0.004");
  });

  test("displays correct message for single pizza", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();

    // Single pizza message
    await expect(page.getByText("Send me that pizza right now!")).toBeVisible();
    await expect(page.locator("tfoot")).toContainText("1 pie");
  });

  test("displays correct message for multiple pizzas", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("link", { name: /Pepperoni/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();

    // Multiple pizzas message
    await expect(
      page.getByText("Send me those 2 pizzas right now!"),
    ).toBeVisible();
    await expect(page.locator("tfoot")).toContainText("2 pies");
  });

  test("calculates total price correctly", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("link", { name: /Pepperoni/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();

    // Total should be Veggie (0.0038) + Pepperoni (0.0042) = 0.008
    await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  });

  test("can cancel payment and return to menu", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();

    // Cancel payment
    await page.getByRole("button", { name: "Cancel" }).click();

    // Should return to menu
    await expect(page).toHaveURL(/.*\/menu/);
    await expect(page.locator("h2")).toContainText("Awesome is a click away");
  });

  test("handles payment errors gracefully", async ({ page }) => {
    // Setup order route to fail
    await page.route("*/**/api/order", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          json: { message: "Payment processing failed" },
        });
      }
    });

    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();

    // Try to pay
    await page.getByRole("button", { name: "Pay now" }).click();

    // Should show error message
    await expect(page.getByText(/Payment processing failed/i)).toBeVisible();

    // Should still be on payment page
    await expect(page.locator("h2")).toContainText("So worth it");
  });

  test("pay now button initiates payment", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();

    // Verify Pay now button exists
    const payButton = page.getByRole("button", { name: "Pay now" });
    await expect(payButton).toBeVisible();
    await expect(payButton).toBeEnabled();

    // Click pay
    await payButton.click();

    // Should navigate to delivery page
    await expect(page.locator("h2")).toContainText("Here is your JWT Pizza!");
  });
});

test.describe("Delivery Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page, null);
    await setupOrderRoute(page, []);
    await setupVerifyOrderRoute(page, true);
    await page.goto("/");
    await loginAs(page, dinerUser);
    await setupUserMeRoute(page, dinerUser);
  });

  test("displays order confirmation details", async ({ page }) => {
    // Complete order flow
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("link", { name: /Pepperoni/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByRole("button", { name: "Pay now" }).click();

    // Verify delivery page
    await expect(page.locator("h2")).toContainText("Here is your JWT Pizza!");

    // Verify order details
    await expect(page.getByText("order ID:")).toBeVisible();
    await expect(page.getByText("23")).toBeVisible(); // Order ID from mock

    await expect(page.getByText("pie count:")).toBeVisible();
    await expect(page.getByText("total:")).toBeVisible();
  });

  test("displays JWT token", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByRole("button", { name: "Pay now" }).click();

    // Verify JWT is displayed
    const jwtDisplay = page.locator("div.font-mono.text-xs");
    await expect(jwtDisplay).toBeVisible();
    await expect(jwtDisplay).toContainText("eyJpYXQi"); // Start of JWT
  });

  test("can verify valid JWT", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByRole("button", { name: "Pay now" }).click();

    // Click verify button
    await page.getByRole("button", { name: "Verify" }).click();

    // Should show modal with valid status
    await expect(page.getByText("JWT Pizza - valid")).toBeVisible();
    await expect(page.getByText("Pizza Pocket")).toBeVisible();
  });

  test("handles invalid JWT verification", async ({ page }) => {
    await setupVerifyOrderRoute(page, false); // Invalid JWT

    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByRole("button", { name: "Pay now" }).click();

    // Click verify button
    await page.getByRole("button", { name: "Verify" }).click();

    // Should show modal with invalid status
    await expect(page.getByText("JWT Pizza - invalid")).toBeVisible();
  });

  test("can order more pizzas from delivery page", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByRole("button", { name: "Pay now" }).click();

    // Click "Order more" button
    await page.getByRole("button", { name: "Order more" }).click();

    // Should navigate back to menu
    await expect(page).toHaveURL(/.*\/menu/);
    await expect(page.locator("h2")).toContainText("Awesome is a click away");
  });

  test("displays pizza icon/illustration", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByRole("button", { name: "Pay now" }).click();

    // Verify pizza SVG icon is displayed
    const pizzaIcon = page.locator("svg.text-yellow-500");
    await expect(pizzaIcon).toBeVisible();
  });

  test("closes verification modal", async ({ page }) => {
    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page.getByRole("link", { name: /Veggie/i }).click();
    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByRole("button", { name: "Pay now" }).click();

    // Open verification modal
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByText("JWT Pizza - valid")).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: "Close" }).last().click();

    // Modal should be hidden
    await expect(page.getByText("JWT Pizza - valid")).not.toBeVisible();
  });
});

test.describe("Order History Integration", () => {
  test("completed order appears in order history", async ({ page }) => {
    const completedOrder = {
      id: 23,
      franchiseId: 1,
      storeId: 1,
      date: new Date(),
      items: [
        {
          id: 1,
          menuId: 1,
          description: "Veggie",
          price: 0.0038,
        },
      ],
    };

    await setupCommonRoutes(page, null);
    await setupOrderRoute(page, [completedOrder]);
    await page.goto("/");
    await loginAs(page, dinerUser);
    await setupUserMeRoute(page, dinerUser);

    // Navigate to diner dashboard
    await page.getByRole("link", { name: "KC" }).click();

    // Verify order appears in history
    await expect(page.locator("table")).toContainText("23");
    await expect(page.locator("table")).toContainText("0.004");
  });
});
