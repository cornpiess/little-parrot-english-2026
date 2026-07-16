import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import AICharacter from '@/components/AICharacter';

type Phase = 'greeting' | 'playing' | 'result';

interface Question {
  prompt: string;
  emoji: string;
  options: { label: string; emoji: string; correct: boolean }[];
}

const QUESTIONS: Question[] = [
  {
    prompt: '这是什么？',
    emoji: '🍎',
    options: [
      { label: 'Apple', emoji: '🍎', correct: true },
      { label: 'Banana', emoji: '🍌', correct: false },
      { label: 'Grape', emoji: '🍇', correct: false },
    ],
  },
  {
    prompt: '这是什么动物？',
    emoji: '🐱',
    options: [
      { label: 'Dog', emoji: '🐶', correct: false },
      { label: 'Cat', emoji: '🐱', correct: true },
      { label: 'Fish', emoji: '🐟', correct: false },
    ],
  },
  {
    prompt: '这是什么颜色？',
    emoji: '🔵',
    options: [
      { label: 'Red', emoji: '🔴', correct: false },
      { label: 'Blue', emoji: '🔵', correct: true },
      { label: 'Green', emoji: '🟢', correct: false },
    ],
  },
  {
    prompt: '数一数，有几个？⭐⭐⭐',
    emoji: '⭐',
    options: [
      { label: 'Two', emoji: '2️⃣', correct: false },
      { label: 'Three', emoji: '3️⃣', correct: true },
      { label: 'Four', emoji: '4️⃣', correct: false },
    ],
  },
];

export default function InitialAssessment() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('greeting');
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [childName, setChildName] = useState('小朋友');

  useEffect(() => {
    const stored = localStorage.getItem('child_name');
    if (stored) setChildName(stored);
  }, []);

  // Auto-start after greeting
  useEffect(() => {
    if (phase === 'greeting') {
      const t = setTimeout(() => setPhase('playing'), 3500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleSelect = (opt: { label: string; correct: boolean }) => {
    if (selected) return;
    setSelected(opt.label);
    if (opt.correct) setScore(s => s + 1);

    setTimeout(() => {
      setSelected(null);
      if (qIdx < QUESTIONS.length - 1) {
        setQIdx(i => i + 1);
      } else {
        setPhase('result');
      }
    }, 1500);
  };

  // Greeting phase
  if (phase === 'greeting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8"
        style={{
          background: 'radial-gradient(circle at 50% 40%, hsla(48, 100%, 55%, 0.1) 0%, transparent 60%), radial-gradient(circle at 30% 80%, hsla(199, 92%, 54%, 0.08) 0%, transparent 50%), hsl(var(--background))',
        }}>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}>
          <AICharacter state="speaking" size={1.2} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-3xl px-6 py-4 text-center max-w-xs"
          style={{
            background: 'rgba(255,255,255,0.8)',
            boxShadow: '0 4px 20px hsla(0,0%,0%,0.06)',
          }}>
          <p className="text-base font-bold text-foreground leading-relaxed">
            嗨 {childName}！👋
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            我是你的AI小伙伴！来玩个小游戏吧～
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="mt-6 flex items-center gap-2">
          <motion.div className="w-2 h-2 rounded-full"
            style={{ background: 'hsla(48, 100%, 50%, 0.8)' }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-xs text-muted-foreground">准备开始…</span>
        </motion.div>
      </div>
    );
  }

  // Result phase
  if (phase === 'result') {
    const level = score >= 3 ? '很棒' : score >= 2 ? '不错' : '刚起步';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 gap-5"
        style={{
          background: 'radial-gradient(circle at 50% 40%, hsla(152, 60%, 48%, 0.08) 0%, transparent 60%), hsl(var(--background))',
        }}>
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}>
          <AICharacter state="speaking" size={1} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2">
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: score }).map((_, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }} className="text-3xl">⭐</motion.span>
            ))}
          </div>
          <p className="text-xl font-extrabold text-foreground">{level}！答对了 {score}/{QUESTIONS.length} 题</p>
          <p className="text-sm text-muted-foreground">AI已经了解你的水平啦 🎉</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home-v3', { replace: true })}
          className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, hsla(152, 60%, 48%, 0.9), hsla(174, 60%, 50%, 0.9))',
            boxShadow: '0 6px 20px hsla(152, 60%, 48%, 0.3)',
          }}>
          开始学习吧！🚀
        </motion.button>
      </div>
    );
  }

  // Playing phase
  const q = QUESTIONS[qIdx];

  return (
    <div className="min-h-screen flex flex-col"
      style={{
        background: 'radial-gradient(circle at 50% 30%, hsla(48, 100%, 55%, 0.08) 0%, transparent 60%), hsl(var(--background))',
      }}>

      {/* Progress */}
      <div className="flex justify-center gap-2 pt-10 pb-3 px-6">
        {QUESTIONS.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full flex-1 transition-all duration-500"
            style={{
              background: i === qIdx ? 'hsla(48, 100%, 50%, 0.8)' : i < qIdx ? 'hsla(152, 60%, 48%, 0.6)' : 'hsl(var(--muted))',
            }} />
        ))}
      </div>

      {/* Parrot + question */}
      <div className="flex items-center gap-3 px-5 mb-4">
        <AICharacter state="speaking" size={0.35} />
        <motion.div key={qIdx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl rounded-bl-sm px-4 py-2.5"
          style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0 2px 10px hsla(0,0%,0%,0.05)' }}>
          <p className="text-sm font-medium text-foreground">{q.prompt}</p>
        </motion.div>
      </div>

      {/* Big emoji */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <AnimatePresence mode="wait">
          <motion.div key={qIdx}
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="text-[100px]">
            {q.emoji}
          </motion.div>
        </AnimatePresence>

        {/* Score stars */}
        {score > 0 && (
          <div className="flex gap-1">
            {Array.from({ length: score }).map((_, i) => (
              <span key={i} className="text-xl">⭐</span>
            ))}
          </div>
        )}

        {/* Options */}
        <div className="w-full max-w-xs space-y-3">
          {q.options.map(opt => {
            const isCorrect = opt.correct;
            const isSelected = selected === opt.label;
            const showResult = selected !== null;

            return (
              <motion.button key={opt.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(opt)}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-bold transition-all"
                animate={showResult ? {
                  scale: isCorrect ? 1.03 : isSelected ? 0.97 : 0.97,
                  opacity: isCorrect ? 1 : 0.4,
                } : {}}
                style={{
                  background: showResult && isCorrect
                    ? 'hsla(152, 60%, 48%, 0.12)'
                    : showResult && isSelected && !isCorrect
                    ? 'hsla(0, 70%, 60%, 0.1)'
                    : 'rgba(255,255,255,0.7)',
                  border: showResult && isCorrect
                    ? '2px solid hsla(152, 60%, 48%, 0.5)'
                    : '1.5px solid hsla(0,0%,0%,0.06)',
                  boxShadow: '0 2px 8px hsla(0,0%,0%,0.04)',
                  color: 'hsl(var(--foreground))',
                }}>
                <span className="text-2xl">{opt.emoji}</span>
                {opt.label}
                {showResult && isCorrect && <span>✅</span>}
                {showResult && isSelected && !isCorrect && <span>❌</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Question counter */}
      <div className="pb-8 pt-4 text-center">
        <span className="text-xs text-muted-foreground">{qIdx + 1} / {QUESTIONS.length}</span>
      </div>
    </div>
  );
}
