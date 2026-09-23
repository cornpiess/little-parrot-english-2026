import { useEffect, useState } from 'react';
import { IronManCharacter } from '@/components/iron-man';

export interface DeepSpaceFlightSetProps {
  progress?: number; // 0..1 flight progress
  onLandingConfirm?: () => void;
  interactive?: boolean;
}

export default function DeepSpaceFlightSet({
  progress: externalProgress,
  onLandingConfirm,
  interactive = true,
}: DeepSpaceFlightSetProps) {
  // Flight state (0..100)
  const [internalProgress, setInternalProgress] = useState(0);
  const [isFlying, setIsFlying] = useState(true);
  const [collectedStars, setCollectedStars] = useState(0);
  const [lane, setLane] = useState<0 | 1 | 2>(1); // 0: Left, 1: Center, 2: Right

  const currentProgress = externalProgress !== undefined ? externalProgress * 100 : internalProgress;
  const progressRatio = Math.min(1, Math.max(0, currentProgress / 100));
  const isReached = currentProgress >= 92;

  // Auto flight forward progression
  useEffect(() => {
    if (externalProgress !== undefined || !isFlying || isReached) return undefined;
    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        const next = prev + 1.5;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 110);
    return () => clearInterval(interval);
  }, [externalProgress, isFlying, isReached]);

  // Auto landing fallback after 6s of reaching planet
  useEffect(() => {
    if (!isReached) return undefined;
    const timer = setTimeout(() => {
      onLandingConfirm?.();
    }, 6000);
    return () => clearTimeout(timer);
  }, [isReached, onLandingConfirm]);

  // Destination planet scale from 0.35 to 15.0 (truly covers and envelops the entire screen!)
  const planetScale = 0.35 + Math.pow(progressRatio, 1.9) * 14.65;
  const planetOpacity = Math.min(1, 0.45 + progressRatio * 0.55);

  // Lane horizontal offset (px)
  const laneOffsets = [-160, 0, 160];
  const currentOffset = laneOffsets[lane];

  const handleMoveLeft = () => {
    setLane((prev) => (prev > 0 ? ((prev - 1) as 0 | 1 | 2) : 0));
  };

  const handleMoveRight = () => {
    setLane((prev) => (prev < 2 ? ((prev + 1) as 0 | 1 | 2) : 2));
  };

  // Asteroids data (flowing down towards camera)
  const asteroidY1 = ((currentProgress * 12) % 650) - 50;
  const asteroidY2 = (((currentProgress + 35) * 11) % 650) - 50;
  const stargateY = (((currentProgress + 15) * 8) % 650) - 80;

  return (
    <div
      className="scene-set-container set-deep-space flight-game-active"
      data-scene-set="deep-space-flight"
    >
      {/* 1. Deep Cosmic Warp Background (Starfield & Distant Nebulae) */}
      <div className="scene-plane scene-plane-far" data-plane="far" style={{ pointerEvents: 'none' }}>
        <div className="deep-space-nebula" />
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <radialGradient id="saturnSphere" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e9d5ff" />
              <stop offset="40%" stopColor="#a855f7" />
              <stop offset="80%" stopColor="#581c87" />
              <stop offset="100%" stopColor="#2e1065" />
            </radialGradient>
          </defs>

          {/* Deep Space Background Stars */}
          <g fill="#ffffff" opacity={Math.max(0.15, 0.85 - progressRatio * 0.7)}>
            <circle cx="90" cy="80" r="2" />
            <circle cx="240" cy="120" r="2.5" fill="#fde047" />
            <circle cx="410" cy="60" r="1.5" fill="#7dd3fc" />
            <circle cx="820" cy="90" r="3" fill="#ffffff" />
            <circle cx="920" cy="180" r="2.5" fill="#f472b6" />
            <circle cx="140" cy="480" r="2.5" fill="#38bdf8" />
            <circle cx="890" cy="510" r="3" fill="#ffffff" />
          </g>

          {/* Distant Ringed Planet (Drifting away as we approach target) */}
          <g transform={`translate(${180 - progressRatio * 160}, ${140 - progressRatio * 100}) scale(${Math.max(0.1, 1 - progressRatio * 0.85)})`}>
            <ellipse cx="0" cy="0" rx="80" ry="22" fill="none" stroke="#f472b6" strokeWidth="6" opacity="0.5" />
            <circle cx="0" cy="0" r="36" fill="url(#saturnSphere)" />
          </g>
        </svg>
      </div>

      {/* 2. Destination Planet Layer (Rendered in FRONT layer so it is NEVER blocked by background!) */}
      <div
        className="scene-plane scene-plane-middle destination-planet-plane"
        data-plane="middle"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 8,
        }}
      >
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <radialGradient id="smokyPlanetSphere" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="25%" stopColor="#a855f7" />
              <stop offset="55%" stopColor="#6b21a8" />
              <stop offset="85%" stopColor="#3b0764" />
              <stop offset="100%" stopColor="#150830" />
            </radialGradient>
            <radialGradient id="planetAtmosphereGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.55" />
              <stop offset="85%" stopColor="#0f172a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {/* DESTINATION: The Mysterious Black Cloud Planet (Enlarging to fill whole viewport!) */}
          <g
            className="destination-planet-group"
            transform={`translate(500, ${260 + progressRatio * 50}) scale(${planetScale})`}
            style={{
              transition: 'transform 0.12s ease-out',
              transformOrigin: 'center center',
            }}
          >
            {/* Atmospheric Glow Halo */}
            <circle cx="0" cy="0" r="95" fill="url(#planetAtmosphereGlow)" opacity={planetOpacity} />

            {/* Planet Body */}
            <circle cx="0" cy="0" r="70" fill="url(#smokyPlanetSphere)" stroke="#c084fc" strokeWidth={Math.max(0.4, 3 / planetScale)} />

            {/* Surface Atmospheric Storm Cloud Bands */}
            {progressRatio > 0.2 && (
              <g opacity={Math.min(1, (progressRatio - 0.2) * 1.8)}>
                <path d="M -60 -20 Q 0 -40 60 -15 Q 20 5 -60 -20 Z" fill="#2e1065" opacity="0.85" />
                <path d="M -65 15 Q 0 40 65 20 Q 10 -10 -65 15 Z" fill="#3b0764" opacity="0.8" />
                <path d="M -50 35 Q 0 55 50 38" fill="none" stroke="#9333ea" strokeWidth="3" opacity="0.9" />
                <path d="M -40 -35 Q 0 -20 40 -38" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.75" />
              </g>
            )}

            {/* Surface Lightning Storms (Visible up close) */}
            {progressRatio > 0.45 && (
              <g className="planet-lightning-flash">
                <polygon points="12,-25 4,-8 18,-8 2,15 14,0 6,0" fill="#facc15" filter="drop-shadow(0 0 6px #facc15)" />
                <polygon points="-28,10 -34,22 -24,22 -36,38 -26,28 -32,28" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
                <polygon points="25,20 18,30 32,30 20,45 30,34 22,34" fill="#ffffff" filter="drop-shadow(0 0 6px #38bdf8)" />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* 3. Obstacles & Star Gates Layer (Flowing past in 3 lanes) */}
      <div className="scene-plane scene-plane-near obstacles-plane" data-plane="near" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }}>
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          {/* Dynamic Forward Speed Streaks */}
          <g opacity={isFlying ? 0.7 : 0.2} className="speed-warp-lines">
            <line x1="500" y1="260" x2="80" y2="50" stroke="#ffffff" strokeWidth="3.5" className="speed-streak" />
            <line x1="500" y1="260" x2="920" y2="70" stroke="#38bdf8" strokeWidth="4" className="speed-streak" style={{ animationDelay: '-0.3s' }} />
            <line x1="500" y1="260" x2="60" y2="540" stroke="#7dd3fc" strokeWidth="3.5" className="speed-streak" style={{ animationDelay: '-0.6s' }} />
            <line x1="500" y1="260" x2="940" y2="530" stroke="#facc15" strokeWidth="4" className="speed-streak" style={{ animationDelay: '-0.15s' }} />
          </g>

          {/* Floating Asteroid 1 in Left Lane (lane 0: x: 340) */}
          {progressRatio < 0.9 && (
            <g transform={`translate(340, ${asteroidY1}) scale(${0.7 + (asteroidY1 / 600) * 0.6})`}>
              <polygon
                points="0,-28 22,-18 32,8 14,32 -18,28 -30,-4"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="3"
                filter="drop-shadow(0 0 10px rgba(0,0,0,0.8))"
              />
              <line x1="-10" y1="-5" x2="15" y2="10" stroke="#334155" strokeWidth="2.5" />
            </g>
          )}

          {/* Floating Asteroid 2 in Right Lane (lane 2: x: 660) */}
          {progressRatio < 0.9 && (
            <g transform={`translate(660, ${asteroidY2}) scale(${0.7 + (asteroidY2 / 600) * 0.6})`}>
              <polygon
                points="0,-24 20,-14 26,10 8,26 -16,20 -22,-6"
                fill="#1e1b4b"
                stroke="#7c3aed"
                strokeWidth="3"
                filter="drop-shadow(0 0 12px rgba(124, 58, 237, 0.5))"
              />
            </g>
          )}

          {/* Interactive Golden Star Gate in Center Lane (lane 1: x: 500) */}
          {progressRatio < 0.9 && (
            <g
              transform={`translate(500, ${stargateY}) scale(${0.6 + (stargateY / 600) * 0.7})`}
              className="interactive-stargate"
            >
              <polygon
                points="0,-65 19,-19 65,-19 29,10 43,56 0,29 -43,56 -29,10 -65,-19 -19,-19"
                fill="rgba(250, 204, 21, 0.25)"
                stroke="#fbbf24"
                strokeWidth="9"
                filter="drop-shadow(0 0 20px #fbbf24)"
              />
              <text x="0" y="8" fontSize="16" fontWeight="900" fontFamily="sans-serif" fill="#ffffff" textAnchor="middle">
                STAR
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* 4. DUAL BOTTOM PLACEMENT: Iron Man & Copilot Camera at Screen Bottom (正下方) */}
      <div
        className="flight-bottom-cockpit"
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: `translateX(calc(-50% + ${currentOffset}px))`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '32px',
          zIndex: 30,
          transition: 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
          pointerEvents: 'none',
        }}
      >
        {/* Lead Iron Man Character (Flying bank posture) */}
        <div
          className="flight-iron-man-actor"
          style={{
            width: '120px',
            height: '135px',
            transform: `rotate(${lane === 0 ? '-14deg' : lane === 2 ? '14deg' : '0deg'}) scale(0.68)`,
            transition: 'transform 0.25s ease',
            filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.85)) drop-shadow(0 0 15px #38bdf8)',
          }}
        >
          <IronManCharacter action="fly" size={0.68} readableCues={false} />
          {/* Dual Thruster Plasma Flames */}
          <div className="cockpit-thruster-flames" />
        </div>
      </div>

      {/* 5. Left & Right Floating Steering Control Buttons (左右控制避让按钮) */}
      {interactive && !isReached && (
        <div className="flight-steering-controls" style={{ pointerEvents: 'auto' }}>
          <button
            type="button"
            className={`flight-steer-btn flight-steer-left ${lane === 0 ? 'is-disabled' : ''}`}
            onClick={handleMoveLeft}
            aria-label="向左避让"
            title="向左移动避开障碍物"
          >
            <span className="steer-arrow">◀</span>
            <span className="steer-label">左移避让</span>
          </button>

          <button
            type="button"
            className={`flight-steer-btn flight-steer-right ${lane === 2 ? 'is-disabled' : ''}`}
            onClick={handleMoveRight}
            aria-label="向右避让"
            title="向右移动避开障碍物"
          >
            <span className="steer-label">右移避让</span>
            <span className="steer-arrow">▶</span>
          </button>
        </div>
      )}

      {/* 6. Top Flight Tactical Progress Bar */}
      <div className="flight-hud-topbar" style={{ pointerEvents: 'auto' }}>
        <div className="flight-hud-progress-block">
          <div className="hud-progress-info">
            <span>🚀 正在逼近黑云星</span>
            <strong>{Math.min(100, Math.round(currentProgress))}%</strong>
          </div>
          <div className="hud-progress-track">
            <div className="hud-progress-fill" style={{ width: `${Math.min(100, currentProgress)}%` }} />
          </div>
        </div>
        <div className="flight-hud-stat">
          <strong className="hud-value" style={{ color: '#fde047' }}>⭐ STAR ENERGY</strong>
        </div>
      </div>

      {/* 7. CLIMAX: Planet Reached & Landing Confirmation */}
      {isReached && (
        <div className="landing-hologram-modal" role="dialog" aria-label="黑云星着陆确认" style={{ pointerEvents: 'auto' }}>
          <div className="landing-modal-glow" />
          <div className="landing-modal-content">
            <span className="landing-badge">🪐 行星轨道已捕获 · ORBIT CAPTURED</span>
            <h3>已抵达黑云星！</h3>
            <button
              type="button"
              className="landing-confirm-btn"
              onClick={() => onLandingConfirm?.()}
              autoFocus
            >
              <span className="btn-icon">🚀</span> 确认着陆
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
