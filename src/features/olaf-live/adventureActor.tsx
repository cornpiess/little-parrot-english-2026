import type { ReactNode } from 'react';
import type { AdventureCharacterId, AdventureFrame } from './adventureRuntime';
import { resolveCharacterEquipment } from '../character-performance/characterRegistry';
import type { CharacterRigFrame } from './rig';
import OlafLiveCharacter from './OlafLiveCharacter';
import { IronManCharacter, isIronManAction, type IronManAction } from '../../components/iron-man';
import { BuzzLightyearCharacter, isBuzzAction, type BuzzAction } from '../../components/buzz';
import ParrotCharacter, { type MascotState } from '../../components/ParrotCharacter';
import FoxCharacter from '../../components/FoxCharacter';

const IRON_ACTION_MAP: Record<string, IronManAction> = {
  fly: 'fly', 'diagonal-flight': 'fly', thinking: 'thinking', 'hologram-analyze': 'thinking', listening: 'listening',
  'scan-and-pause': 'surprised', 'open-explain': 'speaking', 'repulsor-brace': 'repulsor-blast', 'unibeam-brace': 'unibeam',
  'idea-pop': 'happy', 'proud-show': 'happy', 'hero-check': 'greeting', 'comic-misfire': 'surprised', 'center-clap': 'clap',
  clap: 'clap', cheer: 'cheer', surprised: 'surprised', happy: 'happy', 'calm-breathe': 'listening',
};
const BUZZ_ACTION_MAP: Record<string, BuzzAction> = {
  fly: 'fly', 'diagonal-flight': 'fly', thinking: 'thinking', 'hologram-analyze': 'thinking', listening: 'listening',
  'scan-and-pause': 'scan', 'open-explain': 'speaking', 'repulsor-brace': 'wrist-laser', 'unibeam-brace': 'happy',
  'idea-pop': 'happy', 'proud-show': 'akimbo', 'hero-check': 'akimbo', 'comic-misfire': 'surprised', 'center-clap': 'clap',
  clap: 'clap', cheer: 'happy', surprised: 'surprised', happy: 'happy', 'calm-breathe': 'listening',
  'point-and-name': 'wings-deploy', 'conduct-rhythm': 'fly',
};
const MASCOT_ACTION_MAP: Record<string, MascotState> = {
  'surprise-find': 'surprised', 'sneak-and-peek': 'peek', 'listen-signal': 'listening', 'hero-check': 'greeting',
  'open-explain': 'speaking', 'joyful-clap': 'clap', 'calm-breathe': 'idle', 'proud-show': 'happy', 'diagonal-flight': 'fly',
};
const MASCOT_STATES: readonly MascotState[] = ['idle', 'listening', 'thinking', 'speaking', 'sleeping', 'greeting', 'clap', 'wave', 'dance', 'bounce', 'nod', 'spin', 'hearts', 'excited', 'surprised', 'happy', 'fly', 'cheer', 'shake', 'dizzy', 'shy', 'peek'];

export interface AdventureActorProps {
  characterId: AdventureCharacterId;
  adventure: AdventureFrame;
  character: CharacterRigFrame;
  travelling: boolean;
}

const costumeFor = (outfit: AdventureFrame['outfit']) => outfit === 'none' ? undefined : ({
  id: outfit === 'diving-suit' ? 'ocean-diving-suit' : `olaf-${outfit}`,
  visual: outfit,
  accent: '#ffd166',
} as const);

function resolveAdventureAction(characterId: AdventureCharacterId, requested: string) {
  if (characterId === 'ironman') return isIronManAction(requested) ? requested : IRON_ACTION_MAP[requested] ?? 'idle';
  if (characterId === 'buzz') return isBuzzAction(requested) ? requested : BUZZ_ACTION_MAP[requested] ?? 'idle';
  if (MASCOT_STATES.includes(requested as MascotState)) return requested as MascotState;
  return MASCOT_ACTION_MAP[requested] ?? 'idle';
}

/** The only character-specific seam used by an adventure scene. */
export default function AdventureActor({ characterId, adventure, character, travelling }: AdventureActorProps) {
  const requested = adventure.beat.actorAction ?? adventure.beat.motif;
  const equipment = resolveCharacterEquipment(characterId, adventure.world.scene === 'ocean' ? 'ocean' : adventure.world.scene === 'dinosaur' ? 'dinosaur' : 'space', adventure.outfit);
  let actor: ReactNode;
  if (characterId === 'ironman') {
    actor = <IronManCharacter action={resolveAdventureAction(characterId, requested) as IronManAction} size={travelling ? .55 : .68} />;
  } else if (characterId === 'buzz') {
    actor = <BuzzLightyearCharacter action={resolveAdventureAction(characterId, requested) as BuzzAction} size={travelling ? .62 : .8} speaking={character?.presence === 'speaking'} />;
  } else if (characterId === 'parrot') {
    actor = <ParrotCharacter state={resolveAdventureAction(characterId, character?.presence === 'speaking' ? 'speaking' : requested) as MascotState} size={travelling ? .86 : 1.05} looking />;
  } else if (characterId === 'fox') {
    actor = <FoxCharacter state={resolveAdventureAction(characterId, character?.presence === 'speaking' ? 'speaking' : requested) as MascotState} size={travelling ? .86 : 1.05} looking />;
  } else {
    actor = <OlafLiveCharacter frame={character} size={travelling ? .86 : 1.05} costume={costumeFor(adventure.outfit)} />;
  }
  return <div className={`adventure-olaf adventure-actor-${characterId} ${travelling ? 'is-driving' : ''}`} data-adventure-character={characterId} data-adventure-equipment={equipment.label}>{actor}</div>;
}
