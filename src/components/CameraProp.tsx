import { motion } from 'motion/react';

// ============================================================
// Camera prop overlay - decorative hats/props that match the story scene.
// A prop only appears during the matching scene (never everywhere), so it
// feels like "dressing up for the moment" rather than a permanent overlay.
// ============================================================
export type PropKind = 'hardhat' | 'chef' | 'party' | 'mask' | null;

function PropSvg({ kind }: { kind: Exclude<PropKind, null> }) {
  if (kind === 'hardhat') {
    // 安全帽：推石头（journey）时佩戴
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="xMidYMin meet">
        <ellipse cx="50" cy="48" rx="46" ry="10" fill="#FBC02D" />
        <path d="M14 46 Q50 6 86 46 Z" fill="#FDD835" stroke="#F9A825" strokeWidth="2" />
        <rect x="10" y="42" width="80" height="8" rx="4" fill="#F9A825" />
        <path d="M50 14 L50 44" stroke="#F9A825" strokeWidth="2" opacity="0.6" />
      </svg>
    );
  }
  if (kind === 'chef') {
    // 厨师帽：喂果实（feeding）时佩戴
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 70" preserveAspectRatio="xMidYMin meet">
        <rect x="32" y="42" width="36" height="22" rx="4" fill="#FFFFFF" />
        <ellipse cx="40" cy="34" rx="18" ry="18" fill="#FFFFFF" />
        <ellipse cx="60" cy="34" rx="18" ry="18" fill="#FFFFFF" />
        <ellipse cx="50" cy="26" rx="20" ry="20" fill="#FFFFFF" />
        <rect x="32" y="58" width="36" height="6" fill="#E0E0E0" />
      </svg>
    );
  }
  if (kind === 'party') {
    // 派对帽：告别（farewell）时佩戴
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 80" preserveAspectRatio="xMidYMin meet">
        <path d="M50 8 L78 60 L22 60 Z" fill="#AB47BC" />
        <path d="M50 8 L50 60 M40 22 L60 22 M36 38 L64 38 M32 52 L68 52" stroke="#fff" strokeWidth="3" opacity="0.7" />
        <circle cx="50" cy="8" r="5" fill="#FFD54F" />
      </svg>
    );
  }
  // 口罩：备选
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="xMidYMin meet">
      <path d="M20 8 Q50 0 80 8 L78 34 Q50 42 22 34 Z" fill="#90CAF9" opacity="0.9" />
      <path d="M22 8 L20 40 M78 8 L80 40" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

export function CameraProp({ kind }: { kind: PropKind }) {
  if (!kind) return null;
  return (
    <motion.div
      className="absolute left-0 right-0 top-0 z-10 pointer-events-none flex justify-center"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 10 }}
      style={{ height: '55%' }}
    >
      <div style={{ width: '62%', height: '100%' }}>
        <PropSvg kind={kind} />
      </div>
    </motion.div>
  );
}
