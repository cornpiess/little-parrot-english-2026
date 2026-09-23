import { describe, expect, it } from 'vitest';
import type { CharacterPresence } from './rig';
import { sampleSocialGaze } from './socialGaze';

const attention = { focus: 'user' as const, x: 0, y: 0, depth: 0.72 };

function samples(presence: CharacterPresence) {
  return Array.from({ length: 241 }, (_, index) => sampleSocialGaze({
    timestampMs: index * 100,
    presence,
    attention,
  }));
}

describe('social gaze director', () => {
  it('gives every conversational state both eye contact and natural gaze aversion', () => {
    for (const presence of ['idle', 'listening', 'thinking', 'speaking'] as const) {
      const gaze = samples(presence);
      expect(Math.max(...gaze.map((sample) => sample.contact))).toBeGreaterThan(0.95);
      expect(Math.min(...gaze.map((sample) => sample.contact))).toBeLessThan(0.1);
    }
  });

  it('listens with the most eye contact and thinks with the least', () => {
    const contactRatio = (presence: CharacterPresence) => {
      const gaze = samples(presence);
      return gaze.filter((sample) => sample.contact > 0.65).length / gaze.length;
    };

    expect(contactRatio('listening')).toBeGreaterThan(0.62);
    expect(contactRatio('speaking')).toBeGreaterThan(contactRatio('idle'));
    expect(contactRatio('thinking')).toBeLessThan(0.34);
  });

  it('moves continuously instead of snapping between gaze targets', () => {
    const gaze = samples('thinking');
    const largestStep = Math.max(...gaze.slice(1).map((sample, index) => (
      Math.hypot(sample.eyeX - gaze[index].eyeX, sample.eyeY - gaze[index].eyeY)
    )));

    expect(largestStep).toBeLessThan(0.16);
  });

  it('keeps the head more child-oriented while the eyes briefly look away', () => {
    const averted = samples('listening').reduce((lowest, sample) => sample.contact < lowest.contact ? sample : lowest);
    expect(Math.hypot(averted.headX, averted.headY)).toBeLessThan(Math.hypot(averted.eyeX, averted.eyeY));
  });

  it('respects deliberate object attention without applying social eye-contact timing', () => {
    const gaze = sampleSocialGaze({
      timestampMs: 3_200,
      presence: 'thinking',
      attention: { focus: 'object', x: 0.7, y: -0.4, depth: 0.5 },
    });

    expect(gaze).toMatchObject({ eyeX: 0.7, eyeY: -0.4, headX: 0.7, headY: -0.4, contact: 0 });
  });
});
