import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const SCREENSHOT_DIR = './screenshots-journey';
mkdirSync(SCREENSHOT_DIR, { recursive: true });
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const BASE = 'https://localhost:5173';

async function screenshot(page, name) {
  await wait(500);
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`✅ ${name}`);
  return path;
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

  try {
    console.log('📸 Taking screenshots...');
    
    // 1. Dashboard
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 15000 });
    await wait(3000);
    await screenshot(page, '01-dashboard');

    // 2. Fuel Finder
    await page.goto(`${BASE}/fuel`, { waitUntil: 'networkidle0', timeout: 15000 });
    await wait(2000);
    await screenshot(page, '02-fuel-finder');

    // 3. Live Fuel Prices
    await page.goto(`${BASE}/live-fuel`, { waitUntil: 'networkidle0', timeout: 15000 });
    await wait(2000);
    await screenshot(page, '03-live-fuel');

    // 4. Navigation
    await page.goto(`${BASE}/navigation`, { waitUntil: 'networkidle0', timeout: 15000 });
    await wait(2000);
    await screenshot(page, '04-navigation');

    // 5. Road Alerts
    await page.goto(`${BASE}/alerts`, { waitUntil: 'networkidle0', timeout: 15000 });
    await wait(2000);
    await screenshot(page, '05-alerts');

    // 6. AI Co-Pilot
    await page.goto(`${BASE}/ai`, { waitUntil: 'networkidle0', timeout: 15000 });
    await wait(2000);
    await screenshot(page, '06-ai-copilot');

    // 7. Business Suite
    await page.goto(`${BASE}/business`, { waitUntil: 'networkidle0', timeout: 15000 });
    await wait(2000);
    await screenshot(page, '07-business');

    console.log('\n✅ All screenshots captured!');
  } catch (error) {
    console.error('Screenshot error:', error.message);
  } finally {
    await browser.close();
  }
}

main();
