import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Mic, Palette, BookOpen, Film, Music, Theater, Gamepad2, Volume2, Sparkles, Loader2, Camera, Users, UserCircle, ArrowLeft, Languages } from 'lucide-react';
import AICharacter, { getCharacterName } from './AICharacter';

type ParrotState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'sleeping';
type ConversationState = 'listening' | 'thinking' | 'speaking';
type ModuleType = 'drawing' | 'storybook' | 'animation' | 'music' | 'roleplay' | 'assessment' | 'translate' | null;

interface AITeacherModeProps {
  onClose?: () => void;
  childName?: string;
}

const CONVERSATION_LABELS: Record<ConversationState, string> = {
  listening: '正在听…',
  thinking: '思考中…',
  speaking: '说话中…',
};

const CONVERSATION_COLORS: Record<ConversationState, string> = {
  listening: 'hsla(101, 94%, 40%, 0.8)',
  thinking: 'hsla(275, 62%, 60%, 0.8)',
  speaking: 'hsla(32, 100%, 55%, 0.8)',
};

const STATUS_LABELS: Record<ParrotState, string> = {
  idle: '等待中…',
  listening: '我在听…',
  thinking: '让我想想…',
  speaking: `${getCharacterName()}说…`,
  sleeping: '休息中… 点我唤醒',
};

const STATUS_COLORS: Record<ParrotState, string> = {
  idle: 'hsla(199, 92%, 54%, 0.8)',
  listening: 'hsla(101, 94%, 40%, 0.8)',
  thinking: 'hsla(275, 62%, 60%, 0.8)',
  speaking: 'hsla(32, 100%, 55%, 0.8)',
  sleeping: 'hsla(210, 10%, 48%, 0.6)',
};

interface ModuleInfo {
  key: ModuleType;
  icon: typeof Palette;
  label: string;
  color: string;
  intro: string;
}

const MODULES: ModuleInfo[] = [
  { key: 'translate', icon: Languages, label: '翻译', color: 'hsla(170, 70%, 45%, 0.9)', intro: '说中文，我来翻译成英文！🌈' },
  { key: 'drawing', icon: Palette, label: '画画', color: 'hsla(32, 100%, 55%, 0.9)', intro: '好呀！我们来画画吧！🎨' },
  { key: 'storybook', icon: BookOpen, label: '绘本', color: 'hsla(199, 92%, 54%, 0.9)', intro: '让我给你讲个有趣的故事！📖' },
  { key: 'animation', icon: Film, label: '动画', color: 'hsla(152, 60%, 48%, 0.9)', intro: '来看一段有趣的动画吧！🎬' },
  { key: 'music', icon: Music, label: '儿歌', color: 'hsla(275, 62%, 60%, 0.9)', intro: '一起来唱歌吧！🎵' },
  { key: 'roleplay', icon: Theater, label: '角色扮演', color: 'hsla(340, 75%, 58%, 0.9)', intro: '我们来玩角色扮演吧！🎭' },
  { key: 'assessment', icon: Gamepad2, label: '测评', color: 'hsla(48, 100%, 50%, 0.9)', intro: '来玩个小游戏！🎮' },
];

const WORD_EMOJIS: Record<string, string> = {
  Cat: '🐱', Car: '🚗', Cake: '🎂', Cup: '☕', Cow: '🐄',
  Dog: '🐶', Duck: '🦆', Deer: '🦌', Door: '🚪', Drum: '🥁',
  Fish: '🐟', Fox: '🦊', Frog: '🐸', Flower: '🌸', Fan: '🌀',
  Sun: '☀️', Star: '⭐', Snake: '🐍', Ship: '🚢', Sock: '🧦',
  Apple: '🍎', Ball: '⚽', Bear: '🐻', Bee: '🐝', Bird: '🐦',
  // Colors
  Sky: '🌤️', Ocean: '🌊', Blueberry: '🫐', Whale: '🐋', Rain: '🌧️',
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

// ========== "一起学习" style modules ==========

const AI_FEATURES = [
  { label: 'AI自主规划', icon: '🧠', color: 'hsla(275, 62%, 60%, 0.9)' },
  { label: '实时判断能力', icon: '⚡', color: 'hsla(199, 92%, 54%, 0.9)' },
  { label: '遗忘曲线思考', icon: '📈', color: 'hsla(152, 60%, 48%, 0.9)' },
  { label: '智能互动引导', icon: '✨', color: 'hsla(32, 100%, 55%, 0.9)' },
];

function AIFeatureCard() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % AI_FEATURES.length), 3000);
    return () => clearInterval(timer);
  }, []);
  const feat = AI_FEATURES[idx];
  return (
    <div className="relative h-7 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{
            background: `linear-gradient(135deg, ${feat.color.replace('0.9', '0.12')}, ${feat.color.replace('0.9', '0.04')})`,
            border: `1px solid ${feat.color.replace('0.9', '0.25')}`,
          }}
        >
          <span className="text-xs">{feat.icon}</span>
          <span className="text-[10px] font-semibold" style={{ color: feat.color }}>{feat.label}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AnimationModule({ onComplete }: { onComplete: () => void }) {
  const words = ['Cat', 'Dog', 'Fish'];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIdx(prev => {
        if (prev >= words.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [onComplete]);

  const currentWord = words[wordIdx];

  return (
    <div className="flex-1 flex flex-col">
      <div className="absolute top-14 right-4 z-10">
        <AICharacter state="speaking" size={0.3} />
      </div>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
        {[...Array(8)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{ left: `${10 + i * 12}%`, top: `${20 + i % 3 * 25}%` }}
            animate={{ y: [-20, 20], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }} />
        ))}
        <AnimatePresence mode="wait">
          <motion.div key={wordIdx}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 10 }}
            className="text-center z-10">
            <motion.span className="text-[100px] block mb-2"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}>
              {WORD_EMOJIS[currentWord] || '🌟'}
            </motion.span>
            <motion.p className="text-4xl font-extrabold text-white tracking-wide"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}>
              {currentWord}
            </motion.p>
            <p className="text-white/50 text-sm mt-2">
              {currentWord.split('').join(' - ')}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-6 flex gap-2">
          {words.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-500"
              style={{
                width: i === wordIdx ? 24 : 8, height: 8,
                background: i <= wordIdx ? '#4D96FF' : 'rgba(255,255,255,0.2)',
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EbookModule({ onComplete }: { onComplete: () => void }) {
  const pages = [
    { word: 'Cat', emoji: '🐱', story: '从前有一只小猫咪叫 Cat，它住在一个温暖的小房子里…' },
    { word: 'Dog', emoji: '🐶', story: '有一天，Cat 遇到了一只友好的小狗 Dog！它们成了好朋友。' },
    { word: 'Fish', emoji: '🐟', story: '它们一起去河边，看到了一条漂亮的 Fish 在水里游泳！🌊' },
  ];
  const [page, setPage] = useState(0);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => {
    setPage(p => {
      if (p < pages.length - 1) return p + 1;
      onComplete();
      return p;
    });
  }, [pages.length, onComplete]);

  useEffect(() => {
    autoTimer.current = setTimeout(goNext, 8000);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [page, goNext]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      goNext();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 relative overflow-hidden">
      <div className="mb-3">
        <AICharacter state="speaking" size={0.35} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={page}
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: 90, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.3}
          onDragEnd={handleDragEnd}
          className="w-full max-w-sm glass-strong rounded-3xl p-8 flex flex-col items-center justify-center gap-5 cursor-grab active:cursor-grabbing"
          style={{ minHeight: '45vh', boxShadow: '8px 4px 20px rgba(0,0,0,0.1)' }}>
          <div className="absolute top-4 right-4 flex gap-1">
            {pages.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full"
                style={{ background: i <= page ? '#4D96FF' : 'hsl(var(--muted))' }} />
            ))}
          </div>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
            className="text-[100px] leading-none">
            {pages[page].emoji}
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-extrabold" style={{ color: '#4D96FF' }}>
            {pages[page].word}
          </motion.h2>
          <p className="text-sm text-muted-foreground text-center leading-relaxed px-2">
            {pages[page].story}
          </p>
          <motion.div className="absolute bottom-4 text-xs text-muted-foreground flex items-center gap-1"
            animate={{ x: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            👈 滑动翻页
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MusicModule({ onComplete }: { onComplete: () => void }) {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1500);
          return 100;
        }
        return p + 1;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [playing, onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3"
      style={{ background: 'linear-gradient(180deg, hsla(275, 62%, 60%, 0.08) 0%, hsla(275, 62%, 60%, 0.02) 100%)' }}>
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-foreground">🎵 Twinkle Twinkle Little Star</h3>
        <p className="text-xs text-muted-foreground">{getCharacterName()}正在唱歌…</p>
      </div>
      <div className="relative w-full h-10 flex items-center justify-center">
        {['🎵', '🎶', '🎵', '✨', '🎶'].map((note, i) => (
          <motion.span key={i} className="absolute text-2xl"
            style={{ left: `${15 + i * 16}%` }}
            animate={{ y: [-10, -30, -10], opacity: [0.4, 1, 0.4], x: [0, (i % 2 ? 8 : -8), 0] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}>
            {note}
          </motion.span>
        ))}
      </div>
      {playing && (
        <div className="flex items-end gap-1 h-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i} className="w-1 rounded-full"
              style={{ background: 'hsla(275, 62%, 60%, 0.5)' }}
              animate={{ height: [4, 14 + Math.random() * 18, 4] }}
              transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }} />
          ))}
        </div>
      )}
      <div className="w-full max-w-xs">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ width: `${progress}%`, background: 'hsla(275, 62%, 60%, 0.8)' }} />
        </div>
      </div>
    </div>
  );
}

// ========== "一起玩耍" style modules ==========

function DrawingModule({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#A855F7'];

  const guideShapes = [
    { name: '香蕉', emoji: '🍌', draw: (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
      const s = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - 50 * s, cy + 10 * s);
      ctx.bezierCurveTo(cx - 40 * s, cy - 50 * s, cx + 40 * s, cy - 50 * s, cx + 50 * s, cy + 10 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 50 * s, cy + 10 * s);
      ctx.bezierCurveTo(cx - 35 * s, cy - 20 * s, cx + 35 * s, cy - 20 * s, cx + 50 * s, cy + 10 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 50 * s, cy + 10 * s);
      ctx.bezierCurveTo(cx + 55 * s, cy + 5 * s, cx + 58 * s, cy + 2 * s, cx + 55 * s, cy - 2 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 50 * s, cy + 10 * s);
      ctx.bezierCurveTo(cx - 55 * s, cy + 15 * s, cx - 56 * s, cy + 18 * s, cx - 53 * s, cy + 20 * s);
      ctx.stroke();
    }},
    { name: '大象', emoji: '🐘', draw: (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
      const s = 2.0;
      ctx.beginPath();
      ctx.ellipse(cx + 5 * s, cy + 5 * s, 50 * s, 35 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 50 * s, cy - 15 * s, 25 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 42 * s, cy - 20 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 70 * s, cy - 5 * s);
      ctx.bezierCurveTo(cx - 85 * s, cy + 10 * s, cx - 80 * s, cy + 35 * s, cx - 70 * s, cy + 45 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx - 65 * s, cy - 10 * s, 15 * s, 22 * s, -0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(cx - 25 * s, cy + 30 * s, 14 * s, 30 * s);
      ctx.strokeRect(cx - 8 * s, cy + 30 * s, 14 * s, 30 * s);
      ctx.strokeRect(cx + 25 * s, cy + 30 * s, 14 * s, 30 * s);
      ctx.strokeRect(cx + 42 * s, cy + 30 * s, 14 * s, 30 * s);
      ctx.beginPath();
      ctx.moveTo(cx + 55 * s, cy);
      ctx.bezierCurveTo(cx + 65 * s, cy - 10 * s, cx + 70 * s, cy - 5 * s, cx + 68 * s, cy + 5 * s);
      ctx.stroke();
    }},
    { name: '蝴蝶', emoji: '🦋', draw: (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
      const s = 2.0;
      ctx.beginPath();
      ctx.ellipse(cx - 30 * s, cy - 18 * s, 30 * s, 22 * s, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx - 25 * s, cy + 18 * s, 22 * s, 16 * s, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 30 * s, cy - 18 * s, 30 * s, 22 * s, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 25 * s, cy + 18 * s, 22 * s, 16 * s, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 5 * s, 30 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 3 * s, cy - 28 * s);
      ctx.bezierCurveTo(cx - 15 * s, cy - 50 * s, cx - 20 * s, cy - 55 * s, cx - 18 * s, cy - 58 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3 * s, cy - 28 * s);
      ctx.bezierCurveTo(cx + 15 * s, cy - 50 * s, cx + 20 * s, cy - 55 * s, cx + 18 * s, cy - 58 * s);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(cx - 18 * s, cy - 58 * s, 3 * s, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 18 * s, cy - 58 * s, 3 * s, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx - 30 * s, cy - 18 * s, 6 * s, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 30 * s, cy - 18 * s, 6 * s, 0, Math.PI * 2); ctx.stroke();
    }},
  ];
  const [guideIdx, setGuideIdx] = useState(() => Math.floor(Math.random() * guideShapes.length));
  const [drawingKey, setDrawingKey] = useState(0);

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
    // Store display size for coordinate mapping
    (c as any)._displayW = rect.width;
    (c as any)._displayH = rect.height;
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    guideShapes[guideIdx].draw(ctx, rect.width / 2, rect.height / 2);
    ctx.setLineDash([]);
  }, [drawingKey]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const c = canvasRef.current;
    if (!c) return null;
    const rect = c.getBoundingClientRect();
    const displayW = (c as any)._displayW || rect.width;
    const displayH = (c as any)._displayH || rect.height;
    const scaleX = displayW / rect.width;
    const scaleY = displayH / rect.height;
    if ('touches' in e) return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    setDrawing(true); setHasDrawn(true);
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
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };
  const stopDraw = () => { setDrawing(false); lastPos.current = null; };

  const artworkDescriptions = [
    { en: 'A yummy banana, so yellow and sweet!', emoji: '🍌' },
    { en: 'A big friendly elephant with a long trunk!', emoji: '🐘' },
    { en: 'A beautiful butterfly with colorful wings!', emoji: '🦋' },
  ];
  const artworkDesc = artworkDescriptions[guideIdx];

  const handleComplete = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      setSaved(true);
    }, 3000);
  };

  if (saved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        {/* Artwork display - larger */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150 }}
          className="w-72 h-72 rounded-3xl overflow-hidden flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg, #FFF8F0, #F0F7FF, #F0FFF4)', border: '2px solid hsla(275, 62%, 60%, 0.15)', boxShadow: '0 12px 40px hsla(275, 62%, 60%, 0.15)' }}>
          <motion.span className="text-[120px]" initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}>
            {artworkDesc.emoji}
          </motion.span>
        </motion.div>

        {/* Stars */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="flex gap-1">
          {['⭐', '⭐', '⭐'].map((s, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.15 }} className="text-xl">{s}</motion.span>
          ))}
        </motion.div>

        {/* Parrot speaking the description */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex items-start gap-2 max-w-[300px]">
          <div className="flex-shrink-0 mt-1">
            <AICharacter state="speaking" size={0.25} />
          </div>
          <div className="rounded-2xl px-3 py-2 glass relative"
            style={{ background: 'rgba(255,255,255,0.8)' }}>
            <p className="text-xs text-foreground leading-relaxed italic">{artworkDesc.en}</p>
          </div>
        </motion.div>

        {/* Action buttons with icons for kids */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex gap-3 w-full max-w-[280px]">
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => {
              const nextIdx = (guideIdx + 1) % guideShapes.length;
              setGuideIdx(nextIdx);
              setSaved(false); setHasDrawn(false); setAiImageUrl(null); setDrawingKey(k => k + 1);
            }}
            className="flex-1 py-4 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1.5 glass"
            style={{ background: 'rgba(255,255,255,0.7)' }}>
            <span className="text-2xl">🎨</span>
            <span>继续画画</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="flex-1 py-4 rounded-2xl font-bold text-white text-sm flex flex-col items-center justify-center gap-1.5"
            style={{ background: 'var(--gradient-primary-btn)', boxShadow: '0 6px 20px hsla(152, 60%, 48%, 0.3)' }}>
            <span className="text-2xl">✅</span>
            <span>画好啦</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (aiGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
        <AICharacter state="thinking" size={0.5} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-8 h-8" style={{ color: 'hsla(275, 62%, 60%, 0.8)' }} />
        </motion.div>
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-foreground">{getCharacterName()}正在施展魔法…</p>
          <p className="text-xs text-muted-foreground">把你的画变成梦幻作品 ✨</p>
        </div>
        <motion.div className="flex gap-1">
          {[0,1,2].map(i => (
            <motion.div key={i} className="w-2 h-2 rounded-full"
              style={{ background: 'hsla(275, 62%, 60%, 0.6)' }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="px-4 py-2 flex items-center gap-2 w-full max-w-[min(100%,calc(100vh-220px))]">
        <AICharacter state="speaking" size={0.25} />
        <p className="text-xs text-muted-foreground">
          ✏️ 沿着虚线画一个 {guideShapes[guideIdx].name} 吧！
        </p>
      </div>
      <div className="rounded-2xl overflow-hidden relative mx-4"
        style={{
          border: '2px solid hsla(0,0%,0%,0.06)',
          aspectRatio: '1 / 1',
          width: 'min(calc(100vw - 32px), calc(100vh - 220px))',
          maxWidth: '500px',
        }}>
        <canvas ref={canvasRef} className="w-full h-full touch-none"
          onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={stopDraw}
          onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={stopDraw} />
      </div>
      <div className="flex items-center justify-between px-4 py-3 mt-3">
        <div className="flex gap-2">
          {colors.map((c, i) => (
            <motion.button key={c} whileTap={{ scale: 0.8 }}
              onClick={() => setColorIdx(i)}
              className="w-8 h-8 rounded-full"
              style={{
                background: c,
                border: i === colorIdx ? '3px solid white' : 'none',
                boxShadow: i === colorIdx ? `0 0 0 2px ${c}` : 'none',
              }} />
          ))}
        </div>
        {hasDrawn && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
            whileTap={{ scale: 0.9 }} onClick={handleComplete}
            className="px-5 py-2 rounded-full text-white text-sm font-bold"
            style={{ background: 'var(--gradient-primary-btn)' }}>
            完成 ✨
          </motion.button>
        )}
      </div>
    </div>
  );
}

// Roleplay module - with front camera
function RoleplayModule({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Open front camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setCameraReady(true);
        }
      })
      .catch(() => { /* camera not available */ });
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const scenes = [
    { emoji: '🍳', label: '厨房', role: '小厨师', bg: 'linear-gradient(180deg, #FFF8E1 0%, #FFECB3 100%)', bgEmojis: ['🍳', '🥄', '🧁', '🍰', '🥘'], dialogs: ['"欢迎来到小厨房！今天我们做蛋糕！"', '"先加入面粉… Flour! 再加鸡蛋… Egg!"', '"太棒了！蛋糕做好啦！Yummy! 🎂"'] },
    { emoji: '🏥', label: '医院', role: '小医生', bg: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)', bgEmojis: ['💊', '🩺', '🏥', '💉', '🩹'], dialogs: ['"你好医生！我肚子疼…"', '"让我检查一下… 你需要多喝水！Water!"', '"谢谢医生！I feel better now! 😊"'] },
    { emoji: '🌳', label: '公园', role: '探险家', bg: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)', bgEmojis: ['🌸', '🦋', '🌳', '🐿️', '🌺'], dialogs: ['"我们去公园探险吧！Let\'s go!"', '"看！一只蝴蝶！Butterfly! 🦋"', '"今天的探险真开心！Happy! 🎉"'] },
  ];
  const [sceneIdx] = useState(() => Math.floor(Math.random() * scenes.length));
  const [dialogIdx, setDialogIdx] = useState(0);
  const scene = scenes[sceneIdx];

  useEffect(() => {
    const timer = setInterval(() => {
      setDialogIdx(prev => {
        if (prev >= scene.dialogs.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 2500);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [scene.dialogs.length, onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: scene.bg }} />
      {scene.bgEmojis.map((e, i) => (
        <motion.span key={i} className="absolute text-3xl opacity-20"
          style={{ left: `${10 + i * 20}%`, top: `${10 + (i % 3) * 30}%` }}
          animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}>
          {e}
        </motion.span>
      ))}

      <div className="z-10">
        <AICharacter state="speaking" size={0.45} />
      </div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="glass-strong rounded-full px-5 py-2 flex items-center gap-2 z-10">
        <span className="text-2xl">{scene.emoji}</span>
        <span className="text-sm font-bold text-foreground">{scene.label} · {scene.role}</span>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={dialogIdx}
          initial={{ opacity: 0, y: 15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15 }}
          className="glass rounded-2xl px-6 py-4 max-w-[300px] text-center z-10"
          style={{ background: 'rgba(255,255,255,0.85)' }}>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {scene.dialogs[dialogIdx]}
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="text-[10px] text-muted-foreground z-10">🎭 {getCharacterName()}正在引导角色扮演…</p>

      {/* Front camera - bottom right */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="absolute bottom-5 right-5 z-20 rounded-2xl overflow-hidden shadow-lg"
        style={{
          width: 120, height: 160,
          border: '3px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 24px hsla(0,0%,0%,0.15)',
        }}>
        <video ref={videoRef} autoPlay playsInline muted
          className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'hsla(0,0%,0%,0.3)' }}>
            <Camera className="w-6 h-6 text-white/60" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

function AssessmentModule({ onComplete }: { onComplete: () => void }) {
  const questions = [
    { prompt: '这是什么？', emoji: '🐱', options: ['Cat', 'Dog', 'Bird'], answer: 'Cat' },
    { prompt: '听一听，选出 "Fish"', emoji: '🐟', options: ['Sun', 'Fish', 'Cup'], answer: 'Fish' },
    { prompt: '这个是…？', emoji: '🍎', options: ['Apple', 'Ball', 'Cake'], answer: 'Apple' },
  ];
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[qIdx];

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.answer) setScore(s => s + 1);
    setTimeout(() => {
      setSelected(null);
      if (qIdx < questions.length - 1) {
        setQIdx(i => i + 1);
      } else {
        setDone(true);
        setTimeout(onComplete, 3000);
      }
    }, 1500);
  };

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center space-y-2">
          <div className="flex justify-center gap-1">
            {Array.from({ length: score }).map((_, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: i * 0.2 }} className="text-3xl">⭐</motion.span>
            ))}
          </div>
          <p className="text-lg font-bold text-foreground">
            {score === 3 ? '太棒了！全对！🎉' : score >= 2 ? '很厉害！👏' : '继续加油！💪'}
          </p>
          <p className="text-sm text-muted-foreground">{score}/{questions.length} 题正确</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
      <AICharacter state="speaking" size={0.35} />
      <div className="glass rounded-2xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.8)' }}>
        <p className="text-sm font-medium text-foreground">{q.prompt}</p>
      </div>
      <motion.div key={qIdx} initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="text-[90px]">{q.emoji}</motion.div>
      <div className="flex gap-1">
        {Array.from({ length: score }).map((_, i) => (
          <span key={i} className="text-xl">⭐</span>
        ))}
      </div>
      <div className="w-full max-w-xs space-y-3">
        {q.options.map(opt => {
          const isCorrect = opt === q.answer;
          const isSelected = selected === opt;
          const showResult = selected !== null;
          return (
            <motion.button key={opt} whileTap={{ scale: 0.95 }} onClick={() => handleSelect(opt)}
              className="w-full h-14 rounded-2xl glass-strong flex items-center justify-center text-base font-bold gap-2"
              animate={showResult ? { scale: isCorrect ? 1.05 : isSelected ? 0.95 : 0.95, opacity: isCorrect ? 1 : 0.4 } : {}}
              style={{
                border: `2px solid ${showResult && isCorrect ? 'hsl(152, 60%, 48%)' : 'transparent'}`,
                background: showResult && isCorrect ? 'hsla(152, 60%, 48%, 0.1)' : showResult && isSelected && !isCorrect ? 'hsla(0,70%,60%,0.1)' : undefined,
              }}>
              <span className="text-xl">{WORD_EMOJIS[opt] || '🌟'}</span>
              {opt}
              {showResult && isCorrect && <span>✅</span>}
              {showResult && isSelected && !isCorrect && <span>❌</span>}
            </motion.button>
          );
        })}
      </div>
      <div className="flex gap-2">
        {questions.map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full" style={{
            background: i === qIdx ? 'hsl(25, 85%, 58%)' : i < qIdx ? 'hsl(152, 60%, 48%)' : 'hsl(0, 0%, 85%)',
          }} />
        ))}
      </div>
    </div>
  );
}

// ========== Translate Module ==========
const TRANSLATE_EXAMPLES: { cn: string; en: string; emoji: string; color: string }[] = [
  { cn: '我想吃苹果', en: 'I want to eat an apple.', emoji: '🍎', color: 'hsl(0, 75%, 55%)' },
  { cn: '今天天气真好', en: 'The weather is really nice today.', emoji: '☀️', color: 'hsl(42, 90%, 50%)' },
  { cn: '我喜欢小猫', en: 'I like kittens.', emoji: '🐱', color: 'hsl(30, 70%, 55%)' },
  { cn: '妈妈我爱你', en: 'Mommy, I love you.', emoji: '❤️', color: 'hsl(340, 80%, 55%)' },
  { cn: '我们去公园玩', en: "Let's go play in the park.", emoji: '🌳', color: 'hsl(130, 55%, 45%)' },
  { cn: '太阳出来了', en: 'The sun is coming out.', emoji: '🌞', color: 'hsl(42, 90%, 50%)' },
  { cn: '我想画画', en: 'I want to draw.', emoji: '🎨', color: 'hsl(280, 60%, 55%)' },
  { cn: '小鸟在唱歌', en: 'The bird is singing.', emoji: '🐦', color: 'hsl(199, 70%, 50%)' },
  { cn: '我好开心', en: 'I am so happy!', emoji: '😊', color: 'hsl(48, 95%, 50%)' },
  { cn: '这朵花真漂亮', en: 'This flower is so beautiful.', emoji: '🌸', color: 'hsl(330, 70%, 65%)' },
  { cn: '我想喝水', en: 'I want some water.', emoji: '💧', color: 'hsl(199, 85%, 50%)' },
  { cn: '月亮好圆啊', en: 'The moon is so round!', emoji: '🌙', color: 'hsl(48, 60%, 55%)' },
  { cn: '下雨了', en: "It's raining.", emoji: '🌧️', color: 'hsl(210, 50%, 55%)' },
  { cn: '我有一只小狗', en: 'I have a puppy.', emoji: '🐶', color: 'hsl(25, 65%, 50%)' },
  { cn: '蝴蝶飞走了', en: 'The butterfly flew away.', emoji: '🦋', color: 'hsl(270, 60%, 60%)' },
  { cn: '天上有彩虹', en: 'There is a rainbow in the sky.', emoji: '🌈', color: 'hsl(280, 55%, 55%)' },
];

function TranslateModule({ onComplete }: { onComplete: () => void }) {
  // phase: listening (hearing Chinese), translating (processing), showing (displaying English)
  const [phase, setPhase] = useState<'listening' | 'translating' | 'showing'>('listening');
  const [current, setCurrent] = useState<typeof TRANSLATE_EXAMPLES[0] | null>(null);
  const usedIdxRef = useRef<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getNextExample = useCallback(() => {
    if (usedIdxRef.current.size >= TRANSLATE_EXAMPLES.length) usedIdxRef.current.clear();
    let idx: number;
    do { idx = Math.floor(Math.random() * TRANSLATE_EXAMPLES.length); } while (usedIdxRef.current.has(idx));
    usedIdxRef.current.add(idx);
    return TRANSLATE_EXAMPLES[idx];
  }, []);

  const runCycle = useCallback(() => {
    // Start listening phase
    setPhase('listening');
    timerRef.current = setTimeout(() => {
      // "Heard" Chinese → pick example, show translating
      const example = getNextExample();
      setCurrent(example);
      setPhase('translating');
      timerRef.current = setTimeout(() => {
        // Show translation result
        setPhase('showing');
        // Keep showing, then loop back to listening for next sentence
        timerRef.current = setTimeout(() => runCycle(), 4000 + Math.random() * 1500);
      }, 1500 + Math.random() * 500);
    }, 2500 + Math.random() * 1000);
  }, [getNextExample]);

  useEffect(() => {
    runCycle();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [runCycle]);

  const renderColorfulSentence = (sentence: string, baseColor: string) => {
    const words = sentence.replace(/[.,!?]/g, '').split(' ');
    const hueMatch = baseColor.match(/hsl\((\d+)/);
    const baseHue = hueMatch ? parseInt(hueMatch[1]) : 200;

    return (
      <span className="inline-flex flex-wrap gap-x-2 gap-y-1 justify-center">
        {words.map((word, wi) => {
          const hue = (baseHue + wi * 35) % 360;
          return (
            <motion.span
              key={wi}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wi * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
              className="text-xl font-extrabold"
              style={{ color: `hsl(${hue}, 70%, 50%)` }}
            >
              {word}
            </motion.span>
          );
        })}
      </span>
    );
  };

  const parrotState = phase === 'listening' ? 'listening' : phase === 'translating' ? 'thinking' : 'speaking';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
      <AICharacter state={parrotState} size={0.6} />

      <div className="w-full max-w-sm glass rounded-3xl px-6 py-8 flex flex-col items-center gap-4"
        style={{ background: 'rgba(255,255,255,0.88)', minHeight: 160 }}>

        {/* Listening indicator */}
        {phase === 'listening' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.div className="w-3 h-3 rounded-full" style={{ background: 'hsla(101, 94%, 40%, 0.7)' }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }} />
              <span className="text-sm font-medium text-muted-foreground">正在聆听…说中文试试吧！</span>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <motion.div key={i} className="w-1.5 rounded-full"
                  style={{ background: 'hsla(170, 70%, 45%, 0.5)' }}
                  animate={{ height: [6, 16 + Math.random() * 12, 6] }}
                  transition={{ duration: 0.6 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.08 }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Translating indicator */}
        {phase === 'translating' && current && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: current.color }} />
            <span className="text-sm text-muted-foreground">翻译中…</span>
          </motion.div>
        )}

        {/* Translation result - stays visible during listening phase too (dimmed) */}
        {current && (phase === 'showing' || phase === 'listening') && (
          <div className="flex flex-col items-center gap-5 transition-opacity duration-400"
            style={{ opacity: phase === 'listening' ? 0.4 : 1 }}>
            <div className="text-5xl">{current.emoji}</div>
            <div className="text-center">{renderColorfulSentence(current.en, current.color)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== Module Container with Exit Button ==========
function ModuleContainer({ module, onClose }: { module: ModuleInfo; onClose: () => void }) {
  const Icon = module.icon;

  const renderContent = () => {
    switch (module.key) {
      case 'animation': return <AnimationModule onComplete={onClose} />;
      case 'storybook': return <EbookModule onComplete={onClose} />;
      case 'music': return <MusicModule onComplete={onClose} />;
      case 'drawing': return <DrawingModule onComplete={onClose} />;
      case 'roleplay': return <RoleplayModule onComplete={onClose} />;
      case 'assessment': return <AssessmentModule onComplete={onClose} />;
      case 'translate': return <TranslateModule onComplete={onClose} />;
      default: return null;
    }
  };

  const isMusic = module.key === 'music';
  const isDark = module.key === 'animation';

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 z-20 rounded-t-[32px] overflow-hidden flex flex-col"
      style={{
        top: isMusic ? '35%' : 0,
        borderRadius: isMusic ? '32px 32px 0 0' : 0,
        background: isDark ? '#1a1a2e' : 'var(--glass-bg)',
        backdropFilter: isDark ? 'none' : 'blur(30px)',
        WebkitBackdropFilter: isDark ? 'none' : 'blur(30px)',
        borderTop: isMusic ? '1px solid var(--glass-border)' : 'none',
        boxShadow: isMusic ? '0 -12px 40px hsla(0,0%,0%,0.1)' : 'none',
      }}
    >
      {isMusic && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" />
        </div>
      )}

      {/* Header with exit button */}
      <div className="flex items-center gap-3 px-5 py-3" style={{ paddingTop: isMusic ? undefined : 'max(env(safe-area-inset-top, 12px), 48px)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: module.color }}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold" style={{ color: isDark ? 'white' : undefined }}>{module.label}</h3>
        </div>
        {/* Exit button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(255,255,255,0.15)' : 'var(--glass-bg)',
            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--glass-border)',
          }}
        >
          <X className="w-4 h-4" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted-foreground))' }} />
        </motion.button>
      </div>

      {renderContent()}
    </motion.div>
  );
}

// ========== Main AI Teacher Mode ==========
export default function AITeacherMode({ onClose, childName: childNameProp }: AITeacherModeProps) {
  const [searchParams] = useSearchParams();
  const [childName, setChildNameState] = useState(childNameProp || '小朋友');

  // Set character from URL param
  useEffect(() => {
    const charParam = searchParams.get('character');
    if (charParam) {
      localStorage.setItem('selected_character', charParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!childNameProp) {
      const stored = localStorage.getItem('child_name');
      if (stored) setChildNameState(stored);
    }
  }, [childNameProp]);
  const [parrotState, setParrotState] = useState<ParrotState>('listening');
  const [conversationState, setConversationState] = useState<ConversationState>('listening');
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [talkMode, setTalkMode] = useState<'free' | 'push'>('free');
  const [isPushTalking, setIsPushTalking] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleInfo | null>(null);
  const [isRunningDemo, setIsRunningDemo] = useState(false);

  const roundCountRef = useRef(0);
  const cycleCountRef = useRef(0);

  const launchModule = useCallback((mod: ModuleInfo) => {
    setParrotState('speaking');
    setConversationState('speaking');
    setSpeechBubble(mod.intro);
    setTimeout(() => {
      setActiveModule(mod);
      setSpeechBubble(null);
    }, 2000);
  }, []);

  const closeModule = useCallback(() => {
    setActiveModule(null);
    setParrotState('speaking');
    setConversationState('speaking');
    setSpeechBubble('还想玩什么？告诉我吧！😊');
    setTimeout(() => {
      setSpeechBubble(null);
      setParrotState('listening');
      setConversationState('listening');
      setIsRunningDemo(false);
    }, 2500);
  }, []);

  // Conversation state auto-cycling with auto-launch every 2 rounds
  useEffect(() => {
    if (activeModule || isRunningDemo || talkMode === 'push') return;

    const cycle: ConversationState[] = ['listening', 'thinking', 'speaking'];
    let idx = 0;

    const timer = setInterval(() => {
      idx = (idx + 1) % cycle.length;
      const nextState = cycle[idx];
      setConversationState(nextState);
      setParrotState(nextState);

      if (idx === 0) {
        roundCountRef.current += 1;
        if (roundCountRef.current >= 2) {
          roundCountRef.current = 0;
          clearInterval(timer);
          const usedModules = cycleCountRef.current;
          const mod = MODULES[usedModules % MODULES.length];
          cycleCountRef.current += 1;
          setIsRunningDemo(true);
          setParrotState('thinking');
          setConversationState('thinking');
          setTimeout(() => launchModule(mod), 1500);
        }
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [activeModule, isRunningDemo, launchModule]);

  // Free talk: sleep after 30s of no interaction
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (talkMode !== 'free' || activeModule || isRunningDemo) {
      if (sleepTimerRef.current) { clearTimeout(sleepTimerRef.current); sleepTimerRef.current = null; }
      return;
    }
    // Reset timer whenever parrot state changes (activity)
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (parrotState === 'sleeping') return;
    sleepTimerRef.current = setTimeout(() => {
      setParrotState('sleeping');
      setConversationState('listening');
    }, 30000);
    return () => { if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current); };
  }, [talkMode, activeModule, isRunningDemo, parrotState]);

  const handlePushTalkEnd = useCallback(() => {
    if (!isPushTalking) return;
    setIsPushTalking(false);
    setParrotState('thinking');
    setConversationState('thinking');
    setTimeout(() => {
      setParrotState('speaking');
      setConversationState('speaking');
      roundCountRef.current += 1;
      if (roundCountRef.current >= 2) {
        roundCountRef.current = 0;
        const mod = MODULES[cycleCountRef.current % MODULES.length];
        cycleCountRef.current += 1;
        setTimeout(() => {
          setIsRunningDemo(true);
          setParrotState('thinking');
          setConversationState('thinking');
          setTimeout(() => launchModule(mod), 1500);
        }, 2500);
      } else {
        setTimeout(() => {
          setParrotState('listening');
          setConversationState('listening');
        }, 3000);
      }
    }, 1500);
  }, [isPushTalking, launchModule]);

  const startRandomDemo = useCallback(() => {
    if (isRunningDemo) return;
    setIsRunningDemo(true);
    const randomMod = MODULES[Math.floor(Math.random() * MODULES.length)];
    setParrotState('listening');
    setConversationState('listening');
    setSpeechBubble(null);
    setTimeout(() => { setParrotState('thinking'); setConversationState('thinking'); }, 1500);
    setTimeout(() => launchModule(randomMod), 3000);
  }, [isRunningDemo, launchModule]);

  const handleParrotTap = () => {
    if (parrotState === 'sleeping') { setParrotState('listening'); setConversationState('listening'); }
    else if (!isRunningDemo) startRandomDemo();
  };

  const handleModuleQuickTap = (mod: ModuleInfo) => {
    if (isRunningDemo) return;
    setIsRunningDemo(true);
    setParrotState('thinking');
    setConversationState('thinking');
    setSpeechBubble(null);
    setTimeout(() => launchModule(mod), 1200);
  };

  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 40%, hsla(199, 92%, 54%, 0.08) 0%, transparent 60%), radial-gradient(circle at 30% 80%, hsla(275, 62%, 60%, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsla(48, 100%, 55%, 0.08) 0%, transparent 50%), hsl(var(--background))',
      }}
    >
      {/* Top Bar */}
      <AnimatePresence>
        {!activeModule && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between px-5 pt-6 pb-2 z-30 relative"
          >
            <div className="flex items-center gap-2">
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate('/home-v3')}
                className="w-10 h-10 rounded-full glass flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </motion.button>
              <AIFeatureCard />
            </div>
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => navigate('/characters')}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, hsla(275, 62%, 60%, 0.18), hsla(199, 92%, 54%, 0.18))',
                border: '1.5px solid hsla(275, 62%, 60%, 0.3)',
                boxShadow: '0 2px 12px hsla(275, 62%, 60%, 0.12)',
              }}>
              <Users className="w-4 h-4" style={{ color: 'hsla(275, 62%, 60%, 0.9)' }} />
              <span className="text-xs font-bold" style={{ color: 'hsla(275, 62%, 60%, 0.9)' }}>选择角色</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Parrot */}
      <AnimatePresence>
        {!activeModule && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3, y: -200 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex-1 flex flex-col items-center justify-center relative px-6"
          >
            <motion.div className="absolute rounded-full blur-3xl"
              animate={{
                background: STATUS_COLORS[parrotState],
                scale: parrotState === 'speaking' ? [1, 1.15, 1] : parrotState === 'listening' ? [1, 1.1, 1] : 1,
              }}
              transition={{ background: { duration: 0.6 }, scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
              style={{ width: 280, height: 280, opacity: 0.15 }} />

            <AnimatePresence>
              {speechBubble && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="glass rounded-3xl px-6 py-4 max-w-xs mb-6 relative">
                  <p className="text-sm font-medium text-foreground leading-relaxed">{speechBubble}</p>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
                    style={{ background: 'var(--glass-bg)', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
              onClick={handleParrotTap} className="cursor-pointer">
              <AICharacter state={parrotState} size={1.4} />
            </motion.div>

            <motion.div key={parrotState} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <span className="text-sm font-semibold text-muted-foreground">{STATUS_LABELS[parrotState]}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Module Icons */}
      {!activeModule && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }} className="px-2 pb-2">
          <div className="flex justify-center gap-1 px-1">
            {MODULES.map(mod => {
              const Icon = mod.icon;
              return (
                <motion.button key={mod.key} whileTap={{ scale: 0.85 }}
                  onClick={() => handleModuleQuickTap(mod)}
                  className="flex flex-col items-center gap-1"
                  style={{ opacity: isRunningDemo ? 0.4 : 1 }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `${mod.color.replace('0.9', '0.12')}`,
                      border: `1px solid ${mod.color.replace('0.9', '0.2')}`,
                    }}>
                    <Icon className="w-5 h-5" style={{ color: mod.color }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{mod.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Bottom area: conversation indicator OR push-to-talk button */}
      {!activeModule && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }} className="pb-10 pt-2 flex items-center justify-center relative px-4">
          {/* Talk mode toggle - bottom left */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              setTalkMode(m => {
                const next = m === 'free' ? 'push' : 'free';
                if (next === 'push') { setParrotState('idle'); setConversationState('listening'); }
                else { setParrotState('listening'); setConversationState('listening'); }
                return next;
              });
              setIsPushTalking(false);
            }}
            className="absolute left-4 bottom-10 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'hsla(0,0%,0%,0.02)',
              border: '1px solid hsla(0,0%,0%,0.04)',
            }}
            title={talkMode === 'free' ? '自由对话' : '按住说话'}
          >
            {talkMode === 'free' ? (
              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <span className="text-[10px] text-muted-foreground font-bold">按住</span>
            )}
          </motion.button>

          {talkMode === 'free' ? (
            /* Free talk: show conversation state indicator */
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: CONVERSATION_COLORS[conversationState] }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={conversationState}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs font-medium"
                  style={{ color: CONVERSATION_COLORS[conversationState] }}
                >
                  {CONVERSATION_LABELS[conversationState]}
                </motion.span>
              </AnimatePresence>
              <div className="flex items-center gap-[2px]">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div key={i} className="w-[2px] rounded-full"
                    style={{ background: CONVERSATION_COLORS[conversationState] }}
                    animate={{ height: conversationState === 'thinking' ? [3, 5, 3] : [3, 8, 3] }}
                    transition={{ duration: conversationState === 'thinking' ? 1.2 : 0.5, repeat: Infinity, delay: i * 0.1 }} />
                ))}
              </div>
            </div>
          ) : (() => {
            const isBusy = parrotState === 'thinking' || parrotState === 'speaking';
            return (
            <motion.button
              onTouchStart={() => { if (isBusy) return; setIsPushTalking(true); setParrotState('listening'); setConversationState('listening'); }}
              onTouchEnd={handlePushTalkEnd}
              onMouseDown={() => { if (isBusy) return; setIsPushTalking(true); setParrotState('listening'); setConversationState('listening'); }}
              onMouseUp={handlePushTalkEnd}
              className="select-none flex items-center justify-center gap-2.5 rounded-full transition-all duration-200"
              style={{
                width: isPushTalking ? 240 : 180,
                height: isPushTalking ? 56 : 48,
                opacity: isBusy ? 0.45 : 1,
                pointerEvents: isBusy ? 'none' : 'auto',
                background: isPushTalking
                  ? 'linear-gradient(135deg, hsla(142, 40%, 52%, 0.95), hsla(146, 42%, 46%, 0.95))'
                  : isBusy
                    ? 'linear-gradient(135deg, hsla(142, 15%, 90%, 0.8), hsla(146, 12%, 86%, 0.75))'
                    : 'linear-gradient(135deg, hsla(142, 30%, 88%, 0.9), hsla(146, 25%, 82%, 0.85))',
                border: isPushTalking ? '2px solid hsla(142, 40%, 56%, 0.4)' : '1.5px solid hsla(142, 25%, 72%, 0.4)',
                boxShadow: isPushTalking
                  ? '0 6px 24px hsla(142, 40%, 50%, 0.35), inset 0 1px 0 hsla(0,0%,100%,0.2)'
                  : '0 2px 12px hsla(142, 25%, 70%, 0.15), inset 0 1px 0 hsla(0,0%,100%,0.6)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <motion.div
                animate={{ scale: isPushTalking ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.8, repeat: isPushTalking ? Infinity : 0 }}
              >
                <Mic className="w-[18px] h-[18px]" style={{ color: isPushTalking ? 'white' : 'hsla(142, 35%, 45%, 0.8)' }} />
              </motion.div>
              <span className="text-[13px] font-semibold tracking-wide" style={{ color: isPushTalking ? 'white' : 'hsla(142, 30%, 40%, 0.7)' }}>
                {isPushTalking ? '松开发送' : isBusy ? '请稍等...' : '按住说话'}
              </span>
              {isPushTalking && (
                <div className="flex items-center gap-[3px] ml-0.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div key={i} className="w-[2.5px] rounded-full bg-white/70"
                      animate={{ height: [4, 12, 4] }}
                      transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.1 }} />
                  ))}
                </div>
              )}
            </motion.button>
            );
          })()}
        </motion.div>
      )}

      {/* Big parrot above music module */}
      <AnimatePresence>
        {activeModule?.key === 'music' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-x-0 top-0 flex items-center justify-center z-10"
            style={{ height: '38%' }}
          >
            <AICharacter state="speaking" size={1.2} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module Overlay */}
      <AnimatePresence>
        {activeModule && (
          <ModuleContainer module={activeModule} onClose={closeModule} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
