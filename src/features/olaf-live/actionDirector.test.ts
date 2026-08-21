import { describe, expect, it } from 'vitest';
import { signalsFromToolCall, perceptionToSignals } from './actionDirector';

describe('Olaf action director', () => {
  it('translates a model gesture tool call into a safe performance signal', () => {
    expect(signalsFromToolCall({
      name: 'perform_gesture',
      args: { gesture: 'wave', intensity: 1.8, duration_ms: 1200 },
    })).toEqual([
      { type: 'gesture', name: 'wave', intensity: 1, durationMs: 1200 },
    ]);
  });

  it('ignores malformed model commands instead of poisoning the animation loop', () => {
    expect(signalsFromToolCall({ name: 'perform_gesture', args: { gesture: 'explode' } })).toEqual([]);
    expect(signalsFromToolCall({ name: 'set_emotion', args: { valence: 'high' } })).toEqual([]);
  });

  it('turns local perception into gaze and reaction signals only after confidence passes', () => {
    expect(perceptionToSignals({ type: 'face', confidence: 0.91, x: 0.25, y: -0.1, timestamp: 1 })).toEqual([
      { type: 'gaze', focus: 'user', x: 0.25, y: -0.1 },
    ]);
    expect(perceptionToSignals({ type: 'hand', confidence: 0.4, gesture: 'wave', timestamp: 1 })).toEqual([]);
  });
});
