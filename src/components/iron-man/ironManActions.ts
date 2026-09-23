import type {
  CharacterActionButton,
  CharacterActionRecipe,
} from '../../features/character-performance/actionRecipe';

/**
 * Mark 46 actions are semantic names. The registry is the only place that
 * turns a name into a timed pose/effect recipe; the SVG renderer does not own
 * another copy of the action list.
 */
export type IronManAction =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'sleeping'
  | 'greeting'
  | 'clap'
  | 'wave'
  | 'dance'
  | 'bounce'
  | 'nod'
  | 'hearts'
  | 'excited'
  | 'surprised'
  | 'happy'
  | 'fly'
  /** @deprecated Use `fly`; retained for callers from the first Mark 46 demo. */
  | 'flight'
  | 'cheer'
  | 'shake'
  | 'dizzy'
  | 'shy'
  | 'peek'
  | 'repulsor-blast'
  | 'unibeam';

export type IronManRigPart =
  | 'root'
  | 'torso'
  | 'head'
  | 'armLeft'
  | 'forearmLeft'
  | 'fistLeft'
  | 'armRight'
  | 'forearmRight'
  | 'fistRight'
  | 'legLeft'
  | 'calfLeft'
  | 'bootLeft'
  | 'legRight'
  | 'calfRight'
  | 'bootRight';

export type IronManEffect =
  | 'boot-thrusters'
  | 'palm-thrusters'
  | 'speed-lines'
  | 'flight-shadow'
  | 'palm-charge'
  | 'repulsor-beam'
  | 'muzzle-flash'
  | 'reactor-charge'
  | 'reactor-pulse'
  | 'unibeam'
  | 'energy-rings'
  | 'eye-pulse'
  | 'eye-flash'
  | 'hud-scan'
  | 'standby-pulse'
  | 'clap-spark'
  | 'clap-contact'
  | 'hologram-heart'
  | 'gyro-warning';

export type IronManActionButton = CharacterActionButton<IronManAction>;
export type IronManActionSpec = CharacterActionRecipe<IronManRigPart, IronManEffect>;

const loop = (duration: number) => ({
  duration,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  repeatType: 'loop' as const,
});

const once = (duration: number) => ({
  duration,
  ease: 'easeInOut' as const,
  repeat: 0,
});

const baseActions: readonly IronManActionButton[] = [
  { id: 'idle', label: '装甲戒备', group: '基础表演' },
  { id: 'listening', label: '战术监听', group: '基础表演' },
  { id: 'thinking', label: '战术分析', group: '基础表演' },
  { id: 'speaking', label: '装甲发言', group: '基础表演' },
  { id: 'sleeping', label: '低功耗待机', group: '基础表演' },
  { id: 'greeting', label: '掌心致意', group: '基础表演' },
  { id: 'clap', label: '装甲鼓掌', group: '基础表演' },
  { id: 'wave', label: '单臂招手', group: '基础表演' },
  { id: 'dance', label: '装甲律动', group: '基础表演' },
  { id: 'bounce', label: '推进小跳', group: '基础表演' },
  { id: 'nod', label: '头盔确认', group: '基础表演' },
  { id: 'hearts', label: '掌心全息爱心', group: '基础表演' },
  { id: 'excited', label: '高能兴奋', group: '基础表演' },
  { id: 'surprised', label: '威胁侦测', group: '基础表演' },
  { id: 'happy', label: '自信满意', group: '基础表演' },
  { id: 'fly', label: '喷射飞行', group: '基础表演' },
  { id: 'cheer', label: '推进欢呼', group: '基础表演' },
  { id: 'shake', label: '头盔否定', group: '基础表演' },
  { id: 'dizzy', label: '陀螺仪故障', group: '基础表演' },
  { id: 'shy', label: '尴尬回避', group: '基础表演' },
  { id: 'peek', label: '战术探查', group: '基础表演' },
];

export const IRON_MAN_ACTIONS: readonly IronManActionButton[] = [
  ...baseActions,
  { id: 'repulsor-blast', label: '掌心冲击炮', group: 'Mark 46 技能' },
  { id: 'unibeam', label: '胸口集束炮', group: 'Mark 46 技能' },
];

/**
 * All movement lives in this registry. Mark 46 paths remain in Mark46Rig;
 * adding an action adds a recipe and, when needed, one effect adapter.
 * `spin`, `hero-landing`, and `boost-punch` are intentionally not registered:
 * a front-only artwork cannot make those motions read reliably.
 */
export const IRON_MAN_ACTION_SPECS: Record<Exclude<IronManAction, 'idle' | 'flight'>, IronManActionSpec> = {
  listening: {
    label: '战术监听',
    duration: 2.4,
    loop: true,
    parts: {
      root: { x: [0, -8, -8, 0], y: [0, 3, 3, 0], transition: loop(2.4) },
      torso: { rotate: [0, -7, -7, 0], transition: loop(2.4) },
      head: { rotate: [0, -13, -13, 4, 0], x: [0, -6, -6, 0], transition: loop(2.4) },
      armRight: { rotate: [0, -52, -68, -62, 0], transition: loop(2.4) },
      forearmRight: { rotate: [0, -78, -108, -92, 0], transition: loop(2.4) },
      fistRight: { y: [0, -28, -58, -48, 0], x: [0, -12, -22, -18, 0], transition: loop(2.4) },
    },
    effects: ['hud-scan', 'eye-pulse'],
  },

  thinking: {
    label: '战术分析',
    duration: 2.8,
    loop: true,
    parts: {
      root: { x: [0, 7, 7, 0], y: [0, 4, 4, 0], transition: loop(2.8) },
      torso: { rotate: [0, 8, 8, 0], transition: loop(2.8) },
      head: { rotate: [0, 15, 9, 15, 0], x: [0, 8, 8, 0], transition: loop(2.8) },
      armLeft: { rotate: [0, 42, 52, 48, 0], transition: loop(2.8) },
      forearmLeft: { rotate: [0, 65, 88, 78, 0], transition: loop(2.8) },
      armRight: { rotate: [0, -32, -42, -38, 0], transition: loop(2.8) },
      forearmRight: { rotate: [0, -50, -75, -65, 0], transition: loop(2.8) },
      fistRight: { y: [0, -22, -44, -38, 0], x: [0, -8, -18, -14, 0], transition: loop(2.8) },
    },
    effects: ['hud-scan', 'reactor-pulse'],
  },

  speaking: {
    label: '装甲发言',
    duration: 1.9,
    loop: true,
    parts: {
      root: { y: [0, -2, 0, 2, 0], transition: loop(1.9) },
      torso: { rotate: [0, -5, 4, -4, 0], transition: loop(1.9) },
      head: { rotate: [0, -2, 2, -1, 0], transition: loop(1.9) },
      armLeft: { rotate: [0, 38, 54, 34, 0], transition: loop(1.9) },
      forearmLeft: { rotate: [0, 44, 72, 40, 0], transition: loop(1.9) },
      armRight: { rotate: [0, -12, -22, -10, 0], transition: loop(1.9) },
      forearmRight: { rotate: [0, -18, -38, -16, 0], transition: loop(1.9) },
    },
    effects: ['eye-pulse', 'reactor-pulse'],
  },

  sleeping: {
    label: '低功耗待机',
    duration: 3.8,
    loop: true,
    parts: {
      root: { y: [0, 2, 5, 2, 0], transition: loop(3.8) },
      torso: { rotate: [0, -1, 0], transition: loop(3.8) },
      head: { rotate: [0, 4, 7, 4, 0], y: [0, 2, 5, 2, 0], transition: loop(3.8) },
    },
    effects: ['standby-pulse'],
  },

  greeting: {
    label: '掌心致意',
    duration: 1.6,
    loop: true,
    parts: {
      torso: { rotate: [0, -6, -6, 0], transition: loop(1.6) },
      head: { rotate: [0, -10, -10, 0], transition: loop(1.6) },
      armRight: { rotate: [0, -58, -82, -72, 0], transition: loop(1.6) },
      forearmRight: { rotate: [0, -82, -122, -96, 0], transition: loop(1.6) },
      fistRight: { rotate: [0, -18, 18, -14, 0], y: [0, -25, -55, -45, 0], transition: loop(1.6) },
    },
    effects: ['eye-flash'],
  },

  clap: {
    label: '装甲鼓掌',
    duration: 1.15,
    loop: true,
    parts: {
      root: { y: [0, -2, 0], transition: loop(1.15) },
      armLeft: { rotate: [0, -52, -78, -52, 0], transition: loop(1.15) },
      forearmLeft: { rotate: [0, -70, -110, -70, 0], transition: loop(1.15) },
      fistLeft: { x: [0, 18, 42, 18, 0], y: [0, -10, -24, -10, 0], transition: loop(1.15) },
      armRight: { rotate: [0, 52, 78, 52, 0], transition: loop(1.15) },
      forearmRight: { rotate: [0, 70, 110, 70, 0], transition: loop(1.15) },
      fistRight: { x: [0, -18, -42, -18, 0], y: [0, -10, -24, -10, 0], transition: loop(1.15) },
    },
    effects: ['clap-spark', 'clap-contact', 'reactor-pulse'],
  },

  wave: {
    label: '单臂招手',
    duration: 1.35,
    loop: true,
    parts: {
      armRight: { rotate: [0, -52, -72, -62, 0], transition: loop(1.35) },
      forearmRight: { rotate: [0, -88, -126, -94, 0], transition: loop(1.35) },
      fistRight: { rotate: [0, 28, -30, 25, 0], y: [0, -20, -48, -38, 0], transition: loop(1.35) },
      head: { rotate: [0, 2, -2, 1, 0], transition: loop(1.35) },
    },
    effects: ['eye-pulse'],
  },

  dance: {
    label: '装甲律动',
    duration: 1.05,
    loop: true,
    parts: {
      root: { x: [0, -18, 18, -12, 0], y: [0, -8, 2, -5, 0], rotate: [0, -10, 11, -8, 0], transition: loop(1.05) },
      torso: { rotate: [0, -15, 16, -12, 0], transition: loop(1.05) },
      head: { rotate: [0, 13, -14, 11, 0], transition: loop(1.05) },
      armLeft: { rotate: [0, 62, -42, 48, 0], transition: loop(1.05) },
      forearmLeft: { rotate: [0, 46, -35, 38, 0], transition: loop(1.05) },
      armRight: { rotate: [0, -28, 72, -38, 0], transition: loop(1.05) },
      forearmRight: { rotate: [0, -40, 58, -46, 0], transition: loop(1.05) },
      legLeft: { rotate: [0, 14, -10, 8, 0], transition: loop(1.05) },
      legRight: { rotate: [0, -14, 10, -8, 0], transition: loop(1.05) },
    },
    effects: ['reactor-pulse'],
  },

  bounce: {
    label: '推进小跳',
    duration: 1.1,
    loop: true,
    parts: {
      root: { y: [0, 10, -62, -28, 0], scale: [1, .94, 1.06, 1.02, 1], transition: loop(1.1) },
      torso: { rotate: [0, -2, 2, 0], transition: loop(1.1) },
      legLeft: { rotate: [0, 13, 22, 8, 0], transition: loop(1.1) },
      legRight: { rotate: [0, -13, -22, -8, 0], transition: loop(1.1) },
    },
    effects: ['boot-thrusters', 'flight-shadow'],
  },

  nod: {
    label: '头盔确认',
    duration: 0.92,
    loop: true,
    parts: {
      head: { y: [0, 12, 22, 4, 18, 0], rotate: [0, 7, 13, 2, 10, 0], transition: loop(1.15) },
      torso: { y: [0, 4, 0, 3, 0], rotate: [0, 3, 0, 2, 0], transition: loop(1.15) },
    },
    effects: ['eye-flash'],
  },

  hearts: {
    label: '掌心全息爱心',
    duration: 1.8,
    loop: false,
    parts: {
      root: { x: [0, -2, 0], transition: once(1.8) },
      torso: { rotate: [0, -3, 0], transition: once(1.8) },
      head: { rotate: [0, -5, 0], transition: once(1.8) },
      armRight: { rotate: [0, -16, -28, -22, 0], transition: once(1.8) },
      forearmRight: { rotate: [0, -24, -47, -35, 0], transition: once(1.8) },
      fistRight: { scale: [1, 1.08, 1.12, 1, 1], transition: once(1.8) },
    },
    effects: ['hologram-heart', 'eye-pulse'],
  },

  excited: {
    label: '高能兴奋',
    duration: 0.9,
    loop: true,
    parts: {
      root: { y: [0, -28, -48, -18, 0], rotate: [0, -7, 7, 0], transition: loop(0.9) },
      torso: { rotate: [0, -9, 9, 0], transition: loop(0.9) },
      armLeft: { rotate: [0, 58, 82, 44, 0], transition: loop(0.9) },
      forearmLeft: { rotate: [0, 70, 112, 62, 0], transition: loop(0.9) },
      armRight: { rotate: [0, -58, -82, -44, 0], transition: loop(0.9) },
      forearmRight: { rotate: [0, -70, -112, -62, 0], transition: loop(0.9) },
      fistLeft: { scale: [1, 1.06, 1.13, 1.04, 1], transition: loop(0.9) },
      fistRight: { scale: [1, 1.06, 1.13, 1.04, 1], transition: loop(0.9) },
    },
    effects: ['boot-thrusters', 'reactor-pulse', 'eye-flash'],
  },

  surprised: {
    label: '威胁侦测',
    duration: 1.2,
    loop: true,
    parts: {
      root: { x: [0, -18, -18, 0], y: [0, 16, -8, 0], scale: [1, .92, 1.07, 1], transition: loop(1.45) },
      torso: { rotate: [0, 12, -5, 0], transition: loop(1.45) },
      head: { y: [0, -10, -10, 0], rotate: [0, -17, 8, 0], transition: loop(1.45) },
      armLeft: { rotate: [0, 48, 70, 0], transition: loop(1.45) },
      forearmLeft: { rotate: [0, 58, 92, 0], transition: loop(1.45) },
      armRight: { rotate: [0, -48, -70, 0], transition: loop(1.45) },
      forearmRight: { rotate: [0, -58, -92, 0], transition: loop(1.45) },
    },
    effects: ['eye-flash', 'palm-thrusters'],
  },

  happy: {
    label: '自信满意',
    duration: 1.8,
    loop: true,
    parts: {
      root: { y: [0, -6, -6, 0], scale: [1, 1.03, 1.03, 1], transition: loop(1.8) },
      torso: { rotate: [0, -3, 3, 0], transition: loop(1.8) },
      head: { rotate: [0, -6, 2, 0], y: [0, -3, -3, 0], transition: loop(1.8) },
      armLeft: { rotate: [0, 24, 38, 30, 0], transition: loop(1.8) },
      forearmLeft: { rotate: [0, 36, 54, 42, 0], transition: loop(1.8) },
      armRight: { rotate: [0, -24, -38, -30, 0], transition: loop(1.8) },
      forearmRight: { rotate: [0, -36, -54, -42, 0], transition: loop(1.8) },
    },
    effects: ['reactor-pulse', 'eye-pulse'],
  },

  fly: {
    label: '喷射飞行',
    duration: 1.8,
    loop: true,
    parts: {
      root: { y: [8, -20, -14, 8], rotate: [0, -5, -2, 0], transition: loop(1.8) },
      torso: { rotate: [0, -3, 2, 0], transition: loop(1.8) },
      armLeft: { rotate: [0, 18, 12, 0], transition: loop(1.8) },
      armRight: { rotate: [0, -18, -12, 0], transition: loop(1.8) },
      legLeft: { rotate: [0, 5, 2, 0], transition: loop(1.8) },
      legRight: { rotate: [0, -5, -2, 0], transition: loop(1.8) },
    },
    effects: ['boot-thrusters', 'palm-thrusters', 'speed-lines', 'flight-shadow'],
  },

  cheer: {
    label: '推进欢呼',
    duration: 0.95,
    loop: true,
    parts: {
      root: { y: [0, -22, -42, -14, 0], x: [0, -8, 0, 6, 0], transition: loop(0.95) },
      torso: { rotate: [0, -3, 3, 0], transition: loop(0.95) },
      armRight: { rotate: [0, -66, -92, -74, 0], transition: loop(0.95) },
      forearmRight: { rotate: [0, -92, -132, -104, 0], transition: loop(0.95) },
      fistRight: { y: [0, -25, -55, -42, 0], transition: loop(0.95) },
      armLeft: { rotate: [0, 28, 42, 20, 0], transition: loop(0.95) },
    },
    effects: ['boot-thrusters', 'reactor-pulse', 'eye-flash'],
  },

  shake: {
    label: '头盔否定',
    duration: 0.62,
    loop: true,
    parts: {
      head: { x: [0, -18, 18, -18, 18, 0], rotate: [0, -12, 12, -12, 12, 0], transition: loop(.82) },
      torso: { rotate: [0, -4, 4, -4, 4, 0], transition: loop(.82) },
    },
    effects: ['eye-pulse'],
  },

  dizzy: {
    label: '陀螺仪故障',
    duration: 1.7,
    loop: true,
    parts: {
      root: { x: [0, -7, 8, -8, 7, 0], rotate: [0, 5, -6, 6, -5, 0], transition: loop(1.7) },
      torso: { rotate: [0, 8, -8, 7, -6, 0], transition: loop(1.7) },
      head: { x: [0, 6, -7, 7, -5, 0], rotate: [0, -10, 12, -10, 8, 0], transition: loop(1.7) },
      armLeft: { rotate: [0, 8, -7, 8, -6, 0], transition: loop(1.7) },
      armRight: { rotate: [0, -8, 7, -8, 6, 0], transition: loop(1.7) },
    },
    effects: ['gyro-warning', 'eye-flash'],
  },

  shy: {
    label: '尴尬回避',
    duration: 2.1,
    loop: true,
    parts: {
      root: { x: [0, 12, 12, 0], y: [0, 10, 10, 0], scale: [1, .94, .94, 1], transition: loop(2.1) },
      torso: { rotate: [0, 13, 13, 0], transition: loop(2.1) },
      head: { x: [0, 10, 10, 0], rotate: [0, 18, 18, 0], y: [0, 8, 8, 0], transition: loop(2.1) },
      armLeft: { rotate: [0, 55, 68, 0], transition: loop(2.1) },
      forearmLeft: { rotate: [0, 76, 105, 0], transition: loop(2.1) },
      armRight: { rotate: [0, -55, -68, 0], transition: loop(2.1) },
      forearmRight: { rotate: [0, -76, -105, 0], transition: loop(2.1) },
      fistLeft: { y: [0, -22, -48, 0], x: [0, 12, 22, 0], transition: loop(2.1) },
      fistRight: { y: [0, -22, -48, 0], x: [0, -12, -22, 0], transition: loop(2.1) },
    },
    effects: ['eye-pulse'],
  },

  peek: {
    label: '战术探查',
    duration: 1.45,
    loop: true,
    parts: {
      root: { x: [0, -15, 15, -15, 0], transition: loop(1.45) },
      torso: { rotate: [0, -8, 8, -7, 0], transition: loop(1.45) },
      head: { x: [0, -13, 13, -12, 0], rotate: [0, -10, 10, -9, 0], transition: loop(1.45) },
      armLeft: { rotate: [0, 8, 18, 8, 0], transition: loop(1.45) },
      armRight: { rotate: [0, -22, -36, -22, 0], transition: loop(1.45) },
    },
    effects: ['hud-scan', 'eye-pulse'],
  },

  'repulsor-blast': {
    label: '掌心冲击炮',
    duration: 1.45,
    loop: false,
    parts: {
      root: { x: [0, -3, -7, 0], rotate: [0, 0, -4, 0], transition: once(1.45) },
      torso: { rotate: [0, 2, -3, 0], transition: once(1.45) },
      armRight: { rotate: [0, -24, -46, -36], transition: once(1.45) },
      forearmRight: { rotate: [0, -35, -62, -50], transition: once(1.45) },
      fistRight: { scale: [1, 1.08, 1.18, 1.06], transition: once(1.45) },
      armLeft: { rotate: [0, 8, 5, 0], transition: once(1.45) },
    },
    effects: ['palm-charge', 'repulsor-beam', 'muzzle-flash'],
  },

  unibeam: {
    label: '胸口集束炮',
    duration: 1.8,
    loop: false,
    parts: {
      root: { y: [0, 3, 0, -2, 0], scale: [1, 1.02, 1.04, 1.01, 1], transition: once(1.8) },
      torso: { rotate: [0, -2, 2, -1, 0], transition: once(1.8) },
      armLeft: { rotate: [0, 30, 42, 34, 0], transition: once(1.8) },
      armRight: { rotate: [0, -30, -42, -34, 0], transition: once(1.8) },
      forearmLeft: { rotate: [0, -12, -20, -14, 0], transition: once(1.8) },
      forearmRight: { rotate: [0, 12, 20, 14, 0], transition: once(1.8) },
    },
    effects: ['reactor-charge', 'unibeam', 'energy-rings'],
  },
};

export function isIronManAction(value: string): value is IronManAction {
  return value === 'idle' || value === 'flight' || value in IRON_MAN_ACTION_SPECS;
}
