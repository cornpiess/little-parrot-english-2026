// 角色与动态世界实验台——基线捕获脚本（自动生成轨迹与关键帧截图）。
// 用法：node scripts/character-world-lab-capture.mjs
// 行为：自起 vite（独立端口 8084，退出清理）→ 打开 /_integration/character-world →
//       逐个关键帧截图到 test-results/character-world-lab/ → 落盘轨迹 JSON 到
//       docs/character-world-lab/trace-baseline.json → 断言零浏览器错误、零外部网络请求。
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '..');
const contentRoot = path.resolve(frontendRoot, '..', 'ai-infinite-content');
const shotDir = path.join(frontendRoot, 'test-results', 'character-world-lab');
const traceDir = path.join(frontendRoot, 'docs', 'character-world-lab');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const waitUp = async (url, tries = 60) => {
  for (let i = 0; i < tries; i++) { try { await fetch(url); return; } catch { await sleep(500); } }
  throw new Error(`vite 未就绪: ${url}`);
};

const vite = spawn(process.execPath, [path.join('node_modules', 'vite', 'bin', 'vite.js'), '--port', '8084', '--strictPort'], { cwd: frontendRoot, stdio: 'ignore' });

try {
  await waitUp('http://127.0.0.1:8084/');
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 980 } })).newPage();
  const errors = [];
  const remoteOrigins = new Set();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { const u = r.url(); if (/^https?:/.test(u) && !/^http:\/\/127\.0\.0\.1/.test(u)) remoteOrigins.add(new URL(u).origin); });

  await page.goto('http://127.0.0.1:8084/_integration/character-world');
  await page.getByRole('button', { name: 'k1-idle' }).waitFor({ timeout: 15000 });
  await mkdir(shotDir, { recursive: true });
  await mkdir(traceDir, { recursive: true });

  const keyframes = await page.locator('header ~ div button[title]').evaluateAll(buttons => buttons.map(b => ({ name: b.textContent, caption: b.title })));
  console.log('keyframes:', JSON.stringify(keyframes));
  const stage = page.locator('svg[role="img"]').first();
  for (const keyframe of keyframes) {
    await page.getByRole('button', { name: keyframe.name, exact: true }).click();
    await page.waitForTimeout(120);
    await stage.screenshot({ path: path.join(shotDir, `${keyframe.name}.png`) });
    console.log(`shot ${keyframe.name}: ${keyframe.caption}`);
  }

  const trace = await page.evaluate(() => JSON.stringify(window.__cwLab.trace));
  await writeFile(path.join(traceDir, 'trace-baseline.json'), JSON.stringify(JSON.parse(trace), null, 2) + '\n', 'utf8');
  const summary = JSON.parse(trace).summary;
  console.log('trace summary:', JSON.stringify(summary));

  if (errors.length) throw new Error('浏览器错误: ' + errors.join(' | '));
  if (remoteOrigins.size) throw new Error('外部网络请求: ' + [...remoteOrigins].join(', '));
  console.log('CAPTURE ALL PASS（0 浏览器错误 / 0 外部请求）');
  await browser.close();
} catch (error) {
  console.error('CAPTURE FAIL:', error.message);
  process.exitCode = 1;
} finally {
  vite.kill();
}
