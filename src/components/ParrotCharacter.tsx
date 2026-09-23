import { motion, type TargetAndTransition } from 'motion/react';
import { useEffect, useState } from 'react';

type AnimTable = Partial<Record<ParrotState, TargetAndTransition>>;
type TransitionTable = Record<string, TargetAndTransition>;

export type ParrotState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'sleeping'
  | 'greeting'
  | 'clap' // 拍手（有节奏，不鬼畜）
  | 'wave' // 招手
  | 'dance' // 跳舞
  | 'bounce' // 跳跃
  | 'nod' // 点头
  | 'spin' // 转圈
  | 'hearts' // 飞吻
  | 'excited' // 兴奋
  | 'surprised' // 惊讶
  | 'happy' // 开心
  | 'fly' // 飞：双翅快速扇动 + 身体悬浮
  | 'cheer' // 欢呼：跳起 + 双翅高举 + 嘴张开
  | 'shake' // 摇头：身体左右轻转（说"不"）
  | 'dizzy' // 晕：身体大辐摇摆 + 微微浮动
  | 'shy' // 害羞：双翅掩面 + 身体后缩
  | 'peek'; // 躲猫猫：双翅开合像睁一只眼

export type { ParrotState as MascotState };

type AnimationMode = 'loop' | 'transition';

// 哪些状态对走「过渡动画」路径（对话链条与入睡），其余动作切换直接进循环，更顺滑
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

interface ParrotCharacterProps {
  state: ParrotState;
  size?: number; // scale factor, default 1 (192x208px). Use 0.3 for small inline.
  onWakeUp?: () => void;
  held?: string; // 小鹦鹉"手里拿"的物体（如 🍎），会随身体一起动
  looking?: boolean; // true（默认）= 看着孩子（瞳孔居中、轻微追踪）；false = 眼神游离
}

export default function ParrotCharacter({ state, size = 1, onWakeUp, held, looking = true }: ParrotCharacterProps) {
  const [currentState, setCurrentState] = useState<ParrotState>(state);
  const [previousState, setPreviousState] = useState<ParrotState>(state);
  const [animationMode, setAnimationMode] = useState<AnimationMode>('loop');
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  // Detect state change and play transition.
  // Only states with a real transition animation (conversation chain) go through
  // 'transition' mode; everything else switches straight to the new loop so
  // action→action changes are instant and smooth (no 800ms lag / double-restart).
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

  // Random eye movement (when not focused on viewer)
  useEffect(() => {
    if (currentState === 'thinking' || currentState === 'dizzy') return;
    if (looking) return;

    const moveInterval = setInterval(() => {
      setEyePosition({
        x: Math.random() * 6 - 3,
        y: Math.random() * 4 - 2,
      });
    }, 2500);

    return () => clearInterval(moveInterval);
  }, [currentState, looking]);

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
      },
    },
    // ----- new actions -----
    clap: {
      // 身体随拍手轻微起伏，慢节奏，不鬼畜
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
      // 跳跃：大幅弹跳（squash & stretch）
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
      // 点头：身体下压再用 scaleY 压一下，模拟点头
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
      // 转圈：旋转同时轻微起伏，更灵动
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
      // 兴奋：连续小跳
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
      // 惊讶：轻轻往后一顿 + 放大
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
      // 开心：轻快的双重弹跳
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
    // ----- new action states (body) -----
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
      // 欢呼：举起双手大幅跳跃
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

  // ============================================
  // TRANSITION ANIMATIONS (listen→think→speak→listen)
  // ============================================

  const bodyTransitionAnimations: TransitionTable = {
    'listening-thinking': {
      rotate: [-15, 0, 8],
      y: [8, 4, 0],
      scale: [1.15, 1.1, 1.05],
      x: [0, 1, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'thinking-speaking': {
      rotate: [8, 4, 0],
      y: [0, -2, 0],
      scale: [1.05, 1.03, 1],
      x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'speaking-listening': {
      rotate: [0, -8, -15],
      y: [0, 4, 8],
      scale: [1, 1.08, 1.15],
      x: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'listening-sleeping': {
      rotate: [-15, 0, 45, 90],
      y: [8, 4, 2, 0],
      scale: [1.15, 1.08, 1.04, 1],
      x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
    'sleeping-listening': {
      rotate: [90, 45, 0, -15],
      y: [0, 2, 4, 8],
      scale: [1, 1.04, 1.08, 1.15],
      x: [0, 0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
  };

  // Wing loop animations
  const leftWingLoopAnimations: AnimTable = {
    idle: { rotate: 0, x: 0, y: 0, transition: { duration: 0 } },
    listening: {
      rotate: -135,
      x: 16,
      y: -6,
      transition: { duration: 0 },
    },
    thinking: {
      rotate: [-10, -25, -10],
      x: 0,
      y: 0,
      transition: {
        rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    speaking: {
      rotate: [0, -18, 0, -12, 0],
      x: [0, -2, 0],
      y: 0,
      transition: {
        rotate: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0 },
      },
    },
    sleeping: {
      rotate: 0,
      x: 0,
      y: 0,
      transition: { duration: 0 },
    },
    greeting: {
      rotate: [-25, -55, -25, -45, -25],
      x: [0, -3, 0, -2, 0],
      y: -8,
      transition: {
        rotate: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0 },
      },
    },
    // ----- new actions wings -----
    // 拍手：双翼向中线合拢再张开，慢节奏、有停顿，不再鬼畜
    clap: {
      rotate: [-135, -95, -135],
      x: [16, 8, 16],
      y: [-6, -4, -6],
      transition: {
        rotate: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    // 招手：左翼抬起并左右摆动
    wave: {
      rotate: [-55, -25, -55, -35, -55],
      x: 0,
      y: -8,
      transition: {
        rotate: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    // 跳舞：双翼随节奏张合
    dance: {
      rotate: [-30, -60, -30],
      x: [4, 0, 4],
      y: 0,
      transition: {
        rotate: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0 },
      },
    },
    // 跳跃：双翅随节奏上挥
    bounce: {
      rotate: [0, -35, 0],
      x: 0,
      y: [-4, -8, -4],
      transition: {
        rotate: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    // 点头：左翼轻放
    nod: {
      rotate: [-10, -20, -10],
      x: 0,
      y: 0,
      transition: {
        rotate: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    // 转圈：双翼张开保持
    spin: {
      rotate: -135,
      x: 16,
      y: -6,
      transition: { duration: 0 },
    },
    // 飞吻：左翼轻摆
    hearts: {
      rotate: [-20, -40, -20],
      x: 0,
      y: -4,
      transition: {
        rotate: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    excited: {
      rotate: [0, -25, 0, -15, 0],
      x: [0, -2, 0],
      y: 0,
      transition: {
        rotate: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0 },
      },
    },
    surprised: {
      rotate: -135,
      x: 16,
      y: -6,
      transition: { duration: 0 },
    },
    happy: {
      rotate: [-20, -40, -20],
      x: 0,
      y: -4,
      transition: {
        rotate: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    // ----- new action states (left wing) -----
    fly: {
      rotate: [-135, -15, -135],
      x: [16, 0, 16],
      y: [-6, 0, -6],
      transition: {
        rotate: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    cheer: {
      rotate: [-160, -115, -160],
      x: [20, 14, 20],
      y: [-10, -6, -10],
      transition: {
        rotate: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    shake: {
      rotate: [-20, -40, -20],
      x: 0,
      y: 0,
      transition: {
        rotate: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    dizzy: {
      rotate: [-20, -70, -25, -75, -20],
      x: [4, 12, 5, 13, 4],
      y: 0,
      transition: {
        rotate: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0 },
      },
    },
    shy: {
      rotate: [-12, -60, -85, -60, -12],
      x: [0, 6, 9, 6, 0],
      y: [0, -4, -10, -4, 0],
      transition: {
        rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    peek: {
      rotate: [-30, -95, -30, -95, -30],
      x: [2, 10, 2, 10, 2],
      y: [-2, -6, -2, -6, -2],
      transition: {
        rotate: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
  };

  const leftWingTransitionAnimations: TransitionTable = {
    'listening-thinking': {
      rotate: [-135, -90, -60, -10],
      x: [16, 12, 6, 0],
      y: [-6, -4, -2, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'thinking-speaking': {
      rotate: [-10, -6, 0],
      x: [0, 0, 0],
      y: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'speaking-listening': {
      rotate: [0, -45, -90, -135],
      x: [0, 6, 12, 16],
      y: [0, -2, -4, -6],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'listening-sleeping': {
      rotate: [-135, -90, -45, 0],
      x: [16, 12, 6, 0],
      y: [-6, -4, -2, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
    'sleeping-listening': {
      rotate: [0, -45, -90, -135],
      x: [0, 6, 12, 16],
      y: [0, -2, -4, -6],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
  };

  const rightWingLoopAnimations: AnimTable = {
    idle: { rotate: 0, x: 0, y: 0, transition: { duration: 0 } },
    listening: {
      rotate: 0,
      x: 0,
      y: 0,
      transition: { duration: 0 },
    },
    thinking: {
      rotate: 145,
      x: -16,
      y: -12,
      transition: { duration: 0 },
    },
    speaking: {
      rotate: [0, 18, 0, 12, 0],
      x: [0, 2, 0],
      y: 0,
      transition: {
        rotate: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0 },
      },
    },
    sleeping: {
      rotate: 0,
      x: 0,
      y: 0,
      transition: { duration: 0 },
    },
    greeting: {
      rotate: 0,
      x: 0,
      y: 0,
      transition: { duration: 0 },
    },
    // ----- new actions wings (right wing mirrored via scaleX(-1)) -----
    clap: {
      rotate: [135, 95, 135],
      x: [-16, -8, -16],
      y: [-6, -4, -6],
      transition: {
        rotate: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    wave: {
      rotate: 0,
      x: 0,
      y: 0,
      transition: { duration: 0 },
    },
    dance: {
      rotate: [30, 60, 30],
      x: [-4, 0, -4],
      y: 0,
      transition: {
        rotate: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0 },
      },
    },
    bounce: {
      rotate: [0, 35, 0],
      x: 0,
      y: [-4, -8, -4],
      transition: {
        rotate: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    nod: {
      rotate: [10, 20, 10],
      x: 0,
      y: 0,
      transition: {
        rotate: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    spin: {
      rotate: 135,
      x: -16,
      y: -12,
      transition: { duration: 0 },
    },
    hearts: {
      rotate: [20, 40, 20],
      x: 0,
      y: -4,
      transition: {
        rotate: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    excited: {
      rotate: [0, 25, 0, 15, 0],
      x: [0, 2, 0],
      y: 0,
      transition: {
        rotate: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0 },
      },
    },
    surprised: {
      rotate: 135,
      x: -16,
      y: -12,
      transition: { duration: 0 },
    },
    happy: {
      rotate: [20, 40, 20],
      x: 0,
      y: -4,
      transition: {
        rotate: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    // ----- new action states (right wing) -----
    fly: {
      rotate: [135, 15, 135],
      x: [-16, 0, -16],
      y: [-6, 0, -6],
      transition: {
        rotate: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    cheer: {
      rotate: [160, 115, 160],
      x: [-20, -14, -20],
      y: [-10, -6, -10],
      transition: {
        rotate: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    shake: {
      rotate: [20, 40, 20],
      x: 0,
      y: 0,
      transition: {
        rotate: { duration: 0.28, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 0 },
        y: { duration: 0 },
      },
    },
    dizzy: {
      rotate: [20, 70, 25, 75, 20],
      x: [-4, -12, -5, -13, -4],
      y: 0,
      transition: {
        rotate: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 0 },
      },
    },
    shy: {
      rotate: [12, 60, 85, 60, 12],
      x: [0, -6, -9, -6, 0],
      y: [0, -4, -10, -4, 0],
      transition: {
        rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
    peek: {
      rotate: [30, 95, 30, 95, 30],
      x: [-2, -10, -2, -10, -2],
      y: [-2, -6, -2, -6, -2],
      transition: {
        rotate: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        x: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
        y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
      },
    },
  };

  const rightWingTransitionAnimations: TransitionTable = {
    'listening-thinking': {
      rotate: [0, 50, 100, 145],
      x: [0, -6, -12, -16],
      y: [0, -4, -8, -12],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'thinking-speaking': {
      rotate: [145, 100, 50, 0],
      x: [-16, -12, -6, 0],
      y: [-12, -8, -4, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'speaking-listening': {
      rotate: [0, 0, 0],
      x: [0, 0, 0],
      y: [0, 0, 0],
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
    },
    'listening-sleeping': {
      rotate: [0, 50, 100, 145],
      x: [0, -6, -12, -16],
      y: [0, -4, -8, -12],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
    'sleeping-listening': {
      rotate: [0, 0, 0],
      x: [0, 0, 0],
      y: [0, 0, 0],
      transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
    },
  };

  // 说话时的喙动画：整喙轻微缩放颤动（不拆分下喙，不歪斜），
  // 说话时喙会动，非说话状态则闭合不动。
  const TALKING_STATES: Set<ParrotState> = new Set([
    'speaking', 'greeting', 'clap', 'wave', 'dance', 'bounce', 'nod', 'spin',
    'hearts', 'excited', 'surprised', 'happy', 'fly', 'cheer', 'shy', 'peek',
  ]);
  function beakTalkAnimation(s: ParrotState) {
    if (!TALKING_STATES.has(s)) return { scaleY: 1, transition: { duration: 0 } };
    return {
      scaleY: [1, 0.7, 1, 0.85, 1],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    };
  }

  const beakLoopAnimations: AnimTable = {
    speaking: beakTalkAnimation('speaking'),
    listening: { scaleY: 1, transition: { duration: 0 } },
    thinking: { scaleY: 1, transition: { duration: 0 } },
    sleeping: { scaleY: 1, transition: { duration: 0 } },
    greeting: beakTalkAnimation('greeting'),
    clap: beakTalkAnimation('clap'),
    wave: beakTalkAnimation('wave'),
    dance: beakTalkAnimation('dance'),
    bounce: beakTalkAnimation('bounce'),
    nod: beakTalkAnimation('nod'),
    spin: beakTalkAnimation('spin'),
    hearts: beakTalkAnimation('hearts'),
    excited: beakTalkAnimation('excited'),
    surprised: {
      scaleY: [1, 1.7, 1],
      transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' as const },
    },
    happy: beakTalkAnimation('happy'),
    // ----- new action states (beak) -----
    fly: beakTalkAnimation('fly'),
    cheer: beakTalkAnimation('cheer'),
    shake: { scaleY: 1, transition: { duration: 0 } },
    dizzy: { scaleY: 1, transition: { duration: 0 } },
    shy: beakTalkAnimation('shy'),
    peek: beakTalkAnimation('peek'),
  };

  const beakTransitionAnimations: TransitionTable = {
    'listening-thinking': { scaleY: [1, 1], transition: { duration: 0.8 } },
    'thinking-speaking': { scaleY: [1, 0.9, 1], transition: { duration: 0.8 } },
    'speaking-listening': { scaleY: [1, 1], transition: { duration: 0.8 } },
    'listening-sleeping': { scaleY: [1, 1], transition: { duration: 1.2 } },
    'sleeping-listening': { scaleY: [1, 1], transition: { duration: 1.2 } },
  };

  // Determine which animation to use
  const transitionKey = `${previousState}-${state}`;

  const bodyAnimation = animationMode === 'loop'
    ? bodyLoopAnimations[currentState]
    : bodyTransitionAnimations[transitionKey] || bodyLoopAnimations[state];

  const leftWingAnimation = animationMode === 'loop'
    ? leftWingLoopAnimations[currentState]
    : leftWingTransitionAnimations[transitionKey] || leftWingLoopAnimations[state];

  const rightWingAnimation = animationMode === 'loop'
    ? rightWingLoopAnimations[currentState]
    : rightWingTransitionAnimations[transitionKey] || rightWingLoopAnimations[state];

  const beakAnimation = animationMode === 'loop'
    ? beakLoopAnimations[currentState]
    : beakTransitionAnimations[transitionKey] || beakLoopAnimations[state];

  // 学生瞳孔动画：不同状态下眼睛会"转动"
  function pupilAnim(s: ParrotState) {
    if (s === 'thinking') return { x: [0, 3, 0, -3, 0], y: [-3, 0, 3, 0, -3] };
    if (s === 'dizzy') return { x: [0, 4, 0, -4, 0], y: [-4, 0, 4, 0, -4] };
    if (s === 'surprised') return { x: [0, 1, 0], y: [-1, -1, -1] };
    return eyePosition;
  }
  function pupilTransition(s: ParrotState) {
    if (s === 'thinking' || s === 'dizzy') return { duration: s === 'dizzy' ? 1.1 : 2.5, repeat: Infinity, ease: 'linear' as const };
    return { type: 'spring', stiffness: 150, damping: 20 };
  }
  // 腮红：害羞/开心时变亮，随呼吸脉动
  function blushAnim(s: ParrotState) {
    if (s === 'shy') return { opacity: [0.4, 0.95, 0.4], scale: [1, 1.25, 1] };
    if (s === 'happy' || s === 'hearts') return { opacity: [0.4, 0.75, 0.4], scale: [1, 1.15, 1] };
    return { opacity: 0.4, scale: 1 };
  }

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
            {[0, 1].map((i) => {
              if (currentState === 'sleeping') {
                return (
                  <div key={i} className="relative w-14 h-14 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                    <div className="w-10 h-1 bg-slate-800 rounded-full" />
                  </div>
                );
              }
              if (currentState === 'dizzy') {
                return (
                  <div key={i} className="relative w-14 h-14 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                    <svg width="26" height="26" viewBox="0 0 26 26">
                      <line x1="4" y1="4" x2="22" y2="22" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
                      <line x1="22" y1="4" x2="4" y2="22" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
                    </svg>
                  </div>
                );
              }
              if (['happy', 'excited', 'cheer', 'hearts'].includes(currentState)) {
                return (
                  <div key={i} className="relative w-14 h-14 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                    <svg width="34" height="16" viewBox="0 0 34 16">
                      <path d="M3 12 Q 17 2, 31 12" fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </div>
                );
              }
              if (currentState === 'surprised') {
                return (
                  <div key={i} className="relative w-14 h-14 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
                      style={{ boxShadow: '0 0 0 3px #dbeafe, 0 0 0 5px #93c5fd' }}>
                      <div className="w-3 h-3 bg-slate-800 rounded-full" />
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="relative w-14 h-14 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                  {!blink ? (
                    <motion.div
                      className="w-6 h-6 bg-slate-800 rounded-full relative"
                      animate={pupilAnim(currentState)}
                      transition={pupilTransition(currentState)}
                    >
                      <div className="absolute top-1 right-1.5 w-2 h-2 bg-white rounded-full opacity-90" />
                    </motion.div>
                  ) : (
                    <div className="w-8 h-1 bg-slate-800 rounded-full" />
                  )}
                </div>
              );
            })}
        </div>

        {/* Blush */}
        <motion.div
          className="absolute top-28 left-8 w-6 h-4 bg-pink-300 rounded-full opacity-40 blur-md z-20"
          animate={blushAnim(currentState)}
        />
        <motion.div
          className="absolute top-28 right-8 w-6 h-4 bg-pink-300 rounded-full opacity-40 blur-md z-20"
          animate={blushAnim(currentState)}
        />

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
            {/* 晕：波浪嘴 */}
            {currentState === 'dizzy' && (
              <svg width="36" height="12" viewBox="0 0 36 12" className="mt-0.5">
                <path d="M3 6 Q 8 1, 13 6 Q 18 11, 23 6 Q 28 1, 33 6" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
        </div>

        {/* Wings/Hands */}
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
