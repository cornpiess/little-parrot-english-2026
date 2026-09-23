import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OlafLiveCharacter from '@/features/olaf-live/OlafLiveCharacter';
import {
  createPerformanceImproviser,
  PERFORMANCE_MOTIFS,
  type ContinuousPerformanceIntent,
  type DramaticObjective,
  type PerformanceBeat,
} from '@/features/olaf-live/performanceImproviser';
import { useOlafLiveSession } from '@/features/olaf-live/useOlafLiveSession';
import { AzureSpeechOutput, defaultAzureCharacterVoice, type AzureCharacterVoiceConfig } from '@/features/olaf-live/azureSpeechOutput';
import { CHARACTER_LINES, chooseFreshCharacterLine, deliveryForMotif, deliveryForObjective } from '@/features/olaf-live/characterSpeech';
import { createOlafTheater, THEATER_BEAT_COUNT, type TheaterBeatRole } from '@/features/olaf-live/olafTheater';
import {
  createEmbodiedInteractionDirector,
  embodiedIntentFromToolCall,
  type EmbodiedTurnIntent,
} from '@/features/olaf-live/embodiedInteraction';
import { EMBODIED_DEMO_SCENES } from '@/features/olaf-live/embodiedSceneCatalog';
import {
  createVoiceSession,
  defaultAudioPipeline,
  defaultLlmPipeline,
  type NativeAudioPipelineConfig,
  type TextLlmPipelineConfig,
} from '@/features/olaf-live/voicePipeline';
import '@/features/olaf-live/OlafLiveLab.css';

const initialIntent: ContinuousPerformanceIntent = {
  affect: { valence: 0.65, arousal: 0.62, dominance: 0.48 },
  movement: { energy: 0.72, openness: 0.64, verticality: 0.12, forward: 0.3, asymmetry: 0.18, beat: 0.55 },
};

const motifGroups = [...new Set(PERFORMANCE_MOTIFS.map(({ group }) => group))];

const statusLabels = {
  offline: '离线预览', connecting: '正在连接', ready: '已连接', listening: '正在倾听', thinking: '正在思考', speaking: '正在说话', error: '连接异常',
};

const objectiveLabels: Record<DramaticObjective, string> = {
  celebrate: '庆祝成功', comfort: '温柔安慰', invite: '邀请参与', discover: '好奇发现',
  reassure: '给予信心', play: '调皮逗乐', listen: '认真倾听',
};

const beatLabels: Record<PerformanceBeat, string> = {
  notice: '察觉', appraise: '判断', prepare: '准备', act: '行动', react: '反馈', settle: '收势',
};

const theaterBeatLabels: Record<TheaterBeatRole, string> = {
  hook: '抓住注意', setup: '铺垫', build: '升级', turn: '转折', punchline: '小包袱', callback: '回扣', button: '暖心收束',
};

const pauseAfterLine = (text: string) => {
  const signature = [...text].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return 900 + (signature % 901);
};

export default function OlafLiveLab() {
  const [pipelineKind, setPipelineKind] = useState<'audio-to-audio' | 'llm'>('audio-to-audio');
  const [audioConfig, setAudioConfig] = useState<NativeAudioPipelineConfig>(defaultAudioPipeline);
  const [llmConfig, setLlmConfig] = useState<TextLlmPipelineConfig>(defaultLlmPipeline);
  const [voiceConfig, setVoiceConfig] = useState<AzureCharacterVoiceConfig>(defaultAzureCharacterVoice);
  const [voiceError, setVoiceError] = useState('');
  const [manualIntent, setManualIntent] = useState<ContinuousPerformanceIntent>(initialIntent);
  const [isImprovising, setIsImprovising] = useState(false);
  const [isTheaterPlaying, setIsTheaterPlaying] = useState(false);
  const [theaterRunId, setTheaterRunId] = useState(0);
  const [improvSpeechText, setImprovSpeechText] = useState('');
  const [actorReadout, setActorReadout] = useState<{ objective: DramaticObjective; beat: PerformanceBeat; feeling: string }>({
    objective: 'listen', beat: 'settle', feeling: '被认真倾听和重视',
  });
  const [activeDemoId, setActiveDemoId] = useState('');
  const [theaterReadout, setTheaterReadout] = useState({
    title: '等待开场', role: 'hook' as TheaterBeatRole, beatIndex: 0, progress: 0, feeling: '听懂一个短小、有趣、完整的故事',
  });
  const embodiedDirectorRef = useRef(createEmbodiedInteractionDirector());
  const [embodiedFrame, setEmbodiedFrame] = useState(() => embodiedDirectorRef.current.advance());
  const embodiedSpeechOwnerRef = useRef<'local' | 'model'>('local');
  const lastEmbodiedPerformanceRef = useRef('');
  const lastEmbodiedSpeechRef = useRef('');
  const improvisingRef = useRef(false);
  const theaterPlayingRef = useRef(false);
  const improviserRef = useRef(createPerformanceImproviser());
  const theaterRef = useRef(createOlafTheater());
  const lastSpeechCueRef = useRef('');
  const lastTheaterBeatRef = useRef('');
  const lastTheaterLineRef = useRef('');
  const lineTakeRef = useRef<Record<string, number>>({});
  const recentLinesRef = useRef<string[]>([]);
  const speechInFlightRef = useRef(false);
  const nextSpeechAllowedAtRef = useRef(0);
  const characterSpeaker = useMemo(() => new AzureSpeechOutput(voiceConfig), [voiceConfig]);
  const sessionFactory = useCallback(
    () => createVoiceSession(pipelineKind === 'audio-to-audio' ? audioConfig : llmConfig, voiceConfig),
    [audioConfig, llmConfig, pipelineKind, voiceConfig],
  );
  const live = useOlafLiveSession({ sessionFactory });
  const previousLiveStatusRef = useRef(live.status);
  const directPerformance = live.direct;
  const latestTranscript = useMemo(() => live.transcript.slice(-4), [live.transcript]);
  const isOnline = live.status !== 'offline' && live.status !== 'error';

  const stopSpeechRig = useCallback(() => {
    directPerformance({ type: 'voice', atMs: performance.now(), features: { speaking: false, energy: 0, brightness: 0.5, emphasis: 0, jawOpen: 0, mouthWide: 0.2, mouthPucker: 0 } });
  }, [directPerformance]);

  const speakAsOlaf = useCallback((
    text: string,
    delivery: ReturnType<typeof deliveryForMotif>,
    allowInterrupt = true,
    onSettled?: () => void,
  ) => {
    const now = performance.now();
    if (!allowInterrupt && (speechInFlightRef.current || now < nextSpeechAllowedAtRef.current)) return false;
    speechInFlightRef.current = true;
    setVoiceError('');
    setImprovSpeechText(text);
    characterSpeaker.speak({ text, delivery }, {
      onStart: () => directPerformance({ type: 'presence', atMs: performance.now(), presence: 'speaking' }),
      onPulse: (features) => directPerformance({ type: 'voice', atMs: performance.now(), features }),
      onEnd: () => {
        speechInFlightRef.current = false;
        nextSpeechAllowedAtRef.current = performance.now() + pauseAfterLine(text);
        stopSpeechRig();
        window.setTimeout(() => setImprovSpeechText(''), 900);
        onSettled?.();
      },
      onError: (message) => {
        speechInFlightRef.current = false;
        nextSpeechAllowedAtRef.current = performance.now() + 3_000;
        stopSpeechRig();
        setVoiceError(message);
        onSettled?.();
      },
    });
    return true;
  }, [characterSpeaker, directPerformance, stopSpeechRig]);

  const stopEmbodiedScene = useCallback(() => {
    characterSpeaker.cancel();
    speechInFlightRef.current = false;
    nextSpeechAllowedAtRef.current = 0;
    stopSpeechRig();
    embodiedDirectorRef.current.ingest({ type: 'cancel', atMs: performance.now() });
    setEmbodiedFrame(embodiedDirectorRef.current.advance());
    lastEmbodiedPerformanceRef.current = '';
    lastEmbodiedSpeechRef.current = '';
  }, [characterSpeaker, stopSpeechRig]);

  const startEmbodiedScene = useCallback((intent: EmbodiedTurnIntent, speechOwner: 'local' | 'model' = 'local') => {
    characterSpeaker.cancel();
    speechInFlightRef.current = false;
    nextSpeechAllowedAtRef.current = 0;
    stopSpeechRig();
    improvisingRef.current = false;
    theaterPlayingRef.current = false;
    setIsImprovising(false);
    setIsTheaterPlaying(false);
    setActiveDemoId('');
    embodiedSpeechOwnerRef.current = speechOwner;
    lastEmbodiedPerformanceRef.current = '';
    lastEmbodiedSpeechRef.current = '';
    const atMs = performance.now();
    embodiedDirectorRef.current.direct(intent, atMs);
    setEmbodiedFrame(embodiedDirectorRef.current.advance(atMs));
  }, [characterSpeaker, stopSpeechRig]);

  const performIntent = useCallback((intent: ContinuousPerformanceIntent, holdMs = 8_000) => {
    directPerformance({ type: 'intent', atMs: performance.now(), ...intent, holdMs });
  }, [directPerformance]);

  const setImprovising = useCallback((enabled: boolean) => {
    // Stop the 140 ms producer synchronously so its final tick cannot overwrite
    // a manual expression dispatched by the same click.
    improvisingRef.current = enabled;
    if (enabled) {
      stopEmbodiedScene();
      theaterPlayingRef.current = false;
      setIsTheaterPlaying(false);
      setActiveDemoId('');
    }
    setIsImprovising(enabled);
  }, [stopEmbodiedScene]);

  const setTheaterPlaying = useCallback((enabled: boolean) => {
    theaterPlayingRef.current = enabled;
    if (enabled) {
      stopEmbodiedScene();
      improvisingRef.current = false;
      setIsImprovising(false);
      setActiveDemoId('');
      theaterRef.current = createOlafTheater();
      lastTheaterBeatRef.current = '';
      lastTheaterLineRef.current = '';
      setTheaterRunId((current) => current + 1);
    }
    setIsTheaterPlaying(enabled);
  }, [stopEmbodiedScene]);

  const performMotif = useCallback((motif: (typeof PERFORMANCE_MOTIFS)[number], requestedTake?: number) => {
    stopEmbodiedScene();
    setImprovising(false);
    setTheaterPlaying(false);
    setActiveDemoId(motif.id);
    setActorReadout({
      objective: motif.objective,
      beat: 'notice',
      feeling: motif.desiredChildFeeling ?? objectiveLabels[motif.objective],
    });
    directPerformance({
      type: 'direction', atMs: performance.now(), objective: motif.objective,
      motif: motif.id, intensity: 0.92, holdMs: 5_200,
    });
    const preferred = requestedTake ?? (lineTakeRef.current[motif.id] ?? -1) + 1;
    const chosen = requestedTake === undefined
      ? chooseFreshCharacterLine(CHARACTER_LINES[motif.id], preferred, recentLinesRef.current)
      : { text: CHARACTER_LINES[motif.id][requestedTake], index: requestedTake };
    lineTakeRef.current[motif.id] = chosen.index;
    recentLinesRef.current = [...recentLinesRef.current.slice(-3), chosen.text];
    speakAsOlaf(chosen.text, deliveryForMotif(motif));
  }, [directPerformance, setImprovising, setTheaterPlaying, speakAsOlaf, stopEmbodiedScene]);

  const changeAffect = useCallback((key: keyof ContinuousPerformanceIntent['affect'], value: number) => {
    setImprovising(false);
    setTheaterPlaying(false);
    const next = { ...manualIntent, affect: { ...manualIntent.affect, [key]: value } };
    setManualIntent(next);
    performIntent(next);
  }, [manualIntent, performIntent, setImprovising, setTheaterPlaying]);

  const changeMovement = useCallback((key: keyof ContinuousPerformanceIntent['movement'], value: number) => {
    setImprovising(false);
    setTheaterPlaying(false);
    const next = { ...manualIntent, movement: { ...manualIntent.movement, [key]: value } };
    setManualIntent(next);
    performIntent(next);
  }, [manualIntent, performIntent, setImprovising, setTheaterPlaying]);

  useEffect(() => {
    if (!isImprovising) return;
    const startedAt = performance.now();
    const update = () => {
      if (!improvisingRef.current) return;
      const next = improviserRef.current.sample(performance.now() - startedAt);
      setManualIntent({ affect: next.affect, movement: next.movement });
      setActorReadout({ objective: next.objective, beat: next.beat, feeling: next.desiredChildFeeling });
      performIntent(next, 520);
      directPerformance({ type: 'attention', atMs: performance.now(), target: next.attention });
      directPerformance({ type: 'locomotion', atMs: performance.now(), ...next.locomotion, holdMs: 520 });
      directPerformance({ type: 'expression', atMs: performance.now(), channels: next.expression, holdMs: 520 });
      if (!isOnline) {
        if (next.speechCue && next.speechCue.id !== lastSpeechCueRef.current) {
          const objectiveLines = PERFORMANCE_MOTIFS
            .filter(({ objective }) => objective === next.objective)
            .flatMap(({ id }) => CHARACTER_LINES[id]);
          const preferred = Math.abs(next.stateId.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0))
            + (next.speechCue.id.endsWith('-1') ? 1 : 0);
          const chosen = chooseFreshCharacterLine(objectiveLines, preferred, recentLinesRef.current);
          if (speakAsOlaf(chosen.text, deliveryForObjective(next.objective), false)) {
            lastSpeechCueRef.current = next.speechCue.id;
            recentLinesRef.current = [...recentLinesRef.current.slice(-3), chosen.text];
          }
        }
      }
    };
    update();
    const timer = window.setInterval(update, 140);
    return () => {
      window.clearInterval(timer);
      setImprovSpeechText('');
      if (!isOnline) {
        characterSpeaker.cancel();
        stopSpeechRig();
      }
    };
  }, [characterSpeaker, directPerformance, isImprovising, isOnline, performIntent, speakAsOlaf, stopSpeechRig]);

  useEffect(() => {
    if (!isTheaterPlaying) return;
    const startedAt = performance.now();
    const update = () => {
      if (!theaterPlayingRef.current) return;
      const moment = theaterRef.current.sample(performance.now() - startedAt);
      setTheaterReadout({
        title: moment.showTitle, role: moment.beatRole, beatIndex: moment.beatIndex, progress: moment.sceneProgress,
        feeling: moment.desiredChildFeeling,
      });
      if (moment.beatId !== lastTheaterBeatRef.current) {
        lastTheaterBeatRef.current = moment.beatId;
        directPerformance({
          type: 'direction', atMs: performance.now(), objective: moment.objective,
          motif: moment.motifId, intensity: 0.9, holdMs: 6_500,
        });
      }
      if (!isOnline && moment.beatId !== lastTheaterLineRef.current) {
        const motif = PERFORMANCE_MOTIFS.find(({ id }) => id === moment.motifId);
        if (motif && speakAsOlaf(moment.line, deliveryForMotif(motif), false, () => {
          theaterRef.current.completeLine(moment.beatId, performance.now() - startedAt);
        })) {
          lastTheaterLineRef.current = moment.beatId;
          recentLinesRef.current = [...recentLinesRef.current.slice(-3), moment.line];
        }
      }
    };
    update();
    const timer = window.setInterval(update, 140);
    return () => {
      window.clearInterval(timer);
      setImprovSpeechText('');
      if (!isOnline) {
        characterSpeaker.cancel();
        speechInFlightRef.current = false;
        stopSpeechRig();
      }
    };
  }, [characterSpeaker, directPerformance, isOnline, isTheaterPlaying, speakAsOlaf, stopSpeechRig, theaterRunId]);

  useEffect(() => {
    if (!embodiedFrame.active) return;
    let frameId = 0;
    const schedule = (callback: () => void) => {
      if (typeof window.requestAnimationFrame === 'function') return window.requestAnimationFrame(callback);
      return window.setTimeout(callback, 33);
    };
    const cancel = (id: number) => {
      if (typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(id);
      else window.clearTimeout(id);
    };
    const update = () => {
      const next = embodiedDirectorRef.current.advance(performance.now());
      setEmbodiedFrame(next);
      if (next.performance.id !== lastEmbodiedPerformanceRef.current) {
        lastEmbodiedPerformanceRef.current = next.performance.id;
        directPerformance({ type: 'direction', atMs: performance.now(), ...next.performance });
      }
      directPerformance({ type: 'attention', atMs: performance.now(), target: next.attention });
      if (embodiedSpeechOwnerRef.current === 'local' && next.speechCue && next.speechCue.id !== lastEmbodiedSpeechRef.current) {
        const cue = next.speechCue;
        if (speakAsOlaf(cue.text, deliveryForObjective(next.performance.objective), false, () => {
          embodiedDirectorRef.current.ingest({ type: 'speech-ended', cueId: cue.id, atMs: performance.now() });
        })) lastEmbodiedSpeechRef.current = cue.id;
      }
      if (next.active) frameId = schedule(update);
    };
    update();
    return () => cancel(frameId);
  }, [directPerformance, embodiedFrame.active, speakAsOlaf]);

  useEffect(() => {
    const latest = live.latestToolCall;
    if (!latest) return;
    const intent = embodiedIntentFromToolCall(latest.call);
    if (intent) startEmbodiedScene(intent, 'model');
  }, [live.latestToolCall, startEmbodiedScene]);

  useEffect(() => {
    const previous = previousLiveStatusRef.current;
    previousLiveStatusRef.current = live.status;
    if (previous === 'speaking' && live.status === 'listening' && embodiedFrame.active && embodiedSpeechOwnerRef.current === 'model') {
      embodiedDirectorRef.current.ingest({ type: 'model-turn-ended', atMs: performance.now() });
    }
  }, [embodiedFrame.active, live.status]);

  useEffect(() => {
    if (!embodiedFrame.active || !live.inputTranscript.trim()) return;
    const timer = window.setTimeout(() => embodiedDirectorRef.current.ingest({
      type: 'child-speech', text: live.inputTranscript, atMs: performance.now(),
    }), 650);
    return () => window.clearTimeout(timer);
  }, [embodiedFrame.active, live.inputTranscript]);

  useEffect(() => {
    if (isOnline) {
      setImprovising(false);
      setTheaterPlaying(false);
    }
  }, [isOnline, setImprovising, setTheaterPlaying]);

  useEffect(() => () => {
    characterSpeaker.cancel();
    speechInFlightRef.current = false;
  }, [characterSpeaker]);

  return (
    <main className="olaf-live-lab">
      <header className="olaf-live-header">
        <div>
          <p className="olaf-live-kicker">EXPERIMENTAL CHARACTER RUNTIME</p>
          <h1>雪宝 · Live Lab</h1>
          <p className="olaf-live-subtitle">让声音、眼神、表情和动作在同一拍发生。</p>
        </div>
        <div className={`olaf-live-status status-${live.status}`}>
          <span className="status-dot" />
          {statusLabels[live.status]}
        </div>
        <div className="flex gap-2">
          <a className="adventure-launch-link" href="/olaf-adventures">冒险剧场 →</a>
          <a className="adventure-launch-link" href="/iron-man-first-light">钢铁侠·第一束光 →</a>
        </div>
      </header>

      <section className="olaf-live-grid">
        <div className="olaf-stage-card">
          <div className="stage-lights" />
          <div className="stage-caption">
            <span>连续参数 Rig</span>
            <small>60 FPS · causal performance model</small>
          </div>
          <div className="olaf-stage-character">
            <OlafLiveCharacter frame={live.frame} props={embodiedFrame.props} size={1.18} />
          </div>
          {improvSpeechText && <div className="improv-speech-bubble">{improvSpeechText}</div>}
          <div className="olaf-stage-floor" />
          {live.cameraEnabled && <div className="camera-pill"><span className="camera-dot" />自然眼神交流已开启</div>}
          <video ref={live.videoRef} className={`olaf-camera-preview ${live.cameraEnabled ? 'is-visible' : ''}`} muted playsInline />
        </div>

        <aside className="olaf-control-card">
          <div className="control-heading">
            <div>
              <p className="olaf-live-kicker">SESSION CONTROL</p>
              <h2>和雪宝聊两句</h2>
            </div>
            <span className="latency-chip">统一表演时钟</span>
          </div>

          <p className="control-description">声音、表情、眼神和身体共享同一条时间轴。连续维度可以任意混合，也可以沿一条不会短周期重复的轨迹持续即兴。</p>

          <details className="api-config-panel" open>
            <summary>语音与模型 API</summary>
            <div className="pipeline-tabs" role="group" aria-label="语音管线类型">
              <button type="button" aria-pressed={pipelineKind === 'audio-to-audio'} disabled={isOnline} onClick={() => setPipelineKind('audio-to-audio')}>Audio-to-Audio</button>
              <button type="button" aria-pressed={pipelineKind === 'llm'} disabled={isOnline} onClick={() => setPipelineKind('llm')}>LLM + ASR + TTS</button>
            </div>

            {pipelineKind === 'audio-to-audio' ? (
              <div className="api-field-grid">
                <label>Provider<select value={audioConfig.provider} disabled><option value="gemini-live">Gemini Live</option></select></label>
                <label>Voice<input value={audioConfig.voiceName} disabled={isOnline} onChange={(event) => setAudioConfig((current) => ({ ...current, voiceName: event.target.value }))} /></label>
                <label className="field-wide">Model<input value={audioConfig.model} disabled={isOnline} onChange={(event) => setAudioConfig((current) => ({ ...current, model: event.target.value }))} /></label>
                <label className="field-wide">API Key<input type="password" autoComplete="off" placeholder="留空则使用 /api/gemini-token" value={audioConfig.apiKey} disabled={isOnline} onChange={(event) => setAudioConfig((current) => ({ ...current, apiKey: event.target.value }))} /></label>
              </div>
            ) : (
              <div className="api-field-grid">
                <label className="field-wide">Chat Completions URL<input value={llmConfig.endpoint} disabled={isOnline} onChange={(event) => setLlmConfig((current) => ({ ...current, endpoint: event.target.value }))} /></label>
                <label className="field-wide">Model<input value={llmConfig.model} disabled={isOnline} onChange={(event) => setLlmConfig((current) => ({ ...current, model: event.target.value }))} /></label>
                <label className="field-wide">API Key<input type="password" autoComplete="off" placeholder="也可以留空并使用自己的代理地址" value={llmConfig.apiKey} disabled={isOnline} onChange={(event) => setLlmConfig((current) => ({ ...current, apiKey: event.target.value }))} /></label>
                <label>ASR<select value={llmConfig.asr} disabled><option value="browser">浏览器 Web Speech</option></select></label>
                <label>TTS<select value={llmConfig.tts} disabled><option value="azure">Azure 情绪语音 + Viseme</option></select></label>
                <label>Language<input value={llmConfig.language} disabled={isOnline} onChange={(event) => setLlmConfig((current) => ({ ...current, language: event.target.value }))} /></label>
              </div>
            )}
            <p className="api-security-note">密钥仅保存在当前页面内存中。公开部署时请使用服务端代理，不要把长期密钥交给浏览器。</p>
          </details>

          <details className="api-config-panel character-voice-panel" open>
            <summary>雪宝角色声音 · Azure 免费层</summary>
            <div className="api-field-grid">
              <label>角色声线<input value="云希 · 男孩角色" disabled /></label>
              <label>Region<input value={voiceConfig.region} disabled={isOnline} placeholder="eastasia" onChange={(event) => setVoiceConfig((current) => ({ ...current, region: event.target.value }))} /></label>
              <label className="field-wide">Speech Key<input type="password" autoComplete="off" placeholder="Azure Speech 资源密钥" value={voiceConfig.subscriptionKey} disabled={isOnline} onChange={(event) => setVoiceConfig((current) => ({ ...current, subscriptionKey: event.target.value }))} /></label>
            </div>
            <p className="api-security-note">同一个男孩声线会按状态切换开心、悲伤、害羞、紧张、安慰等说话方式。Speech Key 只保存在页面内存；Azure 返回的 viseme 时间戳直接驱动嘴型。</p>
          </details>

          <div className="control-actions">
            {!isOnline ? (
              <button className="primary-action" onClick={live.connect} disabled={live.status === 'connecting'}>
                {live.status === 'connecting' ? '连接中…' : '开始实时对话'}
              </button>
            ) : (
              <button className="secondary-action" onClick={live.disconnect}>结束会话</button>
            )}
            <button className={`icon-action ${live.micEnabled ? 'is-active' : ''}`} onClick={live.startMicrophone} disabled={!isOnline || live.micEnabled}>
              {live.micEnabled ? '麦克风已开' : '打开麦克风'}
            </button>
            <button className={`icon-action ${live.cameraEnabled ? 'is-active' : ''}`} onClick={live.toggleCamera}>
              {live.cameraEnabled ? '关闭眼神交流' : '开启眼神交流'}
            </button>
            <button className="interrupt-action" onClick={live.interrupt} disabled={!isOnline}>打断</button>
          </div>
          <p className="api-security-note">前置摄像头只在本地定位孩子的眼睛；雪宝会根据倾听、说话和思考节奏自然地移开，再主动看回来。</p>
          {voiceError && <div className="olaf-error voice-error">{voiceError}<small>Azure Speech 有每月免费额度；创建 Speech 资源后填写 Key 与 Region 即可。</small></div>}

          <section className="embodied-scene-panel" aria-label="具身教学场景">
            <div className="embodied-scene-heading">
              <div><p className="section-label">角色 × 道具 × 教学目标</p><small>一个语义意图，导演完整的互动场景</small></div>
              <button type="button" className={embodiedFrame.active ? 'is-active' : ''} onClick={() => {
                if (embodiedFrame.active) stopEmbodiedScene();
                else startEmbodiedScene({ dramaticGoal: 'invite', teachingGoal: 'introduce', concept: 'apple', expectedResponse: 'repeat', intensity: 3 });
              }}>{embodiedFrame.active ? '结束具身场景' : '演示 Apple 教学'}</button>
            </div>
            <div className="embodied-demo-actions" role="group" aria-label="物体动作演示">
              {EMBODIED_DEMO_SCENES.map(({ label, emoji, intent }) => (
                <button key={label} type="button" onClick={() => startEmbodiedScene(intent)}>{emoji} {label}</button>
              ))}
            </div>
            {(embodiedFrame.active || embodiedFrame.complete) && (
              <div className="embodied-scene-readout">
                <div><span>当前节拍</span><strong>{embodiedFrame.phaseLabel}</strong></div>
                <div><span>场景对象</span><strong>{embodiedFrame.conceptLabel} · {embodiedFrame.actionLabel}</strong></div>
                <div><span>物体状态</span><strong>{embodiedFrame.objectState}</strong></div>
                <p>{embodiedFrame.desiredChildAction}</p>
                {embodiedFrame.phase === 'wait' && embodiedSpeechOwnerRef.current === 'local' && (
                  <div className="embodied-response-actions">
                    <button type="button" onClick={() => embodiedDirectorRef.current.ingest({ type: 'child-speech', text: 'apple', atMs: performance.now() })}>模拟孩子说 Apple</button>
                    <button type="button" onClick={() => embodiedDirectorRef.current.ingest({ type: 'child-speech', text: 'banana', atMs: performance.now() })}>模拟没说对</button>
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="intent-lab">
            <div className="intent-heading">
              <div>
                <p className="section-label">无限连续表演空间</p>
                <small>连续演员状态 · 自然转场 · 短动作窗口，每次组合都不同</small>
              </div>
              <span className={isImprovising || isTheaterPlaying || embodiedFrame.active ? 'intent-live is-active' : 'intent-live'}>
                {embodiedFrame.active ? '具身教学' : isTheaterPlaying ? '剧场演出' : isImprovising ? '正在生成' : '手动混合'}
              </span>
            </div>
            <div className="improv-actions">
              <button type="button" className={isImprovising ? 'is-active' : ''} onClick={() => setImprovising(!isImprovising)}>
                {isImprovising ? '停止无限即兴' : '开启无限即兴'}
              </button>
              <button type="button" onClick={() => {
                improviserRef.current = createPerformanceImproviser();
                setImprovising(true);
              }}>换一条表演轨迹</button>
              <button type="button" className={isTheaterPlaying ? 'is-active theater-button' : 'theater-button'} onClick={() => setTheaterPlaying(!isTheaterPlaying)}>
                {isTheaterPlaying ? '停止剧场随机' : '开启剧场随机'}
              </button>
              <button type="button" onClick={() => {
                setTheaterPlaying(true);
              }}>换一套剧场顺序</button>
            </div>
            {isImprovising && (
              <div className="actor-readout" aria-label="雪宝演员状态">
                <div><span>戏剧目标</span><strong>{objectiveLabels[actorReadout.objective]}</strong></div>
                <div><span>表演节拍</span><strong>{beatLabels[actorReadout.beat]}</strong></div>
                <p>希望孩子感到：{actorReadout.feeling}</p>
              </div>
            )}
            {isTheaterPlaying && (
              <div className="theater-readout" aria-label="儿童单口剧场状态">
                <div className="theater-title-row">
                  <span>正在演出</span><strong>{theaterReadout.title}</strong>
                  <em>第 {theaterReadout.beatIndex + 1} / {THEATER_BEAT_COUNT} 拍</em>
                </div>
                <div className="theater-progress"><i style={{ width: `${theaterReadout.progress * 100}%` }} /></div>
                <p><b>{theaterBeatLabels[theaterReadout.role]}</b> · 演完再换拍 · 希望孩子感到：{theaterReadout.feeling}</p>
              </div>
            )}
            <div className="intent-sliders">
              <label>愉快度 <output>{manualIntent.affect.valence.toFixed(2)}</output><input aria-label="愉快度" type="range" min="-1" max="1" step="0.01" value={manualIntent.affect.valence} onChange={(event) => changeAffect('valence', Number(event.target.value))} /></label>
              <label>情绪唤醒 <output>{manualIntent.affect.arousal.toFixed(2)}</output><input aria-label="情绪唤醒" type="range" min="0" max="1" step="0.01" value={manualIntent.affect.arousal} onChange={(event) => changeAffect('arousal', Number(event.target.value))} /></label>
              <label>动作能量 <output>{manualIntent.movement.energy.toFixed(2)}</output><input aria-label="动作能量" type="range" min="0" max="1" step="0.01" value={manualIntent.movement.energy} onChange={(event) => changeMovement('energy', Number(event.target.value))} /></label>
              <label>身体开放 <output>{manualIntent.movement.openness.toFixed(2)}</output><input aria-label="身体开放" type="range" min="0" max="1" step="0.01" value={manualIntent.movement.openness} onChange={(event) => changeMovement('openness', Number(event.target.value))} /></label>
              <label>上下趋势 <output>{manualIntent.movement.verticality.toFixed(2)}</output><input aria-label="上下趋势" type="range" min="-1" max="1" step="0.01" value={manualIntent.movement.verticality} onChange={(event) => changeMovement('verticality', Number(event.target.value))} /></label>
              <label>前后倾向 <output>{manualIntent.movement.forward.toFixed(2)}</output><input aria-label="前后倾向" type="range" min="-1" max="1" step="0.01" value={manualIntent.movement.forward} onChange={(event) => changeMovement('forward', Number(event.target.value))} /></label>
              <label>左右差异 <output>{manualIntent.movement.asymmetry.toFixed(2)}</output><input aria-label="左右差异" type="range" min="-1" max="1" step="0.01" value={manualIntent.movement.asymmetry} onChange={(event) => changeMovement('asymmetry', Number(event.target.value))} /></label>
              <label>节拍驱动 <output>{manualIntent.movement.beat.toFixed(2)}</output><input aria-label="节拍驱动" type="range" min="0" max="1" step="0.01" value={manualIntent.movement.beat} onChange={(event) => changeMovement('beat', Number(event.target.value))} /></label>
            </div>
            <div className="expression-probes demo-catalog" role="region" aria-label="导演状态演示">
              <div className="demo-catalog-heading">
                <span>30 种导演状态演示</span>
                {activeDemoId && <em>正在演示：{PERFORMANCE_MOTIFS.find(({ id }) => id === activeDemoId)?.label}</em>}
              </div>
              {activeDemoId && (
                <div className="demo-line-choices" role="group" aria-label="当前状态的五句台词">
                  {CHARACTER_LINES[activeDemoId].map((line, index) => (
                    <button type="button" key={line} onClick={() => performMotif(PERFORMANCE_MOTIFS.find(({ id }) => id === activeDemoId)!, index)}>
                      <span>{index + 1}</span>{line}
                    </button>
                  ))}
                </div>
              )}
              {motifGroups.map((group) => (
                <div className="demo-group" key={group}>
                  <small>{group}</small>
                  <div>
                    {PERFORMANCE_MOTIFS.filter((motif) => motif.group === group).map((motif) => (
                      <button
                        key={motif.id}
                        type="button"
                        className={activeDemoId === motif.id ? 'is-active' : ''}
                        onClick={() => performMotif(motif)}
                      >{motif.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="signal-readout">
            <div><span>presence</span><strong>{live.frame.presence}</strong></div>
            <div><span>valence</span><strong>{live.frame.affect.valence.toFixed(2)}</strong></div>
            <div><span>energy</span><strong>{live.frame.dynamics.motionEnergy.toFixed(2)}</strong></div>
            <div><span>attention</span><strong>{live.frame.attention.focus}</strong></div>
          </div>

          {live.error && <div className="olaf-error">{live.error}<small>可先使用“无限连续表演空间”；部署时请提供 /api/gemini-token 或 VITE_GEMINI_API_KEY。</small></div>}

          <div className="transcript-panel">
            <p className="section-label">实时转写</p>
            <div className="transcript-lines">
              {latestTranscript.length === 0 ? <span className="transcript-empty">连接后，这里会显示雪宝的语音转写。</span> : latestTranscript.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
            </div>
            {live.inputTranscript && <div className="input-transcript">你：{live.inputTranscript}</div>}
          </div>
        </aside>
      </section>

      <footer className="olaf-live-footer">
        <span>研究模式 · 连续 Rig 参数，不播放命名动作片段</span>
        <span>原始摄像头画面不上传，视觉感知默认在本地运行</span>
      </footer>
    </main>
  );
}
