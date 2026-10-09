import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_URL || 'http://localhost:3000';
const out = path.resolve('scrollcraft/builds/cinematic-home/qa/studio-worlds');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const errors = [];
const cases = [];
async function open(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => {};
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('html[data-home-opening="complete"]', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  return { page, context };
}
async function at(page, id, progress = 0) {
  await page.evaluate(({ id, progress }) => {
    const e = document.getElementById(id);
    scrollTo(0, e.getBoundingClientRect().top + scrollY + Math.max(0, e.offsetHeight - innerHeight) * progress);
  }, { id, progress });
  await page.waitForTimeout(850);
}
async function shot(page, name) {
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow: ' + name);
}
async function pixelDifference(before, after) {
  const a = await sharp(before).removeAlpha().raw().toBuffer();
  const b = await sharp(after).removeAlpha().raw().toBuffer();
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference += Math.abs(a[i] - b[i]);
  return difference / a.length;
}
try {
  const { page, context } = await open();
  for (const p of [0, .3, .6, .9]) {
    await at(page, 'scene-05', p);
    await shot(page, `studio-${p}`);
  }
  // The orbit stage pins on the studio's final frame: the two must match.
  await at(page, 'scene-05', 1);
  const studioEnd = await page.screenshot();
  await page.evaluate(() => scrollBy(0, 2));
  await page.waitForTimeout(850);
  assert.equal(await page.locator('#scene-06').getAttribute('data-orbit-entered'), 'true');
  assert(await pixelDifference(studioEnd, await page.screenshot()) < 1.5, 'Studio hands over to the orbit without a seam');
  for (const p of [.1, .2]) {
    await at(page, 'scene-06', p);
    await shot(page, `arrival-${p}`);
  }
  await at(page, 'scene-06', .35);
  await page.waitForTimeout(4000);
  await shot(page, 'worlds-desktop');
  console.log('RENDERER', await page.locator('.wc-scene-orbit__system').getAttribute('data-orbit-renderer'));
  const cards = page.locator('.wc-destination-card');
  assert.equal(await cards.count(), 3);
  const links = await cards.locator('a').evaluateAll(nodes => nodes.map(n => ({ text: n.textContent, href: n.getAttribute('href') })));
  assert.equal(links[1].href, 'https://westcoselabs.com');
  assert.equal(links[2].href, 'https://shop.westcose.com');
  assert(!await page.locator('#scene-06').innerText().then(t => /external site/i.test(t)));
  const placements = await cards.evaluateAll(nodes => nodes.map(n => {
    const card = n.getBoundingClientRect(), button = n.querySelector('a').getBoundingClientRect();
    return { right: card.right - button.right, middle: Math.abs(card.y + card.height / 2 - button.y - button.height / 2), height: card.height };
  }));
  assert(placements.every(p => p.right > 8 && p.right < 24 && p.middle < 2), 'CTA sits right, vertically centred');
  assert(placements.every(p => p.height < 100), 'Compact cards');
  const tints = await cards.evaluateAll(nodes => nodes.map(n => getComputedStyle(n.querySelector('.wc-destination-card__title')).color));
  assert(tints[0] !== tints[1] && tints[1] !== tints[2], 'Labs and Shop titles carry their planet colour');
  const labsTitle = page.locator('.wc-destination-card__preview[data-orbit-world="labs"]');
  await labsTitle.hover();
  await page.waitForTimeout(500);
  const orbitBefore = await page.locator('.wc-scene-orbit__canvas-layer').screenshot();
  await page.waitForTimeout(1800);
  const orbitAfter = await page.locator('.wc-scene-orbit__canvas-layer').screenshot();
  assert(await pixelDifference(orbitBefore, orbitAfter) > 0.3, 'Orbit still moves during card hover');
  for (const id of ['designs', 'labs', 'shop']) {
    const title = page.locator(`.wc-destination-card__preview[data-orbit-world="${id}"]`);
    await title.hover();
    assert.equal(await page.locator('.wc-scene-orbit__system').getAttribute('data-orbit-hovered'), id);
    if (id === 'labs') await shot(page, 'labs-hover');
    await title.click();
    await page.getByRole('dialog').waitFor();
    await page.waitForTimeout(1000);
    await shot(page, `popup-${id}`);
    assert.equal(await page.locator('.wc-scene-orbit__system').getAttribute('data-orbit-active'), id);
    assert.equal(await page.locator('.wc-scene-orbit__inspector-cta').getAttribute('href'), links[['designs','labs','shop'].indexOf(id)].href);
    await page.keyboard.press('Shift+Tab');
    assert(await page.locator('.wc-scene-orbit__inspector-cta').evaluate(n => n === document.activeElement), 'Reverse focus trap');
    await page.keyboard.press('Tab');
    assert(await page.locator('.wc-scene-orbit__inspector-close').evaluate(n => n === document.activeElement), 'Forward focus trap');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert(await title.evaluate(n => n === document.activeElement), 'Focus restored');
  }
  // Use the rendered planet hit area, then exercise drag, zoom, reset and backdrop.
  await labsTitle.hover();
  const canvasBox = await page.locator('.wc-scene-orbit__canvas-layer').boundingBox();
  let hit = false;
  for (let y = canvasBox.y + canvasBox.height * .25; y < canvasBox.y + canvasBox.height * .85 && !hit; y += 35) {
    for (let x = canvasBox.x + canvasBox.width * .4; x < canvasBox.x + canvasBox.width * .97 && !hit; x += 35) {
      await page.mouse.move(x, y);
      if (await page.locator('.wc-scene-orbit__system').getAttribute('data-orbit-hovered') === 'labs') {
        await page.mouse.click(x, y);
        hit = await page.locator('.wc-scene-orbit__system').getAttribute('data-orbit-active') === 'labs';
      }
    }
  }
  assert(hit, 'Rendered planet opens inspector');
  await page.waitForTimeout(900);
  const beforeDrag = await page.locator('.wc-scene-orbit__canvas-layer').screenshot();
  await page.mouse.move(480, 450);
  await page.mouse.down();
  await page.mouse.move(570, 490, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const afterDrag = await page.locator('.wc-scene-orbit__canvas-layer').screenshot();
  assert(await pixelDifference(beforeDrag, afterDrag) > 0.5, 'Dragging rotates model');
  await page.mouse.wheel(0, -200);
  await page.waitForTimeout(500);
  const afterZoom = await page.locator('.wc-scene-orbit__canvas-layer').screenshot();
  assert(await pixelDifference(afterDrag, afterZoom) > 0.3, 'Wheel zoom changes model');
  await page.getByRole('button', { name: 'Reset view' }).click();
  await page.mouse.click(120, 180);
  await page.getByRole('dialog').waitFor({ state: 'detached', timeout: 5000 });
  assert.equal(await page.getByRole('dialog').count(), 0, 'Backdrop closes inspector');
  // Intercept navigation only in this test so both external links can be checked.
  for (const index of [1, 2]) {
    const destination = links[index].href;
    await page.route(destination + '/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Destination reached</h1>' }));
    await page.route(destination + '/', route => route.fulfill({ contentType: 'text/html', body: '<h1>Destination reached</h1>' }));
    await cards.nth(index).locator('a').click();
    await page.waitForURL(destination + '/');
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('html[data-home-opening="complete"]');
    await at(page, 'scene-06', .35);
  }
  await at(page, 'scene-05', .9);
  await at(page, 'scene-05', 0);
  assert(Number(await page.locator('[data-studio-copy]').evaluate(n => getComputedStyle(n).opacity)) > .99, 'Reverse scroll restores Built Here');
  await at(page, 'scene-06', .98);
  await shot(page, 'project-brief-handoff');
  cases.push('Seamless studio handover, compact tinted cards, hover synchronization, all three dialogs, Escape and focus restoration');
  cases.push('Orbit advances during hover; actual planet hit opens popup; drag, wheel zoom, reset, backdrop and focus trap; direct external navigation; reversible studio transition');
  await context.close();

  for (const reducedMotion of ['no-preference', 'reduce']) {
    const mobile = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion });
    await at(mobile.page, 'scene-05');
    await shot(mobile.page, `mobile-studio-${reducedMotion}`);
    if (reducedMotion === 'no-preference') {
      // Phones pin both scenes: the orbit opens on the studio's last frame and
      // the cards land once the planets have assembled.
      await at(mobile.page, 'scene-05', 1);
      const phoneStudioEnd = await mobile.page.screenshot();
      await mobile.page.evaluate(() => scrollBy(0, 2));
      await mobile.page.waitForTimeout(850);
      assert.equal(await mobile.page.locator('#scene-06').getAttribute('data-orbit-entered'), 'true');
      assert(await pixelDifference(phoneStudioEnd, await mobile.page.screenshot()) < 3, 'Phone studio hands over without a seam');
      await at(mobile.page, 'scene-06', .45);
      await mobile.page.waitForTimeout(2000);
      await shot(mobile.page, `mobile-worlds-${reducedMotion}`);
      await shot(mobile.page, `mobile-cards-${reducedMotion}`);
    } else {
      await at(mobile.page, 'scene-06');
      await mobile.page.waitForTimeout(2000);
      await shot(mobile.page, `mobile-worlds-${reducedMotion}`);
      await mobile.page.locator('.wc-scene-orbit__editorial').scrollIntoViewIfNeeded();
      await shot(mobile.page, `mobile-cards-${reducedMotion}`);
    }
    await mobile.page.locator('.wc-destination-card__preview[data-orbit-world="labs"]').click();
    await mobile.page.waitForTimeout(800);
    await shot(mobile.page, `mobile-popup-${reducedMotion}`);
    await mobile.page.getByRole('button', { name: 'Close WestCose Labs inspector' }).click();
    assert.equal(await mobile.page.getByRole('dialog').count(), 0);
    await mobile.context.close();
    cases.push(`Mobile ${reducedMotion}: ${reducedMotion === 'reduce' ? 'normal flow' : 'pinned handover'}, cards, popup, close, no horizontal overflow`);
  }
  const reducedDesktop = await open({ reducedMotion: 'reduce' });
  await at(reducedDesktop.page, 'scene-06');
  await shot(reducedDesktop.page, 'desktop-reduced');
  await reducedDesktop.context.close();
  assert.equal(errors.length, 0, errors.join('\n'));
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({
    cases, errors,
    limitations: ['Phone layouts use browser emulation, not a physical device.', 'External navigation is intercepted after verifying the destination URL.', 'The existing /work portfolio route has not been built.'],
  }, null, 2));
  console.log(JSON.stringify({ cases, errors }, null, 2));
} catch (error) {
  fs.writeFileSync(path.join(out, `failure-${Date.now()}.json`), JSON.stringify({ cases, errors, failure: String(error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
