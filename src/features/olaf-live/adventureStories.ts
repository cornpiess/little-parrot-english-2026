import type { AdventureStoryDefinition } from './adventureRuntime';
import { DINOSAUR_EGG_STORY } from './dinosaurAdventureStory';
import { OCEAN_JELLYFISH_STORY } from './oceanAdventureStory';
import { SPACE_STAR_STORY } from './spaceAdventureStory';

export const ADVENTURE_STORIES = [OCEAN_JELLYFISH_STORY, DINOSAUR_EGG_STORY, SPACE_STAR_STORY] as const satisfies readonly AdventureStoryDefinition[];
export type AdventureStoryId = (typeof ADVENTURE_STORIES)[number]['id'];
export const getAdventureStory = (id: AdventureStoryId): AdventureStoryDefinition => ADVENTURE_STORIES.find((story) => story.id === id) ?? OCEAN_JELLYFISH_STORY;
