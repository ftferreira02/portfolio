import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", h1: /web products end to end/i },
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
