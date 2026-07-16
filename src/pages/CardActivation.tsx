import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Wifi } from 'lucide-react';
import FoxCharacter from '@/components/FoxCharacter';

type ActivationPhase = 'intro' | 'scanning' | 'activating' | 'unboxing' | 'complete';

const FOX_COLOR = '#E87040';

/* ═══════════════════════════════════════
   Phone back — adapts to light/dark
   ═══════════════════════════════════════ */
function PhoneBack({ scanning, isDark }: { scanning: boolean; isDark: boolean }) {
  const bgColor = isDark ? '#1A1A2E' : '#F8F8FA';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mutedBg = isDark ? '#0A0A14' : '#E8E8EC';
  const iconColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const iconBg = isDark ? '#050510' : '#D8D8DC';

  return (
    <svg viewBox="0 0 150 280" width="100%" height="100%">
      <rect x="5" y="5" width="140" height="270" rx="22" fill={bgColor} stroke={borderColor} strokeWidth="1.5" />
      <rect x="12" y="12" width="48" height="48" rx="10" fill={mutedBg} stroke={borderColor} strokeWidth="1" />
      <circle cx="26" cy="26" r="7" fill={iconBg} stroke={borderColor} strokeWidth="1" />
      <circle cx="26" cy="26" r="3.5" fill={isDark ? '#0a0a1a' : '#C8C8CC'} />
      <circle cx="46" cy="26" r="5" fill={iconBg} stroke={borderColor} strokeWidth="1" />
      <circle cx="46" cy="26" r="2.5" fill={isDark ? '#0a0a1a' : '#C8C8CC'} />
      <circle cx="36" cy="46" r="2.5" fill={iconBg} stroke={borderColor} strokeWidth="0.5" />
      <motion.rect
        x="18" y="72" width="114" height="60" rx="10"
        fill={scanning ? `${FOX_COLOR}15` : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)')}
        stroke={scanning ? FOX_COLOR : borderColor}
        strokeWidth={scanning ? 1.5 : 1}
        strokeDasharray={scanning ? '0' : '5 4'}
        animate={scanning ? { opacity: [0.6, 1, 0.6] } : {}}
        transition={scanning ? { duration: 1.5, repeat: Infinity } : {}}
      />
      <g transform="translate(75,102)" opacity={scanning ? 1 : 0.4}>
        <path d="M0,-6 Q6,-12 12,-6" fill="none" stroke={scanning ? FOX_COLOR : iconColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M-3,-2 Q6,-10 15,-2" fill="none" stroke={scanning ? `${FOX_COLOR}CC` : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="3" r="2" fill={scanning ? `${FOX_COLOR}80` : iconColor} />
      </g>
      {scanning && (
        <>
          <motion.circle cx="75" cy="102" r="24" fill="none" stroke={FOX_COLOR} strokeWidth="1"
            initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity }} />
          <motion.circle cx="75" cy="102" r="24" fill="none" stroke={`${FOX_COLOR}CC`} strokeWidth="1"
            initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }} />
        </>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════
   Particles
   ═══════════════════════════════════════ */
function Particles({ color, count = 20 }: { color: string; count?: number }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: i, angle: (i / count) * 360, dist: 50 + Math.random() * 80,
    size: 3 + Math.random() * 6, delay: Math.random() * 0.4,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none">
      {items.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: '50%', top: '40%', width: p.size, height: p.size, background: color, boxShadow: `0 0 ${p.size * 3}px ${color}` }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{ x: Math.cos((p.angle * Math.PI) / 180) * p.dist, y: Math.sin((p.angle * Math.PI) / 180) * p.dist, scale: [0, 1.8, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   Card Unboxing Animation
   ═══════════════════════════════════════ */
function CardUnboxing({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'glow' | 'crack' | 'split' | 'emerge' | 'done'>('glow');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStep('crack'), 800));
    timers.push(setTimeout(() => setStep('split'), 1600));
    timers.push(setTimeout(() => setStep('emerge'), 2200));
    timers.push(setTimeout(() => setStep('done'), 3200));
    timers.push(setTimeout(() => onComplete(), 3800));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 280 }}>
      <AnimatePresence>
        {(step === 'split' || step === 'emerge') && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 3, 2.5], opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.2 }}
            className="absolute rounded-full"
            style={{
              width: 120, height: 120,
              background: `radial-gradient(circle, ${FOX_COLOR}80 0%, ${FOX_COLOR}20 50%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Card body — left half */}
      <motion.div
        className="absolute bg-card border border-border"
        style={{
          width: 90, height: 140, left: 55, top: 70,
          borderRadius: '12px 0 0 12px',
          overflow: 'hidden',
          transformOrigin: 'right center',
          zIndex: 10,
        }}
        animate={
          step === 'split' || step === 'emerge' || step === 'done'
            ? { x: -60, rotateY: -35, opacity: 0, scale: 0.8 }
            : step === 'crack'
              ? { x: [-2, 3, -1, 2], rotateY: [0, -2, 1, -1] }
              : {}
        }
        transition={
          step === 'split' || step === 'emerge' || step === 'done'
            ? { duration: 0.6, ease: 'easeOut' }
            : { duration: 0.3, repeat: step === 'crack' ? 3 : 0 }
        }
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <FoxCharacter state="idle" size={0.35} />
        </div>
      </motion.div>

      {/* Card body — right half */}
      <motion.div
        className="absolute bg-card border border-border"
        style={{
          width: 90, height: 140, left: 55, top: 70,
          borderRadius: '0 12px 12px 0',
          overflow: 'hidden',
          transformOrigin: 'left center',
          zIndex: 10,
        }}
        animate={
          step === 'split' || step === 'emerge' || step === 'done'
            ? { x: 60, rotateY: 35, opacity: 0, scale: 0.8 }
            : step === 'crack'
              ? { x: [2, -3, 1, -2], rotateY: [0, 2, -1, 1] }
              : {}
        }
        transition={
          step === 'split' || step === 'emerge' || step === 'done'
            ? { duration: 0.6, ease: 'easeOut' }
            : { duration: 0.3, repeat: step === 'crack' ? 3 : 0 }
        }
      />

      {/* Glow intensity during glow phase */}
      <motion.div
        className="absolute rounded-[12px] pointer-events-none z-5"
        style={{
          width: 180, height: 140, left: 10, top: 70,
          boxShadow: `0 0 0px ${FOX_COLOR}00`,
        }}
        animate={
          step === 'glow'
            ? { boxShadow: [`0 0 20px ${FOX_COLOR}20`, `0 0 60px ${FOX_COLOR}60`, `0 0 20px ${FOX_COLOR}20`] }
            : step === 'crack'
              ? { boxShadow: `0 0 80px ${FOX_COLOR}80, 0 0 120px ${FOX_COLOR}40` }
              : { boxShadow: `0 0 100px ${FOX_COLOR}A0, 0 0 160px ${FOX_COLOR}60`, opacity: [1, 0] }
        }
        transition={
          step === 'glow'
            ? { duration: 1.2, repeat: Infinity }
            : { duration: 0.8 }
        }
      />

      {/* Crack lines */}
      <AnimatePresence>
        {step === 'crack' && (
          <>
            <motion.svg
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-20"
              style={{ left: 55, top: 70, width: 90, height: 140 }}
              viewBox="0 0 90 140"
            >
              <motion.path
                d="M45,0 L43,25 L47,50 L42,75 L46,100 L44,125 L45,140"
                fill="none" stroke={FOX_COLOR} strokeWidth="2.5" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
              <motion.path
                d="M43,40 L25,55 L10,50"
                fill="none" stroke={`${FOX_COLOR}AA`} strokeWidth="1.5" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              />
              <motion.path
                d="M47,80 L65,90 L80,85"
                fill="none" stroke={`${FOX_COLOR}AA`} strokeWidth="1.5" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              />
            </motion.svg>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="absolute z-15 pointer-events-none"
              style={{
                left: 55, top: 70, width: 90, height: 140,
                background: `linear-gradient(0deg, transparent 35%, ${FOX_COLOR}40 50%, transparent 65%)`,
                filter: 'blur(3px)',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Fox emerging */}
      <AnimatePresence>
        {(step === 'emerge' || step === 'done') && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="absolute z-30"
            style={{ left: 50, top: 60 }}
          >
            <FoxCharacter state="greeting" size={0.9} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {step === 'split' && <Particles color={FOX_COLOR} count={30} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════
   Main
   ═══════════════════════════════════════ */
export default function CardActivation() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<ActivationPhase>('intro');
  const [showSimBtn, setShowSimBtn] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    if (phase === 'intro' || phase === 'scanning') {
      const t = setTimeout(() => setShowSimBtn(true), 1200);
      return () => clearTimeout(t);
    }
    setShowSimBtn(false);
  }, [phase]);

  const handleStartScan = useCallback(() => {
    setPhase('scanning');
    setShowSimBtn(false);
    setTimeout(() => setPhase('activating'), 2500);
    setTimeout(() => setPhase('unboxing'), 4500);
  }, []);

  const handleSimNfcTap = useCallback(() => {
    if (phase === 'intro') {
      setPhase('scanning');
      setShowSimBtn(false);
      setTimeout(() => setPhase('activating'), 1500);
      setTimeout(() => setPhase('unboxing'), 3200);
    } else if (phase === 'scanning') {
      setShowSimBtn(false);
      setTimeout(() => setPhase('activating'), 1000);
      setTimeout(() => setPhase('unboxing'), 2500);
    }
  }, [phase]);

  const handleUnboxComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  const handleGoHome = useCallback(() => {
    localStorage.setItem('fox_activated', 'true');
    localStorage.setItem('selected_character', 'fox');
    localStorage.setItem('homev3_newlyActivated', 'fox');
    navigate('/home-v3');
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden select-none" style={{ background: isDark ? '#0A0A0F' : '#F5F5F7' }}>
      <style>{`
        @keyframes driftGlow{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
        .glow-drift{animation:driftGlow 20s ease-in-out infinite}
        .glow-drift-alt{animation:driftGlow 25s ease-in-out 5s infinite reverse}
      `}</style>

      {/* BG glows */}
      <div className="absolute inset-0 pointer-events-none glow-drift" style={{
        background: `radial-gradient(ellipse 90% 70% at 40% 40%, ${FOX_COLOR}${isDark ? '18' : '12'} 0%, transparent 70%),
                     radial-gradient(ellipse 70% 60% at 65% 55%, ${FOX_COLOR}${isDark ? '0C' : '08'} 0%, transparent 60%)`,
      }} />
      <div className="absolute inset-0 pointer-events-none glow-drift-alt" style={{
        background: `radial-gradient(ellipse 60% 50% at 70% 30%, ${FOX_COLOR}${isDark ? '10' : '0A'} 0%, transparent 65%),
                     radial-gradient(ellipse 50% 40% at 20% 70%, ${FOX_COLOR}${isDark ? '08' : '06'} 0%, transparent 60%)`,
      }} />

      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative z-30 flex-shrink-0 px-6"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top, 0px))', paddingBottom: 4 }}>
        <div className="flex items-start justify-between">
          <div>
            <motion.div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-1.5"
              style={{ background: `${FOX_COLOR}15`, border: `1px solid ${FOX_COLOR}25` }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" animate={{ background: FOX_COLOR }} />
              <span className="text-[10px] font-bold" style={{ color: FOX_COLOR }}>
                {phase === 'unboxing' || phase === 'complete' ? '角色揭晓' : '角色激活'}
              </span>
            </motion.div>
            <h1 className={`text-[20px] font-extrabold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {phase === 'unboxing' ? '拆开你的专属卡片' : phase === 'complete' ? '发现小狐狸' : '感应你的专属角色'}
            </h1>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>
              {phase === 'unboxing' ? '惊喜即将揭晓' : phase === 'complete' ? '你的专属冒险伙伴已苏醒' : '将卡片轻轻靠近手机背面'}
            </p>
          </div>
          {phase !== 'unboxing' && phase !== 'complete' && (
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate('/home-v3')}
              className="w-9 h-9 rounded-full flex items-center justify-center mt-1"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
        <AnimatePresence mode="wait">

          {/* ===== INTRO ===== */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-5 w-full max-w-sm">

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className={`text-sm text-center ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                NFC感应会自动识别
              </motion.p>

              <div className="relative" style={{ width: 260, height: 300 }}>
                <div className="absolute left-1/2 -translate-x-1/2 top-0" style={{ width: 140 }}>
                  <PhoneBack scanning={false} isDark={isDark} />
                </div>
                <motion.div
                  className="absolute z-10"
                  style={{ width: 80, height: 112, left: 0, top: 80 }}
                  animate={{ x: [0, 30, 40], y: [0, -30, -10], rotate: [10, 3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                >
                  <div className={`w-full h-full rounded-xl relative overflow-hidden ${isDark ? 'bg-[#1A1A2E] border-2 border-[rgba(139,92,246,0.4)] shadow-[0_0_25px_rgba(139,92,246,0.2)]' : 'bg-white border-2 border-purple-200 shadow-md'}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FoxCharacter state="idle" size={0.4} />
                    </div>
                  </div>
                </motion.div>
                <motion.div className="absolute z-20" style={{ left: 60, top: 120 }}
                  animate={{ x: [0, 15, 0], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}>
                  <svg width="30" height="20" viewBox="0 0 30 20">
                    <path d="M0,10 L22,10 M16,4 L24,10 L16,16" fill="none" stroke={FOX_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                whileTap={{ scale: 0.95 }} onClick={handleStartScan}
                className="py-3 px-8 rounded-2xl font-bold text-sm"
                style={{
                  background: `${FOX_COLOR}15`, color: FOX_COLOR,
                  border: `2px solid ${FOX_COLOR}30`,
                }}>
                点击开始感应
              </motion.button>
            </motion.div>
          )}

          {/* ===== SCANNING ===== */}
          {phase === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 w-full max-w-sm">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <motion.h2 className={`text-2xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}>
                  正在感应中
                </motion.h2>
                <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>请保持卡片靠近手机背面</p>
              </motion.div>
              <div className="relative" style={{ width: 240, height: 300 }}>
                <div className="absolute left-1/2 -translate-x-1/2 top-0" style={{ width: 140 }}>
                  <PhoneBack scanning={true} isDark={isDark} />
                </div>
                <motion.div className="absolute z-10"
                  style={{ width: 80, height: 112 }}
                  initial={{ left: -60, top: 140, rotate: 15 }}
                  animate={{ left: 50, top: 62, rotate: 0, scale: [1, 1.05, 1] }}
                  transition={{ left: { duration: 0.8, ease: 'easeOut' }, top: { duration: 0.8, ease: 'easeOut' },
                    rotate: { duration: 0.8 }, scale: { duration: 1.5, repeat: Infinity, delay: 0.8 } }}
                >
                  <div className={`w-full h-full rounded-xl relative overflow-hidden ${isDark ? 'bg-[#1A1A2E] border-2 border-[rgba(139,92,246,0.4)] shadow-[0_0_25px_rgba(139,92,246,0.2)]' : 'bg-white border-2 border-purple-200 shadow-md'}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FoxCharacter state="idle" size={0.4} />
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: FOX_COLOR }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ===== ACTIVATING ===== */}
          {phase === 'activating' && (
            <motion.div key="activating" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 w-full max-w-sm relative">
              <Particles color={FOX_COLOR} />
              <motion.div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${FOX_COLOR}20` }}
                animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.5, repeat: Infinity } }}>
                <svg className="w-10 h-10" style={{ color: FOX_COLOR }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
              </motion.div>
              <motion.div className="relative" style={{ width: 100, height: 140 }}
                animate={{ filter: ['brightness(1)', 'brightness(1.15)', 'brightness(1)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}>
                <div className={`w-full h-full rounded-xl relative overflow-hidden ${isDark ? 'bg-[#2A2A3E] border-2 border-[rgba(139,92,246,0.5)] shadow-[0_0_40px_rgba(139,92,246,0.4)]' : 'bg-white border-2 border-purple-200 shadow-lg'}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FoxCharacter state="idle" size={0.45} />
                  </div>
                </div>
                <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ boxShadow: `0 0 60px ${FOX_COLOR}40` }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }} />
              </motion.div>
              <div className="text-center">
                <p className={`text-lg font-bold mb-1 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>角色唤醒中</p>
                <p className={`text-sm ${isDark ? 'text-white/35' : 'text-gray-400'}`}>即将揭晓你的专属伙伴</p>
              </div>
            </motion.div>
          )}

          {/* ===== UNBOXING ===== */}
          {phase === 'unboxing' && (
            <motion.div key="unboxing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }} className="flex flex-col items-center gap-4 w-full max-w-sm">
              <CardUnboxing onComplete={handleUnboxComplete} />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                正在拆开卡片...
              </motion.p>
            </motion.div>
          )}

          {/* ===== COMPLETE ===== */}
          {phase === 'complete' && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 w-full max-w-sm relative">
              <Particles color={FOX_COLOR} count={25} />

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="text-center">
                <h2 className={`text-4xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>发现小狐狸</h2>
                <p className={`text-base ${isDark ? 'text-white/50' : 'text-gray-500'}`}>你的专属冒险伙伴已苏醒</p>
              </motion.div>

              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.2 }}>
                <FoxCharacter state="idle" size={0.85} />
              </motion.div>

              {/* Speech bubble */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl rounded-bl-sm px-5 py-3 max-w-[240px]"
                style={{
                  background: isDark ? 'rgba(20,20,30,0.92)' : 'rgba(255,255,255,0.95)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                  boxShadow: isDark ? `0 4px 20px rgba(0,0,0,0.4), 0 0 30px ${FOX_COLOR}15` : `0 4px 20px rgba(0,0,0,0.1)`,
                }}>
                <p className="text-sm font-medium leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)' }}>
                  "你好呀！我是小狐狸，准备好开始我们的冒险了吗？"
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="w-2.5 h-2.5 rotate-45 -mt-4"
                style={{
                  background: isDark ? 'rgba(20,20,30,0.92)' : 'rgba(255,255,255,0.95)',
                  borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                }} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* NFC simulation button */}
      <AnimatePresence>
        {showSimBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleSimNfcTap}
            className="fixed z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl"
            style={{
              bottom: 'max(100px, env(safe-area-inset-bottom, 80px))',
              left: '50%', transform: 'translateX(-50%)',
              background: isDark ? 'rgba(20,20,30,0.9)' : 'rgba(255,255,255,0.9)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: isDark ? `0 4px 20px rgba(0,0,0,0.4)` : `0 4px 20px rgba(0,0,0,0.08)`,
            }}>
            <Wifi className="w-3 h-3" style={{ color: FOX_COLOR, transform: 'rotate(90deg)' }} />
            <span className={`text-[10px] font-bold ${isDark ? 'text-white/70' : 'text-gray-600'}`}>模拟碰卡</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom bar (complete phase only) */}
      {phase === 'complete' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex-shrink-0 relative z-20 backdrop-blur-xl"
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
            paddingTop: 10,
            background: isDark ? 'rgba(10,10,15,0.85)' : 'rgba(245,245,247,0.85)',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}>
          <div className="px-5">
            <div className="flex items-center gap-2 mb-2.5">
              <motion.div className="w-2 h-2 rounded-full flex-shrink-0" animate={{ background: FOX_COLOR }} />
              <p className={`text-sm font-bold truncate ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                小狐狸
                <span className={`text-[10px] font-normal ml-1.5 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>好奇宝宝</span>
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleGoHome}
                className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white"
                style={{
                  background: `linear-gradient(135deg, ${FOX_COLOR}, ${FOX_COLOR}CC)`,
                  boxShadow: `0 8px 32px ${FOX_COLOR}40`, minHeight: 48,
                }}>
                前往首页认识伙伴
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
