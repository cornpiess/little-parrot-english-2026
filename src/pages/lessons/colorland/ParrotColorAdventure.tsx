import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PartLeadIn } from './PartLeadIn';
import { PartPattern } from './PartPattern';
import { PartStory } from './PartStory';
import { PartChant } from './PartChant';
import { PartMovie } from './PartMovie';

// ============================================================
// Color Land（第三世界 · 颜色乐园）完整一课
// 依据 5 步教学法组织：
//   Part I  Lead-in     词汇导入（3 色小鸟）
//   Part II Pattern     Pattern Drills（3 大图 + 动作）
//   Part III Story      Story Time（《The Balloons》）
//   Part IV Chant       Grammar & Chant（卡片快问快答）
//   Part V Movie        Movie（唐老鸭刷漆）
// 幼儿看不懂文字，顶部只显示 5 个进度圆点，不显示任何标题。
// ============================================================

type LessonPart = 'leadin' | 'pattern' | 'story' | 'chant' | 'movie';

const PART_META: { id: LessonPart }[] = [
  { id: 'leadin' },
  { id: 'pattern' },
  { id: 'story' },
  { id: 'chant' },
  { id: 'movie' },
];

interface Props {
  onDone: () => void;
}

export default function ParrotColorAdventure({ onDone }: Props) {
  const [part, setPart] = useState<LessonPart>('leadin');
  const partIndex = PART_META.findIndex((p) => p.id === part);

  const toNext = () => {
    if (partIndex < PART_META.length - 1) setPart(PART_META[partIndex + 1].id);
    else onDone();
  };

  return (
    <motion.div
      key="color-land"
      className="absolute inset-0"
      style={{ background: 'linear-gradient(180deg,#E3F2FD,#FFF8E1)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 顶部整体进度条（只显示圆点，无文字） */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        {PART_META.map((p, i) => (
          <div
            key={p.id}
            className={`w-3 h-3 rounded-full shadow transition-colors ${
              i <= partIndex ? 'bg-amber-400' : 'bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* 当前 Part */}
      <div className="absolute inset-0 pt-8 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={part}
            className="w-full h-full"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35 }}
          >
            {part === 'leadin' && <PartLeadIn onDone={toNext} />}
            {part === 'pattern' && <PartPattern onDone={toNext} />}
            {part === 'story' && <PartStory onDone={toNext} />}
            {part === 'chant' && <PartChant onDone={toNext} />}
            {part === 'movie' && <PartMovie onDone={toNext} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}