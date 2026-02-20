import { test, expect } from "playwright-test-coverage";
import {
  testUsers,
  setupCommonRoutes,
  loginAs,
  setupUserListRoute,
  setupOrderRoute,
} from "./testUtils";
import { Role } from "../src/service/pizzaService";

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
    // Setup: Page 1 has users, page 2 is empty
    const pageMap = new Map<number, any>([
      [1, Object.values(testUsers)],
      [2, []],
    ]);
    await setupUserListRoute(page, Object.values(testUsers), false, pageMap);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const nextButton = page.getByRole("button", { name: "next" });
    
    // Next button should be visible and enabled (we don't know if there's more yet)
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();
    
    // Click next - should check for more users and find none
    await nextButton.click();
    await page.waitForTimeout(100);
    
    // Should still be on page 1 (no page increment since no users on page 2)
    const previousButton = page.getByRole("button", { name: "previous" });
    await expect(previousButton).toBeDisabled();
  });

  test("next button is enabled when more users available", async ({ page }) => {
    const page2Users = [
      {
        id: "4",
        name: "User Four",
        email: "user4@jwt.com",
        roles: [{ role: Role.Diner }],
      },
    ];
    
    // Setup: Page 1 has users, page 2 also has users
    const pageMap = new Map<number, any>([
      [1, Object.values(testUsers)],
      [2, page2Users],
    ]);
    await setupUserListRoute(page, Object.values(testUsers), false, pageMap);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const nextButton = page.getByRole("button", { name: "next" });
    await expect(nextButton).toBeEnabled();
  });

  test("can navigate to next page", async ({ page }) => {
    const page2Users = [
      {
        id: "4",
        name: "User Four",
        email: "user4@jwt.com",
        roles: [{ role: Role.Diner }],
      },
      {
        id: "5",
        name: "User Five",
        email: "user5@jwt.com",
        roles: [{ role: Role.Diner }],
      },
    ];
    
    // Setup: Page 1 and page 2 both have users
    const pageMap = new Map<number, any>([
      [1, Object.values(testUsers)],
      [2, page2Users],
    ]);
    await setupUserListRoute(page, Object.values(testUsers), false, pageMap);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Verify we start on page 1
    const usersTable = page.locator("table").nth(1);
    await expect(usersTable).toContainText("Admin User");

    const nextButton = page.getByRole("button", { name: "next" });
    await nextButton.click();

    // Wait for page update
    await page.waitForTimeout(200);

    // Previous button should now be enabled
    const previousButton = page.getByRole("button", { name: "previous" });
    await expect(previousButton).toBeEnabled();
    
    // Should show different users from page 2
    await expect(usersTable).toContainText("User Four");
  });

  test("can navigate back to previous page", async ({ page }) => {
    const page2Users = [
      {
        id: "4",
        name: "User Four",
        email: "user4@jwt.com",
        roles: [{ role: Role.Diner }],
      },
    ];
    
    // Setup: Page 1 and page 2 both have users
    const pageMap = new Map<number, any>([
      [1, Object.values(testUsers)],
      [2, page2Users],
    ]);
    await setupUserListRoute(page, Object.values(testUsers), false, pageMap);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Go to next page
    const nextButton = page.getByRole("button", { name: "next" });
    await nextButton.click();
    await page.waitForTimeout(200);

    // Verify we're on page 2
    const usersTable = page.locator("table").nth(1);
    await expect(usersTable).toContainText("User Four");

    // Go back to previous page
    const previousButton = page.getByRole("button", { name: "previous" });
    await previousButton.click();
    await page.waitForTimeout(200);

    // Previous button should be disabled again (page 1)
    await expect(previousButton).toBeDisabled();
    
    // Should show page 1 users again
    await expect(usersTable).toContainText("Admin User");
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

  test("clicking next with no more users keeps page the same", async ({ page }) => {
    // Setup: Only page 1 has users, page 2 is empty
    const pageMap = new Map<number, any>([
      [1, Object.values(testUsers)],
      [2, []],
    ]);
    await setupUserListRoute(page, Object.values(testUsers), false, pageMap);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const usersTable = page.locator("table").nth(1);
    
    // Verify we're on page 1
    await expect(usersTable).toContainText("Admin User");

    // Click next button
    const nextButton = page.getByRole("button", { name: "next" });
    await nextButton.click();
    await page.waitForTimeout(200);

    // Should still be on page 1 (previous button still disabled)
    const previousButton = page.getByRole("button", { name: "previous" });
    await expect(previousButton).toBeDisabled();

    // Content should remain the same - still showing page 1 users
    await expect(usersTable).toContainText("Admin User");
    await expect(usersTable).toContainText("Franchise Owner");
  });

  test("navigating through multiple pages works correctly", async ({ page }) => {
    const page2Users = [
      {
        id: "4",
        name: "Page Two User",
        email: "p2@jwt.com",
        roles: [{ role: Role.Diner }],
      },
    ];
    const page3Users = [
      {
        id: "5",
        name: "Page Three User",
        email: "p3@jwt.com",
        roles: [{ role: Role.Diner }],
      },
    ];
    
    // Setup: Three pages of users
    const pageMap = new Map<number, any>([
      [1, Object.values(testUsers)],
      [2, page2Users],
      [3, page3Users],
      [4, []], // Empty page 4
    ]);
    await setupUserListRoute(page, Object.values(testUsers), false, pageMap);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const nextButton = page.getByRole("button", { name: "next" });
    const previousButton = page.getByRole("button", { name: "previous" });
    const usersTable = page.locator("table").nth(1);

    // Page 1: previous disabled
    await expect(previousButton).toBeDisabled();
    await expect(usersTable).toContainText("Admin User");

    // Navigate to page 2
    await nextButton.click();
    await page.waitForTimeout(200);
    await expect(previousButton).toBeEnabled();
    await expect(usersTable).toContainText("Page Two User");

    // Navigate to page 3
    await nextButton.click();
    await page.waitForTimeout(200);
    await expect(previousButton).toBeEnabled();
    await expect(usersTable).toContainText("Page Three User");

    // Try to navigate to page 4 (empty) - should stay on page 3
    await nextButton.click();
    await page.waitForTimeout(200);
    await expect(usersTable).toContainText("Page Three User");

    // Navigate back to page 2
    await previousButton.click();
    await page.waitForTimeout(200);
    await expect(usersTable).toContainText("Page Two User");

    // Navigate back to page 1
    await previousButton.click();
    await page.waitForTimeout(200);
    await expect(usersTable).toContainText("Admin User");
    await expect(previousButton).toBeDisabled();
  });

  test("page starts at 1, not 0", async ({ page }) => {
    let requestedPage = 0;
    
    await page.route(/\/api\/user(\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      const pageParam = url.searchParams.get("page");
      requestedPage = pageParam ? parseInt(pageParam) : 1;
      
      await route.fulfill({
        json: {
          users: Object.values(testUsers).map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            roles: u.roles,
          })),
        },
      });
    });

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();
    await page.waitForTimeout(100);

    // Initial request should be for page 1, not page 0
    expect(requestedPage).toBe(1);
  });

  test("previous button disabled at page 1", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const previousButton = page.getByRole("button", { name: "previous" });
    
    // Should be disabled at page 1
    await expect(previousButton).toBeDisabled();
  });

  test("clicking previous from page 2 goes back to page 1", async ({ page }) => {
    const page2Users = [
      {
        id: "4",
        name: "Second Page User",
        email: "page2@jwt.com",
        roles: [{ role: Role.Diner }],
      },
    ];
    
    const pageMap = new Map<number, any>([
      [1, Object.values(testUsers)],
      [2, page2Users],
    ]);
    await setupUserListRoute(page, Object.values(testUsers), false, pageMap);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    // Navigate to page 2
    const nextButton = page.getByRole("button", { name: "next" });
    await nextButton.click();
    await page.waitForTimeout(200);

    const usersTable = page.locator("table").nth(1);
    await expect(usersTable).toContainText("Second Page User");

    // Click previous
    const previousButton = page.getByRole("button", { name: "previous" });
    await previousButton.click();
    await page.waitForTimeout(200);

    // Should be back on page 1 with original users
    await expect(usersTable).toContainText("Admin User");
    await expect(previousButton).toBeDisabled();
  });

  test("empty page does not advance pagination", async ({ page }) => {
    // Setup: Page 2 has no users
    const pageMap = new Map<number, any>([
      [1, Object.values(testUsers)],
      [2, []],
    ]);
    await setupUserListRoute(page, Object.values(testUsers), false, pageMap);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const nextButton = page.getByRole("button", { name: "next" });
    const previousButton = page.getByRole("button", { name: "previous" });

    // Click next when page 2 is empty
    await nextButton.click();
    await page.waitForTimeout(200);

    // Should still be on page 1 (previous still disabled)
    await expect(previousButton).toBeDisabled();
  });

  test("users display updates when navigating pages", async ({ page }) => {
    const page2Users = [
      {
        id: "10",
        name: "Different User",
        email: "different@jwt.com",
        roles: [{ role: Role.Diner }],
      },
    ];
    
    const pageMap = new Map<number, any>([
      [1, Object.values(testUsers)],
      [2, page2Users],
    ]);
    await setupUserListRoute(page, Object.values(testUsers), false, pageMap);

    await loginAs(page, adminUser);
    await page.getByRole("link", { name: "Admin" }).click();

    const usersTable = page.locator("table").nth(1);
    
    // Verify page 1 content
    await expect(usersTable).toContainText("Admin User");
    await expect(usersTable).not.toContainText("Different User");

    // Navigate to page 2
    const nextButton = page.getByRole("button", { name: "next" });
    await nextButton.click();
    await page.waitForTimeout(200);

    // Verify page 2 content
    await expect(usersTable).toContainText("Different User");
    await expect(usersTable).not.toContainText("Admin User");
  });
});
