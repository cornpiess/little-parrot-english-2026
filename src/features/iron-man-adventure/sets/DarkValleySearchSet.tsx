export default function DarkValleySearchSet() {
  return (
    <div className="scene-set-container set-dark-search" data-scene-set="dark-valley-search">
      {/* 1. Far Plane: Deep Cave Vault with Dramatic Hanging Stalactites ⛰️ */}
      <div className="scene-plane scene-plane-far" data-plane="far">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          {/* Deep Dark Cave Interior */}
          <rect width="1000" height="600" fill="#04060e" />

          {/* Sharp Ceiling Stalactites Hanging Down with Shaded Facets */}
          <g>
            <polygon points="30,0 75,150 120,0" fill="#091024" stroke="#1e293b" strokeWidth="2" />
            <polygon points="75,150 120,0 75,0" fill="#050a17" />

            <polygon points="120,0 170,100 220,0" fill="#0e1833" stroke="#1e293b" strokeWidth="2" />
            <polygon points="170,100 220,0 170,0" fill="#091024" />

            <polygon points="220,0 285,180 350,0" fill="#091024" stroke="#1e293b" strokeWidth="2" />
            <polygon points="285,180 350,0 285,0" fill="#050a17" />

            <polygon points="390,0 445,120 500,0" fill="#0e1833" stroke="#1e293b" strokeWidth="2" />

            <polygon points="550,0 615,170 680,0" fill="#091024" stroke="#1e293b" strokeWidth="2" />
            <polygon points="615,170 680,0 615,0" fill="#050a17" />

            <polygon points="700,0 755,110 810,0" fill="#0e1833" />

            <polygon points="810,0 875,190 940,0" fill="#091024" stroke="#1e293b" strokeWidth="2" />
            <polygon points="875,190 940,0 875,0" fill="#050a17" />
          </g>
        </svg>
      </div>

      {/* 2. Middle Plane: Ground Stalagmites, Bioluminescent Mushrooms 🍄 & Gem Crystals 💎 */}
      <div className="scene-plane scene-plane-middle" data-plane="middle">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          {/* Ground Stalagmites Rising Up */}
          <polygon points="50,600 105,390 160,600" fill="#091024" stroke="#1e293b" strokeWidth="3" />
          <polygon points="105,390 160,600 105,600" fill="#050a17" />

          <polygon points="830,600 885,380 940,600" fill="#091024" stroke="#1e293b" strokeWidth="3" />
          <polygon points="885,380 940,600 885,600" fill="#050a17" />

          {/* Flashlight Search Spotlight Beam hitting cavern ground */}
          <ellipse
            cx="500"
            cy="460"
            rx="160"
            ry="65"
            fill="radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(250, 204, 21, 0.15) 50%, transparent 75%)"
          />

          {/* Glowing Green Bioluminescent Mushrooms 🍄 (Left) */}
          <g transform="translate(180, 460)">
            {/* Big Mushroom */}
            <path d="M 0 0 Q 35 -48 70 0 Z" fill="#34d399" filter="drop-shadow(0 0 14px #34d399)" />
            <circle cx="22" cy="-18" r="3.5" fill="#ffffff" />
            <circle cx="48" cy="-14" r="3.5" fill="#ffffff" />
            <circle cx="35" cy="-30" r="3" fill="#ffffff" />
            <rect x="28" y="0" width="14" height="28" rx="4" fill="#065f46" />

            {/* Small Mushroom */}
            <path d="M 60 15 Q 85 -20 110 15 Z" fill="#6ee7b7" filter="drop-shadow(0 0 10px #6ee7b7)" />
            <circle cx="85" cy="0" r="2.5" fill="#ffffff" />
            <rect x="80" y="15" width="10" height="20" rx="3" fill="#065f46" />
          </g>

          {/* Glowing Cyan & Golden Crystal Gem Clusters 💎 (Right) */}
          <g transform="translate(750, 450)">
            {/* Cyan Crystal Spire */}
            <polygon points="20,45 38,-35 56,45 38,55" fill="#38bdf8" stroke="#bae6fd" strokeWidth="2.5" filter="drop-shadow(0 0 14px #38bdf8)" />
            <polygon points="38,-35 50,10 38,55" fill="#7dd3fc" />

            {/* Golden Crystal Spire */}
            <polygon points="50,45 72,-15 94,45" fill="#facc15" stroke="#fef08a" strokeWidth="2.5" filter="drop-shadow(0 0 14px #facc15)" />
            <polygon points="72,-15 88,15 72,45" fill="#fde047" />

            {/* Emerald Small Crystal */}
            <polygon points="0,48 18,8 36,48" fill="#34d399" stroke="#6ee7b7" strokeWidth="2" filter="drop-shadow(0 0 10px #34d399)" />
          </g>
        </svg>
      </div>

      {/* 3. Near Plane: Foreground Rock Arch Silhouette */}
      <div className="scene-plane scene-plane-near" data-plane="near">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <path d="M -40 0 L 150 0 Q 90 300 -40 600 Z" fill="#020308" />
          <path d="M 1040 0 L 850 0 Q 910 300 1040 600 Z" fill="#020308" />
        </svg>
      </div>
    </div>
  );
}
