import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParrotSpeech, playPop, playSuccess, playCelebration } from '../../../hooks/useParrotSpeech';
import { Balloon, ProgressDots } from './ColorShared';
import { registerKidGesture, startBlowAudio, publishKidParrot } from './kidInput';
import { colorOf, type ColorKey } from './colorData';
import type { GestureType } from '../../../hooks/useGestureControl';

// ============================================================
// Part III - Story Time（情境绘本《The Balloons》）· 自动课堂 + 真实吹气
// 幼儿看懂不了文字，所以本部分不显示字幕/标题，只保留进度圆点。
// 轮到吹气球时，幼儿用前置摄像头「张嘴/吹气」（open_mouth）或
// 麦克风「呼——」的声音来把气球吹大（TPR 大动作，不用点按钮）。
// Bruce 高潮 BANG！后情绪释放。
// ============================================================

interface Kid {
  name: string;
  emoji: string;
  color: ColorKey;
  voice: string; // 变声提示
}

const KIDS: Kid[] = [
  { name: 'Alan', emoji: '👦', color: 'red', voice: 'little boy' },
  { name: 'Roy', emoji: '👦', color: 'blue', voice: 'naughty boy' },
  { name: 'Rita', emoji: '👧', color: 'green', voice: 'bright girl' },
];

interface Props {
  onDone: () => void;
}

export function PartStory({ onDone }: Props) {
  const { parrot, setParrot, sayLines, resetSpeech } = useParrotSpeech();
  const [kidIndex, setKidIndex] = useState(0);
  const [stage, setStage] = useState<'intro' | 'blow' | 'reveal' | 'over'>('intro');
  const [inflate, setInflate] = useState(0);
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

  const kid = KIDS[kidIndex];
  const def = colorOf(kid.color);

  const MAX_BLOWS = 3;
  const inflateRef = useRef(0);

  // 进场旁白（自动播放）
  useEffect(() => {
    setStage('intro');
    setInflate(0);
    inflateRef.current = 0;
    setParrot('happy');
    const speakIntro = (fn?: () => void) => {
      sayLines([`Look! This is ${kid.name}!`, `${kid.name} is blowing up a balloon! Whoosh, whoosh!`], () => fn?.(), 'en-US', 'happy');
    };
    const t = setTimeout(() => {
      speakIntro(() => laterRef.current(() => setStage('blow'), 900));
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidIndex]);

  // 幼儿「吹」= 摄像头张嘴(open_mouth) 或 麦克风吹气声 → 气球变大一档
  const blow = useCallback(() => {
    if (stage !== 'blow') return;
    if (inflateRef.current >= MAX_BLOWS) return;
    const next = inflateRef.current + 1;
    inflateRef.current = next;
    setInflate(next);
    playPop();
    setParrot('excited');
    if (next >= MAX_BLOWS) {
      setStage('reveal');
      playSuccess();
      setParrot('happy');
      sayLines([`What color is his balloon? ${def.word}!`, `${kid.name} is blowing up a ${def.word} balloon!`], () => nextKid(), 'en-US', 'happy');
    } else {
      sayLines(['Whoosh!', 'Bigger!'], undefined, 'en-US', 'excited');
    }
  }, [stage, def, kid, sayLines, setParrot, nextKid]);

  // 吹气输入：摄像头 open_mouth + 麦克风音量检测（双保险）
  useEffect(() => {
    if (stage !== 'blow') return;
    const unregister = registerKidGesture((g: NonNullable<GestureType>) => {
      if (g === 'open_mouth') blow();
    });
    const stopAudio = startBlowAudio(() => blow());
    return () => { unregister(); stopAudio(); };
  }, [stage, blow]);

  const nextKid = useCallback(() => {
    laterRef.current(() => {
      if (kidIndex < KIDS.length - 1) {
        setKidIndex((i) => i + 1);
      } else {
        setStage('over');
        setParrot('dance');
        playCelebration();
        sayLines(['Red, blue, green!', 'So many colors! Hooray!'], () => onDone(), 'en-US', 'dance');
      }
    }, 900);
  }, [kidIndex, sayLines, setParrot, onDone]);

  const balloonSize = 1 + inflate * 0.35;

  return (
    <div className="relative w-full h-full flex flex-col items-center px-4 py-3">
      {/* 顶部：只保留进度圆点 */}
      <div className="mb-1">
        <ProgressDots total={KIDS.length} index={kidIndex} />
      </div>

      {/* 故事舞台 */}
      <div className="relative flex-1 w-full max-w-sm rounded-3xl shadow-xl overflow-hidden min-h-[130px]" style={{ background: 'linear-gradient(180deg,#FCE4EC,#FFF8FB)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={kid.name}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 小朋友 */}
            <motion.div
              className="absolute left-6 bottom-4 text-7xl"
              animate={{ y: stage === 'intro' ? [0, -6, 0] : 0 }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              {kid.emoji}
            </motion.div>

            {/* 气球（幼儿吹气把它吹大） */}
            <div className="absolute right-8 top-8">
              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: balloonSize, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 10 }}
              >
                <Balloon def={def} size={0.9} inflate={balloonSize} />
              </motion.div>
            </div>

            {/* 吹气提示（大动作参与：张嘴吹 or 对麦克风吹） */}
            {stage === 'blow' && (
              <motion.div
                className="absolute right-20 bottom-8 flex items-center gap-1.5"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              >
                <span className="text-3xl">😮</span>
                <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-black text-pink-600">BLOW!</span>
              </motion.div>
            )}

            {/* 颜色词揭示 = 必要知识点 */}
            {stage === 'reveal' && (
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-2xl px-4 py-1"
                style={{ background: def.css }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 8 }}
              >
                <span className="text-2xl font-black text-white drop-shadow">{def.word}!</span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}