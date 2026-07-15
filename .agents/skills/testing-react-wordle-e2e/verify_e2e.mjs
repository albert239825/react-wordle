/*
 * End-to-end verification for react-wordle using the already-running Devin Chrome.
 *
 * Usage:
 *   1. Start the dev server:  BROWSER=none npm run start   (serves http://localhost:3000)
 *   2. Install the client:    npm install playwright-core   (in a scratch dir, e.g. /tmp)
 *   3. Run:                   node verify_e2e.mjs
 *
 * It connects to the existing Chrome over CDP (auto-discovering the debugging
 * port from the browser's DevToolsActivePort file), drives the Settings modal,
 * toggles a setting, plays a guess, and asserts state + localStorage + persistence.
 * Adapt the SETTING_* constants and assertions for the feature under test.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
// Resolve playwright-core from the current working directory (the scratch dir
// where you ran `npm install playwright-core`), not this script's location.
const require = createRequire(path.join(process.cwd(), 'noop.js'));
const { chromium } = require('playwright-core');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
// The setting to exercise: its label text and the localStorage key it persists to.
const SETTING_LABEL = process.env.SETTING_LABEL || 'Reduced Motion';
const SETTING_KEY = process.env.SETTING_KEY || 'reduced-motion';
const BODY_ATTR = process.env.BODY_ATTR || 'data-reduced-motion';

// Chrome runs with --remote-debugging-port=0 (random) in Devin's environment;
// read the real port from the user-data-dir. Falls back to CDP_URL if provided.
function cdpUrl() {
  if (process.env.CDP_URL) return process.env.CDP_URL;
  const candidates = [
    `${process.env.HOME}/.browser_data_dir/DevToolsActivePort`,
    `${process.env.HOME}/.config/google-chrome/DevToolsActivePort`,
  ];
  for (const f of candidates) {
    try {
      const port = fs.readFileSync(f, 'utf8').split('\n')[0].trim();
      if (port) return `http://127.0.0.1:${port}`;
    } catch {}
  }
  return 'http://127.0.0.1:29229';
}

async function closeModals(page) {
  for (let i = 0; i < 3; i++) {
    const btns = page.locator('[class*="modalContainer"] [class*="close"]');
    if ((await btns.count()) === 0) break;
    try {
      await btns.first().click({ timeout: 1000 });
    } catch {
      break;
    }
    await page.waitForTimeout(500);
  }
}

async function openSettings(page) {
  // Settings gear is the last button in the header.
  await page.locator('header button').last().click();
  await page.waitForTimeout(400);
}

function settingRow(page) {
  return page
    .getByText(SETTING_LABEL)
    .locator('xpath=ancestor::div[contains(@class,"row")]');
}

const assert = (cond, msg) => {
  if (!cond) throw new Error('ASSERT FAILED: ' + msg);
  console.log('ok - ' + msg);
};

(async () => {
  const browser = await chromium.connectOverCDP(cdpUrl());
  const ctx = browser.contexts()[0] || (await browser.newContext());
  const page = await ctx.newPage();
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // A welcome modal auto-opens on a fresh board; dismiss it.
  await closeModals(page);

  // 1) The toggle renders in Settings.
  await openSettings(page);
  await page.screenshot({ path: '/tmp/e2e_01_settings.png' });
  assert((await page.getByText(SETTING_LABEL).count()) === 1, `"${SETTING_LABEL}" row is present`);

  // 2) Toggling ON sets the body attribute and persists to localStorage.
  await settingRow(page).locator('label').click();
  await page.waitForTimeout(400);
  let attr = await page.evaluate((a) => document.body.getAttribute(a), BODY_ATTR);
  let ls = await page.evaluate((k) => localStorage.getItem(k), SETTING_KEY);
  assert(attr === 'true', `body[${BODY_ATTR}] is "true" after toggle ON (got ${attr})`);
  assert(ls === 'true', `localStorage["${SETTING_KEY}"] is "true" after toggle ON (got ${ls})`);
  await page.screenshot({ path: '/tmp/e2e_02_on.png' });

  // 3) Feature-specific behavior: reduced motion disables the reveal animation
  //    but keeps final cell colors. Play a valid guess and inspect a cell.
  await closeModals(page);
  await page.waitForTimeout(300);
  for (const ch of 'aback') {
    await page.keyboard.press(ch);
    await page.waitForTimeout(60);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await page.screenshot({ path: '/tmp/e2e_03_guess.png' });
  const cell = await page.evaluate(() => {
    const el = document.querySelector('[class*="Cell_reveal"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { animationName: cs.animationName, backgroundColor: cs.backgroundColor };
  });
  console.log('reveal cell:', JSON.stringify(cell));
  assert(cell && cell.animationName === 'none', 'reveal cell animation is disabled');
  assert(
    cell && cell.backgroundColor !== 'rgba(0, 0, 0, 0)',
    'reveal cell still has a status color'
  );

  // 4) Setting survives a page reload.
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  attr = await page.evaluate((a) => document.body.getAttribute(a), BODY_ATTR);
  ls = await page.evaluate((k) => localStorage.getItem(k), SETTING_KEY);
  assert(attr === 'true' && ls === 'true', 'setting persists across reload');

  // 5) Toggling OFF removes the attribute and updates localStorage.
  await closeModals(page);
  await openSettings(page);
  await settingRow(page).locator('label').click();
  await page.waitForTimeout(400);
  attr = await page.evaluate((a) => document.body.getAttribute(a), BODY_ATTR);
  ls = await page.evaluate((k) => localStorage.getItem(k), SETTING_KEY);
  assert(attr === null, `body[${BODY_ATTR}] cleared after toggle OFF (got ${attr})`);
  assert(ls === 'false', `localStorage["${SETTING_KEY}"] is "false" after toggle OFF (got ${ls})`);

  await page.close();
  await browser.close();
  console.log('\nALL CHECKS PASSED');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
