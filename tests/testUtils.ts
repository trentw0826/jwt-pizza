import { expect, Page } from "@playwright/test";
import { Role, User, Franchise } from "../src/service/pizzaService";

// ============== Test User Fixtures ==============

export const testUsers = {
  admin: {
    id: "1",
    name: "Admin User",
    email: "admin@jwt.com",
    password: "admin123",
    roles: [{ role: Role.Admin }],
  } as User,

  franchisee: {
    id: "2",
    name: "Franchise Owner",
    email: "franchisee@jwt.com",
    password: "franchise123",
    roles: [{ role: Role.Franchisee }],
  } as User,

  diner: {
    id: "3",
    name: "Kai Chen",
    email: "d@jwt.com",
    password: "a",
    roles: [{ role: Role.Diner }],
  } as User,
};

// ============== Mock Data ==============

export const mockMenu = [
  {
    id: 1,
    title: "Veggie",
    image: "pizza1.png",
    price: 0.0038,
    description: "A garden of delight",
  },
  {
    id: 2,
    title: "Pepperoni",
    image: "pizza2.png",
    price: 0.0042,
    description: "Spicy treat",
  },
];

export const mockFranchises = [
  {
    id: 1,
    name: "PizzaLand",
    admins: [
      {
        id: 2,
        name: "Franchise Owner",
        email: "franchisee@jwt.com",
      },
    ],
    stores: [
      { id: 1, name: "Provo", totalRevenue: 1250.5 },
      { id: 2, name: "Orem", totalRevenue: 987.25 },
    ],
  },
  {
    id: 2,
    name: "SliceMaster",
    admins: [
      {
        id: 4,
        name: "Another Franchisee",
        email: "other@jwt.com",
      },
    ],
    stores: [{ id: 3, name: "Salt Lake", totalRevenue: 2100.75 }],
  },
  {
    id: 3,
    name: "LotaPizza",
    stores: [
      { id: 4, name: "Lehi" },
      { id: 5, name: "Springville" },
      { id: 6, name: "American Fork" },
    ],
  },
  {
    id: 4,
    name: "PizzaCorp",
    stores: [{ id: 7, name: "Spanish Fork" }],
  },
  { id: 5, name: "topSpot", stores: [] },
];

export const mockOrders = [
  {
    id: 1,
    franchiseId: 1,
    storeId: 1,
    date: new Date("2024-06-05T05:14:40.000Z"),
    items: [
      {
        id: 1,
        menuId: 1,
        description: "Veggie",
        price: 0.0038,
      },
      {
        id: 2,
        menuId: 2,
        description: "Pepperoni",
        price: 0.0042,
      },
    ],
  },
  {
    id: 2,
    franchiseId: 1,
    storeId: 2,
    date: new Date("2024-06-10T12:30:00.000Z"),
    items: [
      {
        id: 3,
        menuId: 1,
        description: "Veggie",
        price: 0.0038,
      },
    ],
  },
];

// ============== Route Setup Functions ==============

/**
 * Setup authentication routes for login/logout
 * @param page Playwright page
 * @param validUsers Array of users that can log in (defaults to all test users)
 */
export async function setupAuthRoutes(
  page: Page,
  validUsers: User[] = Object.values(testUsers),
) {
  await page.route("*/**/api/auth", async (route) => {
    const method = route.request().method();

    if (method === "PUT") {
      // Login
      const loginReq = route.request().postDataJSON();
      const user = validUsers.find(
        (u) => u.email === loginReq.email && u.password === loginReq.password,
      );

      if (!user) {
        await route.fulfill({
          status: 401,
          json: { error: "Unauthorized" },
        });
        return;
      }

      await route.fulfill({
        json: {
          user: { ...user, password: undefined },
          token: "test-token-" + user.id,
        },
      });
    } else if (method === "POST") {
      // Register
      const registerReq = route.request().postDataJSON();
      const newUser = {
        id: "999",
        name: registerReq.name,
        email: registerReq.email,
        roles: [{ role: Role.Diner }],
      };
      await route.fulfill({
        json: {
          user: newUser,
          token: "test-token-999",
        },
      });
    } else if (method === "DELETE") {
      // Logout
      await route.fulfill({ json: { message: "logout successful" } });
    }
  });
}

/**
 * Setup route to return the currently logged in user
 * @param page Playwright page
 * @param loggedInUser The user to return (or null if not logged in)
 */
export async function setupUserMeRoute(
  page: Page,
  loggedInUser: User | null = null,
) {
  await page.route("*/**/api/user/me", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: loggedInUser });
  });
}

/**
 * Setup menu route
 * @param page Playwright page
 * @param menu Menu items to return (defaults to mockMenu)
 */
export async function setupMenuRoute(page: Page, menu = mockMenu) {
  await page.route("*/**/api/order/menu", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menu });
  });
}

/**
 * Setup franchise list route with optional filtering and pagination
 * @param page Playwright page
 * @param franchises Franchises to return (defaults to mockFranchises)
 * @param hasMore Whether there are more franchises to paginate
 */
export async function setupFranchiseListRoute(
  page: Page,
  franchises = mockFranchises,
  hasMore = false,
) {
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    expect(route.request().method()).toBe("GET");
    const url = new URL(route.request().url());
    const name = url.searchParams.get("name") || "*";

    let filtered = franchises;
    if (name !== "*") {
      const searchTerm = name.replace(/\*/g, "");
      filtered = franchises.filter((f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    await route.fulfill({
      json: {
        franchises: filtered,
        more: hasMore,
      },
    });
  });
}

/**
 * Setup route to return franchises for a specific user
 * @param page Playwright page
 * @param userId User ID to filter franchises by
 * @param franchises Franchises to filter from (defaults to mockFranchises)
 */
export async function setupUserFranchiseRoute(
  page: Page,
  userId: string,
  franchises = mockFranchises,
) {
  await page.route(`*/**/api/franchise/${userId}*`, async (route) => {
    expect(route.request().method()).toBe("GET");
    const userFranchises = franchises.filter((f) =>
      f.admins?.some((a) => a.id?.toString() === userId),
    );
    await route.fulfill({ json: userFranchises });
  });
}

/**
 * Setup route to create a franchise
 * @param page Playwright page
 */
export async function setupCreateFranchiseRoute(page: Page) {
  await page.route("*/**/api/franchise", async (route) => {
    if (route.request().method() === "POST") {
      const req = route.request().postDataJSON();
      const newFranchise = {
        id: 999,
        name: req.name,
        admins: req.admins.map((a: any, idx: number) => ({
          id: 100 + idx,
          name: `Franchisee ${idx}`,
          email: a.email,
        })),
        stores: [],
      };
      await route.fulfill({ json: newFranchise });
    }
  });
}

/**
 * Setup route to delete a franchise
 * @param page Playwright page
 */
export async function setupDeleteFranchiseRoute(page: Page) {
  await page.route("*/**/api/franchise/*", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ json: { message: "franchise deleted" } });
    }
  });
}

/**
 * Setup route to create a store
 * @param page Playwright page
 */
export async function setupCreateStoreRoute(page: Page) {
  await page.route("*/**/api/franchise/*/store", async (route) => {
    if (route.request().method() === "POST") {
      const req = route.request().postDataJSON();
      const newStore = {
        id: 888,
        name: req.name,
        totalRevenue: 0,
      };
      await route.fulfill({ json: newStore });
    }
  });
}

/**
 * Setup route to delete a store
 * @param page Playwright page
 */
export async function setupDeleteStoreRoute(page: Page) {
  await page.route("*/**/api/franchise/*/store/*", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ json: { message: "store deleted" } });
    }
  });
}

/**
 * Setup route to create an order (POST) or get order history (GET)
 * @param page Playwright page
 * @param orders Optional order history for GET requests
 */
export async function setupOrderRoute(page: Page, orders: any[] = []) {
  await page.route("*/**/api/order", async (route) => {
    const method = route.request().method();

    if (method === "POST") {
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: { ...orderReq, id: 23, date: new Date().toISOString() },
        jwt: "eyJpYXQiOjE3MDk3NjI0MTUsImV4cCI6MTcwOTg0ODgxNSwiaWF0IjoxNzA5NzYyNDE1LCJpc3MiOiJjczMyOSIsImFsZyI6IlJTMjU2In0.eyJ2ZW5kb3IiOnsiaWQiOiIxIiwibmFtZSI6IlBpenphIFBvY2tldCJ9LCJkaW5lciI6eyJpZCI6NCwibmFtZSI6Ik1hcmlvIiwic2VydmljZSI6ImZha2VTZXJ2aWNlIn0sIm9yZGVyIjp7Iml0ZW1zIjpbeyJtZW51SWQiOjEsImRlc2NyaXB0aW9uIjoiVmVnZ2llIiwicHJpY2UiOjAuMDA1fV0sInN0b3JlSWQiOiIxIiwiZnJhbmNoaXNlSWQiOjEsImlkIjoxfX0",
      };
      await route.fulfill({ json: orderRes });
    } else if (method === "GET") {
      await route.fulfill({
        json: {
          dinerId: 3,
          orders: orders,
          page: 1,
        },
      });
    }
  });
}

/**
 * Setup route to verify order JWT
 * @param page Playwright page
 * @param isValid Whether the JWT should be valid
 */
export async function setupVerifyOrderRoute(
  page: Page,
  isValid: boolean = true,
) {
  await page.route("*/**/api/order/verify", async (route) => {
    const method = route.request().method();
    if (method !== "POST") {
      await route.fallback();
      return;
    }

    if (isValid) {
      await route.fulfill({
        json: {
          message: "valid",
          payload: {
            vendor: { id: "1", name: "Pizza Pocket" },
            diner: { id: 3, name: "Kai Chen" },
            order: {
              items: [{ menuId: 1, description: "Veggie", price: 0.005 }],
              storeId: "1",
              franchiseId: 1,
              id: 23,
            },
          },
        },
      });
    } else {
      await route.fulfill({
        status: 400,
        json: {
          message: "invalid",
          payload: { error: "invalid JWT" },
        },
      });
    }
  });
}

// ============== Common Setup Functions ==============

/**
 * Setup all common routes needed for basic app functionality
 * @param page Playwright page
 * @param loggedInUser Currently logged in user (null if not logged in)
 * @param options Additional options for route setup
 */
export async function setupCommonRoutes(
  page: Page,
  loggedInUser: User | null = null,
  options: {
    menu?: any[];
    franchises?: any[];
    validUsers?: User[];
  } = {},
) {
  await setupAuthRoutes(page, options.validUsers);
  await setupUserMeRoute(page, loggedInUser);
  await setupMenuRoute(page, options.menu);
  await setupFranchiseListRoute(page, options.franchises);
}

// ============== User Action Helpers ==============

/**
 * Login as a specific user through the UI
 * @param page Playwright page
 * @param user User to login as
 */
export async function loginAs(page: Page, user: User) {
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").fill(user.email!);
  await page.getByPlaceholder("Password").fill(user.password!);
  await page.getByRole("button", { name: "Login" }).click();
}

/**
 * Register a new user through the UI
 * @param page Playwright page
 * @param name Full name of the user
 * @param email Email address
 * @param password Password
 */
export async function registerUser(
  page: Page,
  name: string,
  email: string,
  password: string,
) {
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByPlaceholder("Full name").fill(name);
  await page.getByPlaceholder("Email address").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Register" }).click();
}

/**
 * Logout the current user through the UI
 * @param page Playwright page
 */
export async function logoutUser(page: Page) {
  // Navigate to logout page
  await page.getByRole("link", { name: "Logout" }).click();
}

/**
 * Navigate to a specific franchise link (uses .first() to avoid footer link)
 * @param page Playwright page
 */
export async function navigateToFranchise(page: Page) {
  await page.getByRole("link", { name: "Franchise" }).first().click();
}

/**
 * Navigate to admin dashboard
 * @param page Playwright page
 */
export async function navigateToAdmin(page: Page) {
  await page.getByRole("link", { name: "Admin" }).click();
}
