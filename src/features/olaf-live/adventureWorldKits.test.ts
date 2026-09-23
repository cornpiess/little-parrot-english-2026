import { describe, expect, it } from 'vitest';
import { ADVENTURE_WORLD_KITS, getAdventureWorldKit } from './adventureWorldKits';

describe('adventure world kit registry', () => {
  it('keeps every story visual language distinct', () => {
    expect(new Set(ADVENTURE_WORLD_KITS.map((kit) => kit.id)).size).toBe(5);
    expect(new Set(ADVENTURE_WORLD_KITS.map((kit) => kit.visualLanguage)).size).toBe(5);
    expect(getAdventureWorldKit('rainbow-energy-city')).toMatchObject({ theme: 'space', visualLanguage: 'tech' });
  });
});
