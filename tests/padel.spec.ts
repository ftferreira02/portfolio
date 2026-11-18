import { expect, test, type Page } from "@playwright/test";

const matchSelector = ".padel-match";

async function advanceMatch(page: Page) {
  const choices = page.locator('[data-match="choice"]');
  if (await choices.isVisible()) await choices.locator("[data-shot]").first().click();
  else await page.locator('[data-match="next"]').click();
}

test("the padel route plays a shot, pauses for reading, and supports keyboard back", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/padel");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await expect(page.locator("h1")).toHaveText("The Portfolio Open");
  await expect(match.getByRole("button", { name: "Sound off" })).toHaveAttribute("aria-pressed", "false");
  await match.getByRole("button", { name: "Serve", exact: true }).click();
  await expect(match).toHaveAttribute("data-beat", "1", { timeout: 10000 });
  await expect(match.locator('[data-match="card"]')).toHaveCSS("opacity", "1", { timeout: 10000 });
  await expect(match.locator('[data-match="card"] h2')).toHaveText(/Software developer focused on full-stack web applications/);
  await match.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(match).toHaveAttribute("data-beat", "0", { timeout: 10000 });
  await expect(match.getByRole("button", { name: "Back", exact: true })).toBeDisabled({ timeout: 10000 });
  expect(errors).toEqual([]);
});

test("every caption is reachable with reduced motion, followed by contact and replay", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/padel");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await expect(match.getByRole("button", { name: "Auto", exact: true })).toBeDisabled();
  for (let beat = 1; beat <= 15; beat++) {
    await advanceMatch(page);
    await expect(match).toHaveAttribute("data-beat", String(beat));
    await expect(match.locator('[data-match="card"] h2')).toBeVisible();
  }
  await expect(match.getByRole("link", { name: "Email me", exact: true })).toHaveAttribute("href", /^mailto:/);
  await advanceMatch(page);
  await expect(match).toHaveAttribute("data-tie-break", "true");
  for (let beat = 17; beat <= 25; beat++) {
    await advanceMatch(page);
    await expect(match).toHaveAttribute("data-beat", String(beat));
  }
  await expect(match.locator('[data-match="card"] h2')).toHaveText("Thanks for playing");
  await expect(match.locator('[data-match="ptsA"]')).toHaveText("5");
  await match.getByRole("button", { name: "Play again" }).click();
  await expect(match).toHaveAttribute("data-beat", "0");
});

test("client navigation unmounts the court and a return visit starts a fresh match", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/padel");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await match.locator('[data-match="next"]').click();
  await expect(match).toHaveAttribute("data-beat", "1");
  const version = page.getByRole("group", { name: "Portfolio version" });
  await expect(version.getByRole("link", { name: "Match" })).toHaveAttribute("aria-current", "true");
  await version.getByRole("link", { name: "Portfolio" }).click();
  await expect(page).toHaveURL("/");
  // Leaving the match must leave its dark mode behind too.
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(248, 249, 251)");
  await page.getByRole("link", { name: /^Serve/ }).click();
  await expect(page).toHaveURL("/padel?serve=1");
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await expect(match).toHaveAttribute("data-beat", "0");
  expect(errors).toEqual([]);
});

test("narrow courts and all captions stay inside the viewport", async ({ page }) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/padel");
    await expect(page.locator(matchSelector)).toHaveAttribute("data-ready", "true", { timeout: 20000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (let beat = 1; beat <= 15; beat++) {
      await advanceMatch(page);
      await expect(page.locator(matchSelector)).toHaveAttribute("data-beat", String(beat));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test("WebGL failure keeps the full portfolio and CV available", async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    // Only WebGL is unavailable; text and regular canvas remain supported.
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes("webgl")) return null;
      return Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
  });
  await page.goto("/padel");
  await expect(page.getByText("The 3D court isn't available on this device.")).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("button", { name: "Serve", exact: true })).toBeDisabled();
  await expect(page.getByRole("banner").getByRole("link", { name: "CV" })).toHaveAttribute("href", "/cv.pdf");
  await page.getByRole("link", { name: "Visit the full portfolio" }).click();
  await expect(page).toHaveURL("/");
});

test("autoplay can be paused, Next advances a shot, and sound can be toggled", async ({ page }) => {
  test.setTimeout(45000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/padel");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await match.getByRole("button", { name: "Auto", exact: true }).click();
  await expect(match).toHaveAttribute("data-mode", "auto");
  await expect(match).toHaveAttribute("data-beat", "1", { timeout: 15000 });
  await match.getByRole("button", { name: "Click", exact: true }).click();
  await expect(match).toHaveAttribute("data-mode", "click");
  await expect(match.locator('[data-match="card"]')).toHaveCSS("opacity", "1", { timeout: 10000 });
  await match.locator('[data-match="next"]').click();
  await expect(match).toHaveAttribute("data-beat", "2", { timeout: 10000 });
  await match.getByRole("button", { name: "Back to match" }).click();
  await match.getByRole("button", { name: "Sound off", exact: true }).click();
  await expect(match.getByRole("button", { name: "Sound on", exact: true })).toHaveAttribute("aria-pressed", "true");
  await match.getByRole("button", { name: "Sound on", exact: true }).click();
  await expect(match.getByRole("button", { name: "Sound off", exact: true })).toHaveAttribute("aria-pressed", "false");
});

test("the full portfolio and CV are available without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto("/padel");
  await expect(page.locator("h1")).toHaveText("The Portfolio Open");
  const links = page.getByRole("banner");
  await expect(links.getByRole("link", { name: "Portfolio", exact: true })).toHaveAttribute("href", "/");
  await expect(links.getByRole("link", { name: "CV" })).toHaveAttribute("href", "/cv.pdf");
  await expect(page.locator(".padel-match")).toBeHidden();
  await expect(page.getByText("Read the story without the match")).toHaveCount(0);
  await context.close();
});

test("system reduced motion can be overridden for the match and remembered", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/padel");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await expect(match).toHaveAttribute("data-motion", "reduced");
  await match.locator(".match-settings summary").click();
  await match.getByRole("button", { name: "Enable match animation" }).click();
  await expect(match).toHaveAttribute("data-motion", "full");
  await expect(match.getByRole("button", { name: "Auto", exact: true })).toBeEnabled();
  await expect(match.getByRole("button", { name: "Scroll", exact: true })).toHaveCount(0);
  await match.getByRole("button", { name: "Serve", exact: true }).click();
  await expect(match).toHaveAttribute("data-beat", "1", { timeout: 10000 });
  await page.reload();
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await expect(match).toHaveAttribute("data-motion", "full");
  await match.getByRole("button", { name: "Auto", exact: true }).click();
  await match.locator(".match-settings summary").click();
  await match.getByRole("button", { name: "Disable match animation" }).click();
  await expect(match).toHaveAttribute("data-motion", "reduced");
  await expect(match).toHaveAttribute("data-mode", "click");
  await expect(match.getByRole("button", { name: "Auto", exact: true })).toBeDisabled();
  await page.reload();
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await expect(match).toHaveAttribute("data-motion", "reduced");
});

test("losing every choice still reveals every caption, contact, and a replay", async ({ page }) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/padel");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  const losingShots: Record<number, string> = { 2: "drive", 7: "smash", 12: "smash", 15: "vibora" };
  for (let beat = 0; beat < 16; beat++) {
    await expect(match).toHaveAttribute("data-beat", String(beat));
    await expect(match.locator('[data-match="card"] h2')).toBeVisible();
    if (losingShots[beat]) {
      await expect(match.locator('[data-match="next"]')).toHaveText("Choose your shot");
      await expect(match.locator(".l3-tag")).toHaveText("Choose your shot");
      await match.focus();
      await page.keyboard.press("ArrowRight");
      await expect(match).toHaveAttribute("data-beat", String(beat));
      await match.locator(`[data-shot="${losingShots[beat]}"]`).click();
    } else {
      await match.locator('[data-match="next"]').click();
    }
  }
  await expect(match).toHaveAttribute("data-beat", "16");
  await expect(match.locator('[data-match="ptsA"]')).toHaveText("0");
  await expect(match.locator('[data-match="ptsB"]')).toHaveText("4");
  await expect(match.locator('[data-match="card"]')).toContainText("We lost 0–4.");
  await expect(match.locator('[data-match="choice-feedback"]')).toContainText("Point opponents.");
  await expect(match.locator('[data-match="choice-feedback"]')).toContainText("Víbora wide.");
  await expect(match.getByRole("link", { name: "Email me", exact: true })).toHaveAttribute("href", /^mailto:/);
  await match.getByRole("button", { name: "Play again" }).click();
  await expect(match).toHaveAttribute("data-beat", "0");
  await expect(match.locator('[data-match="ptsA"]')).toHaveText("0");
  await expect(match.locator('[data-match="ptsB"]')).toHaveText("0");
  await advanceMatch(page);
  await advanceMatch(page);
  await expect(match).toHaveAttribute("data-pending-choice", "tools");
});

test("replaying a decision replaces its result without awarding the point twice", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/padel");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await advanceMatch(page);
  await advanceMatch(page);
  await match.locator('[data-shot="drive"]').click();
  await expect(match).toHaveAttribute("data-beat", "3");
  await expect(match.locator('[data-match="ptsB"]')).toHaveText("15");
  await match.getByRole("button", { name: "Back", exact: true }).click();
  await expect(match).toHaveAttribute("data-beat", "2");
  await match.locator('[data-shot="volley"]').click();
  await expect(match).toHaveAttribute("data-beat", "3");
  await expect(match.locator('[data-match="ptsA"]')).toHaveText("15");
  await expect(match.locator('[data-match="ptsB"]')).toHaveText("0");
  await expect(match.locator('[data-match="choice-feedback"]')).toContainText("Point Ferreira.");
});

test("Next and autoplay wait for a decision, then play the selected shot", async ({ page }) => {
  test.setTimeout(45000);
  await page.goto("/padel");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  const nextButton = match.locator('[data-match="next"]');
  await nextButton.click();
  await expect(match).toHaveAttribute("data-beat", "1", { timeout: 10000 });
  await nextButton.click();
  await expect(match).toHaveAttribute("data-pending-choice", "tools", { timeout: 10000 });
  await match.getByRole("button", { name: "Back to match" }).click();
  await match.getByRole("button", { name: "Auto", exact: true }).click();
  await expect(match.locator('[data-match="next"]')).toHaveText("Choose your shot");
  await page.waitForTimeout(1000);
  await expect(match).toHaveAttribute("data-beat", "2");
  await match.locator('[data-match="next"]').click();
  await match.locator('[data-shot="drive"]').click();
  await expect(match).toHaveAttribute("data-beat", "3", { timeout: 10000 });
  await expect(match.locator('[data-match="ptsB"]')).toHaveText("15", { timeout: 10000 });
});

test("the court, controls and shot choices stay in the viewport without scrolling", async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [[1536, 704], [1366, 768], [2000, 920], [390, 844], [320, 568], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/padel");
    const match = page.locator(matchSelector);
    await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
    const startingScroll = await page.evaluate(() => scrollY);
    async function checkFrame() {
      const boxes = await page.locator('.padel-match, [data-match="gl"], [data-match="next"], [data-match="sound"], .modes, .match-settings summary').evaluateAll((elements) => elements.map((element) => {
        const { top, bottom, left, right, height } = element.getBoundingClientRect();
        return { element: element.getAttribute("data-match") ?? element.className, top, bottom, left, right, height };
      }));
      for (const box of boxes) {
        expect(box.top, JSON.stringify({ viewportWidth: width, viewportHeight: height, ...box })).toBeGreaterThanOrEqual(64);
        expect(box.bottom, JSON.stringify({ viewportWidth: width, viewportHeight: height, ...box })).toBeLessThanOrEqual(height + 1);
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
        expect(box.height).toBeGreaterThan(0);
      }
      expect(await page.evaluate(() => scrollY)).toBe(startingScroll);
    }
    await checkFrame();
    // All four decisions, plus their results, must preserve the play area's size.
    for (let beat = 1; beat <= 16; beat++) {
      await advanceMatch(page);
      await expect(match).toHaveAttribute("data-beat", String(beat));
      await checkFrame();
      if ([2, 7, 12, 15].includes(beat)) {
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        for (const button of await dialog.locator("[data-shot]").all()) await expect(button).toBeInViewport({ ratio: 1 });
        const bounds = await dialog.boundingBox();
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height);
        expect(await dialog.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
      }
    }
  }
});

test("a choice can be dismissed to read the caption and reopened without scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/padel");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await advanceMatch(page);
  await advanceMatch(page);
  const initialScroll = await page.evaluate(() => scrollY);
  await page.getByRole("button", { name: "Back to match" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(match.locator('[data-match="card"] h2')).toHaveText("My day to day");
  await match.getByRole("button", { name: "Choose your shot" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await match.locator('[data-shot="volley"]').click();
  await expect(match).toHaveAttribute("data-beat", "3");
  expect(await page.evaluate(() => scrollY)).toBe(initialScroll);
});

test("Serve on the home page opens the match and plays the first serve", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("link", { name: /^Serve/ }).click();
  await expect(page).toHaveURL("/padel?serve=1");
  const match = page.locator(matchSelector);
  await expect(match).toHaveAttribute("data-ready", "true", { timeout: 20000 });
  await expect(match).toHaveAttribute("data-beat", "1", { timeout: 15000 });
  await expect(page.getByRole("contentinfo")).toBeHidden();
});
