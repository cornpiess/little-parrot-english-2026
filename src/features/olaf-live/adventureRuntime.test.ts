import { describe, expect, it } from 'vitest';
import { createAdventureRuntime } from './adventureRuntime';
import { OCEAN_JELLYFISH_STORY } from './oceanAdventureStory';
import { ADVENTURE_STORIES } from './adventureStories';

describe('adventure runtime', () => {
  it('keeps the three legacy Olaf story packs separate from the new hero architecture', () => {
    expect(ADVENTURE_STORIES).toHaveLength(3);
    expect(new Set(ADVENTURE_STORIES.map(({ id }) => id)).size).toBe(3);
    expect(new Set(ADVENTURE_STORIES.map(({ theme }) => theme)).size).toBe(3);
    expect(new Set(ADVENTURE_STORIES.map(({ worldKit }) => worldKit)).size).toBe(3);
    expect(new Set(ADVENTURE_STORIES.map(({ mechanicKit }) => mechanicKit)).size).toBe(3);
    expect(new Set(ADVENTURE_STORIES.map(({ narrativeFingerprint }) => narrativeFingerprint?.mechanic)).size).toBe(3);
    expect(new Set(ADVENTURE_STORIES.map(({ beats }) => beats.find(({ vehicle }) => vehicle)?.vehicle?.id)).size).toBe(3);
    expect(ADVENTURE_STORIES.map(({ leadCharacter }) => leadCharacter)).toEqual(['olaf', 'olaf', 'olaf']);
    for (const story of ADVENTURE_STORIES) {
      expect(story.targetWords).toHaveLength(2);
      expect(story.beats.length).toBeGreaterThanOrEqual(14);
      expect(story.beats.reduce((total, beat) => total + beat.durationMs, 0)).toBeGreaterThanOrEqual(250_000);
      expect(story.beats.some(({ interaction }) => interaction?.kind === 'say')).toBe(true);
      expect(story.beats.some(({ interaction }) => interaction?.kind === 'choice')).toBe(true);
    }
  });

  it.each(ADVENTURE_STORIES.map((story) => [story.id, story] as const))('completes %s as one reusable story loop', (_, story) => {
    const runtime = createAdventureRuntime(story, 0);
    runtime.dispatch({ type: 'start', atMs: 0 });
    for (let guard = 1; guard < 80 && !runtime.advance(guard).complete; guard += 1) {
      const frame = runtime.advance(guard);
      if (frame.interaction?.kind === 'say') runtime.dispatch({ type: 'child-said', text: frame.interaction.target, atMs: guard });
      else if (frame.interaction?.kind === 'choice') runtime.dispatch({ type: 'choose', value: frame.interaction.options[0].value, atMs: guard });
      else runtime.dispatch({ type: 'continue', atMs: guard });
    }
    expect(runtime.advance(100).complete).toBe(true);
    expect(runtime.advance(100).memory.learnedWords).toEqual(story.targetWords);
  });
  it('drives a complete story through one small event-and-frame interface', () => {
    const runtime = createAdventureRuntime(OCEAN_JELLYFISH_STORY, 0);

    expect(runtime.advance(0)).toMatchObject({
      active: false,
      beat: { id: 'invitation' },
      world: { id: 'snow-base' },
    });

    runtime.dispatch({ type: 'start', atMs: 10 });
    expect(runtime.advance(10)).toMatchObject({ active: true, beat: { id: 'invitation' } });

    runtime.dispatch({ type: 'continue', atMs: 20 });
    runtime.dispatch({ type: 'continue', atMs: 30 });
    expect(runtime.advance(30)).toMatchObject({
      beat: { id: 'launch' },
      world: { id: 'ocean-transit' },
      vehicle: { id: 'bubble-submarine', cockpit: true },
    });
  });

  it('waits for meaningful child interaction and understands target-word aliases', () => {
    const runtime = createAdventureRuntime(OCEAN_JELLYFISH_STORY, 0);
    runtime.dispatch({ type: 'start', atMs: 0 });
    for (let index = 0; index < 5; index += 1) runtime.dispatch({ type: 'continue', atMs: index + 1 });

    const prompt = runtime.advance(10);
    expect(prompt.beat.id).toBe('name-jellyfish');
    expect(prompt.interaction).toMatchObject({ kind: 'say', target: 'jellyfish' });

    runtime.advance(99_000);
    expect(runtime.advance(99_001).beat.id).toBe('name-jellyfish');

    runtime.dispatch({ type: 'child-said', text: 'jelly fish', atMs: 99_010 });
    expect(runtime.advance(99_010)).toMatchObject({
      beat: { id: 'play-together' },
      memory: { learnedWords: ['jellyfish'] },
    });
  });

  it('completes the learning loop with two words instead of a sequence of decorative scenes', () => {
    const runtime = createAdventureRuntime(OCEAN_JELLYFISH_STORY, 0);
    runtime.dispatch({ type: 'start', atMs: 0 });
    let guard = 0;
    while (!runtime.advance(guard).complete && guard < 50) {
      const frame = runtime.advance(guard);
      if (frame.interaction?.kind === 'say') runtime.dispatch({ type: 'child-said', text: frame.interaction.target, atMs: guard });
      else if (frame.interaction?.kind === 'choice') runtime.dispatch({ type: 'choose', value: frame.interaction.options[0].value, atMs: guard });
      else runtime.dispatch({ type: 'continue', atMs: guard });
      guard += 1;
    }

    const ending = runtime.advance(guard);
    expect(ending.complete).toBe(true);
    expect(ending.world.id).toBe('snow-base');
    expect(ending.memory.learnedWords).toEqual(['jellyfish', 'glow']);
  });
});
