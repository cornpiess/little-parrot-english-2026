import type { CharacterProfile } from '../../features/character-performance/characterProfile';
import { BUZZ_ACTIONS, type BuzzAction } from './buzzActions';

export const BUZZ_PROFILE: CharacterProfile<BuzzAction> = {
  id: 'buzz-lightyear',
  capabilities: {
    locomotion: ['ground', 'air'],
    anchors: ['left-hand', 'right-hand', 'head', 'chest', 'stage'],
    expressions: ['body', 'light', 'thruster', 'voice'],
    hasMouthAnimation: true,
  },
  actions: BUZZ_ACTIONS,
};
