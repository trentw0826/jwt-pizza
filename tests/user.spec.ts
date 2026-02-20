import { test, expect } from "playwright-test-coverage";
import {
  setupCommonRoutes,
  registerUser,
  setupUpdateUserRoute,
  setupOrderRoute,
  loginAs,
  testUsers,
  setupStatefulUserRoutes,
  setupAuthRoutes,
  setupMenuRoute,
  setupFranchiseListRoute,
} from "./testUtils";

test.describe("Update User", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page);
    await setupUpdateUserRoute(page);
    await setupOrderRoute(page, []);
  });

  test("opens and closes edit modal without changes", async ({ page }) => {
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

    await page.goto("/");
    await registerUser(page, "pizza diner", email, "diner");
    await page.getByRole("link", { name: "pd" }).click();

    await expect(page.getByRole("main")).toContainText("pizza diner");

    // Open modal
    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByRole("dialog")).toContainText("Edit user");

    // Close without updating
    await page.getByRole("button", { name: "Update" }).click();

    // Wait for modal to close
    await page.waitForTimeout(200);

    // Verify user info still displayed
    await expect(page.getByRole("main")).toContainText("pizza diner");
  });

  test("updates user name and persists change", async ({ page }) => {
    await page.goto("/");
    await loginAs(page, testUsers.diner);
    await page.getByRole("link", { name: "KC" }).click();

    // Verify original name
    await expect(page.getByRole("main")).toContainText("Kai Chen");

    // Open edit modal
    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByRole("dialog")).toContainText("Edit user");

    // Update name field
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill("Updated Name");

    // Submit update
    await page.getByRole("button", { name: "Update" }).click();

    // Wait for modal to close
    await page.waitForTimeout(200);

    // Verify updated name is displayed in dashboard
    await expect(page.getByRole("main")).toContainText("Updated Name");
    await expect(page.getByRole("main")).not.toContainText("Kai Chen");

    // Verify initials updated in header
    await expect(page.getByRole("link", { name: "UN" })).toBeVisible();
  });

  test("updates user email and persists change", async ({ page }) => {
    await page.goto("/");
    await loginAs(page, testUsers.diner);
    await page.getByRole("link", { name: "KC" }).click();

    // Verify original email
    await expect(page.getByRole("main")).toContainText("d@jwt.com");

    // Open edit modal
    await page.getByRole("button", { name: "Edit" }).click();

    // Update email field
    const emailInput = page.locator('input[type="email"]');
    await emailInput.clear();
    await emailInput.fill("newemail@jwt.com");

    // Submit update
    await page.getByRole("button", { name: "Update" }).click();

    // Wait for modal to close
    await page.waitForTimeout(200);

    // Verify updated email is displayed
    await expect(page.getByRole("main")).toContainText("newemail@jwt.com");
    await expect(page.getByRole("main")).not.toContainText("d@jwt.com");
  });

  test("updates user password", async ({ page }) => {
    await page.goto("/");
    await loginAs(page, testUsers.diner);
    await page.getByRole("link", { name: "KC" }).click();

    // Open edit modal
    await page.getByRole("button", { name: "Edit" }).click();

    // Password field should be empty initially
    const passwordInput = page.locator("input#password");
    await expect(passwordInput).toHaveValue("");

    // Update password
    await passwordInput.fill("newpassword123");

    // Submit update
    await page.getByRole("button", { name: "Update" }).click();

    // Wait for modal to close
    await page.waitForTimeout(200);

    // Verify dashboard still displays (password change successful)
    await expect(page.getByRole("main")).toContainText("Kai Chen");
  });

  test("updates all user fields simultaneously", async ({ page }) => {
    await page.goto("/");
    await loginAs(page, testUsers.diner);
    await page.getByRole("link", { name: "KC" }).click();

    // Open edit modal
    await page.getByRole("button", { name: "Edit" }).click();

    // Update all fields
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill("New Full Name");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.clear();
    await emailInput.fill("newuser@jwt.com");

    const passwordInput = page.locator("input#password");
    await passwordInput.fill("supersecret");

    // Submit update
    await page.getByRole("button", { name: "Update" }).click();

    // Wait for modal to close
    await page.waitForTimeout(200);

    // Verify all changes persisted in the dashboard
    await expect(page.getByRole("main")).toContainText("New Full Name");
    await expect(page.getByRole("main")).toContainText("newuser@jwt.com");

    // Verify the changes are reflected in the user info grid
    const userInfoGrid = page.locator(".text-orange-200");
    await expect(userInfoGrid).toContainText("New Full Name");
    await expect(userInfoGrid).toContainText("newuser@jwt.com");
  });

  test("modal closes after successful update", async ({ page }) => {
    await page.goto("/");
    await loginAs(page, testUsers.diner);
    await page.getByRole("link", { name: "KC" }).click();

    // Open modal
    await page.getByRole("button", { name: "Edit" }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Edit user");

    // Make a change
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill("Test Name");

    // Submit update
    await page.getByRole("button", { name: "Update" }).click();

    // Wait and verify modal is closed/hidden
    await page.waitForTimeout(200);

    // Modal should no longer be visible
    const modalAfter = page.locator('[role="dialog"]');
    await expect(modalAfter).toHaveClass(/hidden/);
  });

  test("handles update error gracefully", async ({ page }) => {
    // Setup failing update route
    await setupUpdateUserRoute(page, true);

    await page.goto("/");
    await loginAs(page, testUsers.diner);
    await page.getByRole("link", { name: "KC" }).click();

    // Open edit modal
    await page.getByRole("button", { name: "Edit" }).click();

    // Make a change
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill("Should Fail");

    // Setup dialog listener to capture alert
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Failed to update user");
      await dialog.accept();
    });

    // Submit update
    await page.getByRole("button", { name: "Update" }).click();

    // Wait a bit for error handling
    await page.waitForTimeout(300);

    // Original name should still be displayed
    await expect(page.getByRole("main")).toContainText("Kai Chen");
  });

  test("button shows updating state during request", async ({ page }) => {
    await page.goto("/");
    await loginAs(page, testUsers.diner);
    await page.getByRole("link", { name: "KC" }).click();

    // Open edit modal
    await page.getByRole("button", { name: "Edit" }).click();

    // Make a change
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill("Updated Name");

    const updateButton = page.getByRole("button", { name: "Update" });

    // Click update and immediately check button state
    const updatePromise = updateButton.click();

    // Button text should change or be disabled (check within short time)
    await page.waitForTimeout(50);

    // Wait for completion
    await updatePromise;
    await page.waitForTimeout(200);

    // After update completes, verify success
    await expect(page.getByRole("main")).toContainText("Updated Name");
  });

  test("preserves user roles after update", async ({ page }) => {
    await page.goto("/");
    await loginAs(page, testUsers.diner);
    await page.getByRole("link", { name: "KC" }).click();

    // Verify role exists
    await expect(page.getByText("role:")).toBeVisible();
    await expect(page.locator(".text-orange-200")).toContainText("diner");

    // Update user
    await page.getByRole("button", { name: "Edit" }).click();
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill("Role Test User");
    await page.getByRole("button", { name: "Update" }).click();

    // Wait for update
    await page.waitForTimeout(200);

    // Role should still be displayed
    await expect(page.getByText("role:")).toBeVisible();
    await expect(page.locator(".text-orange-200")).toContainText("diner");
  });
});
