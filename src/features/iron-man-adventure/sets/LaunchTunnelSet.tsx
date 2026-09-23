export default function LaunchTunnelSet() {
  return (
    <div className="scene-set-container set-launch-tunnel" data-scene-set="launch-tunnel">
      {/* 1. Far Plane: Deep Octagonal Blast Portal opening into Outer Space */}
      <div className="scene-plane scene-plane-far" data-plane="far">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="spacePortalCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#7dd3fc" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>
          </defs>

          {/* Space Hatch Portal Opening */}
          <polygon
            points="420,210 580,210 660,290 660,370 580,450 420,450 340,370 340,290"
            fill="url(#spacePortalCore)"
            stroke="#38bdf8"
            strokeWidth="5"
            filter="drop-shadow(0 0 30px #38bdf8)"
          />

          {/* Sparkling Stars in Portal Opening */}
          <g fill="#ffffff">
            <circle cx="480" cy="290" r="3" />
            <circle cx="530" cy="270" r="3.5" fill="#fde047" />
            <circle cx="510" cy="350" r="2.5" fill="#7dd3fc" />
            <circle cx="440" cy="360" r="2" />
            <circle cx="560" cy="380" r="3" />
            <circle cx="460" cy="320" r="1.5" />
          </g>
        </svg>
      </div>

      {/* 2. Middle Plane: Octagonal Blast Silo Walls, Yellow/Black Hazard Stripes, Rails & Blast Vents */}
      <div className="scene-plane scene-plane-middle" data-plane="middle">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            {/* Caution Yellow/Black Diagonal Hazard Stripe Pattern */}
            <pattern id="siloHazardPattern" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="24" height="48" fill="#eab308" />
              <rect x="24" width="24" height="48" fill="#0f172a" />
            </pattern>
          </defs>

          {/* Octagonal Steel Silo Ring 1 (Mid Distance) */}
          <polygon
            points="320,150 680,150 780,250 780,410 680,510 320,510 220,410 220,250"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="12"
          />

          {/* Octagonal Steel Silo Ring 2 (Foreground Framing) */}
          <polygon
            points="160,50 840,50 980,190 980,470 840,610 160,610 20,470 20,190"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="18"
          />

          {/* Left Wall Heavy Hazard Stripe Armor Plate with Rivets */}
          <polygon points="0,0 200,80 200,520 0,600" fill="url(#siloHazardPattern)" stroke="#ca8a04" strokeWidth="5" />
          <g fill="#475569" stroke="#1e293b" strokeWidth="1">
            <circle cx="180" cy="110" r="5" />
            <circle cx="180" cy="200" r="5" />
            <circle cx="180" cy="300" r="5" />
            <circle cx="180" cy="400" r="5" />
            <circle cx="180" cy="490" r="5" />
          </g>

          {/* Right Wall Heavy Hazard Stripe Armor Plate with Rivets */}
          <polygon points="1000,0 800,80 800,520 1000,600" fill="url(#siloHazardPattern)" stroke="#ca8a04" strokeWidth="5" />
          <g fill="#475569" stroke="#1e293b" strokeWidth="1">
            <circle cx="820" cy="110" r="5" />
            <circle cx="820" cy="200" r="5" />
            <circle cx="820" cy="300" r="5" />
            <circle cx="820" cy="400" r="5" />
            <circle cx="820" cy="490" r="5" />
          </g>

          {/* 4 Glowing Magnetic Acceleration Corner Rails */}
          <line x1="0" y1="0" x2="420" y2="210" stroke="#38bdf8" strokeWidth="7" filter="drop-shadow(0 0 10px #38bdf8)" />
          <line x1="1000" y1="0" x2="580" y2="210" stroke="#38bdf8" strokeWidth="7" filter="drop-shadow(0 0 10px #38bdf8)" />
          <line x1="0" y1="600" x2="420" y2="450" stroke="#38bdf8" strokeWidth="7" filter="drop-shadow(0 0 10px #38bdf8)" />
          <line x1="1000" y1="600" x2="580" y2="450" stroke="#38bdf8" strokeWidth="7" filter="drop-shadow(0 0 10px #38bdf8)" />

          {/* Top & Bottom Heavy Exhaust Louvers */}
          <line x1="280" y1="20" x2="720" y2="20" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
          <line x1="300" y1="36" x2="700" y2="36" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          <line x1="280" y1="580" x2="720" y2="580" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
        </svg>
      </div>

      {/* 3. Near Plane: Dynamic Jet Propulsion Speed Streaks */}
      <div className="scene-plane scene-plane-near" data-plane="near">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <line x1="500" y1="330" x2="70" y2="60" stroke="#ffffff" strokeWidth="4.5" className="speed-streak" />
          <line x1="500" y1="330" x2="930" y2="70" stroke="#38bdf8" strokeWidth="5" className="speed-streak" style={{ animationDelay: '-0.25s' }} />
          <line x1="500" y1="330" x2="80" y2="540" stroke="#7dd3fc" strokeWidth="4.5" className="speed-streak" style={{ animationDelay: '-0.5s' }} />
          <line x1="500" y1="330" x2="920" y2="530" stroke="#ffffff" strokeWidth="5" className="speed-streak" style={{ animationDelay: '-0.15s' }} />
        </svg>
      </div>
    </div>
  );
}
