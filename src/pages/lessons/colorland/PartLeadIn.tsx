import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParrotSpeech, playPop, playSuccess } from '../../../hooks/useParrotSpeech';
import { ColorBird, ProgressDots } from './ColorShared';
import { KidTurn } from './KidTurn';
import { publishKidParrot } from './kidInput';
import { COLORS } from './colorData';

// ============================================================
// Part I - Lead-in（词汇导入）· 自动课堂 + 双向互动
// 面向 0 基础幼儿：台词极短、一个词一个词来、多用拟声词与重复。
// 幼儿看不懂文字，只显示进度圆点 + 必要的知识点（颜色词大卡）。
// 小鹦鹉在幼儿前置摄像头右侧的伙伴座上实时做动作（见
// ParrotDinoAdventure），不占用课程区。
// ============================================================

type Phase = 'intro' | 'name' | 'puzzle' | 'reveal' | 'quiz' | 'chant' | 'bye';

interface Props {
  onDone: () => void;
}

export function PartLeadIn({ onDone }: Props) {
  const { parrot, setParrot, sayLines, resetSpeech } = useParrotSpeech();
  const [birdIndex, setBirdIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
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

  const bird = COLORS[birdIndex];

  // 自动课堂：每拍 speak 完 → 留白(让幼儿跟读) → 进入下一拍
  // 0 基础台词：一个词一步，短、慢、重复。
  // 注意：onDone/sayLines/setParrot 用 ref 引用，避免父组件重渲染导致
  // 本 effect 重复执行 → 每拍只会触发一次 sayLines，索引不会越界。
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const sayLinesRef = useRef(sayLines);
  sayLinesRef.current = sayLines;
  const setParrotRef = useRef(setParrot);
  setParrotRef.current = setParrot;
  useEffect(() => {
    const say = sayLinesRef.current;
    const setAnim = setParrotRef.current;
    const speakThen = (lines: string[], next: Phase, gap = 1200) => {
      say(lines, () => laterRef.current(() => setPhase(next), gap), 'en-US');
    };
    if (phase === 'intro') {
      setAnim('surprised');
      playPop();
      speakThen(['Chirp chirp! Look, look! A bird!', 'A little bird!'], 'name', 1500);
    } else if (phase === 'name') {
      setAnim('nod');
      speakThen(['Yes, a bird.', 'Bird! Say it with me: bird!'], 'puzzle', 1300);
    } else if (phase === 'puzzle') {
      setAnim('thinking');
      speakThen(['Hmm... what color?', 'Blue? Green? Hmm...'], 'reveal', 1500);
    } else if (phase === 'reveal') {
      setAnim('excited');
      playSuccess();
      speakThen([`${bird.word}!`, `It is ${bird.word.toLowerCase()}.`, `${bird.word} bird!`], 'quiz', 1400);
    } else if (phase === 'chant') {
      setAnim('happy');
      speakThen([`${bird.word}, ${bird.word}, ${bird.word} bird!`], 'bye', 2200);
    } else if (phase === 'bye') {
      setAnim('wave');
      playPop();
      say([`Bye bye, ${bird.word.toLowerCase()} bird!`, `The ${bird.word.toLowerCase()} bird flies away!`], () => {
        if (birdIndex < COLORS.length - 1) {
          laterRef.current(() => {
            setBirdIndex((i) => i + 1); setParrotRef.current('idle'); setPhase('intro');
          }, 800);
        } else {
          laterRef.current(() => {
            setParrotRef.current('dance');
            sayLinesRef.current(['Great job, little star!', 'Now let us sing! Blue, green, red!', 'La la la!'], () => onDoneRef.current(), 'en-US', 'dance');
          }, 800);
        }
      }, 'en-US', 'wave');
    }
  }, [phase, birdIndex]);

  // KidTurn 问答：偶数只问「小鸟是这个颜色吗」= Yes；奇数只问「别的颜色」= No
  const quizYes = birdIndex % 2 === 0;
  const wrongBird = COLORS[(birdIndex + 1) % COLORS.length];
  const quizBird = quizYes ? bird : wrongBird;
  const quizQuestion = quizYes
    ? `Is the bird ${bird.word.toLowerCase()}?`
    : `Is the bird ${wrongBird.word.toLowerCase()}?`;

  const quizDone = () => {
    later(() => setPhase('chant'), 500);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-4 py-3">
      {/* 顶部：只保留进度圆点（幼儿看不懂标题） */}
      <div className="mb-1">
        <ProgressDots total={COLORS.length} index={birdIndex} />
      </div>

      {/* 舞台：小鸟飞入 / 亮色 / 飞走 */}
      <div className="relative flex-1 flex items-center justify-center w-full min-h-[130px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={bird.key + phase + birdIndex}
            className="flex flex-col items-center"
            initial={{ x: phase === 'bye' ? 0 : -160, opacity: 0, scale: phase === 'reveal' ? 0.6 : 0.9 }}
            animate={{ x: phase === 'bye' ? 260 : 0, opacity: 1, scale: phase === 'reveal' ? 1.12 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 16, stiffness: 150 }}
          >
            <div className="drop-shadow-2xl">
              <ColorBird def={bird} size={1.5} />
            </div>
            {phase === 'reveal' && (
              <motion.div
                className="mt-1 rounded-2xl px-4 py-1"
                style={{ background: bird.css }}
                initial={{ scale: 0, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 8 }}
              >
                {/* 颜色词 = 必要的知识点 */}
                <span className="text-3xl font-black text-white drop-shadow">{bird.word}!</span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* KidTurn 问答区（标准选择题：显示英文颜色词 + 大按钮） */}
      {phase === 'quiz' && (
        <KidTurn
          question={quizQuestion}
          word={quizBird.word}
          wordHex={quizBird.css}
          yesIsCorrect={quizYes}
          colorWord={quizYes ? bird.word : undefined}
          revealLine={quizYes ? `Yes! It is ${bird.word}!` : `No! It is ${bird.word}!`}
          onResult={quizDone}
          setParrot={setParrot}
          sayLines={sayLines}
          resetSpeech={resetSpeech}
        />
      )}
    </div>
  );
}