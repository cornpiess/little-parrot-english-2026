import { motion, type TargetAndTransition } from 'motion/react';
import { useEffect, useState } from 'react';
import type { MascotState } from './ParrotCharacter';

// ============================================================
// 雪宝（OlafCharacter）——保留原版「贱贱的」表情风格：
// 挑起的眉毛 + 露牙大笑。头是整体雪球的一部分（绝不分离）。
// 动作与小鹦鹉/小狐狸对齐：全部 ParrotState 逐状态驱动
// 身体 / 树枝手臂 / 头 / 嘴巴 四部位，动作幅度大、表情生动。
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

interface OlafCharacterProps {
  state?: MascotState;
  size?: number;
  onWakeUp?: () => void;
  held?: string;
  looking?: boolean;
}

export default function OlafCharacter({ state = 'idle', size = 1, held }: OlafCharacterProps) {
  const [currentState, setCurrentState] = useState<MascotState>(state);
  const [previousState, setPreviousState] = useState<MascotState>(state);
  const [animationMode, setAnimationMode] = useState<AnimationMode>('loop');
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

  // 眨眼
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // ========== 身体循环动画（幅度大、动作清晰） ==========
  const bodyLoopAnimations: AnimTable = {
    idle: {
      rotate: [0, 2, 0, -2, 0],
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
      y: [8, 13, 8],
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
      rotate: [10, -10, 10],
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
      y: [0, -7, 0, -5, 0],
      scale: [1, 1.07, 1, 1.05, 1],
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
      rotate: 85,
      y: [0, 3, 0],
      scale: [1, 0.97, 1],
      x: 0,
      transition: {
        rotate: { duration: 0 },
        x: { duration: 0 },
        y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    greeting: {
      rotate: [0, 6, 0, -6, 0],
      y: [0, -6, 0, -6, 0],
      scale: 1.06,
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
      y: [0, -6, 0],
      scale: [1, 1.03, 1],
      x: 0,
      transition: {
        rotate: { duration: 0 },
        scale: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    wave: {
      rotate: [0, 5, 0, -5, 0],
      y: [0, -4, 0],
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
      rotate: [-12, 12, -12],
      y: [0, -12, 0],
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
      y: [0, -24, 0],
      scaleY: [1, 1.1, 0.95],
      scaleX: [1, 0.97, 1.04],
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
      y: [0, 9, 0],
      scaleY: [1, 0.92, 1],
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
      y: [0, -6, 0],
      scale: [1, 1.07, 1],
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
      y: [0, -7, 0],
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
      rotate: [-6, 6, -6],
      y: [0, -13, 0, -8, 0],
      scale: [1, 1.06, 1, 1.05, 1],
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
      y: [0, -9, 0, -6, 0],
      scale: [1, 1.18, 1, 1.12, 1],
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
      y: [0, -10, 0, -6, 0],
      scale: [1, 1.07, 1, 1.04, 1],
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
      y: [0, -16, -28, -16, 0],
      scale: [1, 1.05, 1.08, 1.05, 1],
      x: 0,
      transition: {
        rotate: { duration: 0 },
        x: { duration: 0 },
        scale: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    cheer: {
      rotate: [-8, 8, -8],
      y: [0, -22, 0],
      scaleY: [1, 1.09, 0.94],
      scaleX: [1, 0.97, 1.04],
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
      rotate: [-18, 18, -18, 18, -18, 0],
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
      rotate: [-14, 20, -18, 14, -14],
      y: [0, 5, 0, 5, 0],
      scale: [1.03, 1.06, 1.03, 1.06, 1.03],
      x: 0,
      transition: {
        rotate: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
      },
    },
    shy: {
      rotate: [0, -10, -18, -10, 0],
      y: [0, 8, 13, 8, 0],
      scale: [1.07, 1.13, 1.16, 1.13, 1.07],
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
      y: [0, 7, 0],
      scale: [1.08, 1.14, 1.08],
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
      rotate: [-14, 0, 10], y: [8, 4, 0], scale: [1.15, 1.1, 1.05], x: [0, 1, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'thinking-speaking': {
      rotate: [10, 4, 0], y: [0, -2, 0], scale: [1.05, 1.03, 1], x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'speaking-listening': {
      rotate: [0, -7, -14], y: [0, 4, 8], scale: [1, 1.08, 1.15], x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'listening-sleeping': {
      rotate: [-14, 0, 45, 85], y: [8, 4, 2, 0], scale: [1.15, 1.08, 1.03, 1], x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
    'sleeping-listening': {
      rotate: [85, 45, 0, -14], y: [0, 2, 4, 8], scale: [1, 1.03, 1.08, 1.15], x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
  };

  // ========== 左臂（绕左肩关节 170,410 旋转；负角上举，正角下摆） ==========
  const leftArmLoopAnimations: AnimTable = {
    idle: { rotate: [0, 4, -3, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    listening: { rotate: [0, -10, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    thinking: { rotate: [-14, -30, -14], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    speaking: { rotate: [0, 12, -8, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    sleeping: { rotate: 20, transition: { duration: 0.8 } },
    greeting: { rotate: [0, 14, -6, 10, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { rotate: [35, -40, 35], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { rotate: [0, -8, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { rotate: [40, -50, 40], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { rotate: [0, 16, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { rotate: [0, 10, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { rotate: [0, 16, -10, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    hearts: { rotate: [0, 12, -6, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { rotate: [32, -42, 32], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { rotate: [0, 24, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    happy: { rotate: [0, 16, -8, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { rotate: [-45, -75, -45], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { rotate: [-62, -28, -62], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { rotate: [0, 12, 0], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dizzy: { rotate: [28, -24, 26, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shy: { rotate: [-85, -40, -85], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { rotate: [-90, -28, -90], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  // ========== 右臂（绕右肩关节 630,400 旋转；负角上举，正角下摆） ==========
  const rightArmLoopAnimations: AnimTable = {
    idle: { rotate: [0, -4, 3, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    listening: { rotate: [0, 10, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    thinking: { rotate: [14, 30, 14], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    speaking: { rotate: [0, -12, 8, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    sleeping: { rotate: -20, transition: { duration: 0.8 } },
    greeting: { rotate: [-58, -18, -58], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { rotate: [35, -40, 35], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { rotate: [-58, -18, -58], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { rotate: [-40, 50, -40], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { rotate: [0, -16, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { rotate: [0, -10, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { rotate: [0, -16, 10, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    hearts: { rotate: [0, -12, 6, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { rotate: [-32, 42, -32], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { rotate: [0, -24, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    happy: { rotate: [0, -16, 8, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { rotate: [-45, -75, -45], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { rotate: [-62, -28, -62], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { rotate: [0, -12, 0], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dizzy: { rotate: [-28, 24, -26, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shy: { rotate: [-85, -40, -85], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { rotate: [-90, -28, -90], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  // ========== 头（轻微倾斜，头是整体雪球，幅度适中） ==========
  const headLoopAnimations: AnimTable = {
    idle: { rotate: [0, -2, 2, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    listening: { rotate: [0, -6, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    thinking: { rotate: [-7, 7, -7], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    speaking: { rotate: [0, -3, 3, 0], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    sleeping: { rotate: 12, transition: { duration: 0.8 } },
    greeting: { rotate: [0, 6, 0, -4, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { rotate: [0, 3, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { rotate: [0, 5, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { rotate: [0, -5, 5, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { rotate: [0, 3, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { rotate: [10, -7, 10], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { rotate: 360, transition: { duration: 1.1, repeat: Infinity, ease: 'linear', repeatType: 'loop' as const } },
    hearts: { rotate: [0, 6, -4, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { rotate: [0, -6, 6, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { rotate: [0, 8, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    happy: { rotate: [0, 5, -3, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { rotate: [0, 5, 0], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { rotate: [0, -6, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { rotate: [-13, 13, -13], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dizzy: { rotate: [9, -7, 8, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shy: { rotate: [-7, -3, -7], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { rotate: [0, 7, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  // ========== 嘴巴（贱贱的露牙大嘴，说话时开合） ==========
  const mouthLoopAnimations: AnimTable = {
    idle: { scaleY: 1, transition: { duration: 0 } },
    listening: { scaleY: 1, transition: { duration: 0 } },
    thinking: { scaleY: 1, transition: { duration: 0 } },
    sleeping: { scaleY: 1, transition: { duration: 0 } },
    speaking: { scaleY: [1, 0.45, 1, 0.7, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    greeting: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    hearts: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { scaleY: [1, 0.45, 1, 0.65, 1], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { scaleY: 1, transition: { duration: 0 } },
    happy: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { scaleY: [1, 0.45, 1, 0.65, 1], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { scaleY: 1, transition: { duration: 0 } },
    dizzy: { scaleY: 1, transition: { duration: 0 } },
    shy: { scaleY: [1, 0.6, 1, 0.7, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { scaleY: [1, 0.55, 1, 0.7, 1], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  const bodyAnim: TargetAndTransition =
    animationMode === 'transition'
      ? (bodyTransitionAnimations[`${previousState}-${currentState}`] || bodyLoopAnimations[currentState]!)
      : bodyLoopAnimations[currentState]!;

  const armLAnim = leftArmLoopAnimations[currentState];
  const armRAnim = rightArmLoopAnimations[currentState];
  const headAnim = headLoopAnimations[currentState];
  const mouthAnim = mouthLoopAnimations[currentState];

  const isSleeping = currentState === 'sleeping';
  const isSurprised = currentState === 'surprised';
  const isDizzy = currentState === 'dizzy';
  const isHappy = ['happy', 'excited', 'cheer', 'hearts'].includes(currentState) && !isSleeping;

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
          <radialGradient id="olaf-snowball" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#e2f1f9" />
            <stop offset="100%" stopColor="#9fc2d9" />
          </radialGradient>
          <radialGradient id="olaf-carrot" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffb03a" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
          <radialGradient id="olaf-coal" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#52525b" />
            <stop offset="75%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </radialGradient>
          <linearGradient id="olaf-twig" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <filter id="olaf-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Shadow */}
        <ellipse cx="400" cy="800" rx="180" ry="22" fill="#030712" filter="url(#olaf-shadow)" opacity="0.6" />

        {/* Bottom snowball */}
        <g>
          <ellipse cx="290" cy="780" rx="35" ry="30" fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="510" cy="780" rx="35" ry="30" fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="400" cy="700" rx="160" ry="120" fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="385" cy="660" rx="15" ry="12" fill="url(#olaf-coal)" />
        </g>

        {/* Middle snowball + 树枝手臂（绕肩关节大幅旋转） */}
        <g>
          <motion.g style={{ transformOrigin: '170px 410px' }} animate={armLAnim}>
            <line x1="310" y1="490" x2="170" y2="410" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="170" y1="410" x2="130" y2="420" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="170" y1="410" x2="140" y2="370" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="170" y1="410" x2="155" y2="450" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round" />
          </motion.g>
          <motion.g style={{ transformOrigin: '630px 400px' }} animate={armRAnim}>
            <line x1="490" y1="490" x2="630" y2="400" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="630" y1="400" x2="670" y2="380" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="630" y1="400" x2="650" y2="440" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="630" y1="400" x2="610" y2="360" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round" />
          </motion.g>
          <ellipse cx="400" cy="500" rx="110" ry="90" fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="385" cy="455" rx="10" ry="10" fill="url(#olaf-coal)" />
          <ellipse cx="385" cy="525" rx="10" ry="8" fill="url(#olaf-coal)" />
        </g>

        {/* Head —— 整体雪球的一部分，仅轻微倾斜（绝不分离） */}
        <motion.g style={{ transformOrigin: '400px 320px' }} animate={headAnim}>
          <path d="M 315 260 C 270 200, 310 110, 400 110 C 490 110, 530 200, 485 260 C 465 295, 475 355, 450 375 C 420 405, 380 405, 350 375 C 325 355, 335 295, 315 260 Z"
            fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Hair */}
          <line x1="400" y1="115" x2="360" y2="40" stroke="url(#olaf-twig)" strokeWidth="8" strokeLinecap="round" />
          <line x1="400" y1="115" x2="405" y2="25" stroke="url(#olaf-twig)" strokeWidth="8" strokeLinecap="round" />
          <line x1="400" y1="115" x2="435" y2="45" stroke="url(#olaf-twig)" strokeWidth="8" strokeLinecap="round" />

          {/* 眼睛：睡觉→闭眼；晕→X眼；开心→弯弯笑眼；惊讶→瞪大；普通→圆眼 */}
          {[360, 440].map((cx) => {
            if (isSleeping) {
              return <path key={cx} d={`M ${cx - 24} 205 Q ${cx} 229, ${cx + 24} 205`} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />;
            }
            if (isDizzy) {
              return (
                <g key={cx}>
                  <line x1={cx - 16} y1="189" x2={cx + 16} y2="221" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                  <line x1={cx - 16} y1="221" x2={cx + 16} y2="189" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                </g>
              );
            }
            if (isHappy) {
              return <path key={cx} d={`M ${cx - 22} 212 Q ${cx} 186, ${cx + 22} 212`} fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />;
            }
            if (isSurprised) {
              return (
                <g key={cx}>
                  <ellipse cx={cx} cy="205" rx="27" ry="31" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
                  <ellipse cx={cx} cy="205" rx="6" ry="7" fill="#000000" />
                </g>
              );
            }
            return (
              <g key={cx}>
                <ellipse cx={cx} cy="205" rx="22" ry="26" fill="#ffffff" stroke="#1e293b" strokeWidth="2"
                  style={{ transform: `scaleY(${blink ? 0.15 : 1})`, transformOrigin: `${cx}px 205px`, transition: 'transform 0.1s' }} />
                <ellipse cx={cx} cy="205" rx="10" ry="12" fill="#000000" />
                <circle cx={cx - 3} cy="200" r="3.5" fill="#ffffff" />
              </g>
            );
          })}

          {/* Eyebrows —— 贱贱的挑眉 */}
          <path d="M 335 175 Q 360 170, 380 180" fill="none" stroke="#451a03" strokeWidth="7" strokeLinecap="round"
            transform={isSurprised ? 'translate(358 26) scale(1.3 1.3) translate(-358 -26)' : undefined} />
          <path d="M 465 175 Q 440 170, 420 180" fill="none" stroke="#451a03" strokeWidth="7" strokeLinecap="round"
            transform={isSurprised ? 'translate(442 26) scale(1.3 1.3) translate(-442 -26)' : undefined} />

          {/* Carrot nose */}
          <g>
            <path d="M 395 240 Q 400 220, 410 240 L 490 260 Q 500 270, 480 280 L 395 270 Z"
              fill="url(#olaf-carrot)" stroke="#ea580c" strokeWidth="1.5" strokeLinejoin="round" />
            <line x1="420" y1="248" x2="415" y2="264" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
            <line x1="440" y1="252" x2="435" y2="268" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
            <line x1="460" y1="257" x2="455" y2="273" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* 嘴：惊讶→O型；晕→波浪线；其余→贱贱露牙大笑（说话开合） */}
          {isSurprised ? (
            <ellipse cx="400" cy="345" rx="16" ry="20" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
          ) : isDizzy ? (
            <path d="M 345 335 Q 365 352, 385 335 Q 405 352, 425 335 Q 445 352, 465 335" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          ) : (
            <motion.g style={{ transformOrigin: '400px 345px' }} animate={mouthAnim}>
              <path d="M 340 310 C 340 310, 400 315, 460 310 C 470 365, 330 365, 340 310 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
              <path d="M 370 345 C 370 345, 400 325, 430 345 C 410 365, 390 365, 370 345 Z" fill="#fda4af" />
              <path d="M 385 311 L 415 311 L 412 328 C 412 332, 388 332, 388 328 Z" fill="#ffffff" />
            </motion.g>
          )}

          {/* Shy blush */}
          {(currentState === 'shy' || currentState === 'happy') && (
            <>
              <motion.ellipse
                cx="330" cy="255" rx="20" ry="10" fill="#fda4af" opacity="0.8"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.ellipse
                cx="470" cy="255" rx="20" ry="10" fill="#fda4af" opacity="0.8"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}
        </motion.g>

        {/* Sleeping Zzz */}
        {isSleeping && (
          <g fill="#94a3b8">
            <motion.text x="470" y="90" fontSize="36" fontWeight="bold" animate={{ y: [0, -8], opacity: [1, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}>Z</motion.text>
            <motion.text x="510" y="55" fontSize="26" fontWeight="bold" animate={{ y: [0, -8], opacity: [1, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}>Z</motion.text>
            <motion.text x="545" y="30" fontSize="18" fontWeight="bold" animate={{ y: [0, -8], opacity: [1, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}>z</motion.text>
          </g>
        )}

        {/* Hearts */}
        {currentState === 'hearts' && (
          <g fontSize="40">
            <motion.text x="200" y="200" animate={{ y: [0, -14], opacity: [1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}>💗</motion.text>
            <motion.text x="540" y="170" animate={{ y: [0, -14], opacity: [1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}>💗</motion.text>
            <motion.text x="560" y="300" animate={{ y: [0, -14], opacity: [1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}>💖</motion.text>
          </g>
        )}

        {/* Held item (near right hand) */}
        {held && currentState === 'wave' && (
          <motion.text x="590" y="350" fontSize="34" animate={{ y: [0, -6, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}>{held}</motion.text>
        )}
      </motion.svg>
    </motion.div>
  );
}