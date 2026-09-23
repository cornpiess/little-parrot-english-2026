import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { IronManCharacter } from '@/components/iron-man';
import AdventureDirectorConsole from '@/features/iron-man-adventure/console/AdventureDirectorConsole';
import { DEFAULT_VOICE_CONFIG, type VoiceConfig } from '@/features/iron-man-adventure/console/AdventureVoiceSettings';
import { SceneSetHost, SCENE_SETS_REGISTRY } from '@/features/iron-man-adventure/sets';
import { SCENE_ACTOR_GROUNDINGS } from '@/features/iron-man-adventure/sets/ironManSceneGrounding';
import { AzureSpeechOutput } from '@/features/olaf-live/azureSpeechOutput';
import { createAdventureSession } from './createAdventureSession';
import IRON_MAN_FIRST_LIGHT from './ironManFirstLightEpisode';
import type { AdventureSession, ExperienceFrame, InteractionHitbox, WorldNode } from './types';
import './IronManFirstLight.css';

const now = () => (typeof performance === 'undefined' ? Date.now() : performance.now());

const initialFrame = (session: AdventureSession) => session.frame(0);

const asStageStyle = (worldNode: WorldNode): CSSProperties => ({
  left: `${worldNode.x * 100}%`,
  top: `${worldNode.y * 100}%`,
  opacity: worldNode.opacity,
  transform: `translate(-50%, -50%) rotate(${worldNode.rotation ?? 0}deg) scale(${worldNode.scale})`,
  ['--node-progress' as string]: String(worldNode.progress ?? 0),
});

function speakInBrowser(
  text: string,
  speed: number,
  muted: boolean,
  callbacks: { onStart: () => void; onEnd: () => void },
) {
  const synthesis = typeof window === 'undefined' ? undefined : window.speechSynthesis;
  if (muted || !synthesis || typeof synthesis.cancel !== 'function' || typeof synthesis.speak !== 'function' || typeof window.SpeechSynthesisUtterance === 'undefined') {
    callbacks.onEnd();
    return () => undefined;
  }
  synthesis.cancel();
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = /[\u4e00-\u9fff]/.test(text) ? 'zh-CN' : 'en-US';
  utterance.rate = Math.max(.5, Math.min(2, .88 * speed));
  utterance.pitch = 1.04;
  utterance.volume = .94;

  let ended = false;
  const finish = () => {
    if (!ended) {
      ended = true;
      callbacks.onEnd();
    }
  };

  utterance.onstart = callbacks.onStart;
  utterance.onend = finish;
  utterance.onerror = finish;
  synthesis.speak(utterance);

  // Safety fallback timer based on character count (ensures narration ends even if browser audio context stutters)
  const estDurationMs = Math.max(2200, (text.length * 240) / Math.max(0.5, speed));
  const fallbackTimer = setTimeout(finish, estDurationMs + 600);

  return () => {
    clearTimeout(fallbackTimer);
    utterance.onend = null;
    utterance.onerror = null;
    synthesis.cancel();
  };
}

function WorldNodeView({ worldNode }: { worldNode: WorldNode }) {
  return (
    <div
      className={`iron-world-node iron-world-node--${worldNode.kind} plane-${worldNode.plane} state-${worldNode.state ?? 'idle'}${worldNode.target ? ' is-target' : ''}`}
      data-world-node={worldNode.id}
      data-world-plane={worldNode.plane}
      aria-hidden="true"
      style={asStageStyle(worldNode)}
    />
  );
}

function ChildCopilot({
  frame,
  cameraEnabled,
  stream,
  isSuitLinked,
  onToggleCamera,
}: {
  frame: ExperienceFrame;
  cameraEnabled: boolean;
  stream: MediaStream | null;
  isSuitLinked: boolean;
  onToggleCamera: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        try {
          const playPromise = videoRef.current.play?.();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => undefined);
          }
        } catch {
          // ignore play errors in mock envs
        }
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  return (
    <div
      className={`iron-child-copilot hand-${frame.child.handState} ${isSuitLinked ? 'is-linked-suit' : ''}`}
      data-child-copilot
      data-hud="hulkbuster"
      aria-label="反浩克装甲副驾驶头盔"
      onClick={(e) => {
        e.stopPropagation();
        onToggleCamera();
      }}
      title={cameraEnabled ? '点击关闭摄像头' : '点击开启副驾驶摄像头'}
      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
    >
      <div className="iron-child-copilot-visor">
        <div className="iron-child-copilot-silhouette" aria-hidden="true">
          <svg viewBox="0 0 140 140" role="presentation">
            {/* Heavy Gold/Crimson Armored Helmet Outer Ring */}
            <path d="M 25 55 L 40 22 L 100 22 L 115 55 L 125 105 L 98 128 L 42 128 L 15 105 Z" fill="#78350f" stroke="#ca8a04" strokeWidth="4" />
            <path d="M 32 58 L 45 28 L 95 28 L 108 58 L 116 100 L 92 120 L 48 120 L 24 100 Z" fill="#991b1b" stroke="#f59e0b" strokeWidth="2.5" />
            {/* Visor Eye Aperture */}
            <path d="M 40 62 L 100 62 L 95 82 L 45 82 Z" fill="#0c1424" stroke="#38bdf8" strokeWidth="2.5" />
            {/* Tactical HUD Data Overlay */}
            <line x1="28" y1="42" x2="48" y2="42" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="92" y1="42" x2="112" y2="42" stroke="#38bdf8" strokeWidth="1.5" />
          </svg>
        </div>
        <video
          ref={videoRef}
          className={cameraEnabled && stream ? 'is-visible' : ''}
          data-camera-preview
          autoPlay
          playsInline
          muted
          aria-label="副驾驶摄像头画面"
        />
        <span className="iron-child-copilot-scan" aria-hidden="true" />
        {cameraEnabled && (
          <div className="hulkbuster-hud-label">
            <span>{isSuitLinked ? '⚡ HULKBUSTER' : '📷 COPILOT'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function renderNodes(nodes: WorldNode[]) {
  return nodes.map((worldNode) => <WorldNodeView key={worldNode.id} worldNode={worldNode} />);
}

function pointFromPointer(event: ReactPointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(rect.width, 1))),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(rect.height, 1))),
  };
}

function centerOf(hitbox: InteractionHitbox) {
  return { x: hitbox.x + hitbox.width / 2, y: hitbox.y + hitbox.height / 2 };
}

export interface IronManFirstLightStageProps {
  initialReviewMode?: boolean;
}

export default function IronManFirstLightStage({
  initialReviewMode = false,
}: IronManFirstLightStageProps = {}) {
  const azureSpeakerRef = useRef<AzureSpeechOutput | null>(null);
  const voiceConfigRef = useRef<VoiceConfig>(DEFAULT_VOICE_CONFIG);
  const speedRef = useRef(1);
  const mutedRef = useRef(false);
  const cancelSpeechRef = useRef<() => void>(() => undefined);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(DEFAULT_VOICE_CONFIG);
  voiceConfigRef.current = voiceConfig;

  // Session instance creation
  const session = useMemo<AdventureSession>(() => {
    const adapterSessionRef: { current: AdventureSession | null } = { current: null };
    const created = createAdventureSession(IRON_MAN_FIRST_LIGHT, {
      now,
      speak: (line, meta) => {
        const currentConfig = voiceConfigRef.current;
        if (mutedRef.current) {
          adapterSessionRef.current?.control({ type: 'narration-ended', cueId: meta.cueId });
          return () => undefined;
        }

        // Try Azure Speech Output if configured
        if (currentConfig.provider === 'azure' && currentConfig.subscriptionKey.trim() && currentConfig.region.trim()) {
          const azureOutput = new AzureSpeechOutput({
            provider: 'azure',
            region: currentConfig.region.trim(),
            subscriptionKey: currentConfig.subscriptionKey.trim(),
            voiceName: currentConfig.voiceName,
          });
          azureSpeakerRef.current = azureOutput;
          azureOutput.speak(
            {
              id: meta.cueId,
              text: line,
            },
            {
              onStart: () => adapterSessionRef.current?.control({ type: 'narration-started', cueId: meta.cueId }),
              onEnd: () => adapterSessionRef.current?.control({ type: 'narration-ended', cueId: meta.cueId }),
              onError: (err) => {
                console.warn('Azure TTS error, fallback to browser TTS:', err);
                speakInBrowser(line, speedRef.current, mutedRef.current, {
                  onStart: () => adapterSessionRef.current?.control({ type: 'narration-started', cueId: meta.cueId }),
                  onEnd: () => adapterSessionRef.current?.control({ type: 'narration-ended', cueId: meta.cueId }),
                });
              },
            },
          );
          return () => {
            azureOutput.cancel();
          };
        }

        // Default to browser speech
        const cancel = speakInBrowser(line, speedRef.current, mutedRef.current, {
          onStart: () => adapterSessionRef.current?.control({ type: 'narration-started', cueId: meta.cueId }),
          onEnd: () => adapterSessionRef.current?.control({ type: 'narration-ended', cueId: meta.cueId }),
        });
        cancelSpeechRef.current = cancel;
        return cancel;
      },
    });
    adapterSessionRef.current = created;
    return created;
  }, []);

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const [frame, setFrame] = useState<ExperienceFrame>(() => initialFrame(session));
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [muted, setMuted] = useState(false);

  // Review mode states
  const [reviewMode, setReviewMode] = useState(initialReviewMode);
  const [previewSceneIndex, setPreviewSceneIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  // Cinematic Camera & Grounded Actor States
  const [showIronMan, setShowIronMan] = useState(true);
  const [cameraShot, setCameraShot] = useState<'wide' | 'medium' | 'close' | 'auto'>('auto');
  const [showSpatialGrid, setShowSpatialGrid] = useState(false);

  // Dramatic Prop & Educational Concept States
  const [isSuitLinked, setIsSuitLinked] = useState(false);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());

  const handleSimulateSay = (word: string) => {
    setLearnedWords((prev) => new Set(prev).add(word.toUpperCase()));
    sessionRef.current.send({ kind: 'voice', text: word.toLowerCase(), final: true, atMs: now() });
    refresh();
  };

  useEffect(() => {
    if (!autoPlay || !reviewMode) return undefined;
    const timer = setInterval(() => {
      setPreviewSceneIndex((prev) => (prev + 1) % SCENE_SETS_REGISTRY.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [autoPlay, reviewMode]);

  const refresh = useCallback((atMs = now()) => {
    const next = sessionRef.current.frame(atMs);
    speedRef.current = next.speed;
    setFrame(next);
  }, []);

  const issue = useCallback((command: Parameters<AdventureSession['control']>[0]) => {
    sessionRef.current.control(command);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!frame.started || frame.completed || frame.paused) return undefined;
    let frameId = 0;
    const tick = () => {
      const next = sessionRef.current.frame(now());
      setFrame(next);
      if (!next.completed && !next.paused) frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [frame.started, frame.completed, frame.paused]);

  useEffect(() => () => {
    cancelSpeechRef.current();
    sessionRef.current.dispose();
    cameraStream?.getTracks().forEach((track) => track.stop());
    if (typeof window !== 'undefined' && typeof window.speechSynthesis?.cancel === 'function') window.speechSynthesis.cancel();
  }, [cameraStream]);

  const start = () => {
    setReviewMode(false);
    sessionRef.current.begin();
    refresh(now());
  };

  const send = (signal: Parameters<AdventureSession['send']>[0]) => {
    sessionRef.current.send(signal);
    refresh(signal.atMs);
  };

  const playable = Boolean(frame.scene.play && frame.started && !frame.completed && !frame.paused);
  const sendPointer = (event: ReactPointerEvent<HTMLDivElement>, phase: 'start' | 'move' | 'end') => {
    if (!playable) return;
    const point = pointFromPointer(event);
    if (phase === 'start') event.currentTarget.setPointerCapture?.(event.pointerId);
    send({ kind: 'pointer', phase, ...point, atMs: now() });
  };

  const sendKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!playable || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    send({ kind: 'key', key: event.key, atMs: now() });
  };

  const sendTargetTap = (targetId: string) => {
    const target = frame.interactionTarget;
    if (!target || target.id !== targetId || !target.active) return;
    const point = centerOf(target.hitbox);
    send({ kind: 'tap', ...point, atMs: now() });
  };

  const handlePalmTouch = () => {
    setIsSuitLinked(true);
    sendTargetTap('ironman-palm');
  };

  const handleLandingConfirm = () => {
    if (reviewMode) {
      setPreviewSceneIndex(4);
    } else {
      issue({ type: 'goto-scene', index: 3 });
    }
  };

  const toggleCamera = async () => {
    if (cameraEnabled) {
      cameraStream?.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraEnabled(false);
      setCameraError('');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('此设备暂无可用摄像头');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setCameraStream(stream);
      setCameraError('');
      setCameraEnabled(true);
    } catch (err: any) {
      console.warn('Camera request error:', err);
      setCameraError('摄像头未获授权或被占用，仍可继续冒险');
      setCameraEnabled(false);
    }
  };

  const toggleMuted = () => {
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    if (next) {
      cancelSpeechRef.current();
      sessionRef.current.control({ type: 'narration-ended', cueId: frame.speechCue.id });
      refresh();
    }
  };

  const target = frame.interactionTarget;
  const stageStyle = {
    ['--ambient' as string]: frame.lighting.ambient,
    ['--accent' as string]: frame.lighting.accent,
    ['--beam' as string]: String(frame.lighting.beam),
    ['--camera-x' as string]: `${frame.camera.x}%`,
    ['--camera-y' as string]: `${frame.camera.y}%`,
    ['--camera-zoom' as string]: String(frame.camera.zoom),
  } as CSSProperties;

  const currentReviewSet = SCENE_SETS_REGISTRY[previewSceneIndex] || SCENE_SETS_REGISTRY[0];
  const currentGrounding = SCENE_ACTOR_GROUNDINGS[previewSceneIndex] || SCENE_ACTOR_GROUNDINGS[0];
  const activeSceneIndex = reviewMode ? previewSceneIndex : frame.scene.index;

  return (
    <main className="iron-first-light-page" data-story-v2={IRON_MAN_FIRST_LIGHT.id} data-no-continue="true">
      <div className="iron-first-light-layout">
        <section className="iron-first-light-child-shell" data-child-stage aria-label="钢铁侠沉浸式冒险舞台">
          {/* Top Review HUD Floating Bar */}
          {reviewMode && (
            <div className="scene-review-hud">
              <div className="review-badge-group">
                <span className="review-act-tag">【{currentReviewSet.act}】</span>
                <span className="review-index-pill">第 {previewSceneIndex + 1} / {SCENE_SETS_REGISTRY.length} 幕</span>
                <strong className="review-title-text">{currentReviewSet.title}</strong>
                <span className="review-location-tag">📍 {currentReviewSet.location}</span>
                <span className="review-shot-badge">🎬 {currentGrounding.autoCamera.shotName}</span>
              </div>
              <div className="review-controls">
                <button
                  type="button"
                  className="review-nav-btn"
                  disabled={previewSceneIndex <= 0}
                  onClick={() => setPreviewSceneIndex((i) => Math.max(0, i - 1))}
                  aria-label="上一张背景"
                >
                  ⏮ 上一张
                </button>
                <select
                  className="review-scene-select"
                  value={previewSceneIndex}
                  onChange={(e) => setPreviewSceneIndex(Number(e.target.value))}
                  aria-label="选择背景"
                >
                  {SCENE_SETS_REGISTRY.map((s, idx) => (
                    <option key={s.id} value={idx}>
                      {idx + 1}. {s.title} ({s.location})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="review-nav-btn"
                  disabled={previewSceneIndex >= SCENE_SETS_REGISTRY.length - 1}
                  onClick={() => setPreviewSceneIndex((i) => Math.min(SCENE_SETS_REGISTRY.length - 1, i + 1))}
                  aria-label="下一张背景"
                >
                  下一张 ⏭
                </button>

                {/* Toggle Grounded Iron Man */}
                <button
                  type="button"
                  className={`review-toggle-actor-btn ${showIronMan ? 'is-active' : ''}`}
                  onClick={() => setShowIronMan((s) => !s)}
                  aria-label={showIronMan ? '隐藏钢铁侠' : '融入钢铁侠'}
                >
                  {showIronMan ? '🦸 隐藏钢铁侠' : '🦸 融入钢铁侠'}
                </button>

                {/* Camera Shot Selector */}
                <div className="review-camera-group">
                  <span className="review-camera-label">🎥 运镜:</span>
                  <button
                    type="button"
                    className={`review-shot-pill ${cameraShot === 'auto' ? 'is-selected' : ''}`}
                    onClick={() => setCameraShot('auto')}
                  >
                    ⚡ 智能
                  </button>
                  <button
                    type="button"
                    className={`review-shot-pill ${cameraShot === 'wide' ? 'is-selected' : ''}`}
                    onClick={() => setCameraShot('wide')}
                  >
                    🔭 全景
                  </button>
                  <button
                    type="button"
                    className={`review-shot-pill ${cameraShot === 'medium' ? 'is-selected' : ''}`}
                    onClick={() => setCameraShot('medium')}
                  >
                    🎬 中景
                  </button>
                  <button
                    type="button"
                    className={`review-shot-pill ${cameraShot === 'close' ? 'is-selected' : ''}`}
                    onClick={() => setCameraShot('close')}
                  >
                    🔍 特写
                  </button>
                </div>

                <button
                  type="button"
                  className={`review-grid-btn ${showSpatialGrid ? 'is-active' : ''}`}
                  onClick={() => setShowSpatialGrid((g) => !g)}
                  aria-label={showSpatialGrid ? '隐藏空间网格' : '显示空间网格'}
                >
                  {showSpatialGrid ? '📐 隐藏网格' : '📐 空间网格'}
                </button>

                <button
                  type="button"
                  className={`review-autoplay-btn ${autoPlay ? 'is-active' : ''}`}
                  onClick={() => setAutoPlay((ap) => !ap)}
                >
                  {autoPlay ? '⏹ 停止轮播' : '▶ 自动轮播 (4s)'}
                </button>
                <button
                  type="button"
                  className="review-toggle-mode-btn"
                  onClick={() => setReviewMode(false)}
                >
                  开始完整故事 🎭
                </button>
              </div>
            </div>
          )}

          <div
            className={`iron-first-light-stage phase-${frame.scene.phase} transition-${frame.transition}${showHitboxes ? ' show-hitboxes' : ''}${reviewMode ? ' is-review-mode' : ''}`}
            style={stageStyle}
            onPointerDown={(event) => sendPointer(event, 'start')}
            onPointerMove={(event) => sendPointer(event, 'move')}
            onPointerUp={(event) => sendPointer(event, 'end')}
            onPointerCancel={(event) => sendPointer(event, 'end')}
            onKeyDown={sendKey}
            tabIndex={0}
            data-scene-id={reviewMode ? currentReviewSet.id : frame.scene.id}
            data-playable-kind={frame.scene.play?.kind ?? 'none'}
            data-narration={frame.narration}
          >
            {/* Spatial Scene Set Layer with Dynamic Cinematic Camera, Grounded Iron Man & 3D Spatial Grid */}
            <SceneSetHost
              sceneIndex={activeSceneIndex}
              showIronMan={showIronMan}
              cameraShot={cameraShot}
              showSpatialGrid={showSpatialGrid}
              onLandingConfirm={handleLandingConfirm}
              onPalmTouch={handlePalmTouch}
              isSuitLinked={isSuitLinked}
              flightProgress={frame.scene.progress}
              actorAction={frame.actor.action}
            />

            {/* Child's Front Camera Hulkbuster Helmet Visor (Causal) */}
            {(frame.child.active || cameraEnabled || isSuitLinked || (frame.started && activeSceneIndex >= 1)) && (
              <div
                className={`copilot-hud-anchor ${activeSceneIndex === 3 ? 'copilot-hud-flight-dock' : ''}`}
                style={
                  activeSceneIndex === 3
                    ? {
                        position: 'absolute',
                        bottom: '24px',
                        left: 'calc(50% + 60px)',
                        zIndex: 35,
                        transform: 'scale(0.9)',
                        pointerEvents: 'auto',
                      }
                    : undefined
                }
              >
                <ChildCopilot
                  frame={frame}
                  cameraEnabled={cameraEnabled}
                  stream={cameraStream}
                  isSuitLinked={isSuitLinked}
                  onToggleCamera={toggleCamera}
                />
              </div>
            )}

            {/* Interactive Target Elements */}
            {!reviewMode && (
              <>

                {target?.id === 'ironman-palm' && (
                  <button
                    type="button"
                    className="iron-interaction-target iron-palm-target"
                    data-interaction-target="ironman-palm"
                    aria-label="触碰钢铁侠掌心"
                    style={{ left: `${(target.hitbox.x + target.hitbox.width / 2) * 100}%`, top: `${(target.hitbox.y + target.hitbox.height / 2) * 100}%` }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
                    onClick={(event) => { event.stopPropagation(); handlePalmTouch(); }}
                  />
                )}
                {target?.id === 'drone-target' && (
                  <button
                    type="button"
                    className="iron-interaction-target iron-drone-target"
                    data-interaction-target="drone-target"
                    aria-label="点击掌心光，打散黑云救出无人机"
                    style={{ left: `${(target.hitbox.x + target.hitbox.width / 2) * 100}%`, top: `${(target.hitbox.y + target.hitbox.height / 2) * 100}%` }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
                    onClick={(event) => { event.stopPropagation(); sendTargetTap('drone-target'); }}
                  />
                )}
                {target?.id === 'lighthouse-core' && (
                  <button
                    type="button"
                    className="iron-interaction-target iron-lighthouse-target"
                    data-interaction-target="lighthouse-core"
                    aria-label="把光送进灯塔"
                    style={{ left: `${(target.hitbox.x + target.hitbox.width / 2) * 100}%`, top: `${(target.hitbox.y + target.hitbox.height / 2) * 100}%` }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
                    onClick={(event) => { event.stopPropagation(); sendTargetTap('lighthouse-core'); }}
                  />
                )}

                <div className="iron-first-light-vignette" />
                {/* Preschool Educational Concept Badge (Only pure knowledge words, no text walls) */}
                {frame.learningCue && <span className="iron-learning-cue" aria-label={frame.learningCue}>{frame.learningCue}</span>}
                <div className="iron-first-light-a11y" aria-live="polite">{frame.started ? frame.scene.line : ''}</div>

                {!frame.started && (
                  <section className="iron-first-light-cover" aria-label="钢铁侠第一束光">
                    <div className="iron-first-light-emblem" aria-hidden="true"><span /></div>
                    <p className="iron-first-light-overline">STORY LAB · 2026</p>
                    <h1>{IRON_MAN_FIRST_LIGHT.title}</h1>
                    <p>{IRON_MAN_FIRST_LIGHT.subtitle}</p>
                    <button type="button" className="iron-first-light-start" onClick={start} aria-label="开始钢铁侠冒险">
                      <span className="start-play-icon" aria-hidden="true">▶</span> 开始冒险
                    </button>
                  </section>
                )}
                {frame.started && frame.completed && (
                  <div className="iron-first-light-finale" aria-live="polite"><span className="finale-star" />任务完成：小星星回家了</div>
                )}
              </>
            )}
          </div>
        </section>

        <AdventureDirectorConsole
          isOpen={consoleOpen}
          onToggleOpen={() => setConsoleOpen((open) => !open)}
          currentAct={currentReviewSet.act}
          sceneTitle={currentReviewSet.title}
          sceneIndex={activeSceneIndex}
          totalScenes={SCENE_SETS_REGISTRY.length}
          sceneProgress={frame.scene.progress}
          phase={frame.scene.phase}
          locationName={currentReviewSet.location}
          dramaticObjective={currentReviewSet.objective}
          currentLine={frame.speechCue.text || frame.scene.line}
          actorAction={frame.actor.action}
          helpLevel={frame.scene.helpLevel}
          targetConcepts={[
            {
              word: 'STAR',
              meaning: '星星 / 光芒核心',
              emoji: '⭐',
              status: learnedWords.has('STAR') || activeSceneIndex >= 3 ? 'learned' : 'seen',
            },
            {
              word: 'LIGHT',
              meaning: '光 / 能量连接',
              emoji: '💡',
              status: learnedWords.has('LIGHT') || activeSceneIndex >= 6 ? 'learned' : 'unseen',
            },
          ]}
          onSimulateSay={handleSimulateSay}
          onSimulateTap={() => {
            if (target) sendTargetTap(target.id);
          }}
          onPlay={() => {
            setReviewMode(false);
            if (!frame.started) {
              start();
            } else {
              issue({ type: 'play' });
            }
          }}
          onPause={() => issue({ type: 'pause' })}
          onRestart={() => {
            setPreviewSceneIndex(0);
            issue({ type: 'restart' });
          }}
          onPreviousScene={() => {
            const prev = Math.max(0, activeSceneIndex - 1);
            setPreviewSceneIndex(prev);
            issue({ type: 'goto-scene', index: Math.min(6, prev) });
          }}
          onNextScene={() => {
            const next = Math.min(SCENE_SETS_REGISTRY.length - 1, activeSceneIndex + 1);
            setPreviewSceneIndex(next);
            issue({ type: 'goto-scene', index: Math.min(6, next) });
          }}
          onSelectScene={(index) => {
            setPreviewSceneIndex(index);
            issue({ type: 'goto-scene', index: Math.min(6, index) });
          }}
          onReplayLine={() => issue({ type: 'replay-line' })}
          onSetSpeed={(speed) => issue({ type: 'set-speed', speed })}
          currentSpeed={frame.speed}
          isPaused={frame.paused}
          isStarted={frame.started}
          isMuted={muted}
          onToggleMuted={toggleMuted}
          showHitboxes={showHitboxes}
          onToggleHitboxes={() => setShowHitboxes((show) => !show)}
          cameraEnabled={cameraEnabled}
          onToggleCamera={toggleCamera}
          cameraError={cameraError}
          showIronMan={showIronMan}
          onToggleShowIronMan={() => setShowIronMan((s) => !s)}
          cameraShot={cameraShot}
          onChangeCameraShot={(shot) => setCameraShot(shot)}
          voiceConfig={voiceConfig}
          onChangeVoiceConfig={setVoiceConfig}
          scenesList={SCENE_SETS_REGISTRY.map((scene) => ({
            id: scene.id,
            title: scene.title,
          }))}
        />
      </div>
    </main>
  );
}
