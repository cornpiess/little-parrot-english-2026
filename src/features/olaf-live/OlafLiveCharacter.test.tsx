import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createNeutralRig } from './performanceModel';
import OlafLiveCharacter from './OlafLiveCharacter';

describe('OlafLiveCharacter spatial layering', () => {
  it('renders converging clap arms in front of the torso', () => {
    const frame = createNeutralRig();
    frame.leftArm.crossBody = 1;
    frame.rightArm.crossBody = 1;
    frame.effects.handContact = 1;
    render(<OlafLiveCharacter frame={frame} />);

    const character = screen.getByRole('img', { name: '雪宝连续参数角色 Rig' });
    const torso = character.querySelector('[data-body-layer="torso"]');
    const frontArms = Array.from(character.querySelectorAll('[data-arm-layer="front"]'));
    const backArms = Array.from(character.querySelectorAll('[data-arm-layer="back"]'));

    expect(torso).toBeTruthy();
    expect(frontArms).toHaveLength(2);
    expect(backArms).toHaveLength(2);
    expect(frontArms.every((arm) => Boolean(torso?.compareDocumentPosition(arm) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    expect(frontArms.every((arm) => arm.getAttribute('opacity') === '1')).toBe(true);
    expect(backArms.every((arm) => arm.getAttribute('opacity') === '0')).toBe(true);
  });

  it('renders independently articulated snow segments for overlap and follow-through', () => {
    const frame = createNeutralRig(1_200);
    frame.torso.leanX = 0.8;
    frame.dynamics.anticipation = 0.7;
    frame.dynamics.followThrough = 0.45;
    render(<OlafLiveCharacter frame={frame} />);

    const character = screen.getByRole('img', { name: '雪宝连续参数角色 Rig' });
    const segments = Array.from(character.querySelectorAll('[data-body-segment]'));
    expect(segments.map((segment) => segment.getAttribute('data-body-segment'))).toEqual(['lower', 'middle', 'head']);
    expect(new Set(segments.map((segment) => segment.getAttribute('transform'))).size).toBe(3);
  });

  it('attaches a semantic prop to the articulated right hand', () => {
    const frame = createNeutralRig();
    render(<OlafLiveCharacter frame={frame} props={[{
      id: 'apple-1', kind: 'apple', concept: 'apple', label: 'APPLE', emoji: '🍎', action: 'show', state: 'held', anchor: 'right-hand',
      grip: 'right', manipulationProgress: 1, offsetX: 0, offsetY: 0, scale: 1, rotation: 0, opacity: 1, emphasis: 1, consumeProgress: 0, zIndex: 'front',
    }]} />);

    const prop = screen.getByRole('img', { name: '雪宝连续参数角色 Rig' }).querySelector('[data-stage-prop="apple"]');
    expect(prop?.getAttribute('data-prop-anchor')).toBe('right-hand');
    expect(prop?.textContent).toContain('APPLE');
  });

  it('constrains both arms to the grip points of a two-handed object', () => {
    const frame = createNeutralRig();
    render(<OlafLiveCharacter frame={frame} props={[{
      id: 'gift-1', kind: 'gift', concept: 'gift', label: 'GIFT', emoji: '🎁', action: 'open', state: 'open', anchor: 'both-hands',
      grip: 'both', manipulationProgress: 1, offsetX: 0, offsetY: -34, scale: 1, rotation: 0, opacity: 1, emphasis: 1, consumeProgress: 0, zIndex: 'front',
    }]} />);

    const character = screen.getByRole('img', { name: '雪宝连续参数角色 Rig' });
    expect(character.querySelectorAll('[data-arm-constrained="true"]')).toHaveLength(4);
    expect(character.querySelector('[data-arm-side="left"]')?.getAttribute('transform')).toContain('matrix');
  });
});
