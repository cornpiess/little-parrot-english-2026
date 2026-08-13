import { motion } from 'motion/react';
import type { ColorDef } from './colorData';

// ============================================================
// Color Land 共享组件（彩色小鸟 / 气球 / 色块 / 大按钮 / 进度点）
// ============================================================

/** 彩色小鸟（SVG 手绘风，颜色参数化） */
export function ColorBird({ def, size = 1, showWing = true }: { def: ColorDef; size?: number; showWing?: boolean }) {
  return (
    <svg width={120 * size} height={120 * size} viewBox="0 0 120 120">
      <path d="M20 60 L4 44 L8 66 Z" fill={def.deep} />
      <ellipse cx="55" cy="78" rx="34" ry="26" fill={def.css} />
      <ellipse cx="62" cy="86" rx="20" ry="14" fill={def.light} />
      {showWing && (
        <motion.g
          animate={{ rotate: [0, -18, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '40px 74px' }}
        >
          <ellipse cx="40" cy="74" rx="18" ry="24" fill={def.deep} transform="rotate(-18 40 74)" />
        </motion.g>
      )}
      <circle cx="78" cy="44" r="24" fill={def.css} />
      <path d="M92 24 Q102 8 110 24 Q100 32 92 24 Z" fill={def.deep} />
      <circle cx="84" cy="40" r="6" fill="white" />
      <circle cx="87" cy="40" r="3" fill="#333" />
      <path d="M100 44 L116 48 L100 54 Z" fill="#FFA000" />
      <circle cx="74" cy="52" r="4.5" fill="#FF8A80" opacity="0.75" />
      <path d="M36 96 L52 92 L50 100 Z" fill="#E65100" opacity="0.5" />
      <path d="M70 96 L84 92 L82 100 Z" fill="#E65100" opacity="0.5" />
    </svg>
  );
}

/** 气球（可按 inflate 放大） */
export function Balloon({ def, size = 1, inflate = 1 }: { def: ColorDef; size?: number; inflate?: number }) {
  const s = 60 * size * inflate;
  return (
    <svg width={s} height={s * 1.25} viewBox="0 0 100 125">
      <ellipse cx="50" cy="52" rx="34" ry="44" fill={def.css} />
      <ellipse cx="36" cy="40" rx="10" ry="15" fill="white" opacity="0.4" />
      <path d="M42 92 L58 92 L50 104 Z" fill={def.deep} />
      <path d="M50 104 Q38 116 52 124" stroke="#B0BEC5" strokeWidth="2" fill="none" />
    </svg>
  );
}

/** 大色块卡片 */
export function ColorSwatch({ def, big = false }: { def: ColorDef; big?: boolean }) {
  return (
    <motion.div
      className={`rounded-2xl shadow-lg flex items-center justify-center ${big ? 'w-24 h-24' : 'w-16 h-16'}`}
      style={{ background: `linear-gradient(145deg, ${def.light}, ${def.css} 60%, ${def.deep})`, border: `3px solid ${def.deep}` }}
      whileTap={{ scale: 0.9 }}
    >
      <span className={`font-black text-white drop-shadow ${big ? 'text-lg' : 'text-[10px]'}`}>{def.word}</span>
    </motion.div>
  );
}

/** 进度圆点 */
export function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[...Array(total)].map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i <= index ? 'bg-blue-500' : 'bg-blue-200'}`} />
      ))}
    </div>
  );
}
