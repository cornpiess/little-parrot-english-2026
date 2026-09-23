export type CharacterPresence = 'idle' | 'listening' | 'thinking' | 'speaking';
export type AttentionFocus = 'user' | 'object' | 'away';
export type DramaticObjective = 'celebrate' | 'comfort' | 'invite' | 'discover' | 'reassure' | 'play' | 'listen';

export interface AffectVector {
  valence: number;
  arousal: number;
  dominance: number;
}

export interface MovementIntent {
  energy: number;
  openness: number;
  verticality: number;
  forward: number;
  asymmetry: number;
  beat: number;
}

export interface PerformancePhrasing {
  anticipation: number;
  action: number;
  reaction: number;
  settle: number;
  hold: number;
}

export interface VoiceFeatures {
  speaking: boolean;
  energy: number;
  brightness: number;
  emphasis: number;
  jawOpen?: number;
  mouthWide?: number;
  mouthPucker?: number;
}

export interface AttentionTarget {
  focus: AttentionFocus;
  x: number;
  y: number;
  depth: number;
}

export interface FaceRig {
  jawOpen: number;
  mouthWide: number;
  mouthPucker: number;
  mouthSmileLeft: number;
  mouthSmileRight: number;
  cheekRaiseLeft: number;
  cheekRaiseRight: number;
  browInnerUp: number;
  browOuterUpLeft: number;
  browOuterUpRight: number;
  browDownLeft: number;
  browDownRight: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  eyeWideLeft: number;
  eyeWideRight: number;
}

export interface EyeRig {
  lookX: number;
  lookY: number;
  focusDepth: number;
}

export interface HeadRig {
  yaw: number;
  pitch: number;
  roll: number;
}

export interface TorsoRig {
  leanX: number;
  leanY: number;
  twist: number;
  rise: number;
  squash: number;
}

export interface ArmRig {
  shoulderLift: number;
  shoulderOpen: number;
  elbowBend: number;
  reach: number;
  handOpen: number;
  crossBody: number;
}

export interface ExpressiveIntent {
  joy: number;
  distress: number;
  headNod: number;
  headShake: number;
  handConverge: number;
  sob: number;
  tempo: number;
}

export interface RootMotionRig {
  x: number;
  depth: number;
  elevation: number;
  heading: number;
  stride: number;
  travel: number;
  groundContact: number;
}

export interface LocomotionIntent {
  target: { x: number; depth: number; heading: number };
  travel: number;
  jump: number;
}

export interface CharacterRigFrame {
  timestampMs: number;
  presence: CharacterPresence;
  affect: AffectVector;
  attention: AttentionTarget;
  face: FaceRig;
  eyes: EyeRig;
  head: HeadRig;
  torso: TorsoRig;
  leftArm: ArmRig;
  rightArm: ArmRig;
  root: RootMotionRig;
  effects: {
    tearLeft: number;
    tearRight: number;
    tearFlow: number;
    handContact: number;
  };
  dynamics: {
    breath: number;
    motionEnergy: number;
    speechPulse: number;
    anticipation: number;
    actionAccent: number;
    followThrough: number;
    settle: number;
    hold: number;
  };
}

export type PerformanceInput =
  | { type: 'presence'; atMs: number; presence: CharacterPresence }
  | { type: 'direction'; atMs: number; objective: DramaticObjective; motif?: string; intensity: number; holdMs: number }
  | { type: 'voice'; atMs: number; features: VoiceFeatures }
  | { type: 'attention'; atMs: number; target: AttentionTarget }
  | {
      type: 'locomotion';
      atMs: number;
      target: LocomotionIntent['target'];
      travel: number;
      jump: number;
      holdMs: number;
    }
  | {
      type: 'expression';
      atMs: number;
      channels: ExpressiveIntent;
      holdMs: number;
    }
  | {
      type: 'intent';
      atMs: number;
      affect: AffectVector;
      movement: MovementIntent;
      phrasing?: PerformancePhrasing;
      holdMs: number;
    };
