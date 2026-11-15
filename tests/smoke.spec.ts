import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", h1: /Hi, I.m Francisco/ },
  { path: "/projects/memoria", h1: "MEMORIA" },
  { path: "/projects/edufiable", h1: "Edufiable" },
];

for (const { path, h1 } of pages) {
  test(`${path} renders with one h1 and no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(h1);
    expect(errors).toEqual([]);
  });
}

test("theme toggle switches theme and persists after reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const html = page.locator("html");
  await page.getByTestId("theme-toggle").click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.getByTestId("theme-toggle").click();
  await expect(html).toHaveAttribute("data-theme", "light");
});

test("CV download is a PDF", async ({ request }) => {
  const response = await request.get("/cv.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});

test("every internal link resolves", async ({ page, request }) => {
  const seen = new Set<string>();
  for (const { path } of pages) {
    await page.goto(path);
    const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) {
      if (!href.startsWith("/")) continue;
      const target = href.split("#")[0] || "/";
      if (seen.has(target)) continue;
      seen.add(target);
      const res = await request.get(target);
      expect(res.status(), `${href} linked from ${path}`).toBe(200);
    }
  }
  expect(seen.size).toBeGreaterThan(2);
});

test("unknown routes show the 404 page", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText(/doesn.t exist/);
});

test("metadata files are served", async ({ request }) => {
  for (const path of ["/sitemap.xml", "/robots.txt", "/opengraph-image", "/projects/memoria/opengraph-image"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
});

test("the MEMORIA demo plays when scrolled to and widens the results as filters come off", async ({ page }) => {
  await page.goto("/");
  await page.locator("form[aria-label='MEMORIA demo']").scrollIntoViewIfNeeded();
  const found = page.locator("p", { hasText: /photos? across/ });
  await expect(page.getByText("I understood:")).toBeVisible({ timeout: 8000 });
  await expect(found).toContainText("2 photos", { timeout: 8000 });
  await expect(found).toContainText("4 photos", { timeout: 8000 });
  await page.getByRole("button", { name: "Pause" }).first().click();
  await expect(page.getByRole("button", { name: "Play demo" })).toBeVisible();
});

test("clicking a technology fades the projects that don't use it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Django", exact: true }).first().click();
  await expect(page.locator(".tech-bar")).toContainText("Django: used in 1 project");
  await expect(page.locator(".tech-scope.is-dim")).toHaveCount(3);
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.locator(".tech-scope.is-dim")).toHaveCount(0);
});

test("the import demo starts on the result, replays once in view, and stops", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Batch completed: 3 created, 1 updated/)).toBeAttached();
  await page.locator("ol[aria-label='Import steps']").scrollIntoViewIfNeeded();
  await expect(page.getByText(/the import is blocked/)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Batch completed: 3 created, 1 updated/)).toBeVisible({ timeout: 25000 });
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("demos don't play by themselves", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2500);
    await expect(page.locator("p", { hasText: /photos? across/ })).toContainText("2 photos");
    await expect(page.getByRole("button", { name: "Play demo" })).toBeVisible();
    await page.locator("ol[aria-label='Import steps']").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(page.getByText(/Batch completed/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  });
});

test("keyboard focus survives removing a filter and clearing a technology", async ({ page }) => {
  await page.goto("/");
  await page.locator("#demo-q").fill("padel with friends last summer");
  await page.locator("#demo-q").press("Enter");
  await page.getByRole("button", { name: "Remove With filter" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Remove \w+ filter/);

  const django = page.getByRole("button", { name: "Django", exact: true }).first();
  await django.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(django).toBeFocused();
});
