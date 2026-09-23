import { expect, test } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

test('standalone character gallery opens locally and plays actions', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(pathToFileURL(path.resolve('characters.html')).href);

  await expect(page.getByRole('heading', { name: '角色 SVG 与动作库' })).toBeVisible();
  await expect(page.locator('.static-card')).toHaveCount(5);
  await expect(page.locator('.concept-card')).toHaveCount(0);
  await expect(page.locator('[data-iron-man-character="mark-46"]')).toHaveCount(1);
  await expect(page.getByRole('tab', { name: 'Iron Man', exact: true })).toHaveCount(1);
  await expect(page.locator('.action-list button')).toHaveCount(22);
  await expect(page.locator('.motion-stage svg').first()).toBeVisible();

  const parrotBody = page.locator('.static-card').nth(0).locator('[class~="w-48"][class~="h-52"]').first();
  const foxBody = page.locator('.static-card').nth(1).locator('[class~="w-48"][class~="h-52"]').first();
  await expect(parrotBody).toHaveCSS('position', 'relative');
  await expect(parrotBody).toHaveCSS('height', '208px');
  await expect(foxBody).toHaveCSS('position', 'relative');
  await expect(foxBody).toHaveCSS('height', '208px');

  await page.getByRole('button', { name: /跳舞/ }).click();
  const animatedParrotBody = page.locator('.motion-stage div.relative.w-48.h-52').first();
  await page.waitForTimeout(80);
  const firstDanceFrame = await animatedParrotBody.evaluate((element) => getComputedStyle(element).transform);
  await expect.poll(
    () => animatedParrotBody.evaluate((element) => getComputedStyle(element).transform),
    { timeout: 1_000, intervals: [120] },
  ).not.toBe(firstDanceFrame);

  await page.getByRole('tab', { name: 'Iron Man', exact: true }).click();
  await expect(page.locator('.action-list button')).toHaveCount(23);

  const ironManActions = [
    ['装甲戒备', 'idle', null],
    ['战术监听', 'listening', 'hud-scan'],
    ['战术分析', 'thinking', 'hud-scan'],
    ['装甲发言', 'speaking', 'eye-pulse'],
    ['低功耗待机', 'sleeping', 'standby-pulse'],
    ['掌心致意', 'greeting', 'eye-flash'],
    ['装甲鼓掌', 'clap', 'clap-spark'],
    ['单臂招手', 'wave', 'eye-pulse'],
    ['装甲律动', 'dance', 'reactor-pulse'],
    ['推进小跳', 'bounce', 'boot-thrusters'],
    ['头盔确认', 'nod', 'eye-flash'],
    ['掌心全息爱心', 'hearts', 'hologram-heart'],
    ['高能兴奋', 'excited', 'boot-thrusters'],
    ['威胁侦测', 'surprised', 'eye-flash'],
    ['自信满意', 'happy', 'reactor-pulse'],
    ['喷射飞行', 'fly', 'boot-thrusters'],
    ['推进欢呼', 'cheer', 'boot-thrusters'],
    ['头盔否定', 'shake', 'eye-pulse'],
    ['陀螺仪故障', 'dizzy', 'gyro-warning'],
    ['尴尬回避', 'shy', 'eye-pulse'],
    ['战术探查', 'peek', 'hud-scan'],
    ['掌心冲击炮', 'repulsor-blast', 'repulsor-beam'],
    ['胸口集束炮', 'unibeam', 'unibeam'],
  ] as const;

  for (const [label, id, effect] of ironManActions) {
    await page.getByRole('button', { name: new RegExp(label) }).click();
    await expect(page.locator('.action-list .is-active code')).toHaveText(id);
    if (effect) await expect(page.locator(`.motion-stage [data-effect="${effect}"]`).first()).toBeVisible();
    if (id !== 'idle') await expect(page.locator(`.motion-stage [data-iron-cue="${id}"]`)).toBeVisible();
  }

  await expect(page.getByRole('button', { name: /英雄式落地/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /喷射重拳/ })).toHaveCount(0);

  await page.getByRole('button', { name: /掌心冲击炮/ }).click();
  const rightHandChildren = page.locator('.motion-stage [data-part="fistRight"] > g').first();
  await expect(rightHandChildren.locator('[data-effect-layer="behind-hand"]')).toHaveCount(1);
  await expect(rightHandChildren.locator('[data-iron-hand-surface="right"]')).toHaveCount(1);
  const repulsorLayerOrder = await rightHandChildren.locator(':scope > *').evaluateAll((children) => children.map((child) => child.getAttribute('data-effect-layer') ?? child.getAttribute('data-iron-hand-surface')));
  expect(repulsorLayerOrder.indexOf('behind-hand')).toBeLessThan(repulsorLayerOrder.indexOf('right'));

  await page.getByRole('button', { name: /陀螺仪故障/ }).click();
  const firstDizzyFrame = await page.locator('.motion-stage [data-part="root"]').evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(100);
  await expect.poll(
    () => page.locator('.motion-stage [data-part="root"]').evaluate((element) => getComputedStyle(element).transform),
    { timeout: 1_000, intervals: [120] },
  ).not.toBe(firstDizzyFrame);

  await page.getByRole('tab', { name: '小狐狸' }).click();
  await page.getByRole('button', { name: /跳舞/ }).click();
  await expect(page.locator('.action-list .is-active code')).toHaveText('dance');

  await page.getByRole('tab', { name: '巴斯光年' }).click();
  await expect(page.locator('.action-list button')).toHaveCount(18);
  await page.getByRole('button', { name: /五指招手/ }).click();
  await expect(page.locator('.motion-stage [data-buzz-hand="right"]')).toHaveAttribute('data-palm-facing', 'viewer');
  await expect(page.locator('.motion-stage [data-buzz-hand="right"]')).toHaveAttribute('data-fingers-direction', 'up');
  await expect(page.locator('.motion-stage [data-buzz-hand="right"] [data-buzz-finger]')).toHaveCount(5);
  await expect(page.locator('.motion-stage [data-buzz-hand="right"] [data-buzz-finger-segment]')).toHaveCount(10);
  const fingerColumns = await page.locator('.motion-stage [data-buzz-hand="right"] [data-buzz-finger]').evaluateAll((fingers) => fingers.map((finger) => Math.round(finger.getBoundingClientRect().x)));
  expect(new Set(fingerColumns).size).toBeGreaterThanOrEqual(4);
  await expect(page.locator('.motion-stage [data-buzz-ear]')).toHaveCount(2);
  await expect(page.locator('.motion-stage [data-buzz-eyebrow]')).toHaveCount(2);
  await expect(page.locator('.motion-stage [data-buzz-helmet-glare]')).toHaveCount(3);
  await expect(page.locator('.motion-stage [data-buzz-chin-swirl]')).toHaveCount(1);
  await page.getByRole('button', { name: /讲话口型/ }).click();
  await expect(page.locator('.motion-stage [data-buzz-mouth="natural-speech"]')).toHaveCount(1);
  await expect(page.locator('.motion-stage [data-buzz-mouth-part="teeth"]')).toHaveCount(1);
  await expect(page.locator('.motion-stage [data-buzz-mouth-part="tongue"]')).toHaveCount(1);
  await page.getByRole('button', { name: /胸前拍手/ }).click();
  await expect(page.locator('.motion-stage [data-buzz-action="clap"]')).toHaveCount(1);
  await expect(page.locator('.motion-stage [data-buzz-arms]')).toHaveCount(2);
  const buzzRoot = page.locator('.motion-stage [data-buzz-root="rig"]');
  await expect(buzzRoot.locator('[data-buzz-head="head"]')).toHaveCount(1);
  await expect(buzzRoot.locator('[data-buzz-arms] [data-buzz-joint="shoulder"]')).toHaveCount(2);
  await expect(buzzRoot.locator('[data-buzz-arms] [data-buzz-joint="elbow"]')).toHaveCount(2);
  await expect(buzzRoot.locator('[data-buzz-arms] [data-buzz-segment]')).toHaveCount(4);
  expect(errors).toEqual([]);
});
