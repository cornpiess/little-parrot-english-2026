const { chromium } = require('@playwright/test');
const fs = require('fs');
const log = (msg) => fs.appendFileSync('repro-log.txt', new Date().toISOString() + ' ' + msg + '\n');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.addInitScript(() => {
    const w = window;
    w.__speechTexts = [];
    const FakeUtterance = function (text) {
      this.text = text;
      setTimeout(() => { w.__speechTexts.push(text); this.onend && this.onend(); }, 0);
    };
    w.SpeechSynthesisUtterance = FakeUtterance;
    w.speechSynthesis = { speak: () => {}, cancel: () => {}, getVoices: () => [], paused: false, pending: false, speaking: false };
    // 拦截摄像头
    w.navigator.mediaDevices = w.navigator.mediaDevices || {};
    w.navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error('no cam'));
  });

  await page.goto('http://localhost:5199/parrot-adventure?character=parrot', { waitUntil: 'domcontentloaded' });
  log('goto done');
  await page.waitForTimeout(1500);

  // 打招呼: 点击按钮直至出现 Go!
  for (let i = 0; i < 8; i++) { log('click iter '+i);
    try {
      const go = await page.locator('text=🚀 Go!').count();
      if (go > 0) break;
    } catch {}
    const btns = page.locator('button');
    const n = await btns.count();
    if (n === 0) break;
    // 点击第一个可见的问答按钮
    let clicked = false;
    for (let k = 0; k < n; k++) {
      const txt = (await btns.nth(k).innerText()).trim();
      if (txt && !txt.includes('Go!') && !txt.includes('Watch') && !txt.includes('←')) {
        await btns.nth(k).click().catch(() => {});
        clicked = true;
        break;
      }
    }
    await page.waitForTimeout(400);
    if (!clicked) break;
  }

  // Go!
  try { await page.click('text=🚀 Go!'); log('GO clicked'); } catch { log('GO click fail'); }
  await page.waitForTimeout(800);
  // Color Land
  try { await page.click('text=Color Land'); log('COLOR clicked'); } catch { log('COLOR click fail'); }
  await page.waitForTimeout(500);

  // 自动推进整个颜色课，每 1s 采样一次说话文本
  let polled = 0;
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline && polled++ < 60) {
    const texts = await page.evaluate(() => window.__speechTexts.join(' | ')).catch(() => '');
    if (polled % 10 === 0) console.log('poll', polled, texts.slice(0, 140));
    if (/frog|Ribbit|sing/i.test(texts)) break;
    await page.waitForTimeout(800);
  }

  await page.waitForTimeout(3000);
  const final = await page.evaluate(() => window.__speechTexts.join(' | ')).catch(() => '');
  console.log('SPEECH:', final);
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
  process.exit(0);
})();
