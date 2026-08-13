import { motion, type TargetAndTransition } from 'motion/react';
import { useEffect, useState } from 'react';
import type { MascotState } from './ParrotCharacter';

// ============================================================
// 小恐龙（DinoCharacter）——单张连续 SVG，头颈一体绝不分离。
// 经典幼龙造型：大头 + 圆滚滚身体 + 背部棘刺 + 翘尾巴 +
// 迷你小短爪 + 大脚丫。动作与小鹦鹉/狐狸/雪宝对齐，
// 身体 / 尾巴 / 小短爪 / 头（含嘴）四部位独立驱动。
// ============================================================

type AnimTable = Partial<Record<MascotState, TargetAndTransition>>;
type TransitionTable = Record<string, TargetAndTransition>;
type AnimationMode = 'loop' | 'transition';

const TRANSITION_PAIRS = new Set([
  'listening-thinking',
  'thinking-speaking',
  'speaking-listening',
  'listening-sleeping',
  'sleeping-listening',
]);
function hasTransition(pair: string) {
  return TRANSITION_PAIRS.has(pair);
}

interface DinoCharacterProps {
  state: MascotState;
  size?: number;
  onWakeUp?: () => void;
  held?: string;
  looking?: boolean;
}

export default function DinoCharacter({ state, size = 1, onWakeUp, held, looking = true }: DinoCharacterProps) {
  const [currentState, setCurrentState] = useState<MascotState>(state);
  const [previousState, setPreviousState] = useState<MascotState>(state);
  const [animationMode, setAnimationMode] = useState<AnimationMode>('loop');
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (state !== currentState) {
      setPreviousState(currentState);
      const transitionKey = `${currentState}-${state}`;
      if (hasTransition(transitionKey)) {
        setAnimationMode('transition');
        const transitionDuration = (
          transitionKey === 'listening-sleeping' || transitionKey === 'sleeping-listening'
        ) ? 1200 : 800;
        const timer = setTimeout(() => {
          setCurrentState(state);
          setAnimationMode('loop');
        }, transitionDuration);
        return () => clearTimeout(timer);
      }
      setCurrentState(state);
      setAnimationMode('loop');
    }
  }, [state, currentState]);

  useEffect(() => {
    if (currentState === 'thinking' || currentState === 'dizzy') return;
    if (looking) return;
    const moveInterval = setInterval(() => {
      setEyePosition({ x: Math.random() * 6 - 3, y: Math.random() * 4 - 2 });
    }, 2500);
    return () => clearInterval(moveInterval);
  }, [currentState, looking]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // ========== 身体循环动画 ==========
  const bodyLoopAnimations: AnimTable = {
    idle: {
      rotate: [0, 1.5, 0, -1.5, 0],
      y: [0, -3, 0],
      scale: [1, 1.02, 1],
      x: 0,
      transition: {
        rotate: { duration: 4.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    listening: {
      rotate: -14,
      y: [8, 12, 8],
      scale: 1.15,
      x: 0,
      transition: {
        rotate: { duration: 0 },
        scale: { duration: 0 },
        x: { duration: 0 },
        y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    thinking: {
      rotate: [8, -8, 8],
      y: [0, -4, 0],
      scale: 1.05,
      x: [0, 2, 0, -2, 0],
      transition: {
        rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 0 },
      },
    },
    speaking: {
      y: [0, -6, 0, -4, 0],
      scale: [1, 1.06, 1, 1.04, 1],
      rotate: 0,
      x: 0,
      transition: {
        rotate: { duration: 0 },
        x: { duration: 0 },
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    sleeping: {
      rotate: 90,
      y: [0, 3, 0],
      scale: [1, 0.98, 1],
      x: 0,
      transition: {
        rotate: { duration: 0 },
        x: { duration: 0 },
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
        scale: { duration: 0 },
        x: { duration: 0 },
      },
    },
    clap: {
      rotate: 0,
      y: [0, -3, 0],
      scale: 1,
      x: 0,
      transition: {
        rotate: { duration: 0 },
        scale: { duration: 0 },
        x: { duration: 0 },
        y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    wave: {
      rotate: [0, 2, 0, -2, 0],
      y: [0, -3, 0],
      scale: 1,
      x: 0,
      transition: {
        rotate: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 0 },
        x: { duration: 0 },
      },
    },
    dance: {
      rotate: [-8, 8, -8],
      y: [0, -8, 0],
      scale: 1,
      x: 0,
      transition: {
        rotate: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 0 },
        x: { duration: 0 },
      },
    },
    bounce: {
      rotate: 0,
      y: [0, -16, 0],
      scaleY: [1, 1.07, 0.97],
      scaleX: [1, 0.98, 1.02],
      x: 0,
      transition: {
        rotate: { duration: 0 },
        x: { duration: 0 },
        y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scaleY: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scaleX: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    nod: {
      rotate: 0,
      y: [0, 6, 0],
      scaleY: [1, 0.94, 1],
      scaleX: 1,
      x: 0,
      transition: {
        rotate: { duration: 0 },
        x: { duration: 0 },
        y: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scaleY: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scaleX: { duration: 0 },
      },
    },
    spin: {
      rotate: 360,
      y: [0, -4, 0],
      scale: [1, 1.06, 1],
      x: 0,
      transition: {
        rotate: { duration: 1.1, repeat: Infinity, ease: 'linear', repeatType: 'loop' as const },
        y: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
      },
    },
    hearts: {
      rotate: 0,
      y: [0, -4, 0],
      scale: 1,
      x: 0,
      transition: {
        rotate: { duration: 0 },
        scale: { duration: 0 },
        x: { duration: 0 },
        y: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    excited: {
      rotate: [-3, 3, -3],
      y: [0, -8, 0, -5, 0],
      scale: [1, 1.04, 1, 1.03, 1],
      x: 0,
      transition: {
        rotate: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
      },
    },
    surprised: {
      rotate: 0,
      y: [0, -5, 0, -3, 0],
      scale: [1, 1.12, 1, 1.08, 1],
      x: 0,
      transition: {
        rotate: { duration: 0 },
        x: { duration: 0 },
        y: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    happy: {
      rotate: 0,
      y: [0, -6, 0, -3, 0],
      scale: [1, 1.05, 1, 1.02, 1],
      x: 0,
      transition: {
        rotate: { duration: 0 },
        scale: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    fly: {
      rotate: 0,
      y: [0, -12, -20, -12, 0],
      scale: [1, 1.03, 1.05, 1.03, 1],
      x: 0,
      transition: {
        rotate: { duration: 0 },
        x: { duration: 0 },
        scale: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    cheer: {
      rotate: [-4, 4, -4],
      y: [0, -14, 0],
      scaleY: [1, 1.06, 0.97],
      scaleX: [1, 0.98, 1.02],
      x: 0,
      transition: {
        rotate: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scaleY: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scaleX: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
      },
    },
    shake: {
      rotate: [-14, 14, -14, 14, -14, 0],
      y: [0, 2, 0, 2, 0, 0],
      scale: 1,
      x: 0,
      transition: {
        rotate: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 0 },
        x: { duration: 0 },
      },
    },
    dizzy: {
      rotate: [-10, 16, -14, 10, -10],
      y: [0, 4, 0, 4, 0],
      scale: [1.02, 1.04, 1.02, 1.04, 1.02],
      x: 0,
      transition: {
        rotate: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
      },
    },
    shy: {
      rotate: [0, -8, -14, -8, 0],
      y: [0, 6, 10, 6, 0],
      scale: [1.05, 1.1, 1.12, 1.1, 1.05],
      x: 0,
      transition: {
        rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
      },
    },
    peek: {
      rotate: 0,
      y: [0, 4, 0],
      scale: [1.06, 1.1, 1.06],
      x: 0,
      transition: {
        rotate: { duration: 0 },
        scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
      },
    },
  };

  const bodyTransitionAnimations: TransitionTable = {
    'listening-thinking': {
      rotate: [-14, 0, 8], y: [8, 4, 0], scale: [1.15, 1.1, 1.05], x: [0, 1, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'thinking-speaking': {
      rotate: [8, 4, 0], y: [0, -2, 0], scale: [1.05, 1.03, 1], x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'speaking-listening': {
      rotate: [0, -7, -14], y: [0, 4, 8], scale: [1, 1.08, 1.15], x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'listening-sleeping': {
      rotate: [-14, 0, 45, 90], y: [8, 4, 2, 0], scale: [1.15, 1.08, 1.03, 1], x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
    'sleeping-listening': {
      rotate: [90, 45, 0, -14], y: [0, 2, 4, 8], scale: [1, 1.03, 1.08, 1.15], x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
  };

  // ========== 尾巴（绕根部甩动） ==========
  const tailLoopAnimations: AnimTable = {
    idle: { rotate: [0, 7, -4, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    listening: { rotate: [0, 14, -6, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    thinking: { rotate: [-5, 5, -5], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    speaking: { rotate: [0, 18, -9, 13, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    sleeping: { rotate: [0, 2, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    greeting: { rotate: [0, 20, -8, 16, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { rotate: [0, 14, -6, 12, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { rotate: [0, 12, -8, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { rotate: [0, 24, -14, 20, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { rotate: [0, 10, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { rotate: [0, 6, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { rotate: [0, 30, -20, 15, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    hearts: { rotate: [0, 16, -6, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { rotate: [0, 22, -12, 18, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { rotate: [0, 6, -4, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    happy: { rotate: [0, 18, -8, 14, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { rotate: [0, 10, -6, 0], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { rotate: [0, 26, -14, 20, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { rotate: [0, 12, -8, 0], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dizzy: { rotate: [0, 25, -18, 20, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shy: { rotate: [0, -10, -4, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { rotate: [0, 10, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  // ========== 头（大头，绕脖子根部倾斜，绝不分离） ==========
  const headLoopAnimations: AnimTable = {
    idle: { rotate: [0, -2, 2, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    listening: { rotate: [0, -6, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    thinking: { rotate: [-7, 7, -7], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    speaking: { rotate: [0, 3, -3, 0], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    sleeping: { rotate: 10, transition: { duration: 0.8 } },
    greeting: { rotate: [0, 5, 0, -3, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { rotate: [0, 3, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { rotate: [0, 5, 0, -5, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { rotate: [-6, 6, -6], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { rotate: [0, -4, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { rotate: [8, -6, 8], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { rotate: 360, transition: { duration: 1.1, repeat: Infinity, ease: 'linear', repeatType: 'loop' as const } },
    hearts: { rotate: [0, 4, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { rotate: [-4, 4, -4], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { rotate: [0, 6, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    happy: { rotate: [0, 4, -2, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { rotate: [0, 4, 0], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { rotate: [0, -4, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { rotate: [-10, 10, -10], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dizzy: { rotate: [8, -6, 7, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shy: { rotate: [-6, -2, -6], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { rotate: [0, 6, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  // ========== 迷你小短爪 ==========
  const armLoopAnimations: AnimTable = {
    idle: { rotate: [0, -5, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    listening: { rotate: -15, transition: { duration: 0.5 } },
    thinking: { rotate: [0, -12, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    speaking: { rotate: [0, -8, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    sleeping: { rotate: 0, transition: { duration: 0.5 } },
    greeting: { rotate: [-25, -60, -25, -50, -25], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { rotate: [-35, -5, -35], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { rotate: [-20, -65, -20, -50, -20], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { rotate: [-15, -45, -15], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { rotate: [0, -30, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { rotate: [-5, -15, -5], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { rotate: [0, -30, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    hearts: { rotate: [-10, -35, -10], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { rotate: [0, -30, 0, -15, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { rotate: -40, transition: { duration: 0.5 } },
    happy: { rotate: [-10, -35, -10], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { rotate: [-15, -50, -15], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { rotate: [-45, -80, -45], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { rotate: [-10, -25, -10], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dizzy: { rotate: [-15, -50, -15], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shy: { rotate: [0, -25, -40, -25, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { rotate: [-15, -45, -15], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  // ========== 嘴 ==========
  const mouthLoopAnimations: AnimTable = {
    speaking: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    idle: { scaleY: 1, transition: { duration: 0 } },
    listening: { scaleY: 1, transition: { duration: 0 } },
    thinking: { scaleY: 1, transition: { duration: 0 } },
    sleeping: { scaleY: 1, transition: { duration: 0 } },
    greeting: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    hearts: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { scaleY: [1, 1.6, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    happy: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { scaleY: 1, transition: { duration: 0 } },
    dizzy: { scaleY: 1, transition: { duration: 0 } },
    shy: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { scaleY: [1, 0.4, 1, 0.7, 1], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  // 瞳孔
  function pupilAnim(s: MascotState) {
    if (s === 'thinking') return { x: [0, 3, 0, -3, 0], y: [-3, 0, 3, 0, -3] };
    if (s === 'dizzy') return { x: [0, 4, 0, -4, 0], y: [-4, 0, 4, 0, -4] };
    if (s === 'surprised') return { x: [0, 1, 0], y: [-1, -1, -1] };
    return eyePosition;
  }
  function pupilTransition(s: MascotState) {
    if (s === 'thinking' || s === 'dizzy') return { duration: s === 'dizzy' ? 1.1 : 2.5, repeat: Infinity, ease: 'linear' as const };
    return { type: 'spring', stiffness: 150, damping: 20 };
  }
  // 腮红
  function blushAnim(s: MascotState) {
    if (s === 'shy') return { opacity: [0.35, 0.9, 0.35], scale: [1, 1.25, 1] };
    if (s === 'happy' || s === 'hearts' || s === 'excited') return { opacity: [0.35, 0.7, 0.35], scale: [1, 1.15, 1] };
    return { opacity: 0.35, scale: 1 };
  }

  const transitionKey = `${previousState}-${state}`;
  const bodyAnim = animationMode === 'loop'
    ? bodyLoopAnimations[currentState]
    : bodyTransitionAnimations[transitionKey] || bodyLoopAnimations[currentState];
  const tailAnim = tailLoopAnimations[currentState];
  const headAnim = headLoopAnimations[currentState];
  const armAnim = armLoopAnimations[currentState];
  const mouthAnim = mouthLoopAnimations[currentState];

  const eyeClosed = currentState === 'sleeping';
  const showSurprise = currentState === 'surprised';
  const showO = currentState === 'surprised';
  const isDizzy = currentState === 'dizzy';
  const isHappy = ['happy', 'excited', 'cheer', 'hearts'].includes(currentState) && !eyeClosed;

  return (
    <motion.div
      style={{ transformOrigin: 'center bottom' }}
      animate={{ scale: size }}
      transition={{ scale: { type: 'spring', stiffness: 260, damping: 20 } }}
    >
      <motion.svg
        viewBox="0 0 800 900"
        width="200"
        height="225"
        animate={bodyAnim}
        style={{ transformOrigin: 'center bottom' }}
      >
        <defs>
          <linearGradient id="dino-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A5D661" />
            <stop offset="55%" stopColor="#8BC34A" />
            <stop offset="100%" stopColor="#6FA835" />
          </linearGradient>
          <linearGradient id="dino-spike" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFCC80" />
            <stop offset="100%" stopColor="#FFB74D" />
          </linearGradient>
          <filter id="dino-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Shadow */}
        <ellipse cx="400" cy="850" rx="190" ry="24" fill="#030712" filter="url(#dino-shadow)" opacity="0.55" />

        {/* 尾巴（绕根部甩动，在身体之后） */}
        <motion.g style={{ transformOrigin: '545px 600px' }} animate={tailAnim}>
          <path d="M 545 590 C 630 572, 692 555, 726 515 C 752 485, 766 452, 757 442 C 749 434, 740 448, 733 470 C 722 506, 694 538, 612 550 C 582 556, 558 556, 546 552 Z"
            fill="url(#dino-body)" stroke="#689F38" strokeWidth="2.5" />
          <path d="M 676 540 L 692 506 L 704 532 Z" fill="url(#dino-spike)" stroke="#F57C00" strokeWidth="1.5" />
          <path d="M 726 490 L 742 462 L 748 486 Z" fill="url(#dino-spike)" stroke="#F57C00" strokeWidth="1.5" />
        </motion.g>

        {/* 腿 + 大脚丫 */}
        <g>
          <path d="M 282 738 L 322 738 Q 338 738, 338 758 L 338 800 Q 338 816, 322 816 L 288 816 Q 272 816, 272 800 L 272 758 Q 272 738, 282 738 Z"
            fill="#7CB342" stroke="#558B2F" strokeWidth="2.5" />
          <path d="M 478 738 L 518 738 Q 534 738, 534 758 L 534 800 Q 534 816, 518 816 L 484 816 Q 468 816, 468 800 L 468 758 Q 468 738, 478 738 Z"
            fill="#7CB342" stroke="#558B2F" strokeWidth="2.5" />
          <ellipse cx="305" cy="824" rx="62" ry="26" fill="#7CB342" stroke="#558B2F" strokeWidth="2.5" />
          <ellipse cx="495" cy="824" rx="62" ry="26" fill="#7CB342" stroke="#558B2F" strokeWidth="2.5" />
          <ellipse cx="266" cy="836" rx="11" ry="8" fill="#DCEDC8" />
          <ellipse cx="305" cy="842" rx="11" ry="8" fill="#DCEDC8" />
          <ellipse cx="344" cy="836" rx="11" ry="8" fill="#DCEDC8" />
          <ellipse cx="456" cy="836" rx="11" ry="8" fill="#DCEDC8" />
          <ellipse cx="495" cy="842" rx="11" ry="8" fill="#DCEDC8" />
          <ellipse cx="534" cy="836" rx="11" ry="8" fill="#DCEDC8" />
        </g>

        {/* 身体（圆滚滚） */}
        <g>
          <ellipse cx="400" cy="630" rx="180" ry="150" fill="url(#dino-body)" stroke="#689F38" strokeWidth="3" />
          <ellipse cx="400" cy="668" rx="120" ry="108" fill="#DCEDC8" />
          <circle cx="410" cy="578" r="7" fill="#C5E1A5" opacity="0.6" />
          <circle cx="440" cy="595" r="5" fill="#C5E1A5" opacity="0.6" />
          <circle cx="380" cy="600" r="4" fill="#C5E1A5" opacity="0.5" />
        </g>

        {/* 背部棘刺（头两侧的肩膀脊线上，只随身体轻微呼吸，不乱甩） */}
        <motion.g style={{ transformOrigin: '400px 500px' }}
          animate={{ rotate: [0, 1.5, 0, -1.5, 0], y: [0, -1, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M 240 528 L 222 464 L 268 520 Z" fill="url(#dino-spike)" stroke="#F57C00" strokeWidth="2" />
          <path d="M 288 512 L 286 456 L 316 508 Z" fill="url(#dino-spike)" stroke="#F57C00" strokeWidth="2" />
          <path d="M 560 528 L 578 464 L 532 520 Z" fill="url(#dino-spike)" stroke="#F57C00" strokeWidth="2" />
          <path d="M 512 512 L 514 456 L 484 508 Z" fill="url(#dino-spike)" stroke="#F57C00" strokeWidth="2" />
        </motion.g>

        {/* 迷你小短爪（左右对称，绕肩旋转） */}
        <motion.g style={{ transformOrigin: '262px 590px' }} animate={armAnim}>
          <path d="M 262 578 Q 240 600, 248 622 Q 253 630, 261 624 Q 274 604, 270 578 Z"
            fill="url(#dino-body)" stroke="#689F38" strokeWidth="2" />
          <path d="M 244 622 L 238 632 L 248 628 Z" fill="#FFF8E1" stroke="#B8860B" strokeWidth="1" />
          <path d="M 254 626 L 252 637 L 261 630 Z" fill="#FFF8E1" stroke="#B8860B" strokeWidth="1" />
        </motion.g>
        <motion.g style={{ transformOrigin: '538px 590px' }} animate={armAnim}>
          <path d="M 538 578 Q 560 600, 552 622 Q 547 630, 539 624 Q 526 604, 530 578 Z"
            fill="url(#dino-body)" stroke="#689F38" strokeWidth="2" />
          <path d="M 556 622 L 562 632 L 552 628 Z" fill="#FFF8E1" stroke="#B8860B" strokeWidth="1" />
          <path d="M 546 626 L 548 637 L 539 630 Z" fill="#FFF8E1" stroke="#B8860B" strokeWidth="1" />
        </motion.g>

        {/* ===== 大头：与身体连续（底部伸进身体里），绕脖子根部倾斜 ===== */}
        <motion.g style={{ transformOrigin: '400px 480px' }} animate={headAnim}>
          {/* 头顶小角/棘刺（与头同色，长在头骨上） */}
          <path d="M 336 236 L 348 186 L 368 228 Z" fill="#8BC34A" stroke="#689F38" strokeWidth="2" />
          <path d="M 432 228 L 452 186 L 464 236 Z" fill="#8BC34A" stroke="#689F38" strokeWidth="2" />

          {/* 头轮廓（大头 + 短吻部） */}
          <path d="M 400 208 C 330 208, 268 248, 256 320 C 248 380, 262 432, 300 472 C 314 488, 336 500, 356 506 C 378 512, 422 512, 444 506 C 464 500, 486 488, 500 472 C 538 432, 552 380, 544 320 C 532 248, 470 208, 400 208 Z"
            fill="url(#dino-body)" stroke="#689F38" strokeWidth="3" />
          {/* 嘴周浅色吻部 */}
          <ellipse cx="400" cy="498" rx="56" ry="24" fill="#DCEDC8" opacity="0.9" />

          {/* 鼻孔 */}
          <ellipse cx="380" cy="452" rx="4.5" ry="3.5" fill="#558B2F" />
          <ellipse cx="420" cy="452" rx="4.5" ry="3.5" fill="#558B2F" />

          {/* 眼睛：睡觉→闭眼；晕→X眼；开心→弯弯笑眼；惊讶→瞪大；普通→圆眼 */}
          {[326, 474].map((cx) => {
            if (eyeClosed) {
              return <path key={cx} d={`M ${cx - 26} 342 Q ${cx} 366, ${cx + 26} 342`} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />;
            }
            if (isDizzy) {
              return (
                <g key={cx}>
                  <line x1={cx - 15} y1="323" x2={cx + 15} y2="353" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                  <line x1={cx - 15} y1="353" x2={cx + 15} y2="323" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                </g>
              );
            }
            if (isHappy) {
              return <path key={cx} d={`M ${cx - 24} 350 Q ${cx} 322, ${cx + 24} 350`} fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />;
            }
            if (showSurprise) {
              return (
                <g key={cx}>
                  <ellipse cx={cx} cy="338" rx="34" ry="38" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
                  <ellipse cx={cx} cy="338" rx="6" ry="7" fill="#000000" />
                </g>
              );
            }
            return (
              <g key={cx}>
                <ellipse cx={cx} cy="338" rx="30" ry="34" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5"
                  style={{ transform: `scaleY(${blink ? 0.15 : 1})`, transformOrigin: `${cx}px 338px`, transition: 'transform 0.1s' }} />
                <motion.g animate={pupilAnim(currentState)} transition={pupilTransition(currentState)}>
                  <circle cx={cx} cy="340" r="13" fill="#1b4332" />
                  <circle cx={cx - 4} cy="335" r="4.5" fill="#ffffff" />
                </motion.g>
              </g>
            );
          })}

          {/* 眉毛 */}
          <path d="M 288 298 Q 325 286, 358 298" fill="none" stroke="#3d5c16" strokeWidth="6" strokeLinecap="round"
            transform={showSurprise ? 'translate(323 24) scale(1.25 1.25) translate(-323 -24)' : undefined} />
          <path d="M 442 298 Q 475 286, 512 298" fill="none" stroke="#3d5c16" strokeWidth="6" strokeLinecap="round"
            transform={showSurprise ? 'translate(477 24) scale(1.25 1.25) translate(-477 -24)' : undefined} />

          {/* 嘴（露齿微笑，说话时张合） */}
          <motion.g style={{ transformOrigin: '400px 480px' }} animate={mouthAnim}>
            {showO ? (
              <ellipse cx="400" cy="482" rx="16" ry="18" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
            ) : isDizzy ? (
              <path d="M 350 470 Q 368 486, 386 470 Q 404 486, 422 470 Q 440 486, 458 470" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            ) : eyeClosed ? (
              <path d="M 370 480 Q 400 494, 430 480" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            ) : (
              <g>
                <path d="M 318 468 Q 400 512, 482 468 Q 400 484, 318 468 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
                <ellipse cx="400" cy="496" rx="20" ry="9" fill="#EF5350" />
                <path d="M 376 468 L 384 484 L 392 468 Z" fill="#ffffff" stroke="#cfd8dc" strokeWidth="1" />
                <path d="M 408 468 L 416 484 L 424 468 Z" fill="#ffffff" stroke="#cfd8dc" strokeWidth="1" />
              </g>
            )}
          </motion.g>

          {/* 腮红 */}
          <motion.g animate={blushAnim(currentState)}>
            <ellipse cx="276" cy="400" rx="16" ry="9" fill="#FFAB91" />
            <ellipse cx="524" cy="400" rx="16" ry="9" fill="#FFAB91" />
          </motion.g>
        </motion.g>

        {/* 睡觉 Zzz */}
        {eyeClosed && (
          <g fill="#94a3b8">
            <motion.text x="520" y="120" fontSize="34" fontWeight="bold" animate={{ y: [0, -10], opacity: [1, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}>Z</motion.text>
            <motion.text x="560" y="85" fontSize="24" fontWeight="bold" animate={{ y: [0, -10], opacity: [1, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}>Z</motion.text>
            <motion.text x="592" y="58" fontSize="16" fontWeight="bold" animate={{ y: [0, -10], opacity: [1, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}>z</motion.text>
          </g>
        )}

        {/* Hearts */}
        {currentState === 'hearts' && (
          <g fontSize="38">
            <motion.text x="170" y="230" animate={{ y: [0, -14], opacity: [1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}>💗</motion.text>
            <motion.text x="600" y="180" animate={{ y: [0, -14], opacity: [1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}>💗</motion.text>
            <motion.text x="590" y="330" animate={{ y: [0, -14], opacity: [1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}>💖</motion.text>
          </g>
        )}

        {/* Held item (near right claw) */}
        {held && (
          <motion.text x="540" y="650" fontSize="32" animate={{ y: [0, -6, 0], rotate: [0, 6, 0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>{held}</motion.text>
        )}
      </motion.svg>
    </motion.div>
  );
}