import { test, expect } from "@playwright/test";
test("homepage, catalog, founder and contact links work", async ({ page }) => {
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Software built",
  );
  await page.getByRole("link", { name: "Explore Apps" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Find something useful.",
  );
  await page.getByLabel("Search applications").fill("no-such-product");
  await expect(page.getByText("No matching apps")).toBeVisible();
  await page.goto("/about");
  await expect(
    page.getByText("Rohullah Radman — Founder & Software Engineer"),
  ).toBeVisible();
  await page.goto("/contact");
  await expect(
    page.getByRole("link", { name: /Start a conversation/ }),
  ).toHaveAttribute("href", "https://wa.me/93707763729");
});
test("fixture product details and mobile widths", async ({ page }) => {
  await page.goto("/products/hesabko");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "HesabKo",
  );
  await expect(
    page.getByRole("heading", { name: "About this app", exact: true }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
test("gallery opens, supports arrows, closes with Escape and restores focus", async ({
  page,
}) => {
  await page.goto("/products/hesabko");
  const opener = page.getByRole("button", {
    name: "Open screenshot 1",
    exact: true,
  });
  await opener.click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal.getByText("1 / 2", { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(modal.getByText("2 / 2", { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(modal.getByText("1 / 2", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
  await expect(opener).toBeFocused();
});
test("filters combine instantly and preserve the URL", async ({ page }) => {
  await page.goto("/products");
  await page.getByLabel("Pricing", { exact: true }).selectOption("Paid");
  await expect(
    page.getByText("No matching apps", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/pricing=Paid/);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Platform", { exact: true }).selectOption("Android");
  await page
    .getByLabel("Category", { exact: true })
    .selectOption("Business Software");
  await page.getByLabel("Sort applications").selectOption("name");
  await expect(
    page.getByRole("heading", { name: "HesabKo — حساب کو", exact: true }),
  ).toBeVisible();
});
test("mobile navigation is operable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation test");
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Apps", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
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
    headers: { origin: "http://localhost:3107" },
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
