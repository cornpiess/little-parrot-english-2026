import { motion } from "motion/react";

export const ParrotLogo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={className}
      animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Drop shadow filter */}
      <defs>
        <filter id="parrot-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#5A8BC2" floodOpacity="0.25" />
        </filter>
        <radialGradient id="body-grad" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#B8DDFB" />
          <stop offset="70%" stopColor="#7BB8F0" />
          <stop offset="100%" stopColor="#5A9BD5" />
        </radialGradient>
        <radialGradient id="belly-grad" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#D6EEFF" />
          <stop offset="100%" stopColor="#A8D4F5" />
        </radialGradient>
      </defs>

      {/* Main body - egg shape with gradient */}
      <g filter="url(#parrot-shadow)">
        <ellipse cx="100" cy="108" rx="70" ry="80" fill="url(#body-grad)" />
        {/* Inner lighter belly */}
        <ellipse cx="100" cy="115" rx="50" ry="55" fill="url(#belly-grad)" opacity="0.5" />
      </g>

      {/* Head crest / tuft feathers - 3 rounded rects */}
      <rect x="80" y="20" width="14" height="30" rx="7" fill="#3DD6C8" transform="rotate(-12 87 35)" />
      <rect x="92" y="15" width="14" height="35" rx="7" fill="#2EC4B6" />
      <rect x="104" y="20" width="14" height="30" rx="7" fill="#3DD6C8" transform="rotate(12 111 35)" />
      {/* Feather highlights */}
      <rect x="84" y="24" width="5" height="14" rx="2.5" fill="#6EE7D8" opacity="0.6" transform="rotate(-12 87 31)" />
      <rect x="96" y="19" width="5" height="16" rx="2.5" fill="#6EE7D8" opacity="0.6" />
      <rect x="108" y="24" width="5" height="14" rx="2.5" fill="#6EE7D8" opacity="0.6" transform="rotate(12 111 31)" />

      {/* Wing (right side) */}
      <ellipse cx="165" cy="118" rx="26" ry="16" fill="#4A8FCE" transform="rotate(-20 165 118)" />
      <ellipse cx="163" cy="116" rx="18" ry="10" fill="#5A9BD5" transform="rotate(-20 163 116)" opacity="0.6" />

      {/* Left eye - larger, cartoonish */}
      <circle cx="74" cy="92" r="22" fill="white" />
      <circle cx="74" cy="92" r="21" fill="white" stroke="#E8E8E8" strokeWidth="0.5" />
      <circle cx="77" cy="90" r="12" fill="#2A3A4A" />
      <circle cx="82" cy="85" r="5" fill="white" />
      <circle cx="74" cy="94" r="2.5" fill="white" opacity="0.4" />

      {/* Right eye - slightly smaller for perspective */}
      <circle cx="122" cy="88" r="20" fill="white" />
      <circle cx="122" cy="88" r="19" fill="white" stroke="#E8E8E8" strokeWidth="0.5" />
      <circle cx="124" cy="86" r="11" fill="#2A3A4A" />
      <circle cx="129" cy="81" r="4.5" fill="white" />
      <circle cx="121" cy="90" r="2.2" fill="white" opacity="0.4" />

      {/* Beak area - dark blue shape */}
      <path d="M82 108 Q98 96 114 108 Q100 124 82 118 Z" fill="#3A6FB0" />
      {/* Inner beak highlight */}
      <path d="M86 110 Q98 102 110 110 Q98 118 86 114 Z" fill="#4A80C0" opacity="0.4" />
      {/* Orange beak */}
      <path d="M94 112 L110 116 L94 122 Z" fill="#FF8C42" />
      <path d="M96 114 L106 116 L96 120 Z" fill="#FFAB6B" opacity="0.5" />
      {/* Nostril */}
      <circle cx="103" cy="116" r="1.5" fill="#E06820" />

      {/* Feet */}
      <g fill="none" stroke="#FF8C42" strokeWidth="3.5" strokeLinecap="round">
        <path d="M82 178 L77 190 M82 178 L82 191 M82 178 L87 190" />
        <path d="M116 178 L111 190 M116 178 L116 191 M116 178 L121 190" />
      </g>

      {/* Cheek blush */}
      <circle cx="60" cy="115" r="9" fill="#FFB3C1" opacity="0.35" />
      <circle cx="140" cy="112" r="8" fill="#FFB3C1" opacity="0.35" />
    </motion.svg>
  );
};
