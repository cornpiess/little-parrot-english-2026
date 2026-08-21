import type { CharacterToolCall, GestureName, PerformanceSignal, PerceptionEvent } from './types';

const gestures = new Set(['wave', 'nod', 'shake', 'point', 'openArms', 'think', 'celebrate', 'listen']);
const emotions = new Set(['neutral', 'joy', 'curiosity', 'surprise', 'comfort', 'shy', 'encourage']);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export function signalsFromToolCall(call: CharacterToolCall): PerformanceSignal[] {
  const args = call.args ?? {};
  if (call.name === 'perform_gesture') {
    const gesture = args.gesture;
    if (typeof gesture !== 'string' || !gestures.has(gesture)) return [];
    const intensity = finite(args.intensity) ? clamp(args.intensity, 0, 1) : 1;
    const durationMs = finite(args.duration_ms) ? clamp(args.duration_ms, 400, 5000) : 900;
    return [{ type: 'gesture', name: gesture as GestureName, intensity, durationMs }];
  }
  if (call.name === 'set_emotion') {
    if (!finite(args.valence) || !finite(args.arousal) || !finite(args.dominance)) return [];
    return [{
      type: 'emotion',
      valence: clamp(args.valence, -1, 1),
      arousal: clamp(args.arousal, 0, 1),
      dominance: clamp(args.dominance, 0, 1),
      name: typeof args.name === 'string' && emotions.has(args.name) ? args.name as never : undefined,
    }];
  }
  if (call.name === 'set_gaze') {
    if (!finite(args.x) || !finite(args.y) || !['user', 'object', 'away'].includes(String(args.focus))) return [];
    return [{ type: 'gaze', focus: String(args.focus) as 'user' | 'object' | 'away', x: clamp(args.x, -1, 1), y: clamp(args.y, -1, 1) }];
  }
  if (call.name === 'react') {
    const mode = args.mode;
    if (!['idle', 'listening', 'thinking', 'speaking', 'acting'].includes(String(mode))) return [];
    return [{ type: 'mode', mode: mode as 'idle' | 'listening' | 'thinking' | 'speaking' | 'acting' }];
  }
  return [];
}

export function perceptionToSignals(event: PerceptionEvent): PerformanceSignal[] {
  if (event.confidence < 0.72) return [];
  if (event.type === 'face') {
    return [{ type: 'gaze', focus: 'user', x: clamp(event.x ?? 0, -1, 1), y: clamp(event.y ?? 0, -1, 1) }];
  }
  if (event.type === 'pointer') {
    return [{ type: 'gaze', focus: 'user', x: clamp(event.x ?? 0, -1, 1), y: clamp(event.y ?? 0, -1, 1) }];
  }
  if (event.type === 'hand' && event.gesture === 'wave') {
    return [{ type: 'gesture', name: 'wave', intensity: clamp(event.confidence, 0, 1), durationMs: 1000 }];
  }
  return [];
}
