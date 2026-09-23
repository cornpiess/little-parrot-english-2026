import type { CharacterActionButton } from './actionRecipe';

export type CharacterLocomotion = 'ground' | 'air';
export type CharacterAnchor = 'left-hand' | 'right-hand' | 'head' | 'chest' | 'stage';
export type CharacterExpressionChannel = 'body' | 'light' | 'thruster' | 'voice';

/** Capabilities let an adventure director choose actions the character can actually show. */
export interface CharacterCapabilities {
  locomotion: readonly CharacterLocomotion[];
  anchors: readonly CharacterAnchor[];
  expressions: readonly CharacterExpressionChannel[];
  hasMouthAnimation: boolean;
}

export interface CharacterProfile<ActionId extends string = string> {
  id: string;
  capabilities: CharacterCapabilities;
  actions: readonly CharacterActionButton<ActionId>[];
}
