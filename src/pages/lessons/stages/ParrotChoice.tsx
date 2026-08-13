import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useParrotSpeech } from '../../../hooks/useParrotSpeech';

export type World = 'dino' | 'ant' | 'color';

const WORLDS: {
  id: World;
  emoji: string;
  title: string;
  desc: string;
  trail: string;
  bg: string;
}[] = [
  { id: 'dino', emoji: '🚀', title: 'Dino World', desc: 'Fly to Dino Planet!', trail: 'Fly!', bg: 'linear-gradient(135deg,#66BB6A,#2E7D32)' },
  { id: 'ant', emoji: '🐜', title: 'Ant Kingdom', desc: 'Shrink and explore!', trail: 'Shrink!', bg: 'linear-gradient(135deg,#AB47BC,#6A1B9A)' },
  { id: 'color', emoji: '🌈', title: 'Color Land', desc: 'Meet 6 colorful birds!', trail: 'Color!', bg: 'linear-gradient(135deg,#FFB74D,#EF6C00)' },
];

interface Props {
  onChoose: (w: World) => void;
}

// ============================================================
// STAGE 2 - 自主选目的地（打招呼后）
//   今天想去哪儿？恐龙世界（飞船）还是蚂蚁王国（缩小机器）？
//   让 3 岁幼儿自己做主点选，给小鹦鹉选好"下一站"。
//   只提供两个、每个只有一个名词，零压力点选。
// ============================================================
export function ParrotChoice({ onChoose }: Props) {
  const { setParrot, sayLines, resetSpeech } = useParrotSpeech();

  useEffect(() => {
    resetSpeech();
    setParrot('excited');
    sayLines(['Ready for our big adventure, Captain?', 'Where shall we go today?', 'The Dino World, or the tiny Ant Kingdom? You choose!'], undefined);
    return () => resetSpeech();
  }, [resetSpeech, sayLines, setParrot]);

  return (
    <motion.div
      key="choice"
      className="absolute inset-0 overflow-y-auto"
      style={{ background: '#FFF8E1' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative min-h-full flex flex-col items-center justify-center px-5 py-6">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-black text-amber-800">Where shall we go?</h1>
          <p className="text-base text-amber-500 mt-1 font-semibold">You choose!</p>
        </motion.div>

        <div className="w-full max-w-md flex flex-col gap-4">
          {WORLDS.map((w, i) => (
            <motion.button
              key={w.id}
              onClick={() => onChoose(w.id)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-4 rounded-3xl text-white p-5 shadow-lg text-left w-full"
              style={{ background: w.bg }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 14, delay: 0.12 * i }}
            >
              <span className="text-5xl">{w.emoji}</span>
              <span className="flex-1">
                <span className="block text-2xl font-black">{w.title}</span>
                <span className="block text-base text-white/85 mt-0.5">{w.desc}</span>
                <span className="inline-block mt-1.5 rounded-full bg-white/25 px-3 py-0.5 text-sm font-semibold">→ {w.trail}</span>
              </span>
            </motion.button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-amber-600/70 font-semibold">Parrot is with you! 🦜</p>
      </div>
    </motion.div>
  );
}