import type {
  AffectVector,
  ArmRig,
  AttentionTarget,
  CharacterPresence,
  CharacterRigFrame,
  ExpressiveIntent,
  FaceRig,
  HeadRig,
  LocomotionIntent,
  MovementIntent,
  PerformanceInput,
  PerformancePhrasing,
  TorsoRig,
  VoiceFeatures,
} from './rig';
import { createDirectedPerformance, type PerformanceImproviser } from './performanceImproviser';
import { sampleSocialGaze } from './socialGaze';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
const signed = (value: number) => clamp(value, -1, 1);
const mix = (from: number, to: number, weight: number) => from + (to - from) * weight;
const damp = (from: number, to: number, elapsedMs: number, response = 0.012) => {
  const amount = 1 - Math.exp(-Math.max(0, elapsedMs) * response);
  return from + (to - from) * amount;
};

const neutralAffect: AffectVector = { valence: 0.18, arousal: 0.16, dominance: 0.3 };
const neutralMovement: MovementIntent = { energy: 0, openness: 0.18, verticality: 0, forward: 0, asymmetry: 0, beat: 0 };
const silentVoice: VoiceFeatures = { speaking: false, energy: 0, brightness: 0.5, emphasis: 0 };
const userAttention: AttentionTarget = { focus: 'user', x: 0, y: 0, depth: 0.7 };
const neutralLocomotion: LocomotionIntent = { target: { x: 0, depth: 0, heading: 0 }, travel: 0, jump: 0 };
const neutralExpression: ExpressiveIntent = { joy: 0, distress: 0, headNod: 0, headShake: 0, handConverge: 0, sob: 0, tempo: 0.5 };
const neutralPhrasing: PerformancePhrasing = { anticipation: 0, action: 0, reaction: 0, settle: 1, hold: 0 };

export interface PerformanceObservation {
  timestampMs: number;
  presence: CharacterPresence;
  affect: AffectVector;
  movement: MovementIntent;
  voice: VoiceFeatures;
  attention: AttentionTarget;
  locomotion: LocomotionIntent;
  expression: ExpressiveIntent;
  phrasing: PerformancePhrasing;
  intentWeight: number;
  locomotionWeight: number;
  expressionWeight: number;
}

export interface PerformancePolicyAdapter {
  infer(observation: PerformanceObservation): CharacterRigFrame;
}

export interface RealtimePerformanceModel {
  ingest(...inputs: PerformanceInput[]): void;
  advance(timestampMs: number): CharacterRigFrame;
  reset(timestampMs?: number): CharacterRigFrame;
}

export interface RealtimePerformanceModelOptions {
  policy?: PerformancePolicyAdapter;
}

function neutralFace(): FaceRig {
  return {
    jawOpen: 0,
    mouthWide: 0.22,
    mouthPucker: 0,
    mouthSmileLeft: 0.22,
    mouthSmileRight: 0.22,
    cheekRaiseLeft: 0.08,
    cheekRaiseRight: 0.08,
    browInnerUp: 0.12,
    browOuterUpLeft: 0.08,
    browOuterUpRight: 0.08,
    browDownLeft: 0,
    browDownRight: 0,
    eyeBlinkLeft: 0,
    eyeBlinkRight: 0,
    eyeWideLeft: 0.08,
    eyeWideRight: 0.08,
  };
}

function neutralArm(): ArmRig {
  return { shoulderLift: 0, shoulderOpen: 0, elbowBend: 0.18, reach: 0, handOpen: 0.35, crossBody: 0 };
}

export function createNeutralRig(timestampMs = 0): CharacterRigFrame {
  return {
    timestampMs,
    presence: 'idle',
    affect: { ...neutralAffect },
    attention: { ...userAttention },
    face: neutralFace(),
    eyes: { lookX: 0, lookY: 0, focusDepth: userAttention.depth },
    head: { yaw: 0, pitch: 0, roll: 0 },
    torso: { leanX: 0, leanY: 0, twist: 0, rise: 0, squash: 0 },
    leftArm: neutralArm(),
    rightArm: neutralArm(),
    root: { x: 0, depth: 0, elevation: 0, heading: 0, stride: 0, travel: 0, groundContact: 1 },
    effects: { tearLeft: 0, tearRight: 0, tearFlow: 0, handContact: 0 },
    dynamics: { breath: 0, motionEnergy: 0, speechPulse: 0, anticipation: 0, actionAccent: 0, followThrough: 0, settle: 1, hold: 0 },
  };
}

function scaleMovement(movement: MovementIntent, weight: number): MovementIntent {
  return {
    energy: movement.energy * weight,
    openness: neutralMovement.openness + (movement.openness - neutralMovement.openness) * weight,
    verticality: movement.verticality * weight,
    forward: movement.forward * weight,
    asymmetry: movement.asymmetry * weight,
    beat: movement.beat * weight,
  };
}

function scaleAffect(affect: AffectVector, weight: number): AffectVector {
  return {
    valence: neutralAffect.valence + (affect.valence - neutralAffect.valence) * weight,
    arousal: neutralAffect.arousal + (affect.arousal - neutralAffect.arousal) * weight,
    dominance: neutralAffect.dominance + (affect.dominance - neutralAffect.dominance) * weight,
  };
}

/**
 * Deterministic local adapter used when no learned motion model is available.
 * It emits the same continuous rig contract expected from an Audio2Face or
 * WebGPU adapter, so replacing it does not change callers or the renderer.
 */
export class LocalCausalPerformancePolicy implements PerformancePolicyAdapter {
  infer(observation: PerformanceObservation): CharacterRigFrame {
    const { timestampMs, voice, attention, phrasing } = observation;
    const presence = voice.speaking ? 'speaking' : observation.presence;
    const socialGaze = sampleSocialGaze({ timestampMs, presence, attention });
    const movement = scaleMovement(observation.movement, observation.intentWeight);
    const affect = scaleAffect(observation.affect, observation.intentWeight);
    const expressionWeight = observation.expressionWeight;
    const expression = observation.expression;
    const expressionRate = 210 - expression.tempo * 92;
    const nodWave = Math.sin(timestampMs / expressionRate) * expression.headNod * expressionWeight;
    const shakeWave = Math.sin(timestampMs / (expressionRate * 0.82)) * expression.headShake * expressionWeight;
    const clapWave = (Math.sin(timestampMs / (expressionRate * 0.58)) + 1) * 0.5 * expression.handConverge * expressionWeight;
    const sobWave = (Math.sin(timestampMs / (expressionRate * 1.12)) + 1) * 0.5 * expression.sob * expressionWeight;
    const joy = clamp(expression.joy * expressionWeight);
    const distress = clamp(expression.distress * expressionWeight);
    const speechPulse = voice.speaking ? clamp((Math.sin(timestampMs / 74) + 1) * 0.5 * voice.energy) : 0;
    const beatPulse = clamp((Math.sin(timestampMs / 118) + 1) * 0.5 * movement.beat);
    const beatWave = Math.sin(timestampMs / 118) * movement.beat * movement.energy;
    const blinkPhase = timestampMs % 3700;
    const blink = blinkPhase < 150 ? Math.sin((blinkPhase / 150) * Math.PI) : 0;
    const microX = Math.sin(timestampMs / 1730) * 0.022;
    const microY = Math.sin(timestampMs / 2110) * 0.016;
    const smile = clamp(0.16 + Math.max(0, affect.valence) * 0.82 + joy * 0.28 - distress * 0.48);
    const arousal = clamp(affect.arousal);
    const voiceDrive = voice.speaking ? clamp(voice.energy * 0.76 + voice.emphasis * 0.24) : 0;
    const motionEnergy = clamp(voiceDrive * 0.45 + movement.energy * 0.78);
    const travel = clamp(observation.locomotion.travel * observation.locomotionWeight);
    const stride = Math.sin(timestampMs / (118 - travel * 34)) * travel;
    const jumpPhase = (timestampMs % 1500) / 1500;
    const elevation = Math.pow(Math.max(0, Math.sin(jumpPhase * Math.PI)), 1.35)
      * observation.locomotion.jump * observation.locomotionWeight;
    const asymmetry = signed(movement.asymmetry);
    const armLift = signed(movement.energy * (movement.verticality * 0.9 + beatWave * 0.16));
    const armOpen = clamp(movement.energy * movement.openness);
    const sideDrive = asymmetry * movement.energy * 0.52 + beatWave * 0.18;
    const breath = Math.sin(timestampMs / 720) * (0.45 + arousal * 0.25);

    const leftArm: ArmRig = {
      shoulderLift: signed(armLift - sideDrive),
      shoulderOpen: clamp(armOpen - asymmetry * movement.energy * 0.3),
      elbowBend: clamp(0.12 + movement.energy * 0.32 + beatPulse * 0.34),
      reach: clamp(movement.forward * movement.energy * (1 - asymmetry * 0.38)),
      handOpen: clamp(0.28 + movement.openness * 0.62 + beatPulse * 0.2),
      crossBody: clamp(clapWave * 1.4),
    };
    const rightArm: ArmRig = {
      shoulderLift: signed(armLift + sideDrive),
      shoulderOpen: clamp(armOpen + asymmetry * movement.energy * 0.3),
      elbowBend: clamp(0.12 + movement.energy * 0.32 + (1 - beatPulse) * movement.beat * 0.34),
      reach: clamp(movement.forward * movement.energy * (1 + asymmetry * 0.38)),
      handOpen: clamp(0.28 + movement.openness * 0.62 + (1 - beatPulse) * movement.beat * 0.2),
      crossBody: clamp(clapWave * 1.4),
    };

    return {
      timestampMs,
      presence: voice.speaking ? 'speaking' : observation.presence,
      affect,
      attention,
      face: {
        jawOpen: clamp((voice.jawOpen ?? voiceDrive * (0.58 + speechPulse * 0.42)) + sobWave * 0.34 + joy * beatPulse * 0.12),
        mouthWide: clamp(0.16 + (voice.mouthWide ?? voice.brightness * voiceDrive * 0.7) + smile * 0.16),
        mouthPucker: clamp((voice.mouthPucker ?? (1 - voice.brightness) * voiceDrive * 0.7) + distress * 0.58),
        mouthSmileLeft: clamp(smile + asymmetry * 0.14),
        mouthSmileRight: clamp(smile - asymmetry * 0.14),
        cheekRaiseLeft: clamp(arousal * 0.58 + smile * 0.32),
        cheekRaiseRight: clamp(arousal * 0.58 + smile * 0.32),
        browInnerUp: clamp(0.08 + arousal * 0.66 + voice.emphasis * 0.26 + distress * 0.58),
        browOuterUpLeft: clamp(0.05 + arousal * 0.46 + asymmetry * 0.22),
        browOuterUpRight: clamp(0.05 + arousal * 0.46 - asymmetry * 0.22),
        browDownLeft: clamp((1 - affect.valence) * affect.dominance * 0.18),
        browDownRight: clamp((1 - affect.valence) * affect.dominance * 0.18),
        eyeBlinkLeft: clamp(blink + socialGaze.shiftBlink * 0.72 + sobWave * distress * 0.44),
        eyeBlinkRight: clamp(blink * (0.96 + Math.sin(timestampMs / 940) * 0.04) + socialGaze.shiftBlink * 0.7 + sobWave * distress * 0.4),
        eyeWideLeft: clamp(0.06 + arousal * 0.56 + Math.max(0, asymmetry) * 0.08),
        eyeWideRight: clamp(0.06 + arousal * 0.56 + Math.max(0, -asymmetry) * 0.08),
      },
      eyes: {
        lookX: signed(socialGaze.eyeX + microX),
        lookY: signed(socialGaze.eyeY + microY),
        focusDepth: clamp(attention.depth),
      },
      head: {
        yaw: signed(socialGaze.headX * 0.55 + asymmetry * 0.16 + shakeWave * 0.72),
        pitch: signed(socialGaze.headY * 0.42 - movement.forward * 0.24 + beatWave * 0.08 + nodWave * 0.62),
        roll: signed(-socialGaze.headX * 0.12 + asymmetry * 0.34),
      },
      torso: {
        leanX: signed(asymmetry * movement.energy * 0.48),
        leanY: signed(movement.forward * 0.68),
        twist: signed(asymmetry * movement.energy * 0.52),
        rise: signed(breath * 0.16 + speechPulse * 0.24 + beatWave * 0.3 - sobWave * 0.22),
        squash: signed(-breath * 0.1 + Math.abs(beatWave) * 0.24 + sobWave * 0.18),
      },
      leftArm,
      rightArm,
      root: {
        x: signed(observation.locomotion.target.x * observation.locomotionWeight),
        depth: signed(observation.locomotion.target.depth * observation.locomotionWeight),
        elevation: clamp(elevation),
        heading: signed(observation.locomotion.target.heading * observation.locomotionWeight),
        stride,
        travel,
        groundContact: clamp(1 - elevation * 4),
      },
      effects: {
        tearLeft: clamp(distress * (0.72 + sobWave * 0.28)),
        tearRight: clamp(distress * (0.64 + (1 - sobWave) * 0.3)),
        tearFlow: clamp(distress * (0.28 + sobWave * 0.72)),
        handContact: clamp(clapWave * 1.2 - 0.18),
      },
      dynamics: {
        breath,
        motionEnergy,
        speechPulse,
        anticipation: clamp(phrasing.anticipation * observation.intentWeight),
        actionAccent: clamp(phrasing.action * observation.intentWeight),
        followThrough: clamp(phrasing.reaction * observation.intentWeight),
        settle: clamp(phrasing.settle),
        hold: clamp(phrasing.hold * observation.intentWeight),
      },
    };
  }
}

function smoothNumericObject<T extends object>(from: T, to: T, elapsedMs: number, response: number): T {
  const result = { ...to } as T;
  const fromRecord = from as Record<string, number>;
  const toRecord = to as Record<string, number>;
  const resultRecord = result as Record<string, number>;
  for (const key of Object.keys(toRecord)) resultRecord[key] = damp(fromRecord[key], toRecord[key], elapsedMs, response);
  return result;
}

class RealtimePerformanceModelImpl implements RealtimePerformanceModel {
  private frame = createNeutralRig();
  private presence: CharacterPresence = 'idle';
  private voice = { ...silentVoice };
  private attention = { ...userAttention };
  private affect = { ...neutralAffect };
  private movement = { ...neutralMovement };
  private locomotion: LocomotionIntent = { ...neutralLocomotion, target: { ...neutralLocomotion.target } };
  private expression = { ...neutralExpression };
  private phrasing = { ...neutralPhrasing };
  private intentExpiresAt = 0;
  private locomotionExpiresAt = 0;
  private expressionExpiresAt = 0;
  private directedPerformance?: PerformanceImproviser;
  private directionStartedAt = 0;
  private directionExpiresAt = 0;
  private directionIntensity = 1;

  constructor(private readonly policy: PerformancePolicyAdapter) {}

  ingest(...inputs: PerformanceInput[]) {
    for (const input of inputs) {
      if (input.type === 'direction') {
        const startedAt = Math.max(input.atMs, this.frame.timestampMs);
        this.directedPerformance = createDirectedPerformance(input.objective, startedAt + input.objective.length * 97, input.motif);
        this.directionStartedAt = startedAt;
        this.directionExpiresAt = startedAt + clamp(input.holdMs, 1_800, 8_000);
        this.directionIntensity = clamp(input.intensity, 0.25, 1);
      } else if (input.type === 'presence') {
        this.presence = input.presence;
      } else if (input.type === 'voice') {
        this.voice = {
          speaking: input.features.speaking,
          energy: clamp(input.features.energy),
          brightness: clamp(input.features.brightness),
          emphasis: clamp(input.features.emphasis),
          ...(input.features.jawOpen === undefined ? {} : { jawOpen: clamp(input.features.jawOpen) }),
          ...(input.features.mouthWide === undefined ? {} : { mouthWide: clamp(input.features.mouthWide) }),
          ...(input.features.mouthPucker === undefined ? {} : { mouthPucker: clamp(input.features.mouthPucker) }),
        };
      } else if (input.type === 'attention') {
        this.attention = {
          focus: input.target.focus,
          x: signed(input.target.x),
          y: signed(input.target.y),
          depth: clamp(input.target.depth),
        };
      } else if (input.type === 'intent') {
        this.affect = {
          valence: signed(input.affect.valence),
          arousal: clamp(input.affect.arousal),
          dominance: clamp(input.affect.dominance),
        };
        this.movement = {
          energy: clamp(input.movement.energy),
          openness: clamp(input.movement.openness),
          verticality: signed(input.movement.verticality),
          forward: signed(input.movement.forward),
          asymmetry: signed(input.movement.asymmetry),
          beat: clamp(input.movement.beat),
        };
        if (input.phrasing) {
          this.phrasing = {
            anticipation: clamp(input.phrasing.anticipation), action: clamp(input.phrasing.action),
            reaction: clamp(input.phrasing.reaction), settle: clamp(input.phrasing.settle), hold: clamp(input.phrasing.hold),
          };
        }
        this.intentExpiresAt = Math.max(input.atMs, this.frame.timestampMs) + clamp(input.holdMs, 120, 8000);
      } else if (input.type === 'locomotion') {
        this.locomotion = {
          target: {
            x: signed(input.target.x),
            depth: signed(input.target.depth),
            heading: signed(input.target.heading),
          },
          travel: clamp(input.travel),
          jump: clamp(input.jump),
        };
        this.locomotionExpiresAt = Math.max(input.atMs, this.frame.timestampMs) + clamp(input.holdMs, 120, 8000);
      } else {
        this.expression = {
          joy: clamp(input.channels.joy),
          distress: clamp(input.channels.distress),
          headNod: clamp(input.channels.headNod),
          headShake: clamp(input.channels.headShake),
          handConverge: clamp(input.channels.handConverge),
          sob: clamp(input.channels.sob),
          tempo: clamp(input.channels.tempo),
        };
        this.expressionExpiresAt = Math.max(input.atMs, this.frame.timestampMs) + clamp(input.holdMs, 120, 8000);
      }
    }
  }

  advance(timestampMs: number): CharacterRigFrame {
    const now = Math.max(this.frame.timestampMs, Number.isFinite(timestampMs) ? timestampMs : this.frame.timestampMs);
    const elapsedMs = Math.min(100, Math.max(0, now - this.frame.timestampMs));
    if (this.directedPerformance && now <= this.directionExpiresAt) {
      const directed = this.directedPerformance.sample(now - this.directionStartedAt);
      const intensity = this.directionIntensity;
      this.affect = scaleAffect(directed.affect, intensity);
      this.movement = {
        ...directed.movement,
        energy: directed.movement.energy * intensity,
        openness: mix(neutralMovement.openness, directed.movement.openness, intensity),
        verticality: directed.movement.verticality * intensity,
        forward: directed.movement.forward * intensity,
        asymmetry: directed.movement.asymmetry * intensity,
        beat: directed.movement.beat * intensity,
      };
      this.attention = directed.attention;
      this.locomotion = {
        target: { ...directed.locomotion.target },
        travel: directed.locomotion.travel * intensity,
        jump: directed.locomotion.jump * intensity,
      };
      this.expression = {
        ...directed.expression,
        joy: directed.expression.joy * intensity,
        distress: directed.expression.distress * intensity,
        headNod: directed.expression.headNod * intensity,
        headShake: directed.expression.headShake * intensity,
        handConverge: directed.expression.handConverge * intensity,
        sob: directed.expression.sob * intensity,
      };
      this.phrasing = directed.phrasing ?? neutralPhrasing;
      this.intentExpiresAt = this.directionExpiresAt;
      this.locomotionExpiresAt = this.directionExpiresAt;
      this.expressionExpiresAt = this.directionExpiresAt;
    } else if (this.directedPerformance) {
      this.directedPerformance = undefined;
    }
    const intentWeight = now <= this.intentExpiresAt ? 1 : Math.exp(-(now - this.intentExpiresAt) / 420);
    const locomotionWeight = now <= this.locomotionExpiresAt ? 1 : Math.exp(-(now - this.locomotionExpiresAt) / 520);
    const expressionWeight = now <= this.expressionExpiresAt ? 1 : Math.exp(-(now - this.expressionExpiresAt) / 460);
    const target = this.policy.infer({
      timestampMs: now,
      presence: this.presence,
      affect: this.affect,
      movement: this.movement,
      voice: this.voice,
      attention: this.attention,
      locomotion: this.locomotion,
      expression: this.expression,
      phrasing: this.phrasing,
      intentWeight,
      locomotionWeight,
      expressionWeight,
    });
    const response = elapsedMs === 0 ? 1 : 0.016;
    const smoothedFace = smoothNumericObject(this.frame.face, target.face, elapsedMs, 0.022);
    if (this.voice.speaking) {
      // Articulation must beat the slower emotional face smoothing or visemes
      // arrive after their phoneme and make an otherwise expressive take feel dubbed.
      smoothedFace.jawOpen = damp(this.frame.face.jawOpen, target.face.jawOpen, elapsedMs, 0.09);
      smoothedFace.mouthWide = damp(this.frame.face.mouthWide, target.face.mouthWide, elapsedMs, 0.09);
      smoothedFace.mouthPucker = damp(this.frame.face.mouthPucker, target.face.mouthPucker, elapsedMs, 0.09);
    }

    this.frame = {
      ...target,
      timestampMs: now,
      affect: smoothNumericObject(this.frame.affect, target.affect, elapsedMs, response),
      attention: {
        ...target.attention,
        x: damp(this.frame.attention.x, target.attention.x, elapsedMs, 0.02),
        y: damp(this.frame.attention.y, target.attention.y, elapsedMs, 0.02),
        depth: damp(this.frame.attention.depth, target.attention.depth, elapsedMs, 0.012),
      },
      face: smoothedFace,
      eyes: smoothNumericObject(this.frame.eyes, target.eyes, elapsedMs, 0.025),
      head: smoothNumericObject<HeadRig>(this.frame.head, target.head, elapsedMs, 0.016),
      torso: smoothNumericObject<TorsoRig>(this.frame.torso, target.torso, elapsedMs, 0.012),
      leftArm: smoothNumericObject<ArmRig>(this.frame.leftArm, target.leftArm, elapsedMs, 0.011),
      rightArm: smoothNumericObject<ArmRig>(this.frame.rightArm, target.rightArm, elapsedMs, 0.011),
      root: smoothNumericObject(this.frame.root, target.root, elapsedMs, 0.016),
      effects: smoothNumericObject(this.frame.effects, target.effects, elapsedMs, 0.024),
      dynamics: smoothNumericObject(this.frame.dynamics, target.dynamics, elapsedMs, 0.018),
    };
    return this.frame;
  }

  reset(timestampMs = 0) {
    this.frame = createNeutralRig(timestampMs);
    this.presence = 'idle';
    this.voice = { ...silentVoice };
    this.attention = { ...userAttention };
    this.affect = { ...neutralAffect };
    this.movement = { ...neutralMovement };
    this.locomotion = { ...neutralLocomotion, target: { ...neutralLocomotion.target } };
    this.expression = { ...neutralExpression };
    this.phrasing = { ...neutralPhrasing };
    this.intentExpiresAt = timestampMs;
    this.locomotionExpiresAt = timestampMs;
    this.expressionExpiresAt = timestampMs;
    this.directedPerformance = undefined;
    this.directionStartedAt = timestampMs;
    this.directionExpiresAt = timestampMs;
    this.directionIntensity = 1;
    return this.frame;
  }
}

export function createRealtimePerformanceModel(options: RealtimePerformanceModelOptions = {}): RealtimePerformanceModel {
  return new RealtimePerformanceModelImpl(options.policy ?? new LocalCausalPerformancePolicy());
}
