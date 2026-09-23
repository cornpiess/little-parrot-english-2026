import type { DramaticObjective } from './rig';
import type { AdventureWorldKitId } from './adventureWorldKits';
import type { AdventureMechanicId } from './adventureMechanics';
import type { CharacterId } from '../character-performance/characterRegistry';
import { directAdventureBeat } from './adventureDirector';

export type AdventureTheme = 'ocean' | 'dinosaur' | 'space';
export type AdventureCharacterId = CharacterId;
export type AdventureSceneKind = 'base' | 'transit' | 'ocean' | 'dinosaur' | 'space' | 'return';
export type AdventureEntityMood = 'curious' | 'shy' | 'playful' | 'glowing' | 'gentle' | 'excited';
export type AdventureShot = 'wide' | 'medium' | 'close' | 'cockpit';
export type AdventureFocus = 'hero' | 'child' | 'object' | 'world';
export type AdventureSceneMotion = 'quiet' | 'travel' | 'crisis' | 'celebrate';
export type AdventureTransition = 'cut' | 'dissolve' | 'flight' | 'helmet-iris' | 'gravity-flip' | 'page-turn';

export interface AdventureSceneDirection {
  set: string;
  shot: AdventureShot;
  focus: AdventureFocus;
  motion: AdventureSceneMotion;
  transition: AdventureTransition;
  childAbility?: string;
  gestureSafe: boolean;
  environmentActivity: 'low' | 'medium' | 'high';
}

export interface AdventureWorldDefinition {
  id: string;
  label: string;
  scene: AdventureSceneKind;
}

export interface AdventureEntityFrame {
  id: string;
  concept: string;
  label: string;
  emoji: string;
  x: number;
  y: number;
  depth: number;
  mood: AdventureEntityMood;
  /** Optional production visual key; emoji remains a safe fallback for prototypes. */
  visual?: 'energy-core' | 'magnet' | 'gravity-box' | 'football' | 'apple' | 'fish' | 'egg' | 'dinosaur' | 'star' | 'satellite' | 'footprints';
  highlighted?: boolean;
}

export interface AdventureChoice {
  value: string;
  label: string;
  emoji: string;
}

export type AdventureInteraction =
  | { kind: 'say'; target: string; prompt: string; aliases: string[] }
  | { kind: 'choice'; target: string; prompt: string; options: AdventureChoice[] };

export interface AdventureBeatDefinition {
  id: string;
  label: string;
  worldId: string;
  durationMs: number;
  line: string;
  objective: DramaticObjective;
  motif: string;
  intensity: number;
  actorAction?: string;
  outfit: 'none' | 'diving-suit' | 'explorer' | 'space-suit';
  vehicle?: { id: string; cockpit: boolean };
  entities?: AdventureEntityFrame[];
  interaction?: AdventureInteraction;
  learnWord?: string;
}

export interface AdventureStoryDefinition {
  id: string;
  theme: AdventureTheme;
  leadCharacter?: AdventureCharacterId;
  narrativeFingerprint?: { coreFantasy: string; childRole: string; mechanic: string; ending: string };
  worldKit?: AdventureWorldKitId;
  mechanicKit?: AdventureMechanicId;
  title: string;
  subtitle: string;
  icon: string;
  premise: string;
  startLabel: string;
  completionTitle: string;
  targetConcepts: { word: string; meaning: string; emoji: string }[];
  targetWords: string[];
  worlds: AdventureWorldDefinition[];
  beats: AdventureBeatDefinition[];
}

export type AdventureEvent =
  | { type: 'start'; atMs: number }
  | { type: 'continue'; atMs: number }
  | { type: 'choose'; value: string; atMs: number }
  | { type: 'child-said'; text: string; atMs: number }
  | { type: 'restart'; atMs: number };

export interface AdventureFrame {
  storyId: string;
  title: string;
  active: boolean;
  complete: boolean;
  beatIndex: number;
  beatCount: number;
  beat: AdventureBeatDefinition;
  leadCharacter: AdventureCharacterId;
  worldKit?: AdventureWorldKitId;
  mechanicKit?: AdventureMechanicId;
  beatProgress: number;
  world: AdventureWorldDefinition;
  vehicle?: { id: string; cockpit: boolean };
  outfit: AdventureBeatDefinition['outfit'];
  entities: AdventureEntityFrame[];
  interaction?: AdventureInteraction;
  speechCue: { id: string; text: string };
  performance: { objective: DramaticObjective; motif: string; intensity: number; holdMs: number };
  memory: { learnedWords: string[]; choices: Record<string, string> };
  direction: AdventureSceneDirection;
}

export interface AdventureRuntime {
  dispatch(event: AdventureEvent): void;
  advance(atMs: number): AdventureFrame;
}

const normalizeSpeech = (value: string) => value.toLowerCase().replace(/[^a-z\u4e00-\u9fff]/g, '');

export function createAdventureRuntime(story: AdventureStoryDefinition, initialAtMs = performance.now()): AdventureRuntime {
  let active = false;
  let complete = false;
  let beatIndex = 0;
  let beatStartedAt = initialAtMs;
  let learnedWords: string[] = [];
  let choices: Record<string, string> = {};

  const currentBeat = () => story.beats[Math.min(beatIndex, story.beats.length - 1)];
  const rememberBeat = (beat: AdventureBeatDefinition) => {
    if (beat.learnWord && !learnedWords.includes(beat.learnWord)) learnedWords = [...learnedWords, beat.learnWord];
  };
  const moveNext = (atMs: number) => {
    const beat = currentBeat();
    rememberBeat(beat);
    if (beatIndex >= story.beats.length - 1) {
      active = false;
      complete = true;
      return;
    }
    beatIndex += 1;
    beatStartedAt = atMs;
  };
  const acceptsSpeech = (text: string, interaction: Extract<AdventureInteraction, { kind: 'say' }>) => {
    const normalized = normalizeSpeech(text);
    return interaction.aliases.some((alias) => normalized.includes(normalizeSpeech(alias)));
  };

  return {
    dispatch(event) {
      if (event.type === 'restart') {
        active = false; complete = false; beatIndex = 0; beatStartedAt = event.atMs; learnedWords = []; choices = {};
        return;
      }
      if (event.type === 'start') {
        active = true; complete = false; beatIndex = 0; beatStartedAt = event.atMs; learnedWords = []; choices = {};
        return;
      }
      if (!active || complete) return;
      const beat = currentBeat();
      if (event.type === 'continue') moveNext(event.atMs);
      if (event.type === 'choose' && beat.interaction?.kind === 'choice' && beat.interaction.options.some(({ value }) => value === event.value)) {
        choices = { ...choices, [beat.id]: event.value };
        moveNext(event.atMs);
      }
      if (event.type === 'child-said' && beat.interaction?.kind === 'say' && acceptsSpeech(event.text, beat.interaction)) moveNext(event.atMs);
    },
    advance(atMs) {
      const beat = currentBeat();
      const world = story.worlds.find(({ id }) => id === beat.worldId) ?? story.worlds[0];
      const elapsed = Math.max(0, atMs - beatStartedAt);
      return {
        storyId: story.id, title: story.title, active, complete, beatIndex, beatCount: story.beats.length, beat, leadCharacter: story.leadCharacter ?? 'olaf', worldKit: story.worldKit, mechanicKit: story.mechanicKit,
        beatProgress: Math.min(1, elapsed / Math.max(1, beat.durationMs)), world, ...(beat.vehicle ? { vehicle: beat.vehicle } : {}), outfit: beat.outfit,
        entities: beat.entities ?? [], ...(beat.interaction ? { interaction: beat.interaction } : {}),
        speechCue: { id: `${story.id}:${beat.id}`, text: beat.line },
        performance: { objective: beat.objective, motif: beat.motif, intensity: beat.intensity, holdMs: Math.max(2_400, beat.durationMs) },
        memory: { learnedWords: [...learnedWords], choices: { ...choices } },
        direction: directAdventureBeat(story, beat),
      };
    },
  };
}
