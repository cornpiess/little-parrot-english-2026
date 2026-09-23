import { useState } from 'react';

export interface ArmorPlatformSetProps {
  onPalmTouch?: () => void;
  isSuitLinked?: boolean;
}

export default function ArmorPlatformSet({
  onPalmTouch,
  isSuitLinked = false,
}: ArmorPlatformSetProps) {
  const [touched, setTouched] = useState(false);
  const linked = isSuitLinked || touched;

  const handlePalmClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTouched(true);
    onPalmTouch?.();
  };

  return (
    <div className={`scene-set-container set-armor-platform ${linked ? 'is-linked' : ''}`} data-scene-set="armor-platform">
      {/* 1. Far Plane: High Hangar Steel Arch Vault & Armor Storage Pods */}
      <div className="scene-plane scene-plane-far" data-plane="far">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          {/* Deep Industrial Interior Wall */}
          <rect width="1000" height="600" fill="#080c16" />

          {/* Heavy Steel Truss Ceiling Gantry */}
          <path d="M 0 0 L 160 150 L 840 150 L 1000 0 Z" fill="#0e1726" stroke="#1e293b" strokeWidth="5" />
          <line x1="260" y1="0" x2="260" y2="150" stroke="#334155" strokeWidth="8" />
          <line x1="500" y1="0" x2="500" y2="150" stroke="#475569" strokeWidth="10" />
          <line x1="740" y1="0" x2="740" y2="150" stroke="#334155" strokeWidth="8" />

          {/* Background Armor Pod 1 (Left) */}
          <g transform="translate(80, 180)">
            <rect x="0" y="0" width="120" height="260" rx="20" fill="#0c1424" stroke="#1e293b" strokeWidth="4" />
            <rect x="15" y="20" width="90" height="220" rx="14" fill="#060a12" stroke="#0284c7" strokeWidth="2" />
            {/* Blue Visor Eye Glow inside Pod */}
            <rect x="40" y="55" width="40" height="10" rx="4" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />
          </g>

          {/* Background Armor Pod 2 (Right) */}
          <g transform="translate(800, 180)">
            <rect x="0" y="0" width="120" height="260" rx="20" fill="#0c1424" stroke="#1e293b" strokeWidth="4" />
            <rect x="15" y="20" width="90" height="220" rx="14" fill="#060a12" stroke="#0284c7" strokeWidth="2" />
            {/* Blue Visor Eye Glow inside Pod */}
            <rect x="40" y="55" width="40" height="10" rx="4" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />
          </g>
        </svg>
      </div>

      {/* 2. Middle Plane: Overhead Spotlight, Iconic Arc Reactor Floor & Mechanical Robotic Arms */}
      <div className="scene-plane scene-plane-middle" data-plane="middle">
        <div className="armor-top-spotlight" />
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="reactorCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#67e8f9" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>
            <linearGradient id="armSteel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="40%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* Multi-Tiered Circular Arc Reactor Floor Station */}
          <g transform="translate(500, 470)">
            {/* Outer Heavy Steel Foundation Rim */}
            <ellipse cx="0" cy="0" rx="360" ry="100" fill="#090f1d" stroke="#ca8a04" strokeWidth="7" />
            <ellipse cx="0" cy="0" rx="300" ry="82" fill="#040711" stroke="#38bdf8" strokeWidth="4" />

            {/* Glowing Segmented Arc Ring */}
            <ellipse cx="0" cy="0" rx="230" ry="62" fill="none" stroke="#facc15" strokeWidth="6" strokeDasharray="36 20" />

            {/* Glowing Arc Reactor Center Well */}
            <ellipse cx="0" cy="0" rx="160" ry="46" fill="url(#reactorCore)" filter="drop-shadow(0 0 25px #38bdf8)" />
            <ellipse cx="0" cy="0" rx="160" ry="46" fill="none" stroke="#ffffff" strokeWidth="3" />

            {/* Inner Reactor Geometric Power Spokes */}
            <ellipse cx="0" cy="0" rx="105" ry="30" fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="18 14" />
            <polygon points="0,-22 24,14 -24,14" fill="none" stroke="#ffffff" strokeWidth="3.5" filter="drop-shadow(0 0 8px #ffffff)" />
            <circle cx="0" cy="0" r="12" fill="#ffffff" filter="drop-shadow(0 0 12px #67e8f9)" />
          </g>

          {/* Left Mechanical Robotic Assembly Arm */}
          <g
            transform={`translate(${160 + (linked ? 40 : 0)}, ${220 + (linked ? 20 : 0)})`}
            style={{ transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          >
            <circle cx="0" cy="0" r="22" fill="#1e293b" stroke="#ca8a04" strokeWidth="5" />
            <path d="M 0 0 L 100 130" stroke="url(#armSteel)" strokeWidth="22" strokeLinecap="round" />
            <path d="M -10 10 Q 40 80 90 140" fill="none" stroke="#f97316" strokeWidth="5" />
            <circle cx="100" cy="130" r="18" fill="#1e293b" stroke="#38bdf8" strokeWidth="4" />
            <path d="M 100 130 L 170 230" stroke="url(#armSteel)" strokeWidth="16" strokeLinecap="round" />
            <circle cx="170" cy="230" r="12" fill="#eab308" />
            <path d="M 170 230 L 195 255 L 180 265" fill="none" stroke="#facc15" strokeWidth="7" strokeLinecap="round" />
            <path d="M 170 230 L 150 260 L 165 270" fill="none" stroke="#facc15" strokeWidth="7" strokeLinecap="round" />
            <circle cx="175" cy="265" r="5" fill="#ffffff" filter="drop-shadow(0 0 10px #38bdf8)" />
          </g>

          {/* Right Mechanical Robotic Assembly Arm */}
          <g
            transform={`translate(${840 - (linked ? 40 : 0)}, ${220 + (linked ? 20 : 0)})`}
            style={{ transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          >
            <circle cx="0" cy="0" r="22" fill="#1e293b" stroke="#ca8a04" strokeWidth="5" />
            <path d="M 0 0 L -100 130" stroke="url(#armSteel)" strokeWidth="22" strokeLinecap="round" />
            <path d="M 10 10 Q -40 80 -90 140" fill="none" stroke="#f97316" strokeWidth="5" />
            <circle cx="-100" cy="130" r="18" fill="#1e293b" stroke="#38bdf8" strokeWidth="4" />
            <path d="M -100 130 L -170 230" stroke="url(#armSteel)" strokeWidth="16" strokeLinecap="round" />
            <circle cx="-170" cy="230" r="12" fill="#eab308" />
            <path d="M -170 230 L -195 255 L -180 265" fill="none" stroke="#facc15" strokeWidth="7" strokeLinecap="round" />
            <path d="M -170 230 L -150 260 L -165 270" fill="none" stroke="#facc15" strokeWidth="7" strokeLinecap="round" />
            <circle cx="-175" cy="265" r="5" fill="#ffffff" filter="drop-shadow(0 0 10px #38bdf8)" />
          </g>
        </svg>
      </div>

      {/* 3. Near Plane: Interactive Palm Link Touch Target & Link Feedback */}
      <div className="scene-plane scene-plane-near" data-plane="near" style={{ pointerEvents: 'auto' }}>
        {/* Interactive Glowing Palm Touch Ring */}
        <div
          className={`palm-link-target ${linked ? 'is-linked' : ''}`}
          onClick={handlePalmClick}
          title="点击触碰钢铁侠掌心，穿戴反浩克装甲！"
        >
          <div className="palm-pulse-ring" />
          <div className="palm-center-core">
            <span className="palm-icon">✋</span>
          </div>
          <span className="palm-tip-text">
            {linked ? '⚡ 副驾驶已连接 · COPILOT LINKED' : '✨ 点击掌心连接反浩克装甲'}
          </span>
        </div>
      </div>
    </div>
  );
}
