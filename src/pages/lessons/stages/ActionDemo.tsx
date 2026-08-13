import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play } from 'lucide-react';
import Mascot from '../../../components/Mascot';
import { useParrotSpeech, playPop, type ParrotAnim } from '../../../hooks/useParrotSpeech';

// ============================================================
// ActionDemo —— 独立入口的动作演示。
// 任何角色（小鹦鹉/小狐狸/雪宝/小恐龙）逐条演示全部动作，
// 孩子可以自己点「下一个」慢慢看，左上角关闭返回。
// ============================================================

const PARADE: { anim: ParrotAnim; label: string; line: string; emoji: string }[] = [
  { anim: 'wave', label: 'Hi! 👋', line: 'Wave! Hi!', emoji: '👋' },
  { anim: 'clap', label: 'Yay! 👏', line: 'Clap clap clap!', emoji: '👏' },
  { anim: 'bounce', label: 'Jump! 🦘', line: 'Jump jump jump!', emoji: '🦘' },
  { anim: 'spin', label: 'Spin! 🌀', line: 'Spin spin spin!', emoji: '🌀' },
  { anim: 'dance', label: 'Dance! 🎵', line: 'Dance dance dance!', emoji: '🎵' },
  { anim: 'nod', label: 'Yes! 🙂', line: 'Nod nod, yes!', emoji: '🙂' },
  { anim: 'cheer', label: 'Hooray! 🎉', line: 'Hooray! Hooray!', emoji: '🎉' },
  { anim: 'hearts', label: 'Love! 💗', line: 'A kiss for you!', emoji: '💗' },
  { anim: 'shy', label: 'Shy! 😊', line: 'Hee hee, so shy!', emoji: '😊' },
  { anim: 'peek', label: 'Peekaboo! 🙈', line: 'Peek... a boo!', emoji: '🙈' },
  { anim: 'fly', label: 'Fly! 🕊️', line: 'I can fly!', emoji: '🕊️' },
  { anim: 'dizzy', label: 'Dizzy! 😵', line: 'Wheee... dizzy!', emoji: '😵' },
  { anim: 'happy', label: 'Yay! 😄', line: 'I am so happy!', emoji: '😄' },
  { anim: 'surprised', label: 'Wow! 😲', line: 'Wow! Surprise!', emoji: '😲' },
  { anim: 'excited', label: 'Cool! 🤩', line: 'Exciting fun!', emoji: '🤩' },
];

export default function ActionDemo({ character, onClose }: { character: 'parrot' | 'fox' | 'olaf' | 'dino'; onClose: () => void }) {
  const { setParrot, sayLines, resetSpeech } = useParrotSpeech();
  const [index, setIndex] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  useEffect(() => {
    resetSpeech();
    return () => resetSpeech();
  }, [resetSpeech]);

  const step = PARADE[index];
  useEffect(() => {
    if (!step) return;
    setParrot(step.anim);
    sayLines([step.line], undefined, 'en-US', step.anim);
    playPop();
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => {
    if (index >= PARADE.length - 1) {
      onClose();
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'linear-gradient(160deg,#FFE082,#FFCC80)' }}
    >
      {/* 关闭 */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-5 left-5 w-11 h-11 rounded-full bg-white/80 shadow-lg flex items-center justify-center z-20"
      >
        <X className="w-5 h-5 text-amber-800" />
      </motion.button>

      <div className="relative flex flex-col items-center justify-center w-full max-w-sm py-10">
        <motion.div
          key={index}
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="flex flex-col items-center"
        >
          <motion.div
            className="w-56 h-56 rounded-3xl bg-white/70 shadow-xl flex items-end justify-center pb-2"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Mascot state={step.anim} size={1} character={character} />
          </motion.div>

          <motion.div
            key={`text-${index}`}
            className="mt-4 px-6 py-3 rounded-2xl bg-white shadow-lg text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="text-2xl font-extrabold text-amber-800">{step.label}</p>
            <p className="text-sm text-amber-500 mt-0.5">Do it with me!</p>
          </motion.div>
        </motion.div>

        {/* 进度点 */}
        <div className="mt-5 flex items-center gap-1.5">
          {PARADE.map((s, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i <= index ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={goNext}
          className="mt-6 px-10 py-4 rounded-full text-white text-xl font-bold shadow-lg flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg,#42A5F5,#1E88E5)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          {index === PARADE.length - 1 ? (
            <>All done! ✓</>
          ) : (
            <>
              <Play className="w-5 h-5" /> Next
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}