import { describe, expect, it } from 'vitest';
import { IRON_MAN_ACTIONS, IRON_MAN_ACTION_SPECS, isIronManAction } from './ironManActions';
import { adaptPerformanceToIronMan, getIronManAnchorPositions } from './ironManPerformance';

describe('Mark 46 action registry', () => {
  it('exposes the character-specific base set and the two working skills', () => {
    expect(IRON_MAN_ACTIONS).toHaveLength(23);
    expect(IRON_MAN_ACTIONS.map(({ id }) => id)).toContain('speaking');
    expect(IRON_MAN_ACTIONS.map(({ id }) => id)).toContain('fly');
    expect(IRON_MAN_ACTIONS.map(({ id }) => id)).toContain('repulsor-blast');
    expect(IRON_MAN_ACTIONS.map(({ id }) => id)).toContain('unibeam');
    expect(IRON_MAN_ACTIONS.map(({ id }) => id)).not.toContain('hero-landing');
    expect(IRON_MAN_ACTIONS.map(({ id }) => id)).not.toContain('boost-punch');
    expect(IRON_MAN_ACTIONS.map(({ id }) => id)).not.toContain('spin');
    expect(isIronManAction('flight')).toBe(true); // legacy alias, hidden from the UI
  });

  it('keeps every public non-idle action backed by one recipe', () => {
    for (const { id } of IRON_MAN_ACTIONS) {
      if (id === 'idle') continue;
      expect(isIronManAction(id)).toBe(true);
      expect(IRON_MAN_ACTION_SPECS[id]).toBeDefined();
      expect(IRON_MAN_ACTION_SPECS[id].duration).toBeGreaterThan(0);
    }
  });
});

describe('Iron Man performance adapter', () => {
  it('maps a continuous body frame to armour signals without face channels', () => {
    const frame = {
      timestampMs: 100,
      presence: 'speaking' as const,
      affect: { valence: 0.8, arousal: 0.65, dominance: 0.7 },
      attention: { focus: 'user' as const, x: 0, y: 0, depth: 0.7 },
      head: { yaw: 0.2, pitch: -0.1, roll: 0.1 },
      torso: { leanX: 0.1, leanY: 0, twist: 0.2, rise: 0.1, squash: 0 },
      leftArm: { shoulderLift: 0.2, shoulderOpen: 0.4, elbowBend: 0.2, reach: 0.1, handOpen: 0.4, crossBody: 0 },
      rightArm: { shoulderLift: 0.3, shoulderOpen: 0.5, elbowBend: 0.3, reach: 0.4, handOpen: 0.5, crossBody: 0 },
      root: { x: 0.3, depth: 0, elevation: 0.4, heading: 0.1, stride: 0.2, travel: 0.6, groundContact: 0 },
      dynamics: { breath: 0, motionEnergy: 0.75, speechPulse: 0.9, anticipation: 0, actionAccent: 0.2, followThrough: 0.2, settle: 0, hold: 0 },
    };

    const visual = adaptPerformanceToIronMan(frame);
    expect(visual.signals.eyePulse).toBeGreaterThan(0.7);
    expect(visual.signals.bootThrust).toBeGreaterThan(0.3);
    expect(visual.parts.root).toHaveProperty('x');
    expect(visual).not.toHaveProperty('face');

    const anchors = getIronManAnchorPositions(frame);
    expect(Object.keys(anchors)).toHaveLength(5);
    expect(anchors['right-hand'].x).toBeGreaterThan(anchors['left-hand'].x);
  });
});
