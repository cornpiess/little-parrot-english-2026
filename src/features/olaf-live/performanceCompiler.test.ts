import { describe, expect, it } from 'vitest';
import { compileEmbodiedScene } from './performanceCompiler';
import type { InteractionPhase } from './embodiedInteraction';

const intent = (concept: string, objectAction: 'show' | 'wear' | 'eat' | 'smell' | 'open' | 'read' | 'play') => ({
  dramaticGoal: 'discover' as const,
  teachingGoal: 'use' as const,
  concept,
  objectAction,
  expectedResponse: 'none' as const,
  intensity: 2 as const,
});

function sample(scene: ReturnType<typeof compileEmbodiedScene>, phase: InteractionPhase, elapsed = 120) {
  return scene.sampleObject(0, { sceneId: 'test', phase, elapsed, reveal: 1, settling: 1, isOffered: false, isPraised: false, consumeProgress: 0 });
}

describe('embodied performance compiler', () => {
  it('compiles a semantic action into reusable anticipation and reaction beats', () => {
    const scene = compileEmbodiedScene(intent('gift', 'open'));
    expect(scene.score.beats.map(({ role }) => role)).toEqual(['anticipation', 'action', 'reaction', 'settle']);
    expect(scene.score.timing.act).toBe(900);
    expect(scene.score.performance.act[1]).toBe('surprise-find');
    expect(sample(scene, 'act')).toMatchObject({ anchor: 'both-hands', grip: 'both' });
    expect(scene.speechCueFor('name')).toMatchObject({ text: "Open! What's inside?", emphasisWords: ['Open', 'inside'], beat: 'action' });
  });

  it('chooses motion from prop affordances instead of prop-specific renderer branches', () => {
    expect(sample(compileEmbodiedScene(intent('flower', 'smell')), 'act')).toMatchObject({ anchor: 'mouth', grip: 'right' });
    expect(sample(compileEmbodiedScene(intent('toothbrush', 'play')), 'act')).toMatchObject({ anchor: 'mouth', grip: 'right' });
    expect(sample(compileEmbodiedScene(intent('ball', 'play')), 'act')).toMatchObject({ anchor: 'stage', state: 'placed', grip: 'none' });
    expect(sample(compileEmbodiedScene(intent('balloon', 'play')), 'act')).toMatchObject({ anchor: 'body', grip: 'none' });
  });

  it('keeps a wearable object continuous from hand to head attachment', () => {
    const scene = compileEmbodiedScene(intent('christmas hat', 'wear'));
    expect(sample(scene, 'act', 100)).toMatchObject({ anchor: 'right-hand', grip: 'right' });
    expect(sample(scene, 'act', 700)).toMatchObject({ anchor: 'body', grip: 'none' });
    expect(sample(scene, 'name')).toMatchObject({ anchor: 'head', state: 'worn', opacity: 1 });
  });

  it('varies tempo and trajectory from a seed while preserving semantic anchors', () => {
    const first = compileEmbodiedScene(intent('balloon', 'play'), 101);
    const second = compileEmbodiedScene(intent('balloon', 'play'), 202);
    expect(first.score.variation).not.toEqual(second.score.variation);
    expect(sample(first, 'act').anchor).toBe('body');
    expect(sample(second, 'act').anchor).toBe('body');
    expect(sample(first, 'act').offsetX).not.toBe(sample(second, 'act').offsetX);
  });

  it('turns repeatable play into a multi-cycle performance with a stable landing', () => {
    const ball = compileEmbodiedScene(intent('ball', 'play'));

    expect(ball.score.timing.act).toBeGreaterThanOrEqual(2_800);
    expect(sample(ball, 'act', 300)).toMatchObject({ anchor: 'stage', opacity: 1 });
    expect(sample(ball, 'act', 1_300).offsetX).not.toBe(sample(ball, 'act', 300).offsetX);
    expect(sample(ball, 'name', 0)).toMatchObject({ anchor: 'stage', opacity: 1 });
    expect(sample(ball, 'settle', 900)).toMatchObject({ anchor: 'stage', opacity: 1 });
    expect(sample(ball, 'complete', 0)).toMatchObject({ anchor: 'stage', opacity: 1 });
  });

  it('lets bubbles repeat before a deliberate drift-out instead of globally vanishing', () => {
    const bubbles = compileEmbodiedScene(intent('bubbles', 'play'));

    expect(bubbles.score.timing.act).toBeGreaterThanOrEqual(2_800);
    expect(sample(bubbles, 'act', 250)).toMatchObject({ anchor: 'body', opacity: 1 });
    expect(sample(bubbles, 'act', 1_250).offsetY).not.toBe(sample(bubbles, 'act', 250).offsetY);
    expect(sample(bubbles, 'name', 0)).toMatchObject({ anchor: 'body', opacity: 1 });
    expect(sample(bubbles, 'settle', 250).opacity).toBeGreaterThan(0.9);
  });
});
