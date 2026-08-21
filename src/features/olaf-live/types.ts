export type CharacterMode = 'idle' | 'listening' | 'thinking' | 'speaking' | 'acting';
export type EmotionName = 'neutral' | 'joy' | 'curiosity' | 'surprise' | 'comfort' | 'shy' | 'encourage';
export type GazeFocus = 'user' | 'object' | 'away';
export type GestureName =
  | 'wave'
  | 'nod'
  | 'shake'
  | 'point'
  | 'openArms'
  | 'think'
  | 'celebrate'
  | 'listen';

export interface EmotionVector {
  valence: number;
  arousal: number;
  dominance: number;
}

export interface GazeTarget {
  x: number;
  y: number;
  focus: GazeFocus;
}

export interface FaceParameters {
  blink: number;
  browRaise: number;
  smile: number;
  mouthOpen: number;
  mouthWide: number;
  cheekRaise: number;
}

export interface PoseParameters {
  headTilt: number;
  headTurn: number;
  bodyLean: number;
  bodyBounce: number;
  leftArm: number;
  rightArm: number;
}

export interface PerformanceFrame {
  clockMs: number;
  mode: CharacterMode;
  emotion: EmotionVector;
  gaze: GazeTarget;
  face: FaceParameters;
  pose: PoseParameters;
  activeGesture?: GestureName;
  gestureProgress: number;
  gestureDurationMs?: number;
}

export type PerformanceSignal =
  | { type: 'mode'; mode: CharacterMode }
  | { type: 'emotion'; valence: number; arousal: number; dominance: number; name?: EmotionName }
  | { type: 'gaze'; focus: GazeFocus; x: number; y: number }
  | { type: 'speech'; speaking: boolean; energy: number; spectralCentroid: number; emphasis: number }
  | { type: 'gesture'; name: GestureName; intensity?: number; durationMs?: number };

export interface PerceptionEvent {
  type: 'face' | 'hand' | 'pointer';
  confidence: number;
  x?: number;
  y?: number;
  gesture?: 'wave' | 'raise-hand' | 'smile';
  timestamp: number;
}

export interface CharacterToolCall {
  name: 'set_emotion' | 'perform_gesture' | 'set_gaze' | 'react';
  args: Record<string, unknown>;
}

export interface CharacterSessionEvent {
  type: 'audio' | 'transcript' | 'input-transcript' | 'tool-call' | 'status' | 'error';
  data?: unknown;
}

export type CharacterSessionListener = (event: CharacterSessionEvent) => void;

export interface RealtimeCharacterSession {
  connect(): Promise<void>;
  sendAudio(chunk: ArrayBuffer): void;
  sendPerception(event: PerceptionEvent): void;
  interrupt(): void;
  close(): void;
  subscribe(listener: CharacterSessionListener): () => void;
}
