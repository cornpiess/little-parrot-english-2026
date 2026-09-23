import type { CharacterActionButton, CharacterActionRecipe } from '../../features/character-performance/actionRecipe';

export type BuzzAction =
  | 'idle' | 'standing' | 'akimbo' | 'listening' | 'thinking' | 'speaking'
  | 'greeting' | 'wave' | 'clap' | 'nod' | 'shake' | 'surprised' | 'happy'
  | 'communicator' | 'scan' | 'wings-deploy' | 'fly' | 'wrist-laser';

export type BuzzPose = 'standing' | 'akimbo' | 'listen' | 'talk' | 'wave' | 'clap' | 'surprised' | 'communicator' | 'scan' | 'laser' | 'fly';
export type BuzzEffect = 'blink' | 'speech-mouth' | 'wing-pulse' | 'jet-flame' | 'laser-beam' | 'scanner' | 'radio-pulse' | 'badge-glow';
export type BuzzActionSpec = CharacterActionRecipe<string, BuzzEffect> & { pose: BuzzPose; wings?: 'folded' | 'deployed' };

const base: readonly CharacterActionButton<BuzzAction>[] = [
  { id: 'idle', label: '自然站立', group: '基础姿态' },
  { id: 'standing', label: '自然垂手', group: '基础姿态' },
  { id: 'akimbo', label: '英雄叉腰', group: '基础姿态' },
  { id: 'listening', label: '认真倾听', group: '交流表情' },
  { id: 'thinking', label: '腕部思考', group: '交流表情' },
  { id: 'speaking', label: '讲话口型', group: '交流表情' },
  { id: 'greeting', label: '太空敬礼', group: '交流表情' },
  { id: 'wave', label: '五指招手', group: '交流表情' },
  { id: 'clap', label: '胸前拍手', group: '交流表情' },
  { id: 'nod', label: '确认点头', group: '交流表情' },
  { id: 'shake', label: '摇头否定', group: '交流表情' },
  { id: 'surprised', label: '惊讶后退', group: '情绪动作' },
  { id: 'happy', label: '双臂庆祝', group: '情绪动作' },
  { id: 'communicator', label: '通讯报告', group: '太空骑警' },
  { id: 'scan', label: '腕部扫描', group: '太空骑警' },
  { id: 'wings-deploy', label: '展开双翼', group: '飞行能力' },
  { id: 'fly', label: '双翼飞行', group: '飞行能力' },
  { id: 'wrist-laser', label: '腕部激光', group: '太空骑警' },
];

export const BUZZ_ACTIONS = base;
export const BUZZ_ACTION_SPECS: Partial<Record<BuzzAction, BuzzActionSpec>> = {
  idle: { label: '自然站立', duration: 2.4, loop: true, pose: 'standing', parts: {}, effects: ['blink'], beats: ['anticipation', 'settle'] },
  standing: { label: '自然垂手', duration: 1, loop: false, pose: 'standing', parts: {}, effects: ['blink'], beats: ['anticipation', 'settle'] },
  akimbo: { label: '英雄叉腰', duration: 1.4, loop: true, pose: 'akimbo', parts: {}, effects: ['blink', 'badge-glow'], beats: ['anticipation', 'action', 'settle'] },
  listening: { label: '认真倾听', duration: 2.4, loop: true, pose: 'listen', parts: {}, effects: ['blink', 'radio-pulse'], beats: ['anticipation', 'action', 'settle'] },
  thinking: { label: '腕部思考', duration: 2.8, loop: true, pose: 'scan', parts: {}, effects: ['blink', 'scanner'], beats: ['anticipation', 'action', 'settle'] },
  speaking: { label: '讲话口型', duration: 1.5, loop: true, pose: 'talk', parts: {}, effects: ['blink', 'speech-mouth', 'badge-glow'], beats: ['anticipation', 'action', 'settle'] },
  greeting: { label: '太空敬礼', duration: 1.25, loop: false, pose: 'communicator', parts: {}, effects: ['blink', 'radio-pulse'], beats: ['anticipation', 'action', 'settle'] },
  wave: { label: '五指招手', duration: 1.25, loop: true, pose: 'wave', parts: {}, effects: ['blink'], beats: ['anticipation', 'action', 'settle'] },
  clap: { label: '胸前拍手', duration: 1.05, loop: true, pose: 'clap', parts: {}, effects: ['blink', 'badge-glow'], beats: ['anticipation', 'action', 'reaction', 'settle'] },
  nod: { label: '确认点头', duration: .85, loop: false, pose: 'standing', parts: {}, effects: ['blink', 'badge-glow'], beats: ['anticipation', 'action', 'settle'] },
  shake: { label: '摇头否定', duration: .7, loop: true, pose: 'standing', parts: {}, effects: ['blink'], beats: ['action', 'settle'] },
  surprised: { label: '惊讶后退', duration: 1.2, loop: false, pose: 'surprised', parts: {}, effects: ['blink', 'badge-glow'], beats: ['anticipation', 'action', 'reaction', 'settle'] },
  happy: { label: '双臂庆祝', duration: 1.1, loop: true, pose: 'surprised', parts: {}, effects: ['blink', 'badge-glow'], beats: ['anticipation', 'action', 'settle'] },
  communicator: { label: '通讯报告', duration: 2.2, loop: true, pose: 'communicator', parts: {}, effects: ['blink', 'speech-mouth', 'radio-pulse'], beats: ['anticipation', 'action', 'settle'] },
  scan: { label: '腕部扫描', duration: 2, loop: true, pose: 'scan', parts: {}, effects: ['blink', 'scanner'], beats: ['anticipation', 'action', 'settle'] },
  'wings-deploy': { label: '展开双翼', duration: 1.5, loop: false, pose: 'standing', wings: 'deployed', parts: {}, effects: ['blink', 'wing-pulse'], beats: ['anticipation', 'action', 'settle'] },
  fly: { label: '双翼飞行', duration: 1.8, loop: true, pose: 'fly', wings: 'deployed', parts: {}, effects: ['blink', 'wing-pulse'], beats: ['anticipation', 'action', 'settle'] },
  'wrist-laser': { label: '腕部激光', duration: 1.5, loop: false, pose: 'laser', parts: {}, effects: ['blink', 'laser-beam'], beats: ['anticipation', 'action', 'reaction', 'settle'] },
};

export function isBuzzAction(value: string): value is BuzzAction {
  return BUZZ_ACTIONS.some(({ id }) => id === value);
}
