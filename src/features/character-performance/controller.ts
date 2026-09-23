import {
  createRealtimePerformanceModel,
  type RealtimePerformanceModel,
} from '../olaf-live/performanceModel';
import type { CharacterRigFrame, PerformanceInput } from '../olaf-live/rig';
import type { CharacterPerformanceFrame } from './types';

export type CharacterPerformanceInput = PerformanceInput;

export interface CharacterPerformanceController {
  ingest(...inputs: CharacterPerformanceInput[]): void;
  advance(timestampMs: number): CharacterPerformanceFrame;
  reset(timestampMs?: number): CharacterPerformanceFrame;
}

/**
 * The shared clock used by gallery previews, live speech and future adventure
 * scenes. Olaf's face/tear channels are projected out at this seam; each
 * character adapter decides how to express the remaining continuous signals.
 */
export function createCharacterPerformanceController(
  source: RealtimePerformanceModel = createRealtimePerformanceModel(),
): CharacterPerformanceController {
  const project = (frame: CharacterRigFrame): CharacterPerformanceFrame => ({
    timestampMs: frame.timestampMs,
    presence: frame.presence,
    affect: frame.affect,
    attention: frame.attention,
    head: frame.head,
    torso: frame.torso,
    leftArm: frame.leftArm,
    rightArm: frame.rightArm,
    root: frame.root,
    dynamics: frame.dynamics,
  });

  return {
    ingest: (...inputs) => source.ingest(...inputs),
    advance: (timestampMs) => project(source.advance(timestampMs)),
    reset: (timestampMs) => project(source.reset(timestampMs)),
  };
}
