import { describe, expect, it } from 'vitest';
import { createRealtimePerformanceModel } from './performanceModel';

describe('RealtimePerformanceModel', () => {
  it('expands a dramatic objective into a complete preparation-action-reaction performance', () => {
    const celebrating = createRealtimePerformanceModel();
    celebrating.ingest({ type: 'direction', atMs: 0, objective: 'celebrate', intensity: 1, holdMs: 6_500 });
    const celebrationFrames = Array.from({ length: 66 }, (_, index) => celebrating.advance(index * 100));
    const comforting = createRealtimePerformanceModel();
    comforting.ingest({ type: 'direction', atMs: 0, objective: 'comfort', intensity: 0.72, holdMs: 6_500 });
    const comfortFrames = Array.from({ length: 66 }, (_, index) => comforting.advance(index * 100));

    expect(Math.max(...celebrationFrames.map((frame) => frame.leftArm.crossBody))).toBeGreaterThan(0.5);
    expect(Math.max(...celebrationFrames.map((frame) => frame.root.elevation))).toBeGreaterThan(0.12);
    expect(Math.max(...comfortFrames.map((frame) => frame.dynamics.motionEnergy)))
      .toBeLessThan(Math.max(...celebrationFrames.map((frame) => frame.dynamics.motionEnergy)));
    expect(comfortFrames.some((frame) => frame.torso.leanY > 0.12)).toBe(true);
    expect(Math.max(...celebrationFrames.map((frame) => frame.dynamics.anticipation))).toBeGreaterThan(0.35);
    expect(Math.max(...celebrationFrames.map((frame) => frame.dynamics.actionAccent))).toBeGreaterThan(0.6);
    expect(Math.max(...celebrationFrames.map((frame) => frame.dynamics.followThrough))).toBeGreaterThan(0.4);
  });

  it('preserves timestamped visemes instead of replacing them with a generic mouth pulse', () => {
    const model = createRealtimePerformanceModel();
    model.ingest({
      type: 'voice', atMs: 0,
      features: { speaking: true, energy: 0.7, brightness: 0.6, emphasis: 0.5, jawOpen: 0.91, mouthWide: 0.18, mouthPucker: 0.72 },
    });
    const frame = model.advance(33);
    expect(frame.face.jawOpen).toBeGreaterThan(0.85);
    expect(frame.face.mouthPucker).toBeGreaterThan(0.65);
  });

  it('owns a complete neutral rig on a monotonic performance clock', () => {
    const model = createRealtimePerformanceModel();

    const first = model.advance(0);
    const next = model.advance(33);

    expect(first.presence).toBe('idle');
    expect(next.timestampMs).toBe(33);
    expect(next.dynamics.breath).not.toBe(first.dynamics.breath);
    expect(next.face.jawOpen).toBe(0);
  });

  it('turns voice into continuous facial and body coefficients without gesture clips', () => {
    const model = createRealtimePerformanceModel();
    model.ingest({
      type: 'voice',
      atMs: 0,
      features: { speaking: true, energy: 0.9, brightness: 0.72, emphasis: 0.8 },
    });

    const frame = model.advance(66);

    expect(frame.presence).toBe('speaking');
    expect(frame.face.jawOpen).toBeGreaterThan(0);
    expect(frame.face.mouthWide).toBeGreaterThan(0);
    expect(frame.dynamics.motionEnergy).toBeGreaterThan(0);
    expect(frame).not.toHaveProperty('activeGesture');
  });

  it('combines affect, movement and attention on the same frame', () => {
    const model = createRealtimePerformanceModel();
    model.ingest({
      type: 'intent',
      atMs: 0,
      affect: { valence: 0.85, arousal: 0.75, dominance: 0.6 },
      movement: { energy: 0.8, openness: 0.9, verticality: 0.7, forward: 0.4, asymmetry: 0.5, beat: 0.8 },
      holdMs: 800,
    });
    model.ingest({
      type: 'attention',
      atMs: 0,
      target: { focus: 'user', x: 0.8, y: -0.4, depth: 0.7 },
    });

    const frame = model.advance(120);

    expect(frame.face.mouthSmileLeft).toBeGreaterThan(0.25);
    expect(frame.leftArm.shoulderOpen).toBeGreaterThan(0);
    expect(frame.rightArm.shoulderOpen).toBeGreaterThan(0);
    expect(frame.eyes.lookX).toBeGreaterThan(0);
    expect(frame.head.yaw).toBeGreaterThan(0);
  });

  it('decays a performance intent instead of ending a named animation', () => {
    const model = createRealtimePerformanceModel();
    model.ingest({
      type: 'intent',
      atMs: 0,
      affect: { valence: 0.7, arousal: 0.9, dominance: 0.5 },
      movement: { energy: 1, openness: 1, verticality: 1, forward: 0.5, asymmetry: 0, beat: 1 },
      holdMs: 300,
    });

    const active = model.advance(200);
    const released = model.advance(1600);

    expect(released.dynamics.motionEnergy).toBeLessThan(active.dynamics.motionEnergy);
    expect(released.leftArm.shoulderLift).toBeLessThan(active.leftArm.shoulderLift);
  });

  it('uses the full vertical range so toddler-facing poses read clearly', () => {
    const upward = createRealtimePerformanceModel();
    upward.ingest({
      type: 'intent', atMs: 0,
      affect: { valence: 0.9, arousal: 1, dominance: 0.7 },
      movement: { energy: 1, openness: 1, verticality: 1, forward: 0.2, asymmetry: 0, beat: 0.8 },
      holdMs: 1000,
    });
    const downward = createRealtimePerformanceModel();
    downward.ingest({
      type: 'intent', atMs: 0,
      affect: { valence: 0.2, arousal: 0.25, dominance: 0.25 },
      movement: { energy: 0.8, openness: 0.15, verticality: -1, forward: 0.7, asymmetry: 0, beat: 0 },
      holdMs: 1000,
    });

    const upFrame = upward.advance(180);
    const downFrame = downward.advance(180);

    expect(upFrame.leftArm.shoulderLift).toBeGreaterThan(0.45);
    expect(downFrame.leftArm.shoulderLift).toBeLessThan(-0.25);
    expect(upFrame.leftArm.shoulderLift - downFrame.leftArm.shoulderLift).toBeGreaterThan(0.8);
  });

  it('turns asymmetry into an unmistakable one-sided pose', () => {
    const model = createRealtimePerformanceModel();
    model.ingest({
      type: 'intent', atMs: 0,
      affect: { valence: 0.72, arousal: 0.8, dominance: 0.5 },
      movement: { energy: 1, openness: 0.7, verticality: 0.35, forward: 0.35, asymmetry: 1, beat: 0.7 },
      holdMs: 1000,
    });

    const frame = model.advance(180);

    expect(Math.abs(frame.rightArm.shoulderLift - frame.leftArm.shoulderLift)).toBeGreaterThan(0.45);
    expect(Math.abs(frame.head.roll)).toBeGreaterThan(0.12);
    expect(Math.abs(frame.torso.leanX)).toBeGreaterThan(0.18);
  });

  it('owns spatial root motion for walking through depth and jumping', () => {
    const model = createRealtimePerformanceModel();
    model.ingest({
      type: 'locomotion',
      atMs: 0,
      target: { x: 0.8, depth: -0.65, heading: 0.7 },
      travel: 0.9,
      jump: 0.85,
      holdMs: 1_200,
    });

    const frame = model.advance(640);

    expect(frame).toHaveProperty('root');
    expect(frame.root.x).toBeGreaterThan(0.35);
    expect(frame.root.elevation).toBeGreaterThan(0.2);
  });

  it('composes readable crying, clapping, nodding and head-shaking mechanics', () => {
    const crying = createRealtimePerformanceModel();
    crying.ingest({
      type: 'expression', atMs: 0,
      channels: { joy: 0, distress: 1, headNod: 0, headShake: 0, handConverge: 0, sob: 1, tempo: 0.55 },
      holdMs: 1_200,
    });
    const cryFrame = crying.advance(280);

    const agreeing = createRealtimePerformanceModel();
    agreeing.ingest({
      type: 'expression', atMs: 0,
      channels: { joy: 0.7, distress: 0, headNod: 1, headShake: 0, handConverge: 1, sob: 0, tempo: 0.7 },
      holdMs: 1_200,
    });
    const agreeFrame = agreeing.advance(280);

    const refusing = createRealtimePerformanceModel();
    refusing.ingest({
      type: 'expression', atMs: 0,
      channels: { joy: 0, distress: 0.2, headNod: 0, headShake: 1, handConverge: 0, sob: 0, tempo: 0.7 },
      holdMs: 1_200,
    });
    const refuseFrame = refusing.advance(280);

    expect(cryFrame.effects.tearLeft).toBeGreaterThan(0.5);
    expect(cryFrame.face.mouthPucker).toBeGreaterThan(0.3);
    expect(agreeFrame.leftArm.crossBody).toBeGreaterThan(0.3);
    expect(Math.abs(agreeFrame.head.pitch)).toBeGreaterThan(0.25);
    expect(Math.abs(refuseFrame.head.yaw)).toBeGreaterThan(0.3);
  });
});
