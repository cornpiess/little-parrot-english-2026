export default function StarShelterSet() {
  return (
    <div className="scene-set-container set-star-shelter" data-scene-set="star-shelter">
      {/* 1. Far Plane: Warm Stone Wall Vault with Hanging Lantern 🏮 */}
      <div className="scene-plane scene-plane-far" data-plane="far">
        <div className="shelter-warm-hearth" />
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          {/* Warm Dark Amber Cavern Interior */}
          <rect width="1000" height="600" fill="#180802" />

          {/* Hanging Warm Camp Lantern 🏮 on Right Ceiling */}
          <g transform="translate(750, 70)">
            <line x1="0" y1="-70" x2="0" y2="0" stroke="#78350f" strokeWidth="4" />
            <polygon points="-24,0 0,-18 24,0" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <rect x="-20" y="0" width="40" height="54" rx="8" fill="#92400e" stroke="#d97706" strokeWidth="2.5" />
            {/* Glowing Lantern Glass */}
            <rect x="-14" y="8" width="28" height="38" rx="5" fill="#fde047" filter="drop-shadow(0 0 20px #f59e0b)" />
            <line x1="-14" y1="27" x2="14" y2="27" stroke="#b45309" strokeWidth="2" />
            <rect x="-18" y="54" width="36" height="12" rx="4" fill="#78350f" />
          </g>
        </svg>
      </div>

      {/* 2. Middle Plane: Little Star's Warm Glowing Bed 🧺 & Momo's Robot Tool Rack 🔧⚙️ */}
      <div className="scene-plane scene-plane-middle" data-plane="middle">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Momo's Robot Workshop Tool Bench on Left */}
          <g transform="translate(130, 340)">
            {/* Wooden Tool Pegboard */}
            <rect x="0" y="0" width="190" height="170" rx="12" fill="#2d1204" stroke="#78350f" strokeWidth="5" />

            {/* Hanging Wrench Tool 🔧 */}
            <g transform="translate(45, 45) rotate(-35)">
              <rect x="-6" y="-32" width="12" height="64" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="2.5" />
              <circle cx="0" cy="-32" r="14" fill="none" stroke="#94a3b8" strokeWidth="7" />
              <rect x="-4" y="-45" width="8" height="12" fill="#2d1204" />
            </g>

            {/* Hanging Gear ⚙️ */}
            <g transform="translate(135, 50)">
              <circle cx="0" cy="0" r="22" fill="#d97706" stroke="#f59e0b" strokeWidth="4" strokeDasharray="12 8" />
              <circle cx="0" cy="0" r="9" fill="#2d1204" />
            </g>

            {/* Screwdriver on Bench */}
            <rect x="30" y="125" width="75" height="12" rx="4" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
            <rect x="105" y="128" width="45" height="6" fill="#cbd5e1" />

            {/* Spare Light Crystal on Bench */}
            <polygon points="160,135 170,115 180,135" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
          </g>

          {/* Centerpiece: Little Star's Warm Glowing Nest / Cradle 🧺 */}
          <g transform="translate(540, 420)">
            {/* Soft Warm Basket Base */}
            <ellipse cx="0" cy="55" rx="200" ry="52" fill="#451a03" stroke="#d97706" strokeWidth="5" />
            <ellipse cx="0" cy="50" rx="170" ry="40" fill="#78350f" />
            <ellipse cx="0" cy="45" rx="140" ry="32" fill="#b45309" />

            {/* Surrounding Warm Amber & Golden Healing Crystals */}
            <polygon points="-85,30 -65,-45 -45,30" fill="#f59e0b" filter="drop-shadow(0 0 16px #f59e0b)" />
            <polygon points="45,30 65,-40 85,30" fill="#f59e0b" filter="drop-shadow(0 0 16px #f59e0b)" />
            <polygon points="-28,40 0,-70 28,40" fill="#fbbf24" filter="drop-shadow(0 0 26px #fbbf24)" />

            {/* Little Sleeping Star (Cute 5-Point Star with Sweet Eyes 😴) */}
            <g transform="translate(0, 10)">
              <polygon
                points="0,-38 12,-11 39,-11 17,6 25,31 0,15 -25,31 -17,6 -39,-11 -12,-11"
                fill="#fde047"
                stroke="#ca8a04"
                strokeWidth="3"
                filter="drop-shadow(0 0 18px #fde047)"
              />
              {/* Cute Closed Sleeping Eyes */}
              <path d="M -9 2 Q -4 8 0 2" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 0 2 Q 5 8 9 2" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
              {/* Rosy Cheeks */}
              <circle cx="-13" cy="7" r="3.5" fill="#f472b6" opacity="0.85" />
              <circle cx="13" cy="7" r="3.5" fill="#f472b6" opacity="0.85" />
              {/* Floating "Z z z" */}
              <text x="26" y="-22" fontSize="18" fontWeight="bold" fontFamily="sans-serif" fill="#fde047">Z</text>
              <text x="38" y="-36" fontSize="14" fontWeight="bold" fontFamily="sans-serif" fill="#fde047">z</text>
              <text x="48" y="-48" fontSize="10" fontWeight="bold" fontFamily="sans-serif" fill="#fde047">z</text>
            </g>
          </g>
        </svg>
      </div>

      {/* 3. Near Plane: Warm Cavern Arch Silhouette */}
      <div className="scene-plane scene-plane-near" data-plane="near">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <path d="M 0 0 L 150 0 Q 110 300 0 600 Z" fill="#0d0400" />
          <path d="M 1000 0 L 850 0 Q 890 300 1000 600 Z" fill="#0d0400" />
        </svg>
      </div>
    </div>
  );
}
