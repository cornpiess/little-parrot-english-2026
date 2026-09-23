import type { TargetAndTransition } from 'motion/react';

export type PerformanceBeatRole = 'anticipation' | 'action' | 'reaction' | 'settle';

/** A reusable recipe shared by gallery playback and future live directors. */
export interface CharacterActionRecipe<Part extends string, Effect extends string> {
  label: string;
  duration: number;
  loop: boolean;
  parts: Partial<Record<Part, TargetAndTransition>>;
  effects: readonly Effect[];
  beats?: readonly PerformanceBeatRole[];
}

export interface CharacterActionButton<Id extends string = string> {
  id: Id;
  label: string;
  group: string;
}

export function hasAction<Id extends string>(actions: readonly CharacterActionButton<Id>[], value: string): value is Id {
  return actions.some((action) => action.id === value);
}
