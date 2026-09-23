import { describe, expect, it } from 'vitest';
import { ADVENTURE_MECHANICS, getAdventureMechanic } from './adventureMechanics';

describe('adventure mechanic kits', () => {
  it('keeps the child interaction grammar independent from story nouns', () => {
    expect(new Set(ADVENTURE_MECHANICS.map((mechanic) => mechanic.id)).size).toBe(5);
    expect(getAdventureMechanic('scan-and-repair')).toMatchObject({ interaction: 'repair', childRole: '小小工程师' });
  });
});
