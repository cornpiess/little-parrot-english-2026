import type { AdventureTheme } from './adventureRuntime';

export type AdventureWorldKitId = 'moonlit-ocean' | 'fern-valley' | 'starlight-orbit' | 'rainbow-energy-city' | 'upside-down-toy-planet';

export interface AdventureWorldKit {
  id: AdventureWorldKitId;
  theme: AdventureTheme;
  label: string;
  palette: string;
  visualLanguage: 'underwater' | 'natural' | 'cosmic' | 'tech' | 'toy';
}

/** One world contract used by every story.  New stories register a kit; the stage does the rendering. */
export const ADVENTURE_WORLD_KITS: readonly AdventureWorldKit[] = [
  { id: 'moonlit-ocean', theme: 'ocean', label: '月光珊瑚花园', palette: 'teal', visualLanguage: 'underwater' },
  { id: 'fern-valley', theme: 'dinosaur', label: '蕨叶回声谷', palette: 'amber', visualLanguage: 'natural' },
  { id: 'starlight-orbit', theme: 'space', label: '星光灯塔轨道', palette: 'violet', visualLanguage: 'cosmic' },
  { id: 'rainbow-energy-city', theme: 'space', label: '彩虹能源城', palette: 'prism', visualLanguage: 'tech' },
  { id: 'upside-down-toy-planet', theme: 'space', label: '上下颠倒玩具星球', palette: 'mint', visualLanguage: 'toy' },
];

export function getAdventureWorldKit(id: AdventureWorldKitId | undefined): AdventureWorldKit | undefined {
  return id ? ADVENTURE_WORLD_KITS.find((kit) => kit.id === id) : undefined;
}
