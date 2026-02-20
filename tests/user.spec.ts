import { test, expect } from "playwright-test-coverage";
import { setupCommonRoutes, registerUser } from "./testUtils";

test("updateUser", async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

  await setupCommonRoutes(page);

  await page.goto("/");
  await registerUser(page, "pizza diner", email, "diner");
  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza diner");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("dialog")).toContainText("Edit user");

  await page.getByRole("button", { name: "Update" }).click();
  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });
  await expect(page.getByRole("main")).toContainText("pizza diner");
});
