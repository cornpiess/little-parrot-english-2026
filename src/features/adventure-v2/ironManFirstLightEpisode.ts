import type { EpisodeBlueprint } from './types';

/**
 * 钢铁侠与黑云星的第一束光 · 10 幕完整幼儿沉浸式互动剧本 (10 Canonical Scenes)
 *
 * 1. 实验室微光 (收到黑云星求救)
 * 2. 装甲整备台 (邀请副驾驶，穿戴反浩克装甲头盔)
 * 3. 发射隧道 (推进器点火倒计时起飞)
 * 4. 深空航线与行星逼近 (双副驾驶飞行避障小游戏与黑云星巨大化)
 * 5. 黑云大气层 (发射掌心光束扫散雷暴乌云)
 * 6. 黑玻璃山谷 (发现熄灭的灯塔与地面神秘荧光小脚印)
 * 7. 暗谷晶石洞穴探照 (胸口探照灯搜索并呼唤 STAR)
 * 8. 莫莫避难所 (发现莫莫在保护熟睡小星星，温柔抱起)
 * 9. 灯塔地脉总控 (传递 LIGHT 唤醒三段地脉电缆)
 * 10. 晨曦复明星空 (灯塔通天光柱，小星星回家，英雄击掌)
 */
export const IRON_MAN_FIRST_LIGHT: EpisodeBlueprint = {
  id: 'iron-man-first-light',
  title: '钢铁侠与黑云星的第一束光',
  subtitle: '和钢铁侠一起，把小星星送回家',
  targetWords: ['star', 'light'],
  scenes: [
    {
      id: 'signal-lab',
      title: '斯塔克夜间实验室',
      line: '贾维斯，收到来自黑云星的求救信号！副驾驶，快看——那里的灯塔熄灭了，小星星迷路了，我们必须去救它！',
      durationMs: 18_000,
      settleMs: 900,
      intent: 'notice',
      camera: 'lab',
      exit: { kind: 'performance-complete' },
    },
    {
      id: 'armor-platform',
      title: '装甲连接平台',
      line: '托尼需要一名勇敢的副驾驶！碰一下我的掌心，戴上反浩克装甲头盔，我们一起出发！',
      durationMs: 18_000,
      settleMs: 900,
      intent: 'invite',
      camera: 'cockpit',
      exit: { kind: 'performance-complete' },
    },
    {
      id: 'launch-tunnel',
      title: '发射隧道',
      line: '反浩克系统就绪！推进器全功率开启——三、二、一，点火！冲向太空！',
      durationMs: 18_000,
      settleMs: 800,
      intent: 'lead',
      camera: 'launch',
      exit: { kind: 'performance-complete' },
    },
    {
      id: 'deep-space-flight',
      title: '深空航线与行星逼近',
      line: '看前面的 STAR！跟着我的飞行轨迹，一起穿过金色五角星门！STAR，闪闪发光的 STAR！',
      durationMs: 50_000,
      intent: 'lead',
      camera: 'flight',
      play: { kind: 'flight-approach', target: 'black-cloud-planet' },
      learningCue: 'STAR',
      exit: { kind: 'world-goal', key: 'planet-reached' },
    },
    {
      id: 'black-cloud-storm',
      title: '黑云大气层',
      line: '小心！黑云星的大气层被强力磁暴堵住了！对准乌云，和我一起发射掌心光束，扫开暴风雨！',
      durationMs: 22_000,
      settleMs: 900,
      intent: 'understand',
      camera: 'storm',
      exit: { kind: 'performance-complete' },
    },
    {
      id: 'black-glass-valley',
      title: '黑玻璃山谷',
      line: '安全降落！看，远处的灯塔真的没有电了……咦？地面上有一串发光的小脚印！顺着脚印找找看，小星星可能就在前面！',
      durationMs: 22_000,
      settleMs: 900,
      intent: 'wonder',
      camera: 'valley',
      exit: { kind: 'performance-complete' },
    },
    {
      id: 'dark-valley-search',
      title: '暗谷晶石洞穴探照',
      line: '洞穴里好黑呀，打开胸口探照灯！副驾驶，和我一起大声呼唤——STAR！你在里面吗？STAR！',
      durationMs: 28_000,
      settleMs: 900,
      intent: 'invite',
      camera: 'search',
      learningCue: 'STAR',
      exit: { kind: 'performance-complete' },
    },
    {
      id: 'star-shelter',
      title: '莫莫避难所',
      line: '找到了！原来是维修机器人莫莫把受惊的小星星保护在这里！小星星睡得好香呀……嘘，我们轻轻抱起它，带它去灯塔！',
      durationMs: 26_000,
      settleMs: 1_000,
      intent: 'understand',
      camera: 'shelter',
      exit: { kind: 'performance-complete' },
    },
    {
      id: 'lighthouse-veins',
      title: '灯塔地脉总控',
      line: '灯塔需要能量，需要 LIGHT！副驾驶，连接三条能量电缆，把 LIGHT 传导进灯塔！LIGHT，点亮整个世界！',
      durationMs: 28_000,
      settleMs: 900,
      intent: 'lead',
      camera: 'veins',
      learningCue: 'LIGHT',
      exit: { kind: 'performance-complete' },
    },
    {
      id: 'dawn-sky-peak',
      title: '晨曦复明星空',
      line: 'LIGHT！灯塔亮起来了！小星星回家了，天空中全都是 STAR！副驾驶，举起手来击掌——任务大成功！',
      durationMs: 30_000,
      settleMs: 1_100,
      intent: 'celebrate',
      camera: 'lighthouse',
      learningCue: 'LIGHT',
      exit: { kind: 'performance-complete' },
    },
  ],
};

export default IRON_MAN_FIRST_LIGHT;
