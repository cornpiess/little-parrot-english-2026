import type { PerformanceInput } from './rig';
import type { CharacterToolCall, PerceptionEvent } from './types';
import type { DramaticObjective } from './rig';
import { PERFORMANCE_MOTIFS } from './performanceImproviser';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const valueOr = (value: unknown, fallback: number, min = 0, max = 1) => finite(value) ? clamp(value, min, max) : fallback;

export function inputsFromToolCall(call: CharacterToolCall, atMs = performance.now()): PerformanceInput[] {
  const args = call.args ?? {};
  if (call.name === 'perform_turn') {
    const objectives: DramaticObjective[] = ['celebrate', 'comfort', 'invite', 'discover', 'reassure', 'play', 'listen'];
    if (!objectives.includes(args.dramatic_goal as DramaticObjective)) return [];
    const levels = [0.38, 0.56, 0.76, 0.94];
    const level = finite(args.intensity) ? clamp(Math.round(args.intensity), 0, 3) : 2;
    return [{ type: 'direction', atMs, objective: args.dramatic_goal as DramaticObjective, intensity: levels[level], holdMs: 6_000 }];
  }
  if (call.name === 'direct_performance') {
    const objectives: DramaticObjective[] = ['celebrate', 'comfort', 'invite', 'discover', 'reassure', 'play', 'listen'];
    if (!objectives.includes(args.objective as DramaticObjective)) return [];
    const motif = typeof args.motif === 'string' ? args.motif : undefined;
    if (motif && !PERFORMANCE_MOTIFS.some(({ id, objective }) => id === motif && objective === args.objective)) return [];
    return [{
      type: 'direction', atMs,
      objective: args.objective as DramaticObjective,
      ...(motif ? { motif } : {}),
      intensity: valueOr(args.intensity, 0.72, 0.25, 1),
      holdMs: valueOr(args.hold_ms, 6_500, 1_800, 8_000),
    }];
  }
  if (call.name === 'shape_performance') {
    if (!finite(args.valence) || !finite(args.arousal) || !finite(args.energy)) return [];
    return [{
      type: 'intent',
      atMs,
      affect: {
        valence: clamp(args.valence, -1, 1),
        arousal: clamp(args.arousal, 0, 1),
        dominance: valueOr(args.dominance, 0.45),
      },
      movement: {
        energy: clamp(args.energy, 0, 1),
        openness: valueOr(args.openness, 0.35),
        verticality: valueOr(args.verticality, 0, -1, 1),
        forward: valueOr(args.forward, 0, -1, 1),
        asymmetry: valueOr(args.asymmetry, 0, -1, 1),
        beat: valueOr(args.beat, 0.25),
      },
      holdMs: valueOr(args.hold_ms, 900, 120, 8000),
    }];
  }
  if (call.name === 'shape_expression') {
    const keys = ['joy', 'distress', 'head_nod', 'head_shake', 'hand_converge', 'sob', 'tempo'];
    if (!keys.some((key) => finite(args[key]))) return [];
    return [{
      type: 'expression', atMs,
      channels: {
        joy: valueOr(args.joy, 0),
        distress: valueOr(args.distress, 0),
        headNod: valueOr(args.head_nod, 0),
        headShake: valueOr(args.head_shake, 0),
        handConverge: valueOr(args.hand_converge, 0),
        sob: valueOr(args.sob, 0),
        tempo: valueOr(args.tempo, 0.5),
      },
      holdMs: valueOr(args.hold_ms, 1200, 120, 8000),
    }];
  }
  if (call.name === 'shape_locomotion') {
    if (!finite(args.x) || !finite(args.depth)) return [];
    return [{
      type: 'locomotion', atMs,
      target: {
        x: clamp(args.x, -1, 1),
        depth: clamp(args.depth, -1, 1),
        heading: valueOr(args.heading, 0, -1, 1),
      },
      travel: valueOr(args.travel, 0.5),
      jump: valueOr(args.jump, 0),
      holdMs: valueOr(args.hold_ms, 1800, 120, 8000),
    }];
  }
  if (call.name === 'set_attention') {
    if (!finite(args.x) || !finite(args.y) || !['user', 'object', 'away'].includes(String(args.focus))) return [];
    return [{
      type: 'attention',
      atMs,
      target: {
        focus: String(args.focus) as 'user' | 'object' | 'away',
        x: clamp(args.x, -1, 1),
        y: clamp(args.y, -1, 1),
        depth: valueOr(args.depth, 0.7),
      },
    }];
  }
  if (call.name === 'set_presence') {
    if (!['idle', 'listening', 'thinking', 'speaking'].includes(String(args.presence))) return [];
    return [{ type: 'presence', atMs, presence: args.presence as 'idle' | 'listening' | 'thinking' | 'speaking' }];
  }
  return [];
}

export function perceptionToInputs(event: PerceptionEvent, atMs = performance.now()): PerformanceInput[] {
  if (event.confidence < 0.72) return [];
  if (event.type === 'face') {
    const attention: PerformanceInput = {
      type: 'attention',
      atMs,
      target: { focus: 'user', x: clamp(event.x ?? 0, -1, 1), y: clamp(event.y ?? 0, -1, 1), depth: 0.72 },
    };
    if (event.gesture !== 'smile') return [attention];
    return [
      attention,
      {
        type: 'intent', atMs,
        affect: { valence: 0.78, arousal: 0.48, dominance: 0.42 },
        movement: { energy: 0.34, openness: 0.58, verticality: 0.16, forward: 0.24, asymmetry: 0.18, beat: 0.22 },
        phrasing: { anticipation: 0.08, action: 0.44, reaction: 0.74, settle: 0.12, hold: 0.24 },
        holdMs: 1_100,
      },
      {
        type: 'expression', atMs,
        channels: { joy: 0.72, distress: 0, headNod: 0.38, headShake: 0, handConverge: 0, sob: 0, tempo: 0.46 },
        holdMs: 1_100,
      },
    ];
  }
  if (event.type === 'hand' && event.gesture === 'wave') {
    return [{
      type: 'intent',
      atMs,
      affect: { valence: 0.72, arousal: 0.64, dominance: 0.48 },
      movement: { energy: event.confidence, openness: 0.84, verticality: 0.72, forward: 0.12, asymmetry: 0.68, beat: 0.82 },
      phrasing: { anticipation: 0.16, action: 0.84, reaction: 0.58, settle: 0.08, hold: 0.34 },
      holdMs: 900,
    }];
  }
  return [];
}
