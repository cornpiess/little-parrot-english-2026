import type { IronManAction } from '@/components/iron-man';

/**
 * The story author describes intent. Coordinates, hit testing and animation
 * timing stay inside the runtime/renderer seam.
 */
export type IronSceneId =
  | 'signal-lab'
  | 'suit-link'
  | 'approach-planet'
  | 'black-glass-valley'
  | 'light-search'
  | 'momo-reveal'
  | 'star-home';

export type PlayKind =
  | 'flight-approach'
  | 'light-search'
  | 'drone-blockade'
  | 'lighthouse-lighting';

export type SceneExit =
  | { kind: 'performance-complete' }
  | { kind: 'world-goal'; key: string }
  | { kind: 'co-action-resolved'; key: string };

export type StoryIntent =
  | 'notice'
  | 'invite'
  | 'lead'
  | 'protect'
  | 'wonder'
  | 'understand'
  | 'build'
  | 'celebrate';

export interface SceneBlueprint {
  id: IronSceneId;
  title: string;
  line: string;
  /** Maximum authored time. Playable scenes never jump just because this expires. */
  durationMs: number;
  /** The minimum quiet settle window after narration has ended. */
  settleMs?: number;
  intent: StoryIntent;
  camera: 'lab' | 'cockpit' | 'flight' | 'valley' | 'search' | 'lighthouse';
  play?: { kind: PlayKind; target?: string };
  learningCue?: 'STAR' | 'LIGHT';
  exit: SceneExit;
}

export interface EpisodeBlueprint {
  id: string;
  title: string;
  subtitle: string;
  targetWords: readonly ['star', 'light'];
  scenes: readonly SceneBlueprint[];
}

export interface SpeakMeta {
  sceneId: IronSceneId;
  intent: StoryIntent;
  learningWord?: 'star' | 'light';
  /** Stable cue identity used to return TTS lifecycle events to the director. */
  cueId?: string;
}

export interface AdventureAdapters {
  speak?: (text: string, meta: SpeakMeta) => void;
  now?: () => number;
  onComplete?: () => void;
}

export type ChildSignal =
  | { kind: 'tap'; x: number; y: number; atMs: number }
  | { kind: 'pointer'; phase: 'start' | 'move' | 'end'; x: number; y: number; atMs: number }
  | { kind: 'voice'; text: string; final?: boolean; atMs: number }
  | { kind: 'key'; key: string; atMs: number };

/** Commands are adult/director operations. They are intentionally separate from ChildSignal. */
export type DirectorCommand =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'restart' }
  | { type: 'goto-scene'; index?: number; sceneIndex?: number; sceneId?: IronSceneId }
  | { type: 'previous' }
  | { type: 'next' }
  | { type: 'replay-line' }
  | { type: 'set-speed'; speed: number; value?: number }
  | { type: 'narration-started'; cueId?: string }
  | { type: 'narration-ended'; cueId?: string };

export type StagePhase = 'opening' | 'speaking' | 'playing' | 'resolving' | 'complete';
export type WorldPlane = 'far' | 'middle' | 'near';
export type WorldNodeKind =
  | 'lab-window'
  | 'warning-ring'
  | 'cockpit-frame'
  | 'planet'
  | 'star'
  | 'storm-cloud'
  | 'storm-spark'
  | 'valley'
  | 'crystal'
  | 'momo'
  | 'lighthouse'
  | 'beam'
  | 'flight-lane'
  | 'asteroid'
  | 'power-core'
  | 'drone'
  | 'drone-shield'
  | 'reticle'
  | 'camera-hud'
  | 'particle';

export interface WorldNode {
  id: string;
  kind: WorldNodeKind;
  plane: WorldPlane;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation?: number;
  progress?: number;
  state?: 'idle' | 'active' | 'revealed' | 'complete';
  interactive?: boolean;
  target?: boolean;
}

export interface InteractionHitbox {
  /** Normalised stage coordinates. */
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: 'rect' | 'circle';
}

export interface InteractionTarget {
  id: string;
  kind: 'tap' | 'drag' | 'hold';
  label: string;
  active: boolean;
  hitbox: InteractionHitbox;
  progress: number;
}

export interface SpeechCue {
  id: string;
  text: string;
}

export interface ActorFrame {
  id: 'ironman';
  x: number;
  y: number;
  scale: number;
  depth: number;
  action: IronManAction;
  attention: 'child' | 'world' | 'instrument';
}

export interface ChildEmbodiment {
  mode: 'co-pilot';
  x: number;
  y: number;
  energy: number;
  handState: 'rest' | 'reach' | 'steer' | 'shield' | 'hold';
  /** The renderer uses this to keep the video inside a recognizable HUD. */
  hud: 'hulkbuster';
}

export interface ExperienceFrame {
  storyId: string;
  started: boolean;
  completed: boolean;
  paused: boolean;
  speed: number;
  speechCue: SpeechCue;
  narration: 'idle' | 'pending' | 'speaking' | 'ended';
  scene: {
    id: IronSceneId;
    index: number;
    total: number;
    title: string;
    line: string;
    phase: StagePhase;
    progress: number;
    helpLevel: 0 | 1 | 2;
    play?: { kind: PlayKind; target?: string; progress: number };
  };
  camera: { x: number; y: number; zoom: number; parallax: number };
  lighting: { ambient: string; accent: string; beam: number };
  transition: 'fade-in' | 'match-light' | 'camera-dolly' | 'storm-wash' | 'reveal' | 'crossfade';
  far: WorldNode[];
  middle: WorldNode[];
  near: WorldNode[];
  actor: ActorFrame;
  child: ChildEmbodiment;
  learningCue?: 'STAR' | 'LIGHT';
  interaction?: InteractionTarget;
  /** Alias kept so tools can consume a single explicit active target. */
  interactionTarget?: InteractionTarget;
  soundscape: 'lab-hum' | 'launch' | 'wind' | 'quiet-valley' | 'crystal-tone' | 'warm-resolution';
}

export interface AdventureSession {
  begin(): void;
  send(signal: ChildSignal): void;
  control(command: DirectorCommand): void;
  frame(atMs?: number): ExperienceFrame;
  dispose(): void;
}
