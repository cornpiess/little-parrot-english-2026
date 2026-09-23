import type {
  AffectVector,
  AttentionTarget,
  DramaticObjective,
  ExpressiveIntent,
  LocomotionIntent,
  MovementIntent,
  VoiceFeatures,
  PerformancePhrasing,
} from './rig';
import { samplePerformanceScore, type PerformanceBeat } from './performanceScore';

export type { DramaticObjective } from './rig';
export type { PerformanceBeat } from './performanceScore';

export interface ContinuousPerformanceIntent {
  affect: AffectVector;
  movement: MovementIntent;
  phrasing?: PerformancePhrasing;
}

export interface ImprovisedPerformance extends ContinuousPerformanceIntent {
  personaId: 'olaf-playful-companion';
  stateId: string;
  objective: DramaticObjective;
  desiredChildFeeling: string;
  beat: PerformanceBeat;
  attention: AttentionTarget;
  locomotion: LocomotionIntent;
  expression: ExpressiveIntent;
  voice: VoiceFeatures;
  speechCue?: { id: string; text: string; objective: DramaticObjective };
}

export interface PerformanceImproviser {
  sample(timestampMs: number): ImprovisedPerformance;
}

export interface PerformanceMotifDefinition {
  id: string;
  label: string;
  group: '情绪反应' | '互动沟通' | '思考观察' | '空间动作' | '声音表演';
  objective: DramaticObjective;
  desiredChildFeeling?: string;
  affect?: Partial<AffectVector>;
  movement?: Partial<MovementIntent>;
  expression?: Partial<ExpressiveIntent>;
  locomotion?: Partial<Omit<LocomotionIntent, 'target'>> & { target?: Partial<LocomotionIntent['target']> };
  attention?: Partial<AttentionTarget>;
  lines?: string[];
}

interface ObjectiveBlueprint extends ContinuousPerformanceIntent {
  id: DramaticObjective;
  desiredChildFeeling: string;
  focus: AttentionTarget['focus'];
  expression: ExpressiveIntent;
  locomotion: LocomotionIntent;
  lines: string[];
}

interface ActorState extends ObjectiveBlueprint {
  index: number;
  durationMs: number;
  transitionMs: number;
  attention: AttentionTarget;
}

export const DEMO_SPEECH_INTERVAL_MS = 3_000;

export const OLAF_PERSONA = {
  id: 'olaf-playful-companion' as const,
  traits: ['温暖', '好奇', '笨拙但勇敢', '永远把孩子当伙伴'],
  invariant: '先看见孩子的感受，再用夸张但安全的身体表演回应。',
};

export const PERFORMANCE_MOTIFS: PerformanceMotifDefinition[] = [
  { id: 'joyful-clap', label: '开心拍手', group: '情绪反应', objective: 'celebrate', expression: { handConverge: 1, headNod: 0.25 }, locomotion: { jump: 0.38 } },
  { id: 'jump-cheer', label: '跳跃欢呼', group: '情绪反应', objective: 'celebrate', movement: { energy: 1, verticality: 0.92, openness: 1 }, expression: { handConverge: 0.12 }, locomotion: { jump: 1 } },
  { id: 'proud-show', label: '得意展示', group: '情绪反应', objective: 'celebrate', affect: { dominance: 0.94 }, movement: { openness: 1, asymmetry: 0.48, beat: 0.18 }, expression: { handConverge: 0, headNod: 0.42 } },
  { id: 'surprise-find', label: '惊喜发现', group: '情绪反应', objective: 'discover', affect: { arousal: 0.92, valence: 0.8 }, movement: { verticality: 0.72, energy: 0.78 }, locomotion: { jump: 0.34 } },
  { id: 'sad-cry', label: '委屈哭泣', group: '情绪反应', objective: 'comfort', affect: { valence: -0.58, arousal: 0.48, dominance: 0.12 }, movement: { openness: 0.08, verticality: -0.78, energy: 0.36 }, expression: { joy: 0, distress: 1, sob: 1, headNod: 0 } },
  { id: 'hold-tears', label: '忍住眼泪', group: '情绪反应', objective: 'comfort', affect: { valence: -0.3, arousal: 0.3, dominance: 0.28 }, movement: { openness: 0.14, verticality: -0.48, energy: 0.2 }, expression: { joy: 0, distress: 0.68, sob: 0.22 } },

  { id: 'agree-nod', label: '点头认同', group: '互动沟通', objective: 'reassure', expression: { headNod: 1, headShake: 0, handConverge: 0 }, movement: { beat: 0.24 } },
  { id: 'refuse-shake', label: '摇头拒绝', group: '互动沟通', objective: 'reassure', affect: { valence: 0.02, dominance: 0.84, arousal: 0.58 }, expression: { joy: 0.08, headNod: 0, headShake: 1 }, movement: { openness: 0.24, asymmetry: 0.22 } },
  { id: 'deep-listen', label: '认真倾听', group: '互动沟通', objective: 'listen', movement: { energy: 0.12, forward: 0.7 }, expression: { headNod: 0.46 }, attention: { focus: 'user', x: 0, y: 0 } },
  { id: 'curious-tilt', label: '好奇歪头', group: '互动沟通', objective: 'discover', movement: { asymmetry: 0.92, energy: 0.38, forward: 0.62 }, expression: { headShake: 0.08 }, attention: { focus: 'object', x: 0.52, y: -0.16 } },
  { id: 'wave-invite', label: '招手邀请', group: '互动沟通', objective: 'invite', movement: { openness: 1, asymmetry: 1, verticality: 0.74, beat: 0.82 }, expression: { headNod: 0.24 } },
  { id: 'open-welcome', label: '双臂欢迎', group: '互动沟通', objective: 'invite', movement: { openness: 1, asymmetry: 0, verticality: 0.52, forward: 0.64 }, expression: { handConverge: 0 } },

  { id: 'puzzled-think', label: '困惑思考', group: '思考观察', objective: 'discover', affect: { valence: 0.05, arousal: 0.34 }, movement: { energy: 0.24, asymmetry: 0.62, forward: 0.38 }, expression: { joy: 0.08, headShake: 0.34 }, attention: { focus: 'away', x: -0.46, y: 0.28 } },
  { id: 'idea-pop', label: '恍然大悟', group: '思考观察', objective: 'discover', affect: { valence: 0.9, arousal: 0.86 }, movement: { energy: 0.86, verticality: 0.88, openness: 0.92 }, expression: { joy: 0.9, headNod: 0.72 }, locomotion: { jump: 0.42 } },
  { id: 'search-around', label: '左右寻找', group: '思考观察', objective: 'discover', movement: { energy: 0.52, asymmetry: 0.82, forward: 0.32 }, expression: { headShake: 0.66 }, attention: { focus: 'object', x: 0.9 }, locomotion: { target: { x: 0.66, heading: -0.52 }, travel: 0.36 } },
  { id: 'inspect-close', label: '靠近观察', group: '思考观察', objective: 'discover', movement: { energy: 0.34, forward: 0.92, openness: 0.24 }, attention: { focus: 'object', x: 0.26, y: -0.22, depth: 0.92 }, locomotion: { target: { depth: 0.58 }, travel: 0.32 } },
  { id: 'look-back', label: '回头确认', group: '思考观察', objective: 'listen', movement: { asymmetry: -0.74, forward: -0.2 }, attention: { focus: 'user', x: -0.72 }, locomotion: { target: { x: -0.38, heading: 0.7 }, travel: 0.18 } },
  { id: 'shy-avoid', label: '害羞回避', group: '思考观察', objective: 'comfort', affect: { valence: 0.28, arousal: 0.24, dominance: 0.12 }, movement: { openness: 0.1, forward: -0.42, asymmetry: 0.46 }, expression: { joy: 0.34, distress: 0.12 }, attention: { focus: 'away', x: 0.58, y: -0.2 } },

  { id: 'gentle-comfort', label: '轻轻靠近', group: '空间动作', objective: 'comfort', movement: { energy: 0.2, forward: 0.68, openness: 0.38 }, locomotion: { target: { depth: 0.58 }, travel: 0.28 }, attention: { focus: 'user', depth: 0.9 } },
  { id: 'run-to-you', label: '快步跑来', group: '空间动作', objective: 'invite', movement: { energy: 0.92, forward: 0.86, beat: 0.72 }, locomotion: { target: { depth: 0.78 }, travel: 1, jump: 0.14 } },
  { id: 'pace-around', label: '左右踱步', group: '空间动作', objective: 'play', movement: { energy: 0.58, asymmetry: 0.76, beat: 0.34 }, locomotion: { target: { x: 0.92, heading: -0.72 }, travel: 0.8, jump: 0 } },
  { id: 'tiptoe-peek', label: '踮脚偷看', group: '空间动作', objective: 'discover', movement: { energy: 0.32, verticality: 0.86, forward: 0.78, openness: 0.18 }, locomotion: { target: { depth: 0.36 }, travel: 0.18, jump: 0.16 }, attention: { focus: 'object', y: 0.38 } },
  { id: 'small-hop', label: '开心小跳步', group: '空间动作', objective: 'play', movement: { energy: 0.72, verticality: 0.58, beat: 0.66 }, locomotion: { target: { x: 0.46 }, travel: 0.5, jump: 0.5 } },
  { id: 'big-jump', label: '大跳庆祝', group: '空间动作', objective: 'celebrate', movement: { energy: 1, verticality: 1, openness: 1, beat: 0.52 }, expression: { handConverge: 0.16 }, locomotion: { jump: 1, travel: 0.28 } },

  { id: 'soft-comfort', label: '轻声安慰', group: '声音表演', objective: 'comfort', affect: { arousal: 0.12, valence: 0.32 }, movement: { energy: 0.12, forward: 0.56 }, lines: ['别担心，我在这里。', '我们一起慢慢来。'] },
  { id: 'excited-tell', label: '兴奋讲述', group: '声音表演', objective: 'invite', affect: { arousal: 0.94 }, movement: { energy: 0.84, openness: 0.88, beat: 0.7 }, expression: { joy: 0.92, headNod: 0.54 }, lines: ['你知道吗？我有一个超棒的发现！', '快听快听，事情是这样的！'] },
  { id: 'share-secret', label: '凑近说秘密', group: '声音表演', objective: 'invite', affect: { arousal: 0.22 }, movement: { energy: 0.16, forward: 0.96, openness: 0.18 }, locomotion: { target: { depth: 0.72 }, travel: 0.22 }, lines: ['嘘，我只告诉你一个人。', '靠近一点，这是我们的小秘密。'] },
  { id: 'silly-play', label: '调皮逗乐', group: '声音表演', objective: 'play', movement: { energy: 0.92, asymmetry: 1, beat: 0.9 }, expression: { joy: 1, headShake: 0.78 }, locomotion: { target: { x: -0.58, heading: 0.62 }, travel: 0.64, jump: 0.42 } },
  { id: 'nervous-wait', label: '紧张等待', group: '声音表演', objective: 'listen', affect: { valence: -0.12, arousal: 0.62, dominance: 0.18 }, movement: { energy: 0.28, openness: 0.12, beat: 0.2, asymmetry: 0.24 }, expression: { joy: 0.04, distress: 0.3, headNod: 0.12 }, attention: { focus: 'user', y: -0.1 } },
  { id: 'calm-breathe', label: '放松呼吸', group: '声音表演', objective: 'listen', affect: { valence: 0.42, arousal: 0.04, dominance: 0.34 }, movement: { energy: 0.06, openness: 0.52, forward: 0.16, beat: 0 }, expression: { joy: 0.3, headNod: 0, headShake: 0 }, lines: ['呼——我们先放松一下。', '慢慢吸气，再慢慢呼气。'] },
];

const objectiveBlueprints: ObjectiveBlueprint[] = [
  {
    id: 'celebrate', desiredChildFeeling: '为自己的成功感到骄傲', focus: 'user',
    affect: { valence: 0.96, arousal: 0.9, dominance: 0.7 },
    movement: { energy: 0.92, openness: 0.86, verticality: 0.7, forward: 0.14, asymmetry: 0.08, beat: 0.86 },
    expression: { joy: 1, distress: 0, headNod: 0.32, headShake: 0, handConverge: 0.96, sob: 0, tempo: 0.82 },
    locomotion: { target: { x: 0, depth: 0.2, heading: 0 }, travel: 0.18, jump: 0.62 },
    lines: ['你做到了！太棒啦！', '哇，我要为你拍拍手！', '这一次真的很厉害！'],
  },
  {
    id: 'comfort', desiredChildFeeling: '被理解、被陪伴', focus: 'user',
    affect: { valence: 0.18, arousal: 0.26, dominance: 0.26 },
    movement: { energy: 0.3, openness: 0.3, verticality: -0.28, forward: 0.46, asymmetry: 0.12, beat: 0.06 },
    expression: { joy: 0.14, distress: 0.36, headNod: 0.26, headShake: 0, handConverge: 0.2, sob: 0.08, tempo: 0.3 },
    locomotion: { target: { x: 0, depth: 0.34, heading: 0 }, travel: 0.12, jump: 0 },
    lines: ['没关系，我陪着你。', '我们慢慢来，好不好？', '你可以再试一次，我在这里。'],
  },
  {
    id: 'invite', desiredChildFeeling: '愿意靠近并一起参与', focus: 'user',
    affect: { valence: 0.78, arousal: 0.62, dominance: 0.5 },
    movement: { energy: 0.66, openness: 0.94, verticality: 0.34, forward: 0.5, asymmetry: 0.62, beat: 0.4 },
    expression: { joy: 0.76, distress: 0, headNod: 0.46, headShake: 0, handConverge: 0.08, sob: 0, tempo: 0.58 },
    locomotion: { target: { x: 0.2, depth: 0.18, heading: -0.12 }, travel: 0.3, jump: 0.12 },
    lines: ['来吧，我们一起玩！', '你愿意和我一起试试吗？', '到你啦，我在看着你呢！'],
  },
  {
    id: 'discover', desiredChildFeeling: '产生好奇并跟随观察', focus: 'object',
    affect: { valence: 0.5, arousal: 0.58, dominance: 0.42 },
    movement: { energy: 0.48, openness: 0.42, verticality: 0.12, forward: 0.58, asymmetry: 0.54, beat: 0.12 },
    expression: { joy: 0.42, distress: 0, headNod: 0.12, headShake: 0.16, handConverge: 0, sob: 0, tempo: 0.42 },
    locomotion: { target: { x: -0.28, depth: 0.28, heading: 0.24 }, travel: 0.2, jump: 0 },
    lines: ['咦，那边是什么？', '等等，我好像发现了什么！', '快看，这里有个小秘密。'],
  },
  {
    id: 'reassure', desiredChildFeeling: '安心并相信自己', focus: 'user',
    affect: { valence: 0.66, arousal: 0.34, dominance: 0.62 },
    movement: { energy: 0.38, openness: 0.56, verticality: 0.08, forward: 0.34, asymmetry: 0.02, beat: 0.16 },
    expression: { joy: 0.58, distress: 0, headNod: 0.78, headShake: 0, handConverge: 0.12, sob: 0, tempo: 0.38 },
    locomotion: { target: { x: 0, depth: 0.18, heading: 0 }, travel: 0.08, jump: 0 },
    lines: ['嗯，我相信你可以。', '对，就是这样，慢慢来。', '我会一直给你加油！'],
  },
  {
    id: 'play', desiredChildFeeling: '放松、惊喜并想笑', focus: 'user',
    affect: { valence: 0.86, arousal: 0.84, dominance: 0.46 },
    movement: { energy: 0.88, openness: 0.68, verticality: 0.5, forward: -0.08, asymmetry: 0.72, beat: 0.76 },
    expression: { joy: 0.92, distress: 0, headNod: 0.16, headShake: 0.54, handConverge: 0.12, sob: 0, tempo: 0.78 },
    locomotion: { target: { x: 0.42, depth: -0.18, heading: -0.38 }, travel: 0.58, jump: 0.48 },
    lines: ['嘿嘿，来抓我呀！', '看我的超级雪人步！', '糟糕，我的脚又不听话啦！'],
  },
  {
    id: 'listen', desiredChildFeeling: '被认真倾听和重视', focus: 'user',
    affect: { valence: 0.48, arousal: 0.2, dominance: 0.34 },
    movement: { energy: 0.22, openness: 0.42, verticality: -0.06, forward: 0.56, asymmetry: 0.14, beat: 0.04 },
    expression: { joy: 0.4, distress: 0, headNod: 0.56, headShake: 0, handConverge: 0.08, sob: 0, tempo: 0.26 },
    locomotion: { target: { x: 0, depth: 0.26, heading: 0 }, travel: 0, jump: 0 },
    lines: ['嗯嗯，我在认真听。', '然后呢？你继续说。', '我听见啦，告诉我更多吧。'],
  },
];

function applyMotif(blueprint: ObjectiveBlueprint, motif?: PerformanceMotifDefinition): ObjectiveBlueprint {
  if (!motif) return blueprint;
  return {
    ...blueprint,
    id: motif.objective,
    desiredChildFeeling: motif.desiredChildFeeling ?? blueprint.desiredChildFeeling,
    focus: motif.attention?.focus ?? blueprint.focus,
    affect: { ...blueprint.affect, ...motif.affect },
    movement: { ...blueprint.movement, ...motif.movement },
    expression: { ...blueprint.expression, ...motif.expression },
    locomotion: {
      ...blueprint.locomotion,
      ...motif.locomotion,
      target: { ...blueprint.locomotion.target, ...motif.locomotion?.target },
    },
    lines: motif.lines ?? blueprint.lines,
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const signed = (value: number) => Math.min(1, Math.max(-1, value));
const mix = (from: number, to: number, weight: number) => from + (to - from) * weight;

function phase(seed: number, channel: number) {
  const value = Math.sin(seed * 12.9898 + channel * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * Math.PI * 2;
}

function variation(seed: number, state: number, channel: number) {
  return Math.sin(phase(seed + state * 31.7, channel));
}

function unit(seed: number, state: number, channel: number) {
  return (variation(seed, state, channel) + 1) * 0.5;
}

function smootherstep(value: number) {
  const progress = clamp01(value);
  return progress ** 3 * (progress * (progress * 6 - 15) + 10);
}

function pulseWindow(progress: number, start: number, end: number, feather = 0.09) {
  const fadeIn = smootherstep((progress - start) / feather);
  const fadeOut = 1 - smootherstep((progress - (end - feather)) / feather);
  return clamp01(fadeIn * fadeOut);
}

function objectiveFor(seed: number, index: number) {
  const block = Math.floor(index / objectiveBlueprints.length);
  const slot = ((index % objectiveBlueprints.length) + objectiveBlueprints.length) % objectiveBlueprints.length;
  const order = objectiveBlueprints
    .map((blueprint, blueprintIndex) => ({ blueprint, order: unit(seed + block * 113.9, blueprintIndex, 37) }))
    .sort((left, right) => left.order - right.order);
  return order[slot].blueprint;
}

function vary01(value: number, amount: number, variationValue: number) {
  return clamp01(value + variationValue * amount);
}

function makeActorState(seed: number, index: number, fixedObjective?: DramaticObjective, durationScale = 1, motifId?: string): ActorState {
  const baseBlueprint = fixedObjective
    ? objectiveBlueprints.find(({ id }) => id === fixedObjective) ?? objectiveBlueprints[6]
    : objectiveFor(seed, index);
  const motif = motifId ? PERFORMANCE_MOTIFS.find(({ id }) => id === motifId) : undefined;
  const blueprint = applyMotif(baseBlueprint, motif);
  const side = variation(seed, index, 18);
  const generatedAttentionX = blueprint.focus === 'object'
    ? signed((side < 0 ? -1 : 1) * (0.3 + unit(seed, index, 19) * 0.5))
    : signed(variation(seed, index, 19) * 0.16);
  const attentionX = motif?.attention?.x ?? generatedAttentionX;
  return {
    ...blueprint,
    index,
    durationMs: (7_600 + unit(seed, index, 1) * 1_600) * durationScale,
    transitionMs: (2_600 + unit(seed, index, 2) * 600) * Math.max(0.7, durationScale),
    affect: {
      valence: signed(blueprint.affect.valence + variation(seed, index, 3) * 0.12),
      arousal: vary01(blueprint.affect.arousal, 0.12, variation(seed, index, 4)),
      dominance: vary01(blueprint.affect.dominance, 0.1, variation(seed, index, 5)),
    },
    movement: {
      energy: vary01(blueprint.movement.energy, 0.1, variation(seed, index, 6)),
      openness: vary01(blueprint.movement.openness, 0.12, variation(seed, index, 7)),
      verticality: signed(blueprint.movement.verticality + variation(seed, index, 8) * 0.16),
      forward: signed(blueprint.movement.forward + variation(seed, index, 9) * 0.12),
      asymmetry: signed(blueprint.movement.asymmetry * (side < 0 ? -1 : 1) + variation(seed, index, 10) * 0.1),
      beat: vary01(blueprint.movement.beat, 0.1, variation(seed, index, 11)),
    },
    expression: {
      ...blueprint.expression,
      joy: vary01(blueprint.expression.joy, 0.08, variation(seed, index, 12)),
      distress: vary01(blueprint.expression.distress, 0.06, variation(seed, index, 13)),
      tempo: vary01(blueprint.expression.tempo, 0.08, variation(seed, index, 14)),
    },
    locomotion: {
      target: {
        x: signed(blueprint.locomotion.target.x * (side < 0 ? -1 : 1) + variation(seed, index, 15) * 0.12),
        depth: signed(blueprint.locomotion.target.depth + variation(seed, index, 16) * 0.1),
        heading: signed(blueprint.locomotion.target.heading * (side < 0 ? -1 : 1)),
      },
      travel: vary01(blueprint.locomotion.travel, 0.08, variation(seed, index, 20)),
      jump: vary01(blueprint.locomotion.jump, 0.08, variation(seed, index, 21)),
    },
    attention: {
      focus: blueprint.focus,
      x: attentionX,
      y: motif?.attention?.y ?? signed(variation(seed, index, 22) * (blueprint.focus === 'object' ? 0.34 : 0.1)),
      depth: motif?.attention?.depth ?? clamp01(0.64 + unit(seed, index, 23) * 0.24),
    },
  };
}

const neutralState: ActorState = {
  ...objectiveBlueprints[6], index: -1, durationMs: 9_600, transitionMs: 2_600,
  affect: { valence: 0.34, arousal: 0.16, dominance: 0.3 },
  movement: { energy: 0.12, openness: 0.34, verticality: 0, forward: 0.2, asymmetry: 0, beat: 0 },
  attention: { focus: 'user', x: 0, y: 0, depth: 0.72 },
  locomotion: { target: { x: 0, depth: 0, heading: 0 }, travel: 0, jump: 0 },
  expression: { joy: 0.28, distress: 0, headNod: 0, headShake: 0, handConverge: 0, sob: 0, tempo: 0.36 },
};

function locateState(seed: number, timestampMs: number, fixedObjective?: DramaticObjective, durationScale = 1, motifId?: string) {
  let index = 0;
  let startsAt = 0;
  let state = makeActorState(seed, index, fixedObjective, durationScale, motifId);
  while (startsAt + state.durationMs <= timestampMs) {
    startsAt += state.durationMs;
    index += 1;
    state = makeActorState(seed, index, fixedObjective, durationScale, motifId);
  }
  return {
    index,
    startsAt,
    state,
    previous: index === 0 ? neutralState : makeActorState(seed, index - 1, fixedObjective, durationScale, motifId),
  };
}

function blendAffect(from: AffectVector, to: AffectVector, weight: number): AffectVector {
  return {
    valence: mix(from.valence, to.valence, weight),
    arousal: mix(from.arousal, to.arousal, weight),
    dominance: mix(from.dominance, to.dominance, weight),
  };
}

function blendMovement(from: MovementIntent, to: MovementIntent, weight: number): MovementIntent {
  return {
    energy: mix(from.energy, to.energy, weight),
    openness: mix(from.openness, to.openness, weight),
    verticality: mix(from.verticality, to.verticality, weight),
    forward: mix(from.forward, to.forward, weight),
    asymmetry: mix(from.asymmetry, to.asymmetry, weight),
    beat: mix(from.beat, to.beat, weight),
  };
}

/**
 * Five-layer actor module. Its single time-sampling interface hides Olaf's
 * persona, dramatic objectives, actor-state construction, beat choreography,
 * and the final continuous Rig controls.
 */
function createPerformanceActor(seed: number, fixedObjective?: DramaticObjective, durationScale = 1, motifId?: string): PerformanceImproviser {
  return {
    sample(timestampMs) {
      const safeTime = Math.max(0, timestampMs);
      const { index, startsAt, state, previous } = locateState(seed, safeTime, fixedObjective, durationScale, motifId);
      const elapsed = safeTime - startsAt;
      const progress = clamp01(elapsed / state.durationMs);
      const score = samplePerformanceScore(progress);
      const transition = smootherstep(elapsed / state.transitionMs);
      const appraisal = smootherstep((progress - 0.02) / 0.5);
      const prepareEnvelope = pulseWindow(progress, 0.1, 0.52, 0.28);
      const actEnvelope = pulseWindow(progress, 0.16, 0.84, 0.4);
      const reactEnvelope = pulseWindow(progress, 0.48, 0.96, 0.3);
      const settle = smootherstep((progress - 0.76) / 0.2);
      const storyWeight = transition * appraisal;
      const baseAffect = blendAffect(previous.affect, state.affect, storyWeight);
      const baseMovement = blendMovement(previous.movement, state.movement, transition);
      const baseJoy = mix(previous.expression.joy, state.expression.joy, storyWeight);
      const baseDistress = mix(previous.expression.distress, state.expression.distress, storyWeight);
      const actionEnergy = clamp01(0.34 + prepareEnvelope * 0.28 + actEnvelope * 0.5 + reactEnvelope * 0.18 - settle * 0.14);
      const emotionalPresence = clamp01(0.76 + appraisal * 0.24 - settle * 0.24);
      const speechBeat = Math.floor(safeTime / DEMO_SPEECH_INTERVAL_MS);
      const speechElapsed = safeTime - speechBeat * DEMO_SPEECH_INTERVAL_MS;
      const speaking = speechElapsed < 900;
      const speechProgress = clamp01(speechElapsed / 900);
      const lineIndex = (Math.floor(unit(seed, index, 25) * state.lines.length) + speechBeat) % state.lines.length;
      const scan = (1 - smootherstep(progress / 0.18)) * variation(seed, index, 26) * 0.24;

      return {
        personaId: OLAF_PERSONA.id,
        stateId: `${Math.floor(seed)}-${index}`,
        objective: state.id,
        desiredChildFeeling: state.desiredChildFeeling,
        beat: score.beat,
        phrasing: score,
        affect: {
          valence: mix(neutralState.affect.valence, baseAffect.valence, emotionalPresence),
          arousal: mix(neutralState.affect.arousal, baseAffect.arousal, emotionalPresence),
          dominance: mix(neutralState.affect.dominance, baseAffect.dominance, emotionalPresence),
        },
        movement: {
          energy: clamp01(baseMovement.energy * actionEnergy),
          openness: clamp01(mix(0.34, baseMovement.openness, emotionalPresence) + prepareEnvelope * 0.08),
          verticality: signed(baseMovement.verticality * (0.42 + actEnvelope * 0.58) - prepareEnvelope * Math.sign(baseMovement.verticality) * 0.16),
          forward: signed(baseMovement.forward * emotionalPresence - prepareEnvelope * 0.08),
          asymmetry: signed(baseMovement.asymmetry * (0.44 + actEnvelope * 0.56)),
          beat: clamp01(baseMovement.beat * (actEnvelope + reactEnvelope * 0.36)),
        },
        attention: {
          focus: progress < 0.1 ? previous.attention.focus : state.attention.focus,
          x: signed(mix(previous.attention.x, state.attention.x, smootherstep(progress / 0.24)) + scan),
          y: signed(mix(previous.attention.y, state.attention.y, smootherstep(progress / 0.24))),
          depth: clamp01(mix(previous.attention.depth, state.attention.depth, transition)),
        },
        expression: {
          joy: clamp01(baseJoy * emotionalPresence),
          distress: clamp01(baseDistress * emotionalPresence),
          headNod: clamp01(state.expression.headNod * (actEnvelope + reactEnvelope * 0.34)),
          headShake: clamp01(state.expression.headShake * actEnvelope),
          handConverge: clamp01(state.expression.handConverge * actEnvelope),
          sob: clamp01(state.expression.sob * (actEnvelope + reactEnvelope * 0.42)),
          tempo: mix(previous.expression.tempo, state.expression.tempo, transition),
        },
        locomotion: {
          target: {
            x: signed(mix(previous.locomotion.target.x, state.locomotion.target.x, transition)),
            depth: signed(mix(previous.locomotion.target.depth, state.locomotion.target.depth, transition)),
            heading: signed(mix(previous.locomotion.target.heading, state.locomotion.target.heading, transition)),
          },
          travel: clamp01(state.locomotion.travel * (prepareEnvelope * 0.5 + actEnvelope)),
          jump: clamp01(state.locomotion.jump * (actEnvelope * 0.48 + reactEnvelope)),
        },
        voice: {
          speaking,
          energy: speaking ? clamp01(0.44 + state.affect.arousal * 0.36 + Math.sin(speechProgress * Math.PI * 4) * 0.12) : 0,
          brightness: clamp01(0.54 + state.affect.valence * 0.2),
          emphasis: speaking ? clamp01(0.34 + state.affect.arousal * 0.32 + Math.sin(speechProgress * Math.PI * 3) * 0.2) : 0,
        },
        // The cue remains available throughout the beat. The page-level actor
        // waits for actual audio completion and a natural pause before using it.
        speechCue: {
          id: `${Math.floor(seed)}-speech-${speechBeat}`,
          text: state.lines[lineIndex],
          objective: state.id,
        },
      };
    },
  };
}

export function createPerformanceImproviser(seed = Math.random() * 10_000): PerformanceImproviser {
  return createPerformanceActor(seed);
}

/** Creates one compact, complete acting phrase for a model-issued objective. */
export function createDirectedPerformance(objective: DramaticObjective, seed = Math.random() * 10_000, motifId?: string): PerformanceImproviser {
  return createPerformanceActor(seed, objective, 0.58, motifId);
}
