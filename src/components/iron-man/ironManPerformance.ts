import type { TargetAndTransition } from 'motion/react';
import type { CharacterPerformanceFrame } from '../../features/character-performance/types';
import type { IronManRigPart } from './ironManActions';

export interface IronManVisualSignals {
  eyeGlow: number;
  eyePulse: number;
  reactorGlow: number;
  reactorPulse: number;
  palmThrust: number;
  bootThrust: number;
  hudScan: number;
  stabilityWarning: number;
}

export interface IronManVisualFrame {
  parts: Partial<Record<IronManRigPart, TargetAndTransition>>;
  signals: IronManVisualSignals;
}

export interface IronManAnchorPosition {
  x: number;
  y: number;
  depth: number;
}

export type IronManAnchorMap = Record<'left-hand' | 'right-hand' | 'head' | 'chest' | 'stage', IronManAnchorPosition>;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
const signed = (value: number) => clamp(value, -1, 1);
const instant = (values: Record<string, number>): TargetAndTransition => ({ ...values, transition: { duration: 0 } });

/**
 * Retarget the character-agnostic body frame into Mark 46's articulated
 * parts. This is the character seam: Olaf can consume the same frame with a
 * face adapter while Iron Man uses lights, propulsion and armour tension.
 */
export function adaptPerformanceToIronMan(frame: CharacterPerformanceFrame): IronManVisualFrame {
  const { head, torso, leftArm, rightArm, root, dynamics, affect, attention } = frame;
  const energy = clamp(dynamics.motionEnergy);
  const speech = clamp(dynamics.speechPulse);
  const arousal = clamp(affect.arousal);
  const distress = clamp((1 - affect.valence) * 0.5);
  const speaking = frame.presence === 'speaking' || speech > 0.03;

  return {
    parts: {
      root: instant({
        // Stage translation is applied by the actor wrapper. Keep only a
        // small local sway here so a character never moves twice.
        x: signed(root.x) * 8,
        y: -clamp(root.elevation) * 28,
        rotate: signed(root.heading) * 12,
      }),
      torso: instant({
        x: signed(torso.twist) * 7,
        y: -signed(torso.rise) * 6,
        rotate: signed(torso.leanX) * 8 + signed(torso.twist) * 5,
        scale: 1 + signed(torso.squash) * 0.035,
      }),
      head: instant({
        x: signed(head.yaw) * 12,
        y: signed(head.pitch) * 10,
        rotate: signed(head.roll) * 12,
      }),
      armLeft: instant({
        x: signed(leftArm.crossBody) * 5,
        rotate: signed(leftArm.shoulderLift) * 28 - signed(leftArm.shoulderOpen) * 11,
      }),
      forearmLeft: instant({
        rotate: signed(leftArm.reach) * 18 - leftArm.elbowBend * 16,
      }),
      fistLeft: instant({
        rotate: signed(leftArm.handOpen - 0.35) * 12,
        scale: 1 + clamp(leftArm.handOpen) * 0.035,
      }),
      armRight: instant({
        x: signed(rightArm.crossBody) * 5,
        rotate: signed(rightArm.shoulderLift) * 28 + signed(rightArm.shoulderOpen) * 11,
      }),
      forearmRight: instant({
        rotate: signed(rightArm.reach) * 18 - rightArm.elbowBend * 16,
      }),
      fistRight: instant({
        rotate: signed(rightArm.handOpen - 0.35) * 12,
        scale: 1 + clamp(rightArm.handOpen) * 0.035,
      }),
      legLeft: instant({ rotate: signed(root.stride) * 12 }),
      legRight: instant({ rotate: -signed(root.stride) * 12 }),
    },
    signals: {
      // Mark 46 never changes a mouth shape. Speech is carried by the eye
      // strips first and the reactor second, just like a helmeted machine.
      eyeGlow: clamp(0.58 + (speaking ? 0.22 : 0) + energy * 0.12 - distress * 0.16),
      eyePulse: speaking ? clamp(speech * 0.92 + 0.12) : clamp(energy * 0.18),
      reactorGlow: clamp(0.7 + affect.valence * 0.08 + energy * 0.16 - distress * 0.12),
      reactorPulse: clamp(speech * 0.42 + energy * 0.34 + arousal * 0.12),
      palmThrust: clamp(root.elevation * 0.48 + root.travel * 0.22),
      bootThrust: clamp(root.elevation * 0.86 + root.travel * 0.18),
      hudScan: clamp((attention.focus === 'object' ? 0.72 : 0) + (frame.presence === 'thinking' ? 0.55 : 0)),
      stabilityWarning: clamp(distress * 0.72 + Math.abs(root.heading) * 0.18),
    },
  };
}

/** Normalised attachment points for props and future adventure interactions. */
export function getIronManAnchorPositions(frame: CharacterPerformanceFrame): IronManAnchorMap {
  const { root, head, torso, leftArm, rightArm } = frame;
  return {
    'left-hand': {
      x: -0.34 - leftArm.reach * 0.08,
      y: 0.38 - leftArm.shoulderLift * 0.16,
      depth: root.depth - 0.04,
    },
    'right-hand': {
      x: 0.34 + rightArm.reach * 0.08,
      y: 0.38 - rightArm.shoulderLift * 0.16,
      depth: root.depth - 0.04,
    },
    head: {
      x: root.x + head.yaw * 0.06,
      y: -0.44 + head.pitch * 0.06,
      depth: root.depth,
    },
    chest: {
      x: root.x + torso.twist * 0.04,
      y: 0.02 - torso.rise * 0.04,
      depth: root.depth,
    },
    stage: { x: root.x, y: 0.5 - root.elevation * 0.1, depth: root.depth },
  };
}
