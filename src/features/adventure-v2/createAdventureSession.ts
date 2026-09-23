import type { IronManAction } from '@/components/iron-man';
import type {
  AdventureAdapters,
  AdventureSession,
  ChildSignal,
  DirectorCommand,
  EpisodeBlueprint,
  ExperienceFrame,
  InteractionHitbox,
  InteractionTarget,
  SceneBlueprint,
  StagePhase,
  SpeechCue,
  WorldNode,
} from './types';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
const normaliseText = (text: string) => text.toLowerCase().replace(/[^a-z]/g, ' ').trim();

const CORE_POINTS = [
  { x: .28, y: .42 },
  { x: .70, y: .38 },
  { x: .52, y: .65 },
] as const;

const PALM_HITBOX: InteractionHitbox = {
  // The button is deliberately generous enough for a young child, while its
  // centre is kept on the visible right palm in the renderer.
  x: .50, y: .31, width: .34, height: .28,
};

type Runtime = {
  started: boolean;
  completed: boolean;
  disposed: boolean;
  paused: boolean;
  speed: number;
  sceneIndex: number;
  sceneElapsed: number;
  lastFrameAt: number;
  progress: number;
  helpLevel: 0 | 1 | 2;
  pointerActive: boolean;
  pointer: { x: number; y: number };
  pointerTravel: number;
  discoveredCores: Set<number>;
  droneHits: number;
  cueSerial: number;
  speechCue: SpeechCue;
  narration: 'idle' | 'pending' | 'speaking' | 'ended';
  narrationEndedAt: number;
  action: IronManAction;
  actionChangedAt: number;
};

const initialRuntime = (firstSceneId: string): Runtime => ({
  started: false,
  completed: false,
  disposed: false,
  paused: false,
  speed: 1,
  sceneIndex: 0,
  sceneElapsed: 0,
  lastFrameAt: 0,
  progress: 0,
  helpLevel: 0,
  pointerActive: false,
  pointer: { x: .5, y: .5 },
  pointerTravel: 0,
  discoveredCores: new Set(),
  droneHits: 0,
  cueSerial: 0,
  speechCue: { id: `${firstSceneId}:0`, text: '' },
  narration: 'idle',
  narrationEndedAt: 0,
  action: 'listening',
  actionChangedAt: 0,
});

const node = (
  id: string,
  kind: WorldNode['kind'],
  plane: WorldNode['plane'],
  x: number,
  y: number,
  scale: number,
  extra: Partial<WorldNode> = {},
): WorldNode => ({ id, kind, plane, x, y, scale, opacity: 1, ...extra });

function containsPoint(point: { x: number; y: number }, hitbox: InteractionHitbox) {
  if (hitbox.shape === 'circle') {
    return distance(point, { x: hitbox.x + hitbox.width / 2, y: hitbox.y + hitbox.height / 2 }) <= Math.max(hitbox.width, hitbox.height) / 2;
  }
  return point.x >= hitbox.x
    && point.x <= hitbox.x + hitbox.width
    && point.y >= hitbox.y
    && point.y <= hitbox.y + hitbox.height;
}

function coreHitbox(index: number): InteractionHitbox {
  const point = CORE_POINTS[index];
  return { x: point.x, y: point.y, width: .20, height: .20, shape: 'circle' };
}

function sceneTarget(scene: SceneBlueprint, runtime: Runtime): InteractionTarget | undefined {
  const play = scene.play;
  if (scene.id === 'suit-link') {
    return {
      id: 'ironman-palm',
      kind: 'tap',
      label: '触碰钢铁侠掌心',
      active: true,
      hitbox: PALM_HITBOX,
      progress: runtime.progress,
    };
  }
  if (!play) return undefined;
  if (play.kind === 'flight-approach') {
    return {
      id: 'flight-drag-surface',
      kind: 'drag',
      label: '拖动飞行方向',
      active: true,
      hitbox: { x: 0, y: 0, width: 1, height: 1 },
      progress: runtime.progress,
    };
  }
  if (play.kind === 'light-search') {
    return {
      id: 'search-drag-surface',
      kind: 'drag',
      label: '移动探照灯',
      active: true,
      hitbox: { x: 0, y: 0, width: 1, height: 1 },
      progress: runtime.progress,
    };
  }
  if (play.kind === 'drone-blockade') {
    return {
      id: 'drone-target',
      kind: 'tap',
      label: '打散黑云救出无人机',
      active: true,
      hitbox: { x: .60, y: .21, width: .25, height: .27, shape: 'circle' },
      progress: runtime.progress,
    };
  }
  return {
    id: 'lighthouse-core',
    kind: 'hold',
    label: '把光送进灯塔',
    active: true,
    hitbox: { x: .62, y: .35, width: .24, height: .34 },
    progress: runtime.progress,
  };
}

function updateAction(runtime: Runtime, desired: IronManAction, atMs: number, force = false) {
  if (runtime.action === desired) return;
  // A pose must settle before the next authored beat can replace it. This is
  // the small guard that prevents the old elapsed-% action thrashing.
  if (!force && atMs - runtime.actionChangedAt < 900) return;
  runtime.action = desired;
  runtime.actionChangedAt = atMs;
}

function desiredAction(scene: SceneBlueprint, runtime: Runtime): IronManAction {
  if (runtime.completed || (scene.id === 'dawn-sky-peak' || scene.id === 'star-home') && runtime.progress >= .9) return 'cheer';

  // Dynamic performance beats based on narration phrasing & dramatic scene context (Embodied Performance Model)
  const isSpeaking = runtime.narration !== 'ended';
  const elapsed = runtime.sceneElapsed;

  if (scene.id === 'signal-lab') {
    if (isSpeaking) return elapsed < 3500 ? 'greeting' : elapsed < 9000 ? 'speaking' : 'thinking';
    return 'thinking';
  }

  if (scene.id === 'armor-platform' || scene.id === 'suit-link') {
    if (isSpeaking) return elapsed < 4000 ? 'greeting' : 'speaking';
    return 'greeting';
  }

  if (scene.id === 'launch-tunnel') {
    if (isSpeaking) return elapsed < 4000 ? 'speaking' : 'fly';
    return 'fly';
  }

  if (scene.id === 'deep-space-flight' || scene.play?.kind === 'flight-approach') {
    return 'fly';
  }

  if (scene.id === 'black-cloud-storm') {
    if (isSpeaking) return elapsed < 4500 ? 'speaking' : 'repulsor-blast';
    return 'repulsor-blast';
  }

  if (scene.id === 'black-glass-valley') {
    if (isSpeaking) return elapsed < 4000 ? 'greeting' : 'peek';
    return 'peek';
  }

  if (scene.id === 'dark-valley-search' || scene.play?.kind === 'light-search') {
    if (isSpeaking) return elapsed < 5000 ? 'unibeam' : 'speaking';
    return 'unibeam';
  }

  if (scene.id === 'star-shelter' || scene.id === 'momo-reveal') {
    if (isSpeaking) return elapsed < 4000 ? 'happy' : 'speaking';
    return 'happy';
  }

  if (scene.id === 'lighthouse-veins') {
    if (isSpeaking) return elapsed < 4000 ? 'speaking' : 'unibeam';
    return 'unibeam';
  }

  if (scene.id === 'dawn-sky-peak' || scene.id === 'star-home') {
    return 'cheer';
  }

  return isSpeaking ? 'speaking' : 'greeting';
}

function sceneGraph(scene: SceneBlueprint, runtime: Runtime): { far: WorldNode[]; middle: WorldNode[]; near: WorldNode[] } {
  const p = clamp(runtime.progress);
  const far: WorldNode[] = [];
  const middle: WorldNode[] = [];
  const near: WorldNode[] = [];

  if (scene.camera === 'lab') {
    far.push(node('garage-window', 'lab-window', 'far', .5, .38, 1.1));
    far.push(node('distress-star', 'star', 'far', .73, .31, .065, { opacity: .5 + p * .25, state: 'active' }));
    middle.push(node('distress-signal', 'warning-ring', 'middle', .73, .31, .62, { opacity: .3 + p * .25, state: 'active' }));
    near.push(node('garage-console', 'cockpit-frame', 'near', .5, .86, 1.2, { opacity: .88 }));
  }

  if (scene.camera === 'cockpit') {
    far.push(node('cockpit-stars', 'particle', 'far', .5, .3, 1.35, { opacity: .75 }));
    middle.push(node('cockpit-frame', 'cockpit-frame', 'middle', .5, .53, 1.25, { opacity: .94 }));
    near.push(node('suit-link-energy', 'beam', 'near', .67, .44, .36, { opacity: .18 + p * .72, state: p > .8 ? 'complete' : 'active', target: true }));
  }

  if (scene.camera === 'flight') {
    far.push(node('deep-space', 'particle', 'far', .5, .44, 1.65, { opacity: .92 }));
    // Data scale deliberately runs from roughly 6% to roughly 70% of the
    // play space. CSS maps it to the same visible planet element each frame.
    far.push(node('planet', 'planet', 'far', .70, .43, .06 + p * .64, {
      state: p > .88 ? 'revealed' : 'active', progress: p, target: true,
    }));
    far.push(node('planet-lighthouse', 'star', 'far', .70, .34, .012 + p * .038, { opacity: .55 + p * .45 }));
    middle.push(node('flight-lane-left', 'flight-lane', 'middle', .28, .53, 1 - p * .15, { rotation: -8, opacity: .45 }));
    middle.push(node('flight-lane-right', 'flight-lane', 'middle', .66, .36, 1 - p * .12, { rotation: 6, opacity: .38 }));
    middle.push(node('asteroid-one', 'asteroid', 'middle', .47, .29, .55, { opacity: .7 }));
    middle.push(node('asteroid-two', 'asteroid', 'middle', .83, .61, .4, { opacity: .58 }));
    near.push(node('flight-speed', 'particle', 'near', runtime.pointer.x, runtime.pointer.y, .55 + p * .35, { opacity: .16 + p * .24 }));
  }

  if (scene.camera === 'valley' || scene.camera === 'search') {
    far.push(node('black-glass-horizon', 'valley', 'far', .5, .43, 1.35));
    far.push(node('dark-lighthouse', 'lighthouse', 'far', .79, .53, 1.03, { opacity: scene.camera === 'search' ? .56 : .86, state: 'active' }));
    middle.push(node('valley-mist', 'storm-cloud', 'middle', .30, .65, .6, { opacity: .16 }));
    middle.push(node('crystal-path', 'crystal', 'middle', .48, .69, .9, { opacity: .72 }));
    CORE_POINTS.forEach((point, index) => {
      const discovered = runtime.discoveredCores.has(index);
      middle.push(node(`power-core-${index + 1}`, 'power-core', 'middle', point.x, point.y, .8, {
        opacity: discovered ? .35 : 1,
        state: discovered ? 'revealed' : 'active',
        progress: discovered ? 1 : 0,
        interactive: scene.id === 'light-search',
        target: scene.id === 'light-search' && !discovered,
      }));
    });
    if (scene.id === 'light-search') {
      near.push(node('flashlight', 'beam', 'near', runtime.pointer.x, runtime.pointer.y, .52, {
        opacity: runtime.pointerActive ? .76 : .3,
        rotation: Math.atan2(runtime.pointer.y - .5, runtime.pointer.x - .5) * 180 / Math.PI,
        state: 'active',
      }));
    }
  }

  if (scene.id === 'momo-reveal') {
    const hitCount = Math.min(3, runtime.droneHits);
    middle.push(node('repair-drone', 'drone', 'middle', .72, .34, 1, {
      opacity: hitCount >= 3 ? .62 : 1,
      state: hitCount >= 3 ? 'complete' : 'active',
      progress: hitCount / 3,
      interactive: true,
      target: true,
    }));
    // Three visible layers make every rescue pulse consequential. A layer is
    // dimmed only after its corresponding palm-light hit lands.
    [0, 1, 2].forEach((index) => {
      const active = hitCount <= index;
      middle.push(node(`drone-shield-${index + 1}`, 'drone-shield', 'middle', .72, .34, 1 - index * .14, {
        opacity: active ? .76 : .06,
        state: active ? 'active' : 'complete',
        progress: active ? 0 : 1,
        target: active,
      }));
    });
    middle.push(node('momo-maintenance-mode', 'momo', 'middle', .60, .62, .62, {
      opacity: hitCount >= 3 ? 1 : .52,
      state: hitCount >= 3 ? 'revealed' : 'active',
    }));
    near.push(node('drone-reticle', 'reticle', 'near', .72, .34, .82, { opacity: .5 + p * .4, state: hitCount >= 3 ? 'complete' : 'active', progress: hitCount / 3 }));
  }

  if (scene.camera === 'lighthouse') {
    far.push(node('lighthouse-sky', 'valley', 'far', .5, .4, 1.42));
    far.push(node('lighthouse', 'lighthouse', 'middle', .77, .53, 1.08, {
      state: p > .85 ? 'complete' : 'active', progress: p,
    }));
    middle.push(node('core-socket', 'power-core', 'middle', .77, .39, .64, {
      opacity: .8 + p * .2, state: p > .85 ? 'complete' : 'active', target: true, progress: p,
    }));
    near.push(node('lighthouse-light', 'beam', 'near', .77, .28, .56 + p * .52, {
      opacity: .08 + p * .82, state: p > .85 ? 'complete' : 'active', progress: p,
    }));
    near.push(node('home-star', 'star', 'near', .76, .20, .08 + p * .04, { opacity: .52 + p * .48, state: p > .85 ? 'complete' : 'active' }));
  }

  return { far, middle, near };
}

function cameraFor(scene: SceneBlueprint, progress: number, pointer: { x: number; y: number }) {
  const p = clamp(progress);
  if (scene.camera === 'flight') return { x: (pointer.x - .5) * 2.2, y: (pointer.y - .5) * 1.5, zoom: 1 + p * .06, parallax: .9 };
  if (scene.camera === 'search') return { x: (pointer.x - .5) * 1.2, y: (pointer.y - .5) * .7, zoom: 1.03 + p * .05, parallax: .68 };
  return { x: 0, y: 0, zoom: 1, parallax: .52 };
}

function lightingFor(scene: SceneBlueprint, progress: number) {
  if (scene.camera === 'lab') return { ambient: '#101a35', accent: '#52c9ff', beam: .16 };
  if (scene.camera === 'cockpit') return { ambient: '#0c162e', accent: '#63d8ff', beam: .24 + progress * .56 };
  if (scene.camera === 'flight') return { ambient: '#101734', accent: '#68c9ff', beam: .18 + progress * .2 };
  if (scene.camera === 'search') return { ambient: '#11142d', accent: '#9e91ff', beam: .2 + progress * .36 };
  if (scene.camera === 'lighthouse') return { ambient: '#211a3d', accent: '#ffd776', beam: .18 + progress * .82 };
  return { ambient: '#171b36', accent: '#9a91ef', beam: .16 + progress * .2 };
}

function transitionFor(scene: SceneBlueprint): ExperienceFrame['transition'] {
  if (scene.id === 'approach-planet') return 'camera-dolly';
  if (scene.id === 'suit-link' || scene.id === 'star-home') return 'match-light';
  if (scene.id === 'light-search') return 'reveal';
  if (scene.id === 'momo-reveal') return 'storm-wash';
  return 'fade-in';
}

function soundscapeFor(scene: SceneBlueprint): ExperienceFrame['soundscape'] {
  if (scene.camera === 'lab' || scene.camera === 'cockpit') return scene.id === 'suit-link' ? 'launch' : 'lab-hum';
  if (scene.camera === 'flight') return 'wind';
  if (scene.camera === 'lighthouse') return 'warm-resolution';
  if (scene.camera === 'search' || scene.id === 'momo-reveal') return 'crystal-tone';
  return 'quiet-valley';
}

function handStateFor(scene: SceneBlueprint, progress: number): ExperienceFrame['child']['handState'] {
  if (scene.id === 'suit-link') return progress > .8 ? 'hold' : 'reach';
  if (scene.play?.kind === 'flight-approach') return 'steer';
  if (scene.play?.kind === 'light-search') return 'reach';
  if (scene.play?.kind === 'drone-blockade') return 'shield';
  if (scene.play?.kind === 'lighthouse-lighting') return 'hold';
  return 'rest';
}

function createFrame(episode: EpisodeBlueprint, runtime: Runtime, atMs: number, hasSpeechAdapter: boolean): ExperienceFrame {
  const scene = episode.scenes[runtime.sceneIndex] ?? episode.scenes[episode.scenes.length - 1];
  const p = clamp(runtime.progress);
  const phase: StagePhase = runtime.completed
    ? 'complete'
    : p >= .995 && runtime.narration === 'ended' ? 'resolving'
      : runtime.narration === 'speaking' ? 'speaking'
        : runtime.sceneElapsed < 900 ? 'opening' : 'playing';
  const graph = sceneGraph(scene, runtime);
  const target = sceneTarget(scene, runtime);
  const action = desiredAction(scene, runtime);
  updateAction(runtime, action, atMs);
  const actor: ExperienceFrame['actor'] = {
    id: 'ironman',
    x: scene.camera === 'flight' ? .28 + runtime.pointer.x * .08 : .59,
    y: scene.camera === 'flight' ? .58 + runtime.pointer.y * .04 : .62,
    scale: scene.camera === 'flight' ? .66 + p * .08 : .72,
    depth: scene.camera === 'flight' ? .18 : .05,
    action: runtime.action,
    attention: scene.intent === 'lead' || scene.intent === 'wonder' ? 'world' : scene.intent === 'invite' ? 'child' : 'instrument',
  };

  return {
    storyId: episode.id,
    started: runtime.started,
    completed: runtime.completed,
    paused: runtime.paused,
    speed: runtime.speed,
    speechCue: runtime.speechCue,
    narration: runtime.narration,
    scene: {
      id: scene.id,
      index: runtime.sceneIndex,
      total: episode.scenes.length,
      title: scene.title,
      line: scene.line,
      phase,
      progress: p,
      helpLevel: runtime.helpLevel,
      play: scene.play ? { ...scene.play, progress: p } : undefined,
    },
    camera: cameraFor(scene, p, runtime.pointer),
    lighting: lightingFor(scene, p),
    transition: transitionFor(scene),
    ...graph,
    actor,
    child: {
      mode: 'co-pilot',
      x: .18,
      y: .81,
      energy: clamp(p * .9 + (scene.play ? .1 : 0)),
      handState: handStateFor(scene, p),
      hud: 'hulkbuster',
    },
    learningCue: scene.learningCue,
    interaction: target,
    interactionTarget: target,
    soundscape: soundscapeFor(scene),
  };
}

/**
 * The only stateful seam exposed to React. Child input goes through send();
 * adult/debug operations go through control(). The renderer never mutates the
 * story or infers when a scene is complete.
 */
export function createAdventureSession(episode: EpisodeBlueprint, adapters: AdventureAdapters = {}): AdventureSession {
  const runtime = initialRuntime(episode.scenes[0]?.id ?? 'scene');
  const hasSpeechAdapter = adapters.speak !== undefined;

  const currentScene = () => episode.scenes[runtime.sceneIndex] ?? episode.scenes[episode.scenes.length - 1];

  const makeSpeechCue = (scene: SceneBlueprint) => {
    runtime.cueSerial += 1;
    runtime.speechCue = { id: `${scene.id}:${runtime.cueSerial}`, text: scene.line };
  };

  const speakCurrent = () => {
    if (!runtime.started || runtime.completed || runtime.disposed) return;
    const scene = currentScene();
    runtime.narration = hasSpeechAdapter ? 'pending' : 'ended';
    runtime.narrationEndedAt = hasSpeechAdapter ? -1 : runtime.sceneElapsed;
    makeSpeechCue(scene);
    adapters.speak?.(scene.line, {
      sceneId: scene.id,
      intent: scene.intent,
      learningWord: scene.learningCue?.toLowerCase() as 'star' | 'light' | undefined,
      cueId: runtime.speechCue.id,
    });
  };

  const resetScene = (index: number, atMs: number, speak = true) => {
    runtime.sceneIndex = Math.max(0, Math.min(index, episode.scenes.length - 1));
    runtime.sceneElapsed = 0;
    runtime.lastFrameAt = atMs;
    runtime.progress = 0;
    runtime.helpLevel = 0;
    runtime.pointerActive = false;
    runtime.pointer = { x: .5, y: .5 };
    runtime.pointerTravel = 0;
    runtime.discoveredCores = new Set();
    runtime.droneHits = 0;
    runtime.narration = 'idle';
    runtime.narrationEndedAt = -1;
    const targetScene = episode.scenes[runtime.sceneIndex] ?? episode.scenes[0];
    runtime.action = desiredAction(targetScene, runtime);
    runtime.actionChangedAt = atMs;
    if (speak) speakCurrent();
  };

  const completeStory = () => {
    if (runtime.completed) return;
    runtime.completed = true;
    runtime.progress = 1;
    runtime.narration = 'ended';
    runtime.action = 'cheer';
    adapters.onComplete?.();
  };

  const canExit = (scene: SceneBlueprint) => {
    // A speech adapter is authoritative. Without one (for deterministic
    // silent tests/offline devices), the authored duration is the fallback.
    const narrationEnded = runtime.narration === 'ended';
    if (!narrationEnded) return false;
    if (scene.exit.kind === 'performance-complete') {
      const settle = scene.settleMs ?? 900;
      return hasSpeechAdapter
        ? runtime.sceneElapsed - runtime.narrationEndedAt >= settle
        : runtime.sceneElapsed >= scene.durationMs;
    }
    return runtime.progress >= .995;
  };

  const finishScene = (atMs: number) => {
    if (runtime.completed) return;
    const scene = currentScene();
    if (!canExit(scene)) return;
    if (runtime.sceneIndex >= episode.scenes.length - 1) {
      completeStory();
      return;
    }
    resetScene(runtime.sceneIndex + 1, atMs);
  };

  const advanceClock = (atMs: number) => {
    if (!runtime.started || runtime.completed || runtime.disposed) {
      runtime.lastFrameAt = atMs;
      return;
    }
    const delta = Math.max(0, atMs - runtime.lastFrameAt);
    runtime.lastFrameAt = atMs;
    if (!runtime.paused) runtime.sceneElapsed += delta * runtime.speed;
    const scene = currentScene();
    const helpOneAt = Math.min(scene.durationMs * .28, 2_500);
    const helpTwoAt = Math.min(scene.durationMs * .55, 5_000);
    runtime.helpLevel = runtime.sceneElapsed >= helpTwoAt ? 2 : runtime.sceneElapsed >= helpOneAt ? 1 : 0;

    // A gentle co-pilot assist keeps a child from getting stuck. It is gradual
    // world progress, never a time-based scene jump. Once the help ladder has
    // reached its final rung at five seconds, the shared work completes within
    // roughly 8–15 seconds even on a screen with no child input.
    if (!runtime.paused && scene.play && runtime.helpLevel >= 2 && !runtime.pointerActive) {
      if (scene.play.kind === 'drone-blockade') {
        const assistedHits = Math.min(3, Math.floor((runtime.sceneElapsed - helpTwoAt) / 2_200) + 1);
        runtime.droneHits = Math.max(runtime.droneHits, assistedHits);
        runtime.progress = clamp(runtime.droneHits / 3);
      } else {
        const assistRate = .00014;
        runtime.progress = clamp(runtime.progress + delta * runtime.speed * assistRate);
        if (scene.play.kind === 'light-search') {
          const assistedCores = Math.min(CORE_POINTS.length, Math.floor(runtime.progress * CORE_POINTS.length + .00001));
          for (let index = 0; index < assistedCores; index += 1) runtime.discoveredCores.add(index);
        }
      }
    }
    updateAction(runtime, desiredAction(scene, runtime), atMs);
    finishScene(atMs);
  };

  const registerCore = (point: { x: number; y: number }) => {
    const index = CORE_POINTS.findIndex((core, idx) => !runtime.discoveredCores.has(idx) && distance(core, point) < .14);
    if (index < 0) return;
    runtime.discoveredCores.add(index);
    runtime.progress = clamp(runtime.discoveredCores.size / CORE_POINTS.length);
  };

  const registerDrone = (point: { x: number; y: number }) => {
    if (!containsPoint(point, { x: .60, y: .21, width: .25, height: .27, shape: 'circle' })) return;
    runtime.droneHits = Math.min(3, runtime.droneHits + 1);
    runtime.progress = clamp(runtime.droneHits / 3);
  };

  const applyPointer = (phase: 'start' | 'move' | 'end', point: { x: number; y: number }, atMs: number) => {
    const scene = currentScene();
    const previous = runtime.pointer;
    runtime.pointer = { x: clamp(point.x), y: clamp(point.y) };
    runtime.pointerTravel += distance(previous, runtime.pointer);
    runtime.pointerActive = phase !== 'end';

    if (scene.id === 'suit-link') {
      // A pointer event originating from the real palm target is accepted;
      // unrelated stage movement remains inert.
      if (phase === 'end' && containsPoint(runtime.pointer, PALM_HITBOX)) runtime.progress = 1;
    } else if (scene.play?.kind === 'flight-approach') {
      if (phase === 'start') runtime.progress += .025;
      else runtime.progress += .008 + distance(previous, runtime.pointer) * .42;
    } else if (scene.play?.kind === 'light-search') {
      registerCore(runtime.pointer);
    } else if (scene.play?.kind === 'drone-blockade' && phase === 'end') {
      registerDrone(runtime.pointer);
    } else if (scene.play?.kind === 'lighthouse-lighting') {
      if (containsPoint(runtime.pointer, { x: .62, y: .35, width: .24, height: .34 })) {
        runtime.progress = clamp(runtime.progress + (phase === 'start' ? .24 : .08));
      }
    }
    runtime.progress = clamp(runtime.progress);
    updateAction(runtime, desiredAction(scene, runtime), atMs);
    finishScene(atMs);
  };

  const applySignal = (signal: ChildSignal) => {
    if (!runtime.started || runtime.completed || runtime.disposed || runtime.paused) return;
    advanceClock(signal.atMs);
    if (runtime.completed) return;
    const scene = currentScene();

    if (signal.kind === 'voice') {
      const expected = scene.learningCue?.toLowerCase();
      const words = normaliseText(signal.text).split(/\s+/).filter(Boolean);
      if ((expected && words.includes(expected)) || words.includes('star') || words.includes('light')) {
        if (scene.play?.kind === 'light-search') {
          CORE_POINTS.forEach((_, index) => runtime.discoveredCores.add(index));
          runtime.progress = 1;
        } else if (scene.play?.kind === 'lighthouse-lighting') {
          runtime.progress = 1;
        } else {
          runtime.progress = Math.min(1, runtime.progress + 0.35);
        }
      }
      finishScene(signal.atMs);
      return;
    }

    if (signal.kind === 'key') {
      const step = signal.key === 'ArrowLeft' || signal.key === 'ArrowUp' ? -.12 : .12;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(signal.key)) {
        applyPointer('move', { x: runtime.pointer.x + (signal.key === 'ArrowLeft' ? -.12 : signal.key === 'ArrowRight' ? .12 : 0), y: runtime.pointer.y + (signal.key === 'ArrowUp' ? -.12 : signal.key === 'ArrowDown' ? .12 : 0) }, signal.atMs);
      } else if (step) {
        applyPointer('move', runtime.pointer, signal.atMs);
      }
      return;
    }

    if (signal.kind === 'tap') {
      const point = { x: clamp(signal.x), y: clamp(signal.y) };
      runtime.pointer = point;
      if (scene.id === 'suit-link') {
        // Crucially, a random stage tap is not a palm connection.
        if (containsPoint(point, PALM_HITBOX)) runtime.progress = 1;
      } else if (scene.play?.kind === 'flight-approach') {
        // Taps are a useful desktop fallback/debug gesture; drag remains the
        // primary path and both routes share the same world progress state.
        runtime.progress += .2;
      } else if (scene.play?.kind === 'light-search') {
        registerCore(point);
      } else if (scene.play?.kind === 'drone-blockade') {
        registerDrone(point);
      } else if (scene.play?.kind === 'lighthouse-lighting') {
        if (containsPoint(point, { x: .62, y: .35, width: .24, height: .34 })) runtime.progress = 1;
      }
      runtime.progress = clamp(runtime.progress);
      updateAction(runtime, desiredAction(scene, runtime), signal.atMs);
      finishScene(signal.atMs);
      return;
    }

    applyPointer(signal.phase, { x: signal.x, y: signal.y }, signal.atMs);
  };

  const gotoScene = (index: number, atMs: number) => {
    runtime.started = true;
    runtime.completed = false;
    runtime.paused = false;
    resetScene(index, atMs);
  };

  const control = (command: DirectorCommand) => {
    if (runtime.disposed) return;
    // Accepting `kind` as a runtime alias makes the seam friendly to small
    // debug scripts while the exported type remains the explicit `type` union.
    const raw = command as unknown as {
      type?: string;
      kind?: string;
      scene?: number | string;
      sceneIndex?: number;
      index?: number;
      sceneId?: string;
      speed?: number;
      value?: number;
      cueId?: string;
    };
    const type = raw.type ?? raw.kind;
    const atMs = adapters.now?.() ?? runtime.lastFrameAt;
    switch (type) {
      case 'play':
        if (!runtime.started) {
          runtime.started = true;
          resetScene(runtime.sceneIndex, atMs);
        }
        runtime.paused = false;
        break;
      case 'pause':
        runtime.paused = true;
        break;
      case 'restart':
        runtime.started = true;
        runtime.completed = false;
        runtime.paused = false;
        resetScene(0, atMs);
        break;
      case 'goto-scene': {
        const requested = raw.index ?? raw.sceneIndex ?? raw.scene;
        const index = typeof requested === 'number'
          ? requested
          : typeof requested === 'string'
            ? episode.scenes.findIndex((scene) => scene.id === requested)
            : raw.sceneId ? episode.scenes.findIndex((scene) => scene.id === raw.sceneId) : runtime.sceneIndex;
        if (index >= 0) gotoScene(index, atMs);
        break;
      }
      case 'previous':
        gotoScene(Math.max(0, runtime.sceneIndex - 1), atMs);
        break;
      case 'next':
        gotoScene(Math.min(episode.scenes.length - 1, runtime.sceneIndex + 1), atMs);
        break;
      case 'replay-line':
        speakCurrent();
        break;
      case 'set-speed':
        runtime.speed = clamp(Number(raw.speed ?? raw.value) || 1, .5, 2);
        break;
      case 'narration-started':
        if (!raw.cueId || raw.cueId === runtime.speechCue.id) runtime.narration = 'speaking';
        break;
      case 'narration-ended':
        if (!raw.cueId || raw.cueId === runtime.speechCue.id) {
          runtime.narration = 'ended';
          runtime.narrationEndedAt = runtime.sceneElapsed;
          updateAction(runtime, desiredAction(currentScene(), runtime), atMs);
          finishScene(atMs);
        }
        break;
      default:
        break;
    }
  };

  return {
    begin() {
      if (runtime.disposed) return;
      if (runtime.started && !runtime.completed) {
        runtime.paused = false;
        return;
      }
      runtime.started = true;
      runtime.completed = false;
      runtime.paused = false;
      const atMs = adapters.now?.() ?? 0;
      resetScene(runtime.sceneIndex, atMs);
    },
    send(signal) {
      applySignal(signal);
    },
    control,
    frame(atMs = adapters.now?.() ?? runtime.lastFrameAt) {
      advanceClock(atMs);
      return createFrame(episode, runtime, atMs, hasSpeechAdapter);
    },
    dispose() {
      runtime.disposed = true;
      runtime.pointerActive = false;
    },
  };
}

export default createAdventureSession;
