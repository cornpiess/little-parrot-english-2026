import { describe, expect, it } from 'vitest';
import { CHARACTER_KITS, getCharacterKit, resolveCharacterEquipment } from './characterRegistry';

describe('character kit registry', () => {
  it('keeps adventure-ready leads explicit and unique', () => {
    expect(new Set(CHARACTER_KITS.map((kit) => kit.id)).size).toBe(CHARACTER_KITS.length);
    expect(CHARACTER_KITS.filter((kit) => kit.adventureReady).map((kit) => kit.id)).toEqual(['olaf', 'ironman', 'buzz']);
  });

  it('lets a story reuse a world without forcing the wrong costume', () => {
    expect(resolveCharacterEquipment('olaf', 'ocean', 'diving-suit')).toMatchObject({ protection: 'costume', movement: 'vehicle' });
    expect(resolveCharacterEquipment('ironman', 'ocean', 'diving-suit')).toMatchObject({ protection: 'native', movement: 'native' });
    expect(getCharacterKit('buzz').nativeEquipment).toContain('wings');
  });
});
