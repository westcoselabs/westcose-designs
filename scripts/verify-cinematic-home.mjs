/* Visual and interaction regression check. Set PLAYWRIGHT_MODULE if Playwright is not installed in this project. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const loadPackage = createRequire(import.meta.url);
const { chromium, firefox, webkit } = loadPackage(process.env.PLAYWRIGHT_MODULE || 'playwright');
import sharp from 'sharp';
const base = process.env.QA_URL || 'http://localhost:3001';
const out = path.resolve('scrollcraft/builds/cinematic-home/qa');
fs.mkdirSync(out, { recursive: true });
const report = { browsers: {}, cases: [], errors: [], timings: {}, limitations: ['Headless WebKit is not an actual Safari/iPhone device.', 'Contact delivery is mocked; no email is sent.'] };
let diagnosticPage;
const pause = (page, ms = 400) => page.waitForTimeout(ms);
async function prepare(context) {
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => {};
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  });
}
async function open(page, suffix = '') {
  await page.goto(base + suffix, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('html[data-home-opening="complete"]', { timeout: 8000 });
  await pause(page, 900);
}
async function at(page, id, progress) {
  await page.evaluate(({ id, progress }) => {
    const e = document.getElementById(id);
    scrollTo(0, e.getBoundingClientRect().top + scrollY + Math.max(0, e.offsetHeight - innerHeight) * progress);
  }, { id, progress });
  await pause(page, 550);
}
async function shot(page, name) {
  const file = path.join(out, name + '.png');
  await page.screenshot({ path: file });
  return file;
}
async function noOverflow(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow');
}
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.QA_CHROME_CHANNEL || undefined, ignoreDefaultArgs: process.env.QA_CHROME_CHANNEL ? ['--use-angle=swiftshader-webgl'] : undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: path.join(out, 'recordings'), size: { width: 1280, height: 800 } } });
  await prepare(context);
  const page = await context.newPage();
  diagnosticPage = page;
  page.on('console', message => { if (message.type() === 'error') console.log('BROWSER', message.text().slice(0, 500)); });
  page.on('pageerror', error => report.errors.push(error.message));
  const started = Date.now();
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await pause(page, 450); await shot(page, 'opening-outline');
  await pause(page, 750); await shot(page, 'opening-solid');
  await page.waitForSelector('html[data-home-opening="complete"]', { timeout: 8000 });
  report.timings.openingFromNavigationMs = Date.now() - started;
  await pause(page, 900);
  await shot(page, 'desktop-hero');
  await noOverflow(page);
  const scenes = ['scene-01', 'scene-01-5', 'scene-02', 'scene-03', 'scene-04', 'scene-05', 'scene-06', 'scene-07'];
  const shots = [];
  for (const id of (process.env.QA_SKIP_FRAMES ? [] : scenes)) for (const p of [0, .2, .4, .6, .8, .98]) {
    console.log('FRAME', id, p);
    await at(page, id, p);
    if (id === 'scene-02') await pause(page, 650);
    shots.push(await shot(page, `${id}-${p}`));
    await noOverflow(page);
  }
  if (shots.length) report.cases.push('Six visual positions per chapter, desktop overflow');
  // Visit far away so the paper renderer unmounts, then return and reverse.
  await at(page, 'scene-02', .6); await pause(page, 1300);
  const forward = await page.locator('.wc-cinematic-falling').getAttribute('data-paper-progress');
  await at(page, 'scene-07', 0); await pause(page, 900);
  await at(page, 'scene-02', .85); await at(page, 'scene-02', .6); await pause(page, 1300);
  assert.equal(await page.locator('#scene-02').getAttribute('data-paper-mode'), 'cinematic');
  assert.equal(await page.locator('.wc-cinematic-falling').getAttribute('data-paper-progress'), forward);
  assert.equal(await page.locator('.wc-paper-stage').evaluate(e => getComputedStyle(e).visibility), 'visible');
  assert.equal(await page.locator('.wc-cinematic-falling').getAttribute('data-video-state'), 'ready');
  report.cases.push('Reverse scroll, renderer re-entry, decoded video');
  for (const h of [0, .25, .5, .75, .98, 1]) {
    await page.evaluate(h => {
      const scene = document.querySelector('#scene-02'), next = document.querySelector('#scene-03');
      const top = scene.getBoundingClientRect().top + scrollY;
      const start = top + (scene.offsetHeight - innerHeight) * .88;
      const end = next.getBoundingClientRect().top + scrollY;
      scrollTo(0, start + (end - start) * h);
    }, h);
    await pause(page, 650); await shot(page, `paper-handoff-${h}`);
  }
  await at(page, 'scene-02', .2);
  report.timings.scrollFrames = await page.evaluate(async () => {
    const e = document.querySelector('#scene-02');
    const origin = e.getBoundingClientRect().top + scrollY;
    const span = e.offsetHeight - innerHeight;
    const frames = []; let previous = performance.now();
    for (let i = 0; i < 90; i++) await new Promise(resolve => requestAnimationFrame(now => {
      frames.push(now - previous); previous = now; scrollTo(0, origin + span * (.2 + i / 180)); resolve();
    }));
    const sorted = frames.slice(8).sort((a,b) => a-b);
    return { medianMs: sorted[Math.floor(sorted.length/2)], p95Ms: sorted[Math.floor(sorted.length*.95)], over50ms: sorted.filter(x=>x>50).length };
  });
  await at(page, 'scene-06', .6); await pause(page, 1200);
  const inspect = page.locator('.wc-scene-orbit__node[data-orbit-world="designs"]');
  await inspect.click(); await page.getByRole('dialog').waitFor(); await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  report.cases.push('Orbit inspector opens, Escape closes');
  await at(page, 'scene-07', 0);
  await page.getByRole('button', { name: 'Send project brief' }).click();
  assert(await page.locator('.wc-project-brief__error-summary').isVisible());
  await page.locator('#project-brief-project-type').selectOption('Brand Identity');
  await page.locator('#project-brief-name').fill('Preview Test');
  await page.locator('#project-brief-email').fill('preview@example.com');
  await page.locator('#project-brief-summary').fill('A fictional identity project used only for local interface verification.');
  await page.route('**/api/contact', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, message: 'Preview delivery unavailable.' }) }));
  await page.getByRole('button', { name: 'Send project brief' }).click(); await pause(page);
  assert(await page.getByText('Preview delivery unavailable.').isVisible());
  await page.unroute('**/api/contact');
  await page.route('**/api/contact', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
  await page.getByRole('button', { name: 'Send project brief' }).click();
  await page.locator('.wc-project-brief__success').waitFor();
  report.cases.push('Form validation, failure with answers retained, mocked success');
  const recording = await page.video().path(); await context.close();
  fs.copyFileSync(recording, path.join(out, process.env.QA_SKIP_FRAMES ? 'desktop-interactions.webm' : 'desktop-walkthrough.webm'));
  // Fresh top visits replay; Skip also restores scrolling.
  const intro = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await intro.goto(base, {waitUntil:'domcontentloaded'}); await intro.waitForSelector('html[data-home-opening="pending"]'); await intro.locator('.wc-scene-loader__skip').dispatchEvent('click');
  await intro.waitForSelector('html[data-home-opening="complete"]');
  assert.equal(await intro.evaluate(() => document.body.style.overflow), '');
  await intro.reload({waitUntil:'domcontentloaded'}); assert(await intro.locator('#scene-00').count()); await intro.waitForSelector('html[data-home-opening="pending"]'); await intro.locator('.wc-scene-loader__skip').dispatchEvent('click');
  await open(intro, '/#scene-03'); assert.equal(await intro.locator('#scene-00').count(), 0);
  report.cases.push('Skip, fresh-visit replay, deep-link bypass'); await intro.close();
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, recordVideo: { dir: path.join(out,'recordings'), size: { width: 390, height: 844 } } });
  await prepare(mobileContext); const mobile = await mobileContext.newPage();
  mobile.on('pageerror',e=>report.errors.push(e.message)); await open(mobile);
  await mobile.getByText('Menu',{exact:true}).click(); await mobile.keyboard.press('Escape'); assert(await mobile.locator('details').evaluate(e=>!e.open));
  for (const id of scenes) { await at(mobile,id,.4); await pause(mobile,600); await shot(mobile,`mobile-${id}`); await noOverflow(mobile); }
  assert(await mobile.locator('#scene-01-5').evaluate(e=>e.offsetHeight>1600));
  await at(mobile,'scene-02',.4); assert((await mobile.locator('video').evaluate(v=>v.currentSrc)).includes('portrait'));
  await mobile.setViewportSize({width:844,height:390});await pause(mobile,1200);await noOverflow(mobile);
  const mobileRecording=await mobile.video().path(); await mobileContext.close(); fs.copyFileSync(mobileRecording,path.join(out,'mobile-walkthrough.webm'));
  report.cases.push('Portrait gallery, video source, menu Escape, orientation change');
  for (const scenario of ['reduced','save-data','video-failure','no-webgl']) {
    console.log('FALLBACK', scenario);
    const c=await browser.newContext({ viewport:{width:1280,height:800}, reducedMotion:scenario==='reduced'?'reduce':'no-preference' });await prepare(c);
    if(scenario==='save-data')await c.addInitScript(()=>Object.defineProperty(navigator.connection,'saveData',{get:()=>true}));
    if(scenario==='no-webgl')await c.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:get.call(this,type,...args)}});
    const p=await c.newPage();diagnosticPage=p;if(scenario==='video-failure')await p.route('**/falling-scrub-*.mp4',r=>r.abort());await open(p);await at(p,'scene-02',.2);await pause(p,2200);
    assert.equal(await p.locator('#scene-02').getAttribute('data-paper-mode'),'static',scenario);
    assert(await p.locator('.wc-refined-falling__static-story').isVisible());await shot(p,scenario);await c.close();report.cases.push(scenario+' fallback');
  }
  await browser.close();
  for(const [name,engine]of [['Firefox',firefox],['WebKit',webkit]]){
    let b;
    try {b=await engine.launch({headless:true});const c=await b.newContext({viewport:{width:1280,height:800}});await prepare(c);const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await open(p);await at(p,'scene-02',.45);await pause(p,2000);await shot(p,name+'-papers');await noOverflow(p);await at(p,'scene-04',.26);await shot(p,name+'-pages');await c.close();report.browsers[name]={tested:true,errors};assert.equal(errors.length,0);}
    catch(error){report.browsers[name]={tested:false,error:error.message};}finally{await b?.close();}
  }
  const composite=[];for(let i=0;i<shots.length;i++)composite.push({input:await sharp(shots[i]).resize(240,150).toBuffer(),left:i%6*240,top:Math.floor(i/6)*150});
  if(shots.length)await sharp({create:{width:1440,height:Math.ceil(shots.length/6)*150,channels:3,background:'#121212'}}).composite(composite).png().toFile(path.join(out,'desktop-contact-sheet.png'));
  report.browsers.Chromium={tested:true};assert.equal(report.errors.length,0);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(async error=>{report.failure=error.stack;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));if(diagnosticPage){fs.writeFileSync(path.join(out,'failure.html'),await diagnosticPage.content().catch(()=>''));await diagnosticPage.screenshot({path:path.join(out,'failure.png'),timeout:5000}).catch(()=>{});}console.error(error);process.exit(1)});

