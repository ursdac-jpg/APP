const { test, expect } = require('@playwright/test');

test('ERIP démarre correctement', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/Site_V2/index.html');

  await page.waitForLoadState('networkidle');

  await expect(page).toHaveTitle(/.+/);

  await page.screenshot({
    path: 'rapport/accueil-erip.png',
    fullPage: true
  });
});