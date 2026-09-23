import { describe, expect, it } from 'vitest';
import { createEmbodiedInteractionDirector, embodiedIntentFromToolCall } from './embodiedInteraction';

const appleIntent = {
  dramaticGoal: 'invite' as const,
  teachingGoal: 'introduce' as const,
  concept: 'apple',
  expectedResponse: 'repeat' as const,
  intensity: 2 as const,
};

describe('embodied interaction director', () => {
  it('turns one teaching intention into a complete prop-and-response scene', () => {
    const director = createEmbodiedInteractionDirector();
    director.direct(appleIntent, 0);

    expect(director.advance(0).phase).toBe('notice');
    expect(director.advance(700).phase).toBe('reveal');
    const named = director.advance(1_700);
    expect(named.phase).toBe('name');
    expect(named.props[0]).toMatchObject({ kind: 'apple', label: 'APPLE', anchor: 'right-hand' });
    expect(named.speechCue?.text).toContain('APPLE');

    director.ingest({ type: 'speech-ended', atMs: 2_000 });
    director.advance(2_800);
    director.advance(3_400);
    expect(director.advance(3_401).phase).toBe('wait');
    director.ingest({ type: 'child-speech', text: 'Apple!', atMs: 3_500 });
    expect(director.advance(3_500).phase).toBe('praise');
    expect(director.advance(3_500).speechCue?.text).toBe('Yes! APPLE! Great job!');
  });

  it('offers a gentle retry instead of treating every sound as success', () => {
    const director = createEmbodiedInteractionDirector();
    director.direct(appleIntent, 0);
    director.advance(1_700);
    director.ingest({ type: 'model-turn-ended', atMs: 2_000 });
    director.ingest({ type: 'child-speech', text: 'banana', atMs: 2_100 });
    expect(director.advance(2_100)).toMatchObject({ phase: 'retry', performance: { objective: 'reassure' } });
  });

  it('reads compact LLM perform_turn calls and rejects non-teaching turns', () => {
    expect(embodiedIntentFromToolCall({
      name: 'perform_turn',
      args: { dramatic_goal: 'invite', teaching_goal: 'repeat', concept: 'apple', expected_response: 'repeat', intensity: 3 },
    })).toEqual({ dramaticGoal: 'invite', teachingGoal: 'repeat', concept: 'apple', expectedResponse: 'repeat', intensity: 3 });
    expect(embodiedIntentFromToolCall({ name: 'perform_turn', args: { dramatic_goal: 'listen' } })).toBeNull();
  });

  it('coordinates wear, eat and unknown Emoji objects through one scene interface', () => {
    const hat = createEmbodiedInteractionDirector();
    hat.direct({ dramaticGoal: 'celebrate', teachingGoal: 'use', concept: '圣诞帽', objectAction: 'wear', expectedResponse: 'none', intensity: 3 }, 0);
    expect(hat.advance(1_700).props[0]).toMatchObject({ kind: 'christmas-hat', anchor: 'right-hand', grip: 'right' });
    expect(hat.advance(2_150).props[0]).toMatchObject({ kind: 'christmas-hat', anchor: 'body', grip: 'none' });
    const wearing = hat.advance(2_600);
    expect(wearing.props[0]).toMatchObject({ kind: 'christmas-hat', anchor: 'head', state: 'worn', grip: 'none' });
    hat.ingest({ type: 'speech-ended', atMs: 2_700 });
    expect(hat.advance(4_200).props[0]).toMatchObject({ anchor: 'head', state: 'worn', opacity: 1 });

    const cake = createEmbodiedInteractionDirector();
    cake.direct({ dramaticGoal: 'play', teachingGoal: 'use', concept: 'cake', objectAction: 'eat', expectedResponse: 'none', intensity: 3 }, 0);
    const biting = cake.advance(1_700);
    expect(biting.props[0]).toMatchObject({ kind: 'cake', anchor: 'mouth', state: 'consuming' });
    expect(biting.props[0].consumeProgress).toBeGreaterThan(0);
    expect(cake.advance(3_000).props[0].state).toBe('gone');

    const unknown = createEmbodiedInteractionDirector();
    unknown.direct({ dramaticGoal: 'discover', teachingGoal: 'introduce', concept: 'rainbow', emoji: '🌈', objectAction: 'eat', expectedResponse: 'none', intensity: 1 }, 0);
    expect(unknown.advance(1_700).props[0]).toMatchObject({ kind: 'emoji-object', emoji: '🌈', action: 'show' });
  });

  it('keeps a gift between both hands while opening it', () => {
    const gift = createEmbodiedInteractionDirector();
    gift.direct({ dramaticGoal: 'discover', teachingGoal: 'use', concept: 'gift', objectAction: 'open', expectedResponse: 'none', intensity: 3 }, 0);

    expect(gift.advance(1_700).props[0]).toMatchObject({ anchor: 'both-hands', grip: 'both', state: 'held' });
    expect(gift.advance(2_600).props[0]).toMatchObject({ anchor: 'both-hands', grip: 'both', state: 'open' });
  });

  it('supports child-friendly object scenes with distinct interaction semantics', () => {
    const flower = createEmbodiedInteractionDirector();
    flower.direct({ dramaticGoal: 'discover', teachingGoal: 'recognize', concept: 'flower', objectAction: 'smell', expectedResponse: 'none', intensity: 2 }, 0);
    expect(flower.advance(1_700).props[0]).toMatchObject({ kind: 'flower', anchor: 'mouth', grip: 'right' });

    const book = createEmbodiedInteractionDirector();
    book.direct({ dramaticGoal: 'discover', teachingGoal: 'recognize', concept: 'book', objectAction: 'read', expectedResponse: 'none', intensity: 2 }, 0);
    expect(book.advance(1_700).props[0]).toMatchObject({ kind: 'book', anchor: 'both-hands', grip: 'both' });

    const ball = createEmbodiedInteractionDirector();
    ball.direct({ dramaticGoal: 'play', teachingGoal: 'use', concept: 'ball', objectAction: 'play', expectedResponse: 'none', intensity: 3 }, 0);
    expect(ball.advance(1_700).props[0]).toMatchObject({ kind: 'ball', anchor: 'stage', state: 'placed', grip: 'none' });

    const toothbrush = createEmbodiedInteractionDirector();
    toothbrush.direct({ dramaticGoal: 'invite', teachingGoal: 'use', concept: 'toothbrush', objectAction: 'play', expectedResponse: 'none', intensity: 2 }, 0);
    expect(toothbrush.advance(1_700).props[0]).toMatchObject({ kind: 'toothbrush', anchor: 'mouth', grip: 'right' });

    const balloon = createEmbodiedInteractionDirector();
    balloon.direct({ dramaticGoal: 'invite', teachingGoal: 'use', concept: 'balloon', objectAction: 'play', expectedResponse: 'none', intensity: 3 }, 0);
    expect(balloon.advance(1_700).props[0]).toMatchObject({ kind: 'balloon', anchor: 'body', grip: 'none' });
  });

  it('keeps a play scene alive for several beats and preserves its landed prop', () => {
    const ball = createEmbodiedInteractionDirector();
    ball.direct({ dramaticGoal: 'play', teachingGoal: 'use', concept: 'ball', objectAction: 'play', expectedResponse: 'none', intensity: 3 }, 0);

    expect(ball.advance(3_000)).toMatchObject({ phase: 'act' });
    expect(ball.advance(3_000).props[0]).toMatchObject({ anchor: 'stage', opacity: 1 });
    expect(ball.advance(3_000).performance.holdMs).toBeGreaterThan(3_000);
  });
});
