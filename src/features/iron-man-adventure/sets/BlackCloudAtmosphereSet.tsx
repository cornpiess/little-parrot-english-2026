export default function BlackCloudAtmosphereSet() {
  return (
    <div className="scene-set-container set-black-cloud" data-scene-set="black-cloud-storm">
      {/* 1. Far Plane: Deep Storm Sky with Ambient Electrical Flash */}
      <div className="scene-plane scene-plane-far" data-plane="far">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="deepStormSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1035" />
              <stop offset="50%" stopColor="#2e1065" />
              <stop offset="100%" stopColor="#080214" />
            </linearGradient>
          </defs>

          <rect width="1000" height="600" fill="url(#deepStormSky)" />

          {/* Distant Lightning Flash Glow Behind Clouds */}
          <circle cx="280" cy="180" r="150" fill="rgba(250, 204, 21, 0.28)" filter="blur(32px)" />
          <circle cx="720" cy="240" r="170" fill="rgba(192, 132, 252, 0.35)" filter="blur(36px)" />
        </svg>
      </div>

      {/* 2. Middle Plane: Massive Puffy Cartoon Storm Clouds ☁️ & Bright Yellow Jagged Lightning ⚡ */}
      <div className="scene-plane scene-plane-middle" data-plane="middle">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cloudPurple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#581c87" />
              <stop offset="50%" stopColor="#3b0764" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="cloudFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6b21a8" />
              <stop offset="60%" stopColor="#4c1d95" />
              <stop offset="100%" stopColor="#0f0728" />
            </linearGradient>
          </defs>

          {/* Left Cloud Bank ☁️ with Puffy Bezier Lobes */}
          <path
            d="M -80 40 Q 60 0 130 90 Q 220 30 300 130 Q 370 230 270 330 Q 350 430 230 510 Q 130 610 -80 600 Z"
            fill="url(#cloudPurple)"
            stroke="#9333ea"
            strokeWidth="6"
          />
          {/* Cloud Highlights on Left Lobes */}
          <path d="M 60 50 Q 110 30 150 90" fill="none" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
          <path d="M 220 70 Q 270 70 290 140" fill="none" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" opacity="0.6" />

          {/* Right Cloud Bank ☁️ with Puffy Bezier Lobes */}
          <path
            d="M 1080 30 Q 940 -10 870 80 Q 780 20 700 120 Q 630 220 730 320 Q 650 420 770 500 Q 870 600 1080 600 Z"
            fill="url(#cloudPurple)"
            stroke="#9333ea"
            strokeWidth="6"
          />
          {/* Cloud Highlights on Right Lobes */}
          <path d="M 940 40 Q 890 20 860 80" fill="none" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
          <path d="M 780 60 Q 730 60 700 130" fill="none" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" opacity="0.6" />

          {/* Lower Bottom Rolling Cloud Shelf */}
          <path
            d="M 0 600 Q 180 450 360 510 Q 500 430 680 500 Q 860 440 1000 600 Z"
            fill="url(#cloudFront)"
            stroke="#a855f7"
            strokeWidth="5"
          />

          {/* Big Yellow Jagged Lightning Bolt ⚡ on Left */}
          <g className="lightning-flicker" transform="translate(230, 100)">
            <polygon
              points="45,0 -12,135 35,135 -25,280 75,115 28,115"
              fill="#facc15"
              stroke="#ffffff"
              strokeWidth="4"
              filter="drop-shadow(0 0 20px #facc15)"
            />
            {/* Branching Side Arc */}
            <path d="M 10 135 L -45 180 L -30 210" fill="none" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Big Electric Blue Jagged Lightning Bolt ⚡ on Right */}
          <g className="lightning-flicker" transform="translate(670, 130)" style={{ animationDelay: '-1.5s' }}>
            <polygon
              points="35,0 -18,115 25,115 -30,240 55,95 12,95"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="4"
              filter="drop-shadow(0 0 20px #38bdf8)"
            />
            {/* Branching Side Arc */}
            <path d="M 0 115 L -35 150" fill="none" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* 3. Near Plane: Drifting Rain Drops & Storm Electric Sparks */}
      <div className="scene-plane scene-plane-near" data-plane="near">
        <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="none">
          <line x1="210" y1="370" x2="160" y2="460" stroke="#fde047" strokeWidth="3.5" opacity="0.85" />
          <line x1="460" y1="410" x2="410" y2="500" stroke="#38bdf8" strokeWidth="3.5" opacity="0.85" />
          <line x1="770" y1="350" x2="720" y2="440" stroke="#fde047" strokeWidth="3.5" opacity="0.85" />
          <line x1="890" y1="430" x2="840" y2="520" stroke="#38bdf8" strokeWidth="3.5" opacity="0.85" />
        </svg>
      </div>
    </div>
  );
}
