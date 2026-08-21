import { describe, expect, it } from 'vitest';
import {
  createIdlePerformance,
  mergePerformanceSignals,
  reducePerformanceFrame,
} from './performanceEngine';
import type { PerformanceSignal } from './types';

describe('Olaf performance engine', () => {
  it('keeps idle animation alive without a model signal', () => {
    const frame = createIdlePerformance();

    expect(frame.mode).toBe('idle');
    expect(frame.face.mouthOpen).toBe(0);
    expect(frame.pose.bodyBounce).toBeGreaterThanOrEqual(0);
  });

  it('merges high-level emotion and gesture signals into a bounded frame', () => {
    const frame = mergePerformanceSignals(createIdlePerformance(), [
      { type: 'emotion', valence: 1.4, arousal: 0.8, dominance: 0.2 },
      { type: 'gesture', name: 'wave', intensity: 1.2, durationMs: 900 },
      { type: 'gaze', focus: 'user', x: 0.7, y: -0.2 },
    ]);

    expect(frame.emotion.valence).toBe(1);
    expect(frame.emotion.arousal).toBe(0.8);
    expect(frame.pose.rightArm).toBeGreaterThan(0);
    expect(frame.gaze).toEqual({ x: 0.7, y: -0.2, focus: 'user' });
  });

  it('turns audio energy into speech movement and never exceeds safe limits', () => {
    const signals: PerformanceSignal[] = [
      { type: 'speech', speaking: true, energy: 2, spectralCentroid: 0.9, emphasis: 1 },
    ];
    const frame = reducePerformanceFrame(createIdlePerformance(), signals, 16);

    expect(frame.mode).toBe('speaking');
    expect(frame.face.mouthOpen).toBeLessThanOrEqual(1);
    expect(frame.face.mouthOpen).toBeGreaterThan(0);
    expect(frame.pose.bodyBounce).toBeLessThanOrEqual(1);
  });

  it('releases a one-shot gesture after its duration', () => {
    const active = reducePerformanceFrame(createIdlePerformance(), [
      { type: 'gesture', name: 'wave', intensity: 1, durationMs: 500 },
    ], 16);
    const released = reducePerformanceFrame(active, [], 700);

    expect(released.activeGesture).toBeUndefined();
    expect(released.pose.rightArm).toBeLessThan(active.pose.rightArm);
  });
});
