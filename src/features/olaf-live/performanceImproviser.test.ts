import { describe, expect, it } from 'vitest';
import {
  createDirectedPerformance,
  createPerformanceImproviser,
  DEMO_SPEECH_INTERVAL_MS,
  PERFORMANCE_MOTIFS,
  type ImprovisedPerformance,
} from './performanceImproviser';

const numericDistance = (left: ImprovisedPerformance, right: ImprovisedPerformance) => {
  const movement = Object.keys(left.movement).reduce((sum, key) => sum + Math.abs(
    left.movement[key as keyof typeof left.movement] - right.movement[key as keyof typeof right.movement],
  ), 0);
  const expression = Object.keys(left.expression).reduce((sum, key) => sum + Math.abs(
    left.expression[key as keyof typeof left.expression] - right.expression[key as keyof typeof right.expression],
  ), 0);
  return movement + expression;
};

describe('five-layer Olaf performance actor', () => {
  it('offers at least thirty distinct director states through the same actor interface', () => {
    expect(PERFORMANCE_MOTIFS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(PERFORMANCE_MOTIFS.map(({ id }) => id)).size).toBe(PERFORMANCE_MOTIFS.length);

    const signatures = new Set(PERFORMANCE_MOTIFS.map((motif, index) => {
      const actor = createDirectedPerformance(motif.objective, index + 1, motif.id);
      const sample = actor.sample(3_100);
      expect(sample.objective).toBe(motif.objective);
      return [sample.movement.energy, sample.movement.openness, sample.movement.verticality,
        sample.movement.forward, sample.movement.asymmetry, sample.expression.headNod,
        sample.expression.headShake, sample.expression.handConverge, sample.expression.sob,
        sample.locomotion.travel, sample.locomotion.jump]
        .map((value) => Math.round(value * 4) / 4).join('|');
    }));

    expect(signatures.size).toBeGreaterThanOrEqual(24);
  });

  it('keeps a stable persona while generating deterministic dramatic objectives', () => {
    const first = createPerformanceImproviser(42);
    const second = createPerformanceImproviser(42);
    const times = [0, 900, 3_200, 6_400, 12_500, 28_000];
    const samples = times.map((time) => first.sample(time));

    expect(samples).toEqual(times.map((time) => second.sample(time)));
    expect(new Set(samples.map((sample) => sample.personaId))).toEqual(new Set(['olaf-playful-companion']));
    expect(samples.every((sample) => sample.objective.length > 0 && sample.desiredChildFeeling.length > 0)).toBe(true);
    expect(new Set(samples.map((sample) => sample.stateId)).size).toBeGreaterThan(2);
  });

  it('directs every state through readable acting beats instead of random poses', () => {
    const actor = createPerformanceImproviser(17);
    const samples = Array.from({ length: 720 }, (_, index) => actor.sample(index * 140));
    const orderedBeats = ['notice', 'appraise', 'prepare', 'act', 'react', 'settle'];

    for (const stateId of new Set(samples.map((sample) => sample.stateId))) {
      const stateSamples = samples.filter((sample) => sample.stateId === stateId);
      const observed = [...new Set(stateSamples.map((sample) => sample.beat))];
      expect(observed).toEqual(orderedBeats.slice(0, observed.length));
    }

    expect(samples.some((sample) => sample.beat === 'prepare')).toBe(true);
    expect(samples.some((sample) => sample.beat === 'react')).toBe(true);
    expect(samples.some((sample) => sample.beat === 'settle')).toBe(true);
  });

  it('offers a new context-aligned line on a stable three-second demo cadence', () => {
    const actor = createPerformanceImproviser(23);
    const samples = Array.from({ length: 220 }, (_, index) => actor.sample(index * 140));
    const starts = samples.filter((sample, index) => index === 0 || sample.stateId !== samples[index - 1].stateId);
    const cues = samples.filter((sample, index) => sample.speechCue
      && sample.speechCue.id !== samples[index - 1]?.speechCue?.id);
    const cueTimes = cues.map((cue) => samples.indexOf(cue) * 140);
    const gaps = cueTimes.slice(1).map((time, index) => time - cueTimes[index]);

    expect(starts.length).toBeGreaterThanOrEqual(4);
    expect(DEMO_SPEECH_INTERVAL_MS).toBe(3_000);
    expect(gaps.every((gap) => gap >= 2_940 && gap <= 3_080)).toBe(true);
    expect(cues.every((cue) => cue.speechCue?.objective === cue.objective)).toBe(true);
  });

  it('makes objective, gaze, gesture, voice and movement tell the same story', () => {
    const actor = createPerformanceImproviser(23);
    const samples = Array.from({ length: 1_300 }, (_, index) => actor.sample(index * 140));
    const strongest = (objective: ImprovisedPerformance['objective'], score: (sample: ImprovisedPerformance) => number) => {
      const matches = samples.filter((sample) => sample.objective === objective);
      return matches.reduce((best, sample) => score(sample) > score(best) ? sample : best);
    };
    const celebrate = strongest('celebrate', (sample) => sample.expression.handConverge + sample.locomotion.jump);
    const comfort = strongest('comfort', (sample) => sample.movement.forward - sample.movement.energy);
    const discover = strongest('discover', (sample) => Math.abs(sample.attention.x));
    const listen = strongest('listen', (sample) => sample.expression.headNod);

    expect(celebrate.expression.joy).toBeGreaterThan(0.6);
    expect(celebrate.expression.handConverge).toBeGreaterThan(0.5);
    expect(celebrate.locomotion.jump).toBeGreaterThan(0.25);
    expect(comfort.movement.energy).toBeLessThan(0.55);
    expect(comfort.movement.forward).toBeGreaterThan(0.15);
    expect(discover.attention.focus).toBe('object');
    expect(Math.abs(discover.attention.x)).toBeGreaterThan(0.2);
    expect(listen.attention.focus).toBe('user');
    expect(listen.expression.headNod).toBeGreaterThan(0.25);
    expect(samples.filter((sample) => sample.voice.speaking).every((sample) => sample.speechCue?.objective === sample.objective)).toBe(true);
  });

  it('stays inside the rig contract and transitions gently over an open-ended run', () => {
    const actor = createPerformanceImproviser(91);
    const samples = Array.from({ length: 860 }, (_, index) => actor.sample(index * 140));
    const largestFrameStep = samples.slice(1).reduce((largest, sample, index) => (
      Math.max(largest, numericDistance(samples[index], sample))
    ), 0);
    const objectives = new Set(samples.map((sample) => sample.objective));
    const signatures = new Set(samples.filter((sample) => sample.beat === 'act').map((sample) => [
      sample.objective,
      sample.affect.valence,
      sample.affect.arousal,
      sample.movement.energy,
      sample.movement.openness,
      sample.movement.asymmetry,
      sample.locomotion.target.x,
    ].map((value) => typeof value === 'number' ? Math.round(value * 5) / 5 : value).join('|')));

    for (const sample of samples) {
      expect([sample.affect.arousal, sample.affect.dominance, sample.movement.energy, sample.movement.openness, sample.movement.beat]
        .every((value) => value >= 0 && value <= 1)).toBe(true);
      expect([sample.affect.valence, sample.movement.verticality, sample.movement.forward, sample.movement.asymmetry,
        sample.attention.x, sample.attention.y, sample.locomotion.target.x, sample.locomotion.target.depth]
        .every((value) => value >= -1 && value <= 1)).toBe(true);
    }

    expect(objectives.size).toBe(7);
    expect(signatures.size).toBeGreaterThan(12);
    expect(largestFrameStep).toBeLessThan(0.42);
  });
});
