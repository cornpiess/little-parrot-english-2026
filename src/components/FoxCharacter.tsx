import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

type FoxState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'sleeping' | 'greeting';
type AnimationMode = 'loop' | 'transition';

interface FoxCharacterProps {
  state: FoxState;
  size?: number;
  onWakeUp?: () => void;
}

export default function FoxCharacter({ state, size = 1, onWakeUp }: FoxCharacterProps) {
  const [currentState, setCurrentState] = useState<FoxState>(state);
  const [previousState, setPreviousState] = useState<FoxState>(state);
  const [animationMode, setAnimationMode] = useState<AnimationMode>('loop');
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (state !== currentState) {
      setPreviousState(currentState);
      setAnimationMode('transition');
      const dur = (
        `${currentState}-${state}` === 'listening-sleeping' ||
        `${currentState}-${state}` === 'sleeping-listening'
      ) ? 1200 : 800;
      const timer = setTimeout(() => {
        setCurrentState(state);
        setAnimationMode('loop');
      }, dur);
      return () => clearTimeout(timer);
    }
  }, [state, currentState]);

  // Random eye movement
  useEffect(() => {
    if (currentState === 'thinking') return;
    const interval = setInterval(() => {
      setEyePosition({ x: Math.random() * 6 - 3, y: Math.random() * 4 - 2 });
    }, 2500);
    return () => clearInterval(interval);
  }, [currentState]);

  // Blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const bodyLoopAnimations: Record<string, any> = {
    idle: {
      y: [0, -4, 0], rotate: 0, scale: 1, x: 0,
      transition: { y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    },
    listening: {
      rotate: -12, y: [8, 12, 8], scale: 1.1, x: 0,
      transition: {
        rotate: { duration: 0 }, scale: { duration: 0 }, x: { duration: 0 },
        y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    thinking: {
      rotate: [6, -6, 6], y: [0, -4, 0], scale: 1.05, x: [0, 2, 0, -2, 0],
      transition: {
        rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 0 },
      },
    },
    speaking: {
      y: [0, -6, 0, -4, 0], scale: [1, 1.06, 1, 1.04, 1], rotate: 0, x: 0,
      transition: {
        rotate: { duration: 0 }, x: { duration: 0 },
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    sleeping: {
      rotate: 90, y: [0, 3, 0], scale: [1, 0.98, 1], x: 0,
      transition: {
        rotate: { duration: 0 }, x: { duration: 0 },
        y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    greeting: {
      rotate: [0, 3, 0, -3, 0],
      y: [0, -4, 0, -4, 0],
      scale: 1.05,
      x: 0,
      transition: {
        rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 0 }
      },
    },
  };

  const bodyTransitionAnimations: Record<string, any> = {
    'listening-thinking': {
      rotate: [-12, 0, 6], y: [8, 4, 0], scale: [1.1, 1.08, 1.05], x: [0, 1, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'thinking-speaking': {
      rotate: [6, 3, 0], y: [0, -2, 0], scale: [1.05, 1.03, 1], x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'speaking-listening': {
      rotate: [0, -6, -12], y: [0, 4, 8], scale: [1, 1.05, 1.1], x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'listening-sleeping': {
      rotate: [-12, 0, 45, 90], y: [8, 4, 2, 0], scale: [1.1, 1.05, 1.02, 1], x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
    'sleeping-listening': {
      rotate: [90, 45, 0, -12], y: [0, 2, 4, 8], scale: [1, 1.02, 1.05, 1.1], x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
  };

  // Tail animations
  const tailLoopAnimations: Record<string, any> = {
    idle: {
      rotate: [0, 8, -5, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    listening: {
      rotate: [0, 15, -8, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    thinking: {
      rotate: [-5, 5, -5],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    speaking: {
      rotate: [0, 20, -10, 15, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    sleeping: {
      rotate: [0, 2, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    greeting: {
      rotate: [0, 18, -8, 15, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
  };

  // Ear animations
  const earLoopAnimations: Record<string, any> = {
    idle: {
      rotate: [0, -3, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    listening: {
      rotate: [0, -8, 0, -5, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    thinking: {
      rotate: [-5, 5, -5],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    speaking: {
      rotate: [0, -5, 3, -5, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    sleeping: {
      rotate: 15,
      transition: { duration: 0.8 },
    },
    greeting: {
      rotate: [0, -6, 0, -4, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
  };

  // Mouth animations for speaking
  const mouthLoopAnimations: Record<string, any> = {
    speaking: {
      scaleY: [1, 0.5, 1, 0.7, 1],
      transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    idle: { scaleY: 1, transition: { duration: 0 } },
    listening: { scaleY: 1, transition: { duration: 0 } },
    thinking: { scaleY: 1, transition: { duration: 0 } },
    sleeping: { scaleY: 1, transition: { duration: 0 } },
    greeting: {
      scaleY: [1, 0.5, 1, 0.7, 1],
      transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
  };

  const transitionKey = `${previousState}-${state}`;

  const bodyAnim = animationMode === 'loop'
    ? bodyLoopAnimations[currentState]
    : bodyTransitionAnimations[transitionKey] || bodyLoopAnimations[currentState];

  const tailAnim = tailLoopAnimations[currentState];
  const earAnim = earLoopAnimations[currentState];
  const mouthAnim = mouthLoopAnimations[currentState];

  return (
    <div
      className="relative flex items-center justify-center pointer-events-none overflow-visible"
      style={{ width: 192 * size, height: 208 * size }}
    >
      <div style={{ transform: `scale(${size})`, transformOrigin: 'center center', width: 192, height: 208 }}>
        <motion.div
          className="relative w-48 h-52"
          animate={bodyAnim}
          key={`fox-body-${animationMode}-${transitionKey}-${currentState}`}
        >
          {/* Ears */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-full flex justify-center gap-8 z-0">
            {/* Left Ear */}
            <motion.div
              className="origin-bottom"
              animate={earAnim}
              key={`fox-ear-l-${currentState}`}
            >
              <svg width="36" height="48" viewBox="0 0 36 48">
                <path d="M18 0 L34 44 Q28 48, 18 48 Q8 48, 2 44 Z" fill="#C45A2C" />
                <path d="M18 8 L28 40 Q24 44, 18 44 Q12 44, 8 40 Z" fill="#F5D6B8" opacity="0.7" />
              </svg>
            </motion.div>
            {/* Right Ear */}
            <motion.div
              className="origin-bottom"
              animate={{ ...earAnim, rotate: earAnim.rotate ? (Array.isArray(earAnim.rotate) ? earAnim.rotate.map((r: number) => -r) : -earAnim.rotate) : 0 }}
              key={`fox-ear-r-${currentState}`}
            >
              <svg width="36" height="48" viewBox="0 0 36 48">
                <path d="M18 0 L34 44 Q28 48, 18 48 Q8 48, 2 44 Z" fill="#C45A2C" />
                <path d="M18 8 L28 40 Q24 44, 18 44 Q12 44, 8 40 Z" fill="#F5D6B8" opacity="0.7" />
              </svg>
            </motion.div>
          </div>

          {/* Body Shape */}
          <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-xl z-10 overflow-visible">
            {/* Main Body */}
            <path
              d="M100 25 C 155 25, 190 65, 190 135 C 190 200, 155 215, 100 215 C 45 215, 10 200, 10 135 C 10 65, 45 25, 100 25 Z"
              fill="#D4652B"
              stroke="#B8541F"
              strokeWidth="3"
            />
            {/* Belly/Chest Patch - cream white */}
            <path
              d="M100 85 C 135 85, 155 115, 155 160 C 155 200, 135 212, 100 212 C 65 212, 45 200, 45 160 C 45 115, 65 85, 100 85 Z"
              fill="#FFF3E0"
              opacity="0.9"
            />
            {/* Face shape - lighter orange cheeks */}
            <ellipse cx="60" cy="88" rx="22" ry="18" fill="#E07B3C" opacity="0.6" />
            <ellipse cx="140" cy="88" rx="22" ry="18" fill="#E07B3C" opacity="0.6" />
            {/* White face markings */}
            <path
              d="M100 55 C 115 55, 128 65, 128 80 L 128 105 Q 115 118, 100 118 Q 85 118, 72 105 L 72 80 C 72 65, 85 55, 100 55 Z"
              fill="#FDEBD0"
              opacity="0.7"
            />
          </svg>

          {/* Eyes */}
          <div className="absolute top-[72px] left-1/2 -translate-x-1/2 flex gap-5 z-20">
            {/* Left Eye */}
            <div className="relative w-12 h-12 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden"
              style={{ borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%' }}>
              {currentState === 'sleeping' ? (
                <div className="w-9 h-[2px] bg-slate-700 rounded-full" />
              ) : !blink ? (
                <motion.div
                  className="w-5 h-5 rounded-full relative"
                  style={{ background: '#2D5A27' }}
                  animate={currentState === 'thinking' ? { x: [0, 3, 0, -3, 0], y: [-3, 0, 3, 0, -3] } : eyePosition}
                  transition={currentState === 'thinking' ? { duration: 2.5, repeat: Infinity } : { type: 'spring', stiffness: 150, damping: 20 }}
                >
                  <div className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
                  <div className="absolute bottom-1 left-0.5 w-1 h-1 bg-white/40 rounded-full" />
                </motion.div>
              ) : (
                <div className="w-7 h-[2px] bg-slate-700 rounded-full" />
              )}
            </div>
            {/* Right Eye */}
            <div className="relative w-12 h-12 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden"
              style={{ borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%' }}>
              {currentState === 'sleeping' ? (
                <div className="w-9 h-[2px] bg-slate-700 rounded-full" />
              ) : !blink ? (
                <motion.div
                  className="w-5 h-5 rounded-full relative"
                  style={{ background: '#2D5A27' }}
                  animate={currentState === 'thinking' ? { x: [0, 3, 0, -3, 0], y: [-3, 0, 3, 0, -3] } : eyePosition}
                  transition={currentState === 'thinking' ? { duration: 2.5, repeat: Infinity } : { type: 'spring', stiffness: 150, damping: 20 }}
                >
                  <div className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
                  <div className="absolute bottom-1 left-0.5 w-1 h-1 bg-white/40 rounded-full" />
                </motion.div>
              ) : (
                <div className="w-7 h-[2px] bg-slate-700 rounded-full" />
              )}
            </div>
          </div>

          {/* Eyebrows - slightly mischievous */}
          <div className="absolute top-[62px] left-1/2 -translate-x-1/2 flex gap-10 z-20">
            <div className="w-8 h-[3px] rounded-full bg-[#6B3A1F] -rotate-6" />
            <div className="w-8 h-[3px] rounded-full bg-[#6B3A1F] rotate-6" />
          </div>

          {/* Blush */}
          <div className="absolute top-[100px] left-[26px] w-7 h-4 bg-orange-300 rounded-full opacity-30 blur-md z-20" />
          <div className="absolute top-[100px] right-[26px] w-7 h-4 bg-orange-300 rounded-full opacity-30 blur-md z-20" />

          {/* Nose */}
          <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-30">
            <svg width="16" height="12" viewBox="0 0 16 12">
              <ellipse cx="8" cy="6" rx="7" ry="5" fill="#2C1810" />
              <ellipse cx="6" cy="4" rx="2" ry="1.5" fill="#4A3228" opacity="0.5" />
            </svg>
          </div>

          {/* Mouth */}
          <div className="absolute top-[110px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <motion.div
              animate={mouthAnim}
              key={`fox-mouth-${animationMode}-${currentState}`}
            >
              {currentState === 'speaking' ? (
                <svg width="28" height="18" viewBox="0 0 28 18">
                  <path d="M4 4 Q 14 18, 24 4" fill="#C44040" stroke="#A03030" strokeWidth="1" />
                  <path d="M8 6 Q 14 0, 20 6" fill="none" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : currentState === 'sleeping' ? (
                <svg width="20" height="6" viewBox="0 0 20 6">
                  <path d="M2 3 Q 10 6, 18 3" fill="none" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="24" height="10" viewBox="0 0 24 10">
                  {/* Sly fox smirk */}
                  <path d="M4 3 Q 8 3, 12 5 Q 16 3, 20 2" fill="none" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </motion.div>
          </div>

          {/* Arms/Paws */}
          {/* Left Paw */}
          <motion.div
            className="absolute top-[140px] -left-3 z-20 origin-top-right"
            animate={currentState === 'speaking' ? {
              rotate: [0, -15, 0, -10, 0],
              transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
            } : currentState === 'greeting' ? {
              rotate: [-20, -55, -20, -45, -20],
              x: [0, -3, 0, -2, 0],
              y: -8,
              transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
            } : currentState === 'listening' ? {
              rotate: -20, x: 5,
              transition: { duration: 0.5 },
            } : currentState === 'thinking' ? {
              rotate: [-5, -15, -5],
              x: [0, 3, 0],
              transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
            } : {
              rotate: 0, x: 0,
              transition: { duration: 0.5 },
            }}
            key={`fox-lpaw-${currentState}`}
          >
            <svg width="38" height="55" viewBox="0 0 38 55">
              <path d="M34 5 C 8 8, 2 28, 6 48 Q 14 55, 24 52 C 34 48, 38 28, 34 5 Z" fill="#D4652B" stroke="#B8541F" strokeWidth="2" />
              <ellipse cx="15" cy="50" rx="8" ry="5" fill="#FFF3E0" opacity="0.8" />
            </svg>
          </motion.div>

          {/* Right Paw */}
          <motion.div
            className="absolute top-[140px] -right-3 z-20 origin-top-left"
            animate={currentState === 'speaking' ? {
              rotate: [0, 15, 0, 10, 0],
              transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
            } : currentState === 'greeting' ? {
              rotate: 0, x: 0, y: 0,
              transition: { duration: 0.5 },
            } : currentState === 'thinking' ? {
              rotate: 25, x: -8, y: -10,
              transition: { duration: 0.5 },
            } : {
              rotate: 0, x: 0, y: 0,
              transition: { duration: 0.5 },
            }}
            key={`fox-rpaw-${currentState}`}
          >
            <svg width="38" height="55" viewBox="0 0 38 55" style={{ transform: 'scaleX(-1)' }}>
              <path d="M34 5 C 8 8, 2 28, 6 48 Q 14 55, 24 52 C 34 48, 38 28, 34 5 Z" fill="#D4652B" stroke="#B8541F" strokeWidth="2" />
              <ellipse cx="15" cy="50" rx="8" ry="5" fill="#FFF3E0" opacity="0.8" />
            </svg>
          </motion.div>

          {/* Tail */}
          <motion.div
            className="absolute -bottom-2 -right-8 z-0 origin-left"
            animate={tailAnim}
            key={`fox-tail-${currentState}`}
          >
            <svg width="70" height="50" viewBox="0 0 70 50">
              <path d="M5 40 Q 15 10, 40 5 Q 60 0, 68 15 Q 72 25, 60 30 Q 45 35, 30 38 Q 15 42, 5 40 Z"
                fill="#D4652B" stroke="#B8541F" strokeWidth="1.5" />
              <path d="M55 12 Q 65 18, 58 26 Q 48 32, 35 35"
                fill="#FFF3E0" opacity="0.8" stroke="none" />
            </svg>
          </motion.div>

          {/* Feet */}
          <div className="absolute bottom-1 left-12 z-0">
            <svg width="28" height="16" viewBox="0 0 28 16">
              <ellipse cx="14" cy="10" rx="12" ry="6" fill="#2C1810" />
              <ellipse cx="14" cy="9" rx="10" ry="5" fill="#FFF3E0" opacity="0.6" />
            </svg>
          </div>
          <div className="absolute bottom-1 right-12 z-0">
            <svg width="28" height="16" viewBox="0 0 28 16">
              <ellipse cx="14" cy="10" rx="12" ry="6" fill="#2C1810" />
              <ellipse cx="14" cy="9" rx="10" ry="5" fill="#FFF3E0" opacity="0.6" />
            </svg>
          </div>

          {/* Sleeping Zzz */}
          {currentState === 'sleeping' && (
            <>
              <motion.span
                className="absolute -top-4 right-2 text-lg font-bold"
                style={{ color: 'rgba(100,100,120,0.5)' }}
                animate={{ y: [-5, -20], opacity: [1, 0], scale: [0.8, 1.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💤
              </motion.span>
              <motion.span
                className="absolute -top-8 right-6 text-sm"
                style={{ color: 'rgba(100,100,120,0.4)' }}
                animate={{ y: [-3, -22], opacity: [0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
              >
                💤
              </motion.span>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
