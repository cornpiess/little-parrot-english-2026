export default function BlackGlassValleySet() {
  return (
    <div className="scene-set-container set-glass-valley" data-scene-set="glass-valley">
      {/* 1. Far Plane: Obsidian Mountain Peaks & Clear Silhouette of Dormant Lighthouse 🗼 */}
      <div className="scene-plane scene-plane-far" data-plane="far">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="valleySky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#050814" />
              <stop offset="45%" stopColor="#0a1226" />
              <stop offset="100%" stopColor="#03060d" />
            </linearGradient>
          </defs>

          {/* Deep Night Sky */}
          <rect width="1000" height="600" fill="url(#valleySky)" />

          {/* Stars */}
          <circle cx="140" cy="70" r="2" fill="#ffffff" />
          <circle cx="330" cy="50" r="2.5" fill="#a855f7" />
          <circle cx="770" cy="80" r="2" fill="#38bdf8" />
          <circle cx="910" cy="100" r="2.5" fill="#ffffff" />
          <circle cx="500" cy="60" r="1.5" fill="#fde047" />

          {/* Distant Jagged Obsidian Mountain Ridge */}
          <path d="M 0 350 L 220 240 L 450 320 L 680 170 L 870 260 L 1000 200 L 1000 600 L 0 600 Z" fill="#0c1730" />

          {/* Iconic Tall Lighthouse on Cliff (680, 170) - Clear Theatrical Silhouette */}
          <g transform="translate(680, 170)">
            {/* Mountain Cliff Pedestal */}
            <path d="M -75 200 L -45 40 L 45 40 L 75 200 Z" fill="#101f3d" stroke="#1e293b" strokeWidth="3" />

            {/* Lighthouse Tower Body with Alternating Striped Bands */}
            <path d="M -32 40 L -20 -115 L 20 -115 L 32 40 Z" fill="#091326" stroke="#38bdf8" strokeWidth="3" />
            {/* White/Dark Tower Band Sections */}
            <path d="M -28 0 L 28 0 L 25 -36 L -25 -36 Z" fill="#1e293b" />
            <path d="M -23 -70 L 23 -70 L 20 -100 L -20 -100 Z" fill="#1e293b" />

            {/* Balcony Gallery Railing */}
            <rect x="-26" y="-125" width="52" height="10" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Glass Cage Room (Extinguished / No Beam) */}
            <rect x="-20" y="-155" width="40" height="30" rx="2" fill="#050c18" stroke="#64748b" strokeWidth="3" />
            <line x1="0" y1="-155" x2="0" y2="-125" stroke="#64748b" strokeWidth="2.5" />

            {/* Conical Roof & Top Spire */}
            <polygon points="-24,-155 0,-185 24,-155" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="0" y1="-185" x2="0" y2="-200" stroke="#38bdf8" strokeWidth="3" />

            {/* Dead bulb core (Dim dark blue dot) */}
            <circle cx="0" cy="-140" r="5.5" fill="#0284c7" opacity="0.35" />
          </g>
        </svg>
      </div>

      {/* 2. Middle Plane: Terraced Obsidian Cliffs & Large Faceted Crystal Gems 💎 */}
      <div className="scene-plane scene-plane-middle" data-plane="middle">
        <svg viewBox="0 0 1000 600" className="valley-mountain-silhouette" preserveAspectRatio="none">
          {/* Middle Obsidian Terraced Cliffs */}
          <path d="M 0 430 L 300 370 L 560 440 L 820 380 L 1000 440 L 1000 600 L 0 600 Z" fill="#081020" stroke="#1e293b" strokeWidth="4" />

          {/* Large Glowing Blue Crystal Stone 💎 (Left) */}
          <g transform="translate(160, 420)">
            <polygon points="0,35 22,-25 45,35 22,50" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" filter="drop-shadow(0 0 12px #38bdf8)" />
            <polygon points="22,-25 40,5 22,50" fill="#7dd3fc" />
            <polygon points="0,35 22,-25 15,45" fill="#0369a1" />
          </g>

          {/* Large Glowing Blue Crystal Stone 💎 (Right) */}
          <g transform="translate(860, 410)">
            <polygon points="0,40 28,-30 55,40 28,55" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" filter="drop-shadow(0 0 12px #38bdf8)" />
            <polygon points="28,-30 45,10 28,55" fill="#7dd3fc" />
            <polygon points="0,40 28,-30 18,50" fill="#0369a1" />
          </g>

          {/* Broken Ground Crystal Veins (Faint blue pulse) */}
          <g className="crystal-crack-glow">
            <path d="M 120 540 L 280 470 L 460 510 L 640 460 L 720 370" fill="none" stroke="#38bdf8" strokeWidth="4.5" strokeDasharray="14 10" />
            <path d="M 460 510 L 530 565 L 680 585" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="10 8" />
          </g>
        </svg>
      </div>

      {/* 3. Near Plane: Reflective Obsidian Shelf & Trail of Glowing Cyan Footprints */}
      <div className="scene-plane scene-plane-near" data-plane="near">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          {/* Foreground Glass Ground Shelf */}
          <path d="M 0 530 Q 500 485 1000 530 L 1000 600 L 0 600 Z" fill="#03060c" stroke="#0f172a" strokeWidth="3.5" />

          {/* Trail of Glowing Cyan Footprints leading towards the distance */}
          <g filter="drop-shadow(0 0 10px #38bdf8)">
            <ellipse cx="280" cy="570" rx="11" ry="5.5" fill="#38bdf8" />
            <ellipse cx="345" cy="550" rx="10" ry="5" fill="#38bdf8" />
            <ellipse cx="415" cy="530" rx="9" ry="4.5" fill="#38bdf8" />
            <ellipse cx="485" cy="505" rx="8" ry="4" fill="#38bdf8" />
            <ellipse cx="560" cy="475" rx="7" ry="3.5" fill="#38bdf8" opacity="0.85" />
            <ellipse cx="630" cy="445" rx="6" ry="3" fill="#38bdf8" opacity="0.65" />
          </g>
        </svg>
      </div>
    </div>
  );
}
