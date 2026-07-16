import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Users, Sun, Moon, HelpCircle, Sparkles, Palette, Lock, ChevronRight, ShoppingBag } from 'lucide-react';
import ParrotCharacter from '@/components/ParrotCharacter';

import imgTeacher1 from '@/assets/1ebf0cda2cde974b5ed9ae6990f1305cc10602a8.webp';
import imgTeacher2 from '@/assets/18466f7d75c7f0003c756fab4f226f5acaf0b786.webp';
import imgTeacher3 from '@/assets/aeb3bf3332ef650a0757436b3785006b754ee466.webp';

const PARROT_GREETINGS = ['嗨！准备好一起学英语了吗？', '嘿呀！快来跟我一起玩吧！', '你来啦！今天一起探险吧！'];

const LOCKED_CHARACTERS = [
  { id: 'einstein', name: '爱因斯坦', color: '#58CC02', image: imgTeacher1 },
  { id: 'fox', name: '小狐狸', color: '#E87040' },
  { id: 'olaf', name: '雪宝', color: '#38BDF8' },
  { id: 'deer', name: '小鹿姐姐', color: '#FF6B9D', image: imgTeacher3 },
  { id: 'beethoven', name: '贝多芬', color: '#1CB0F6', image: imgTeacher2 },
];

const ENGINE_HIGHLIGHTS = [
  { label: '每月测评', value: '测评中', color: '#AF57DB', icon: '📊' },
  { label: 'i+1匹配', value: '100%', color: '#1CB0F6', icon: '🎯' },
  { label: 'AI计划', value: '15分钟', color: '#58CC02', icon: '📋' },
  { label: '遗忘曲线', value: '3个词', color: '#FF9500', icon: '🧠' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return '夜深了'; if (h < 11) return '早安'; if (h < 13) return '午安';
  if (h < 18) return '下午好'; if (h < 22) return '晚上好'; return '夜深了';
};

const CHAR_COLOR = '#1CB0F6';

interface NewUserHomeProps {
  onToggleMode: () => void;
}

export default function NewUserHome({ onToggleMode }: NewUserHomeProps) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark');
  const [childName, setChildName] = useState('小朋友');
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => { const s = localStorage.getItem('child_name'); if (s) setChildName(s); }, []);

  // Rotate greeting
  useEffect(() => {
    const t1 = setTimeout(() => setShowGreeting(true), 800);
    const interval = setInterval(() => {
      setGreetingIdx(prev => (prev + 1) % PARROT_GREETINGS.length);
      setShowGreeting(true);
    }, 5000);
    const t2 = setTimeout(() => setShowGreeting(false), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(interval); };
  }, []);

  const toggleTheme = useCallback(() => {
    const t = theme === 'dark' ? 'light' : 'dark';
    setTheme(t);
    localStorage.setItem('app_theme', t);
  }, [theme]);

  const actions = [
    { label: '一起学习', icon: <BookOpen className="w-5 h-5" />, color: '#58CC02', route: '/lessons' },
    { label: '一起玩耍', icon: <Users className="w-5 h-5" />, color: '#1CB0F6', route: '/ai-parrot' },
    { label: '十万个为什么', icon: <HelpCircle className="w-5 h-5" />, color: '#AF57DB', route: '/why?teacher=einstein' },
    { label: '画画时间', icon: <Palette className="w-5 h-5" />, color: '#FF9500', route: '/painting' },
  ];

  return (
    <div className="h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: '#0A0A0F', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      <style>{`
        @keyframes driftGlow{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
        .glow-drift{animation:driftGlow 20s ease-in-out infinite}
        .glow-drift-alt{animation:driftGlow 25s ease-in-out 5s infinite reverse}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 20px var(--glow-color, rgba(28,176,246,0.3)), 0 0 40px var(--glow-color, rgba(28,176,246,0.15))}50%{box-shadow:0 0 30px var(--glow-color, rgba(28,176,246,0.5)), 0 0 60px var(--glow-color, rgba(28,176,246,0.25))}}
        .card-glow{animation:glowPulse 2.5s ease-in-out infinite}
        @keyframes floatA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(5deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-6px) rotate(-4deg)}}
        .float-a{animation:floatA 4s ease-in-out infinite}
        .float-b{animation:floatB 5s ease-in-out 1s infinite}
        .float-c{animation:floatA 6s ease-in-out 2s infinite}
        @keyframes engineLive{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.85)}}
        .engine-live{animation:engineLive 2s ease-in-out infinite}
      `}</style>

      {/* BG glows */}
      <div className="absolute inset-0 pointer-events-none glow-drift" style={{
        background: `radial-gradient(ellipse 90% 70% at 40% 40%, ${CHAR_COLOR}30 0%, transparent 70%),
                     radial-gradient(ellipse 70% 60% at 65% 55%, ${CHAR_COLOR}12 0%, transparent 60%)`,
      }} />
      <div className="absolute inset-0 pointer-events-none glow-drift-alt" style={{
        background: `radial-gradient(ellipse 60% 50% at 70% 30%, ${CHAR_COLOR}18 0%, transparent 65%),
                     radial-gradient(ellipse 50% 40% at 20% 70%, ${CHAR_COLOR}12 0%, transparent 60%)`,
      }} />

      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative z-20 flex-shrink-0 px-6"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top, 0px))', paddingBottom: 4 }}>
        <div className="flex items-start justify-between">
          <div>
            <motion.div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-1.5"
              style={{ background: `${CHAR_COLOR}20`, border: `1px solid ${CHAR_COLOR}30` }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" animate={{ background: CHAR_COLOR }} />
              <span className="text-[10px] font-bold" style={{ color: CHAR_COLOR }}>AI 伙伴</span>
            </motion.div>
            <h1 className="text-[20px] font-extrabold leading-tight text-white">
              {getGreeting()}，{childName}
            </h1>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              你的专属学习伙伴已就位
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.85 }} onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </motion.button>
        </div>
      </motion.div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar" style={{ paddingBottom: 16 }}>

        {/* Hero Section */}
        <div className="flex flex-col items-center px-6 pt-2 pb-4">
          {/* Speech bubble */}
          <AnimatePresence mode="wait">
            {showGreeting && (
              <motion.div key={greetingIdx}
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="mb-3 px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[220px] text-center"
                style={{
                  background: 'rgba(20,20,30,0.92)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 30px ${CHAR_COLOR}15`,
                }}>
                <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {PARROT_GREETINGS[greetingIdx]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero card */}
          <motion.div
            className="relative card-glow"
            style={{ '--glow-color': `${CHAR_COLOR}40` } as React.CSSProperties}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 18, delay: 0.1 }}
          >
            {/* Floating sparkles */}
            <motion.div className="absolute -top-3 -left-3 float-a pointer-events-none z-10">
              <div className="w-2 h-2 rounded-full" style={{ background: '#FFD700', boxShadow: '0 0 8px #FFD70080' }} />
            </motion.div>
            <motion.div className="absolute -top-1 -right-4 float-b pointer-events-none z-10">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF6B9D', boxShadow: '0 0 6px #FF6B9D80' }} />
            </motion.div>
            <motion.div className="absolute bottom-4 -left-5 float-c pointer-events-none z-10">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#58CC02', boxShadow: '0 0 6px #58CC0280' }} />
            </motion.div>
            <motion.div className="absolute top-1/2 -right-6 float-a pointer-events-none z-10" style={{ animationDelay: '1.5s' }}>
              <div className="w-1 h-1 rounded-full" style={{ background: '#AF57DB', boxShadow: '0 0 5px #AF57DB80' }} />
            </motion.div>

            {/* Card */}
            <div className="rounded-[2rem] overflow-hidden flex flex-col items-center relative"
              style={{
                width: 195, height: 260,
                background: `linear-gradient(180deg, ${CHAR_COLOR}18 0%, ${CHAR_COLOR}08 50%, rgba(10,10,15,0.9) 100%)`,
                border: `2px solid ${CHAR_COLOR}40`,
              }}>
              {/* Holo */}
              <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
                style={{
                  background: `linear-gradient(110deg, rgba(255,0,102,0.04), rgba(0,255,153,0.05), rgba(0,102,255,0.04), rgba(255,204,0,0.04))`,
                  backgroundSize: '200% 200%',
                  mixBlendMode: 'color-dodge',
                  opacity: 0.3,
                }} />

              {/* Character */}
              <div className="flex-1 flex items-center justify-center px-2 pt-3 pb-0 relative z-5 pointer-events-none overflow-hidden">
                <ParrotCharacter state="greeting" size={1.3} />
              </div>

              {/* Name */}
              <div className="text-center px-2 relative z-5 pointer-events-none pb-3 pt-0">
                <div className="flex items-center justify-center gap-1">
                  <p className="font-bold text-[13px]" style={{ color: 'rgba(255,255,255,0.8)' }}>小鹦鹉</p>
                  <span className="text-[10px]" style={{ color: `${CHAR_COLOR}90` }}>学习伙伴</span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  活泼 · 爱唱歌 · 快乐学英语
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions — 2x2 grid */}
        <div className="px-5 mb-5">
          <div className="grid grid-cols-2 gap-3">
            {actions.map((a, i) => (
              <motion.button key={a.label}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                onClick={() => navigate(a.route)}
                className="rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${a.color}20, ${a.color}08)`,
                  border: `1px solid ${a.color}25`,
                  boxShadow: `0 4px 16px ${a.color}10`,
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${a.color}18` }}>
                  <span style={{ color: a.color }}>{a.icon}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>{a.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Discovery Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-5 mb-3">
            <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>更多角色等你发现</p>
            <motion.button whileTap={{ scale: 0.95 }}
              className="flex items-center gap-0.5"
              onClick={() => navigate('/shop')}>
              <span className="text-[10px] font-bold" style={{ color: CHAR_COLOR }}>查看全部</span>
              <ChevronRight className="w-3 h-3" style={{ color: CHAR_COLOR }} />
            </motion.button>
          </div>
          <div className="overflow-x-auto no-scrollbar" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <div className="flex gap-3" style={{ width: 'max-content' }}>
              {LOCKED_CHARACTERS.map((c, i) => (
                <motion.button key={c.id}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  onClick={() => navigate('/shop')}
                  className="flex-shrink-0 rounded-2xl overflow-hidden flex flex-col items-center relative"
                  style={{
                    width: 100, height: 140,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                  {/* Blurred character preview */}
                  <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden"
                    style={{ filter: 'blur(3px) brightness(0.6)' }}>
                    {c.image ? (
                      <img src={c.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full" style={{ background: `${c.color}30` }} />
                    )}
                  </div>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <Lock className="w-4 h-4 mb-1" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.name}</span>
                  </div>
                  {/* Bottom gradient */}
                  <div className="absolute bottom-0 inset-x-0 h-8 pointer-events-none"
                    style={{ background: 'linear-gradient(transparent, rgba(10,10,15,0.9))' }} />
                </motion.button>
              ))}
              {/* Add more card */}
              <motion.button key="add"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + LOCKED_CHARACTERS.length * 0.06 }}
                onClick={() => navigate('/shop')}
                className="flex-shrink-0 rounded-2xl flex flex-col items-center justify-center gap-1"
                style={{
                  width: 100, height: 140,
                  background: 'rgba(255,255,255,0.02)',
                  border: '2px dashed rgba(255,255,255,0.1)',
                }}>
                <ShoppingBag className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>去商城</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Engine Highlights */}
        <div className="px-4 mb-3">
          <div className="flex gap-2">
            {ENGINE_HIGHLIGHTS.map((h, i) => (
              <div key={i} className="flex-1 rounded-2xl p-2.5 flex flex-col items-center gap-1 text-center"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                <span className="text-base">{h.icon}</span>
                <span className="text-[9px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>{h.label}</span>
                <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: h.color }}>
                  {h.value}
                  <span className="inline-block w-1.5 h-1.5 rounded-full engine-live" style={{ background: h.color }} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex-shrink-0 relative z-20"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          paddingTop: 10,
          background: `linear-gradient(180deg, ${CHAR_COLOR}08 0%, ${CHAR_COLOR}15 50%, ${CHAR_COLOR}08 100%)`,
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          borderTop: `1px solid ${CHAR_COLOR}30`,
          boxShadow: `inset 0 1px 0 ${CHAR_COLOR}15, inset 0 -1px 0 rgba(0,0,0,0.2), 0 -8px 32px ${CHAR_COLOR}10`,
        }}>
        <div className="absolute inset-x-0 top-0 h-[1px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
        <div className="px-5">
          <div className="flex items-center gap-2 mb-2.5">
            <motion.div className="w-2 h-2 rounded-full flex-shrink-0" animate={{ background: CHAR_COLOR }} />
            <p className="text-sm font-bold truncate text-white/90">
              小鹦鹉
              <span className="text-[10px] font-normal ml-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>学习伙伴</span>
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/ai-parrot')}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${CHAR_COLOR}, ${CHAR_COLOR}CC)`,
              boxShadow: `0 8px 32px ${CHAR_COLOR}40`,
              color: 'white', minHeight: 48,
            }}>
            <Sparkles className="w-4 h-4" /> 开始今天的冒险
          </motion.button>
        </div>
      </div>

      {/* Mode toggle — always visible */}
      <motion.button
        className="fixed z-[100] flex items-center gap-1 px-2 py-1 rounded-full"
        style={{
          bottom: 'max(100px, env(safe-area-inset-bottom, 80px))',
          left: 12,
          background: 'rgba(20,20,30,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
        }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleMode}
      >
        <span className="text-[8px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
          切换老用户
        </span>
      </motion.button>
    </div>
  );
}
