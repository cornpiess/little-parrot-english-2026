export default function StarkNightLabSet() {
  return (
    <div className="scene-set-container set-stark-lab" data-scene-set="signal-lab">
      {/* 1. Far Plane: City Night Sky, Twinkling Stars, Moon & Avengers Stark Tower */}
      <div className="scene-plane scene-plane-far" data-plane="far">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="nightSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#040914" />
              <stop offset="40%" stopColor="#0a1d37" />
              <stop offset="80%" stopColor="#0c2d54" />
              <stop offset="100%" stopColor="#030a16" />
            </linearGradient>
            <linearGradient id="starkTowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="40%" stopColor="#0f274a" />
              <stop offset="100%" stopColor="#051226" />
            </linearGradient>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#bae6fd" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Deep Night Atmosphere */}
          <rect width="1000" height="600" fill="url(#nightSkyGrad)" />

          {/* Twinkling Night Stars */}
          <g opacity="0.85">
            <circle cx="80" cy="50" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="90" r="2" fill="#ffd166" />
            <circle cx="280" cy="40" r="1.5" fill="#7dd3fc" />
            <circle cx="410" cy="70" r="2.5" fill="#ffffff" />
            <circle cx="720" cy="50" r="2" fill="#ffd166" />
            <circle cx="820" cy="80" r="1.5" fill="#7dd3fc" />
            <circle cx="940" cy="45" r="2.5" fill="#ffffff" />
          </g>

          {/* Crescent Moon */}
          <g transform="translate(860, 90)">
            <circle cx="0" cy="0" r="36" fill="url(#moonGlow)" />
            <circle cx="0" cy="0" r="26" fill="#fef08a" />
            <circle cx="10" cy="-6" r="24" fill="#081e3a" />
          </g>

          {/* Distant City Skyline Silhouettes */}
          <g fill="#07172e">
            <rect x="30" y="320" width="60" height="280" rx="4" />
            <rect x="110" y="240" width="80" height="360" rx="4" fill="#0c2344" />
            <rect x="210" y="300" width="70" height="300" rx="4" />
            <rect x="300" y="260" width="90" height="340" rx="4" fill="#091d38" />
            <rect x="710" y="280" width="75" height="320" rx="4" />
            <rect x="805" y="210" width="95" height="390" rx="4" fill="#0c2344" />
            <rect x="920" y="270" width="60" height="330" rx="4" />
          </g>

          {/* Lit Windows in Skyscrapers */}
          <g fill="#fde047" opacity="0.8">
            <rect x="125" y="260" width="6" height="8" />
            <rect x="145" y="260" width="6" height="8" />
            <rect x="165" y="280" width="6" height="8" fill="#38bdf8" />
            <rect x="125" y="300" width="6" height="8" />
            <rect x="145" y="320" width="6" height="8" />
            <rect x="320" y="280" width="6" height="8" fill="#38bdf8" />
            <rect x="340" y="300" width="6" height="8" />
            <rect x="825" y="230" width="6" height="8" />
            <rect x="845" y="250" width="6" height="8" fill="#38bdf8" />
            <rect x="865" y="230" width="6" height="8" />
            <rect x="825" y="270" width="6" height="8" />
          </g>

          {/* Iconic Stark / Avengers Tower with Glowing "A" */}
          <g transform="translate(480, 80)">
            {/* Tower Blade Curve */}
            <path
              d="M -20 420 L 20 60 Q 35 20 70 20 L 110 20 Q 140 20 150 60 L 170 420 Z"
              fill="url(#starkTowerGrad)"
              stroke="#3b82f6"
              strokeWidth="2.5"
            />
            {/* Landing Pad Cantilever */}
            <path d="M -50 210 L 30 210 L 20 235 L -40 235 Z" fill="#1e40af" stroke="#60a5fa" strokeWidth="2" />
            {/* Penthouse Glass Lounges */}
            <rect x="35" y="60" width="90" height="35" rx="6" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />

            {/* Glowing "A" Avengers Crest */}
            <circle cx="80" cy="140" r="32" fill="#0284c7" opacity="0.3" filter="blur(6px)" />
            <circle cx="80" cy="140" r="28" fill="#0a2540" stroke="#38bdf8" strokeWidth="3" />
            <text x="80" y="154" fontSize="40" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#67e8f9" textAnchor="middle" filter="drop-shadow(0 0 10px #38bdf8)">
              A
            </text>

            {/* Top Red Beacon Light */}
            <circle cx="80" cy="15" r="4" fill="#ef4444">
              <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>

      {/* 2. Middle Plane: Panoramic Penthouse Window & 3D Holographic Globe Station */}
      <div className="scene-plane scene-plane-middle" data-plane="middle">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="holoCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#67e8f9" stopOpacity="0.8" />
              <stop offset="65%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="holoLightCone" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="metalTable" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* Panoramic Window Framework with Sleek Arcs */}
          <path d="M 0 0 L 1000 0 L 1000 24 L 0 24 Z" fill="#0f172a" />
          <line x1="300" y1="0" x2="300" y2="480" stroke="#1e293b" strokeWidth="8" />
          <line x1="700" y1="0" x2="700" y2="480" stroke="#1e293b" strokeWidth="8" />
          <line x1="0" y1="220" x2="1000" y2="220" stroke="#1e293b" strokeWidth="6" opacity="0.7" />

          {/* Hologram Light Cone */}
          <polygon points="340,460 660,460 600,190 400,190" fill="url(#holoLightCone)" />

          {/* High-Tech Round Table Projector Pedestal */}
          <g transform="translate(500, 460)">
            <ellipse cx="0" cy="0" rx="220" ry="50" fill="url(#metalTable)" stroke="#0284c7" strokeWidth="5" />
            <ellipse cx="0" cy="0" rx="170" ry="38" fill="#081526" stroke="#38bdf8" strokeWidth="3" />
            <ellipse cx="0" cy="0" rx="120" ry="26" fill="#0284c7" stroke="#67e8f9" strokeWidth="2.5" strokeDasharray="16 12" />
            <ellipse cx="0" cy="0" rx="60" ry="14" fill="#67e8f9" />
          </g>

          {/* Floating 3D Hologram Planet Globe */}
          <g transform="translate(500, 260)" className="holo-orb-pulse">
            {/* Hologram Radial Core */}
            <circle cx="0" cy="0" r="85" fill="url(#holoCore)" />

            {/* Latitude / Longitude Vector Rings */}
            <ellipse cx="0" cy="0" rx="85" ry="30" fill="none" stroke="#67e8f9" strokeWidth="2.5" />
            <ellipse cx="0" cy="0" rx="85" ry="60" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
            <ellipse cx="0" cy="0" rx="35" ry="85" fill="none" stroke="#67e8f9" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="85" fill="none" stroke="#0ea5e9" strokeWidth="3" />

            {/* Planetary Ring */}
            <ellipse cx="0" cy="0" rx="130" ry="36" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="18 12" />

            {/* Floating Orbiting Satellite Nodes */}
            <circle cx="-110" cy="-20" r="5" fill="#fde047" filter="drop-shadow(0 0 6px #fde047)" />
            <circle cx="115" cy="20" r="4.5" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />

            {/* Red Pulsing Distress Beacon Symbol "!" */}
            <g transform="translate(42, -38)">
              <circle cx="0" cy="0" r="22" fill="#ef4444" opacity="0.3">
                <animate attributeName="r" values="16;32;16" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="0" r="16" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" filter="drop-shadow(0 0 10px #ef4444)" />
              <text x="0" y="7" fontSize="22" fontWeight="900" fontFamily="sans-serif" fill="#ffffff" textAnchor="middle">!</text>
            </g>

            {/* Floating HUD Hologram Data Rings */}
            <rect x="-140" y="-100" width="80" height="24" rx="4" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" strokeWidth="1.5" />
            <line x1="-130" y1="-88" x2="-70" y2="-88" stroke="#67e8f9" strokeWidth="2" />
            <rect x="60" y="-90" width="70" height="30" rx="4" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" strokeWidth="1.5" />
            <line x1="70" y1="-75" x2="120" y2="-75" stroke="#fde047" strokeWidth="2" />
          </g>

          {/* Curved Lab Floor Edge */}
          <path d="M 0 540 Q 500 460 1000 540 L 1000 600 L 0 600 Z" fill="#080e1c" stroke="#1e293b" strokeWidth="4" />
        </svg>
      </div>

      {/* 3. Near Plane: High-Tech Lab Console Stations with Glowing Screens & Controls */}
      <div className="scene-plane scene-plane-near" data-plane="near">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          {/* Left Control Desk */}
          <polygon points="0,480 200,440 250,600 0,600" fill="#060c18" stroke="#0284c7" strokeWidth="3" />
          <rect x="30" y="480" width="65" height="36" rx="5" fill="#082f49" stroke="#38bdf8" strokeWidth="2" />
          <line x1="40" y1="495" x2="85" y2="495" stroke="#67e8f9" strokeWidth="2" />
          <line x1="40" y1="503" x2="70" y2="503" stroke="#22c55e" strokeWidth="2" />
          {/* Interactive Light Buttons */}
          <circle cx="120" cy="495" r="7" fill="#22c55e" filter="drop-shadow(0 0 6px #22c55e)" />
          <circle cx="145" cy="490" r="7" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
          <circle cx="170" cy="485" r="7" fill="#f59e0b" filter="drop-shadow(0 0 6px #f59e0b)" />

          {/* Right Control Desk */}
          <polygon points="1000,480 800,440 750,600 1000,600" fill="#060c18" stroke="#0284c7" strokeWidth="3" />
          <rect x="905" y="480" width="65" height="36" rx="5" fill="#082f49" stroke="#38bdf8" strokeWidth="2" />
          <line x1="915" y1="495" x2="960" y2="495" stroke="#67e8f9" strokeWidth="2" />
          <line x1="915" y1="503" x2="945" y2="503" stroke="#f43f5e" strokeWidth="2" />
          <circle cx="880" cy="495" r="7" fill="#ef4444" filter="drop-shadow(0 0 6px #ef4444)" />
          <circle cx="855" cy="490" r="7" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
          <circle cx="830" cy="485" r="7" fill="#22c55e" filter="drop-shadow(0 0 6px #22c55e)" />
        </svg>
      </div>
    </div>
  );
}
