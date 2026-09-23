import type {
  DramaticObjective,
  InteractionPhase,
  SceneObjectAction,
  SceneObjectAnchor,
  SceneObjectFrame,
  SceneObjectGrip,
  SceneObjectIntent,
  SceneObjectState,
  EmbodiedTurnIntent,
} from './embodiedInteraction';
import { resolvePropDefinition, type PlayMotion, type PlayProfile, type PropDefinition } from './propCatalog';

export type PerformanceBeatRole = 'anticipation' | 'action' | 'contact' | 'reaction' | 'settle';

export interface PerformanceBeat {
  role: PerformanceBeatRole;
  durationMs: number;
  motion: PlayMotion;
}

export interface PerformanceVariation {
  tempo: number;
  amplitude: number;
  curve: number;
}

export interface PerformanceScore {
  timing: Partial<Record<InteractionPhase, number>>;
  performance: Record<InteractionPhase, [DramaticObjective, string, number]>;
  beats: PerformanceBeat[];
  variation: PerformanceVariation;
  loop?: PlayProfile;
}

export interface PerformanceSpeechCue {
  text: string;
  emphasisWords: string[];
  beat: PerformanceBeatRole;
}

export interface SceneSampleContext {
  sceneId: string;
  phase: InteractionPhase;
  elapsed: number;
  reveal: number;
  settling: number;
  isOffered: boolean;
  isPraised: boolean;
  consumeProgress: number;
}

interface CompiledObject {
  request: SceneObjectIntent;
  definition: PropDefinition;
  action: SceneObjectAction;
  motion: PlayMotion;
  playProfile?: PlayProfile;
}

export interface CompiledEmbodiedScene {
  intent: EmbodiedTurnIntent;
  objects: CompiledObject[];
  firstDefinition: PropDefinition;
  activeAction: SceneObjectAction;
  score: PerformanceScore;
  sampleObject(index: number, context: SceneSampleContext): SceneObjectFrame;
  speechCueFor(phase: InteractionPhase): PerformanceSpeechCue | null;
}

const supportedActions = new Set<SceneObjectAction>(['show', 'offer', 'wear', 'eat', 'smell', 'open', 'read', 'place', 'play']);
const defaultPlayProfile: PlayProfile = { cycleMs: 780, cycles: 3, exit: 'hold' };

const normalizeObjects = (intent: EmbodiedTurnIntent): SceneObjectIntent[] => {
  if (intent.objects?.length) return intent.objects.slice(0, 2).filter((object) => object.concept.trim());
  return [{ concept: intent.concept, action: intent.objectAction, emoji: intent.emoji }];
};

function actionFor(request: SceneObjectIntent, intent: EmbodiedTurnIntent, definition: PropDefinition): SceneObjectAction {
  const requested = request.action ?? intent.objectAction ?? 'show';
  return definition.capabilities.includes(requested) && supportedActions.has(requested) ? requested : 'show';
}

function has(definition: PropDefinition, affordance: PropDefinition['affordances'][number]) {
  return definition.affordances.includes(affordance);
}

function motionFor(action: SceneObjectAction, definition: PropDefinition, target?: SceneObjectIntent['target']): PlayMotion {
  if (action === 'wear' && has(definition, 'wearable')) return 'hold';
  if (action === 'eat' && has(definition, 'edible')) return 'mouth';
  if (action === 'smell' && has(definition, 'smellable')) return 'mouth';
  if (action === 'read' && has(definition, 'readable')) return 'hold';
  if (action === 'open' && has(definition, 'openable')) return 'hold';
  if (action === 'place' || target === 'stage') return 'ground-roll';
  if (action === 'play') return definition.playMotion;
  return 'hold';
}

function motionAnchor(action: SceneObjectAction, motion: PlayMotion, definition: PropDefinition, phase: InteractionPhase, elapsed: number, playProfile?: PlayProfile): SceneObjectAnchor {
  if (action === 'wear') {
    const progress = Math.min(1, elapsed / 900);
    if (['name', 'settle', 'complete'].includes(phase)) return 'head';
    if (phase === 'act' && progress >= 0.35) return 'body';
  }
  const playingOrExiting = action === 'play' && ['act', 'name', 'settle', 'complete'].includes(phase);
  if ((phase === 'act' || playingOrExiting) && motion === 'mouth') return 'mouth';
  if ((phase === 'act' || playingOrExiting) && motion === 'float') return 'body';
  if ((phase === 'act' || playProfile?.exit === 'land') && motion === 'ground-roll') return 'stage';
  if (action === 'place' && ['act', 'name', 'settle', 'complete'].includes(phase)) return 'stage';
  return definition.defaultAnchor === 'head' ? 'right-hand' : definition.defaultAnchor;
}

function objectState(action: SceneObjectAction, anchor: SceneObjectAnchor, phase: InteractionPhase, offered: boolean, consumed: boolean): SceneObjectState {
  if (consumed) return 'gone';
  if (action === 'open' && ['name', 'settle', 'complete'].includes(phase)) return 'open';
  if (anchor === 'head') return 'worn';
  if (anchor === 'mouth') return action === 'eat' ? 'consuming' : 'held';
  if (anchor === 'stage') return 'placed';
  return offered ? 'presented' : 'held';
}

function objectGrip(action: SceneObjectAction, anchor: SceneObjectAnchor, definition: PropDefinition, consumed: boolean): SceneObjectGrip {
  if (consumed || ['head', 'body', 'stage'].includes(anchor)) return 'none';
  if (anchor === 'both-hands') return 'both';
  if (anchor === 'mouth') return action === 'eat' ? 'both' : 'right';
  return definition.defaultGrip;
}

function offsetFor(action: SceneObjectAction, motion: PlayMotion, anchor: SceneObjectAnchor, context: SceneSampleContext, index: number, variation: PerformanceVariation, playProfile?: PlayProfile) {
  const { phase, elapsed, isOffered, reveal } = context;
  if (anchor === 'head') return { x: 0, y: -8 };
  if (anchor === 'mouth') return { x: 45, y: 12 };
  if (anchor === 'body') {
    if (action === 'wear') {
      const progress = Math.min(1, elapsed / (900 * variation.tempo));
      const toss = Math.min(1, Math.max(0, (progress - 0.35) / 0.65));
      return { x: 190 * variation.amplitude * (1 - toss), y: -35 - 285 * toss - Math.sin(toss * Math.PI) * 72 * variation.curve };
    }
    const loopElapsed = phase === 'act' ? elapsed : (playProfile?.cycleMs ?? 900) * (playProfile?.cycles ?? 1) * variation.tempo;
    const floatPhase = loopElapsed / ((playProfile?.cycleMs ?? 900) * variation.tempo) * Math.PI * 2;
    const drift = phase === 'settle' || phase === 'complete' ? 1 - context.settling : 0;
    return motion === 'float'
      ? { x: 58 + Math.sin(floatPhase) * 58 * variation.amplitude + drift * 24, y: -135 - Math.abs(Math.sin(floatPhase)) * 46 * variation.curve - drift * 100 }
      : { x: 0, y: -70 };
  }
  if (anchor === 'stage') {
    const roll = action === 'play' && motion === 'ground-roll';
    const loopElapsed = phase === 'act' ? elapsed : (playProfile?.cycleMs ?? 760) * (playProfile?.cycles ?? 1) * variation.tempo;
    const cycle = loopElapsed / ((playProfile?.cycleMs ?? 760) * variation.tempo) * Math.PI * 2;
    return { x: roll ? -100 + Math.sin(cycle) * 82 * variation.amplitude : index * 110 - 55, y: roll ? 172 - Math.abs(Math.sin(cycle)) * 22 * variation.curve : 175 };
  }
  if (anchor === 'both-hands') return { x: 0, y: -34 };
  return { x: isOffered ? -72 : 18, y: isOffered ? -76 : 28 - reveal * 52 };
}

function speechForAction(phase: InteractionPhase, action: SceneObjectAction, definition: PropDefinition): PerformanceSpeechCue | null {
  const { label, emoji } = definition;
  if (phase === 'praise') return { text: `Yes! ${label}! Great job!`, emphasisWords: [label, 'Great job'], beat: 'reaction' };
  if (phase === 'retry') return { text: `Almost! Listen: ${label.toLowerCase()}.`, emphasisWords: [label], beat: 'reaction' };
  if (phase !== 'name') return null;
  if (action === 'eat') return { text: `Mmm! ${emoji} ${label}! Yum!`, emphasisWords: [label, 'Yum'], beat: 'reaction' };
  if (action === 'wear') return { text: `Look! My ${label.toLowerCase()}!`, emphasisWords: [label], beat: 'contact' };
  if (action === 'smell') return { text: `Sniff, sniff! ${label}!`, emphasisWords: [label], beat: 'contact' };
  if (action === 'open') return { text: `Open! What's inside?`, emphasisWords: ['Open', 'inside'], beat: 'action' };
  if (action === 'read') return { text: `Look! A ${label.toLowerCase()}!`, emphasisWords: ['Look', label], beat: 'action' };
  if (action === 'play' && definition.playLine) return { text: definition.playLine, emphasisWords: [label], beat: 'action' };
  if (action === 'play') return { text: `Let's play with ${label}!`, emphasisWords: ['play', label], beat: 'action' };
  return { text: `Look! ${label}!`, emphasisWords: [label], beat: 'action' };
}

function performanceFor(action: SceneObjectAction): Record<InteractionPhase, [DramaticObjective, string, number]> {
  const act: [DramaticObjective, string] = action === 'eat' ? ['play', 'silly-play']
    : action === 'wear' ? ['celebrate', 'proud-show']
      : action === 'open' ? ['discover', 'surprise-find']
        : action === 'smell' ? ['discover', 'curious-tilt']
          : action === 'read' ? ['discover', 'deep-listen']
            : action === 'play' ? ['play', 'silly-play']
              : ['discover', 'curious-tilt'];
  return {
    idle: ['listen', 'deep-listen', 0.35], notice: ['discover', 'curious-tilt', 0.62], reveal: ['discover', 'surprise-find', 0.86],
    act: [act[0], act[1], 0.84], name: ['celebrate', 'proud-show', 0.72], offer: ['invite', 'open-welcome', 0.72], ask: ['invite', 'open-welcome', 0.66],
    wait: ['listen', 'deep-listen', 0.42], praise: ['celebrate', 'agree-nod', 0.9], retry: ['reassure', 'gentle-comfort', 0.5], settle: ['reassure', 'agree-nod', 0.4], complete: ['listen', 'deep-listen', 0.3],
  };
}

function variationFor(seed: number): PerformanceVariation {
  if (!seed) return { tempo: 1, amplitude: 1, curve: 1 };
  const unit = (salt: number) => Math.abs(Math.sin(seed * 0.001 + salt * 17.13) * 43758.5453) % 1;
  return { tempo: 0.9 + unit(1) * 0.2, amplitude: 0.88 + unit(2) * 0.24, curve: 0.9 + unit(3) * 0.2 };
}

export function compileEmbodiedScene(intent: EmbodiedTurnIntent, seed = 0): CompiledEmbodiedScene {
  const requests = normalizeObjects(intent);
  const objects = requests.map((request) => {
    const definition = resolvePropDefinition(request.concept, request.emoji ?? intent.emoji);
    const action = actionFor(request, intent, definition);
    return { request, definition, action, motion: motionFor(action, definition, request.target), ...(action === 'play' ? { playProfile: definition.playProfile ?? defaultPlayProfile } : {}) };
  });
  const first = objects[0] ?? { request: { concept: intent.concept }, definition: resolvePropDefinition(intent.concept, intent.emoji), action: 'show' as const, motion: 'hold' as const, playProfile: undefined };
  const activeAction = first.action;
  const performance = performanceFor(activeAction);
  const variation = variationFor(seed);
  const timing: Partial<Record<InteractionPhase, number>> = {
    notice: Math.round(620 * variation.tempo), reveal: Math.round((activeAction === 'show' || activeAction === 'offer' ? 820 : 980) * variation.tempo),
    act: Math.round((first.playProfile ? first.playProfile.cycleMs * first.playProfile.cycles : activeAction === 'eat' ? 1250 : 900) * variation.tempo), offer: Math.round(620 * variation.tempo), ask: Math.round(460 * variation.tempo), settle: Math.round(1450 * variation.tempo),
  };
  const beats: PerformanceBeat[] = [
    { role: 'anticipation', durationMs: 320, motion: first.motion },
    { role: 'action', durationMs: timing.act ?? 900, motion: first.motion },
    { role: 'reaction', durationMs: 520, motion: first.motion },
    { role: 'settle', durationMs: timing.settle ?? 1450, motion: 'hold' },
  ];
  const score: PerformanceScore = { timing, performance, beats, variation, ...(first.playProfile ? { loop: first.playProfile } : {}) };
  return {
    intent, objects, firstDefinition: first.definition, activeAction, score,
    sampleObject(index, context) {
      const object = objects[index] ?? first;
      const { definition, action, motion, playProfile } = object;
      const anchor = motionAnchor(action, motion, definition, context.phase, context.elapsed, playProfile);
      const consumed = action === 'eat' && context.consumeProgress >= 1;
      const offset = offsetFor(action, motion, anchor, context, index, variation, playProfile);
      const grip = objectGrip(action, anchor, definition, consumed);
      const scale = (0.35 + context.reveal * 0.65) * (context.isOffered ? 1.2 : 1) * (anchor === 'head' ? 0.9 : anchor === 'mouth' ? 0.62 : 1)
        * (context.isPraised ? 1 + Math.sin(context.elapsed / 95) * 0.08 : 1);
      const progress = action === 'wear' && context.phase === 'act' ? Math.min(1, context.elapsed / (900 * variation.tempo)) : 1;
      const toss = Math.min(1, Math.max(0, (progress - 0.35) / 0.65));
      return {
        id: `${context.sceneId}:object:${index}`, kind: definition.kind, concept: object.request.concept, label: definition.label, emoji: definition.emoji, visual: definition.visual, visualScale: definition.visualScale, action,
        state: objectState(action, anchor, context.phase, context.isOffered, consumed), anchor, grip, manipulationProgress: grip === 'none' ? 0 : context.reveal,
        offsetX: offset.x, offsetY: offset.y, scale, rotation: (1 - context.reveal) * 22 + (anchor === 'body' ? (action === 'wear' ? 220 * toss : Math.sin(context.elapsed / 140) * 8) : anchor === 'head' ? Math.sin(context.elapsed / 500) * 2 : context.isPraised ? Math.sin(context.elapsed / 110) * 5 : 0),
        opacity: consumed ? 0.08 : playProfile?.exit === 'drift' && ['settle', 'complete'].includes(context.phase)
          ? Math.min(1, Math.max(0, context.settling / 0.35)) : context.reveal,
        emphasis: context.phase === 'reveal' || context.isPraised ? 1 : 0.25, consumeProgress: context.consumeProgress, zIndex: anchor === 'stage' ? 'back' : 'front',
      };
    },
    speechCueFor(phase) { return speechForAction(phase, activeAction, first.definition); },
  };
}
