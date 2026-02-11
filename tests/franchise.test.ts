import { test, expect, Page } from "@playwright/test";
import {
  testUsers,
  setupCommonRoutes,
  setupFranchiseListRoute,
  setupUserFranchiseRoute,
  setupCreateFranchiseRoute,
  setupDeleteFranchiseRoute,
  setupCreateStoreRoute,
  setupDeleteStoreRoute,
  loginAs,
  navigateToFranchise,
  navigateToAdmin,
  mockFranchises,
} from "./testUtils";

// Destructure test users for easier access
const {
  admin: adminUser,
  franchisee: franchiseeUser,
  diner: dinerUser,
} = testUsers;

// ============== Admin Dashboard Tests ==============

test("admin can view franchise dashboard", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page);
  await page.goto("/");

  await loginAs(page, adminUser);

  // Navigate to admin dashboard
  await navigateToAdmin(page);

  // Verify page title
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");

  // Verify franchises table
  await expect(page.getByRole("heading", { level: 3 })).toContainText(
    "Franchises",
  );

  // Verify franchise data is displayed
  await expect(page.locator("table")).toContainText("PizzaLand");
  await expect(page.locator("table")).toContainText("SliceMaster");
  await expect(page.locator("table")).toContainText("Franchise Owner");

  // Verify stores are displayed
  await expect(page.locator("table")).toContainText("Provo");
  await expect(page.locator("table")).toContainText("Orem");
  await expect(page.locator("table")).toContainText("Salt Lake");

  // Verify revenue is displayed
  await expect(page.locator("table")).toContainText("1,250.5 ₿");
  await expect(page.locator("table")).toContainText("987.25 ₿");
  await expect(page.locator("table")).toContainText("2,100.75 ₿");
});

test("admin can filter franchises", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();

  // Enter filter text
  await page.getByPlaceholder("Filter franchises").fill("Pizza");
  await page.getByRole("button", { name: "Submit" }).nth(0).click();

  // Should still show filtered results
  await expect(page.locator("table")).toContainText("PizzaLand");
});

test("admin can paginate franchise list", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises, true);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();

  // Verify pagination buttons exist
  const prevButton = page.getByRole("button", { name: "«" });
  const nextButton = page.getByRole("button", { name: "»" });

  await expect(prevButton).toBeVisible();
  await expect(nextButton).toBeVisible();

  // Previous should be disabled on first page
  await expect(prevButton).toBeDisabled();

  // Next should be enabled when there are more
  await expect(nextButton).toBeEnabled();
});

test("admin can create a new franchise", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page);
  await setupCreateFranchiseRoute(page);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();

  // Click add franchise button
  await page.getByRole("button", { name: "Add Franchise" }).click();

  // Verify on create franchise page
  await expect(page.locator("h2")).toContainText("Create franchise");
  await expect(page.getByText("Want to create franchise?")).toBeVisible();

  // Fill in franchise details
  await page.getByPlaceholder("franchise name").fill("NewPizza");
  await page
    .getByPlaceholder("franchisee admin email")
    .fill("newowner@jwt.com");

  // Submit
  await page.getByRole("button", { name: "Create" }).click();

  // Should navigate back to dashboard
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
});

test("admin can navigate to close franchise", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();

  // Click close button for a franchise
  const closeButtons = page.getByRole("button", { name: /Close/ });
  await closeButtons.first().click();

  // Should be on close franchise page
  await expect(page.locator("h2")).toContainText("Sorry to see you go");
  await expect(page.getByText("Are you sure you want to close")).toBeVisible();
});

test("admin can confirm franchise deletion", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await setupDeleteFranchiseRoute(page);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();

  // Navigate to close franchise
  const closeButtons = page.getByRole("button", { name: /Close/ });
  await closeButtons.first().click();

  // Verify warning message
  await expect(
    page.getByText("All outstanding revenue will not be refunded"),
  ).toBeVisible();

  // Confirm deletion
  await page.getByRole("button", { name: "Close" }).click();

  // Should return to dashboard
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
});

test("admin can cancel franchise deletion", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();

  const closeButtons = page.getByRole("button", { name: /Close/ });
  await closeButtons.first().click();

  // Cancel deletion
  await page.getByRole("button", { name: "Cancel" }).click();

  // Should return to dashboard
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
});

test("admin can navigate to close store", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();

  // Find and click close button for a store (not franchise)
  // Stores are nested in the table, so we need the right close button
  const closeButtons = page.getByRole("button", { name: /Close/ });
  // Should have multiple close buttons (franchises + stores)
  await expect(closeButtons).toHaveCount(12); // 2 franchises + 3 stores

  // Click a store close button (after the first franchise close button)
  await closeButtons.nth(1).click();

  // Should be on close store page
  await expect(page.locator("h2")).toContainText("Sorry to see you go");
  await expect(
    page.getByText(/Are you sure you want to close the .* store/),
  ).toBeVisible();
});

test("admin can confirm store deletion", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await setupDeleteStoreRoute(page);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();

  const closeButtons = page.getByRole("button", { name: /Close/ });
  await closeButtons.nth(1).click();

  // Confirm deletion
  await page.getByRole("button", { name: "Close" }).click();

  // Should return to dashboard
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
});

test("non-admin cannot access admin dashboard", async ({ page }) => {
  await setupCommonRoutes(page, dinerUser);
  await setupFranchiseListRoute(page, mockFranchises);
  await page.goto("/");

  await loginAs(page, dinerUser);

  // Admin link should not be visible for non-admin
  await expect(page.getByRole("link", { name: "Admin" })).not.toBeVisible();
});

// ============== Franchisee Dashboard Tests ==============

test("franchisee can view their franchise dashboard", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await setupUserFranchiseRoute(page, franchiseeUser.id!);
  await page.goto("/");

  await loginAs(page, franchiseeUser);

  // Navigate to franchise dashboard
  await navigateToFranchise(page);

  // Verify franchise name is displayed
  await expect(page.getByRole("heading", { name: "PizzaLand" })).toBeVisible();

  // Verify description
  await expect(
    page.getByText("Everything you need to run an JWT Pizza franchise"),
  ).toBeVisible();

  // Verify stores table
  await expect(page.locator("table")).toContainText("Provo");
  await expect(page.locator("table")).toContainText("Orem");

  // Verify revenue
  await expect(page.locator("table")).toContainText("1,250.5 ₿");
  await expect(page.locator("table")).toContainText("987.25 ₿");

  // Verify create store button exists
  await expect(
    page.getByRole("button", { name: "Create store" }),
  ).toBeVisible();
});

test("franchisee can create a new store", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await setupUserFranchiseRoute(page, franchiseeUser.id!);
  await setupCreateStoreRoute(page);
  await page.goto("/");

  await loginAs(page, franchiseeUser);

  await page.getByRole("link", { name: "Franchise" }).first().click();

  // Click create store
  await page.getByRole("button", { name: "Create store" }).click();

  // Verify on create store page
  await expect(page.locator("h2")).toContainText("Create store");

  // Fill in store name
  await page.getByPlaceholder("store name").fill("Logan");

  // Submit
  await page.getByRole("button", { name: "Create" }).click();

  // Should return to franchise dashboard
  await expect(page.getByRole("heading", { name: "PizzaLand" })).toBeVisible();
});

test("franchisee can cancel store creation", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await setupUserFranchiseRoute(page, franchiseeUser.id!);
  await page.goto("/");

  await loginAs(page, franchiseeUser);

  await page.getByRole("link", { name: "Franchise" }).first().click();

  await page.getByRole("button", { name: "Create store" }).click();

  // Cancel
  await page.getByRole("button", { name: "Cancel" }).click();

  // Should return to franchise dashboard
  await expect(page.getByRole("heading", { name: "PizzaLand" })).toBeVisible();
});

test("franchisee can close a store", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await setupUserFranchiseRoute(page, franchiseeUser.id!);
  await setupDeleteStoreRoute(page);
  await page.goto("/");

  await loginAs(page, franchiseeUser);

  await page.getByRole("link", { name: "Franchise" }).first().click();

  // Click close button for a store
  const closeButtons = page.getByRole("button", { name: /Close/ });
  await closeButtons.first().click();

  // Should be on confirmation page
  await expect(page.locator("h2")).toContainText("Sorry to see you go");
  await expect(page.getByText(/PizzaLand/)).toBeVisible();

  // Confirm closure
  await page.getByRole("button", { name: "Close" }).click();

  // Should return to franchise dashboard
  await expect(page.getByRole("heading", { name: "PizzaLand" })).toBeVisible();
});

test("franchisee without franchise sees promotional content", async ({
  page,
}) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  // Setup route that returns empty array for this user
  await page.route(`*/**/api/franchise/${dinerUser.id}*`, async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.goto("/");

  await loginAs(page, dinerUser);

  // Navigate to franchise page
  await navigateToFranchise(page);

  // Should see promotional content
  await expect(
    page.getByRole("heading", { name: "So you want a piece of the pie?" }),
  ).toBeVisible();
  await expect(
    page.getByText("If you are already a franchisee, please"),
  ).toBeVisible();
  await expect(page.getByText("Call now")).toBeVisible();

  // Should see profit table
  await expect(page.locator("table")).toContainText("Year");
  await expect(page.locator("table")).toContainText("Profit");
  await expect(page.locator("table")).toContainText("2020");
  await expect(page.locator("table")).toContainText("50 ₿");
});

test("franchisee can navigate through full store lifecycle", async ({
  page,
}) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await setupUserFranchiseRoute(page, franchiseeUser.id!);
  await setupCreateStoreRoute(page);
  await setupDeleteStoreRoute(page);
  await page.goto("/");

  await loginAs(page, franchiseeUser);

  await page.getByRole("link", { name: "Franchise" }).first().click();

  // Create a store
  await page.getByRole("button", { name: "Create store" }).click();
  await page.getByPlaceholder("store name").fill("Ogden");
  await page.getByRole("button", { name: "Create" }).click();

  // Verify back on dashboard
  await expect(page.getByRole("heading", { name: "PizzaLand" })).toBeVisible();

  // Close a store
  const closeButtons = page.getByRole("button", { name: /Close/ });
  await closeButtons.first().click();
  await page.getByRole("button", { name: "Close" }).click();

  // Verify back on dashboard
  await expect(page.getByRole("heading", { name: "PizzaLand" })).toBeVisible();
});

test("admin can navigate through full franchise lifecycle", async ({
  page,
}) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await setupCreateFranchiseRoute(page);
  await setupDeleteFranchiseRoute(page);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();

  // Create a franchise
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByPlaceholder("franchise name").fill("TestFranchise");
  await page.getByPlaceholder("franchisee admin email").fill("test@jwt.com");
  await page.getByRole("button", { name: "Create" }).click();

  // Verify back on dashboard
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");

  // Delete a franchise
  const closeButtons = page.getByRole("button", { name: /Close/ });
  await closeButtons.first().click();
  await page.getByRole("button", { name: "Close" }).click();

  // Verify back on dashboard
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
});

test("create franchise form requires all fields", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await page.goto("/");

  await loginAs(page, adminUser);

  await page.getByRole("link", { name: "Admin" }).click();
  await page.getByRole("button", { name: "Add Franchise" }).click();

  // Try to submit without filling fields
  const createButton = page.getByRole("button", { name: "Create" });
  await createButton.click();

  // Should still be on create page (HTML5 validation prevents submission)
  await expect(page.locator("h2")).toContainText("Create franchise");
});

test("create store form requires store name", async ({ page }) => {
  await setupCommonRoutes(page, null);
  await setupFranchiseListRoute(page, mockFranchises);
  await setupUserFranchiseRoute(page, franchiseeUser.id!);
  await page.goto("/");

  await loginAs(page, franchiseeUser);

  await page.getByRole("link", { name: "Franchise" }).first().click();
  await page.getByRole("button", { name: "Create store" }).click();

  // Try to submit without filling store name
  const createButton = page.getByRole("button", { name: "Create" });
  await createButton.click();

  // Should still be on create store page
  await expect(page.locator("h2")).toContainText("Create store");
});
