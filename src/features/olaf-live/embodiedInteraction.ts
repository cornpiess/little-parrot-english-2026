import type { AttentionTarget, DramaticObjective } from './rig';
import type { CharacterToolCall } from './types';
import { compileEmbodiedScene, type CompiledEmbodiedScene, type PerformanceBeatRole } from './performanceCompiler';
import { isSafeSceneEmoji, resolvePropDefinition, type PropDefinition, type PropVisual } from './propCatalog';

export type TeachingGoal = 'introduce' | 'repeat' | 'recognize' | 'choose' | 'compare' | 'use';
export type ExpectedResponse = 'repeat' | 'point' | 'choose' | 'answer' | 'none';
export type SceneObjectAction = 'show' | 'offer' | 'wear' | 'eat' | 'smell' | 'open' | 'read' | 'place' | 'play';
export type SceneObjectAnchor = 'left-hand' | 'right-hand' | 'both-hands' | 'head' | 'mouth' | 'body' | 'stage';
export type SceneObjectGrip = 'none' | 'left' | 'right' | 'both';
export type SceneObjectState = 'hidden' | 'held' | 'worn' | 'presented' | 'consuming' | 'open' | 'placed' | 'gone';
export type InteractionPhase = 'idle' | 'notice' | 'reveal' | 'act' | 'name' | 'offer' | 'ask' | 'wait' | 'praise' | 'retry' | 'settle' | 'complete';

export interface SceneObjectIntent {
  concept: string;
  action?: SceneObjectAction;
  target?: 'self' | 'child' | 'stage';
  emoji?: string;
}

export interface EmbodiedTurnIntent {
  dramaticGoal: DramaticObjective;
  teachingGoal: TeachingGoal;
  concept: string;
  expectedResponse: ExpectedResponse;
  intensity: 0 | 1 | 2 | 3;
  objectAction?: SceneObjectAction;
  emoji?: string;
  objects?: SceneObjectIntent[];
}

export interface SceneObjectFrame {
  id: string;
  kind: string;
  concept: string;
  label: string;
  emoji: string;
  visual?: PropVisual;
  visualScale?: number;
  action: SceneObjectAction;
  state: SceneObjectState;
  anchor: SceneObjectAnchor;
  grip: SceneObjectGrip;
  manipulationProgress: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  opacity: number;
  emphasis: number;
  consumeProgress: number;
  zIndex: 'back' | 'front';
}

/** Backwards-compatible name for callers that only render one stage object. */
export type StagePropFrame = SceneObjectFrame;

export interface EmbodiedInteractionFrame {
  id: string;
  active: boolean;
  complete: boolean;
  phase: InteractionPhase;
  phaseLabel: string;
  conceptLabel: string;
  actionLabel: string;
  objectState: SceneObjectState;
  desiredChildAction: string;
  performance: { id: string; objective: DramaticObjective; motif: string; intensity: number; holdMs: number };
  attention: AttentionTarget;
  props: SceneObjectFrame[];
  speechCue?: { id: string; text: string; emphasisWords: string[]; beat: PerformanceBeatRole };
}

export type EmbodiedInteractionEvent =
  | { type: 'speech-ended'; cueId?: string; atMs: number }
  | { type: 'model-turn-ended'; atMs: number }
  | { type: 'child-speech'; text: string; atMs: number }
  | { type: 'cancel'; atMs: number };

const phaseLabels: Record<InteractionPhase, string> = {
  idle: '等待导演', notice: '发现线索', reveal: '拿出物体', act: '身体互动', name: '命名示范',
  offer: '递近展示', ask: '邀请模仿', wait: '认真等待', praise: '即时表扬', retry: '温柔提示', settle: '自然收势', complete: '完成',
};

const supportedActions = new Set<SceneObjectAction>(['show', 'offer', 'wear', 'eat', 'smell', 'open', 'read', 'place', 'play']);
const dramaticGoals: DramaticObjective[] = ['celebrate', 'comfort', 'invite', 'discover', 'reassure', 'play', 'listen'];
const teachingGoals: TeachingGoal[] = ['introduce', 'repeat', 'recognize', 'choose', 'compare', 'use'];
const responses: ExpectedResponse[] = ['repeat', 'point', 'choose', 'answer', 'none'];
const levels = [0.38, 0.56, 0.76, 0.94];
export type ObjectDefinition = PropDefinition;
export const resolveSceneObject = resolvePropDefinition;

const actionLabel: Record<SceneObjectAction, string> = {
  show: '展示', offer: '递给孩子', wear: '戴上', eat: '吃一口', smell: '闻一闻', open: '打开', read: '翻阅', place: '放下', play: '玩起来',
};

const responseMatches = (text: string, intent: EmbodiedTurnIntent, definition: PropDefinition) => {
  if (intent.expectedResponse === 'none') return true;
  const normalized = text.toLowerCase().replace(/[^a-z\u4e00-\u9fff]/g, '');
  return definition.aliases.some((alias) => normalized.includes(alias.toLowerCase().replace(/\s/g, '')));
};

export function embodiedIntentFromToolCall(call: CharacterToolCall): EmbodiedTurnIntent | null {
  if (call.name !== 'perform_turn') return null;
  const concept = typeof call.args.concept === 'string' ? call.args.concept.trim() : '';
  const rawObjects = Array.isArray(call.args.objects) ? call.args.objects : [];
  const objects = rawObjects.map((value) => {
    if (!value || typeof value !== 'object') return null;
    const object = value as Record<string, unknown>;
    return typeof object.concept === 'string' ? {
      concept: object.concept.trim(), action: supportedActions.has(object.action as SceneObjectAction) ? object.action as SceneObjectAction : undefined,
      target: object.target === 'child' || object.target === 'stage' ? object.target : 'self', emoji: isSafeSceneEmoji(object.emoji) ? object.emoji : undefined,
    } : null;
  }).filter((value): value is SceneObjectIntent => Boolean(value?.concept));
  const first = objects[0];
  const resolvedConcept = concept || first?.concept || '';
  const teachingGoal = call.args.teaching_goal as TeachingGoal;
  if (!resolvedConcept || !teachingGoals.includes(teachingGoal)) return null;
  const objectAction = supportedActions.has(call.args.object_action as SceneObjectAction) ? call.args.object_action as SceneObjectAction : first?.action;
  const rawIntensity = typeof call.args.intensity === 'number' ? Math.round(call.args.intensity) : 2;
  return {
    dramaticGoal: dramaticGoals.includes(call.args.dramatic_goal as DramaticObjective) ? call.args.dramatic_goal as DramaticObjective : 'invite',
    teachingGoal, concept: resolvedConcept,
    expectedResponse: responses.includes(call.args.expected_response as ExpectedResponse) ? call.args.expected_response as ExpectedResponse : 'repeat',
    intensity: Math.max(0, Math.min(3, rawIntensity)) as 0 | 1 | 2 | 3,
    ...(objectAction ? { objectAction } : {}), ...(isSafeSceneEmoji(call.args.emoji) ? { emoji: call.args.emoji } : {}), ...(objects.length ? { objects } : {}),
  };
}

export interface EmbodiedInteractionDirector {
  direct(intent: EmbodiedTurnIntent, atMs?: number): void;
  ingest(event: EmbodiedInteractionEvent): void;
  advance(atMs?: number): EmbodiedInteractionFrame;
}

export function createEmbodiedInteractionDirector(): EmbodiedInteractionDirector {
  let intent: EmbodiedTurnIntent | null = null;
  let phase: InteractionPhase = 'idle';
  let phaseStartedAt = 0;
  let id = 'embodied-idle';
  let queuedChildSpeech = '';
  let scene: CompiledEmbodiedScene | null = null;
  let definition: PropDefinition = resolvePropDefinition('object');
  let activeAction: SceneObjectAction = 'show';

  const enter = (next: InteractionPhase, atMs: number) => { phase = next; phaseStartedAt = atMs; };
  const nextTimedPhase = () => {
    if (phase === 'notice') return { duration: scene?.score.timing.notice ?? 620, next: 'reveal' as const };
    if (phase === 'reveal') return { duration: scene?.score.timing.reveal ?? 820, next: scene?.activeAction === 'show' || scene?.activeAction === 'offer' ? 'name' as const : 'act' as const };
    if (phase === 'act') return { duration: scene?.score.timing.act ?? 900, next: 'name' as const };
    if (phase === 'offer') return { duration: scene?.score.timing.offer ?? 620, next: 'ask' as const };
    if (phase === 'ask') return { duration: scene?.score.timing.ask ?? 460, next: 'wait' as const };
    if (phase === 'settle') return { duration: scene?.score.timing.settle ?? 1_450, next: 'complete' as const };
    return null;
  };

  const ingest = (event: EmbodiedInteractionEvent) => {
    if (event.type === 'cancel') { intent = null; scene = null; activeAction = 'show'; definition = resolvePropDefinition('object'); enter('idle', event.atMs); return; }
    if (!intent) return;
    if (event.type === 'model-turn-ended' && ['notice', 'reveal', 'act', 'name', 'offer', 'ask'].includes(phase)) enter('wait', event.atMs);
    if (event.type === 'speech-ended') {
      if (phase === 'name') enter(intent.expectedResponse === 'none' ? 'settle' : 'offer', event.atMs);
      else if (phase === 'praise') enter('settle', event.atMs);
      else if (phase === 'retry') enter('wait', event.atMs);
    }
    if (event.type === 'child-speech') {
      queuedChildSpeech = event.text;
      if (phase === 'wait') enter(responseMatches(event.text, intent, definition) ? 'praise' : 'retry', event.atMs);
    }
  };

  const advance = (atMs = performance.now()): EmbodiedInteractionFrame => {
    if (intent) {
      let guard = 0;
      while (guard++ < 5) {
        const transition = nextTimedPhase();
        if (!transition || atMs - phaseStartedAt < transition.duration) break;
        enter(transition.next, phaseStartedAt + transition.duration);
      }
      if (phase === 'wait' && queuedChildSpeech) {
        const text = queuedChildSpeech; queuedChildSpeech = '';
        enter(responseMatches(text, intent, definition) ? 'praise' : 'retry', atMs);
      } else if (phase === 'wait' && atMs - phaseStartedAt > 7_000) enter('retry', atMs);
    }

    const currentIntent = intent;
    const currentScene = scene;
    const resolved = currentScene?.firstDefinition ?? definition;
    const elapsed = Math.max(0, atMs - phaseStartedAt);
    const reveal = phase === 'reveal' ? Math.min(1, elapsed / (currentScene?.score.timing.reveal ?? 620)) : phase === 'notice' || phase === 'idle' ? 0 : 1;
    const settling = phase === 'settle' ? Math.max(0, 1 - elapsed / (currentScene?.score.timing.settle ?? 1_450)) : phase === 'complete' ? 0 : 1;
    const isOffered = ['offer', 'ask', 'wait'].includes(phase);
    const isActing = phase === 'act';
    const isPraised = phase === 'praise';
    const consumeProgress = activeAction === 'eat' ? (isActing ? Math.min(1, elapsed / (currentScene?.score.timing.act ?? 1_250)) : ['name', 'settle', 'complete'].includes(phase) ? 1 : 0) : 0;
    const performance = currentScene?.score.performance[phase] ?? ['listen', 'deep-listen', 0.35];
    const performanceHoldMs = Math.max(2_400, (currentScene?.score.timing[phase] ?? 2_160) + 240);
    const objectFrames: SceneObjectFrame[] = currentIntent && currentScene && !['idle', 'notice'].includes(phase)
      ? currentScene.objects.map((_, index) => currentScene.sampleObject(index, { sceneId: id, phase, elapsed, reveal, settling, isOffered, isPraised, consumeProgress })) : [];
    const speech = currentScene?.speechCueFor(phase);
    return {
      id, active: Boolean(currentIntent) && phase !== 'complete', complete: phase === 'complete', phase, phaseLabel: phaseLabels[phase], conceptLabel: resolved.label,
      actionLabel: actionLabel[activeAction], objectState: objectFrames[0]?.state ?? 'hidden', desiredChildAction: phase === 'wait' ? `等待孩子${currentIntent?.expectedResponse === 'repeat' ? '跟读' : '回应'}“${resolved.label}”` : `${actionLabel[activeAction]} ${resolved.label}`,
      performance: { id: `${id}:${phase}`, objective: performance[0], motif: performance[1], intensity: levels[currentIntent?.intensity ?? 1] ?? performance[2], holdMs: performanceHoldMs },
      attention: ['reveal', 'act', 'name'].includes(phase) ? { focus: 'object', x: 0.52, y: 0.12, depth: 0.72 } : phase === 'wait' ? { focus: 'user', x: 0, y: 0, depth: 0.82 } : { focus: 'user', x: 0, y: -0.05, depth: 0.78 },
      props: objectFrames, ...(speech ? { speechCue: { id: `${id}:${phase}`, ...speech } } : {}),
    };
  };

  return {
    direct(nextIntent, atMs = performance.now()) {
      intent = nextIntent;
      scene = compileEmbodiedScene(nextIntent, atMs);
      definition = scene.firstDefinition;
      activeAction = scene.activeAction;
      id = `embodied-${Math.round(atMs)}`; queuedChildSpeech = ''; enter('notice', atMs);
    },
    ingest,
    advance,
  };
}
