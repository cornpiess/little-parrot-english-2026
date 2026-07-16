import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ChevronLeft, Headphones, Monitor, Cast, Mic, Play, Pause } from 'lucide-react';
import { useLearning, KNOWLEDGE_POINTS, KnowledgePoint } from '@/contexts/LearningContext';
import aiTutorImg from '@/assets/ai_tutor.png';

// ======== AI Teacher (PNG version) ========
function AITeacherImg({ size = 80, className = '' }: {size?: number;className?: string;}) {
  return (
    <motion.img
      src={aiTutorImg}
      alt="AI老师"
      className={`rounded-full object-cover object-top ${className}`}
      style={{ width: size, height: size, border: '3px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />);


}

// ======== Lesson Header ========
function LessonHeader({ knowledge, onExit, hideKnowledge }: {knowledge: KnowledgePoint;onExit: () => void;hideKnowledge?: boolean;}) {
  const [showExitDialog, setShowExitDialog] = useState(false);

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-10 pb-2">
        <motion.button
          onClick={() => setShowExitDialog(true)}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        {!hideKnowledge && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 glass-strong rounded-full px-4 py-2">
            <span className="text-lg font-extrabold" style={{ color: knowledge.color }}>{knowledge.topic}</span>
            <span className="text-xs text-muted-foreground font-medium">今日学习</span>
          </motion.div>
        )}
        {hideKnowledge && <div />}
      </div>

      {/* Exit confirmation dialog */}
      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-8"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowExitDialog(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-[280px] rounded-2xl p-6 space-y-4"
              style={{ background: 'hsl(var(--background))', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-bold text-foreground text-center">确认退出？</h3>
              <p className="text-sm text-muted-foreground text-center">AI老师会时刻记住你的学习进度哦~</p>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowExitDialog(false)}
                  className="flex-1 h-11 rounded-xl text-sm font-bold text-foreground"
                  style={{ background: 'hsl(var(--muted))' }}>
                  取消
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onExit}
                  className="flex-1 h-11 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'hsl(var(--destructive, 0 84% 60%))' }}>
                  退出
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>);
}

// ======== Types ========
type BlockType = 'animation' | 'ebook' | 'game' | 'drawing' | 'listen';

interface LessonBlock {
  type: BlockType;
  title: string;
  emoji: string;
  color: string;
  completed: boolean;
}

const WORD_EMOJIS: Record<string, string> = {
  Cat: '🐱', Car: '🚗', Cake: '🎂', Cup: '☕', Cow: '🐄',
  Ball: '⚽', Bear: '🐻', Bee: '🐝', Bird: '🐦', Bus: '🚌',
  Dog: '🐶', Duck: '🦆', Deer: '🦌', Door: '🚪', Drum: '🥁',
  Fish: '🐟', Fox: '🦊', Frog: '🐸', Flower: '🌸', Fan: '🌀',
  Sun: '☀️', Star: '⭐', Snake: '🐍', Ship: '🚢', Sock: '🧦',
  // Colors
  Apple: '🍎', Sky: '🌤️', Ocean: '🌊', Blueberry: '🫐', Whale: '🐋', Rain: '🌧️',
  Grass: '🌿', Tree: '🌲', Leaf: '🍃', Turtle: '🐢',
  'Fire truck': '🚒', Strawberry: '🍓', Tomato: '🍅', Rose: '🌹',
  // Animals
  Pig: '🐷', Chicken: '🐔', Horse: '🐴', Sheep: '🐑',
  Dolphin: '🐬', Octopus: '🐙',
  // Plants
  Sunflower: '🌻', Tulip: '🌷', Daisy: '🌼', Lily: '🪷',
  Oak: '🌳', Pine: '🌲', Maple: '🍁', Palm: '🌴', Willow: '🌿',
  // Food
  Banana: '🍌', Orange: '🍊', Grape: '🍇', Watermelon: '🍉',
  Carrot: '🥕', Broccoli: '🥦', Corn: '🌽', Potato: '🥔', Pumpkin: '🎃',
  // Shapes
  Circle: '⭕', Square: '🔲', Triangle: '🔺', Heart: '❤️',
};

function generateBlocks(): LessonBlock[] {
  // Fixed order: animation → ebook → game → drawing
  return [
    { type: 'animation', title: '趣味动画', emoji: '📺', color: '#4D96FF', completed: false },
    { type: 'ebook', title: '绘本故事', emoji: '📖', color: '#6BCB77', completed: false },
    { type: 'game', title: '互动游戏', emoji: '🎮', color: '#FFD93D', completed: false },
    { type: 'drawing', title: '画画时间', emoji: '🎨', color: '#A855F7', completed: false },
  ];
}

/** Pick exactly 2 words for today's lesson */
function getLessonWords(knowledge: KnowledgePoint): string[] {
  const shuffled = [...knowledge.words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

const FINISH_BLOCK = { emoji: '🌟', color: '#FF8C42', title: '完成' };

// ======== Rubik's Cube Transition ========
function CubeTransition({ blocks, currentIndex, onDone }: {blocks: LessonBlock[];currentIndex: number;onDone: () => void;}) {
  const [rotatePhase, setRotatePhase] = useState(0);
  const justCompleted = blocks[currentIndex];
  const nextBlock = currentIndex + 1 < blocks.length
    ? { emoji: blocks[currentIndex + 1].emoji, color: blocks[currentIndex + 1].color, title: blocks[currentIndex + 1].title }
    : FINISH_BLOCK;

  useEffect(() => {
    const t1 = setTimeout(() => setRotatePhase(1), 600);
    const t2 = setTimeout(() => setRotatePhase(2), 1800);
    const t3 = setTimeout(onDone, 3000);
    return () => {clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  }, [onDone]);

  const cubeSize = 160;
  const half = cubeSize / 2;

  function CubeFace({ emoji, color, style }: {emoji: string;color: string;style: React.CSSProperties;}) {
    return (
      <div className="absolute grid grid-cols-3 grid-rows-3 gap-[3px] p-[3px] rounded-2xl"
      style={{ width: cubeSize, height: cubeSize, background: '#FFFFFF', border: '3px solid #E5E7EB', boxShadow: '0 4px 0 #D1D5DB', backfaceVisibility: 'hidden', ...style }}>
        {Array.from({ length: 9 }).map((_, i) =>
        <motion.div key={i} className="rounded-lg flex items-center justify-center"
        style={{ background: color, boxShadow: `inset 0 -2px 0 rgba(0,0,0,0.15)` }}
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.03 }}>
            {i === 4 && <span className="text-2xl">{emoji}</span>}
          </motion.div>
        )}
      </div>);

  }

  const rotateX = rotatePhase >= 1 ? -90 : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--gradient-page)' }}>
      <motion.div className="absolute rounded-full"
      style={{ width: 300, height: 300, background: `radial-gradient(circle, ${nextBlock.color}30 0%, transparent 70%)` }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
      <div style={{ perspective: 800 }} className="mb-10">
        <motion.div style={{ width: cubeSize, height: cubeSize, transformStyle: 'preserve-3d', position: 'relative' }}
        animate={{ rotateX, scale: rotatePhase === 1 ? 1.1 : 1, rotateY: rotatePhase === 1 ? 15 : 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 60, duration: 1.2 }}>
          <CubeFace emoji={justCompleted.emoji} color={justCompleted.color} style={{ transform: `translateZ(${half}px)` }} />
          <CubeFace emoji={nextBlock.emoji} color={nextBlock.color} style={{ transform: `rotateX(90deg) translateZ(${half}px)` }} />
          <div className="absolute rounded-2xl" style={{ width: cubeSize, height: cubeSize, background: '#F3F4F6', border: '3px solid #E5E7EB', transform: `rotateX(-90deg) translateZ(${half}px)`, backfaceVisibility: 'hidden' }} />
        </motion.div>
      </div>
      <AnimatePresence>
        {rotatePhase >= 1 &&
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.p className="text-muted-foreground text-sm font-bold mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>接下来</motion.p>
            <motion.div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-background"
          style={{ border: `3px solid ${nextBlock.color}`, boxShadow: `0 4px 0 ${nextBlock.color}88` }}
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }}>
              <span className="text-3xl">{nextBlock.emoji}</span>
              <span className="font-extrabold text-lg text-foreground">{nextBlock.title}</span>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex gap-2">
        {blocks.map((b, i) =>
        <motion.div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
        style={{
          background: i <= currentIndex ? b.color : '#F3F4F6',
          boxShadow: i <= currentIndex ? `0 3px 0 ${b.color}99` : '0 3px 0 #E5E7EB',
          border: i === currentIndex ? '3px solid #FFFFFF' : 'none'
        }}
        animate={i === currentIndex ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.6, repeat: i === currentIndex ? Infinity : 0 }}>
            {b.emoji}
          </motion.div>
        )}
      </motion.div>
    </div>);

}

// ======== Listen-only block types (nursery rhymes only) ========
const LISTEN_BLOCKS: LessonBlock[] = [
  { type: 'listen', title: 'ABC Song', emoji: '🎵', color: '#4D96FF', completed: false },
  { type: 'listen', title: 'Twinkle Twinkle', emoji: '⭐', color: '#FFD93D', completed: false },
  { type: 'listen', title: 'Old MacDonald', emoji: '🐄', color: '#6BCB77', completed: false },
];


// ======== Pre-Lesson Confirmation Screen ========
function PreLessonScreen({ knowledge, lessonWords, onConfirm, onListenOnly, onExit }: {knowledge: KnowledgePoint;lessonWords: string[];onConfirm: () => void;onListenOnly: () => void;onExit: () => void;}) {
  const childName = localStorage.getItem('child_name') || '小朋友';
  const [isListening] = useState(true);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
    style={{ background: 'var(--gradient-page)' }}>
      {/* Back button */}
      <div className="absolute top-0 left-0 z-30 px-4 pt-10">
        <motion.button onClick={onExit} whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full glass-strong flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-lg md:max-w-xl flex flex-col items-center">
        {[...Array(6)].map((_, i) =>
          <motion.div key={i} className="absolute rounded-full opacity-15"
          style={{ width: 40 + i * 20, height: 40 + i * 20, background: knowledge.color, left: `${10 + i * 15}%`, top: `${10 + i * 12}%` }}
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }} />
          )}

        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', damping: 12 }}>
          <AITeacherImg size={120} />
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 glass rounded-2xl px-5 py-3 max-w-[280px] text-center"
            style={{ background: 'rgba(255,255,255,0.8)' }}>
          <p className="text-sm text-muted-foreground">
            {childName}，准备好了吗？直接跟老师说你想学什么吧～
          </p>
        </motion.div>

        {/* Knowledge card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-4 w-full max-w-xs glass-strong rounded-3xl p-5 space-y-4">
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">今日知识点</p>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
              className={`inline-block font-extrabold ${knowledge.category === 'letter' ? 'text-6xl' : 'text-3xl'}`} style={{ color: knowledge.color }}>
              {knowledge.topic}
            </motion.span>
            <div className="flex gap-4 justify-center">
              {lessonWords.map((w, i) =>
                <motion.div key={w} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.2, type: 'spring' }}
                className="flex flex-col items-center gap-1">
                  <span className="text-4xl">{WORD_EMOJIS[w] || '🌟'}</span>
                  <span className="text-xs font-bold text-foreground">{w}</span>
                </motion.div>
                )}
            </div>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>🤖 AI老师智能选择学习内容</span>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-6 w-full max-w-xs space-y-3">
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={onConfirm}
              className="flex-1 h-14 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
              style={{ background: 'var(--gradient-primary-btn)' }}>
              <Monitor className="w-5 h-5" /> 开始上课
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5"
              style={{
                background: 'linear-gradient(135deg, hsl(210, 75%, 55%), hsl(230, 70%, 60%))',
                boxShadow: '0 6px 20px hsla(210, 75%, 55%, 0.35)',
                border: '2px solid hsla(210, 80%, 70%, 0.4)',
              }}
              onClick={() => {/* TODO: screencast */}}>
              <Cast className="w-5 h-5 text-white" />
              <span className="text-[9px] text-white/90 font-bold">投屏</span>
            </motion.button>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onListenOnly}
            className="w-full h-12 rounded-2xl glass-strong font-bold text-sm text-foreground flex items-center justify-center gap-2"
            style={{ border: '2px solid hsl(var(--primary) / 0.3)' }}>
            <Headphones className="w-4 h-4" /> 纯听模式
          </motion.button>
        </motion.div>
        </div>
      </div>

      {/* Bottom listening wave */}
      <div className="w-full px-6 pb-8 pt-2 flex flex-col items-center gap-2">
        <span className="text-[11px] text-muted-foreground/70 font-medium tracking-wider">聆听中</span>
        <div className="flex items-center justify-center gap-[6px] h-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: `hsla(25, 85%, 58%, ${0.4 + i * 0.1})` }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>);

}

// ======== Animation Block (Auto-play, 2 words only) ========
function AnimationBlock({ words, knowledge, onComplete }: {words: string[];knowledge: KnowledgePoint;onComplete: () => void;}) {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIdx((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [words.length, onComplete]);

  const currentWord = words[Math.min(wordIdx, words.length - 1)];

  return (
    <div className="h-full flex flex-col items-center justify-center relative" style={{ background: '#000' }}>
      {/* 9:16 video player area, maximized within screen */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative overflow-hidden" style={{ aspectRatio: '9/16', height: '100%', maxWidth: '100%', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
          {[...Array(8)].map((_, i) =>
          <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{ left: `${10 + i * 12}%`, top: `${20 + i % 3 * 25}%` }}
          animate={{ y: [-20, 20], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }} />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={wordIdx} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, y: -50 }} transition={{ type: 'spring', damping: 10 }} className="text-center z-10">
                <motion.span className="text-[100px] block mb-2" animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}>
                  {WORD_EMOJIS[currentWord] || '🌟'}
                </motion.span>
                <motion.p className="text-4xl font-extrabold text-white tracking-wide"
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  {currentWord}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>);

}


// (SongBlock removed - no longer part of lesson flow)

// ======== Ebook Block (Swipe or auto-flip after 10s) ========
function EbookBlock({ words, knowledge, onComplete }: {words: string[];knowledge: KnowledgePoint;onComplete: () => void;}) {
  const [page, setPage] = useState(0);
  const pages = words.map((w) => ({ word: w, emoji: WORD_EMOJIS[w] || '🌟' }));
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => {
    setPage((p) => {
      if (p < pages.length - 1) return p + 1;
      onComplete();
      return p;
    });
  }, [pages.length, onComplete]);

  // Auto-flip after 10s
  useEffect(() => {
    autoTimer.current = setTimeout(goNext, 10000);
    return () => {if (autoTimer.current) clearTimeout(autoTimer.current);};
  }, [page, goNext]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      goNext();
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={page}
          initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: 90, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.3} onDragEnd={handleDragEnd}
          className="w-full max-w-sm glass-strong rounded-3xl p-8 flex flex-col items-center justify-center gap-6 cursor-grab active:cursor-grabbing"
          style={{ minHeight: '55vh', perspective: '1000px', boxShadow: '8px 4px 20px rgba(0,0,0,0.1)' }}>
            <div className="absolute top-4 right-4 flex gap-1">
              {pages.map((_, i) =>
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i <= page ? knowledge.color : 'hsl(var(--muted))' }} />
              )}
            </div>
            <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full" style={{ background: knowledge.color, opacity: 0.3 }} />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-[120px] leading-none">
              {pages[page].emoji}
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-4xl font-extrabold" style={{ color: knowledge.color }}>
              {pages[page].word}
            </motion.h2>
            {/* Swipe hint */}
            <motion.div className="absolute bottom-4 text-xs text-muted-foreground flex items-center gap-1"
            animate={{ x: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              👈 滑动翻页
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
          {pages.map((_, i) =>
          <motion.div key={i} className="rounded-full" layout
          style={{ width: i === page ? 20 : 8, height: 8, background: i <= page ? knowledge.color : 'hsl(var(--muted))' }} />
          )}
        </div>
      </div>
      <div className="h-[100px] flex items-center justify-center" style={{ background: 'var(--gradient-page)' }}>
        <AITeacherImg size={80} />
      </div>
    </div>);

}

// ======== Game Block (Tap to select answer) ========
function GameBlock({ words, knowledge, onComplete }: {words: string[];knowledge: KnowledgePoint;onComplete: () => void;}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const word = words[current];
  const emoji = WORD_EMOJIS[word] || '🌟';

  // Generate stable options once per question
  const [options] = useState(() => {
    return words.map((w) => {
      const wrong = KNOWLEDGE_POINTS.filter((k) => k.topic !== knowledge.topic).
      flatMap((k) => k.words).sort(() => Math.random() - 0.5).slice(0, 2);
      return [w, ...wrong].sort(() => Math.random() - 0.5);
    });
  });

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const isCorrect = opt === word;
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      setSelected(null);
      if (current < words.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        onComplete();
      }
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 relative overflow-hidden">
        <div className="absolute top-16 right-4 flex gap-1">
          {Array.from({ length: score }).map((_, i) =>
          <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">⭐</motion.span>
          )}
        </div>
        <motion.div key={current} initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} className="text-[90px]">
          {emoji}
        </motion.div>
        <div className="w-full space-y-3 max-w-xs">
          {(options[current] || [word]).map((opt) => {
            const isCorrect = opt === word;
            const isSelected = selected === opt;
            const showResult = selected !== null;
            return (
              <motion.button key={opt} whileTap={{ scale: 0.95 }} onClick={() => handleSelect(opt)}
              className="w-full h-16 rounded-2xl glass-strong flex items-center justify-center text-lg font-bold"
              animate={showResult ? { scale: isCorrect ? 1.05 : isSelected ? 0.95 : 0.95, opacity: isCorrect ? 1 : 0.4 } : {}}
              style={{
                border: `3px solid ${showResult && isCorrect ? knowledge.color : 'transparent'}`,
                background: showResult && isCorrect ? `${knowledge.color}15` : showResult && isSelected && !isCorrect ? 'hsla(0,70%,60%,0.1)' : undefined
              }}>
                <span className="text-2xl mr-2">{WORD_EMOJIS[opt] || '🌟'}</span>
                {opt}
                {showResult && isCorrect && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 text-xl">✅</motion.span>}
                {showResult && isSelected && !isCorrect && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 text-xl">❌</motion.span>}
              </motion.button>);

          })}
        </div>
      </div>
      <div className="h-[100px] flex items-center justify-center" style={{ background: 'var(--gradient-page)' }}>
        <AITeacherImg size={80} />
      </div>
    </div>);

}

// ======== Realistic apple drawing helper ========
function drawRealisticAppleOutline(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2 + h * 0.04;
  const r = Math.min(w, h) * 0.28;

  ctx.save();
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = '#B0BEC5';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Apple body — classic shape with top indent and bottom dimple
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.85); // top center (indent)
  // Left side
  ctx.bezierCurveTo(cx - r * 0.45, cy - r * 1.15, cx - r * 1.35, cy - r * 0.55, cx - r * 1.1, cy + r * 0.15);
  // Left bottom
  ctx.bezierCurveTo(cx - r * 0.9, cy + r * 0.75, cx - r * 0.45, cy + r * 1.1, cx - r * 0.05, cy + r * 1.02);
  // Bottom dimple
  ctx.bezierCurveTo(cx - r * 0.02, cy + r * 0.95, cx + r * 0.02, cy + r * 0.95, cx + r * 0.05, cy + r * 1.02);
  // Right bottom
  ctx.bezierCurveTo(cx + r * 0.45, cy + r * 1.1, cx + r * 0.9, cy + r * 0.75, cx + r * 1.1, cy + r * 0.15);
  // Right side
  ctx.bezierCurveTo(cx + r * 1.35, cy - r * 0.55, cx + r * 0.45, cy - r * 1.15, cx, cy - r * 0.85);
  ctx.closePath();
  ctx.stroke();

  // Stem (solid line)
  ctx.setLineDash([]);
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.85);
  ctx.bezierCurveTo(cx - r * 0.03, cy - r * 1.05, cx + r * 0.06, cy - r * 1.25, cx + r * 0.02, cy - r * 1.45);
  ctx.stroke();

  // Leaf (filled with outline)
  ctx.fillStyle = 'rgba(102, 187, 106, 0.2)';
  ctx.strokeStyle = '#66BB6A';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.04, cy - r * 1.18);
  ctx.bezierCurveTo(cx + r * 0.25, cy - r * 1.55, cx + r * 0.7, cy - r * 1.45, cx + r * 0.6, cy - r * 1.12);
  ctx.bezierCurveTo(cx + r * 0.5, cy - r * 0.92, cx + r * 0.18, cy - r * 0.98, cx + r * 0.04, cy - r * 1.18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Leaf center vein
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.08, cy - r * 1.18);
  ctx.bezierCurveTo(cx + r * 0.25, cy - r * 1.28, cx + r * 0.42, cy - r * 1.25, cx + r * 0.55, cy - r * 1.14);
  ctx.strokeStyle = '#66BB6A';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// ======== Drawing Block (Fixed apple, with AI teacher guidance) ========
function DrawingBlock({ knowledge, onComplete }: {knowledge: KnowledgePoint;onComplete: () => void;}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [showPraise, setShowPraise] = useState(false);
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#A855F7'];
  const lastPos = useRef<{x: number;y: number;} | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, rect.width, rect.height);
    drawRealisticAppleOutline(ctx, rect.width, rect.height);
  }, []);

  const handleAIGenerate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext('2d');
        if (ctx) {
          const rect = c.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          const cw = rect.width * dpr;
          const ch = rect.height * dpr;
          const acx = cw / 2;
          const acy = ch / 2 + ch * 0.04;
          const ar = Math.min(cw, ch) * 0.28;

          ctx.fillStyle = '#FFF8F0';
          ctx.fillRect(0, 0, cw, ch);

          const gradient = ctx.createRadialGradient(acx - ar * 0.3, acy - ar * 0.3, ar * 0.1, acx, acy, ar * 1.2);
          gradient.addColorStop(0, '#FF8A80');
          gradient.addColorStop(0.3, '#EF5350');
          gradient.addColorStop(0.7, '#D32F2F');
          gradient.addColorStop(1, '#B71C1C');

          ctx.beginPath();
          ctx.moveTo(acx, acy - ar * 0.85);
          ctx.bezierCurveTo(acx - ar * 0.45, acy - ar * 1.15, acx - ar * 1.35, acy - ar * 0.55, acx - ar * 1.1, acy + ar * 0.15);
          ctx.bezierCurveTo(acx - ar * 0.9, acy + ar * 0.75, acx - ar * 0.45, acy + ar * 1.1, acx - ar * 0.05, acy + ar * 1.02);
          ctx.bezierCurveTo(acx - ar * 0.02, acy + ar * 0.95, acx + ar * 0.02, acy + ar * 0.95, acx + ar * 0.05, acy + ar * 1.02);
          ctx.bezierCurveTo(acx + ar * 0.45, acy + ar * 1.1, acx + ar * 0.9, acy + ar * 0.75, acx + ar * 1.1, acy + ar * 0.15);
          ctx.bezierCurveTo(acx + ar * 1.35, acy - ar * 0.55, acx + ar * 0.45, acy - ar * 1.15, acx, acy - ar * 0.85);
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();

          // Highlight
          ctx.beginPath();
          ctx.ellipse(acx - ar * 0.4, acy - ar * 0.3, ar * 0.18, ar * 0.3, -0.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fill();

          // Stem
          ctx.strokeStyle = '#6D4C41';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(acx, acy - ar * 0.85);
          ctx.bezierCurveTo(acx - ar * 0.03, acy - ar * 1.05, acx + ar * 0.06, acy - ar * 1.25, acx + ar * 0.02, acy - ar * 1.45);
          ctx.stroke();

          // Leaf
          ctx.fillStyle = '#43A047';
          ctx.beginPath();
          ctx.moveTo(acx + ar * 0.04, acy - ar * 1.18);
          ctx.bezierCurveTo(acx + ar * 0.25, acy - ar * 1.55, acx + ar * 0.7, acy - ar * 1.45, acx + ar * 0.6, acy - ar * 1.12);
          ctx.bezierCurveTo(acx + ar * 0.5, acy - ar * 0.92, acx + ar * 0.18, acy - ar * 0.98, acx + ar * 0.04, acy - ar * 1.18);
          ctx.closePath();
          ctx.fill();

          for (let i = 0; i < 12; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * cw, Math.random() * ch, Math.random() * 6 + 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.2 + 0.05})`;
            ctx.fill();
          }
          setAiImageUrl(c.toDataURL());
        }
      }
      setAiGenerating(false);
      setShowPraise(true);
    }, 3000);
  };

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const c = canvasRef.current;
    if (!c) return null;
    const rect = c.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    setDrawing(true);
    setHasDrawn(true);
    lastPos.current = getPos(e);
  };

  const moveDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    if (!pos || !lastPos.current) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = colors[colorIdx];
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1;
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* AI Teacher — single guidance line, below header */}
      <div className="px-4 pt-16 pb-1">
        {!showPraise && !aiGenerating && (
          <motion.div className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <AITeacherImg size={36} />
            <div className="flex-1 glass-strong rounded-2xl rounded-bl-sm px-3 py-2">
              <p className="text-xs font-bold text-foreground">画一个苹果吧！🍎</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2">
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-lg relative" style={{ aspectRatio: '1' }}>
          <canvas ref={canvasRef} className="w-full h-full touch-none" style={{ display: 'block' }}
          onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={stopDraw} />
          <div className="absolute top-4 right-4 flex gap-2">
            {colors.map((c, i) =>
            <motion.button key={c} onClick={() => setColorIdx(i)}
            className="w-8 h-8 rounded-full" whileTap={{ scale: 0.85 }}
            style={{
              background: c,
              border: i === colorIdx ? '3px solid white' : '3px solid transparent',
              boxShadow: i === colorIdx ? `0 0 8px ${c}` : 'none'
            }}
            animate={i === colorIdx ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }} />
            )}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 flex flex-col items-center gap-2" style={{ background: 'var(--gradient-page)' }}>
        <AnimatePresence mode="wait">
          {aiGenerating &&
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="w-full max-w-xs py-3 rounded-2xl glass-strong flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-lg">✨</motion.span>
              <span className="text-sm font-bold text-muted-foreground">AI 正在创作精美画作...</span>
            </motion.div>
          }
          {showPraise && aiImageUrl && !aiGenerating &&
          <motion.div key="praise" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xs space-y-2">
            <motion.div className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <AITeacherImg size={44} />
              <div className="flex-1 glass-strong rounded-2xl rounded-bl-sm px-3 py-2">
                <p className="text-xs font-bold text-foreground">🎉 画得太棒了！</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">老师已经珍藏了你的画作 💎</p>
              </div>
            </motion.div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onComplete}
            className="w-full py-3 rounded-2xl font-bold text-primary-foreground text-sm flex items-center justify-center gap-2"
            style={{ background: 'var(--gradient-success-btn)', boxShadow: '0 8px 24px hsla(101, 94%, 40%, 0.3)' }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                🎉 完成啦
              </motion.button>
          </motion.div>
          }
          {hasDrawn && !aiGenerating && !aiImageUrl &&
          <motion.button key="generate" initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          whileTap={{ scale: 0.95 }} onClick={handleAIGenerate}
          className="w-full max-w-xs py-3 rounded-2xl font-bold text-primary-foreground text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, hsl(var(--pop-purple)), hsl(275, 62%, 48%))', boxShadow: '0 8px 24px hsla(275, 62%, 60%, 0.3)' }}>
              ✨ AI 生成精美画作
            </motion.button>
          }
        </AnimatePresence>
      </div>
    </div>);

}

// ======== Celebration ========
function CelebrationScreen({ knowledge, lessonWords, blocks, onHome }: {knowledge: KnowledgePoint;lessonWords: string[];blocks: LessonBlock[];onHome: () => void;}) {
  const confettiColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#A855F7', '#FF8C42'];

  useEffect(() => {
    const t = setTimeout(onHome, 12000);
    return () => clearTimeout(t);
  }, [onHome]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
    style={{ background: 'var(--gradient-page)' }}>
      {Array.from({ length: 40 }).map((_, i) =>
      <motion.div key={i} className="absolute rounded-sm"
      style={{ width: 6 + Math.random() * 6, height: 6 + Math.random() * 6, background: confettiColors[i % confettiColors.length], left: `${Math.random() * 100}%`, top: -20 }}
      animate={{ y: [0, window.innerHeight + 50], x: [0, (Math.random() - 0.5) * 150], rotate: [0, Math.random() * 720], opacity: [1, 1, 0] }}
      transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 3 }} />
      )}
      <div className="flex gap-2 mb-6">
        {blocks.map((block, idx) =>
        <motion.div key={idx} className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
        style={{ background: block.color, boxShadow: `inset 2px 2px 0 rgba(255,255,255,0.3), 0 0 12px ${block.color}40` }}
        initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3 + idx * 0.15, type: 'spring' }}>
            {block.emoji}
          </motion.div>
        )}
      </div>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5 }}>
        <AITeacherImg size={140} />
      </motion.div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2, type: 'spring' }} className="text-center space-y-3 mt-4">
        <h1 className="text-3xl font-extrabold text-foreground">🎉 太棒了！</h1>
        <div className="flex flex-wrap gap-4 justify-center mt-2">
          {lessonWords.map((w, i) =>
          <motion.span key={w} initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 2.5 + i * 0.15 }} className="text-5xl">
              {WORD_EMOJIS[w]}
            </motion.span>
          )}
        </div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 4 }}
      className="mt-6 text-xs text-muted-foreground">即将返回主页...</motion.p>
    </div>);

}

// ======== Listen Block (纯听模式 - looping nursery rhymes) ========
function ListenBlock({ block, words, knowledge, onComplete, isListenMode, allBlocks, currentIdx, onSwitchSong }: {block: LessonBlock;words: string[];knowledge: KnowledgePoint;onComplete: () => void;isListenMode?: boolean;allBlocks?: LessonBlock[];currentIdx?: number;onSwitchSong?: (idx: number) => void;}) {
  const [playing, setPlaying] = useState(true);
  const songDuration = 15; // seconds per song

  // Auto-advance to next song when done, loop forever in listen mode
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (isListenMode && onSwitchSong && allBlocks) {
        const nextIdx = ((currentIdx ?? 0) + 1) % allBlocks.length;
        onSwitchSong(nextIdx);
      } else {
        onComplete();
      }
    }, songDuration * 1000);
    return () => clearTimeout(timer);
  }, [playing, isListenMode, onSwitchSong, allBlocks, currentIdx, onComplete, songDuration]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Top area - album art style */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
        {/* Spinning disc */}
        <motion.div
          className="w-44 h-44 rounded-full flex items-center justify-center relative"
          style={{
            background: `conic-gradient(from 0deg, ${block.color}30, ${block.color}10, ${block.color}30, ${block.color}10, ${block.color}30)`,
            boxShadow: `0 8px 32px ${block.color}20`
          }}
          animate={playing ? { rotate: 360 } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
          
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: block.color, boxShadow: `0 0 20px ${block.color}40` }}>
            <span className="text-3xl text-white">🎵</span>
          </div>
          {[56, 64, 72, 80].map((r) =>
          <div key={r} className="absolute rounded-full border border-white/10"
          style={{ width: r * 2, height: r * 2 }} />
          )}
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-lg font-extrabold text-foreground">{block.title}</h2>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>知识点：</span>
            <div className="flex items-center gap-2">
              {words.map((w) => (
                <span key={w} className="flex items-center gap-1 text-sm font-bold text-foreground/80">
                  <span className="text-xl">{WORD_EMOJIS[w] || '🌟'}</span>
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Waveform - volume only, no progress */}
        <div className="flex items-center gap-[3px] h-8">
          {Array.from({ length: 24 }).map((_, i) =>
          <motion.div key={i} className="w-1 rounded-full"
          style={{ background: block.color }}
          animate={playing ? { height: [4, 8 + Math.random() * 20, 4] } : { height: 4 }}
          transition={playing ? { duration: 0.4 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.05 } : { duration: 0.3 }} />
          )}
        </div>

      </div>

      {/* Bottom controls - only play/pause */}
      <div className="px-8 pb-8 flex items-center justify-center">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPlaying(!playing)}
        className="w-16 h-16 rounded-full flex items-center justify-center text-white"
        style={{ background: block.color, boxShadow: `0 4px 20px ${block.color}40` }}>
          {playing ? <Pause className="w-7 h-7" fill="white" /> : <Play className="w-7 h-7 ml-1" fill="white" />}
        </motion.button>
      </div>
    </div>);

}

// ======== Block Renderer ========
function BlockRenderer({ block, words, knowledge, onComplete, isListenMode, allBlocks, currentIdx, onSwitchSong }: {block: LessonBlock;words: string[];knowledge: KnowledgePoint;onComplete: () => void;isListenMode?: boolean;allBlocks?: LessonBlock[];currentIdx?: number;onSwitchSong?: (idx: number) => void;}) {
  switch (block.type) {
    case 'animation':return <AnimationBlock words={words} knowledge={knowledge} onComplete={onComplete} />;
    case 'ebook':return <EbookBlock words={words} knowledge={knowledge} onComplete={onComplete} />;
    case 'game':return <GameBlock words={words} knowledge={knowledge} onComplete={onComplete} />;
    case 'drawing':return <DrawingBlock knowledge={knowledge} onComplete={onComplete} />;
    case 'listen':return <ListenBlock block={block} words={words} knowledge={knowledge} onComplete={onComplete} isListenMode={isListenMode} allBlocks={allBlocks} currentIdx={currentIdx} onSwitchSong={onSwitchSong} />;
  }
}

// ======== Main Lesson Flow ========
export default function LessonFlow() {
  const navigate = useNavigate();
  const { initializeLesson, todayKnowledge } = useLearning();
  const [phase, setPhase] = useState<'intro' | 'blocks' | 'transition' | 'done'>('intro');
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [lessonWords, setLessonWords] = useState<string[]>([]);

  useEffect(() => {initializeLesson();}, []);

  const knowledge = todayKnowledge || KNOWLEDGE_POINTS[0];

  useEffect(() => {
    if (todayKnowledge) {
      setLessonWords(getLessonWords(todayKnowledge));
    }
  }, [todayKnowledge]);

  const handleStart = useCallback(() => {
    setBlocks(generateBlocks());
    setPhase('blocks');
  }, []);

  const handleListenOnly = useCallback(() => {
    setBlocks(LISTEN_BLOCKS.map((b) => ({ ...b })));
    setPhase('blocks');
  }, []);

  const isListenOnly = blocks.length > 0 && blocks.every((b) => b.type === 'listen');

  // For listen mode: switch song directly without animation
  const handleSwitchSong = useCallback((idx: number) => {
    setCurrentBlock(idx);
  }, []);

  const handleBlockComplete = useCallback(() => {
    setBlocks((prev) => prev.map((b, i) => i === currentBlock ? { ...b, completed: true } : b));
    const maxIdx = blocks.length - 1;
    if (currentBlock < maxIdx) {
      if (isListenOnly) {
        // Listen mode loops are handled inside ListenBlock via onSwitchSong
        setCurrentBlock((c) => c + 1);
      } else {
        setPhase('transition');
      }
    } else {
      if (isListenOnly) {
        // Loop back to first song
        setCurrentBlock(0);
      } else {
        setPhase('done');
      }
    }
  }, [currentBlock, blocks.length, isListenOnly]);

  const handleTransitionDone = useCallback(() => {
    setCurrentBlock((c) => c + 1);
    setPhase('blocks');
  }, []);

  const handleExit = useCallback(() => {navigate('/home-v3');}, [navigate]);

  if (phase === 'intro') {
    return <PreLessonScreen knowledge={knowledge} lessonWords={lessonWords} onConfirm={handleStart} onListenOnly={handleListenOnly} onExit={handleExit} />;
  }

  if (phase === 'done') {
    return <CelebrationScreen knowledge={knowledge} lessonWords={lessonWords} blocks={blocks} onHome={handleExit} />;
  }

  if (phase === 'transition' && blocks.length > 0) {
    return <CubeTransition blocks={blocks} currentIndex={currentBlock} onDone={handleTransitionDone} />;
  }

  return (
    <div className="min-h-screen h-screen flex flex-col relative" style={{ background: 'var(--gradient-page)' }}>
      <LessonHeader knowledge={knowledge} onExit={handleExit} hideKnowledge={isListenOnly} />
      <div className="flex-1 flex flex-col pt-14 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto w-full">
        {isListenOnly ? (
          /* No AnimatePresence slide for listen mode - direct render */
          <div className="flex-1 flex flex-col" key={currentBlock}>
            {blocks[currentBlock] &&
            <BlockRenderer block={blocks[currentBlock]} words={lessonWords} knowledge={knowledge} onComplete={handleBlockComplete} isListenMode={true} allBlocks={blocks} currentIdx={currentBlock} onSwitchSong={handleSwitchSong} />
            }
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={currentBlock}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col">
              {blocks[currentBlock] &&
              <BlockRenderer block={blocks[currentBlock]} words={lessonWords} knowledge={knowledge} onComplete={handleBlockComplete} />
              }
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>);

}
