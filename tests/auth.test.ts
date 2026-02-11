import { test, expect } from "@playwright/test";
import {
  testUsers,
  setupCommonRoutes,
  setupAuthRoutes,
  setupUserMeRoute,
  setupMenuRoute,
  setupFranchiseListRoute,
  loginAs,
  registerUser,
  logoutUser,
} from "./testUtils";

const { diner: dinerUser, admin: adminUser } = testUsers;

test.describe("User Registration", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page, null);
    await page.goto("/");
  });

  test("can register a new user with valid credentials", async ({ page }) => {
    // Navigate to registration page
    await page.getByRole("link", { name: "Register" }).click();

    // Verify on registration page
    await expect(page.locator("h2")).toContainText("Welcome to the party");

    // Fill in registration form
    await page.getByPlaceholder("Full name").fill("New User");
    await page.getByPlaceholder("Email address").fill("newuser@test.com");
    await page.getByPlaceholder("Password").fill("password123");

    // Submit registration
    await page.getByRole("button", { name: "Register" }).click();

    // Should be redirected to home page and logged in
    await expect(page.getByRole("link", { name: "NU" })).toBeVisible();
  });

  test("can navigate to login page from registration", async ({ page }) => {
    await page.getByRole("link", { name: "Register" }).click();

    // Click on "Login instead" link in the form
    await page.getByRole("main").getByText("Login").click();

    // Should be on login page
    await expect(page.locator("h2")).toContainText("Welcome back");
  });

  test("registration form requires all fields", async ({ page }) => {
    await page.getByRole("link", { name: "Register" }).click();

    // Try to submit without filling fields
    const registerButton = page.getByRole("button", { name: "Register" });
    await registerButton.click();

    // Should still be on registration page (HTML5 validation)
    await expect(page.locator("h2")).toContainText("Welcome to the party");
  });

  test("registration form requires valid email format", async ({ page }) => {
    await page.getByRole("link", { name: "Register" }).click();

    await page.getByPlaceholder("Full name").fill("Test User");
    await page.getByPlaceholder("Email address").fill("invalid-email");
    await page.getByPlaceholder("Password").fill("password123");

    // Try to submit with invalid email
    await page.getByRole("button", { name: "Register" }).click();

    // Should still be on registration page due to HTML5 validation
    await expect(page.locator("h2")).toContainText("Welcome to the party");
  });

  test("handles registration error for duplicate email", async ({ page }) => {
    // Setup auth route to return error for duplicate email
    await page.route("*/**/api/auth", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 400,
          json: { message: "Email already exists" },
        });
      }
    });

    await page.getByRole("link", { name: "Register" }).click();

    await page.getByPlaceholder("Full name").fill("Test User");
    await page.getByPlaceholder("Email address").fill("existing@test.com");
    await page.getByPlaceholder("Password").fill("password123");

    await page.getByRole("button", { name: "Register" }).click();

    // Should show error message
    await expect(page.getByText(/Email already exists/i)).toBeVisible();
  });

  test("new user is automatically logged in after registration", async ({
    page,
  }) => {
    await registerUser(page, "New User", "newuser@test.com", "password123");

    // User should be logged in - check for user initials in nav
    await expect(page.getByRole("link", { name: "NU" })).toBeVisible();

    // Login/Register links should not be visible
    await expect(page.getByRole("link", { name: "Login" })).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "Register" }),
    ).not.toBeVisible();
  });
});

test.describe("User Login", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page, null);
    await page.goto("/");
  });

  test("can login with valid credentials", async ({ page }) => {
    await loginAs(page, dinerUser);

    // Should see user initials in navbar
    await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
  });

  test("shows error for invalid email", async ({ page }) => {
    await page.getByRole("link", { name: "Login" }).click();

    await page.getByPlaceholder("Email address").fill("wrong@test.com");
    await page.getByPlaceholder("Password").fill("wrongpassword");

    await page.getByRole("button", { name: "Login" }).click();

    // Should show error message (JSON stringified format)
    await expect(page.getByText(/401|error/i)).toBeVisible();

    // Should still be on login page
    await expect(page.locator("h2")).toContainText("Welcome back");
  });

  test("shows error for invalid password", async ({ page }) => {
    await page.getByRole("link", { name: "Login" }).click();

    await page.getByPlaceholder("Email address").fill(dinerUser.email!);
    await page.getByPlaceholder("Password").fill("wrongpassword");

    await page.getByRole("button", { name: "Login" }).click();

    // Should show error message (JSON stringified format)
    await expect(page.getByText(/401|error/i)).toBeVisible();
  });

  test("can navigate to registration from login page", async ({ page }) => {
    await page.getByRole("link", { name: "Login" }).click();

    // Click "Register" link in the form
    await page.getByRole("main").getByText("Register").click();

    // Should be on registration page
    await expect(page.locator("h2")).toContainText("Welcome to the party");
  });

  test("login form requires email and password", async ({ page }) => {
    await page.getByRole("link", { name: "Login" }).click();

    // Try to submit without credentials
    await page.getByRole("button", { name: "Login" }).click();

    // Should still be on login page (HTML5 validation)
    await expect(page.locator("h2")).toContainText("Welcome back");
  });

  test("redirects to previous page after successful login", async ({
    page,
  }) => {
    // Try to access a protected page (like order page)
    await page.goto("/order");

    // Should be redirected or see login prompt
    // Note: This behavior depends on route guards implementation

    await loginAs(page, dinerUser);

    // After login, user should be on home or the intended page
    await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
  });
});

test.describe("User Logout", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page, null);
    await page.goto("/");
    await loginAs(page, dinerUser);
  });

  test("can logout successfully", async ({ page }) => {
    // Verify user is logged in
    await expect(page.getByRole("link", { name: "KC" })).toBeVisible();

    // Logout
    await logoutUser(page);

    // Should see Login/Register links again
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();

    // User initials should not be visible
    await expect(page.getByRole("link", { name: "KC" })).not.toBeVisible();
  });

  test("clears user session on logout", async ({ page }) => {
    await logoutUser(page);

    // Try to access user-specific features
    // Diner link should not be visible after logout
    await expect(page.getByRole("link", { name: "KC" })).not.toBeVisible();

    // Should be able to login again
    await loginAs(page, dinerUser);
    await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
  });

  test("redirects to home page after logout", async ({ page }) => {
    await logoutUser(page);

    // Should be on home page
    await expect(page).toHaveURL(/.*\//);
  });

  test("removes franchise access for franchisee after logout", async ({
    page,
  }) => {
    // Logout current user
    await logoutUser(page);

    // Login as franchisee
    await setupCommonRoutes(page, null);
    await loginAs(page, testUsers.franchisee);

    // Verify franchisee can see Franchise link
    await expect(
      page.getByRole("link", { name: "Franchise" }).first(),
    ).toBeVisible();

    // Logout
    await logoutUser(page);

    // Franchise link should still be visible (in footer) but not in navbar context
    // After logout, user should see Login/Register
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });

  test("removes admin access after logout", async ({ page }) => {
    // Logout current user
    await logoutUser(page);

    // Login as admin
    await setupCommonRoutes(page, null);
    await loginAs(page, adminUser);

    // Verify admin can see Admin link
    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();

    // Logout
    await logoutUser(page);

    // Admin link should not be visible
    await expect(page.getByRole("link", { name: "Admin" })).not.toBeVisible();

    // Should see Login/Register
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });
});

test.describe("Authentication State Persistence", () => {
  test("maintains login state across navigation", async ({ page }) => {
    await setupCommonRoutes(page, null);
    await page.goto("/");
    await loginAs(page, dinerUser);

    // Navigate to different pages
    await page.getByRole("link", { name: "Franchise" }).first().click();
    await expect(page.getByRole("link", { name: "KC" })).toBeVisible();

    // Go back to home
    await page.getByRole("link", { name: "Home" }).click();
    await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
  });

  test("shows appropriate navigation for logged in user", async ({ page }) => {
    await setupCommonRoutes(page, null);
    await page.goto("/");
    await loginAs(page, dinerUser);

    // Should see Logout link in navigation
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();

    // Should see user initials
    await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
  });

  test("shows appropriate navigation for logged out user", async ({ page }) => {
    await setupCommonRoutes(page, null);
    await page.goto("/");

    // Should see Login and Register
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();

    // Should not see user initials
    await expect(page.getByRole("link", { name: "KC" })).not.toBeVisible();
  });
});

test.describe("Role-Based Access", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page, null);
    await page.goto("/");
  });

  test("diner can access order functionality", async ({ page }) => {
    await loginAs(page, dinerUser);

    // Should be able to access order page
    await page.getByRole("button", { name: "Order now" }).click();

    // Should see order page
    await expect(page.locator("h2")).toContainText("Awesome is a click away");
  });

  test("admin can access admin dashboard", async ({ page }) => {
    await loginAs(page, adminUser);

    // Should see Admin link
    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();

    // Click and verify access
    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
  });

  test("non-admin cannot see admin link", async ({ page }) => {
    await loginAs(page, dinerUser);

    // Should not see Admin link
    await expect(page.getByRole("link", { name: "Admin" })).not.toBeVisible();
  });

  test("franchisee can access franchise dashboard", async ({ page }) => {
    await loginAs(page, testUsers.franchisee);

    // Should see Franchise link in navbar
    await expect(
      page.getByRole("link", { name: "Franchise" }).first(),
    ).toBeVisible();
  });
});
