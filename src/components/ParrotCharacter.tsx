import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

type ParrotState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'sleeping' | 'greeting';
type AnimationMode = 'loop' | 'transition';

interface ParrotCharacterProps {
  state: ParrotState;
  size?: number; // scale factor, default 1 (192x208px). Use 0.3 for small inline.
  onWakeUp?: () => void;
}

export default function ParrotCharacter({ state, size = 1, onWakeUp }: ParrotCharacterProps) {
  const [currentState, setCurrentState] = useState<ParrotState>(state);
  const [previousState, setPreviousState] = useState<ParrotState>(state);
  const [animationMode, setAnimationMode] = useState<AnimationMode>('loop');
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  // Detect state change and play transition
  useEffect(() => {
    if (state !== currentState) {
      setPreviousState(currentState);
      setAnimationMode('transition');
      
      const transitionKey = `${currentState}-${state}`;
      const transitionDuration = (
        transitionKey === 'listening-sleeping' || transitionKey === 'sleeping-listening'
      ) ? 1200 : 800;
      
      const timer = setTimeout(() => {
        setCurrentState(state);
        setAnimationMode('loop');
      }, transitionDuration);
      return () => clearTimeout(timer);
    }
  }, [state, currentState]);

  // Random eye movement
  useEffect(() => {
    if (currentState === 'thinking') return;
    
    const moveInterval = setInterval(() => {
      setEyePosition({
        x: Math.random() * 6 - 3,
        y: Math.random() * 4 - 2,
      });
    }, 2500);
    
    return () => clearInterval(moveInterval);
  }, [currentState]);

  // Blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // ============================================
  // LOOP ANIMATIONS (idle state for each mode)
  // ============================================
  
  const bodyLoopAnimations = {
    listening: { 
      rotate: -15,
      y: [8, 12, 8],
      scale: 1.15,
      x: 0,
      transition: { 
        rotate: { duration: 0 },
        scale: { duration: 0 },
        x: { duration: 0 },
        y: { 
          duration: 1.8, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        }
      }
    },
    thinking: { 
      rotate: [8, -8, 8],
      y: [0, -4, 0],
      scale: 1.05,
      x: [0, 2, 0, -2, 0],
      transition: { 
        rotate: { 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        y: { 
          duration: 3.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        x: { 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        scale: { duration: 0 }
      }
    },
    speaking: { 
      y: [0, -6, 0, -4, 0],
      scale: [1, 1.06, 1, 1.04, 1],
      rotate: 0,
      x: 0,
      transition: { 
        rotate: { duration: 0 },
        x: { duration: 0 },
        y: { 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        scale: { 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        }
      }
    },
    sleeping: {
      rotate: 90,
      y: [0, 3, 0],
      scale: [1, 0.98, 1],
      x: 0,
      transition: { 
        rotate: { duration: 0 },
        x: { duration: 0 },
        y: { 
          duration: 2.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        scale: { 
          duration: 2.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        }
      }
    },
    greeting: {
      rotate: [0, 3, 0, -3, 0],
      y: [0, -4, 0, -4, 0],
      scale: 1.05,
      x: 0,
      transition: { 
        rotate: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatType: "loop" as const },
        y: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatType: "loop" as const },
        scale: { duration: 0 }
      }
    }
  };

  // ============================================
  // TRANSITION ANIMATIONS (listen→think→speak→listen)
  // ============================================
  
  const bodyTransitionAnimations: Record<string, any> = {
    'listening-thinking': {
      rotate: [-15, 0, 8],
      y: [8, 4, 0],
      scale: [1.15, 1.1, 1.05],
      x: [0, 1, 0],
      transition: { 
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'thinking-speaking': {
      rotate: [8, 4, 0],
      y: [0, -2, 0],
      scale: [1.05, 1.03, 1],
      x: [0, 0, 0],
      transition: { 
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'speaking-listening': {
      rotate: [0, -8, -15],
      y: [0, 4, 8],
      scale: [1, 1.08, 1.15],
      x: [0, 0, 0],
      transition: { 
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'listening-sleeping': {
      rotate: [-15, 0, 45, 90],
      y: [8, 4, 2, 0],
      scale: [1.15, 1.08, 1.04, 1],
      x: [0, 0, 0, 0],
      transition: { 
        duration: 1.2,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'sleeping-listening': {
      rotate: [90, 45, 0, -15],
      y: [0, 2, 4, 8],
      scale: [1, 1.04, 1.08, 1.15],
      x: [0, 0, 0, 0],
      transition: { 
        duration: 1.2,
        ease: [0.65, 0, 0.35, 1]
      }
    }
  };

  // Wing loop animations
  const leftWingLoopAnimations = {
    listening: { 
      rotate: -135,
      x: 16, 
      y: -6,
      transition: { duration: 0 }
    },
    thinking: { 
      rotate: [-10, -25, -10],
      x: 0, 
      y: 0,
      transition: { 
        rotate: { 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        x: { duration: 0 },
        y: { duration: 0 }
      }
    },
    speaking: { 
      rotate: [0, -18, 0, -12, 0],
      x: [0, -2, 0],
      y: 0,
      transition: { 
        rotate: { 
          duration: 2.2, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        x: { 
          duration: 2.2, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        y: { duration: 0 }
      }
    },
    sleeping: {
      rotate: 0,
      x: 0,
      y: 0,
      transition: { duration: 0 }
    },
    greeting: { 
      rotate: [-25, -55, -25, -45, -25],
      x: [0, -3, 0, -2, 0],
      y: -8,
      transition: { 
        rotate: { duration: 1.2, repeat: Infinity, ease: "easeInOut", repeatType: "loop" as const },
        x: { duration: 1.2, repeat: Infinity, ease: "easeInOut", repeatType: "loop" as const },
        y: { duration: 0 }
      }
    }
  };

  const leftWingTransitionAnimations: Record<string, any> = {
    'listening-thinking': {
      rotate: [-135, -90, -60, -10],
      x: [16, 12, 6, 0],
      y: [-6, -4, -2, 0],
      transition: { 
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'thinking-speaking': {
      rotate: [-10, -6, 0],
      x: [0, 0, 0],
      y: [0, 0, 0],
      transition: { 
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'speaking-listening': {
      rotate: [0, -45, -90, -135],
      x: [0, 6, 12, 16],
      y: [0, -2, -4, -6],
      transition: { 
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'listening-sleeping': {
      rotate: [-135, -90, -45, 0],
      x: [16, 12, 6, 0],
      y: [-6, -4, -2, 0],
      transition: { 
        duration: 1.2,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'sleeping-listening': {
      rotate: [0, -45, -90, -135],
      x: [0, 6, 12, 16],
      y: [0, -2, -4, -6],
      transition: { 
        duration: 1.2,
        ease: [0.65, 0, 0.35, 1]
      }
    }
  };

  const rightWingLoopAnimations = {
    listening: { 
      rotate: 0, 
      x: 0, 
      y: 0,
      transition: { duration: 0 }
    },
    thinking: { 
      rotate: 145,
      x: -16, 
      y: -12,
      transition: { duration: 0 }
    },
    speaking: { 
      rotate: [0, 18, 0, 12, 0],
      x: [0, 2, 0],
      y: 0,
      transition: { 
        rotate: { 
          duration: 2.2, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        x: { 
          duration: 2.2, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        },
        y: { duration: 0 }
      }
    },
    sleeping: {
      rotate: 0,
      x: 0,
      y: 0,
      transition: { duration: 0 }
    },
    greeting: {
      rotate: 0,
      x: 0,
      y: 0,
      transition: { duration: 0 }
    }
  };

  const rightWingTransitionAnimations: Record<string, any> = {
    'listening-thinking': {
      rotate: [0, 50, 100, 145],
      x: [0, -6, -12, -16],
      y: [0, -4, -8, -12],
      transition: { 
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'thinking-speaking': {
      rotate: [145, 100, 50, 0],
      x: [-16, -12, -6, 0],
      y: [-12, -8, -4, 0],
      transition: { 
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'speaking-listening': {
      rotate: [0, 0, 0],
      x: [0, 0, 0],
      y: [0, 0, 0],
      transition: { 
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'listening-sleeping': {
      rotate: [0, 50, 100, 145],
      x: [0, -6, -12, -16],
      y: [0, -4, -8, -12],
      transition: { 
        duration: 1.2,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    'sleeping-listening': {
      rotate: [0, 0, 0],
      x: [0, 0, 0],
      y: [0, 0, 0],
      transition: { 
        duration: 1.2,
        ease: [0.65, 0, 0.35, 1]
      }
    }
  };

  const beakLoopAnimations = {
    speaking: {
        scaleY: [1, 0.65, 1, 0.75, 1],
        transition: { 
          duration: 1.6, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop" as const
        }
    },
    listening: { 
      scaleY: 1,
      transition: { duration: 0 }
    },
    thinking: { 
      scaleY: 1,
      transition: { duration: 0 }
    },
    sleeping: {
      scaleY: 1,
      transition: { duration: 0 }
    },
    greeting: {
      scaleY: [1, 0.6, 1, 0.7, 1],
      transition: { 
        duration: 1.6, 
        repeat: Infinity, 
        ease: "easeInOut",
        repeatType: "loop" as const
      }
    }
  };

  const beakTransitionAnimations: Record<string, any> = {
    'listening-thinking': {
      scaleY: [1, 1],
      transition: { duration: 0.8 }
    },
    'thinking-speaking': {
      scaleY: [1, 0.9, 1],
      transition: { duration: 0.8 }
    },
    'speaking-listening': {
      scaleY: [1, 1],
      transition: { duration: 0.8 }
    },
    'listening-sleeping': {
      scaleY: [1, 1],
      transition: { duration: 1.2 }
    },
    'sleeping-listening': {
      scaleY: [1, 1],
      transition: { duration: 1.2 }
    }
  };

  // Determine which animation to use
  const transitionKey = `${previousState}-${state}`;
  
  const bodyAnimation = animationMode === 'loop'
    ? bodyLoopAnimations[currentState as keyof typeof bodyLoopAnimations]
    : bodyTransitionAnimations[transitionKey] || bodyLoopAnimations[currentState as keyof typeof bodyLoopAnimations];

  const leftWingAnimation = animationMode === 'loop'
    ? leftWingLoopAnimations[currentState as keyof typeof leftWingLoopAnimations]
    : leftWingTransitionAnimations[transitionKey] || leftWingLoopAnimations[currentState as keyof typeof leftWingLoopAnimations];

  const rightWingAnimation = animationMode === 'loop'
    ? rightWingLoopAnimations[currentState as keyof typeof rightWingLoopAnimations]
    : rightWingTransitionAnimations[transitionKey] || rightWingLoopAnimations[currentState as keyof typeof rightWingLoopAnimations];

  const beakAnimation = animationMode === 'loop'
    ? beakLoopAnimations[currentState as keyof typeof beakLoopAnimations]
    : beakTransitionAnimations[transitionKey] || beakLoopAnimations[currentState as keyof typeof beakLoopAnimations];

  return (
    <div className="relative flex items-center justify-center pointer-events-none overflow-visible"
      style={{ width: 192 * size, height: 208 * size }}>
      <div style={{ transform: `scale(${size})`, transformOrigin: 'center center', width: 192, height: 208 }}>
      <motion.div 
        className="relative w-48 h-52"
        animate={bodyAnimation}
        key={`body-${animationMode}-${transitionKey}-${currentState}`}
      >
        {/* Crest/Hair */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-full flex justify-center gap-1 z-0">
            <motion.div 
                className="w-6 h-12 bg-cyan-400 rounded-full origin-bottom border-2 border-cyan-500"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{ rotate: -15 }}
            />
            <motion.div 
                className="w-7 h-14 bg-cyan-500 rounded-full origin-bottom border-2 border-cyan-600 -ml-2 -mb-2"
                animate={{ rotate: [2, -2, 2] }}
                transition={{ duration: 2.8, repeat: Infinity }}
            />
             <motion.div 
                className="w-5 h-10 bg-cyan-400 rounded-full origin-bottom border-2 border-cyan-500 -ml-2"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ rotate: 15 }}
            />
        </div>

        {/* Body Shape */}
        <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-xl z-10 overflow-visible">
            {/* Main Body */}
            <path 
                d="M100 20 C 150 20, 190 60, 190 130 C 190 200, 150 215, 100 215 C 50 215, 10 200, 10 130 C 10 60, 50 20, 100 20 Z" 
                fill="#60A5FA" 
                stroke="#93C5FD" 
                strokeWidth="4"
            />
            {/* Belly Patch */}
            <path 
                d="M100 80 C 130 80, 150 110, 150 160 C 150 200, 130 210, 100 210 C 70 210, 50 200, 50 160 C 50 110, 70 80, 100 80 Z" 
                fill="#DBEAFE" 
                opacity="0.8"
            />
        </svg>

        {/* Eyes */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {/* Left Eye */}
            <div className="relative w-14 h-14 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                {currentState === 'sleeping' ? (
                    <div className="w-10 h-1 bg-slate-800 rounded-full" />
                ) : !blink ? (
                    <motion.div 
                        className="w-6 h-6 bg-slate-800 rounded-full relative"
                        animate={currentState === 'thinking' ? { x: [0, 3, 0, -3, 0], y: [-3, 0, 3, 0, -3] } : eyePosition}
                        transition={currentState === 'thinking' ? { duration: 2.5, repeat: Infinity } : { type: "spring", stiffness: 150, damping: 20 }}
                    >
                        <div className="absolute top-1 right-1.5 w-2 h-2 bg-white rounded-full opacity-90" />
                    </motion.div>
                ) : (
                    <div className="w-8 h-1 bg-slate-800 rounded-full" />
                )}
            </div>
            {/* Right Eye */}
            <div className="relative w-14 h-14 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                {currentState === 'sleeping' ? (
                    <div className="w-10 h-1 bg-slate-800 rounded-full" />
                ) : !blink ? (
                     <motion.div 
                        className="w-6 h-6 bg-slate-800 rounded-full relative"
                        animate={currentState === 'thinking' ? { x: [0, 3, 0, -3, 0], y: [-3, 0, 3, 0, -3] } : eyePosition}
                        transition={currentState === 'thinking' ? { duration: 2.5, repeat: Infinity } : { type: "spring", stiffness: 150, damping: 20 }}
                    >
                        <div className="absolute top-1 right-1.5 w-2 h-2 bg-white rounded-full opacity-90" />
                    </motion.div>
                ) : (
                    <div className="w-8 h-1 bg-slate-800 rounded-full" />
                )}
            </div>
        </div>

        {/* Blush */}
        <div className="absolute top-28 left-8 w-6 h-4 bg-pink-300 rounded-full opacity-40 blur-md z-20" />
        <div className="absolute top-28 right-8 w-6 h-4 bg-pink-300 rounded-full opacity-40 blur-md z-20" />

        {/* Beak */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <motion.div 
              className="relative" 
              animate={beakAnimation}
              key={`beak-${animationMode}-${transitionKey}-${currentState}`}
            >
                {/* Upper Beak */}
                <svg width="40" height="30" viewBox="0 0 40 30" className="drop-shadow-sm">
                    <path d="M5 5 Q 20 -5, 35 5 Q 40 15, 20 28 Q 0 15, 5 5 Z" fill="#F97316" />
                    <path d="M12 8 Q 15 6, 18 8" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M22 8 Q 25 6, 28 8" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M10 5 Q 20 0, 30 5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                </svg>
                {/* Lower Beak */}
                <svg width="24" height="15" viewBox="0 0 24 15" className="-mt-1 mx-auto">
                    <path d="M2 2 Q 12 15, 22 2 Q 12 5, 2 2 Z" fill="#FB923C" />
                </svg>
            </motion.div>
        </div>

        {/* Wings/Hands */}
        {/* Left Wing */}
        <motion.div 
            className="absolute top-36 -left-6 z-20 origin-top-right"
            animate={leftWingAnimation}
            key={`left-wing-${animationMode}-${transitionKey}-${currentState}`}
        >
             <svg width="50" height="70" viewBox="0 0 50 70">
                <path d="M45 5 C 10 5, 0 30, 5 60 C 20 65, 45 60, 45 5 Z" fill="#3B82F6" stroke="#2563EB" strokeWidth="2" />
             </svg>
        </motion.div>

        {/* Right Wing */}
        <motion.div 
            className="absolute top-36 -right-6 z-20 origin-top-left"
            animate={rightWingAnimation}
            key={`right-wing-${animationMode}-${transitionKey}-${currentState}`}
        >
            <svg width="50" height="70" viewBox="0 0 50 70" style={{ transform: 'scaleX(-1)' }}>
                <path d="M45 5 C 10 5, 0 30, 5 60 C 20 65, 45 60, 45 5 Z" fill="#3B82F6" stroke="#2563EB" strokeWidth="2" />
             </svg>
        </motion.div>

        {/* Feet */}
        <div className="absolute bottom-1 left-12 z-0">
             <svg width="30" height="20" viewBox="0 0 30 20">
                <path d="M5 5 Q 10 15, 15 5 Q 20 15, 25 5" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
             </svg>
        </div>
        <div className="absolute bottom-1 right-12 z-0">
             <svg width="30" height="20" viewBox="0 0 30 20">
                <path d="M5 5 Q 10 15, 15 5 Q 20 15, 25 5" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
             </svg>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
