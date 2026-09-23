const { chromium } = require('@playwright/test');
const fs = require('fs');
const log = (msg) => fs.appendFileSync('repro-log.txt', new Date().toISOString() + ' ' + msg + '\n');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message + '\n' + (e.stack || '')));
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

  // 打招呼: 每个问题点对应答案（每个答案只点一次，等下一题出现）
  const answerFor = (qtext) => {
    if (/who are you|Hello there|Hi hi|Roar/i.test(qtext)) return 'A kid';
    if (/sunny/i.test(qtext)) return 'Sunny';
    if (/how old/i.test(qtext)) return '3';
    if (/i am holding|holding something/i.test(qtext)) return 'Apple';
    if (/what do you like/i.test(qtext)) return 'Ice cream';
    return null;
  };
  let lastQ = '';
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(500);
    const qtext = await page.evaluate(() =>
      Array.from(document.querySelectorAll('p')).map((p) => p.innerText).join(' | ')
    ).catch(() => '');
    const hasGo = await page.locator('button:has-text("Go!")').count().catch(() => 0);
    if (hasGo > 0) break;
    if (qtext === lastQ) continue; // 还没换题
    lastQ = qtext;
    const ans = answerFor(qtext);
    if (ans) {
      const btn = page.locator(`button:has-text("${ans}")`);
      if (await btn.count().catch(() => 0) > 0) {
        await btn.first().click({ force: true, timeout: 2000 }).catch(() => {});
        log('clicked: ' + ans + ' (q=' + qtext.slice(0, 40) + ')');
      }
    }
  }

  // Go!
  try { await page.click('button:has-text("Go!")', { timeout: 8000, force: true }); log('GO clicked'); } catch { log('GO click fail'); }
  await page.waitForTimeout(800);
  // Color Land
  try { await page.click('text=Color Land', { timeout: 8000 }); log('COLOR clicked'); } catch { log('COLOR click fail'); }
  await page.waitForTimeout(500);

  log('body: ' + (await page.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => 'ERR')));
  log('errors now: ' + JSON.stringify(errors));

  // 自动推进整个颜色课，每 1s 采样一次说话文本
  let polled = 0;
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline && polled++ < 120) {
    const texts = await page.evaluate(() => window.__speechTexts.join(' | ')).catch(() => '');
    if (polled % 10 === 0) log('poll ' + polled + ' ' + texts.slice(-160));
    // 幼儿回答 KidTurn：读当前 ProgressDots 已亮圆点数 = index+1，
    // 偶数索引(0,2) 正确答案是 YES，奇数索引(1) 是 NO
    const filled = await page.evaluate(() => document.querySelectorAll('.bg-blue-500').length).catch(() => 0);
    if (filled > 0) {
      const correctYes = (filled - 1) % 2 === 0;
      const btn = page.locator(`button:has-text("${correctYes ? 'YES' : 'NO'}")`);
      if (await btn.count().catch(() => 0) > 0) {
        await btn.first().click({ force: true, timeout: 2000 }).catch(() => {});
      }
    }
    if (/frog|Ribbit/i.test(texts)) break;
    await page.waitForTimeout(800);
  }

  await page.waitForTimeout(3000);
  const final = await page.evaluate(() => window.__speechTexts.join(' | ')).catch(() => '');
  const leadinState = await page.evaluate(() => JSON.stringify({ state: window.__leadinState, log: (window.__leadinLog || []).slice(-40), byeCb: window.__byeCb, byeCbLog: (window.__byeCbLog || []).slice(-20), byeFire: window.__byeFire, sayCalls: window.__sayLinesCalls, sayLog: (window.__sayLinesLog || []).slice(-20), pq: (window.__pq || []).slice(-25), schedLog: (window.__schedLog || []).slice(-20) })).catch(() => 'N/A');
  console.log('LEADIN_STATE:', leadinState);
  console.log('SPEECH:', final);
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
  process.exit(0);
})();