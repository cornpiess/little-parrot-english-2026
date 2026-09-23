import { describe, expect, it } from 'vitest';
import { createCharacterPerformanceController } from './controller';

describe('shared character performance controller', () => {
  it('keeps voice, attention and locomotion on one continuous clock', () => {
    const controller = createCharacterPerformanceController();
    controller.ingest(
      { type: 'presence', atMs: 0, presence: 'speaking' },
      { type: 'voice', atMs: 0, features: { speaking: true, energy: 0.9, brightness: 0.7, emphasis: 0.8 } },
      { type: 'attention', atMs: 0, target: { focus: 'object', x: 0.4, y: -0.1, depth: 0.8 } },
      { type: 'locomotion', atMs: 0, target: { x: 0.6, depth: 0.2, heading: -0.3 }, travel: 0.8, jump: 0.4, holdMs: 1600 },
    );

    const frame = controller.advance(80);
    expect(frame.presence).toBe('speaking');
    expect(frame.attention.focus).toBe('object');
    expect(frame.root.x).toBeGreaterThan(0);
    expect(frame.root.elevation).toBeGreaterThan(0);
    expect(frame.dynamics.speechPulse).toBeGreaterThan(0);
  });

  it('projects a neutral frame without exposing Olaf-only face channels', () => {
    const frame = createCharacterPerformanceController().reset(240);
    expect(frame.timestampMs).toBe(240);
    expect(frame).not.toHaveProperty('face');
    expect(frame).not.toHaveProperty('effects');
  });
});
