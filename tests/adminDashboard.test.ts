import { test, expect } from "playwright-test-coverage";
import {
  testUsers,
  setupCommonRoutes,
  loginAs,
  setupUserListRoute,
  setupOrderRoute,
} from "./testUtils";

const { admin: adminUser } = testUsers;

test.describe("Admin Dashboard - User List", () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonRoutes(page, null);
    await setupOrderRoute(page, []);
    await setupUserListRoute(page);
    await page.goto("/");
  });

  test("displays users table with user information", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Verify we're on admin dashboard
    await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");

    // Verify Users section is visible
    await expect(page.getByText("Users", { exact: true })).toBeVisible();

    // Verify table headers
    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Email" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Role" }),
    ).toBeVisible();

    // Get the users table specifically (second table on page)
    const usersTable = page.locator("table").nth(1);

    // Verify users are displayed
    await expect(usersTable).toContainText(adminUser.name!);
    await expect(usersTable).toContainText(adminUser.email!);
  });

  test("displays all test users in the table", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Get the users table specifically (second table on page)
    const usersTable = page.locator("table").nth(1);

    // Verify test users appear
    await expect(usersTable).toContainText("Admin User");
    await expect(usersTable).toContainText("Franchise Owner");
    await expect(usersTable).toContainText("Kai Chen");
  });

  test("displays user roles correctly", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Get the users table specifically (second table on page)
    const usersTable = page.locator("table").nth(1);

    // Verify roles are displayed
    await expect(usersTable).toContainText("admin");
    await expect(usersTable).toContainText("franchisee");
    await expect(usersTable).toContainText("diner");
  });

  test("has pagination controls", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Verify pagination buttons exist
    const previousButton = page.getByRole("button", { name: "previous" });
    const nextButton = page.getByRole("button", { name: "next" });

    await expect(previousButton).toBeVisible();
    await expect(nextButton).toBeVisible();

    // Previous should be disabled on first page
    await expect(previousButton).toBeDisabled();
  });

  test("next button is disabled when no more users", async ({ page }) => {
    await setupUserListRoute(page, Object.values(testUsers), false);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const nextButton = page.getByRole("button", { name: "next" });
    await expect(nextButton).toBeDisabled();
  });

  test("next button is enabled when more users available", async ({ page }) => {
    await setupUserListRoute(page, Object.values(testUsers), true);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const nextButton = page.getByRole("button", { name: "next" });
    await expect(nextButton).toBeEnabled();
  });

  test("can navigate to next page", async ({ page }) => {
    await setupUserListRoute(page, Object.values(testUsers), true);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const nextButton = page.getByRole("button", { name: "next" });
    await nextButton.click();

    // Wait for navigation
    await page.waitForTimeout(100);

    // Previous button should now be enabled
    const previousButton = page.getByRole("button", { name: "previous" });
    await expect(previousButton).toBeEnabled();
  });

  test("can navigate back to previous page", async ({ page }) => {
    await setupUserListRoute(page, Object.values(testUsers), true);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Go to next page
    const nextButton = page.getByRole("button", { name: "next" });
    await nextButton.click();
    await page.waitForTimeout(100);

    // Go back to previous page
    const previousButton = page.getByRole("button", { name: "previous" });
    await previousButton.click();
    await page.waitForTimeout(100);

    // Previous button should be disabled again
    await expect(previousButton).toBeDisabled();
  });

  test("has name filter input field", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Verify filter input exists with correct placeholder
    const filterInput = page.locator('input[name="filterUser"]');
    await expect(filterInput).toBeVisible();
    await expect(filterInput).toHaveAttribute("placeholder", "name");
  });

  test("can filter users by name", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Enter filter text
    const filterInput = page.locator('input[name="filterUser"]');
    await filterInput.fill("Admin");

    // Click submit button
    const submitButton = filterInput.locator("..").getByRole("button", {
      name: "Submit",
    });
    await submitButton.click();

    // Wait for filter to apply
    await page.waitForTimeout(200);

    // Users table should still be visible (filtered result would be mocked)
    const usersTable = page.locator("table").nth(1);
    await expect(usersTable).toBeVisible();
  });

  test("filter submit button is visible", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Find submit button near the filter input
    const filterInput = page.locator('input[name="filterUser"]');
    const submitButton = filterInput.locator("..").getByRole("button", {
      name: "Submit",
    });

    await expect(submitButton).toBeVisible();
  });

  test("users table appears below franchises table", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Both sections should be visible
    await expect(page.getByText("Franchises", { exact: true })).toBeVisible();
    await expect(page.getByText("Users", { exact: true })).toBeVisible();

    // Get positions to verify order
    const franchisesHeading = page.getByText("Franchises", { exact: true });
    const usersHeading = page.getByText("Users", { exact: true });

    const franchisesBox = await franchisesHeading.boundingBox();
    const usersBox = await usersHeading.boundingBox();

    // Users section should be below franchises section
    expect(usersBox?.y).toBeGreaterThan(franchisesBox?.y || 0);
  });
});
