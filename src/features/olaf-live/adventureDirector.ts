import type { AdventureBeatDefinition, AdventureSceneDirection, AdventureStoryDefinition } from './adventureRuntime';

const gestureActions = new Set(['greeting', 'wave', 'clap', 'speaking', 'repulsor-blast', 'wrist-laser', 'wings-deploy', 'communicator']);

/**
 * The story supplies dramatic facts; this deep module turns them into a complete
 * shot.  Old story packs receive quiet defaults, while authored packs can vary
 * sets without teaching the stage about their plot.
 */
export function directAdventureBeat(story: AdventureStoryDefinition, beat: AdventureBeatDefinition): AdventureSceneDirection {
  const travelling = beat.vehicle || beat.worldId.includes('route') || beat.worldId.includes('lane');
  const interactive = Boolean(beat.interaction);
  return {
    set: beat.worldId,
    shot: travelling ? 'cockpit' : interactive ? 'medium' : 'wide',
    focus: beat.entities?.length ? 'object' : interactive ? 'child' : 'hero',
    motion: travelling ? 'travel' : beat.objective === 'celebrate' ? 'celebrate' : beat.intensity > .84 ? 'crisis' : 'quiet',
    transition: travelling ? 'flight' : 'dissolve',
    gestureSafe: gestureActions.has(beat.actorAction ?? beat.motif),
    environmentActivity: interactive || beat.objective === 'reassure' ? 'low' : beat.intensity > .86 ? 'high' : 'medium',
  };
}
