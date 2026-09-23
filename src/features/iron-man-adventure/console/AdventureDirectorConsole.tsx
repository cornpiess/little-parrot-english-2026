import { useState } from 'react';
import AdventureVoiceSettings, { type VoiceConfig } from './AdventureVoiceSettings';
import './AdventureConsole.css';

export interface TargetConceptItem {
  word: string;
  meaning: string;
  emoji?: string;
  status: 'unseen' | 'seen' | 'learned';
}

export interface AdventureDirectorConsoleProps {
  isOpen: boolean;
  onToggleOpen: () => void;

  // 故事进度与状态
  currentAct?: string;
  sceneTitle: string;
  sceneIndex: number;
  totalScenes: number;
  sceneProgress: number; // 0..1
  phase?: string;
  locationName?: string;
  dramaticObjective?: string;
  currentLine: string;
  actorAction?: string;
  helpLevel?: number;
  targetConcepts?: TargetConceptItem[];

  // 导演操作
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onPreviousScene: () => void;
  onNextScene: () => void;
  onSelectScene: (index: number) => void;
  onReplayLine: () => void;
  onSetSpeed: (speed: number) => void;
  currentSpeed: number;
  isPaused: boolean;
  isStarted: boolean;

  // 交互模拟与测试
  onSimulateTap?: () => void;
  onSimulateAssist?: () => void;
  onSimulateSay?: (text: string) => void;
  onOverrideLine?: (line: string) => void;

  // 视图与硬件
  isMuted?: boolean;
  onToggleMuted?: () => void;
  showHitboxes: boolean;
  onToggleHitboxes: () => void;
  cameraEnabled: boolean;
  onToggleCamera: () => void;
  // 镜头与角色呈现
  showIronMan?: boolean;
  onToggleShowIronMan?: () => void;
  cameraShot?: 'wide' | 'medium' | 'close' | 'auto';
  onChangeCameraShot?: (shot: 'wide' | 'medium' | 'close' | 'auto') => void;

  // 语音引擎与 Azure 配置
  voiceConfig: VoiceConfig;
  onChangeVoiceConfig: (config: VoiceConfig) => void;

  // 场景列表
  scenesList?: Array<{ id: string; title: string }>;
  className?: string;
}

export default function AdventureDirectorConsole({
  isOpen,
  onToggleOpen,
  currentAct = '旅途',
  sceneTitle,
  sceneIndex,
  totalScenes,
  sceneProgress,
  phase = 'normal',
  locationName,
  dramaticObjective,
  currentLine,
  actorAction = 'idle',
  helpLevel = 0,
  targetConcepts = [
    { word: 'STAR', meaning: '星星 / 光芒核心', emoji: '⭐', status: 'seen' },
    { word: 'LIGHT', meaning: '光 / 能量连接', emoji: '💡', status: 'unseen' },
  ],
  onPlay,
  onPause,
  onRestart,
  onPreviousScene,
  onNextScene,
  onSelectScene,
  onReplayLine,
  onSetSpeed,
  currentSpeed,
  isPaused,
  isStarted,
  onSimulateTap,
  onSimulateAssist,
  onSimulateSay,
  onOverrideLine,
  isMuted = false,
  onToggleMuted,
  showHitboxes,
  onToggleHitboxes,
  cameraEnabled,
  onToggleCamera,
  cameraError = '',
  showIronMan = false,
  onToggleShowIronMan,
  cameraShot = 'auto',
  onChangeCameraShot,
  voiceConfig,
  onChangeVoiceConfig,
  scenesList = [],
  className = '',
}: AdventureDirectorConsoleProps) {
  const [overrideInput, setOverrideInput] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  const safeTotal = Math.max(1, totalScenes);
  const progressPercent = Math.min(100, Math.max(0, ((sceneIndex + sceneProgress) / safeTotal) * 100));

  return (
    <aside
      className={`iron-director-console ${isOpen ? 'is-expanded' : 'is-collapsed'} ${className}`}
      data-adult-console
      role="complementary"
      aria-label="故事后台控制台"
    >
      <header className="director-console-header">
        <div className="director-title-block">
          <span className="director-kicker">ADULT DIRECTOR · ADVENTURE CONSOLE</span>
          <h2>故事后台控制台</h2>
        </div>
        <button
          type="button"
          className="director-collapse-btn"
          aria-label={isOpen ? '收起控制台' : '展开控制台'}
          onClick={onToggleOpen}
        >
          {isOpen ? '收起' : '展开'}
        </button>
      </header>

      {isOpen && (
        <div className="director-console-body">
          {/* 1. 进度概览 */}
          <section className="director-section progress-section">
            <div className="progress-heading">
              <span>{currentAct} · 冒险进度</span>
              <strong>
                第 {sceneIndex + 1} / {safeTotal} 幕 ({Math.round(progressPercent)}%)
              </strong>
            </div>
            <div className="progress-bar-track">
              <i className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </section>

          {/* 2. 当前场景与戏剧目标 */}
          <section className="director-section story-status-section">
            <div className="story-meta-badge">
              <span className="location-tag">📍 {locationName || `场景 ${sceneIndex + 1}`}</span>
              <span className="phase-tag">阶段: {phase}</span>
            </div>
            <h3 className="story-scene-title">{sceneTitle}</h3>
            {dramaticObjective && (
              <p className="story-objective-text">
                <b>戏剧目标：</b> {dramaticObjective}
              </p>
            )}

            <div className="story-status-grid">
              <div className="status-grid-item">
                <small>角色姿态 (Action)</small>
                <b>{actorAction}</b>
              </div>
              <div className="status-grid-item">
                <small>幕内目标进度</small>
                <b>{Math.round(sceneProgress * 100)}%</b>
              </div>
              <div className="status-grid-item">
                <small>协助等级 (Help)</small>
                <b>Level {helpLevel}</b>
              </div>
            </div>

            <div className="current-dialogue-card">
              <small>当前台词</small>
              <p>{currentLine || '（等待角色开口...）'}</p>
            </div>
          </section>

          {/* 3. 目标学习词汇 */}
          <section className="director-section words-section">
            <div className="section-title-sm">🎯 学习目标词汇与跟读模拟</div>
            <div className="target-words-list">
              {targetConcepts.map(({ word, meaning, emoji, status }) => (
                <div
                  key={word}
                  className={`target-word-pill status-${status}`}
                  data-word-status={status}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="word-check">{status === 'learned' ? '✓' : status === 'seen' ? '👁️' : '·'}</span>
                    <strong className="word-text">
                      {word} {emoji}
                    </strong>
                    <small className="word-meaning">({meaning})</small>
                  </div>
                  {onSimulateSay && (
                    <button
                      type="button"
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: 'rgba(56, 189, 248, 0.25)',
                        border: '1px solid #38bdf8',
                        borderRadius: '6px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => onSimulateSay(word)}
                      title={`模拟孩子已读出 "${word}"`}
                    >
                      🗣️ 模拟读出 "{word}"
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 4. 核心导演操作控制 */}
          <section className="director-section actions-section">
            <div className="section-title-sm">🎮 导演操作</div>
            <div className="actions-button-grid" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="btn-primary" aria-label="开始" onClick={onPlay}>
                ▶ 开始
              </button>
              <button
                type="button"
                aria-label={isPaused ? '继续' : '暂停'}
                onClick={isPaused ? onPlay : onPause}
              >
                {isPaused ? '▶ 继续' : '⏸ 暂停'}
              </button>
              <button type="button" aria-label="重启" onClick={onRestart}>
                🔄 重启
              </button>
              <button type="button" aria-label="上一幕" onClick={onPreviousScene} disabled={sceneIndex <= 0}>
                ⏮ 上一幕
              </button>
              <button type="button" aria-label="下一幕" onClick={onNextScene} disabled={sceneIndex >= safeTotal - 1}>
                下一幕 ⏭
              </button>
              <button type="button" aria-label="重播台词" onClick={onReplayLine}>
                🔁 重播台词
              </button>
            </div>

            {scenesList.length > 0 && (
              <label className="director-field-row">
                <span>跳转场景</span>
                <select
                  value={sceneIndex}
                  onChange={(e) => onSelectScene(Number(e.target.value))}
                  aria-label="选择场景"
                >
                  {scenesList.map((s, idx) => (
                    <option key={s.id || idx} value={idx}>
                      {idx + 1}. {s.title}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="speed-control-row">
              <span>播放速度</span>
              <div className="speed-buttons">
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    className={currentSpeed === speed ? 'is-selected' : ''}
                    onClick={() => onSetSpeed(speed)}
                  >
                    {speed}×
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 5. 镜头运镜与钢铁侠呈现 */}
          <section className="director-section camera-actor-section">
            <div className="section-title-sm">🎬 镜头运镜与角色呈现</div>
            <div className="camera-controls-stack">
              <button
                type="button"
                className={`actor-toggle-btn ${showIronMan ? 'is-active' : ''}`}
                onClick={onToggleShowIronMan}
                aria-label={showIronMan ? '隐藏钢铁侠' : '显示钢铁侠'}
              >
                {showIronMan ? '🦸 钢铁侠已就位 (点击隐藏)' : '⚪ 纯背景幕布 (点击就位钢铁侠)'}
              </button>
              <div className="camera-shots-group">
                <span className="camera-shots-label">镜头视角:</span>
                <div className="camera-shots-buttons">
                  <button
                    type="button"
                    className={cameraShot === 'auto' ? 'is-selected' : ''}
                    onClick={() => onChangeCameraShot?.('auto')}
                  >
                    ⚡ 智能
                  </button>
                  <button
                    type="button"
                    className={cameraShot === 'wide' ? 'is-selected' : ''}
                    onClick={() => onChangeCameraShot?.('wide')}
                  >
                    🔭 全景
                  </button>
                  <button
                    type="button"
                    className={cameraShot === 'medium' ? 'is-selected' : ''}
                    onClick={() => onChangeCameraShot?.('medium')}
                  >
                    🎬 中景
                  </button>
                  <button
                    type="button"
                    className={cameraShot === 'close' ? 'is-selected' : ''}
                    onClick={() => onChangeCameraShot?.('close')}
                  >
                    🔍 特写
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 6. 互动模拟与调试 */}
          <section className="director-section simulation-section">
            <div className="section-title-sm">🧪 互动模拟与调试</div>
            <div className="sim-buttons-grid">
              {onSimulateTap && (
                <button type="button" onClick={onSimulateTap}>
                  🎯 模拟正确点击
                </button>
              )}
              {onSimulateAssist && (
                <button type="button" onClick={onSimulateAssist}>
                  🤝 触发协助引导
                </button>
              )}
              {onSimulateSay && (
                <>
                  <button type="button" onClick={() => onSimulateSay('STAR')}>
                    🗣️ 模拟读出 STAR
                  </button>
                  <button type="button" onClick={() => onSimulateSay('LIGHT')}>
                    🗣️ 模拟读出 LIGHT
                  </button>
                </>
              )}
              {onToggleMuted && (
                <button
                  type="button"
                  className={isMuted ? 'is-active' : ''}
                  aria-label={isMuted ? '打开声音' : '静音'}
                  onClick={onToggleMuted}
                >
                  {isMuted ? '🔊 打开声音' : '🔇 静音'}
                </button>
              )}
              <button
                type="button"
                className={showHitboxes ? 'is-active' : ''}
                aria-label="显示命中区"
                onClick={onToggleHitboxes}
              >
                {showHitboxes ? '隐藏命中区' : '显示命中区'}
              </button>
            </div>

            {onOverrideLine && (
              <div className="override-line-block">
                <button
                  type="button"
                  className="toggle-override-btn"
                  onClick={() => setShowOverrideInput((show) => !show)}
                >
                  {showOverrideInput ? '收起临时台词覆写' : '✏️ 临时覆写当前台词（仅内存）'}
                </button>
                {showOverrideInput && (
                  <div className="override-input-row">
                    <input
                      type="text"
                      value={overrideInput}
                      placeholder="输入临时台词测试朗读..."
                      onChange={(e) => setOverrideInput(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={!overrideInput.trim()}
                      onClick={() => {
                        onOverrideLine(overrideInput.trim());
                        setOverrideInput('');
                      }}
                    >
                      覆写并朗读
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 6. 摄像头硬件控制 */}
          <section className="director-section hardware-section">
            <div className="section-title-sm">📷 硬件与副驾驶</div>
            <div className="hardware-actions-row">
              <button
                type="button"
                className={`camera-toggle-btn ${cameraEnabled ? 'is-enabled' : ''}`}
                onClick={onToggleCamera}
              >
                {cameraEnabled ? '关闭副驾驶摄像头' : '开启副驾驶摄像头'}
              </button>
            </div>
            {cameraError && <p className="director-error-alert">{cameraError}</p>}
            <p className="privacy-note-text">
              * 摄像头画面仅在装甲副驾驶视窗内本地渲染，不进行云端上传，亦非通关硬性条件。
            </p>
          </section>

          {/* 7. Azure 语音引擎与配置 */}
          <section className="director-section voice-section">
            <AdventureVoiceSettings config={voiceConfig} onChange={onChangeVoiceConfig} />
          </section>
        </div>
      )}
    </aside>
  );
}
