import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';
import { Lock, ShoppingBag, ChevronRight, Sparkles, BookOpen, Users, Sun, Moon } from 'lucide-react';
import ParrotCharacter from '@/components/ParrotCharacter';
import FoxCharacter from '@/components/FoxCharacter';
import OlafCharacter from '@/components/OlafCharacter';

interface Character {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  accent: string;
  unlocked: boolean;
  section: 'mine' | 'recommend';
  component: React.ReactNode;
}

function GrayPlaceholder({ emoji }: { emoji: string }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ width: 192, height: 208 }}>
      <div className="relative w-48 h-52 flex items-center justify-center">
        <div className="w-36 h-40 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.08)' }}>
          <span className="text-6xl opacity-25">{emoji}</span>
        </div>
        <div className="absolute -bottom-1 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Lock className="w-4 h-4 text-white/20" />
        </div>
      </div>
    </div>
  );
}

const ALL_CHARACTERS: Character[] = [
  {
    id: 'parrot', name: '小鹦鹉', subtitle: '你的学习伙伴',
    color: '#1CB0F6', accent: 'rgba(28,176,246,0.12)', unlocked: true, section: 'mine',
    component: <ParrotCharacter state="idle" size={0.85} />,
  },
  {
    id: 'fox', name: '小狐狸', subtitle: '爱冒险的好奇宝宝',
    color: '#E87040', accent: 'rgba(232,112,64,0.12)', unlocked: true, section: 'mine',
    component: <FoxCharacter state="idle" size={0.85} />,
  },
  {
    id: 'olaf', name: '雪宝', subtitle: '温暖的雪人朋友',
    color: '#38BDF8', accent: 'rgba(56,189,248,0.12)', unlocked: true, section: 'mine',
    component: <OlafCharacter size={1} />,
  },
  {
    id: 'cat', name: '小猫咪', subtitle: '有艺术天赋的小可爱',
    color: '#FF6B9D', accent: 'rgba(255,107,157,0.12)', unlocked: false, section: 'recommend',
    component: <GrayPlaceholder emoji="🐱" />,
  },
  {
    id: 'rabbit', name: '小兔子', subtitle: '爱问为什么的小科学家',
    color: '#58CC02', accent: 'rgba(88,204,2,0.12)', unlocked: false, section: 'recommend',
    component: <GrayPlaceholder emoji="🐰" />,
  },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 11) return '早安';
  if (h < 13) return '午安';
  if (h < 18) return '下午好';
  if (h < 22) return '晚上好';
  return '夜深了';
};

const GREETINGS: Record<string, string[]> = {
  parrot: [
    "嗨！准备好一起学英语了吗？",
    "嘿呀！快来跟我一起玩吧！",
    "你来啦！今天一起探险吧！",
  ],
  fox: [
    "嘿嘿～想不想跟我去冒险？",
    "嘘！我发现一个超酷的秘密！",
    "终于来啦！快来快来！",
  ],
  olaf: [
    "嗨～朋友！见到你好开心！",
    "啊！是你呀！我好想你！",
    "来啦！我有好多故事讲给你听！",
  ],
};

export default function HomePageV2() {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(2);
  const [childName, setChildName] = useState('小朋友');
  const scrollRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark';
  });
  const [greetingActive, setGreetingActive] = useState(false);
  const [greetingText, setGreetingText] = useState('');
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greetingDurationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };

  const CARD_W = 220;
  const GAP = 16;
  const TOTAL = ALL_CHARACTERS.length;
  const [centerOffset, setCenterOffset] = useState(
    typeof window !== 'undefined' ? window.innerWidth / 2 - CARD_W / 2 : 180
  );

  useEffect(() => {
    const updateOffset = () => {
      setCenterOffset(window.innerWidth / 2 - CARD_W / 2);
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('child_name');
    if (stored) setChildName(stored);
    animate(x, centerOffset - 2 * (CARD_W + GAP), { type: 'spring', stiffness: 300, damping: 30, delay: 0.1 });
  }, [centerOffset]);

  useEffect(() => {
    setGreetingActive(false);
    if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
    if (greetingDurationRef.current) clearTimeout(greetingDurationRef.current);

    const char = ALL_CHARACTERS[selectedIdx];
    if (!char.unlocked || !GREETINGS[char.id]) return;

    greetingTimerRef.current = setTimeout(() => {
      const messages = GREETINGS[char.id];
      setGreetingText(messages[Math.floor(Math.random() * messages.length)]);
      setGreetingActive(true);

      greetingDurationRef.current = setTimeout(() => {
        setGreetingActive(false);
      }, 4000);
    }, 500);

    return () => {
      if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
      if (greetingDurationRef.current) clearTimeout(greetingDurationRef.current);
    };
  }, [selectedIdx]);

  const snapToIdx = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(TOTAL - 1, idx));
    setSelectedIdx(clamped);
    animate(x, centerOffset - clamped * (CARD_W + GAP), { type: 'spring', stiffness: 300, damping: 30 });
  }, [centerOffset, TOTAL]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const HOLD_DURATION = 1000;

  const startHoldTimer = useCallback(() => {
    holdStartTimeRef.current = Date.now();
    setHoldProgress(0);
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);
      if (progress >= 1) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        navigate('/shop');
      }
    }, 16);
  }, [navigate]);

  const stopHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  const handleDragEnd = useCallback((_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    stopHoldTimer();
    setIsDragging(false);
    setDragDirection(null);

    const currentX = x.get();
    const leftThreshold = centerOffset + CARD_W * 0.5;
    const rightThreshold = centerOffset - (TOTAL - 1) * (CARD_W + GAP) - CARD_W * 0.5;

    if (currentX > leftThreshold || currentX < rightThreshold) {
      return;
    }

    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    let newIdx: number;
    if (Math.abs(velocity) > 500 || Math.abs(offset) > CARD_W * 0.3) {
      newIdx = velocity < 0 || offset < 0 ? selectedIdx + 1 : selectedIdx - 1;
    } else {
      const nearestIdx = Math.round((centerOffset - currentX) / (CARD_W + GAP));
      newIdx = nearestIdx;
    }

    newIdx = Math.max(0, Math.min(TOTAL - 1, newIdx));
    snapToIdx(newIdx);
  }, [selectedIdx, x, CARD_W, GAP, TOTAL, centerOffset, snapToIdx, stopHoldTimer]);



  const selected = ALL_CHARACTERS[selectedIdx];

  const handleCardTap = useCallback((idx: number) => {
    if (idx !== selectedIdx) {
      snapToIdx(idx);
    }
  }, [selectedIdx, snapToIdx]);

  const renderCharacter = (char: Character, isGreetingActive: boolean) => {
    if (!char.unlocked) return char.component;
    const state = isGreetingActive ? 'greeting' : 'idle';
    switch (char.id) {
      case 'parrot': return <ParrotCharacter state={state} size={0.85} />;
      case 'fox': return <FoxCharacter state={state} size={0.85} />;
      case 'olaf': return <OlafCharacter size={1} />;
      default: return char.component;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050508]' : 'bg-gray-50'}`}>
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: theme === 'dark' ? [
              'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59,130,246,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168,85,247,0.2) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 50%)',
              'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(168,85,247,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 70% 60%, rgba(59,130,246,0.2) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 50% 50%, rgba(236,72,153,0.1) 0%, transparent 50%)',
              'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59,130,246,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168,85,247,0.2) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 50%)',
            ] : [
              'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59,130,246,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168,85,247,0.08) 0%, transparent 55%)',
              'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(168,85,247,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 70% 60%, rgba(59,130,246,0.08) 0%, transparent 55%)',
              'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59,130,246,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168,85,247,0.08) 0%, transparent 55%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: theme === 'dark' ? `
          linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
        ` : `
          linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />

      {/* Floating orbs */}
      {[
        { x: '20%', y: '25%', size: 150, color1: 'rgba(59,130,246,0.2)', color2: 'rgba(139,92,246,0.1)', delay: 0, duration: 8 },
        { x: '75%', y: '20%', size: 120, color1: 'rgba(168,85,247,0.2)', color2: 'rgba(236,72,153,0.1)', delay: 2, duration: 10 },
        { x: '65%', y: '70%', size: 130, color1: 'rgba(139,92,246,0.15)', color2: 'rgba(59,130,246,0.08)', delay: 1, duration: 9 },
        { x: '10%', y: '75%', size: 100, color1: 'rgba(236,72,153,0.12)', color2: 'rgba(168,85,247,0.06)', delay: 3, duration: 11 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color1} 0%, ${orb.color2} 40%, transparent 70%)`,
            filter: 'blur(25px)',
            willChange: 'transform',
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* Character glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse at 50% 35%, ${selected.accent} 0%, transparent 45%)`,
        }}
        transition={{ duration: 0.6 }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: theme === 'dark' 
          ? 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,8,0.8) 100%)'
          : 'radial-gradient(ellipse at center, transparent 40%, rgba(255,255,255,0.6) 100%)'
        }} />

      {/* ===== HEADER ===== */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-[22px] font-extrabold leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {getGreeting()}，{childName}
            </h1>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/35' : 'text-gray-500'}`}>今天想和谁一起玩？</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              }}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => navigate('/shop')}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <ShoppingBag className={`w-4.5 h-4.5 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ===== CAROUSEL ===== */}
      <div className="flex-1 flex flex-col justify-center py-4">
        {/* Scrollable track */}
        <div className="relative w-full overflow-visible" ref={scrollRef}>
          {/* Left pull ring progress */}
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
            animate={{ opacity: isDragging && dragDirection === 'left' ? 1 : 0, scale: isDragging && dragDirection === 'left' ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="3" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#A855F7" strokeWidth="3"
                  strokeDasharray={175.93}
                  strokeDashoffset={175.93 * (1 - holdProgress)}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/80">{Math.round(holdProgress * 100)}%</span>
              </div>
            </div>
          </motion.div>
          
          {/* Right pull ring progress */}
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
            animate={{ opacity: isDragging && dragDirection === 'right' ? 1 : 0, scale: isDragging && dragDirection === 'right' ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="3" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#A855F7" strokeWidth="3"
                  strokeDasharray={175.93}
                  strokeDashoffset={175.93 * (1 - holdProgress)}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/80">{Math.round(holdProgress * 100)}%</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center"
            style={{ x, gap: GAP }}
            drag="x"
            dragConstraints={{
              left: centerOffset - (TOTAL - 1) * (CARD_W + GAP) - CARD_W,
              right: centerOffset + CARD_W,
            }}
            dragElastic={0.3}
            onDragStart={() => {
              setIsDragging(true);
              setDragDirection(null);
              stopHoldTimer();
            }}
            onDrag={(_, info) => {
              const currentX = x.get();
              const leftEdge = centerOffset + CARD_W * 0.3;
              const rightEdge = centerOffset - (TOTAL - 1) * (CARD_W + GAP) - CARD_W * 0.3;

              if (currentX > leftEdge) {
                if (dragDirection !== 'left') {
                  setDragDirection('left');
                  startHoldTimer();
                }
              } else if (currentX < rightEdge) {
                if (dragDirection !== 'right') {
                  setDragDirection('right');
                  startHoldTimer();
                }
              } else {
                if (dragDirection) {
                  setDragDirection(null);
                  stopHoldTimer();
                }
              }
            }}
            onDragEnd={handleDragEnd}
          >
            {ALL_CHARACTERS.map((char, idx) => {
              const isActive = idx === selectedIdx;
              const isGreeting = isActive && greetingActive && char.unlocked;
              return (
                <motion.div
                  key={char.id}
                  className="flex-shrink-0 cursor-pointer relative"
                  style={{ 
                    width: CARD_W,
                    perspective: '600px',
                  }}
                  animate={{
                    scale: isActive ? 1 : 0.65,
                    opacity: isActive ? 1 : (char.unlocked ? 0.3 : 0.15),
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardTap(idx)}
                >
                  <AnimatePresence>
                    {isGreeting && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                        style={{ top: -10, width: 'max-content', maxWidth: 170 }}
                      >
                        <div 
                          className="rounded-2xl px-3 py-2 text-center shadow-lg backdrop-blur-sm"
                          style={{ 
                            background: theme === 'dark' ? 'rgba(20,20,30,0.9)' : 'rgba(255,255,255,0.95)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                            boxShadow: theme === 'dark' 
                              ? `0 4px 20px rgba(0,0,0,0.4), 0 0 30px ${char.color}15`
                              : `0 4px 20px rgba(0,0,0,0.1), 0 0 30px ${char.color}10`,
                          }}
                        >
                          <p className="text-[11px] font-medium leading-relaxed" style={{ 
                            color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)' 
                          }}>
                            {greetingText}
                          </p>
                        </div>
                        <div 
                          className="w-2.5 h-2.5 mx-auto rotate-45 -mt-1.5"
                          style={{ 
                            background: theme === 'dark' ? 'rgba(20,20,30,0.9)' : 'rgba(255,255,255,0.95)',
                            borderRight: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                            borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="relative rounded-[2rem] overflow-hidden flex flex-col items-center pt-8 pb-5"
                    style={{
                      background: isActive 
                        ? theme === 'dark' 
                          ? `linear-gradient(180deg, ${char.color}12 0%, ${char.accent} 50%, rgba(10,10,15,0.9) 100%)`
                          : `linear-gradient(180deg, ${char.color}15 0%, ${char.accent} 50%, rgba(255,255,255,0.95) 100%)`
                        : theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.15s ease-out, box-shadow 0.3s ease',
                      boxShadow: isActive 
                        ? `0 8px 32px ${char.color}15, 0 0 0 1px ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)'}`
                        : theme === 'dark' 
                          ? '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02)'
                          : '0 2px 8px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
                    }}
                    onMouseMove={(e) => {
                      if (!isActive) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const centerX = rect.width / 2;
                      const centerY = rect.height / 2;
                      const rotateX = ((y - centerY) / centerY) * -12;
                      const rotateY = ((x - centerX) / centerX) * 12;
                      const percentX = (x / rect.width) * 100;
                      const percentY = (y / rect.height) * 100;
                      e.currentTarget.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.08, 1.08, 1.08)`;
                      e.currentTarget.style.boxShadow = `0 20px 40px ${char.color}30, 0 0 60px ${char.color}15`;
                      e.currentTarget.style.setProperty('--mx', `${percentX}%`);
                      e.currentTarget.style.setProperty('--my', `${percentY}%`);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                      e.currentTarget.style.boxShadow = isActive 
                        ? `0 8px 32px ${char.color}15, 0 0 0 1px rgba(255,255,255,0.03)`
                        : '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02)';
                    }}
                  >
                    {/* Holographic shine overlay */}
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
                        style={{
                          background: `linear-gradient(110deg, 
                            rgba(255,0,102,0.05) 0%, 
                            rgba(0,255,153,0.06) 25%, 
                            rgba(0,102,255,0.05) 50%, 
                            rgba(255,204,0,0.05) 75%, 
                            rgba(255,0,102,0.05) 100%)`,
                          backgroundSize: '200% 200%',
                          mixBlendMode: 'color-dodge',
                          animation: 'shine 6s ease-in-out infinite',
                        }}
                      />
                    )}

                    {/* Subtle scanlines */}
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-[2rem] pointer-events-none z-10 opacity-20"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                          mixBlendMode: 'overlay',
                        }}
                      />
                    )}

                    {/* Border glow */}
                    {isActive && (
                      <>
                        <div
                          className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
                          style={{
                            border: `2px solid ${char.color}30`,
                            boxShadow: theme === 'dark' ? `
                              inset 0 1px 0 rgba(255,255,255,0.15),
                              inset 0 -1px 0 rgba(0,0,0,0.25),
                              inset 0 0 30px ${char.color}10,
                              0 0 25px ${char.color}20,
                              0 4px 24px rgba(0,0,0,0.4)
                            ` : `
                              inset 0 1px 0 rgba(255,255,255,0.8),
                              inset 0 -1px 0 rgba(0,0,0,0.05),
                              inset 0 0 30px ${char.color}08,
                              0 0 20px ${char.color}15,
                              0 4px 16px rgba(0,0,0,0.1)
                            `,
                          }}
                        />
                        <div
                          className="absolute inset-[-2px] rounded-[2rem] pointer-events-none z-10"
                          style={{
                            background: theme === 'dark'
                              ? `linear-gradient(135deg, 
                                  rgba(255,255,255,0.2) 0%, 
                                  rgba(255,255,255,0.05) 25%, 
                                  transparent 50%, 
                                  rgba(0,0,0,0.05) 75%, 
                                  rgba(0,0,0,0.15) 100%)`
                              : `linear-gradient(135deg, 
                                  rgba(255,255,255,0.9) 0%, 
                                  rgba(255,255,255,0.3) 25%, 
                                  transparent 50%, 
                                  rgba(0,0,0,0.02) 75%, 
                                  rgba(0,0,0,0.05) 100%)`,
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'exclude',
                            padding: '2px',
                          }}
                        />
                        <div
                          className="absolute inset-[-2px] rounded-[2rem] pointer-events-none z-10 opacity-60"
                          style={{
                            background: `linear-gradient(45deg, 
                              ${char.color}40 0%, 
                              transparent 30%, 
                              transparent 70%, 
                              ${char.color}30 100%)`,
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'exclude',
                            padding: '2px',
                            filter: 'blur(1px)',
                          }}
                        />
                      </>
                    )}
                    {!isActive && (
                      <div
                        className="absolute inset-0 rounded-[2rem] pointer-events-none"
                        style={{
                          border: theme === 'dark' ? '1.5px solid rgba(255,255,255,0.06)' : '1.5px solid rgba(0,0,0,0.08)',
                          boxShadow: theme === 'dark' 
                            ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 10px rgba(0,0,0,0.3)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      />
                    )}

                    {!isActive && (
                      <div
                        className="absolute inset-0 rounded-[2rem] pointer-events-none"
                        style={{ border: '1.5px solid rgba(255,255,255,0.04)' }}
                      />
                    )}
                    {/* Hover glow - follows mouse */}
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
                        style={{
                          background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.12) 0%, transparent 50%)`,
                          mixBlendMode: 'overlay',
                          opacity: 0.6,
                        }}
                      />
                    )}

                    {/* Recommend badge */}
                    {!char.unlocked && isActive && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full z-10"
                        style={{ 
                          background: theme === 'dark' ? 'rgba(255,149,0,0.2)' : 'rgba(255,149,0,0.15)', 
                          border: '1px solid rgba(255,149,0,0.3)' 
                        }}>
                        <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                        <span className="text-[9px] font-bold text-orange-400">推荐</span>
                      </div>
                    )}

                    {/* Owned badge */}
                    {char.unlocked && isActive && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full z-10"
                        style={{ 
                          background: theme === 'dark' ? `${char.color}25` : `${char.color}20`, 
                          border: `1px solid ${char.color}40` 
                        }}>
                        <span className="text-[9px] font-bold" style={{ color: char.color }}>已拥有</span>
                      </div>
                    )}

                    {/* Character */}
                    <div className="h-[200px] flex items-center justify-center -mt-2 relative z-10 px-2">
                      {renderCharacter(char, isGreeting)}
                    </div>

                    {/* Name */}
                    <div className="mt-3 text-center px-2 relative z-10">
                      <p className="text-[15px] font-extrabold" style={{ color: isActive ? (theme === 'dark' ? 'white' : '#1f2937') : 'rgba(128,128,128,0.3)' }}>
                        {char.name}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: isActive ? (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') : 'rgba(128,128,128,0.12)' }}>
                        {char.subtitle}
                      </p>
                    </div>

                    {/* Lock */}
                    {!char.unlocked && (
                      <div className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center z-10"
                        style={{ background: 'rgba(0,0,0,0.35)' }}>
                        <Lock className="w-3.5 h-3.5 text-white/30" />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Dots */}
        <div className="flex gap-1.5 justify-center mt-5 mb-4">
          {ALL_CHARACTERS.map((char, idx) => (
            <motion.button
              key={idx}
              onClick={() => snapToIdx(idx)}
              className="rounded-full"
              animate={{
                width: idx === selectedIdx ? 20 : 5,
                height: 5,
                background: idx === selectedIdx ? char.color : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          ))}
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <AnimatePresence mode="wait">
          {selected.unlocked ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-xs mx-auto px-6"
            >
                    <div className="flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/lessons')}
                        className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                        style={{
                          background: `linear-gradient(135deg, ${selected.color}, ${selected.color}CC)`,
                          boxShadow: `0 8px 32px ${selected.color}40`,
                          color: 'white',
                        }}
                      >
                        <BookOpen className="w-4 h-4" /> 一起学习
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/ai-parrot')}
                        className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                        style={{
                          background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          color: theme === 'dark' ? 'white' : '#1f2937',
                          border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                        }}
                      >
                  <Users className="w-4 h-4" /> 一起玩耍
                </motion.button>
              </div>
            </motion.div>
          ) : selected.section === 'recommend' ? (
            <motion.div
              key="recommend"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-xs mx-auto px-6"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/shop')}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${selected.color}CC, ${selected.color}88)`,
                  boxShadow: `0 8px 32px ${selected.color}30`,
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                解锁{selected.name}卡片
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="viewall"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-xs mx-auto px-6"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/characters')}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#A855F7', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                进入角色图鉴 →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs mx-auto px-6 mt-6"
        >
          <div className="grid grid-cols-3 gap-2">
            <div className={`rounded-xl py-2.5 px-2 text-center ${theme === 'dark' ? 'bg-white/3' : 'bg-black/5'}`}>
              <p className={`text-[10px] ${theme === 'dark' ? 'text-white/30' : 'text-gray-500'}`}>已学单词</p>
              <p className={`text-sm font-bold mt-0.5 ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>12</p>
            </div>
            <div className={`rounded-xl py-2.5 px-2 text-center ${theme === 'dark' ? 'bg-white/3' : 'bg-black/5'}`}>
              <p className={`text-[10px] ${theme === 'dark' ? 'text-white/30' : 'text-gray-500'}`}>今日打卡</p>
              <p className={`text-sm font-bold mt-0.5 ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>3天</p>
            </div>
            <div className={`rounded-xl py-2.5 px-2 text-center ${theme === 'dark' ? 'bg-white/3' : 'bg-black/5'}`}>
              <p className={`text-[10px] ${theme === 'dark' ? 'text-white/30' : 'text-gray-500'}`}>解锁角色</p>
              <p className={`text-sm font-bold mt-0.5 ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>1/5</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="h-6" />
    </div>
  );
}
