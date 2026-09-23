// 真实环境验收脚本（前端仓库）。
//
// 用法 A（breakfast 播放器，需手动先起两个服务）：
//   1) ai-infinite-content: npm start            （http://127.0.0.1:4173）
//   2) 本仓库:            npm run dev            （http://127.0.0.1:8080）
//   3) node scripts/integration-acceptance.mjs
//
// 用法 B（contract-fixture 体验包，脚本自起双服务，退出自动清理）：
//   node scripts/integration-acceptance.mjs --fixture
//   （包服务 127.0.0.1:4175 = npm run xpkg serve contract-fixture；前端 vite 用独立端口 8081
//     并注入 VITE_EXPERIENCE_ORIGIN / VITE_EXPERIENCE_ID）
//
// 两者都验证 /_integration/experience 集成页与内容侧的真实通信：握手、语义事件、暂停/继续/退出。
import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '..');
const contentRoot = path.resolve(frontendRoot, '..', 'ai-infinite-content');
const FIXTURE = process.argv.includes('--fixture');
const children = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const waitUp = async (url, label, tries = 60) => {
  for (let i = 0; i < tries; i++) {
    try { await fetch(url); return; } catch { await sleep(500); }
  }
  throw new Error(`${label} 未就绪: ${url}`);
};

async function main() {
  let pageUrl;
  if (FIXTURE) {
    const pkg = spawn(process.execPath, ['content-system/tools/cli.js', 'xpkg', 'serve', 'contract-fixture'], { cwd: contentRoot, stdio: 'ignore' });
    const vite = spawn(process.execPath, [path.join('node_modules', 'vite', 'bin', 'vite.js'), '--port', '8081', '--strictPort'], {
      cwd: frontendRoot, env: { ...process.env, VITE_EXPERIENCE_ORIGIN: 'http://127.0.0.1:4175', VITE_EXPERIENCE_ID: 'contract-fixture' }, stdio: 'ignore',
    });
    children.push(pkg, vite);
    await waitUp('http://127.0.0.1:4175/', 'contract-fixture 服务（先 npm run xpkg build contract-fixture）');
    await waitUp('http://127.0.0.1:8081/', 'vite dev (8081)');
    pageUrl = 'http://127.0.0.1:8081/_integration/experience';
  } else {
    pageUrl = 'http://127.0.0.1:8080/_integration/experience';
    await waitUp('http://127.0.0.1:4173/', '内容播放器 (4173，先在 ai-infinite-content 运行 npm start)');
    await waitUp(pageUrl, 'vite dev (8080，先在本仓库运行 npm run dev)');
  }

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 950 } })).newPage();
  const errors = [];
  const remoteOrigins = new Set();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { const u = r.url(); if (/^https?:/.test(u) && !/^http:\/\/127\.0\.0\.1/.test(u)) remoteOrigins.add(new URL(u).origin); });

  await page.goto(pageUrl);
  await expect.poll(() => page.getByText('已连接', { exact: true }).textContent(), { timeout: 15000 }).toContain('已连接');
  console.log('ACCEPT handshake ok');
  if (FIXTURE) {
    await expect.poll(() => page.locator('header').textContent(), { timeout: 5000 }).toContain('ID 匹配');
    console.log('ACCEPT expected id matched');
    const frame = page.frameLocator('iframe');
    // 语义事件：夹具握手后自动发 session-started；点按钮再发 choice
    await expect.poll(() => page.locator('section .font-mono.font-semibold').allTextContents(), { timeout: 8000 }).toContain('session-started');
    await frame.locator('#send-event').click();
    await expect.poll(() => page.locator('section .font-mono.font-semibold').allTextContents(), { timeout: 5000 }).toContain('choice');
    console.log('ACCEPT semantic events received');
    // agent-turn → unavailable（在夹具内显示）
    await frame.locator('#request-agent').click();
    await expect.poll(() => frame.locator('#agent-result').textContent(), { timeout: 8000 }).toContain('unavailable');
    console.log('ACCEPT agent turn unavailable');
    // 暂停 / 继续（夹具控制日志）
    await page.getByRole('button', { name: 'Ⅱ 暂停' }).click();
    await page.getByRole('button', { name: '▶ 继续' }).click();
    await expect.poll(() => frame.locator('#control-log').textContent(), { timeout: 5000 }).toMatch(/pause（host）[\s\S]*resume（host）/);
    console.log('ACCEPT pause/resume ok');
    // 伪造 nonce：宿主拒收并计入违规面板
    await page.frames().find(f => f !== page.mainFrame()).evaluate(() => window.__forge());
    await expect.poll(() => page.locator('text=协议违规').first().textContent(), { timeout: 5000 }).toMatch(/（1）/);
    console.log('ACCEPT forged nonce rejected');
    // 退出
    await page.getByRole('button', { name: /⏹ 退出/ }).click();
    await expect.poll(() => page.locator('header span').allTextContents(), { timeout: 5000 }).toContain('已结束');
    await expect.poll(() => frame.locator('#status').textContent(), { timeout: 5000 }).toBe('已退出');
    console.log('ACCEPT exit ok');
  } else {
    const frame = page.frameLocator('iframe');
    await frame.getByRole('button', { name: '薄荷碗  →', exact: true }).click();
    await expect.poll(() => page.locator('section >> text=id:').count(), { timeout: 5000 }).toBeGreaterThan(0);
    const eventTypes = await page.locator('section .font-mono.font-semibold').allTextContents();
    console.log('ACCEPT events received:', JSON.stringify(eventTypes));
    await frame.locator('#pause').click(); // 开始
    await expect.poll(() => page.locator('section .font-mono.font-semibold').allTextContents(), { timeout: 15000 }).toContain('action-result');

    const readElapsed = async () => Number((await frame.locator('#time').textContent()).match(/^(\d+)/)[1]);
    await page.getByRole('button', { name: 'Ⅱ 暂停' }).click();
    await page.waitForTimeout(200);
    const frozen = await readElapsed();
    await page.waitForTimeout(1300);
    if (await readElapsed() !== frozen) throw new Error('pause not effective');
    console.log('ACCEPT pause ok');
    await page.getByRole('button', { name: '▶ 继续' }).click();
    await page.waitForTimeout(2000); // 增量 >1s，避免 floor 取整掩盖推进
    if (!((await readElapsed()) > frozen)) throw new Error('resume not effective');
    console.log('ACCEPT resume ok');
    await page.getByRole('button', { name: /⏹ 退出/ }).click();
    await expect.poll(() => page.locator('header span').allTextContents(), { timeout: 5000 }).toContain('已结束');
    const stopped = await readElapsed();
    await page.waitForTimeout(900);
    if (await readElapsed() !== stopped) throw new Error('exit not effective');
    console.log('ACCEPT exit ok');
  }
  if (remoteOrigins.size) throw new Error('外部网络请求: ' + [...remoteOrigins].join(', '));
  console.log('ACCEPT no external network requests');
  if (errors.length) throw new Error('browser errors: ' + errors.join(' | '));
  await page.screenshot({ path: path.join(contentRoot, 'test-results', FIXTURE ? 'integration-fixture-acceptance.png' : 'integration-page-acceptance.png'), fullPage: true });
  console.log('ACCEPT ALL PASS');
  await browser.close();
}

main()
  .catch(e => { console.error('ACCEPT FAIL:', e.message); process.exitCode = 1; })
  .finally(() => { for (const c of children) c.kill(); });
