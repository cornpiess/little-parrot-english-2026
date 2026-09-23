import type { CharacterProfile } from '../../features/character-performance/characterProfile';
import { IRON_MAN_ACTIONS, type IronManAction } from './ironManActions';

/** Mark 46's expression grammar, exposed to a future adventure director. */
export const IRON_MAN_PROFILE: CharacterProfile<IronManAction> = {
  id: 'ironman-mark-46',
  capabilities: {
    locomotion: ['ground', 'air'],
    anchors: ['left-hand', 'right-hand', 'head', 'chest', 'stage'],
    expressions: ['body', 'light', 'thruster', 'voice'],
    hasMouthAnimation: false,
  },
  actions: IRON_MAN_ACTIONS,
};
