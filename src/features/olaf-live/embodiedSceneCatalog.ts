import type { EmbodiedTurnIntent } from './embodiedInteraction';

export interface EmbodiedDemoScene {
  label: string;
  emoji: string;
  intent: EmbodiedTurnIntent;
}

/**
 * Data-only examples for the lab. A new scene normally belongs here; the
 * compiler chooses the motion grammar from the prop's affordances.
 */
export const EMBODIED_DEMO_SCENES: EmbodiedDemoScene[] = [
  { label: '拿苹果', emoji: '🍎', intent: { dramaticGoal: 'discover', teachingGoal: 'introduce', concept: 'apple', objectAction: 'show', expectedResponse: 'none', intensity: 2 } },
  { label: '拿香蕉', emoji: '🍌', intent: { dramaticGoal: 'invite', teachingGoal: 'introduce', concept: 'banana', objectAction: 'show', expectedResponse: 'none', intensity: 2 } },
  { label: '戴圣诞帽', emoji: '🎅', intent: { dramaticGoal: 'celebrate', teachingGoal: 'use', concept: 'christmas hat', objectAction: 'wear', expectedResponse: 'none', intensity: 3 } },
  { label: '吃蛋糕', emoji: '🍰', intent: { dramaticGoal: 'play', teachingGoal: 'use', concept: 'cake', objectAction: 'eat', expectedResponse: 'none', intensity: 3 } },
  { label: '拆礼物', emoji: '🎁', intent: { dramaticGoal: 'discover', teachingGoal: 'use', concept: 'gift', objectAction: 'open', expectedResponse: 'none', intensity: 3 } },
  { label: '闻花花', emoji: '🌸', intent: { dramaticGoal: 'discover', teachingGoal: 'recognize', concept: 'flower', objectAction: 'smell', expectedResponse: 'none', intensity: 2 } },
  { label: '读绘本', emoji: '📖', intent: { dramaticGoal: 'discover', teachingGoal: 'recognize', concept: 'book', objectAction: 'read', expectedResponse: 'none', intensity: 2 } },
  { label: '打伞转圈', emoji: '☂️', intent: { dramaticGoal: 'play', teachingGoal: 'use', concept: 'umbrella', objectAction: 'play', expectedResponse: 'none', intensity: 3 } },
  { label: '刷牙练习', emoji: '🪥', intent: { dramaticGoal: 'invite', teachingGoal: 'use', concept: 'toothbrush', objectAction: 'play', expectedResponse: 'none', intensity: 2 } },
  { label: '玩足球', emoji: '⚽', intent: { dramaticGoal: 'play', teachingGoal: 'use', concept: 'ball', objectAction: 'play', expectedResponse: 'none', intensity: 3 } },
  { label: '接气球', emoji: '🎈', intent: { dramaticGoal: 'invite', teachingGoal: 'use', concept: 'balloon', objectAction: 'play', expectedResponse: 'none', intensity: 3 } },
  { label: '吹泡泡', emoji: '🫧', intent: { dramaticGoal: 'play', teachingGoal: 'use', concept: 'bubbles', objectAction: 'play', expectedResponse: 'none', intensity: 3 } },
];
