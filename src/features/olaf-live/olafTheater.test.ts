import { describe, expect, it } from 'vitest';
import { PERFORMANCE_MOTIFS } from './performanceImproviser';
import { createOlafTheater, THEATER_BEAT_COUNT, type OlafTheater } from './olafTheater';

function finishBeat(theater: OlafTheater, elapsedMs: number) {
  const moment = theater.sample(elapsedMs);
  theater.completeLine(moment.beatId, elapsedMs + 5_000);
  return elapsedMs + 8_000;
}

function showSequence(seed: number, count: number) {
  const theater = createOlafTheater(seed);
  const sequence: string[] = [];
  let elapsedMs = 0;
  for (let scene = 0; scene < count; scene += 1) {
    sequence.push(theater.sample(elapsedMs).showId);
    for (let beat = 0; beat < THEATER_BEAT_COUNT; beat += 1) elapsedMs = finishBeat(theater, elapsedMs);
  }
  return sequence;
}

describe('Olaf children monologue theater', () => {
  it('does not abandon an unfinished show merely because thirty seconds elapsed', () => {
    const theater = createOlafTheater(42);
    const first = theater.sample(0);

    expect(theater.sample(120_000).showId).toBe(first.showId);
  });

  it('keeps the acting beat on stage long enough to reach its reaction and settle', () => {
    const theater = createOlafTheater(42);
    const first = theater.sample(0);
    theater.completeLine(first.beatId, 1_000);

    expect(theater.sample(5_799).beatId).toBe(first.beatId);
    expect(theater.sample(5_800).beatId).not.toBe(first.beatId);
  });

  it('changes shows only after every spoken beat and its final reaction complete', () => {
    const theater = createOlafTheater(42);
    const first = theater.sample(0);
    let elapsedMs = 0;

    for (let beat = 0; beat < THEATER_BEAT_COUNT - 1; beat += 1) elapsedMs = finishBeat(theater, elapsedMs);
    expect(theater.sample(elapsedMs).showId).toBe(first.showId);

    elapsedMs = finishBeat(theater, elapsedMs);
    expect(theater.sample(elapsedMs).showId).not.toBe(first.showId);
    expect(elapsedMs).toBeGreaterThan(30_000);
    expect(new Set(showSequence(42, 8))).toHaveLength(8);
  });

  it('builds every show from seven short setup-to-button acting beats', () => {
    const theater = createOlafTheater(7);
    const expectedRoles = ['hook', 'setup', 'build', 'turn', 'punchline', 'callback', 'button'];
    const knownMotifs = new Set(PERFORMANCE_MOTIFS.map(({ id }) => id));
    let elapsedMs = 0;

    for (let scene = 0; scene < 8; scene += 1) {
      const moments = [];
      for (let beat = 0; beat < THEATER_BEAT_COUNT; beat += 1) {
        moments.push(theater.sample(elapsedMs));
        elapsedMs = finishBeat(theater, elapsedMs);
      }
      expect(moments.map(({ beatRole }) => beatRole)).toEqual(expectedRoles);
      expect(new Set(moments.map(({ beatId }) => beatId))).toHaveLength(7);
      expect(moments.every(({ line }) => line.length >= 4 && line.length <= 34)).toBe(true);
      expect(moments.every(({ motifId }) => knownMotifs.has(motifId))).toBe(true);
      expect(new Set(moments.map(({ line }) => line))).toHaveLength(7);
    }
  });

  it('uses the seed to vary the show order while remaining deterministic', () => {
    expect(showSequence(13, 5)).toEqual(showSequence(13, 5));
    expect(showSequence(13, 5)).not.toEqual(showSequence(71, 5));
  });
});
