import { expect, test } from '@playwright/test';

test('partner bonus unlock, rewind removal and replay', async ({page}) => {
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/padel');
  const match = page.locator('.padel-match');
  await expect(match).toHaveAttribute('data-ready', 'true', {timeout: 20000});
  await expect(match.locator('.bug')).toContainText('Ferreira / You');
  for (let beat = 0; beat < 16; beat++) {
    await expect(match).toHaveAttribute('data-beat', String(beat));
    const choice = page.locator('dialog[open] [data-shot]');
    if (await choice.count()) await choice.first().click();
    else await page.locator('[data-match="next"]').click();
  }
  await expect(match).toHaveAttribute('data-tie-break', 'true');
  await expect(match.locator('.l3 h2')).toHaveText('Secret tie-break unlocked');
  await expect(match.locator('[data-match=ptsA]')).toHaveText('4');
  await expect(match.locator('[data-match=ptsB]')).toHaveText('0');
  await expect(match.locator('.progress i:not([hidden])')).toHaveCount(5);
  await page.locator('[data-match="back"]').click();
  await expect(match).toHaveAttribute('data-beat', '15');
  await page.locator('[data-shot="vibora"]').click();
  await expect(match).toHaveAttribute('data-tie-break', 'false');
  await expect(match.locator('.progress i:not([hidden])')).toHaveCount(4);
  await expect(match.locator('.l3 h2')).toHaveText('Thanks for playing');
  await expect(match.locator('[data-match="ptsA"]')).toHaveText('3');
  await expect(match.locator('[data-match="ptsB"]')).toHaveText('1');
  await expect(match.locator('[data-match=card]')).toContainText('We won 3–1.');
  await expect(match.getByRole('button', {name: 'Download scorecard'})).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  await page.getByRole('button', {name: 'Play again'}).click();
  await expect(match).toHaveAttribute('data-beat', '0');
  await expect(match).toHaveAttribute('data-tie-break', 'false');
});

test('scene follows explicit and system themes while captions are static', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce', colorScheme: 'light'});
  await page.goto('/padel');
  const match = page.locator('.padel-match');
  await expect(match).toHaveAttribute('data-ready', 'true', {timeout: 20000});
  await expect(match).toHaveAttribute('data-scene-time', 'day');
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  await expect(match).toHaveAttribute('data-scene-time', 'night');
  await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  await expect(match).toHaveAttribute('data-scene-time', 'day');
  await page.evaluate(() => { delete document.documentElement.dataset.theme; });
  await page.emulateMedia({colorScheme: 'dark'});
  await expect(match).toHaveAttribute('data-scene-time', 'night');
});

test('bonus ends with numeric score and partner result', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/padel');
  const match = page.locator('.padel-match');
  await expect(match).toHaveAttribute('data-ready','true');
  for (let beat = 0; beat < 25; beat++) {
    await expect(match).toHaveAttribute('data-beat',String(beat));
    if (beat === 24) await expect(page.locator('dialog[open]')).toContainText('The crowd is on its feet');
    const choices = page.locator('dialog[open] [data-shot]');
    if (await choices.count()) await choices.first().click();
    else await page.locator('[data-match=next]').click();
  }
  await expect(match.locator('[data-match=ptsA]')).toHaveText('5');
  await expect(match.locator('[data-match=card]')).toContainText('We won 5–0.');
  await expect(match.locator('[data-match=callout]')).not.toContainText('Game');
});

test('losing the tie-break finish keeps the bonus and scores it to the opponents', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/padel');
  const match = page.locator('.padel-match');
  await expect(match).toHaveAttribute('data-ready', 'true');
  for (let beat = 0; beat < 24; beat++) {
    await expect(match).toHaveAttribute('data-beat', String(beat));
    const choices = page.locator('dialog[open] [data-shot]');
    if (await choices.count()) await choices.first().click();
    else await page.locator('[data-match=next]').click();
  }
  await expect(match).toHaveAttribute('data-beat', '24');
  await page.locator('dialog[open] [data-shot="flat"]').click();
  await expect(match).toHaveAttribute('data-tie-break', 'true');
  await expect(match.locator('[data-match=card]')).toContainText('We won 4–1.');
  await page.locator('[data-match=back]').click();
  await page.locator('dialog[open] [data-shot="smash"]').click();
  await expect(match.locator('[data-match=card]')).toContainText('We won 5–0.');
});
