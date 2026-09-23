import { describe, expect, it } from 'vitest';
import { analysisToInput, analyzePcm16 } from './audioAnalyzer';

describe('audio analyzer', () => {
  it('recognises silence as non-speaking', () => {
    const result = analyzePcm16(new Int16Array(1600).buffer, 16000);
    expect(result.speaking).toBe(false);
    expect(result.energy).toBe(0);
  });

  it('extracts bounded energy from a loud PCM signal', () => {
    const samples = new Int16Array(1600);
    for (let index = 0; index < samples.length; index += 1) samples[index] = index % 2 ? -28000 : 28000;
    const result = analyzePcm16(samples.buffer, 16000);
    expect(result.speaking).toBe(true);
    expect(result.energy).toBeGreaterThan(0.7);
    expect(result.spectralCentroid).toBeGreaterThanOrEqual(0);
    expect(result.spectralCentroid).toBeLessThanOrEqual(1);
  });

  it('adapts audio analysis to the unified performance clock', () => {
    expect(analysisToInput({ speaking: true, energy: 0.6, spectralCentroid: 0.7, emphasis: 0.4 }, 42)).toEqual({
      type: 'voice',
      atMs: 42,
      features: { speaking: true, energy: 0.6, brightness: 0.7, emphasis: 0.4 },
    });
  });
});
