import { describe, expect, it } from 'vitest';
import { inputsFromToolCall, perceptionToInputs } from './actionDirector';

describe('continuous performance director adapter', () => {
  it('maps the compact perform_turn contract to a bounded acting direction', () => {
    expect(inputsFromToolCall({
      name: 'perform_turn', args: { dramatic_goal: 'invite', speech_act: 'teach', teaching_goal: 'repeat', concept: 'apple', intensity: 3 },
    }, 4)).toEqual([{ type: 'direction', atMs: 4, objective: 'invite', intensity: 0.94, holdMs: 6_000 }]);
  });

  it('accepts a dramatic objective instead of requiring the model to puppeteer joints', () => {
    expect(inputsFromToolCall({
      name: 'direct_performance',
      args: { objective: 'comfort', motif: 'gentle-comfort', intensity: 0.72, hold_ms: 6_500 },
    }, 5)).toEqual([{
      type: 'direction', atMs: 5, objective: 'comfort', motif: 'gentle-comfort', intensity: 0.72, holdMs: 6_500,
    }]);
    expect(inputsFromToolCall({ name: 'direct_performance', args: { objective: 'attack' } }, 5)).toEqual([]);
    expect(inputsFromToolCall({ name: 'direct_performance', args: { objective: 'comfort', motif: 'unknown' } }, 5)).toEqual([]);
  });

  it('translates model intent into bounded continuous performance axes', () => {
    expect(inputsFromToolCall({
      name: 'shape_performance',
      args: { valence: 1.4, arousal: 0.8, dominance: 0.6, energy: 1.8, openness: 0.75, asymmetry: -0.4, hold_ms: 1200 },
    }, 10)).toEqual([{
      type: 'intent',
      atMs: 10,
      affect: { valence: 1, arousal: 0.8, dominance: 0.6 },
      movement: { energy: 1, openness: 0.75, verticality: 0, forward: 0, asymmetry: -0.4, beat: 0.25 },
      holdMs: 1200,
    }]);
  });

  it('ignores malformed model commands', () => {
    expect(inputsFromToolCall({ name: 'shape_performance', args: { valence: 'high' } }, 1)).toEqual([]);
    expect(inputsFromToolCall({ name: 'set_attention', args: { focus: 'nowhere', x: 0, y: 0 } }, 1)).toEqual([]);
  });

  it('translates semantic expression and 2.5D locomotion controls', () => {
    expect(inputsFromToolCall({
      name: 'shape_expression',
      args: { joy: 0.8, distress: 0, head_nod: 1, head_shake: 0, hand_converge: 0.7, sob: 0, tempo: 0.6, hold_ms: 1800 },
    }, 20)[0]).toMatchObject({
      type: 'expression', atMs: 20,
      channels: { joy: 0.8, headNod: 1, handConverge: 0.7 },
      holdMs: 1800,
    });
    expect(inputsFromToolCall({
      name: 'shape_locomotion',
      args: { x: 1.4, depth: -0.7, heading: 0.5, travel: 0.8, jump: 0.9, hold_ms: 2200 },
    }, 30)).toEqual([{
      type: 'locomotion', atMs: 30,
      target: { x: 1, depth: -0.7, heading: 0.5 },
      travel: 0.8, jump: 0.9, holdMs: 2200,
    }]);
  });

  it('turns local perception into attention and continuous movement intent', () => {
    expect(perceptionToInputs({ type: 'face', confidence: 0.91, x: 0.25, y: -0.1, timestamp: 1 }, 1)).toEqual([{
      type: 'attention',
      atMs: 1,
      target: { focus: 'user', x: 0.25, y: -0.1, depth: 0.72 },
    }]);
    const wave = perceptionToInputs({ type: 'hand', confidence: 0.9, gesture: 'wave', timestamp: 2 }, 2);
    expect(wave[0]).toMatchObject({ type: 'intent', movement: { energy: 0.9, asymmetry: 0.68 } });
    const smile = perceptionToInputs({ type: 'face', confidence: 0.9, gesture: 'smile', timestamp: 3 }, 3);
    expect(smile).toHaveLength(3);
    expect(smile[1]).toMatchObject({ type: 'intent', affect: { valence: 0.78 }, phrasing: { reaction: 0.74 } });
    expect(smile[2]).toMatchObject({ type: 'expression', channels: { joy: 0.72, headNod: 0.38 } });
    expect(perceptionToInputs({ type: 'hand', confidence: 0.4, gesture: 'wave', timestamp: 1 })).toEqual([]);
  });
});
