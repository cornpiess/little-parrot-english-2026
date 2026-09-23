import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserAsrCapture } from '@/features/olaf-live/browserAsr';
import { AzureSpeechOutput, defaultAzureCharacterVoice } from '@/features/olaf-live/azureSpeechOutput';
import { deliveryForObjective } from '@/features/olaf-live/characterSpeech';
import OceanAdventureStage from '@/features/olaf-live/OceanAdventureStage';
import { createAdventureRuntime, type AdventureCharacterId, type AdventureEvent } from '@/features/olaf-live/adventureRuntime';
import { ADVENTURE_STORIES, getAdventureStory, type AdventureStoryId } from '@/features/olaf-live/adventureStories';
import { CHARACTER_KITS } from '@/features/character-performance/characterRegistry';
import { useOlafLiveSession } from '@/features/olaf-live/useOlafLiveSession';
import '@/features/olaf-live/OceanAdventure.css';

const stopVoiceFrame = (direct: ReturnType<typeof useOlafLiveSession>['direct']) => direct({
  type: 'voice', atMs: performance.now(), features: { speaking: false, energy: 0, brightness: 0.5, emphasis: 0, jawOpen: 0, mouthWide: 0.2, mouthPucker: 0 },
});

export default function OlafOceanAdventure() {
  const [storyId, setStoryId] = useState<AdventureStoryId>('ocean-jellyfish-glow');
  const story = useMemo(() => getAdventureStory(storyId), [storyId]);
  const runtime = useMemo(() => createAdventureRuntime(story), [story]);
  const [leadCharacter, setLeadCharacter] = useState<AdventureCharacterId>(story.leadCharacter ?? 'olaf');
  const [adventure, setAdventure] = useState(() => runtime.advance(performance.now()));
  const [heardText, setHeardText] = useState('');
  const [listening, setListening] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const [speechError, setSpeechError] = useState('');
  const [voiceConfig, setVoiceConfig] = useState(defaultAzureCharacterVoice);
  const lastDirectedBeat = useRef('');
  const lastSpokenCue = useRef('');
  const adventureRef = useRef(adventure);
  adventureRef.current = adventure;
  const mouthTimer = useRef(0);
  const speakRef = useRef<(text: string) => void>(() => undefined);
  const asr = useRef<BrowserAsrCapture | null>(null);
  const live = useOlafLiveSession();
  const { cameraEnabled, direct, frame: characterFrame, toggleCamera, videoRef } = live;
  const azureSpeaker = useMemo(() => new AzureSpeechOutput(voiceConfig), [voiceConfig]);

  useEffect(() => {
    lastDirectedBeat.current = '';
    lastSpokenCue.current = '';
    setHeardText('');
    setAdventure(runtime.advance(performance.now()));
    setLeadCharacter(story.leadCharacter ?? 'olaf');
  }, [runtime, story]);

  useEffect(() => {
    if (!voiceConfig.subscriptionKey.trim() || typeof azureSpeaker.preload !== 'function') return;
    const timer = window.setTimeout(() => azureSpeaker.preload?.(story.beats.slice(0, 2).map((beat) => ({ text: beat.line, delivery: deliveryForObjective(beat.objective) }))), 260);
    return () => window.clearTimeout(timer);
  }, [azureSpeaker, story.beats, voiceConfig.subscriptionKey]);

  const refresh = useCallback((atMs = performance.now()) => setAdventure(runtime.advance(atMs)), [runtime]);
  const send = useCallback((event: AdventureEvent) => {
    runtime.dispatch(event);
    refresh(event.atMs);
  }, [refresh, runtime]);
  const cancelNarration = useCallback(() => {
    window.speechSynthesis?.cancel();
    azureSpeaker.cancel();
    if (mouthTimer.current) window.clearInterval(mouthTimer.current);
    mouthTimer.current = 0;
    stopVoiceFrame(direct);
  }, [azureSpeaker, direct]);
  const speak = useCallback((text: string) => {
    cancelNarration();
    setSpeechAvailable(true);
    setSpeechError('');
    if (voiceConfig.subscriptionKey.trim()) {
      azureSpeaker.speak({ text, delivery: deliveryForObjective(adventureRef.current.performance.objective) }, {
        onStart: () => direct({ type: 'presence', atMs: performance.now(), presence: 'speaking' }),
        onPulse: (features) => direct({ type: 'voice', atMs: performance.now(), features }),
        onEnd: cancelNarration,
        onError: (message) => { setSpeechAvailable(false); setSpeechError(message); cancelNarration(); },
      });
      return;
    }
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setSpeechAvailable(false);
      setSpeechError('当前浏览器不支持系统语音，请填写 Azure Speech Key 和对应 Region');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u4e00-\u9fff]/.test(text) ? 'zh-CN' : 'en-US';
    utterance.rate = 0.88;
    utterance.pitch = 1.18;
    utterance.volume = 1;
    utterance.onstart = () => {
      direct({ type: 'presence', atMs: performance.now(), presence: 'speaking' });
      mouthTimer.current = window.setInterval(() => {
        const pulse = 0.38 + Math.abs(Math.sin(performance.now() / 118)) * 0.5;
        direct({ type: 'voice', atMs: performance.now(), features: { speaking: true, energy: 0.7, brightness: 0.72, emphasis: 0.7, jawOpen: pulse, mouthWide: 0.46 + pulse * 0.28, mouthPucker: 0.08 } });
      }, 90);
    };
    utterance.onend = cancelNarration;
    utterance.onerror = (event) => { setSpeechAvailable(false); setSpeechError(`系统语音播放失败：${event.error}`); cancelNarration(); };
    window.speechSynthesis.speak(utterance);
  }, [azureSpeaker, cancelNarration, direct, voiceConfig.subscriptionKey]);
  speakRef.current = speak;

  useEffect(() => {
    if (!adventure.active) return;
    const timer = window.setInterval(() => refresh(), 80);
    return () => window.clearInterval(timer);
  }, [adventure.active, refresh]);

  useEffect(() => {
    const current = adventureRef.current;
    if (!current.active || lastDirectedBeat.current === current.beat.id) return;
    lastDirectedBeat.current = current.beat.id;
    const now = performance.now();
    direct({ type: 'direction', atMs: now, ...current.performance });
    direct({ type: 'attention', atMs: now, target: current.entities.some(({ highlighted }) => highlighted)
      ? { focus: 'object', x: 0.46, y: -0.08, depth: 0.78 }
      : { focus: 'user', x: 0, y: -0.03, depth: 0.82 } });
    if (lastSpokenCue.current !== current.speechCue.id) {
      lastSpokenCue.current = current.speechCue.id;
      if (voiceConfig.subscriptionKey.trim()) {
        if (typeof azureSpeaker.preload === 'function') azureSpeaker.preload(story.beats.slice(current.beatIndex, current.beatIndex + 3).map((beat) => ({ text: beat.line, delivery: deliveryForObjective(beat.objective) })));
      }
      speakRef.current(current.speechCue.text);
    }
    if (current.interaction) return;
    const timer = window.setTimeout(() => send({ type: 'continue', atMs: performance.now() }), current.beat.durationMs);
    return () => window.clearTimeout(timer);
  }, [adventure.active, adventure.beat.id, azureSpeaker, direct, send, story.beats, voiceConfig.subscriptionKey]);

  const startListening = useCallback(() => {
    if (listening || adventure.interaction?.kind !== 'say') return;
    cancelNarration();
    setHeardText('正在听你说…');
    const capture = new BrowserAsrCapture({ language: 'en-US' });
    asr.current = capture;
    try {
      capture.start((result) => {
        setHeardText(result.text);
        if (!result.final) return;
        const before = runtime.advance(performance.now()).beat.id;
        send({ type: 'child-said', text: result.text, atMs: performance.now() });
        if (runtime.advance(performance.now()).beat.id !== before) {
          capture.stop(); asr.current = null; setListening(false);
        }
      }, (message) => { setHeardText(message); setListening(false); });
      setListening(true);
    } catch (error) {
      setHeardText(error instanceof Error ? error.message : '语音识别暂时不可用');
      setListening(false);
    }
  }, [adventure.interaction, cancelNarration, listening, runtime, send]);

  useEffect(() => () => {
    asr.current?.abort();
    window.speechSynthesis?.cancel();
    azureSpeaker.cancel();
    if (mouthTimer.current) window.clearInterval(mouthTimer.current);
  }, [azureSpeaker]);

  const startStory = () => {
    lastDirectedBeat.current = '';
    lastSpokenCue.current = '';
    setHeardText('');
    send({ type: adventure.complete ? 'restart' : 'start', atMs: performance.now() });
    if (adventure.complete) window.setTimeout(() => send({ type: 'start', atMs: performance.now() }), 0);
  };
  const skipBeat = () => {
    cancelNarration();
    lastDirectedBeat.current = '';
    send({ type: 'continue', atMs: performance.now() });
  };

  return <main className="ocean-adventure-page">
    <header className="ocean-adventure-header">
      <a href="/olaf-live-lab">← 返回 Live Lab</a>
      <div><p>ADVENTURE THEATER · FIVE STORY PACKS</p><h1>{story.title}</h1><span>{story.subtitle}</span></div>
      <button type="button" onClick={toggleCamera}>{cameraEnabled ? '关闭副驾驶画面' : '开启副驾驶画面'}</button>
    </header>

    <div className="ocean-adventure-layout">
      <div className="adventure-stage-shell">
        <OceanAdventureStage adventure={adventure} character={characterFrame} videoRef={videoRef} cameraEnabled={cameraEnabled} theme={story.theme} icon={story.icon} premise={story.premise} characterId={leadCharacter} wordMeaning={(word) => { const concept = story.targetConcepts.find((item) => item.word === word); return concept ? `${concept.meaning} ${concept.emoji}` : word; }} />
        {!adventure.active && !adventure.complete && <div className="adventure-curtain">
          <span>{story.icon}</span><h2>{story.completionTitle === '月光海重新亮起来了' ? '月光珍珠失踪了' : story.premise.split('。')[0]}</h2><p>{story.premise}</p>
          <div className="adventure-story-picker">{ADVENTURE_STORIES.map((candidate) => <button type="button" className={candidate.id === storyId ? 'is-selected' : ''} key={candidate.id} onClick={() => setStoryId(candidate.id)}><span>{candidate.icon}</span><b>{candidate.title}</b><small>{candidate.targetWords.join(' · ')}</small></button>)}</div>
          <div className="adventure-protagonist-picker" aria-label="选择带队角色"><small>选择今天的带队角色</small><div>{CHARACTER_KITS.filter((kit) => kit.adventureReady).map((kit) => <button type="button" className={leadCharacter === kit.id ? 'is-selected' : ''} key={kit.id} onClick={() => setLeadCharacter(kit.id)}><span>{kit.icon}</span><b>{kit.name}</b></button>)}</div></div>
          <button type="button" className="start-adventure-button" onClick={startStory}>{story.startLabel}</button>
        </div>}
        {adventure.complete && <div className="adventure-curtain adventure-ending">
          <span>🏅</span><h2>{story.completionTitle}</h2><p>你学会了 <b>{story.targetWords[0]}</b> 和 <b>{story.targetWords[1]}</b>！</p>
          <div className="adventure-story-picker compact">{ADVENTURE_STORIES.filter((candidate) => candidate.id !== storyId).map((candidate) => <button type="button" key={candidate.id} onClick={() => setStoryId(candidate.id)}><span>{candidate.icon}</span><b>下一站：{candidate.title}</b></button>)}</div>
          <button type="button" className="start-adventure-button" onClick={startStory}>再玩一次</button>
        </div>}
        {adventure.active && <div className="adventure-subtitle" aria-live="polite">{adventure.speechCue.text}</div>}
      </div>

      <aside className="adventure-story-console" data-adult-console>
        <div className="story-progress-heading"><span>冒险进度</span><strong>{adventure.beatIndex + 1} / {adventure.beatCount}</strong></div>
        <div className="story-progress"><i style={{ width: `${((adventure.beatIndex + adventure.beatProgress) / adventure.beatCount) * 100}%` }} /></div>
        <p className="story-beat-kicker">{adventure.world.label}</p>
        <h2>{adventure.beat.label}</h2>
        <p className="story-objective">这一幕：{adventure.beat.objective === 'discover' ? '发现线索' : adventure.beat.objective === 'invite' ? '邀请孩子参与' : adventure.beat.objective === 'celebrate' ? '庆祝与强化' : '陪伴故事推进'}</p>

        <div className="target-word-list">
          {story.targetConcepts.map(({ word, meaning }) => <div className={adventure.memory.learnedWords.includes(word) ? 'is-learned' : ''} key={word}><span>{adventure.memory.learnedWords.includes(word) ? '✓' : '·'}</span><strong>{word}</strong><small>{meaning}</small></div>)}
        </div>

        {adventure.active && adventure.interaction?.kind === 'say' && <section className="child-interaction-card">
          <small>轮到小朋友</small><h3>{adventure.interaction.prompt}</h3>
          <button type="button" className={listening ? 'is-listening' : ''} onClick={startListening}>{listening ? '正在听…' : '🎙️ 打开麦克风回答'}</button>
          <button type="button" className="interaction-fallback" onClick={() => send({ type: 'child-said', text: adventure.interaction?.kind === 'say' ? adventure.interaction.target : '', atMs: performance.now() })}>演示：我说了 {adventure.interaction.target}</button>
          {heardText && <p>听到：{heardText}</p>}
        </section>}
        {adventure.active && adventure.interaction?.kind === 'choice' && <section className="child-interaction-card">
          <small>轮到小朋友</small><h3>{adventure.interaction.prompt}</h3>
          <div>{adventure.interaction.options.map((option) => <button type="button" key={option.value} onClick={() => send({ type: 'choose', value: option.value, atMs: performance.now() })}>{option.emoji} {option.label}</button>)}</div>
        </section>}

        <div className="story-console-actions">
          {adventure.active && !adventure.interaction && <button type="button" onClick={skipBeat}>进入下一幕</button>}
          {adventure.active && adventure.interaction && <button type="button" className="opacity-70 hover:opacity-100" onClick={skipBeat}>跳过互动 →</button>}
          {adventure.active && <button type="button" onClick={() => speak(adventure.speechCue.text)}>重听角色台词</button>}
        </div>
        <details className="adventure-voice-settings">
          <summary>可选：Azure 情绪语音</summary>
          <label>Region<input value={voiceConfig.region} onChange={(event) => setVoiceConfig((current) => ({ ...current, region: event.target.value }))} /></label>
          <label>Speech Key<input type="password" autoComplete="off" value={voiceConfig.subscriptionKey} placeholder="仅保存在当前页面内存" onChange={(event) => setVoiceConfig((current) => ({ ...current, subscriptionKey: event.target.value }))} /></label>
        </details>
        {!speechAvailable && <p className="speech-unavailable">{speechError || '当前浏览器没有可用语音，字幕和嘴型以外的故事功能仍可演示。'}</p>}
        <p className="privacy-note">摄像头与语音识别仅在你主动开启时运行；本演示不上传摄像头画面。</p>
      </aside>
    </div>
  </main>;
}
