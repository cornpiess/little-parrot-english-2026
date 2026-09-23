import type { CSSProperties, RefObject } from 'react';
import type { AdventureCharacterId, AdventureEntityFrame, AdventureFrame, AdventureTheme } from './adventureRuntime';
import type { CharacterRigFrame } from './rig';
import AdventureActor from './adventureActor';
import AdventureEntityVisual from './AdventureEntityVisual';
import { getAdventureWorldKit } from './adventureWorldKits';
import { getAdventureMechanic } from './adventureMechanics';

interface Props { adventure: AdventureFrame; character: CharacterRigFrame; videoRef: RefObject<HTMLVideoElement>; cameraEnabled: boolean; theme: AdventureTheme; icon: string; premise: string; wordMeaning?: (word: string) => string; characterId?: AdventureCharacterId; }

function Jellyfish({ mood, highlighted, x, y, depth }: AdventureEntityFrame) {
  return <div className={`ocean-jellyfish mood-${mood} ${highlighted ? 'has-story-focus' : ''}`} style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${.72 + depth * .42})` }} data-adventure-entity="jellyfish"><svg viewBox="0 0 160 210" aria-label="发光的水母"><ellipse cx="80" cy="75" rx="58" ry="52" fill="#a7f3ff" opacity=".9" /><path d="M22 76Q26 22 80 20q54 2 58 56Q119 58 102 77Q80 54 58 77Q39 58 22 76Z" fill="#b8f4ff" opacity=".72" /><circle cx="61" cy="69" r="6" fill="#16344f" /><circle cx="99" cy="69" r="6" fill="#16344f" /><path d="M65 89Q80 101 95 89" fill="none" stroke="#16344f" strokeWidth="5" strokeLinecap="round" />{[42,66,92,116].map((v,i)=><path key={v} d={`M${v} 113Q${v+(i%2?18:-16)} 145 ${v} 196`} fill="none" stroke="#b9f3ff" strokeWidth="10" strokeLinecap="round" />)}</svg><strong>JELLYFISH</strong></div>;
}
function WorldScenery({ theme, worldKit, active }: { theme: AdventureTheme; worldKit?: AdventureFrame['worldKit']; active: boolean }) {
  if (!active) return null;
  if (theme === 'ocean') return <><div className="ocean-light-rays"/><div className="ocean-distant-reef"/><div className="ocean-bubbles">{Array.from({length:18},(_,i)=><i key={i} style={{'--bubble-index':i} as CSSProperties}/>)}</div><div className="ocean-coral coral-left">🪸</div><div className="ocean-coral coral-right">🪸</div></>;
  if (theme === 'dinosaur') return <><div className="dino-sun"/><div className="dino-volcano">🌋</div><div className="dino-ferns">🌿🌿<span>🌴</span>🌿🌿</div><div className="dino-dust">{Array.from({length:12},(_,i)=><i key={i}/>)}</div></>;
  if (worldKit === 'rainbow-energy-city') return <><div className="rainbow-city-grid"/><div className="rainbow-city-orb orb-a"/><div className="rainbow-city-orb orb-b"/><div className="rainbow-city-bars">{Array.from({length:7},(_,i)=><i key={i} style={{ '--bar-index': i } as CSSProperties}/>)}</div></>;
  if (worldKit === 'upside-down-toy-planet') return <><div className="toy-planet-rings"/><div className="toy-planet-cloud cloud-a"/><div className="toy-planet-cloud cloud-b"/><div className="toy-planet-arrows"><span>↑</span><span>↓</span></div></>;
  return <><div className="space-nebula"/><div className="space-planet">🪐</div><div className="space-stars">{Array.from({length:24},(_,i)=><i key={i}/>)}</div></>;
}
const cockpitLabel = { ocean: 'DEEP SEA', dinosaur: 'TIME 65M BC', space: 'STAR ORBIT' };

export default function OceanAdventureStage({ adventure, character, videoRef, cameraEnabled, theme, icon, premise, wordMeaning, characterId }: Props) {
  const travelling = adventure.world.scene === 'transit' || adventure.world.scene === 'return';
  const exploring = !['base','transit','return'].includes(adventure.world.scene);
  const lead = characterId ?? adventure.leadCharacter;
  const worldKit = getAdventureWorldKit(adventure.worldKit);
  const mechanicKit = getAdventureMechanic(adventure.mechanicKit);
  return <section className={`ocean-adventure-stage theme-${worldKit?.theme ?? theme} world-kit-${worldKit?.id ?? 'default'} scene-${adventure.world.scene} shot-${adventure.direction.shot} motion-${adventure.direction.motion} ${adventure.direction.gestureSafe ? 'is-gesture-safe' : ''}`} aria-label={`${lead} 的 ${worldKit?.label ?? theme} 冒险舞台`} data-adventure-lead={lead} data-adventure-world-kit={worldKit?.id ?? 'default'} data-adventure-mechanic={mechanicKit?.id ?? 'default'} data-adventure-visual-language={worldKit?.visualLanguage ?? 'cosmic'} data-scene-set={adventure.direction.set} data-scene-focus={adventure.direction.focus} data-scene-transition={adventure.direction.transition}>
    <div className="ocean-sky-glow"/><WorldScenery theme={theme} worldKit={adventure.worldKit} active={exploring || travelling}/>
    {adventure.world.scene === 'base' && <div className="adventure-base-map"><span>{icon}</span><b>{theme.toUpperCase()} MISSION</b><small>{premise}</small></div>}
    {adventure.entities.map((entity,index)=> entity.concept === 'jellyfish' ? <Jellyfish key={entity.id} {...entity}/> : <div key={entity.id} className={`adventure-entity entity-${index} mood-${entity.mood} ${entity.highlighted?'has-story-focus':''}`} style={{left:`${entity.x}%`,top:`${entity.y}%`,fontSize:`${42+entity.depth*40}px`}} data-adventure-entity={entity.concept}><AdventureEntityVisual entity={entity}/>{entity.highlighted && <strong>{entity.label}</strong>}</div>)}
    <AdventureActor characterId={lead} adventure={adventure} character={character} travelling={travelling}/>
    {adventure.vehicle?.cockpit && <div className={`adventure-cockpit cockpit-${theme}`} data-adventure-vehicle={adventure.vehicle.id}><div className="cockpit-window-ring"/><div className="cockpit-console"><span/><span/><span/><b>{cockpitLabel[theme]}</b></div><div className="steering-wheel"><i/><i/><i/></div><div className="copilot-port"><video ref={videoRef} muted playsInline className={cameraEnabled?'is-visible':''}/>{!cameraEnabled&&<div className="copilot-avatar">🧒</div>}<span>小小副驾驶</span></div></div>}
    {adventure.beat.learnWord && <div className="adventure-word-card"><small>MAGIC WORD</small><strong>{adventure.beat.learnWord}</strong><span>{typeof wordMeaning === 'function' ? wordMeaning(adventure.beat.learnWord) : ''}</span></div>}
    <div className="world-location"><span>{travelling?'◉ 航行中':exploring?'◉ 故事探索':'◉ 冒险基地'}</span><strong>{adventure.world.label}</strong></div>
  </section>;
}
