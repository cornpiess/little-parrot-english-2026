/**
 * Character Kit registry.
 *
 * Stories only ask for a lead and a medium.  The registry decides which
 * equipment is native to that character, so a story never needs to know that
 * an astronaut already owns a pressure suit or that Olaf needs a costume.
 */
export type CharacterId = 'olaf' | 'ironman' | 'buzz' | 'parrot' | 'fox';
export type AdventureMedium = 'ocean' | 'dinosaur' | 'space';

export interface CharacterKitDefinition {
  id: CharacterId;
  name: string;
  subtitle: string;
  icon: string;
  defaultAction: string;
  adventureReady: boolean;
  nativeEquipment: readonly string[];
  media: readonly AdventureMedium[];
}

export interface CharacterEquipmentPlan {
  protection: 'none' | 'native' | 'costume';
  movement: 'body' | 'native' | 'vehicle';
  label: string;
}

export const CHARACTER_KITS: readonly CharacterKitDefinition[] = [
  { id: 'olaf', name: '雪宝', subtitle: 'Olaf', icon: '☃️', defaultAction: 'idle', adventureReady: true, nativeEquipment: [], media: ['ocean', 'dinosaur', 'space'] },
  { id: 'ironman', name: '钢铁侠', subtitle: 'Iron Man · Mark 46', icon: '🦾', defaultAction: 'fly', adventureReady: true, nativeEquipment: ['sealed-armor', 'repulsor-flight', 'hud'], media: ['ocean', 'dinosaur', 'space'] },
  { id: 'buzz', name: '巴斯光年', subtitle: 'Buzz Lightyear', icon: '🚀', defaultAction: 'akimbo', adventureReady: true, nativeEquipment: ['space-suit', 'wings', 'communicator'], media: ['ocean', 'dinosaur', 'space'] },
  { id: 'parrot', name: '小鹦鹉', subtitle: 'Parrot', icon: '🦜', defaultAction: 'idle', adventureReady: false, nativeEquipment: ['feathers'], media: ['dinosaur', 'space'] },
  { id: 'fox', name: '小狐狸', subtitle: 'Fox', icon: '🦊', defaultAction: 'idle', adventureReady: false, nativeEquipment: ['fur'], media: ['dinosaur', 'space'] },
];

export function getCharacterKit(id: CharacterId): CharacterKitDefinition {
  return CHARACTER_KITS.find((kit) => kit.id === id) ?? CHARACTER_KITS[0];
}

export function resolveCharacterEquipment(
  id: CharacterId,
  medium: AdventureMedium,
  requestedOutfit: 'none' | 'diving-suit' | 'explorer' | 'space-suit' = 'none',
): CharacterEquipmentPlan {
  const kit = getCharacterKit(id);
  if (kit.nativeEquipment.length > 0) {
    return { protection: 'native', movement: kit.nativeEquipment.includes('wings') || kit.nativeEquipment.includes('repulsor-flight') ? 'native' : 'body', label: kit.nativeEquipment[0] };
  }
  if (medium === 'ocean' && requestedOutfit === 'diving-suit') {
    return { protection: 'costume', movement: 'vehicle', label: 'diving-suit' };
  }
  return { protection: 'none', movement: 'body', label: requestedOutfit === 'none' ? 'everyday' : requestedOutfit };
}
