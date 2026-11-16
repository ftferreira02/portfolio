import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", h1: /Hi, I.m Francisco/ },
  { path: "/projects/memoria", h1: "MEMORIA" },
  { path: "/projects/edufiable", h1: "Edufiable" },
  { path: "/projects/quests", h1: "Quests@NEI" },
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
  // Scroll the whole demo card into view: it only starts once most of it is on screen.
  await page.locator("form[aria-label='MEMORIA demo']").locator("..").evaluate((el) => el.scrollIntoView({ block: "center" }));
  const found = page.locator("p", { hasText: /photos? across/ });
  await expect(page.getByText("I understood:")).toBeVisible({ timeout: 8000 });
  await expect(found).toContainText("2 photos", { timeout: 8000 });
  await expect(found).toContainText("4 photos", { timeout: 8000 });
  await page.getByRole("button", { name: "Pause" }).first().click();
  await expect(page.getByRole("button", { name: "Play demo" })).toBeVisible();
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

test("keyboard focus survives removing a filter", async ({ page }) => {
  await page.goto("/");
  await page.locator("#demo-q").fill("padel with friends last summer");
  await page.locator("#demo-q").press("Enter");
  await page.getByRole("button", { name: "Remove With filter" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Remove \w+ filter/);

});

for (const [path, count] of [["/projects/memoria", 4], ["/projects/edufiable", 3], ["/projects/quests", 3]] as const) {
  test(`${path}: every "On this page" link points at a heading`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const links = page.getByRole("navigation", { name: "On this page" }).getByRole("link");
    await expect(links).toHaveCount(count);
    for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute("href")))) {
      await expect(page.locator(`h2${href}`), href ?? "").toHaveCount(1);
    }
  });
}

for (const [path, count] of [["/projects/memoria", 4], ["/projects/edufiable", 1]] as const) {
  test(`${path}: diagrams switch layouts without horizontal overflow`, async ({ page }) => {
    for (const width of [412, 360, 640, 1440]) {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : width === 360 ? 800 : 915 });
      await page.goto(path);
      const panels = page.locator("figure").filter({ has: page.locator("svg[role='img']") });
      await expect(panels).toHaveCount(count);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const panel of await panels.all()) {
        expect(await panel.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.left >= 0 && bounds.right <= innerWidth &&
            [element, ...element.querySelectorAll("*")].every((child) =>
              !(child instanceof HTMLElement) || child.scrollWidth <= child.clientWidth);
        })).toBe(true);
        const phone = panel.locator("[data-diagram-phone]");
        const svg = panel.locator("svg[role='img']");
        if (width < 640) {
          await expect(phone).toBeVisible();
          await expect(svg).toBeHidden();
        } else {
          await expect(phone).toBeHidden();
          await expect(svg).toBeVisible();
        }
      }
    }
  });
}


test("mobile menu dismisses after selection, Escape, and clicking outside", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.locator("header details");
  const toggle = menu.locator("summary");
  await toggle.click();
  await menu.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(page).toHaveURL(/#work$/);
  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole("heading", { name: "MEMORIA", exact: true }).click({ position: { x: 2, y: 2 } });
  await expect(menu).not.toHaveAttribute("open", "");
});

test("mobile case-study contents navigates and dismisses", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/memoria");
  const contents = page.locator("article header details");
  await contents.locator("summary").click();
  await contents.getByRole("link", { name: "Results", exact: true }).click();
  await expect(contents).not.toHaveAttribute("open", "");
  await expect(page).toHaveURL(/#results$/);
  await expect(page.getByRole("heading", { name: "Results", exact: true })).toBeInViewport();
});

test("narrow home screens keep navigation inside the viewport", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (const scrolled of [false, true]) {
      if (scrolled) await page.locator("#work").scrollIntoViewIfNeeded();
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflowing: [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().right > innerWidth).slice(0, 12).map((el) => `${el.tagName}.${el.className}`),
      }));
      expect(layout.scrollWidth, JSON.stringify({ scrolled, ...layout })).toBeLessThanOrEqual(width);
      const navigation = page.getByRole("navigation", { name: "Main", exact: true });
      expect(await navigation.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.left >= 0 && bounds.right <= innerWidth;
      })).toBe(true);
    }
  }
});
