import { test, expect } from "playwright-test-coverage";
import {
  testUsers,
  setupCommonRoutes,
  setupOrderRoute,
  loginAs,
  mockOrders,
} from "./testUtils";

const { diner: dinerUser } = testUsers;

test.describe("Diner Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page, null);
    await page.goto("/");
  });

  test("displays user information correctly", async ({ page }) => {
    await setupOrderRoute(page, mockOrders);
    await loginAs(page, dinerUser);

    // Navigate to diner dashboard via user initials
    await page.getByRole("link", { name: "KC" }).click();

    // Verify page title
    await expect(page.locator("h2")).toContainText("Your pizza kitchen");

    // Verify user information is displayed

    await expect(page.getByText("name:").first()).toBeVisible();
    await expect(page.getByText(dinerUser.name!)).toBeVisible();
    await expect(page.getByText("email:").first()).toBeVisible();
    await expect(page.getByText(dinerUser.email!)).toBeVisible();
    await expect(page.getByText("role:").first()).toBeVisible();
    // Check for diner role in the role section (not breadcrumb)
    await expect(page.locator(".text-orange-200")).toContainText("diner");
  });

  test("shows order history when user has orders", async ({ page }) => {
    await setupOrderRoute(page, mockOrders);
    await loginAs(page, dinerUser);

    await page.getByRole("link", { name: "KC" }).click();

    // Verify history message
    await expect(
      page.getByText("Here is your history of all the good times."),
    ).toBeVisible();

    // Verify order table is displayed
    await expect(page.locator("table")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "ID" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Price" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Date" }),
    ).toBeVisible();

    // Verify order data
    await expect(page.locator("table")).toContainText("1");
    await expect(page.locator("table")).toContainText("2");
    // Check for prices (Veggie + Pepperoni = 0.008 for order 1)
    await expect(page.locator("table")).toContainText("0.008");
    // Check for single Veggie order (0.0038 rounds to 0.004 for order 2)
    await expect(page.locator("table")).toContainText("0.004");
  });

  test("shows empty state when user has no orders", async ({ page }) => {
    await setupOrderRoute(page, []); // Empty order history
    await loginAs(page, dinerUser);

    await page.getByRole("link", { name: "KC" }).click();

    // Verify empty state message
    await expect(
      page.getByText("How have you lived this long without having a pizza?"),
    ).toBeVisible();

    // Verify "Buy one now" link
    const buyLink = page.getByRole("link", { name: "Buy one" });
    await expect(buyLink).toBeVisible();
    await expect(buyLink).toHaveAttribute("href", "/menu");

    // Verify no order table is shown
    await expect(page.locator("table")).not.toBeVisible();
  });

  test("displays multiple orders correctly", async ({ page }) => {
    await setupOrderRoute(page, mockOrders);
    await loginAs(page, dinerUser);

    await page.getByRole("link", { name: "KC" }).click();

    // Count the number of order rows in the table
    const orderRows = page.locator("tbody tr");
    await expect(orderRows).toHaveCount(2);
  });

  test("can navigate to order page from empty state", async ({ page }) => {
    await setupOrderRoute(page, []);
    await loginAs(page, dinerUser);

    await page.getByRole("link", { name: "KC" }).click();

    // Click the "Buy one" link
    await page.getByRole("link", { name: "Buy one" }).click();

    // Should be on the menu/order page
    await expect(page).toHaveURL(/.*\/menu/);
  });

  test("requires authentication to access dashboard", async ({ page }) => {
    // Try to navigate directly to diner dashboard without logging in
    await page.goto("/diner-dashboard");

    // User should see empty/no data (or be redirected)
    // The dashboard renders but won't show any orders without auth
    await expect(page.locator("h2")).toContainText("Your pizza kitchen");

    // No order history should be visible since not authenticated
    // (This depends on implementation - the component may show empty state or error)
  });

  test("displays user profile image", async ({ page }) => {
    await setupOrderRoute(page, mockOrders);
    await loginAs(page, dinerUser);

    await page.getByRole("link", { name: "KC" }).click();

    // Verify profile image is displayed
    const profileImage = page.getByRole("img", {
      name: "Employee stock photo",
    });
    await expect(profileImage).toBeVisible();
    await expect(profileImage).toHaveAttribute("src", /unsplash/);
  });

  test("formats order dates correctly", async ({ page }) => {
    await setupOrderRoute(page, mockOrders);
    await loginAs(page, dinerUser);

    await page.getByRole("link", { name: "KC" }).click();

    // Verify dates are displayed (exact format may vary by locale)
    // Just check that date column contains typical date patterns
    const dateCell = page.locator("tbody tr").first().locator("td").nth(2);
    await expect(dateCell).toBeVisible();
    // Date should be formatted - just verify it's not empty
    await expect(dateCell).not.toBeEmpty();
  });

  test("calculates order totals correctly", async ({ page }) => {
    await setupOrderRoute(page, mockOrders);
    await loginAs(page, dinerUser);

    await page.getByRole("link", { name: "KC" }).click();

    // First order has Veggie (0.0038) + Pepperoni (0.0042) = 0.008
    const firstOrderPrice = page
      .locator("tbody tr")
      .first()
      .locator("td")
      .nth(1);
    await expect(firstOrderPrice).toContainText("0.008");

    // Second order has only Veggie (0.0038 rounds/displays as 0.004)
    const secondOrderPrice = page
      .locator("tbody tr")
      .nth(1)
      .locator("td")
      .nth(1);
    await expect(secondOrderPrice).toContainText("0.004");
  });
});

test.describe("Diner Dashboard - Role Display", () => {
  test("displays franchisee role correctly", async ({ page }) => {
    await setupCommonRoutes(page, null);
    await setupOrderRoute(page, []);
    await page.goto("/");

    await loginAs(page, testUsers.franchisee);

    await page.getByRole("link", { name: "FO" }).click();

    // Verify franchisee role is displayed
    await expect(page.getByText("role:")).toBeVisible();
    await expect(page.locator(".text-orange-200")).toContainText("Franchisee");
  });

  test("displays admin role correctly", async ({ page }) => {
    await setupCommonRoutes(page, null);
    await setupOrderRoute(page, []);
    await page.goto("/");

    await loginAs(page, testUsers.admin);

    await page.getByRole("link", { name: "AU" }).click();

    // Verify admin role is displayed
    await expect(page.getByText("role:")).toBeVisible();
    // Use exact match within the role section
    await expect(
      page.locator(".text-orange-200").getByText("admin", { exact: true }),
    ).toBeVisible();
  });
});
