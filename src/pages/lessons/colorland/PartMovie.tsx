import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParrotSpeech, playPop, playSuccess, playCrack } from '../../../hooks/useParrotSpeech';
import { ProgressDots } from './ColorShared';
import { publishKidParrot } from './kidInput';

// ============================================================
// Part V - Movie（拓展延伸 · 唐老鸭刷漆）
// 幼儿看不懂文字，本部分不显示标题/字幕，只保留进度圆点。
// 台词只使用学过的 3 个颜色（Blue/Green/Red）。
// 视听结合、边说边模仿，把颜色放进真实情境复现。
// ============================================================

interface Clip {
  key: string;
  scene: string;   // 主画面 emoji
  lines: string[]; // 声画同步台词
  bg: string;
  fx?: 'pop' | 'crack' | 'success';
  colors?: { word: string; hex: string }[]; // 片段里出现的颜色词
}

const CLIPS: Clip[] = [
  {
    key: 'pluto',
    scene: '🐶',
    lines: [
      'Look! This is Pluto. Pluto is carrying paints upstairs!',
      'Ouch! He falls down! Look at his body: a blue paw and a red back! Green butt! Funny Pluto!',
    ],
    bg: 'linear-gradient(180deg,#B3E5FC,#E1F5FE)',
    fx: 'crack',
    colors: [
      { word: 'Blue', hex: '#42A5F5' },
      { word: 'Red', hex: '#EF5350' },
      { word: 'Green', hex: '#66BB6A' },
    ],
  },
  {
    key: 'donald',
    scene: '🦆🚗',
    lines: ['This is Donald. Donald is painting his car.', 'What color? Red! Donald likes red!'],
    bg: 'linear-gradient(180deg,#FFCDD2,#FFF3F3)',
    fx: 'pop',
    colors: [{ word: 'Red', hex: '#EF5350' }],
  },
  {
    key: 'footprints',
    scene: '🐦🚗',
    lines: ['A little green bird comes! The bird walks on the car.', 'Oh no, dirty footprints! Donald is angry!'],
    bg: 'linear-gradient(180deg,#C8E6C9,#E8F5E9)',
    colors: [{ word: 'Green', hex: '#66BB6A' }],
  },
  {
    key: 'spark',
    scene: '⚡🚗',
    lines: [
      'Donald touches the wire! Zzzzt!',
      'Look at the car! Green, blue and red! Blue, green, red!',
    ],
    bg: 'linear-gradient(180deg,#E1BEE7,#F3E5F5)',
    fx: 'success',
    colors: [
      { word: 'Green', hex: '#66BB6A' },
      { word: 'Blue', hex: '#42A5F5' },
      { word: 'Red', hex: '#EF5350' },
    ],
  },
  {
    key: 'end',
    scene: '🖌️🐦',
    lines: [
      'Donald throws the brush! One, two, three!',
      'Wow, the bird becomes a red bird! The End!',
    ],
    bg: 'linear-gradient(180deg,#FFCDD2,#FFF3F3)',
    fx: 'pop',
    colors: [{ word: 'Red', hex: '#EF5350' }],
  },
];

interface Props {
  onDone: () => void;
}

export function PartMovie({ onDone }: Props) {
  const { parrot, setParrot, sayLines, resetSpeech } = useParrotSpeech();
  const [clipIndex, setClipIndex] = useState(0);
  const [playFx, setPlayFx] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);
  const laterRef = useRef(later);
  laterRef.current = later;
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  useEffect(() => {
    resetSpeech();
    return () => resetSpeech();
  }, [resetSpeech]);

  // 把小鹦鹉的实时动画发布到总线（右侧伙伴座订阅）
  useEffect(() => {
    publishKidParrot(parrot);
  }, [parrot]);

  const clip = CLIPS[clipIndex];

  // 进场：声画同步解说，看完自动进下一幕（电影即自动课堂）
  useEffect(() => {
    setPlayFx(false);
    if (clip.fx === 'crack') playCrack();
    if (clip.fx === 'pop') playPop();
    if (clip.fx === 'success') playSuccess();
    setParrot('excited');
    sayLines(clip.lines, () => {
      laterRef.current(() => setPlayFx(true), 400);
      laterRef.current(() => next(), 4200); // 留足时间让孩子看颜色词
    }, 'en-US', 'excited');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipIndex]);

  const next = () => {
    if (clipIndex < CLIPS.length - 1) {
      setClipIndex((i) => i + 1);
    } else {
      setParrot('happy');
      sayLines(['What a colorful movie!', 'Blue, green and red! You are a color star!'], () => onDone(), 'en-US', 'happy');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-4 py-3">
      {/* 顶部：只保留进度圆点 */}
      <div className="mb-1">
        <ProgressDots total={CLIPS.length} index={clipIndex} />
      </div>

      {/* 电影屏幕 */}
      <div className="relative flex-1 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden min-h-[200px]" style={{ background: clip.bg }}>
        {/* 胶片边孔 */}
        <div className="absolute inset-y-0 left-1 flex flex-col justify-around opacity-30">
          {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-sm bg-black" />)}
        </div>
        <div className="absolute inset-y-0 right-1 flex flex-col justify-around opacity-30">
          {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-sm bg-black" />)}
        </div>

        {/* 场景 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={clip.key}
              className="flex flex-col items-center"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <span className="text-8xl drop-shadow-2xl">{clip.scene}</span>
              {clip.fx === 'success' && playFx && (
                <motion.span
                  className="text-5xl -mt-2"
                  animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.8, 1, 0.8], rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              )}
              {clip.fx === 'crack' && playFx && (
                <motion.span
                  className="text-5xl -mt-2"
                  animate={{ scale: [0.5, 1.6, 0.5], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                >
                  💫
                </motion.span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 出现的颜色词标签 */}
        {playFx && clip.colors && clip.colors.length > 0 && (
          <motion.div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-wrap gap-1.5 justify-center px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {clip.colors.map((c, i) => (
              <motion.span
                key={c.word}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-black text-white shadow"
                style={{ background: c.hex, border: `1px solid ${c.hex}` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15 * i }}
              >
                {c.word}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}