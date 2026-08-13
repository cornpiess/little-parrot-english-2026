import { motion, type TargetAndTransition } from 'motion/react';
import { useEffect, useState } from 'react';
import type { MascotState } from './ParrotCharacter';

// ============================================================
// 小狐狸（FoxCharacter）——动作与表情与小鹦鹉对齐。
// 支持全部 ParrotState（说/听/想/睡/打招呼 + 拍手/招手/跳舞/
// 跳跃/点头/转圈/飞吻/兴奋/惊讶/开心/飞/欢呼/摇头/晕/害羞/躲猫猫），
// 通过 身体/耳朵/尾巴/嘴巴/爪子 五个部位独立驱动。
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

// 说话时嘴巴会动的状态
const TALKING_STATES: Set<MascotState> = new Set([
  'speaking', 'greeting', 'clap', 'wave', 'dance', 'bounce', 'nod', 'spin',
  'hearts', 'excited', 'surprised', 'happy', 'fly', 'cheer', 'shy', 'peek',
]);

interface FoxCharacterProps {
  state: MascotState;
  size?: number;
  onWakeUp?: () => void;
  held?: string;
  looking?: boolean;
}

export default function FoxCharacter({ state, size = 1, onWakeUp, held, looking = true }: FoxCharacterProps) {
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

  // 眼神游离
  useEffect(() => {
    if (currentState === 'thinking' || currentState === 'dizzy') return;
    if (looking) return;
    const moveInterval = setInterval(() => {
      setEyePosition({ x: Math.random() * 6 - 3, y: Math.random() * 4 - 2 });
    }, 2500);
    return () => clearInterval(moveInterval);
  }, [currentState, looking]);

  // 眨眼
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
      rotate: -15,
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
      rotate: [-15, 0, 8], y: [8, 4, 0], scale: [1.15, 1.1, 1.05], x: [0, 1, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'thinking-speaking': {
      rotate: [8, 4, 0], y: [0, -2, 0], scale: [1.05, 1.03, 1], x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'speaking-listening': {
      rotate: [0, -8, -15], y: [0, 4, 8], scale: [1, 1.08, 1.15], x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'listening-sleeping': {
      rotate: [-15, 0, 45, 90], y: [8, 4, 2, 0], scale: [1.15, 1.08, 1.04, 1], x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
    'sleeping-listening': {
      rotate: [90, 45, 0, -15], y: [0, 2, 4, 8], scale: [1, 1.04, 1.08, 1.15], x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
  };

  // ========== 尾巴 ==========
  const tailLoopAnimations: AnimTable = {
    idle: { rotate: [0, 8, -5, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    listening: { rotate: [0, 15, -8, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    thinking: { rotate: [-5, 5, -5], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    speaking: { rotate: [0, 20, -10, 15, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    sleeping: { rotate: [0, 2, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    greeting: { rotate: [0, 18, -8, 15, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { rotate: [0, 14, -6, 12, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { rotate: [0, 12, -8, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { rotate: [0, 22, -12, 18, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { rotate: [0, 10, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { rotate: [0, 6, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { rotate: [0, 30, -20, 15, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    hearts: { rotate: [0, 16, -6, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { rotate: [0, 20, -10, 16, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { rotate: [0, 6, -4, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    happy: { rotate: [0, 18, -8, 14, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { rotate: [0, 10, -6, 0], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { rotate: [0, 24, -12, 18, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { rotate: [0, 12, -8, 0], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dizzy: { rotate: [0, 25, -18, 20, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shy: { rotate: [0, -10, -4, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { rotate: [0, 10, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  // ========== 耳朵 ==========
  const earLoopAnimations: AnimTable = {
    idle: { rotate: [0, -3, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    listening: { rotate: [0, -8, 0, -5, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    thinking: { rotate: [-5, 5, -5], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    speaking: { rotate: [0, -5, 3, -5, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    sleeping: { rotate: 15, transition: { duration: 0.8 } },
    greeting: { rotate: [0, -6, 0, -4, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { rotate: [0, -5, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { rotate: [0, -6, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { rotate: [0, -8, 4, -6, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { rotate: [0, -7, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { rotate: [0, -4, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { rotate: [0, 10, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    hearts: { rotate: [0, -6, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { rotate: [0, -9, 3, -6, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { rotate: [0, -12, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    happy: { rotate: [0, -8, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { rotate: [0, -8, 0], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { rotate: [0, -10, 0], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { rotate: [0, 8, -6, 0], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dizzy: { rotate: [0, 14, -8, 10, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shy: { rotate: [-6, -2, -6], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { rotate: [0, -6, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  // ========== 嘴巴 ==========
  const mouthLoopAnimations: AnimTable = {
    speaking: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    idle: { scaleY: 1, transition: { duration: 0 } },
    listening: { scaleY: 1, transition: { duration: 0 } },
    thinking: { scaleY: 1, transition: { duration: 0 } },
    sleeping: { scaleY: 1, transition: { duration: 0 } },
    greeting: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    clap: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    wave: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    dance: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    bounce: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    nod: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    spin: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    hearts: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    excited: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    surprised: { scaleY: [1, 1.6, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    happy: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    fly: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    cheer: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    shake: { scaleY: 1, transition: { duration: 0 } },
    dizzy: { scaleY: 1, transition: { duration: 0 } },
    shy: { scaleY: [1, 0.6, 1, 0.7, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
    peek: { scaleY: [1, 0.5, 1, 0.7, 1], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } },
  };

  const transitionKey = `${previousState}-${state}`;

  const bodyAnim = animationMode === 'loop'
    ? bodyLoopAnimations[currentState]
    : bodyTransitionAnimations[transitionKey] || bodyLoopAnimations[currentState];

  const tailAnim = tailLoopAnimations[currentState];
  const earAnim = earLoopAnimations[currentState];
  const mouthAnim = mouthLoopAnimations[currentState];

  // 瞳孔动画
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
    if (s === 'shy') return { opacity: [0.3, 0.9, 0.3], scale: [1, 1.25, 1] };
    if (s === 'happy' || s === 'hearts' || s === 'excited') return { opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] };
    return { opacity: 0.3, scale: 1 };
  }

  // 爪子（手臂）动画：左爪
  function leftPawAnim(s: MascotState) {
    switch (s) {
      case 'speaking': return { rotate: [0, -15, 0, -10, 0], x: [0, -2, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'greeting': return { rotate: [-20, -55, -20, -45, -20], x: [0, -3, 0, -2, 0], y: -8, transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'listening': return { rotate: -20, x: 5, transition: { duration: 0.5 } };
      case 'thinking': return { rotate: [-5, -15, -5], x: [0, 3, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'clap': return { rotate: [-40, 0, -40], x: [4, -2, 4], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'wave': return { rotate: [-20, -60, -20, -45, -20], x: [0, -3, 0], y: -8, transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'dance': return { rotate: [-15, -40, -15], y: -4, transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'bounce': return { rotate: [0, -30, 0], y: [-4, -10, -4], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'nod': return { rotate: [-5, -15, -5], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'hearts': return { rotate: [-15, -35, -15], y: -6, transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'excited': return { rotate: [0, -30, 0, -15, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'surprised': return { rotate: -30, y: -10, transition: { duration: 0.5 } };
      case 'happy': return { rotate: [-10, -30, -10], y: -4, transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'fly': return { rotate: [-15, -50, -15], y: [-4, -10, -4], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'cheer': return { rotate: [-50, -80, -50], y: -12, transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'shake': return { rotate: [-10, -25, -10], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'dizzy': return { rotate: [-15, -45, -15], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'shy': return { rotate: [0, -30, -45, -30, 0], x: [0, 3, 5, 3, 0], y: [0, -4, -8, -4, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'peek': return { rotate: [-15, -45, -15], x: [0, 3, 0], y: [-2, -6, -2], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      default: return { rotate: 0, x: 0, y: 0, transition: { duration: 0.5 } };
    }
  }
  // 右爪：与左爪镜像
  function rightPawAnim(s: MascotState) {
    switch (s) {
      case 'speaking': return { rotate: [0, 15, 0, 10, 0], x: [0, 2, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'greeting': return { rotate: 0, x: 0, y: 0, transition: { duration: 0.5 } };
      case 'listening': return { rotate: 0, x: 0, y: 0, transition: { duration: 0.5 } };
      case 'thinking': return { rotate: 25, x: -8, y: -10, transition: { duration: 0.5 } };
      case 'clap': return { rotate: [40, 0, 40], x: [-4, 2, -4], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'wave': return { rotate: 0, x: 0, y: 0, transition: { duration: 0.5 } };
      case 'dance': return { rotate: [15, 40, 15], y: -4, transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'bounce': return { rotate: [0, 30, 0], y: [-4, -10, -4], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'nod': return { rotate: [5, 15, 5], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'hearts': return { rotate: [15, 35, 15], y: -6, transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'excited': return { rotate: [0, 30, 0, 15, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'surprised': return { rotate: 30, y: -10, transition: { duration: 0.5 } };
      case 'happy': return { rotate: [10, 30, 10], y: -4, transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'fly': return { rotate: [15, 50, 15], y: [-4, -10, -4], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'cheer': return { rotate: [50, 80, 50], y: -12, transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'shake': return { rotate: [10, 25, 10], transition: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'dizzy': return { rotate: [15, 45, 15], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'shy': return { rotate: [0, 30, 45, 30, 0], x: [0, -3, -5, -3, 0], y: [0, -4, -8, -4, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      case 'peek': return { rotate: [15, 45, 15], x: [0, -3, 0], y: [-2, -6, -2], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const } };
      default: return { rotate: 0, x: 0, y: 0, transition: { duration: 0.5 } };
    }
  }

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
          {/* 耳朵 */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-full flex justify-center gap-8 z-0">
            <motion.div className="origin-bottom" animate={earAnim} key={`fox-ear-l-${currentState}`}>
              <svg width="36" height="48" viewBox="0 0 36 48">
                <path d="M18 0 L34 44 Q28 48, 18 48 Q8 48, 2 44 Z" fill="#C45A2C" />
                <path d="M18 8 L28 40 Q24 44, 18 44 Q12 44, 8 40 Z" fill="#F5D6B8" opacity="0.7" />
              </svg>
            </motion.div>
            <motion.div
              className="origin-bottom"
              animate={{ ...earAnim, rotate: Array.isArray(earAnim?.rotate) ? (earAnim.rotate as number[]).map((r: number) => -r) : (earAnim?.rotate as number) ? -(earAnim.rotate as number) : 0 }}
              key={`fox-ear-r-${currentState}`}
            >
              <svg width="36" height="48" viewBox="0 0 36 48">
                <path d="M18 0 L34 44 Q28 48, 18 48 Q8 48, 2 44 Z" fill="#C45A2C" />
                <path d="M18 8 L28 40 Q24 44, 18 44 Q12 44, 8 40 Z" fill="#F5D6B8" opacity="0.7" />
              </svg>
            </motion.div>
          </div>

          {/* 身体 */}
          <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-xl z-10 overflow-visible">
            <path
              d="M100 25 C 155 25, 190 65, 190 135 C 190 200, 155 215, 100 215 C 45 215, 10 200, 10 135 C 10 65, 45 25, 100 25 Z"
              fill="#D4652B" stroke="#B8541F" strokeWidth="3"
            />
            <path
              d="M100 85 C 135 85, 155 115, 155 160 C 155 200, 135 212, 100 212 C 65 212, 45 200, 45 160 C 45 115, 65 85, 100 85 Z"
              fill="#FFF3E0" opacity="0.9"
            />
            <ellipse cx="60" cy="88" rx="22" ry="18" fill="#E07B3C" opacity="0.6" />
            <ellipse cx="140" cy="88" rx="22" ry="18" fill="#E07B3C" opacity="0.6" />
            <path
              d="M100 55 C 115 55, 128 65, 128 80 L 128 105 Q 115 118, 100 118 Q 85 118, 72 105 L 72 80 C 72 65, 85 55, 100 55 Z"
              fill="#FDEBD0" opacity="0.7"
            />
          </svg>

          {/* 眼睛：睡觉→闭眼；晕→X眼；开心→弯弯笑眼；惊讶→瞪大；普通→圆眼 */}
          <div className="absolute top-[72px] left-1/2 -translate-x-1/2 flex gap-5 z-20">
            {[0, 1].map((i) => {
              if (currentState === 'sleeping') {
                return (
                  <div key={i} className="relative w-12 h-12 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden"
                    style={{ borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%' }}>
                    <div className="w-9 h-[2px] bg-slate-700 rounded-full" />
                  </div>
                );
              }
              if (currentState === 'dizzy') {
                return (
                  <div key={i} className="relative w-12 h-12 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden"
                    style={{ borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <line x1="4" y1="4" x2="20" y2="20" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                      <line x1="20" y1="4" x2="4" y2="20" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </div>
                );
              }
              if (['happy', 'excited', 'cheer', 'hearts'].includes(currentState)) {
                return (
                  <div key={i} className="relative w-12 h-12 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden"
                    style={{ borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%' }}>
                    <svg width="32" height="14" viewBox="0 0 32 14">
                      <path d="M3 11 Q 16 2, 29 11" fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </div>
                );
              }
              if (currentState === 'surprised') {
                return (
                  <div key={i} className="relative w-12 h-12 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden"
                    style={{ borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%' }}>
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
                      style={{ boxShadow: '0 0 0 3px #dbeafe, 0 0 0 5px #93c5fd' }}>
                      <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="relative w-12 h-12 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden"
                  style={{ borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%' }}>
                  {!blink ? (
                    <motion.div
                      className="w-5 h-5 rounded-full relative"
                      style={{ background: '#2D5A27' }}
                      animate={pupilAnim(currentState)}
                      transition={pupilTransition(currentState)}
                    >
                      <div className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
                      <div className="absolute bottom-1 left-0.5 w-1 h-1 bg-white/40 rounded-full" />
                    </motion.div>
                  ) : (
                    <div className="w-7 h-[2px] bg-slate-700 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/* 眉毛 */}
          <div className="absolute top-[62px] left-1/2 -translate-x-1/2 flex gap-10 z-20">
            <div className="w-8 h-[3px] rounded-full bg-[#6B3A1F] -rotate-6" />
            <div className="w-8 h-[3px] rounded-full bg-[#6B3A1F] rotate-6" />
          </div>

          {/* 腮红 */}
          <motion.div className="absolute top-[100px] left-[26px] w-7 h-4 bg-orange-300 rounded-full opacity-30 blur-md z-20" animate={blushAnim(currentState)} />
          <motion.div className="absolute top-[100px] right-[26px] w-7 h-4 bg-orange-300 rounded-full opacity-30 blur-md z-20" animate={blushAnim(currentState)} />

          {/* 鼻子 */}
          <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-30">
            <svg width="16" height="12" viewBox="0 0 16 12">
              <ellipse cx="8" cy="6" rx="7" ry="5" fill="#2C1810" />
              <ellipse cx="6" cy="4" rx="2" ry="1.5" fill="#4A3228" opacity="0.5" />
            </svg>
          </div>

          {/* 嘴巴 */}
          <div className="absolute top-[110px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <motion.div animate={mouthAnim} key={`fox-mouth-${animationMode}-${currentState}`}>
              {currentState === 'sleeping' ? (
                <svg width="20" height="6" viewBox="0 0 20 6">
                  <path d="M2 3 Q 10 6, 18 3" fill="none" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : currentState === 'dizzy' ? (
                <svg width="26" height="12" viewBox="0 0 26 12">
                  <path d="M2 6 Q 6 1, 10 6 Q 14 11, 18 6 Q 21 2.5, 24 6" fill="none" stroke="#2C1810" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : TALKING_STATES.has(currentState) ? (
                <svg width="28" height="18" viewBox="0 0 28 18">
                  <path d="M4 4 Q 14 18, 24 4" fill="#C44040" stroke="#A03030" strokeWidth="1" />
                  <path d="M8 6 Q 14 0, 20 6" fill="none" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : currentState === 'surprised' ? (
                <svg width="22" height="20" viewBox="0 0 22 20">
                  <ellipse cx="11" cy="10" rx="8" ry="9" fill="#C44040" stroke="#A03030" strokeWidth="1" />
                </svg>
              ) : (
                <svg width="24" height="10" viewBox="0 0 24 10">
                  <path d="M4 3 Q 8 3, 12 5 Q 16 3, 20 2" fill="none" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </motion.div>
          </div>

          {/* 手里拿的物体 */}
          {held && (
            <motion.div
              className="absolute top-[120px] right-[28px] z-30 pointer-events-none text-3xl"
              animate={{ y: [0, -6, 0], rotate: [0, 6, 0, -6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {held}
            </motion.div>
          )}

          {/* 左爪 */}
          <motion.div
            className="absolute top-[140px] -left-3 z-20 origin-top-right"
            animate={leftPawAnim(currentState)}
            key={`fox-lpaw-${currentState}`}
          >
            <svg width="38" height="55" viewBox="0 0 38 55">
              <path d="M34 5 C 8 8, 2 28, 6 48 Q 14 55, 24 52 C 34 48, 38 28, 34 5 Z" fill="#D4652B" stroke="#B8541F" strokeWidth="2" />
              <ellipse cx="15" cy="50" rx="8" ry="5" fill="#FFF3E0" opacity="0.8" />
            </svg>
          </motion.div>

          {/* 右爪 */}
          <motion.div
            className="absolute top-[140px] -right-3 z-20 origin-top-left"
            animate={rightPawAnim(currentState)}
            key={`fox-rpaw-${currentState}`}
          >
            <svg width="38" height="55" viewBox="0 0 38 55" style={{ transform: 'scaleX(-1)' }}>
              <path d="M34 5 C 8 8, 2 28, 6 48 Q 14 55, 24 52 C 34 48, 38 28, 34 5 Z" fill="#D4652B" stroke="#B8541F" strokeWidth="2" />
              <ellipse cx="15" cy="50" rx="8" ry="5" fill="#FFF3E0" opacity="0.8" />
            </svg>
          </motion.div>

          {/* 尾巴 */}
          <motion.div
            className="absolute -bottom-2 -right-8 z-0 origin-left"
            animate={tailAnim}
            key={`fox-tail-${currentState}`}
          >
            <svg width="70" height="50" viewBox="0 0 70 50">
              <path d="M5 40 Q 15 10, 40 5 Q 60 0, 68 15 Q 72 25, 60 30 Q 45 35, 30 38 Q 15 42, 5 40 Z"
                fill="#D4652B" stroke="#B8541F" strokeWidth="1.5" />
              <path d="M55 12 Q 65 18, 58 26 Q 48 32, 35 35" fill="#FFF3E0" opacity="0.8" stroke="none" />
            </svg>
          </motion.div>

          {/* 脚 */}
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

          {/* 睡觉 Zzz */}
          {currentState === 'sleeping' && (
            <>
              <motion.span className="absolute -top-4 right-2 text-lg font-bold"
                style={{ color: 'rgba(100,100,120,0.5)' }}
                animate={{ y: [-5, -20], opacity: [1, 0], scale: [0.8, 1.2] }}
                transition={{ duration: 2, repeat: Infinity }}>💤</motion.span>
              <motion.span className="absolute -top-8 right-6 text-sm"
                style={{ color: 'rgba(100,100,120,0.4)' }}
                animate={{ y: [-3, -22], opacity: [0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}>💤</motion.span>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
