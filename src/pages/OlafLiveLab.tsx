import { useMemo } from 'react';
import OlafLiveCharacter from '@/features/olaf-live/OlafLiveCharacter';
import { useOlafLiveSession } from '@/features/olaf-live/useOlafLiveSession';
import type { PerformanceSignal } from '@/features/olaf-live/types';
import '@/features/olaf-live/OlafLiveLab.css';

const demoSignals: Array<{ label: string; signal: PerformanceSignal }> = [
  { label: '打招呼', signal: { type: 'gesture', name: 'wave', intensity: 1, durationMs: 1200 } },
  { label: '点头', signal: { type: 'gesture', name: 'nod', intensity: 0.8, durationMs: 900 } },
  { label: '鼓励', signal: { type: 'emotion', name: 'encourage', valence: 0.85, arousal: 0.62, dominance: 0.55 } },
  { label: '好奇', signal: { type: 'emotion', name: 'curiosity', valence: 0.45, arousal: 0.48, dominance: 0.35 } },
  { label: '庆祝', signal: { type: 'gesture', name: 'celebrate', intensity: 1, durationMs: 1400 } },
];

const statusLabels = {
  offline: '离线预览', connecting: '正在连接', ready: '已连接', listening: '正在倾听', speaking: '正在说话', error: '连接异常',
};

export default function OlafLiveLab() {
  const live = useOlafLiveSession();
  const latestTranscript = useMemo(() => live.transcript.slice(-4), [live.transcript]);
  const isOnline = live.status !== 'offline' && live.status !== 'error';

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
      </header>

      <section className="olaf-live-grid">
        <div
          className="olaf-stage-card"
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            live.setPointerGaze(((event.clientX - rect.left) / rect.width - 0.5) * 2, (0.5 - (event.clientY - rect.top) / rect.height) * 2);
          }}
        >
          <div className="stage-lights" />
          <div className="stage-caption">
            <span>表演引擎</span>
            <small>60 FPS · local animation</small>
          </div>
          <div className="olaf-stage-character">
            <OlafLiveCharacter frame={live.frame} size={1.18} />
          </div>
          <div className="olaf-stage-floor" />
          {live.cameraEnabled && <div className="camera-pill"><span className="camera-dot" />本地注视已开启</div>}
          <video ref={live.videoRef} className={`olaf-camera-preview ${live.cameraEnabled ? 'is-visible' : ''}`} muted playsInline />
        </div>

        <aside className="olaf-control-card">
          <div className="control-heading">
            <div>
              <p className="olaf-live-kicker">SESSION CONTROL</p>
              <h2>和雪宝聊两句</h2>
            </div>
            <span className="latency-chip">情绪连续</span>
          </div>

          <p className="control-description">点击连接后，雪宝会用实时语音回应。你也可以先用下方动作按钮观察 SVG 表演引擎。</p>
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
              {live.cameraEnabled ? '关闭摄像头' : '开启注视'}
            </button>
            <button className="interrupt-action" onClick={live.interrupt} disabled={!isOnline}>打断</button>
          </div>

          <div className="demo-actions">
            <p className="section-label">手动导演</p>
            <div className="demo-button-row">
              {demoSignals.map(({ label, signal }) => <button key={label} onClick={() => live.trigger(signal)}>{label}</button>)}
            </div>
          </div>

          <div className="signal-readout">
            <div><span>mode</span><strong>{live.frame.mode}</strong></div>
            <div><span>valence</span><strong>{live.frame.emotion.valence.toFixed(2)}</strong></div>
            <div><span>arousal</span><strong>{live.frame.emotion.arousal.toFixed(2)}</strong></div>
            <div><span>gaze</span><strong>{live.frame.gaze.focus}</strong></div>
          </div>

          {live.error && <div className="olaf-error">{live.error}<small>可先使用“手动导演”预览；部署时请提供 /api/gemini-token 或 VITE_GEMINI_API_KEY。</small></div>}

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
        <span>研究模式 · 当前雪宝 SVG 资产仅用于内部实验</span>
        <span>原始摄像头画面不上传，视觉感知默认在本地运行</span>
      </footer>
    </main>
  );
}
