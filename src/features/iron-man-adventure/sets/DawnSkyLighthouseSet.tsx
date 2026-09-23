export default function DawnSkyLighthouseSet() {
  return (
    <div className="scene-set-container set-dawn-sky" data-scene-set="dawn-sky-peak">
      {/* 1. Far Plane: Radiant Dawn Sun 🌅 & Reawakened Golden Constellations ⭐ */}
      <div className="scene-plane scene-plane-far" data-plane="far">
        <div className="dawn-sun-radiance" />
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gloriousDawnSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="30%" stopColor="#4c1d95" />
              <stop offset="55%" stopColor="#9f1239" />
              <stop offset="75%" stopColor="#ea580c" />
              <stop offset="92%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
            <radialGradient id="sunDawnCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="80%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
          </defs>

          {/* Glorious Dawn Gradient Sky */}
          <rect width="1000" height="600" fill="url(#gloriousDawnSky)" />

          {/* Giant Radiant Dawn Sun Rising on Horizon */}
          <circle cx="500" cy="510" r="170" fill="url(#sunDawnCore)" filter="drop-shadow(0 0 50px #fde047)" />
          <circle cx="500" cy="510" r="115" fill="#ffffff" />

          {/* Shimmering Five-Point Stars in Upper Sky ⭐ */}
          <g filter="drop-shadow(0 0 10px #ffffff)">
            {/* Star 1 */}
            <polygon points="120,55 127,72 144,72 131,83 136,100 120,89 104,100 109,83 96,72 113,72" fill="#ffffff" />
            {/* Star 2 */}
            <polygon points="260,35 266,48 280,48 269,57 274,70 260,61 246,70 251,57 240,48 254,48" fill="#fde047" />
            {/* Star 3 */}
            <polygon points="760,45 767,62 784,62 771,73 776,90 760,79 744,90 749,73 736,62 753,62" fill="#ffffff" />
            {/* Star 4 */}
            <polygon points="880,65 886,78 900,78 889,87 894,100 880,91 866,100 871,87 860,78 874,78" fill="#fde047" />
          </g>

          {/* Peaceful Dawn Mountain Silhouettes */}
          <path d="M 0 490 L 220 400 L 500 440 L 780 390 L 1000 460 L 1000 600 L 0 600 Z" fill="#3b0d02" opacity="0.8" />
        </svg>
      </div>

      {/* 2. Middle Plane: Blazing Beacon Light Beam Sweeping Across Sky & Lantern Gallery Dome */}
      <div className="scene-plane scene-plane-middle" data-plane="middle">
        <div className="lighthouse-beacon-beam" />
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Lighthouse Lantern Top Gallery at (500, 470) */}
          <g transform="translate(500, 465)">
            {/* Lantern Platform Balcony Base */}
            <path d="M -190 95 L -145 0 L 145 0 L 190 95 Z" fill="#180e38" stroke="#facc15" strokeWidth="6" />

            {/* Golden Safety Railings */}
            <line x1="-120" y1="0" x2="-120" y2="85" stroke="#facc15" strokeWidth="3.5" />
            <line x1="-60" y1="0" x2="-60" y2="85" stroke="#facc15" strokeWidth="3.5" />
            <line x1="0" y1="0" x2="0" y2="85" stroke="#facc15" strokeWidth="3.5" />
            <line x1="60" y1="0" x2="60" y2="85" stroke="#facc15" strokeWidth="3.5" />
            <line x1="120" y1="0" x2="120" y2="85" stroke="#facc15" strokeWidth="3.5" />

            {/* Glowing Giant Fresnel Lens Core (Blazing Light Core) */}
            <circle cx="0" cy="0" r="55" fill="#ffffff" filter="drop-shadow(0 0 55px #fef08a)" />
            <circle cx="0" cy="0" r="35" fill="#fde047" />
            <circle cx="0" cy="0" r="20" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* 3. Near Plane: Golden Morning Sparkles & Warm Sunlight Flare */}
      <div className="scene-plane scene-plane-near" data-plane="near">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <circle cx="250" cy="330" r="5.5" fill="#fde047" filter="drop-shadow(0 0 10px #fde047)" />
          <circle cx="750" cy="290" r="6.5" fill="#ffffff" filter="drop-shadow(0 0 12px #ffffff)" />
          <circle cx="470" cy="170" r="5" fill="#fef08a" />
          <circle cx="650" cy="130" r="4.5" fill="#fde047" />
          <circle cx="160" cy="420" r="4" fill="#ffd166" />
          <circle cx="860" cy="410" r="4.5" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
}
