import type { AttentionTarget, CharacterPresence } from './rig';

export interface SocialGazeInput {
  timestampMs: number;
  presence: CharacterPresence;
  attention: AttentionTarget;
}

export interface SocialGazeSample {
  eyeX: number;
  eyeY: number;
  headX: number;
  headY: number;
  contact: number;
  shiftBlink: number;
}

interface GazeTiming {
  cycleMs: number;
  contactRatio: number;
  horizontal: number;
  vertical: number;
  headFollow: number;
}

const timings: Record<CharacterPresence, GazeTiming> = {
  listening: { cycleMs: 5_200, contactRatio: 0.74, horizontal: 0.28, vertical: 0.1, headFollow: 0.22 },
  speaking: { cycleMs: 4_600, contactRatio: 0.6, horizontal: 0.34, vertical: 0.12, headFollow: 0.28 },
  idle: { cycleMs: 6_200, contactRatio: 0.43, horizontal: 0.38, vertical: 0.14, headFollow: 0.3 },
  thinking: { cycleMs: 5_700, contactRatio: 0.24, horizontal: 0.46, vertical: 0.3, headFollow: 0.44 },
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, weight: number) => from + (to - from) * weight;
const smoothstep = (from: number, to: number, value: number) => {
  const progress = clamp01((value - from) / Math.max(0.0001, to - from));
  return progress * progress * (3 - 2 * progress);
};

function cycleVariation(cycle: number, salt: number) {
  const value = Math.sin((cycle + 1) * 12.9898 + salt * 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

function transitionBlink(phase: number, point: number, width = 0.035) {
  const distance = Math.abs(phase - point);
  return clamp01(1 - distance / width);
}

/**
 * Decides when an actor meets the child's gaze and when they naturally avert it.
 * Face tracking supplies only the child-relative target; this policy owns the
 * conversational timing so camera tracking never becomes an unbroken stare.
 */
export function sampleSocialGaze({ timestampMs, presence, attention }: SocialGazeInput): SocialGazeSample {
  if (attention.focus !== 'user') {
    return {
      eyeX: attention.x,
      eyeY: attention.y,
      headX: attention.x,
      headY: attention.y,
      contact: 0,
      shiftBlink: 0,
    };
  }

  const timing = timings[presence];
  const safeTimestamp = Math.max(0, timestampMs);
  const cycle = Math.floor(safeTimestamp / timing.cycleMs);
  const phase = (safeTimestamp % timing.cycleMs) / timing.cycleMs;
  const feather = 0.1;
  const leaveChild = smoothstep(timing.contactRatio - feather, timing.contactRatio + feather, phase);
  const returnToChild = 1 - smoothstep(1 - feather * 1.2, 1, phase);
  const aversion = leaveChild * returnToChild;
  const side = cycleVariation(cycle, 1) > 0.5 ? 1 : -1;
  const horizontalScale = 0.82 + cycleVariation(cycle, 2) * 0.34;
  const verticalScale = 0.68 + cycleVariation(cycle, 3) * 0.5;
  const verticalDirection = presence === 'thinking' ? 1 : (cycleVariation(cycle, 4) > 0.68 ? 1 : -0.45);
  const awayX = side * timing.horizontal * horizontalScale;
  const awayY = timing.vertical * verticalScale * verticalDirection;
  const contact = 1 - aversion;
  const headAversion = aversion * timing.headFollow;

  return {
    eyeX: mix(attention.x, awayX, aversion),
    eyeY: mix(attention.y, awayY, aversion),
    headX: mix(attention.x, awayX, headAversion),
    headY: mix(attention.y, awayY, headAversion),
    contact,
    shiftBlink: Math.max(
      transitionBlink(phase, timing.contactRatio),
      transitionBlink(phase, 1 - feather * 0.45),
    ),
  };
}
