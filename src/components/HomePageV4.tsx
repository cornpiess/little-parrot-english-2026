import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';
import { Sparkles, Users, Sun, Moon, BookOpen } from 'lucide-react';
import { CHARACTER_STORIES, purchaseCharacter, subscribeCharacter } from '@/lib/characterState';
import ParrotCharacter from '@/components/ParrotCharacter';
import FoxCharacter from '@/components/FoxCharacter';
import OlafCharacter from '@/components/OlafCharacter';

import imgTeacher1 from '@/assets/1ebf0cda2cde974b5ed9ae6990f1305cc10602a8.webp';
import imgTeacher2 from '@/assets/18466f7d75c7f0003c756fab4f226f5acaf0b786.webp';
import imgTeacher3 from '@/assets/aeb3bf3332ef650a0757436b3785006b754ee466.webp';
import imgPartnerAllen from '@/assets/5f34b76305073c932c45e9a1ca6982a3b0701c51.webp';
import imgPartnerHarry from '@/assets/7f5840355d80debdd7cbea5b1b0cfcd8797475cf.webp';
import imgPartnerXizi from '@/assets/5beb9546513432ce9c4c07c79c92908956d92ffb.webp';
import imgPartnerBull from '@/assets/9ace1b69d6a8cf0749e3bc5affa90c3f4b1856da.webp';
import imgPartnerBred from '@/assets/865cc265587e2b67df878968a8f421d99f400e41.webp';
import imgPartnerCoco from '@/assets/adc9f9dc90a165002cdfaac86d27cb447763afc7.webp';

interface CharData {
  id: string; name: string; subtitle: string; color: string; accent: string; desc: string;
  component?: React.ReactNode; image?: string;
  owned: boolean;
}

const ALL_CHARS: CharData[] = [
  // Owned
  { id: 'parrot', name: '小鹦鹉', subtitle: '学习伙伴', color: '#1CB0F6', accent: 'rgba(28,176,246,0.12)', desc: '活泼 · 爱唱歌 · 快乐学英语', component: <ParrotCharacter state="idle" size={1} />, owned: true },
  { id: 'fox', name: '小狐狸', subtitle: '好奇宝宝', color: '#E87040', accent: 'rgba(232,112,64,0.12)', desc: '聪明 · 好奇 · 爱探险', component: <FoxCharacter state="idle" size={1} />, owned: true },
  { id: 'olaf', name: '雪宝', subtitle: '雪人朋友', color: '#38BDF8', accent: 'rgba(56,189,248,0.12)', desc: '温暖 · 友善 · 爱讲故事', component: <OlafCharacter size={1.2} />, owned: true },
  // Unowned — teachers
  { id: 'einstein', name: '爱因斯坦', subtitle: '科学家', color: '#58CC02', accent: 'rgba(88,204,2,0.12)', desc: '恐龙时代 · 动植物百科 · 太空探索', image: imgTeacher1, owned: false },
  { id: 'beethoven', name: '贝多芬', subtitle: '音乐家', color: '#1CB0F6', accent: 'rgba(28,176,246,0.12)', desc: '乐器启蒙 · 儿歌韵律', image: imgTeacher2, owned: false },
  { id: 'deer', name: '小鹿姐姐', subtitle: '幼儿教育专家', color: '#FF6B9D', accent: 'rgba(255,107,157,0.12)', desc: '行为引导 · 自我认知 · 情绪管理', image: imgTeacher3, owned: false },
  // Unowned — partners from V3
  { id: 'allen', name: 'Allen', subtitle: '美国', color: '#1CB0F6', accent: 'rgba(28,176,246,0.12)', desc: '阳光 · 运动 · 音乐', image: imgPartnerAllen, owned: false },
  { id: 'harry', name: 'Harry', subtitle: '英国', color: '#58CC02', accent: 'rgba(88,204,2,0.12)', desc: '绅士 · 阅读 · 下午茶', image: imgPartnerHarry, owned: false },
  { id: 'xizi', name: 'Xizi', subtitle: '日本', color: '#FF6B9D', accent: 'rgba(255,107,157,0.12)', desc: '可爱 · 画画 · 手工', image: imgPartnerXizi, owned: false },
  { id: 'bull', name: 'Bull', subtitle: '巴西', color: '#FF9500', accent: 'rgba(255,149,0,0.12)', desc: '热情 · 足球 · 开朗', image: imgPartnerBull, owned: false },
  { id: 'bred', name: 'Bred', subtitle: '中东', color: '#AF57DB', accent: 'rgba(175,87,219,0.12)', desc: '神秘 · 冒险 · 友善', image: imgPartnerBred, owned: false },
  { id: 'coco', name: 'Coco', subtitle: '小鹦鹉', color: '#58CC02', accent: 'rgba(88,204,2,0.12)', desc: '聪明 · 模仿 · 快乐', image: imgPartnerCoco, owned: false },
];

const GREETINGS: Record<string, string[]> = {
  parrot: ['嗨！准备好一起学英语了吗？', '嘿呀！快来跟我一起玩吧！', '你来啦！今天一起探险吧！'],
  fox: ['嘿嘿～想不想跟我去冒险？', '嘘！我发现一个超酷的秘密！', '终于来啦！快来快来！'],
  einstein: ['来吧，一起探索科学的奥秘！', '今天想了解恐龙还是太空呢？', '准备好开启知识之旅了吗？'],
  beethoven: ['来，我们一起唱首歌吧！', '准备好了吗？音乐时间到！', '今天想学什么旋律呢？'],
  deer: ['宝贝今天心情怎么样呀？', '来，我们一起做个小游戏吧！', '准备好了吗？开始今天的学习！'],
  olaf: ['嗨～朋友！见到你好开心！', '啊！是你呀！我好想你！', '来啦！我有好多故事讲给你听！'],
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return '夜深了'; if (h < 11) return '早安'; if (h < 13) return '午安';
  if (h < 18) return '下午好'; if (h < 22) return '晚上好'; return '夜深了';
};

/* ═══════════════════════════════════════
   Character Card — V2-style
   ═══════════════════════════════════════ */
function CharacterCard({ char, isActive, theme, onClick, compact }: {
  char: CharData; isActive: boolean; theme: 'dark' | 'light'; onClick?: () => void; compact?: boolean;
}) {
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const onMove = useCallback((cx: number, cy: number) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (cx - r.left) / r.width;
    const py = (cy - r.top) / r.height;
    setMx(px * 100);
    setMy(py * 100);
  }, []);

  const rotateX = hovered ? (my - 50) / 50 * -12 : 0;
  const rotateY = hovered ? (mx - 50) / 50 * 12 : 0;

  return (
    <div ref={ref}
      className="relative rounded-[2rem] overflow-hidden flex flex-col items-center cursor-pointer"
      style={{
        width: compact ? '100%' : 'min(280px, 75vw)',
        aspectRatio: '195 / 280',
        paddingTop: compact ? '2rem' : '2rem',
        paddingBottom: compact ? '0.75rem' : '1.25rem',
        background: isActive
          ? isDark
            ? `linear-gradient(180deg, ${char.color}12 0%, ${char.accent} 50%, rgba(10,10,15,0.9) 100%)`
            : `linear-gradient(180deg, ${char.color}15 0%, ${char.accent} 50%, rgba(255,255,255,0.95) 100%)`
          : isDark
            ? `linear-gradient(180deg, ${char.color}08 0%, ${char.accent} 50%, rgba(10,10,15,0.85) 100%)`
            : `linear-gradient(180deg, ${char.color}10 0%, ${char.color}06 50%, rgba(255,255,255,0.95) 100%)`,
        transformStyle: 'preserve-3d' as const,
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${hovered ? (compact ? 1.03 : 1.06) : 1},${hovered ? (compact ? 1.03 : 1.06) : 1},${hovered ? (compact ? 1.03 : 1.06) : 1})`,
        transition: hovered ? 'transform 0.15s ease-out, box-shadow 0.3s' : 'transform 0.5s cubic-bezier(.23,1,.32,1), box-shadow 0.3s',
        boxShadow: isActive
          ? `0 8px 32px ${char.color}15, 0 0 0 1px ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)'}`
          : isDark
            ? `0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px ${char.color}15`
            : `0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px ${char.color}10`,
        border: `1.5px solid ${char.color}${isActive ? '30' : '18'}`,
      }}
      onPointerMove={(e) => { setHovered(true); onMove(e.clientX, e.clientY); }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => { setHovered(false); setMx(50); setMy(50); }}
      onClick={onClick}
    >
      {/* Holographic shine */}
      {isActive && (
        <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
          style={{
            background: `linear-gradient(110deg, rgba(255,0,102,0.05), rgba(0,255,153,0.06), rgba(0,102,255,0.05), rgba(255,204,0,0.05), rgba(255,0,102,0.05))`,
            backgroundSize: '200% 200%',
            mixBlendMode: 'color-dodge',
            animation: 'shine 6s ease-in-out infinite',
          }} />
      )}

      {/* Scanlines */}
      {isActive && (
        <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10 opacity-20"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)', mixBlendMode: 'overlay' }} />
      )}

      {/* Border glow */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
            style={{
              border: `2px solid ${char.color}30`,
              boxShadow: isDark
                ? `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.25), inset 0 0 30px ${char.color}10, 0 0 25px ${char.color}20, 0 4px 24px rgba(0,0,0,0.4)`
                : `inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.05), inset 0 0 30px ${char.color}08, 0 0 20px ${char.color}15, 0 4px 16px rgba(0,0,0,0.1)`,
            }} />
          <div className="absolute inset-[-2px] rounded-[2rem] pointer-events-none z-10"
            style={{
              background: isDark
                ? `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 25%, transparent 50%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.15) 100%)`
                : `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 25%, transparent 50%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0.05) 100%)`,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              padding: '2px',
            }} />
          <div className="absolute inset-[-2px] rounded-[2rem] pointer-events-none z-10 opacity-60"
            style={{
              background: `linear-gradient(45deg, ${char.color}40 0%, transparent 30%, transparent 70%, ${char.color}30 100%)`,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              padding: '2px',
              filter: 'blur(1px)',
            }} />
        </>
      )}

      {/* Inactive border */}
      {!isActive && (
        <div className="absolute inset-0 rounded-[2rem] pointer-events-none"
          style={{ border: isDark ? '1.5px solid rgba(255,255,255,0.06)' : '1.5px solid rgba(0,0,0,0.08)' }} />
      )}

      {/* Mouse-follow glare */}
      {isActive && (
        <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${mx}% ${my}%, ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.25)'} 0%, transparent 50%)`,
            mixBlendMode: 'overlay', opacity: 0.6,
          }} />
      )}

      {/* Character visual — image clips to card's top corners */}
      <div className="flex-1 flex items-end justify-center relative z-10 min-h-0"
        style={{ marginTop: compact ? '-1rem' : '-1.5rem', marginBottom: compact ? '0.25rem' : '0.5rem' }}>
        <div className="w-full h-full flex items-end justify-center"
          style={{
            borderTopLeftRadius: '2rem',
            borderTopRightRadius: '2rem',
            overflow: 'hidden',
          }}>
          {char.component || (char.image ? <img src={char.image} alt={char.name} className="w-full h-full object-cover" loading="lazy" style={{ objectPosition: 'center top' }} /> : null)}
        </div>
      </div>

      {/* Name */}
      <div className={`text-center px-2 relative z-10 ${compact ? 'mt-1' : 'mt-3'}`}>
        <p className={`${compact ? 'text-[12px]' : 'text-[15px]'} font-extrabold`} style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#1f2937' }}>
          {char.name}
        </p>
        <p className={`${compact ? 'text-[9px]' : 'text-[11px]'} mt-0.5`} style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
          {char.subtitle}
        </p>
      </div>

      {/* Compact: lock icon */}
      {compact && (
        <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${char.color}30`,
          }}>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke={char.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   Main
   ═══════════════════════════════════════ */
export default function HomePageV4() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('app_theme') as 'dark' | 'light') || 'light');
  const [childName, setChildName] = useState('小朋友');
  const [activeIdx, setActiveIdx] = useState(0);
  const [tab, setTab] = useState<'owned' | 'unowned'>('owned');
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [showGreeting, setShowGreeting] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState<CharData | null>(null);
  const [purchasePlan, setPurchasePlan] = useState<'buy' | 'subscribe'>('buy');
  const vScrollRef = useRef<HTMLDivElement>(null);
  const hContainerRef = useRef<HTMLDivElement>(null);

  const [isLandscape, setIsLandscape] = useState(() => typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false);
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', check);
    check();
    return () => window.removeEventListener('resize', check);
  }, []);

  const activeChar = ALL_CHARS[activeIdx];
  const hasNext = activeIdx < ALL_CHARS.length - 1;
  const hasPrev = activeIdx > 0;
  const nextChar = hasNext ? ALL_CHARS[activeIdx + 1] : null;
  const prevChar = hasPrev ? ALL_CHARS[activeIdx - 1] : null;
  const isDark = theme === 'dark';

  // Filtered list based on tab
  const chars = ALL_CHARS.filter(c => tab === 'owned' ? c.owned : !c.owned);

  // Reset scroll when tab changes
  useEffect(() => {
    setActiveIdx(0);
    if (vScrollRef.current) vScrollRef.current.scrollTop = 0;
  }, [tab]);

  useEffect(() => { const s = localStorage.getItem('child_name'); if (s) setChildName(s); }, []);

  // Greeting rotation
  useEffect(() => {
    setShowGreeting(false);
    setGreetingIdx(0);
    const t = setTimeout(() => setShowGreeting(true), 800);
    const interval = setInterval(() => { setGreetingIdx(p => (p + 1) % 3); setShowGreeting(true); }, 5000);
    const t2 = setTimeout(() => setShowGreeting(false), 4000);
    return () => { clearTimeout(t); clearTimeout(t2); clearInterval(interval); };
  }, [activeIdx]);

  // Portrait: detect scroll position
  const onVScroll = useCallback(() => {
    const el = vScrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / window.innerHeight);
    if (idx !== activeIdx && idx >= 0 && idx < chars.length) setActiveIdx(idx);
  }, [activeIdx, chars.length]);

  const scrollToV = (idx: number) => {
    vScrollRef.current?.scrollTo({ top: idx * window.innerHeight, behavior: 'smooth' });
  };

  // Landscape: horizontal swipe — V3-style pointer tracking
  const hX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 - 140 : 0);
  const CARD_W = 280;
  const GAP = 20;
  const hCenterOffset = typeof window !== 'undefined' ? window.innerWidth / 2 - CARD_W / 2 : 0;
  const hMaxIdx = ALL_CHARS.length - 1;
  const hMinX = hCenterOffset - hMaxIdx * (CARD_W + GAP);
  const hTargetX = hCenterOffset - activeIdx * (CARD_W + GAP);

  useEffect(() => {
    if (isLandscape) {
      animate(hX, hTargetX, { type: 'spring', stiffness: 350, damping: 30 });
    }
  }, [activeIdx, isLandscape, hTargetX]);

  const hTouchRef = useRef({ startX: 0, startVal: 0 });

  const onHPointerDown = useCallback((e: React.PointerEvent) => {
    hTouchRef.current = { startX: e.clientX, startVal: hX.get() };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [hX]);

  const onHPointerMove = useCallback((e: React.PointerEvent) => {
    if (!(e.buttons & 1)) return;
    const dx = e.clientX - hTouchRef.current.startX;
    const clamped = Math.max(hMinX - 40, Math.min(hCenterOffset + 40, hTouchRef.current.startVal + dx));
    hX.set(clamped);
  }, [hX, hMinX, hCenterOffset]);

  const onHPointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    const cur = hX.get();
    if (cur > hCenterOffset + 30) { animate(hX, hCenterOffset, { type: 'spring', stiffness: 350, damping: 30 }); setActiveIdx(0); return; }
    if (cur < hMinX - 30) { animate(hX, hMinX, { type: 'spring', stiffness: 350, damping: 30 }); setActiveIdx(hMaxIdx); return; }
    let ci = Math.round((hCenterOffset - cur) / (CARD_W + GAP));
    ci = Math.max(0, Math.min(hMaxIdx, ci));
    setActiveIdx(ci);
  }, [hX, hCenterOffset, hMinX, hMaxIdx]);

  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark';
    setTheme(t);
    localStorage.setItem('app_theme', t);
  };

  const greetings = GREETINGS[activeChar.id] || GREETINGS.parrot;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden select-none" style={{ background: isDark ? '#0A0A0F' : '#F5F5F7' }}>

      <style>{`
        .v4-snap{scroll-snap-type:y mandatory;overflow-y:scroll;-webkit-overflow-scrolling:touch;scrollbar-width:none}
        .v4-snap::-webkit-scrollbar{display:none}
        .v4-pg{scroll-snap-align:start;scroll-snap-stop:always;height:100vh;position:relative;display:flex;flex-direction:column}
        @keyframes shine{0%,100%{background-position:0% 0%}50%{background-position:100% 100%}}
      `}</style>

      {/* Header + Tabs */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' }}>
        {/* Top row */}
        <div className="flex items-center justify-between px-5 pb-1">
          <div>
            <p className={`text-[11px] font-bold ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{getGreeting()}，{childName}</p>
          </div>
          <motion.button whileTap={{ scale: 0.85 }} onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)' }}>
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-gray-500" />}
          </motion.button>
        </div>
        {/* Tabs */}
        {!isLandscape && (
          <div className="flex justify-center gap-3 px-5 pb-3 pt-1">
            {(['owned', 'unowned'] as const).map(t => (
              <button key={t}
                onClick={() => { setTab(t); setActiveIdx(0); }}
                className="px-5 py-2 rounded-full text-sm font-extrabold transition-all cursor-pointer select-none"
                style={{
                  background: tab === t
                    ? (isDark ? 'rgba(255,255,255,0.12)' : `${activeChar.color}18`)
                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                  color: tab === t
                    ? (isDark ? 'white' : '#1f2937')
                    : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'),
                  border: `2px solid ${tab === t ? (isDark ? 'rgba(255,255,255,0.15)' : `${activeChar.color}30`) : 'transparent'}`,
                }}>
                {t === 'owned' ? `已拥有 ${ALL_CHARS.filter(c => c.owned).length}` : `未拥有 ${ALL_CHARS.filter(c => !c.owned).length}`}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* ══════════ PORTRAIT ══════════ */}
      {!isLandscape && (
        <>
          {/* OWNED: single column vertical snap */}
          {tab === 'owned' && (
            <div key="owned-scroll" ref={vScrollRef} className="v4-snap flex-1" onScroll={onVScroll}>
              {chars.map((c, i) => {
                const isActive = i === activeIdx;
                const prev = i > 0 ? chars[i - 1] : null;
                const next = i < chars.length - 1 ? chars[i + 1] : null;
                return (
                  <div key={c.id} className="v4-pg">
                    <div className="absolute inset-0 pointer-events-none transition-all duration-700"
                      style={{ background: isActive ? `radial-gradient(ellipse 80% 60% at 50% 30%, ${c.color}${isDark ? '18' : '12'} 0%, transparent 70%)` : 'transparent' }} />

                    <AnimatePresence mode="wait">
                      {isActive && showGreeting && (
                        <motion.div key={`${c.id}-${greetingIdx}`}
                          initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="absolute top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl rounded-bl-sm max-w-[200px] text-center z-30 pointer-events-none"
                          style={{
                            background: isDark ? 'rgba(20,20,30,0.9)' : 'rgba(255,255,255,0.95)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                            boxShadow: isDark ? `0 4px 20px rgba(0,0,0,0.4), 0 0 30px ${c.color}10` : `0 4px 20px rgba(0,0,0,0.08)`,
                          }}>
                          <p className="text-[11px] font-medium leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)' }}>{greetings[greetingIdx]}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                      <motion.div initial={false}
                        animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0.3 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}>
                        <CharacterCard char={c} isActive={isActive} theme={theme}
                          onClick={() => navigate(`/ai-parrot?character=${c.id}`)} />
                      </motion.div>
                    </div>

                    {isActive && prev && (
                      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-5"
                        style={{ height: '14vh', overflow: 'hidden' }}>
                        <div style={{ transform: 'translateY(50%)', opacity: 0.35 }}>
                          <div className="rounded-b-[2rem] overflow-hidden"
                            style={{ width: 'min(260px, 70vw)', aspectRatio: '195 / 280',
                              background: isDark ? `linear-gradient(0deg, ${prev.color}08 0%, ${prev.color}20 100%)` : `linear-gradient(0deg, ${prev.color}06 0%, ${prev.color}18 100%)`,
                              border: `1.5px solid ${prev.color}30`, borderTop: 'none', boxShadow: `0 8px 24px ${prev.color}15` }} />
                        </div>
                      </div>
                    )}
                    {isActive && next && (
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none z-5"
                        style={{ height: '14vh', overflow: 'hidden' }}>
                        <div style={{ transform: 'translateY(-50%)', opacity: 0.35 }}>
                          <div className="rounded-t-[2rem] overflow-hidden"
                            style={{ width: 'min(260px, 70vw)', aspectRatio: '195 / 280',
                              background: isDark ? `linear-gradient(180deg, ${next.color}20 0%, ${next.color}08 100%)` : `linear-gradient(180deg, ${next.color}18 0%, ${next.color}06 100%)`,
                              border: `1.5px solid ${next.color}30`, borderBottom: 'none', boxShadow: `0 -8px 24px ${next.color}15` }} />
                        </div>
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                        {chars.map((_, j) => (
                          <button key={j} onClick={() => scrollToV(j)} className="rounded-full transition-all duration-300"
                            style={{ width: j === i ? 5 : 3, height: j === i ? 5 : 3, background: j === i ? c.color : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)') }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* UNOWNED: 2-column centered grid */}
          {tab === 'unowned' && (
            <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col items-center"
              style={{ scrollbarWidth: 'none', paddingTop: 'max(5.5rem, calc(env(safe-area-inset-top, 0px) + 5.5rem))' }}>
              <div className="grid grid-cols-2 gap-3 w-full px-1">
                {chars.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex justify-center">
                    <CharacterCard char={c} isActive={false} theme={theme} compact
                      onClick={() => setPurchaseModal(c)} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════ LANDSCAPE: horizontal swipe (V3-style) ══════════ */}
      {isLandscape && (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden" style={{ touchAction: 'none' }}>
          {/* BG glow */}
          <div className="absolute inset-0 pointer-events-none transition-all duration-700"
            style={{ background: `radial-gradient(ellipse 60% 80% at 40% 50%, ${activeChar.color}${isDark ? '18' : '10'} 0%, transparent 70%)` }} />

          {/* Card row — draggable */}
          <motion.div className="flex items-center" style={{ x: hX, gap: GAP }}
            onPointerDown={onHPointerDown}
            onPointerMove={onHPointerMove}
            onPointerUp={onHPointerUp}
            onPointerCancel={onHPointerUp}>
            {chars.map((c, i) => (
              <motion.div key={c.id}
                initial={false}
                animate={{ scale: i === activeIdx ? 1 : 0.85, opacity: i === activeIdx ? 1 : 0.3 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}>
                <CharacterCard char={c} isActive={i === activeIdx} theme={theme}
                  onClick={() => navigate(`/ai-parrot?character=${c.id}`)} />
              </motion.div>
            ))}
          </motion.div>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {chars.map((_, j) => (
              <button key={j} onClick={() => {
                const target = hCenterOffset - j * (CARD_W + GAP);
                animate(hX, target, { type: 'spring', stiffness: 350, damping: 30 });
                setActiveIdx(j);
              }}
                className="rounded-full transition-all duration-300"
                style={{ width: j === activeIdx ? 5 : 3, height: j === activeIdx ? 5 : 3, background: j === activeIdx ? activeChar.color : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)') }} />
            ))}
          </div>

          {activeIdx === 0 && (
            <motion.div className="absolute right-6 top-1/2 -translate-y-1/2 z-20"
              animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <svg width="8" height="16" viewBox="0 0 8 16"><path d="M1,1 L7,8 L1,15" fill="none" stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} strokeWidth="1.5" strokeLinecap="round" /></svg>
            </motion.div>
          )}

          {/* Speech bubble */}
          <AnimatePresence mode="wait">
            {showGreeting && (
              <motion.div key={`${activeChar.id}-${greetingIdx}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl rounded-bl-sm text-center z-30"
                style={{
                  background: isDark ? 'rgba(20,20,30,0.9)' : 'rgba(255,255,255,0.95)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                }}>
                <p className="text-[11px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)' }}>{greetings[greetingIdx]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ===== BOTTOM BAR ===== */}
      <div className="flex-shrink-0 relative z-40"
        style={{
          paddingBottom: isLandscape ? 'max(0.5rem, env(safe-area-inset-bottom, 0px))' : 'max(1rem, env(safe-area-inset-bottom, 0px))',
          paddingTop: isLandscape ? 6 : 10,
          background: isDark
            ? `linear-gradient(180deg, ${activeChar.color}08 0%, ${activeChar.color}15 50%, ${activeChar.color}08 100%)`
            : `linear-gradient(180deg, rgba(255,255,255,0.9) 0%, ${activeChar.color}06 50%, rgba(255,255,255,0.95) 100%)`,
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          borderTop: `1px solid ${isDark ? `${activeChar.color}30` : 'rgba(0,0,0,0.06)'}`,
          boxShadow: isDark
            ? `inset 0 1px 0 ${activeChar.color}15, inset 0 -1px 0 rgba(0,0,0,0.2), 0 -8px 32px ${activeChar.color}10`
            : `inset 0 1px 0 rgba(255,255,255,0.8), 0 -4px 16px rgba(0,0,0,0.04)`,
          transition: 'all 0.5s',
        }}>
        <div className="absolute inset-x-0 top-0 h-[1px] pointer-events-none"
          style={{ background: isDark ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)' }} />
        <div className={isLandscape ? 'px-4 flex items-center gap-4' : 'px-5'}>
          <div className={`flex ${isLandscape ? 'gap-2 flex-1' : 'gap-3'}`}>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/lessons')}
              className={`${isLandscape ? 'flex-1 py-3' : 'flex-1 py-4'} rounded-2xl font-bold text-sm flex items-center justify-center gap-2`}
              style={{
                background: isDark
                  ? `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`
                  : `linear-gradient(135deg, ${activeChar.color}, ${activeChar.color}CC)`,
                boxShadow: isDark ? `0 4px 16px rgba(0,0,0,0.2)` : `0 8px 32px ${activeChar.color}40`,
                color: isDark ? 'rgba(255,255,255,0.85)' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                minHeight: isLandscape ? 40 : 48,
              }}>
              <BookOpen className="w-4 h-4" /> 开始学习
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/ai-parrot')}
              className={`${isLandscape ? 'flex-1 py-3' : 'flex-1 py-4'} rounded-2xl font-bold text-sm flex items-center justify-center gap-2`}
              style={{
                background: isDark
                  ? `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`
                  : `linear-gradient(135deg, ${activeChar.color}, ${activeChar.color}CC)`,
                boxShadow: isDark ? `0 4px 16px rgba(0,0,0,0.2)` : `0 8px 32px ${activeChar.color}40`,
                color: isDark ? 'rgba(255,255,255,0.85)' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                minHeight: isLandscape ? 40 : 48,
              }}>
              <Sparkles className="w-4 h-4" /> 开始冒险
            </motion.button>
          </div>
        </div>
      </div>

      {/* ===== PURCHASE MODAL ===== */}
      <AnimatePresence>
        {purchaseModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center" onClick={() => setPurchaseModal(null)}>
            <div className="absolute inset-0 bg-black/40" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-t-3xl overflow-hidden pb-8"
              style={{ background: isDark ? '#12121A' : '#ffffff', boxShadow: isDark ? '0 -4px 0 #333' : '0 -4px 0 #E5E7EB' }}>
              {/* Character — large display */}
              <div className="flex justify-center py-4" style={{ background: `${purchaseModal.color}08` }}>
                <div className="w-[140px] h-[180px] rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{ background: `linear-gradient(180deg, ${purchaseModal.color}15 0%, ${purchaseModal.color}05 100%)` }}>
                  {purchaseModal.component || (purchaseModal.image ? (
                    <img src={purchaseModal.image} alt={purchaseModal.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-16 h-16 rounded-full" style={{ background: `${purchaseModal.color}20` }} />
                  ))}
                </div>
              </div>
              {/* Story + Name */}
              <div className="px-5 pt-3 pb-2 relative">
                <button onClick={() => setPurchaseModal(null)}
                  className="absolute top-3 right-5 w-8 h-8 rounded-full flex items-center justify-center z-10"
                  style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-extrabold" style={{ color: isDark ? 'white' : '#1f2937' }}>{purchaseModal.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${purchaseModal.color}15`, color: purchaseModal.color }}>{purchaseModal.subtitle}</span>
                </div>
                <p className="text-[11px] mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{purchaseModal.desc}</p>
                <div className="rounded-2xl px-4 py-3"
                  style={{ background: `${purchaseModal.color}08`, border: `1px solid ${purchaseModal.color}15` }}>
                  <p className="text-[11px] leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    "{CHARACTER_STORIES[purchaseModal.id] || '这个角色正等着和你一起冒险！'}"
                  </p>
                </div>
              </div>
              {/* Pricing */}
              <div className="px-5 mb-4">
                <p className="text-xs font-bold mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>选择解锁方式</p>
                <div className="flex gap-3">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPurchasePlan('buy')}
                    className="flex-1 rounded-2xl p-3.5 text-left relative"
                    style={{ background: purchasePlan === 'buy' ? `${purchaseModal.color}12` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                      border: `2px solid ${purchasePlan === 'buy' ? `${purchaseModal.color}60` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}` }}>
                    {purchasePlan === 'buy' && <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: purchaseModal.color }}>
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                    </div>}
                    <p className="text-xl font-extrabold mb-0.5" style={{ color: purchaseModal.color }}>¥49</p>
                    <p className="text-[10px] font-bold mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>永久买断</p>
                    <div className="space-y-1">
                      <p className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 永久解锁该角色</p>
                      <p className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 赠送实体角色卡片</p>
                      <p className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 独立情感羁绊</p>
                    </div>
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPurchasePlan('subscribe')}
                    className="flex-1 rounded-2xl p-3.5 text-left relative"
                    style={{ background: purchasePlan === 'subscribe' ? '#AF57DB12' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                      border: `2px solid ${purchasePlan === 'subscribe' ? '#AF57DB60' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}` }}>
                    {purchasePlan === 'subscribe' && <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#AF57DB' }}>
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                    </div>}
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <p className="text-xl font-extrabold" style={{ color: '#AF57DB' }}>¥79</p>
                      <span className="text-[10px] font-bold" style={{ color: '#AF57DB' }}>/月</span>
                    </div>
                    <p className="text-[10px] font-bold mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>连续包月</p>
                    <div className="space-y-1">
                      <p className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 月度自动续订解锁</p>
                      <p className="text-[9px] font-bold" style={{ color: '#AF57DB' }}>✓ 送实体角色玩具/卡片</p>
                      <p className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 独立情感羁绊</p>
                      <p className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 持续内容更新</p>
                    </div>
                  </motion.button>
                </div>
              </div>
              {/* CTA */}
              <div className="px-5">
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { purchasePlan === 'buy' ? purchaseCharacter(purchaseModal.id) : subscribeCharacter(purchaseModal.id); setPurchaseModal(null); }}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
                  style={{
                    background: purchasePlan === 'buy' ? `linear-gradient(135deg, ${purchaseModal.color}, ${purchaseModal.color}CC)` : 'linear-gradient(135deg, #AF57DB, #9035C0)',
                    boxShadow: purchasePlan === 'buy' ? `0 8px 32px ${purchaseModal.color}40` : '0 8px 32px rgba(175,87,219,0.4)',
                  }}>
                  {purchasePlan === 'buy' ? `¥49 永久解锁 ${purchaseModal.name}` : `¥79/月 连续包月 ${purchaseModal.name}`}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
