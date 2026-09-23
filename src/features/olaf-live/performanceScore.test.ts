import { describe, expect, it } from 'vitest';
import { samplePerformanceScore } from './performanceScore';

describe('performance score', () => {
  it('moves through an ordered acting phrase with distinct track accents', () => {
    const samples = [0.05, 0.16, 0.3, 0.5, 0.69, 0.9].map(samplePerformanceScore);
    expect(samples.map(({ beat }) => beat)).toEqual(['notice', 'appraise', 'prepare', 'act', 'react', 'settle']);
    expect(samples[2].anticipation).toBeGreaterThan(samples[2].action);
    expect(samples[3].action).toBeGreaterThan(0.75);
    expect(samples[4].reaction).toBeGreaterThan(samples[4].anticipation);
    expect(samples[5].settle).toBeGreaterThan(0.7);
  });

  it('keeps every track continuous and inside the rig contract', () => {
    const samples = Array.from({ length: 101 }, (_, index) => samplePerformanceScore(index / 100));
    const tracks = ['anticipation', 'action', 'reaction', 'settle', 'hold'] as const;
    for (const sample of samples) expect(tracks.every((track) => sample[track] >= 0 && sample[track] <= 1)).toBe(true);
    const largestStep = Math.max(...samples.slice(1).flatMap((sample, index) => tracks.map((track) => Math.abs(sample[track] - samples[index][track]))));
    expect(largestStep).toBeLessThan(0.18);
  });
});
