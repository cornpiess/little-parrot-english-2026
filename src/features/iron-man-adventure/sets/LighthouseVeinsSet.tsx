export default function LighthouseVeinsSet() {
  return (
    <div className="scene-set-container set-lighthouse-veins" data-scene-set="lighthouse-veins">
      {/* 1. Far Plane: Colossal Lighthouse Base Portal Arch Soaring into Sky */}
      <div className="scene-plane scene-plane-far" data-plane="far">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          {/* Deep Night Atmosphere */}
          <rect width="1000" height="600" fill="#040c17" />

          {/* Monumental Lighthouse Base Arch */}
          <path d="M 310 600 L 375 110 L 625 110 L 690 600 Z" fill="#081626" stroke="#1e293b" strokeWidth="7" />

          {/* Grand High Power Core Chamber Window */}
          <ellipse cx="500" cy="175" rx="65" ry="85" fill="#0284c7" stroke="#38bdf8" strokeWidth="6" filter="drop-shadow(0 0 30px #0284c7)" />
          <ellipse cx="500" cy="175" rx="40" ry="55" fill="#e0f2fe" />
          <line x1="500" y1="175" x2="500" y2="420" stroke="#38bdf8" strokeWidth="10" />
        </svg>
      </div>

      {/* 2. Middle Plane: 3 Thick Glowing Power Cables & 3 Battery Socket Nodes 🔋 */}
      <div className="scene-plane scene-plane-middle" data-plane="middle">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          {/* Valley Floor Circuit Plane */}
          <path d="M 0 450 L 500 365 L 1000 450 L 1000 600 L 0 600 Z" fill="#050e1a" stroke="#0f172a" strokeWidth="4" />

          {/* Cable 1: From Left Battery Socket (180, 500) to Center Hub (500, 420) */}
          <path
            d="M 180 500 Q 320 480 500 420"
            fill="none"
            stroke="#0284c7"
            strokeWidth="14"
            className="vein-energy-flow"
          />
          {/* Cable 2: From Right Battery Socket (820, 500) to Center Hub (500, 420) */}
          <path
            d="M 820 500 Q 680 480 500 420"
            fill="none"
            stroke="#0284c7"
            strokeWidth="14"
            className="vein-energy-flow"
          />
          {/* Cable 3: Vertical Main Power Cable to Tower */}
          <path
            d="M 500 420 L 500 175"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="18"
            className="vein-energy-flow"
          />

          {/* Node 1: Left Battery Power Pedestal 🔋 */}
          <g transform="translate(180, 500)">
            <ellipse cx="0" cy="0" rx="50" ry="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="4.5" filter="drop-shadow(0 0 14px #38bdf8)" />
            {/* Battery Cylinder */}
            <rect x="-26" y="-45" width="52" height="45" rx="7" fill="#0284c7" stroke="#38bdf8" strokeWidth="3" />
            <rect x="-12" y="-54" width="24" height="9" rx="3" fill="#38bdf8" />
            {/* Battery Charging Level Bars */}
            <rect x="-18" y="-36" width="36" height="8" rx="2" fill="#67e8f9" />
            <rect x="-18" y="-24" width="36" height="8" rx="2" fill="#67e8f9" />
            <rect x="-18" y="-12" width="36" height="8" rx="2" fill="#67e8f9" />
          </g>

          {/* Node 2: Right Battery Power Pedestal 🔋 */}
          <g transform="translate(820, 500)">
            <ellipse cx="0" cy="0" rx="50" ry="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="4.5" filter="drop-shadow(0 0 14px #38bdf8)" />
            {/* Battery Cylinder */}
            <rect x="-26" y="-45" width="52" height="45" rx="7" fill="#0284c7" stroke="#38bdf8" strokeWidth="3" />
            <rect x="-12" y="-54" width="24" height="9" rx="3" fill="#38bdf8" />
            {/* Battery Charging Level Bars */}
            <rect x="-18" y="-36" width="36" height="8" rx="2" fill="#67e8f9" />
            <rect x="-18" y="-24" width="36" height="8" rx="2" fill="#67e8f9" />
            <rect x="-18" y="-12" width="36" height="8" rx="2" fill="#67e8f9" />
          </g>

          {/* Node 3: Center Master Dynamo Power Hub ⚡ */}
          <g transform="translate(500, 420)">
            <ellipse cx="0" cy="0" rx="65" ry="30" fill="#0b1f38" stroke="#facc15" strokeWidth="6" filter="drop-shadow(0 0 30px #facc15)" />
            {/* Center Crystal Dynamo */}
            <polygon points="0,-55 24,-12 0,12 -24,-12" fill="#fde047" stroke="#ffffff" strokeWidth="2.5" filter="drop-shadow(0 0 20px #fde047)" />
          </g>
        </svg>
      </div>

      {/* 3. Near Plane: Foreground Power Spires */}
      <div className="scene-plane scene-plane-near" data-plane="near">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="35,600 80,440 125,600" fill="#061626" stroke="#38bdf8" strokeWidth="3.5" />
          <polygon points="875,600 920,440 965,600" fill="#061626" stroke="#38bdf8" strokeWidth="3.5" />
        </svg>
      </div>
    </div>
  );
}
