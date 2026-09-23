import type { SceneObjectAction, SceneObjectAnchor, SceneObjectGrip } from './embodiedInteraction';

export type PropAffordance =
  | 'graspable'
  | 'wearable'
  | 'edible'
  | 'openable'
  | 'readable'
  | 'smellable'
  | 'rollable'
  | 'floatable'
  | 'mouth-target';

export type PlayMotion = 'hold' | 'ground-roll' | 'float' | 'mouth';
export type PlayExit = 'hold' | 'land' | 'drift';
export interface PlayProfile { cycleMs: number; cycles: number; exit: PlayExit }
export type PropVisual = 'emoji' | 'christmas-hat';

export interface PropDefinition {
  aliases: string[];
  label: string;
  emoji: string;
  kind: string;
  visual: PropVisual;
  visualScale: number;
  capabilities: SceneObjectAction[];
  defaultAnchor: SceneObjectAnchor;
  defaultGrip: SceneObjectGrip;
  affordances: PropAffordance[];
  playMotion: PlayMotion;
  playProfile?: PlayProfile;
  playLine?: string;
}

export const PROP_CATALOG: PropDefinition[] = [
  { aliases: ['apple', '苹果'], label: 'APPLE', emoji: '🍎', kind: 'apple', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'eat', 'place', 'play'], defaultAnchor: 'right-hand', defaultGrip: 'right', affordances: ['graspable', 'edible'], playMotion: 'hold' },
  { aliases: ['banana', '香蕉'], label: 'BANANA', emoji: '🍌', kind: 'banana', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'eat', 'place', 'play'], defaultAnchor: 'right-hand', defaultGrip: 'right', affordances: ['graspable', 'edible'], playMotion: 'hold' },
  { aliases: ['cake', '蛋糕', '糕点'], label: 'CAKE', emoji: '🍰', kind: 'cake', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'eat', 'place'], defaultAnchor: 'both-hands', defaultGrip: 'both', affordances: ['graspable', 'edible'], playMotion: 'hold' },
  { aliases: ['christmas hat', 'santa hat', '圣诞帽', '帽子'], label: 'HAT', emoji: '🎅', kind: 'christmas-hat', visual: 'christmas-hat', visualScale: 94, capabilities: ['show', 'offer', 'wear', 'place'], defaultAnchor: 'head', defaultGrip: 'right', affordances: ['graspable', 'wearable'], playMotion: 'hold' },
  { aliases: ['gift', 'present', '礼物'], label: 'GIFT', emoji: '🎁', kind: 'gift', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'open', 'place'], defaultAnchor: 'both-hands', defaultGrip: 'both', affordances: ['graspable', 'openable'], playMotion: 'hold' },
  { aliases: ['flower', '花'], label: 'FLOWER', emoji: '🌸', kind: 'flower', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'smell', 'place'], defaultAnchor: 'right-hand', defaultGrip: 'right', affordances: ['graspable', 'smellable'], playMotion: 'hold' },
  { aliases: ['book', '书'], label: 'BOOK', emoji: '📖', kind: 'book', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'read', 'place'], defaultAnchor: 'both-hands', defaultGrip: 'both', affordances: ['graspable', 'readable'], playMotion: 'hold' },
  { aliases: ['umbrella', '伞', '雨伞'], label: 'UMBRELLA', emoji: '☂️', kind: 'umbrella', visual: 'emoji', visualScale: 105, capabilities: ['show', 'place', 'play'], defaultAnchor: 'right-hand', defaultGrip: 'right', affordances: ['graspable'], playMotion: 'hold', playProfile: { cycleMs: 780, cycles: 3, exit: 'hold' } },
  { aliases: ['toothbrush', '牙刷'], label: 'TOOTHBRUSH', emoji: '🪥', kind: 'toothbrush', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'play'], defaultAnchor: 'right-hand', defaultGrip: 'right', affordances: ['graspable', 'mouth-target'], playMotion: 'mouth', playProfile: { cycleMs: 700, cycles: 4, exit: 'hold' }, playLine: 'Brush, brush! Clean teeth!' },
  { aliases: ['ball', '球'], label: 'BALL', emoji: '⚽', kind: 'ball', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'place', 'play'], defaultAnchor: 'right-hand', defaultGrip: 'right', affordances: ['graspable', 'rollable'], playMotion: 'ground-roll', playProfile: { cycleMs: 760, cycles: 4, exit: 'land' }, playLine: 'Kick, kick, kick! Goal!' },
  { aliases: ['balloon', '气球'], label: 'BALLOON', emoji: '🎈', kind: 'balloon', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'play'], defaultAnchor: 'right-hand', defaultGrip: 'right', affordances: ['graspable', 'floatable'], playMotion: 'float', playProfile: { cycleMs: 920, cycles: 3, exit: 'drift' }, playLine: 'Catch it! Up, up, up!' },
  { aliases: ['bubble', 'bubbles', '泡泡'], label: 'BUBBLES', emoji: '🫧', kind: 'bubbles', visual: 'emoji', visualScale: 94, capabilities: ['show', 'offer', 'play'], defaultAnchor: 'right-hand', defaultGrip: 'right', affordances: ['graspable', 'floatable'], playMotion: 'float', playProfile: { cycleMs: 850, cycles: 4, exit: 'drift' }, playLine: 'Blow, blow... pop, pop, pop!' },
];

const genericDefinition = (concept: string, emoji?: string): PropDefinition => ({
  aliases: [concept], label: concept.trim().toUpperCase() || 'OBJECT', emoji: isSafeSceneEmoji(emoji) ? emoji!.trim() : '🔹', kind: 'emoji-object', visual: 'emoji', visualScale: 94,
  capabilities: ['show', 'offer', 'place'], defaultAnchor: 'right-hand', defaultGrip: 'right', affordances: ['graspable'], playMotion: 'hold',
});

export function isSafeSceneEmoji(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim() || /[<>"'`/]/.test(value)) return false;
  return Array.from(value.trim()).length <= 4;
}

export function resolvePropDefinition(concept: string, emoji?: string): PropDefinition {
  const normalized = concept.trim().toLowerCase();
  const exact = PROP_CATALOG.find(({ aliases }) => aliases.some((alias) => normalized === alias));
  const definition = exact ?? PROP_CATALOG.find(({ aliases }) => aliases.some((alias) => normalized.includes(alias)));
  if (!definition) return genericDefinition(concept, emoji);
  return isSafeSceneEmoji(emoji) ? { ...definition, emoji: emoji.trim() } : definition;
}
