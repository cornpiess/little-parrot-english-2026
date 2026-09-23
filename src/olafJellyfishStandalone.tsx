import { createRoot } from 'react-dom/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OceanAdventureStage from '@/features/olaf-live/OceanAdventureStage';
import { createAdventureRuntime, type AdventureEvent } from '@/features/olaf-live/adventureRuntime';
import { OCEAN_JELLYFISH_STORY as story } from '@/features/olaf-live/oceanAdventureStory';
import { useOlafLiveSession } from '@/features/olaf-live/useOlafLiveSession';
import '@/index.css';
import '@/features/olaf-live/OceanAdventure.css';

function OlafJellyfishAdventure() {
  const runtime = useMemo(() => createAdventureRuntime(story), []);
  const [adventure, setAdventure] = useState(() => runtime.advance(performance.now()));
  const spokenBeat = useRef('');
  const timerRef = useRef(0);
  const { direct, frame: characterFrame, videoRef } = useOlafLiveSession();

  const refresh = useCallback((atMs = performance.now()) => setAdventure(runtime.advance(atMs)), [runtime]);
  const send = useCallback((event: AdventureEvent) => {
    window.clearTimeout(timerRef.current);
    window.speechSynthesis?.cancel();
    runtime.dispatch(event);
    refresh(event.atMs);
  }, [refresh, runtime]);
  const speak = useCallback((text: string) => {
    window.speechSynthesis?.cancel();
    if (!('speechSynthesis' in window)) return;
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = 'zh-CN'; voice.rate = .88; voice.pitch = 1.18;
    voice.onstart = () => direct({ type: 'presence', atMs: performance.now(), presence: 'speaking' });
    voice.onend = () => direct({ type: 'presence', atMs: performance.now(), presence: 'idle' });
    window.speechSynthesis.speak(voice);
  }, [direct]);

  useEffect(() => {
    if (!adventure.active) return;
    const interval = window.setInterval(() => refresh(), 90);
    return () => window.clearInterval(interval);
  }, [adventure.active, refresh]);
  useEffect(() => {
    if (!adventure.active || spokenBeat.current === adventure.beat.id) return;
    spokenBeat.current = adventure.beat.id;
    const now = performance.now();
    direct({ type: 'direction', atMs: now, ...adventure.performance });
    direct({ type: 'attention', atMs: now, target: adventure.entities.some((entity) => entity.highlighted)
      ? { focus: 'object', x: .46, y: -.08, depth: .78 }
      : { focus: 'user', x: 0, y: -.03, depth: .82 } });
    speak(adventure.speechCue.text);
    if (!adventure.interaction) timerRef.current = window.setTimeout(() => send({ type: 'continue', atMs: performance.now() }), adventure.beat.durationMs);
    return () => window.clearTimeout(timerRef.current);
  }, [adventure.active, adventure.beat.id, adventure.beat.durationMs, adventure.entities, adventure.interaction, adventure.performance, adventure.speechCue.text, direct, send, speak]);
  useEffect(() => () => { window.clearTimeout(timerRef.current); window.speechSynthesis?.cancel(); }, []);

  const start = () => {
    spokenBeat.current = '';
    if (adventure.complete) runtime.dispatch({ type: 'restart', atMs: performance.now() });
    runtime.dispatch({ type: 'start', atMs: performance.now() });
    refresh();
  };
  const next = () => { spokenBeat.current = ''; send({ type: 'continue', atMs: performance.now() }); };

  return <main className="ocean-adventure-page standalone-jellyfish-page">
    <header className="ocean-adventure-header"><div><p>OLAF · OCEAN ADVENTURE</p><h1>{story.title}</h1><span>{story.subtitle}</span></div></header>
    <div className="ocean-adventure-layout">
      <div className="adventure-stage-shell">
        <OceanAdventureStage adventure={adventure} character={characterFrame} videoRef={videoRef} cameraEnabled={false} theme={story.theme} icon={story.icon} premise={story.premise} characterId="olaf" wordMeaning={(word) => story.targetConcepts.find((item) => item.word === word)?.meaning ?? word} />
        {!adventure.active && !adventure.complete && <div className="adventure-curtain"><span>🪼</span><h2>月光珍珠失踪了</h2><p>{story.premise}</p><button type="button" className="start-adventure-button" onClick={start}>{story.startLabel}</button></div>}
        {adventure.complete && <div className="adventure-curtain adventure-ending"><span>🏅</span><h2>{story.completionTitle}</h2><p>你和雪宝帮助了水母，还学会了 <b>jellyfish</b> 和 <b>glow</b>！</p><button type="button" className="start-adventure-button" onClick={start}>再玩一次</button></div>}
        {adventure.active && <div className="adventure-subtitle" aria-live="polite">{adventure.speechCue.text}</div>}
      </div>
      <aside className="adventure-story-console">
        <div className="story-progress-heading"><span>冒险进度</span><strong>{adventure.beatIndex + 1} / {adventure.beatCount}</strong></div>
        <div className="story-progress"><i style={{ width: `${((adventure.beatIndex + adventure.beatProgress) / adventure.beatCount) * 100}%` }} /></div>
        <p className="story-beat-kicker">{adventure.world.label}</p><h2>{adventure.beat.label}</h2>
        <div className="target-word-list">{story.targetConcepts.map(({ word, meaning }) => <div className={adventure.memory.learnedWords.includes(word) ? 'is-learned' : ''} key={word}><span>{adventure.memory.learnedWords.includes(word) ? '✓' : '·'}</span><strong>{word}</strong><small>{meaning}</small></div>)}</div>
        {adventure.active && adventure.interaction?.kind === 'say' && <section className="child-interaction-card"><small>轮到你啦</small><h3>{adventure.interaction.prompt}</h3><button type="button" onClick={() => { spokenBeat.current = ''; send({ type: 'child-said', text: adventure.interaction?.kind === 'say' ? adventure.interaction.target : '', atMs: performance.now() }); }}>🎙️ 我说了 {adventure.interaction.target}</button></section>}
        {adventure.active && adventure.interaction?.kind === 'choice' && <section className="child-interaction-card"><small>轮到你啦</small><h3>{adventure.interaction.prompt}</h3><div>{adventure.interaction.options.map((option) => <button type="button" key={option.value} onClick={() => { spokenBeat.current = ''; send({ type: 'choose', value: option.value, atMs: performance.now() }); }}>{option.emoji} {option.label}</button>)}</div></section>}
        <div className="story-console-actions">{adventure.active && <button type="button" onClick={next}>{adventure.interaction ? '跳过互动 →' : '进入下一幕'}</button>}{adventure.active && <button type="button" onClick={() => speak(adventure.speechCue.text)}>🔊 重听雪宝台词</button>}</div>
      </aside>
    </div>
  </main>;
}

createRoot(document.getElementById('root')!).render(<OlafJellyfishAdventure />);
