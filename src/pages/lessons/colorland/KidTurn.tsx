import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSuccess, playPop } from '../../../hooks/useParrotSpeech';
import { registerKidGesture, startKidASR, matchKidVoice, matchColorVoice } from './kidInput';
import type { GestureType } from '../../../hooks/useGestureControl';
import type { ParrotAnim } from '../../../hooks/useParrotSpeech';

// ============================================================
// KidTurn —— 幼儿的「回合」（鹦鹉提问 → 幼儿回答 → 正向反馈）
// 这不是一个全屏遮罩，而是一排「问答操作区」：放在大图舞台下方、
// 小鹦鹉上方的正常文档流里，所以不会遮挡舞台内容。
// 幼儿用三种方式回答：
//   · 点大按钮 ✅ / ❌        （最稳妥，手指粗也没关系）
//   · 用嘴说 "Yes!" / "No!"（语音识别，Chrome/Edge）
//   · 对着摄像头做动作       （点头/点赞/微笑/张开手 = Yes）
// 答对 → 热烈表扬；答错 → 温柔纠错再给一次；等不到 → 鹦鹉说答案继续。
// 使用父级传下来的 sayLines/setParrot（单一语音实例），保证小鹦鹉
// 说话动画与语音完全同步。
// ============================================================

type KidState = 'asking' | 'waiting' | 'right' | 'wrong' | 'gave';

interface Props {
  question: string;              // 鹦鹉问的话（如 "Is the bird blue?"）
  word?: string;                 // 需要展示的英文知识点（如 "Blue"）
  wordHex?: string;              // 该知识点的颜色（卡片背景）
  yesIsCorrect: boolean;         // 正确答案是 Yes 吗？
  colorWord?: string;            // 若问题带颜色，say 这个颜色词也算答对
  revealLine?: string;           // 等不到回应时，鹦鹉自己公布答案的台词
  onResult: (correct: boolean) => void;
  // 来自父级（Part）的单一语音实例
  setParrot: (a: ParrotAnim) => void;
  sayLines: (lines: string[], onAllDone?: () => void, lang?: string, action?: ParrotAnim) => void;
  resetSpeech: () => void;
}

export function KidTurn({ question, word, wordHex, yesIsCorrect, colorWord, revealLine, onResult, setParrot, sayLines, resetSpeech }: Props) {
  const [state, setState] = useState<KidState>('asking');
  const doneRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    resetSpeech();
    return () => resetSpeech();
  }, [resetSpeech]);

  // 提问：鹦鹉先说问题，说完给 1.5 秒停顿，再亮出按钮进入等待
  useEffect(() => {
    setParrot('thinking');
    sayLines([question], () => {
      setTimeout(() => setState('waiting'), 1500);
    }, 'en-US', 'thinking');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback((correct: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onResult(correct);
  }, [onResult]);

  // 处理幼儿回答
  const answer = useCallback((yes: boolean) => {
    if (stateRef.current !== 'waiting') return;
    const correct = yes === yesIsCorrect;
    setState(correct ? 'right' : 'wrong');
    if (correct) {
      playSuccess();
      setParrot('happy');
      sayLines(['Hooray! Yes!', 'You are so smart!'], () => {
        setTimeout(() => finish(true), 800);
      }, 'en-US', 'happy');
    } else {
      playPop();
      setParrot('shake');
      sayLines(['Hmm... let us look again.', 'Try it one more time, little friend!'], () => {
        setTimeout(() => setState('waiting'), 1200);
      }, 'en-US', 'shake');
    }
  }, [yesIsCorrect, sayLines, setParrot, finish]);

  // 等不到回应（超过 8 秒）→ 温柔给出答案
  useEffect(() => {
    if (state !== 'waiting') return;
    const t = setTimeout(() => {
      setState('gave');
      playSuccess();
      setParrot('happy');
      sayLines(['Great job listening!', revealLine ?? 'The answer is... yes! Good!'], () => {
        setTimeout(() => finish(yesIsCorrect), 700);
      }, 'en-US', 'happy');
    }, 8000);
    return () => clearTimeout(t);
  }, [state, yesIsCorrect, revealLine, sayLines, setParrot, finish]);

  // 摄像头手势 = 幼儿回答（点头/点赞/微笑/张开手 都算 Yes）
  useEffect(() => {
    const unregister = registerKidGesture((g: NonNullable<GestureType>) => {
      if (g === 'nod' || g === 'thumbs_up' || g === 'smile' || g === 'open_hand') {
        answer(true);
      }
    });
    return unregister;
  }, [answer]);

  // 语音识别 = 幼儿回答
  useEffect(() => {
    if (state !== 'waiting') return;
    let active = true;
    const stopListening = () => { if (active) { active = false; } };
    const cleanup = startKidASR((text) => {
      // 颜色词：问题带颜色时，说出该颜色就算答对（该颜色即正确答案）
      if (colorWord && matchColorVoice(text, colorWord)) {
        answer(true);
        stopListening();
        return;
      }
      const voice = matchKidVoice(text);
      if (voice) {
        answer(voice === 'yes');
        stopListening();
      }
    });
    return () => { stopListening(); cleanup(); };
  }, [state, colorWord, answer]);

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-1.5 py-1.5 min-h-[110px]">
      <AnimatePresence mode="wait">
        {state === 'waiting' ? (
          <motion.div
            key="quiz"
            className="w-full flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* 知识点卡：标准选择题 —— 把英文颜色词展示出来 */}
            {word && (
              <motion.div
                className="rounded-2xl px-6 py-2 shadow flex items-center justify-center"
                style={{ background: wordHex ?? '#42A5F5', border: '2px solid rgba(255,255,255,0.7)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 8 }}
              >
                <span className="text-3xl font-black text-white drop-shadow">{word}</span>
              </motion.div>
            )}
            <p className="text-base font-bold text-gray-600">{question}</p>
            {/* 大按钮：一指就能点 */}
            <div className="w-full flex gap-4">
              <motion.button
                onClick={() => answer(true)}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="flex-1 py-4 rounded-3xl text-white shadow-lg flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#66BB6A,#2E7D32)' }}
              >
                <span className="text-4xl">✅</span>
                <span className="text-xl font-black">YES</span>
              </motion.button>
              <motion.button
                onClick={() => answer(false)}
                whileTap={{ scale: 0.9 }}
                className="flex-1 py-4 rounded-3xl text-white shadow-lg flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#EF5350,#C62828)' }}
              >
                <span className="text-4xl">❌</span>
                <span className="text-xl font-black">NO</span>
              </motion.button>
            </div>
          </motion.div>
        ) : state === 'right' ? (
          <motion.div key="right" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 9 }} className="text-6xl">✅</motion.div>
        ) : state === 'wrong' ? (
          <motion.div key="wrong" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 9 }} className="text-6xl">🤗</motion.div>
        ) : state === 'gave' ? (
          <motion.div key="gave" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 9 }} className="text-6xl">💡</motion.div>
        ) : (
          <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-3xl">🤔</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}