import { motion } from 'motion/react';
import type { ColorDef } from './colorData';

// ============================================================
// Pattern Drills 用真实 SVG 物体（不再是纯 emoji）
// 每个物体都配上与动词对应的动作动画，让「画面有图、图会动」。
// 目前课程只学 3 个颜色，所以只保留 小鸟/青蛙/苹果 三个物体。
// ============================================================

/** 绿青蛙 · 唱歌（拿着麦克风，嘴巴一张一合） */
export function FrogSinging({ def, size = 1 }: { def: ColorDef; size?: number }) {
  return (
    <svg width={150 * size} height={130 * size} viewBox="0 0 150 130">
      {/* 身体 */}
      <ellipse cx="75" cy="95" rx="55" ry="30" fill={def.css} />
      {/* 头 */}
      <ellipse cx="75" cy="60" rx="45" ry="35" fill={def.css} />
      {/* 眼凸 */}
      <circle cx="50" cy="35" r="16" fill={def.css} />
      <circle cx="100" cy="35" r="16" fill={def.css} />
      <circle cx="50" cy="35" r="9" fill="white" />
      <circle cx="100" cy="35" r="9" fill="white" />
      <circle cx="52" cy="35" r="4.5" fill="#333" />
      <circle cx="102" cy="35" r="4.5" fill="#333" />
      {/* 唱歌的嘴（张开） */}
      <motion.g
        animate={{ scaleY: [1, 0.45, 1] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '75px 78px' }}
      >
        <path d="M45 74 Q75 100 105 74 Q75 82 45 74 Z" fill="#5D4037" />
        <path d="M50 78 Q75 88 100 78" stroke="#FF8A80" strokeWidth="2.5" fill="none" />
      </motion.g>
      {/* 腮红 */}
      <circle cx="32" cy="72" r="7" fill="#FF8A80" opacity="0.6" />
      <circle cx="118" cy="72" r="7" fill="#FF8A80" opacity="0.6" />
      {/* 麦克风（手举着） */}
      <line x1="105" y1="90" x2="118" y2="42" stroke="#607D8B" strokeWidth="4" strokeLinecap="round" />
      <circle cx="118" cy="36" r="9" fill="#37474F" />
      <rect x="115" y="34" width="6" height="12" rx="3" fill="#546E7A" />
      {/* 音符 */}
      {[
        { x: 30, y: 14, d: 0 },
        { x: 60, y: 4, d: 0.2 },
        { x: 90, y: 10, d: 0.4 },
      ].map((n, i) => (
        <motion.g key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity, delay: n.d }}>
          <text x={n.x} y={n.y} fontSize="16" fill="#37474F" fontWeight="bold">♪</text>
        </motion.g>
      ))}
      <text x="120" y="16" fontSize="16" fill="#EF5350" fontWeight="bold" opacity="0.8">♪</text>
    </svg>
  );
}

/** 红苹果 · 大笑（躺在沙发上，嘴巴大笑） */
export function AppleLaughing({ def, size = 1 }: { def: ColorDef; size?: number }) {
  return (
    <svg width={150 * size} height={140 * size} viewBox="0 0 150 140">
      {/* 沙发 */}
      <rect x="18" y="118" width="114" height="16" rx="8" fill="#A1887F" />
      <rect x="24" y="100" width="16" height="26" rx="8" fill="#8D6E63" />
      <rect x="110" y="100" width="16" height="26" rx="8" fill="#8D6E63" />
      {/* 苹果身体 */}
      <circle cx="75" cy="78" r="42" fill={def.css} />
      <ellipse cx="60" cy="66" rx="14" ry="18" fill="#FF8A80" opacity="0.5" />
      {/* 叶与茎 */}
      <path d="M75 40 Q80 26 72 20" stroke="#5D4037" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M75 40 Q60 28 52 36 Q66 40 75 40 Z" fill="#66BB6A" />
      {/* 大笑的嘴 */}
      <motion.g
        animate={{ scaleY: [1, 0.7, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '75px 92px' }}
      >
        <path d="M55 84 Q75 108 95 84 Q75 92 55 84 Z" fill="#5D4037" />
        <path d="M58 87 Q75 96 92 87" stroke="#FF8A80" strokeWidth="2.5" fill="none" />
      </motion.g>
      {/* 眯眼笑 */}
      <path d="M52 66 Q58 60 64 66" stroke="#4E342E" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M86 66 Q92 60 98 66" stroke="#4E342E" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* 腮红 */}
      <circle cx="48" cy="74" r="7" fill="#FF8A80" opacity="0.7" />
      <circle cx="102" cy="74" r="7" fill="#FF8A80" opacity="0.7" />
      {/* 笑的肢体 */}
      <motion.path d="M48 96 Q40 106 44 112" stroke="#B71C1C" strokeWidth="5" fill="none" strokeLinecap="round" animate={{ y: [0, 3, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
      <motion.path d="M102 96 Q110 106 106 112" stroke="#B71C1C" strokeWidth="5" fill="none" strokeLinecap="round" animate={{ y: [0, 3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
    </svg>
  );
}

/** 黄香蕉 · 跳舞（戴墨镜，扭动身体） */
