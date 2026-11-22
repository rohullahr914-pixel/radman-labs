import { test, expect } from "@playwright/test";
test("homepage, catalog, founder and contact links work", async ({ page }) => {
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Engineering ideas",
  );
  await page.getByRole("link", { name: "Explore products" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Software with purpose.",
  );
  await page.getByLabel("Search applications").fill("no-such-product");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByText("No applications match")).toBeVisible();
  await page.goto("/about");
  await expect(
    page.getByText("Rohullah Radman — Founder & Software Engineer"),
  ).toBeVisible();
  await page.goto("/contact");
  await expect(
    page.getByRole("link", { name: /Start a conversation/ }),
  ).toHaveAttribute("href", "https://wa.me/93707763729");
});
test("preview product details and mobile widths", async ({ page }) => {
  await page.goto("/products/hesabko");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "HesabKo",
  );
  await expect(
    page.getByRole("heading", { name: "Features", exact: true }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
test("admin is inaccessible without configuration/session", async ({
  page,
  request,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  const response = await request.post("/api/admin/upload");
  expect(response.ok()).toBe(false);
  const sameOriginResponse = await request.post("/api/admin/upload", {
    headers: { origin: "http://localhost:3000" },
  });
  expect(sameOriginResponse.ok()).toBe(false);
  expect(await sameOriginResponse.json()).toHaveProperty("error");
  await page.goto("/admin/products/new");
  await expect(page).toHaveURL(/\/admin\/login/);
});
test("SEO endpoints and custom 404 are available", async ({
  page,
  request,
}) => {
  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  expect((await request.get("/opengraph-image")).ok()).toBe(true);
  expect((await request.get("/products/hesabko/opengraph-image")).ok()).toBe(
    true,
  );
  const response = await page.goto("/not-a-real-route");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "A little off course." }),
  ).toBeVisible();
});
