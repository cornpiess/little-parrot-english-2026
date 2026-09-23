/**
 * Character-agnostic performance seam.
 *
 * The Olaf implementation still owns the source rig types for compatibility,
 * but this frame deliberately contains only signals every articulated
 * character can understand. Face blendshapes, tears and other character-local
 * details stay behind an adapter.
 */
import type {
  AffectVector,
  ArmRig,
  AttentionTarget,
  CharacterPresence,
  HeadRig,
  RootMotionRig,
  TorsoRig,
} from '../olaf-live/rig';

export interface CharacterPerformanceDynamics {
  breath: number;
  motionEnergy: number;
  speechPulse: number;
  anticipation: number;
  actionAccent: number;
  followThrough: number;
  settle: number;
  hold: number;
}

export interface CharacterPerformanceFrame {
  timestampMs: number;
  presence: CharacterPresence;
  affect: AffectVector;
  attention: AttentionTarget;
  head: HeadRig;
  torso: TorsoRig;
  leftArm: ArmRig;
  rightArm: ArmRig;
  root: RootMotionRig;
  dynamics: CharacterPerformanceDynamics;
}
