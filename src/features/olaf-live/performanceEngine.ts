import type {
  CharacterMode,
  EmotionVector,
  GestureName,
  PerformanceFrame,
  PerformanceSignal,
} from './types';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
const signedClamp = (value: number) => clamp(value, -1, 1);
const damp = (from: number, to: number, elapsedMs: number, response = 0.012) => {
  const amount = 1 - Math.exp(-Math.max(0, elapsedMs) * response);
  return from + (to - from) * amount;
};

const emotionForMode = (mode: CharacterMode): EmotionVector => {
  switch (mode) {
    case 'speaking': return { valence: 0.35, arousal: 0.52, dominance: 0.45 };
    case 'thinking': return { valence: 0.08, arousal: 0.25, dominance: 0.4 };
    case 'listening': return { valence: 0.22, arousal: 0.32, dominance: 0.35 };
    case 'acting': return { valence: 0.55, arousal: 0.7, dominance: 0.5 };
    default: return { valence: 0.2, arousal: 0.16, dominance: 0.3 };
  }
};

export function createIdlePerformance(): PerformanceFrame {
  return {
    clockMs: 0,
    mode: 'idle',
    emotion: emotionForMode('idle'),
    gaze: { x: 0, y: 0, focus: 'user' },
    face: { blink: 0, browRaise: 0.12, smile: 0.25, mouthOpen: 0, mouthWide: 0.25, cheekRaise: 0.1 },
    pose: { headTilt: 0, headTurn: 0, bodyLean: 0, bodyBounce: 0.08, leftArm: 0, rightArm: 0 },
    gestureProgress: 0,
  };
}

function applyGesture(frame: PerformanceFrame, name: GestureName, intensity: number, durationMs: number) {
  const amount = clamp(intensity);
  frame.activeGesture = name;
  frame.gestureProgress = 0;
  frame.gestureDurationMs = durationMs;
  switch (name) {
    case 'wave': frame.pose.rightArm = Math.max(frame.pose.rightArm, amount); break;
    case 'nod': frame.pose.bodyBounce = Math.max(frame.pose.bodyBounce, amount); break;
    case 'shake': frame.pose.headTurn = Math.max(Math.abs(frame.pose.headTurn), amount); break;
    case 'point': frame.pose.rightArm = Math.max(frame.pose.rightArm, amount * 0.9); break;
    case 'openArms': frame.pose.leftArm = -amount; frame.pose.rightArm = amount; break;
    case 'think': frame.pose.headTilt = -0.3 * amount; frame.pose.rightArm = amount * 0.35; break;
    case 'celebrate': frame.pose.leftArm = -amount; frame.pose.rightArm = amount; frame.pose.bodyBounce = amount; break;
    case 'listen': frame.pose.bodyLean = amount * 0.35; break;
  }
}

export function mergePerformanceSignals(base: PerformanceFrame, signals: PerformanceSignal[]): PerformanceFrame {
  const next: PerformanceFrame = {
    ...base,
    emotion: { ...base.emotion },
    gaze: { ...base.gaze },
    face: { ...base.face },
    pose: { ...base.pose },
  };

  for (const signal of signals) {
    if (signal.type === 'mode') {
      next.mode = signal.mode;
      next.emotion = emotionForMode(signal.mode);
    } else if (signal.type === 'emotion') {
      next.emotion = {
        valence: signedClamp(signal.valence),
        arousal: clamp(signal.arousal),
        dominance: clamp(signal.dominance),
      };
      next.face.smile = clamp((next.emotion.valence + 1) / 2 * 0.75);
      next.face.cheekRaise = clamp(next.emotion.arousal * 0.7);
      next.face.browRaise = clamp(next.emotion.arousal * 0.65);
    } else if (signal.type === 'gaze') {
      next.gaze = { x: signedClamp(signal.x), y: signedClamp(signal.y), focus: signal.focus };
      next.pose.headTurn = signedClamp(signal.x) * 0.18;
      next.pose.headTilt = signedClamp(signal.y) * 0.12;
    } else if (signal.type === 'speech') {
      next.mode = signal.speaking ? 'speaking' : next.mode === 'speaking' ? 'listening' : next.mode;
      const energy = clamp(signal.energy);
      next.face.mouthOpen = signal.speaking ? clamp(energy * 0.92 + signal.emphasis * 0.08) : 0;
      next.face.mouthWide = clamp(signal.spectralCentroid * 0.7 + 0.18);
      next.pose.bodyBounce = Math.max(next.pose.bodyBounce, clamp(energy * 0.5 + signal.emphasis * 0.2));
    } else if (signal.type === 'gesture') {
      applyGesture(next, signal.name, signal.intensity ?? 1, signal.durationMs ?? 900);
    }
  }

  return next;
}

export function reducePerformanceFrame(
  previous: PerformanceFrame,
  signals: PerformanceSignal[],
  elapsedMs: number,
): PerformanceFrame {
  const target = mergePerformanceSignals(previous, signals);
  const hasNewGesture = signals.some((signal) => signal.type === 'gesture');
  const gestureDurationMs = previous.gestureDurationMs ?? 900;
  const gestureExpired = previous.activeGesture
    && previous.gestureProgress + elapsedMs / Math.max(500, gestureDurationMs) >= 1;
  if (gestureExpired && !hasNewGesture) {
    target.activeGesture = undefined;
    target.gestureProgress = 1;
    target.gestureDurationMs = undefined;
    target.pose.leftArm = 0;
    target.pose.rightArm = 0;
    target.pose.headTurn = target.gaze.x * 0.18;
    target.pose.headTilt = target.gaze.y * 0.12;
    target.pose.bodyBounce = target.mode === 'idle' ? 0.08 : 0;
  }
  const next: PerformanceFrame = {
    ...target,
    clockMs: previous.clockMs + Math.max(0, elapsedMs),
    emotion: {
      valence: damp(previous.emotion.valence, target.emotion.valence, elapsedMs),
      arousal: damp(previous.emotion.arousal, target.emotion.arousal, elapsedMs),
      dominance: damp(previous.emotion.dominance, target.emotion.dominance, elapsedMs),
    },
    gaze: {
      ...target.gaze,
      x: damp(previous.gaze.x, target.gaze.x, elapsedMs, 0.018),
      y: damp(previous.gaze.y, target.gaze.y, elapsedMs, 0.018),
    },
    face: { ...target.face },
    pose: { ...target.pose },
  };

  for (const key of Object.keys(next.face) as Array<keyof PerformanceFrame['face']>) {
    next.face[key] = damp(previous.face[key], target.face[key], elapsedMs, key === 'blink' ? 0.04 : 0.02);
  }
  for (const key of Object.keys(next.pose) as Array<keyof PerformanceFrame['pose']>) {
    next.pose[key] = damp(previous.pose[key], target.pose[key], elapsedMs, 0.014);
  }
  const newGestureDuration = signals.find((signal) => signal.type === 'gesture')?.durationMs;
  next.gestureProgress = clamp(previous.gestureProgress + elapsedMs / Math.max(500, newGestureDuration ?? gestureDurationMs));
  return next;
}
