import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = path.resolve('scrollcraft/builds/cinematic-home/qa');
const browser = await chromium.launch({ channel: 'chrome', headless: true, ignoreDefaultArgs: ['--use-angle=swiftshader-webgl'] });
try {
  for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, isMobile: name === 'mobile', hasTouch: name === 'mobile', recordVideo: { dir: path.join(out, 'recordings'), size: viewport } });
    await context.addInitScript(() => {
      Element.prototype.requestPointerLock = () => {};
      Element.prototype.setPointerCapture = () => {};
      Element.prototype.releasePointerCapture = () => {};
    });
    const page = await context.newPage();
    await page.goto(process.env.QA_URL || 'http://127.0.0.1:3001', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('html[data-home-opening="complete"]'); await page.waitForTimeout(1500);
    for (const id of ['scene-01-5', 'scene-02', 'scene-03', 'scene-04', 'scene-05', 'scene-06', 'scene-07']) {
      console.log('RECORD', name, id);
      await page.evaluate(async id => {
        const e = document.getElementById(id), start = scrollY, end = e.getBoundingClientRect().top + scrollY;
        const duration = Math.min(10500, Math.max(4200, (end - start) * 1.8));
        const origin = performance.now();
        await new Promise(resolve => { const tick = now => { const p = Math.min(1, (now - origin) / duration); scrollTo(0, start + (end - start) * p); if (p < 1) requestAnimationFrame(tick); else resolve(); }; requestAnimationFrame(tick); });
      }, id);
      await page.waitForTimeout(650);
    }
    await page.waitForTimeout(1800);
    const recording = await page.video().path(); await context.close();
    fs.copyFileSync(recording, path.join(out, `${name}-walkthrough.webm`));
  }
} finally { await browser.close(); }
