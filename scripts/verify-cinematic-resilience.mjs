import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_URL || 'http://127.0.0.1:3001';
const out = path.resolve('scrollcraft/builds/cinematic-home/qa');
const report = { cases: [], measurements: {} };
const browser = await chromium.launch({ channel: 'chrome', headless: true, ignoreDefaultArgs: ['--use-angle=swiftshader-webgl'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const ready = () => page.waitForSelector('html[data-home-opening="complete"]');
const at = async (id, p) => {
  await page.evaluate(({ id, p }) => { const e = document.getElementById(id); scrollTo(0, e.getBoundingClientRect().top + scrollY + (e.offsetHeight - innerHeight) * p); }, { id, p });
  await page.waitForTimeout(700);
};
try {
  await page.addInitScript(() => {
    Element.prototype.requestPointerLock = () => {};
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    window.__qaShifts = [];
    new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.__qaShifts.push(e.value); })).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#scene-00[data-phase="solid"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, 'opening-filled-mark.png') });
  await ready();
  report.measurements.initialLayoutShift = await page.evaluate(() => window.__qaShifts.reduce((a, b) => a + b, 0));
  await at('scene-04', .25);
  const before = await page.evaluate(() => scrollY);
  await page.goto(base + '/robots.txt'); await page.goBack({ waitUntil: 'domcontentloaded' }); await ready(); await page.waitForTimeout(1000);
  const after = await page.evaluate(() => scrollY);
  report.measurements.backScrollDeltaPx = Math.abs(before - after);
  assert(Math.abs(before - after) < 120, 'Back should restore the existing chapter');
  report.cases.push('Browser Back restores chapter scroll');
  await at('scene-02', .45); await page.waitForSelector('[data-paper-ready="true"]');
  report.measurements.hardwareScroll = await page.evaluate(async () => {
    const canvas = document.querySelector('.wc-paper-stage canvas');
    const gl = canvas.getContext('webgl2'); const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'Unavailable';
    const frames = []; let previous = performance.now();
    for (let i = 0; i < 100; i++) await new Promise(resolve => requestAnimationFrame(time => { frames.push(time - previous); previous = time; scrollTo(0, scrollY + 10); resolve(); }));
    const sorted = frames.slice(12).sort((a, b) => a - b);
    return { renderer, medianMs: sorted[Math.floor(sorted.length / 2)], p95Ms: sorted[Math.floor(sorted.length * .95)], over50ms: sorted.filter(x => x > 50).length, samples: sorted.length };
  });
  await page.evaluate(() => document.querySelector('.wc-paper-stage canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.waitForSelector('#scene-02[data-paper-mode="static"]');
  assert(await page.locator('.wc-refined-falling__static-story').isVisible());
  report.cases.push('Live WebGL context loss recovers to readable static artwork');
  await page.screenshot({ path: path.join(out, 'webgl-context-loss.png') });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
  await page.reload({ waitUntil: 'domcontentloaded' }); await ready();
  assert(await page.evaluate(() => matchMedia('(prefers-reduced-transparency: reduce)').matches));
  assert.equal(await page.locator('.wc-liquid-header__lens').first().evaluate(e => getComputedStyle(e).display), 'none');
  report.cases.push('Reduced transparency uses an opaque navigation surface');
  await cdp.send('Emulation.setEmulatedMedia', { features: [] });
  for (const viewport of [{width:320,height:568},{width:768,height:1024},{width:1920,height:1080}]) {
    await page.setViewportSize(viewport); await page.reload({waitUntil:'domcontentloaded'}); await ready();
    await at('scene-02', .4);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: path.join(out, `responsive-${viewport.width}.png`) });
  }
  report.cases.push('320px, 768px and 1920px resize and overflow checks');
  const slow = await browser.newPage();
  await slow.addInitScript(() => {
    Element.prototype.requestPointerLock = () => {};
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = function () { return this.src.includes('hero4') ? new Promise(() => {}) : decode.call(this); };
  });
  await slow.goto(base, {waitUntil:'domcontentloaded'});
  await slow.waitForSelector('html[data-home-opening="pending"]'); const started = Date.now();
  await slow.waitForFunction(() => document.documentElement.dataset.homeOpening === 'complete', {timeout:5000});
  report.measurements.unavailableEnhancementRevealMs = Date.now() - started;
  assert(report.measurements.unavailableEnhancementRevealMs < 4400);
  assert(await slow.locator('.wc-coastal-hero__art img').evaluate(e => e.naturalWidth > 0));
  await slow.keyboard.press('Tab'); await slow.keyboard.press('Enter');
  assert.equal(await slow.evaluate(() => document.activeElement?.id), 'main-content');
  report.cases.push('Four-second opening deadline retains hero; keyboard skip reaches main');
  await slow.close();
} catch (error) { report.failure = error.stack; await page.screenshot({path:path.join(out,'resilience-failure.png')}).catch(()=>{}); process.exitCode = 1; }
finally { fs.writeFileSync(path.join(out, 'resilience-report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); await browser.close(); }
