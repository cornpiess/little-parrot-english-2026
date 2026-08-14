import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParrotSpeech, playPop } from '../../../hooks/useParrotSpeech';
import { ColorBird, ProgressDots } from './ColorShared';
import { FrogSinging, AppleLaughing } from './objects';
import { KidTurn } from './KidTurn';
import { publishKidParrot } from './kidInput';
import { colorOf, type ColorDef, type ColorKey } from './colorData';

// ============================================================
// Part II - Pattern Drills（句型与动词强化）· 自动课堂 + 双向互动
// 幼儿看不懂文字，所以本部分不显示字幕/标题：
//   只保留进度圆点 + 必要的知识点（颜色词大卡）。
// 大图用真实 SVG 手绘物体。小鹦鹉讲完三层垫句后提问，
// 幼儿用 ✅/❌ / 语音 / 摄像头手势回答。鹦鹉在下方，
// KidTurn 问答区在鹦鹉上方，互不遮挡。
// ============================================================

type Phase = 'intro' | 'wrong' | 'action' | 'summary' | 'quiz';

interface Scene {
  key: string;
  subject: string;        // 名词单数（带冠词）
  noun: string;           // 纯名词
  color: ColorKey;
  wrongColor: ColorKey;   // 错误反问的颜色
  verb: string;           // 现在分词
  onomatopoeia: string;   // 拟声词
  bg: string;             // 大图背景
}

const SCENES: Scene[] = [
  { key: 'fly', subject: 'a bird', noun: 'bird', color: 'blue', wrongColor: 'green', verb: 'flying', onomatopoeia: 'Chirp! Chirp!', bg: 'linear-gradient(180deg,#B3E5FC,#E1F5FE)' },
  { key: 'sing', subject: 'a frog', noun: 'frog', color: 'green', wrongColor: 'blue', verb: 'singing', onomatopoeia: 'Ribbit! Ribbit!', bg: 'linear-gradient(180deg,#C8E6C9,#E8F5E9)' },
  { key: 'laugh', subject: 'an apple', noun: 'apple', color: 'red', wrongColor: 'green', verb: 'laughing', onomatopoeia: 'Ha! Ha! Ha!', bg: 'linear-gradient(180deg,#FFCDD2,#FFF3F3)' },
];

interface Props {
  onDone: () => void;
}

export function PartPattern({ onDone }: Props) {
  const { parrot, setParrot, sayLines, resetSpeech } = useParrotSpeech();
  const [sceneIndex, setSceneIndex] = useState(0);
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

  const scene = SCENES[sceneIndex];
  const def: ColorDef = colorOf(scene.color);

  // 自动课堂：speak 完 → 留白跟读 → 下一拍
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
    setAnim('idle');
    const speakThen = (lines: string[], next: Phase, gap = 1200) => {
      say(lines, () => laterRef.current(() => setPhase(next), gap), 'en-US');
    };
    if (phase === 'intro') {
      setAnim('surprised');
      playPop();
      speakThen([`${scene.onomatopoeia} Wow! What is this?`, `It is ${scene.subject}. This is ${scene.subject}.`], 'wrong', 1400);
    } else if (phase === 'wrong') {
      setAnim('shake');
      speakThen([`Hmm... Is the ${scene.noun} ${colorOf(scene.wrongColor).word.toLowerCase()}?`, `No, it is not! The ${scene.noun} is ${scene.color}.`], 'action', 1400);
    } else if (phase === 'action') {
      setAnim('excited');
      speakThen([`What is the ${scene.color} ${scene.noun} doing? ${scene.verb.charAt(0).toUpperCase() + scene.verb.slice(1)}!`, `The ${scene.color} ${scene.noun} is ${scene.verb}!`], 'summary', 1500);
    } else if (phase === 'summary') {
      setAnim('happy');
      say([
        `This is ${scene.subject}.`,
        `The ${scene.noun} is ${scene.color}.`,
        `The ${scene.color} ${scene.noun} is ${scene.verb}!`,
      ], () => {
        laterRef.current(() => setPhase('quiz'), 1600);
      }, 'en-US', 'happy');
    }
  }, [phase, sceneIndex]);

  // KidTurn 问答：偶数张问「颜色是对的」= Yes；奇数张问「错误颜色」= No
  const quizYes = sceneIndex % 2 === 0;
  const quizDef = quizYes ? def : colorOf(scene.wrongColor);
  const quizQuestion = quizYes
    ? `Is the ${scene.noun} ${scene.color}?`
    : `Is the ${scene.noun} ${quizDef.word.toLowerCase()}?`;

  const quizDone = () => {
    later(() => {
      if (sceneIndex < SCENES.length - 1) {
        setSceneIndex((i) => i + 1); setPhase('intro');
      } else {
        onDone();
      }
    }, 500);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-4 py-3">
      {/* 顶部：只保留进度圆点 */}
      <div className="mb-1">
        <ProgressDots total={SCENES.length} index={sceneIndex} />
      </div>

      {/* 大图舞台 */}
      <div className="relative flex-1 w-full max-w-sm rounded-3xl shadow-xl overflow-hidden min-h-[120px]" style={{ background: scene.bg }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.key + phase}
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 18 }}
          >
            {/* 主体图：全部用真实 SVG 手绘物体 */}
            {scene.key === 'fly' && (
              <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>
                <ColorBird def={def} size={1.6} />
              </motion.div>
            )}
            {scene.key === 'sing' && <FrogSinging def={def} size={1.4} />}
            {scene.key === 'laugh' && <AppleLaughing def={def} size={1.4} />}

            {/* 颜色词大卡 = 必要的知识点（action/summary 阶段出现） */}
            <motion.div
              className={`mt-2 rounded-2xl px-5 py-1.5 ${phase === 'action' || phase === 'summary' ? '' : 'opacity-0'}`}
              style={{ background: def.css, border: `2px solid ${def.deep}` }}
              initial={{ scale: 0 }}
              animate={{ scale: phase === 'action' || phase === 'summary' ? 1 : 0 }}
              transition={{ type: 'spring', damping: 8 }}
            >
              <span className="text-2xl font-black text-white drop-shadow">{def.word} · {scene.verb}</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* KidTurn 问答区（标准选择题：显示英文颜色词 + 大按钮） */}
      {phase === 'quiz' && (
        <KidTurn
          question={quizQuestion}
          word={quizDef.word}
          wordHex={quizDef.css}
          yesIsCorrect={quizYes}
          colorWord={quizYes ? scene.color : undefined}
          revealLine={quizYes ? `Yes! It is ${scene.color}!` : `No! It is ${scene.color}!`}
          onResult={quizDone}
          setParrot={setParrot}
          sayLines={sayLines}
          resetSpeech={resetSpeech}
        />
      )}
    </div>
  );
}