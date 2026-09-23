import { test, expect } from '@playwright/test';

// 极速 TTS：所有 utterance 立即 onend，让自动课堂瞬间推进
async function fastSpeech(page: any) {
  await page.addInitScript(() => {
    const w = window as any;
    w.__speechTexts = [];
    w.__speechDoneCount = 0;
    const FakeUtterance = function (text: string) {
      this.text = text;
      this.lang = 'en-US';
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      const self = this;
      setTimeout(() => {
        w.__speechTexts.push(text);
        w.__speechDoneCount++;
        self.onend?.();
      }, 0);
    };
    (w as any).SpeechSynthesisUtterance = FakeUtterance;
    (w as any).speechSynthesis = {
      speak: (u: any) => {},
      cancel: () => {},
      getVoices: () => [],
      paused: false,
      pending: false,
      speaking: false,
    };
  });
}

test('repro frog crash', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('CONSOLE: ' + m.text());
  });

  await fastSpeech(page);
  await page.goto('http://localhost:5199/parrot-adventure?character=parrot');

  // 1) 打招呼：自动推进。等待出现选择按钮并点击第一题
  await page.waitForSelector('text=A kid', { timeout: 20000 });
  await page.click('text=A kid');

  // 继续点完其余打招呼问题（sunny / age / apple / ice cream）
  await page.waitForTimeout(600);
  for (const label of ['Sunny', '3', 'Apple', 'Ice cream']) {
    await page.click(`text=${label}`).catch(() => {});
    await page.waitForTimeout(500);
  }

  // 2) 出现 Go! 按钮 → 选目的地 Color Land
  await page.waitForSelector('text=🚀 Go!', { timeout: 20000 });
  await page.click('text=🚀 Go!');
  await page.waitForSelector('text=Color Land', { timeout: 20000 });
  await page.click('text=Color Land');

  // 3) 颜色乐园整课自动推进。Part I 有 3 只小鸟 + 3 次问答(点击 YES)
  //    等待 Part II Pattern 的 frog 场景。持续捕获错误。
  //    ProgressDots/大图背景切换时自动。狂点页面中心模拟幼儿点 YES 太快。
  const deadline = Date.now() + 120000;
  let sawFrog = false;
  while (Date.now() < deadline) {
    const hasFrog = await page.locator('svg', { hasText: 'Ribbit' }).count().catch(() => 0);
    const ribbitText = await page.evaluate(() => (window as any).__speechTexts.join(' | ')).catch(() => '');
    if (ribbitText.includes('Ribbit') || ribbitText.includes('frog')) sawFrog = true;
    if (sawFrog) break;
    await page.waitForTimeout(500);
  }

  await page.waitForTimeout(4000);
  const ribbit = await page.evaluate(() => (window as any).__speechTexts.join(' | ')).catch(() => '');
  console.log('SPEECH LOG:', ribbit);
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  expect(errors).toEqual([]);
});