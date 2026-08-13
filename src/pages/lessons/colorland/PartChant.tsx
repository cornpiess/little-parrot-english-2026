import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useParrotSpeech, playSuccess, playPop } from '../../../hooks/useParrotSpeech';
import { ProgressDots } from './ColorShared';
import { publishKidParrot } from './kidInput';
import { COLORS, colorOf, type ColorDef } from './colorData';

// ============================================================
// Part IV - Grammar & Chant（句型问答与韵律巩固）
// 幼儿看不懂文字，本部分只保留进度圆点 + 颜色卡片。
// 小鹦鹉在右侧伙伴座实时做动作（不占用课程区）。
// 小鹦鹉拿着颜色卡片快问快答：幼儿从 3 个色块里点选。
// 答对（It's ___! Great!）→ 下一张；答错（No! Try again!）→ 再试。
// ============================================================

interface Props {
  onDone: () => void;
}

export function PartChant({ onDone }: Props) {
  const { parrot, setParrot, sayLines, resetSpeech } = useParrotSpeech();
  const [cardIndex, setCardIndex] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    resetSpeech();
    return () => resetSpeech();
  }, [resetSpeech]);

  // 把小鹦鹉的实时动画发布到总线（右侧伙伴座订阅）
  useEffect(() => {
    publishKidParrot(parrot);
  }, [parrot]);

  const card: ColorDef = COLORS[cardIndex];

  // 选项：当前卡片 + 另外两个随机色（3 选 1）
  const options = useMemo(() => {
    const others = COLORS.filter((c) => c.key !== card.key);
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 2);
    return [card, ...shuffled].sort(() => Math.random() - 0.5);
  }, [card]);

  useEffect(() => {
    setAnswered(false);
    setWrongFlash(false);
    setParrot('thinking');
    const t = setTimeout(() => {
      sayLines([`What color is it?`, `Is it... hmm...?`], undefined, 'en-US', 'thinking');
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIndex]);

  const choose = (c: ColorDef) => {
    if (answered) return;
    if (c.key === card.key) {
      setAnswered(true);
      playSuccess();
      setParrot('happy');
      sayLines([`It is ${card.word}!`, `${card.word}, ${card.word}, it is ${card.word}!`], () => {
        if (cardIndex < COLORS.length - 1) {
          setTimeout(() => setCardIndex((i) => i + 1), 700);
        } else {
          setTimeout(() => onDone(), 700);
        }
      }, 'en-US', 'happy');
    } else {
      setWrongFlash(true);
      playPop();
      setParrot('shake');
      sayLines([`No! Not that one.`, `It is ${card.word}!`], undefined, 'en-US', 'shake');
      setTimeout(() => setWrongFlash(false), 900);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-4 py-3">
      {/* 顶部：只保留进度圆点 */}
      <div className="mb-1">
        <ProgressDots total={COLORS.length} index={cardIndex} />
      </div>

      {/* 颜色卡（大）+ 颜色词知识点 */}
      <div className={`flex-1 flex flex-col items-center justify-center min-h-[160px] ${wrongFlash ? 'animate-pulse' : ''}`}>
        <motion.div
          key={card.key}
          className="rounded-3xl shadow-2xl flex items-center justify-center"
          style={{
            width: 170, height: 170,
            background: `linear-gradient(145deg, ${card.light}, ${card.css} 55%, ${card.deep})`,
            border: `4px solid ${card.deep}`,
          }}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <span className="text-6xl drop-shadow">{card.emoji}</span>
        </motion.div>
        <motion.p
          className={`mt-2 text-3xl font-black text-white px-4 py-1 rounded-2xl ${answered ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: card.css }}
          initial={{ scale: 0 }}
          animate={{ scale: answered ? 1 : 0 }}
        >
          {card.word}!
        </motion.p>
      </div>

      {/* 3 选 1 色块（点选回答） */}
      <div className="w-full max-w-sm flex justify-center gap-4 mt-1">
        {options.map((c) => (
          <motion.button
            key={c.key}
            onClick={() => choose(c)}
            whileTap={{ scale: 0.88 }}
            className="rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1"
            style={{
              width: 90, height: 96,
              background: `linear-gradient(145deg, ${c.light}, ${c.css} 55%, ${c.deep})`,
              border: `3px solid ${answered && c.key === card.key ? 'white' : c.deep}`,
              boxShadow: answered && c.key === card.key ? `0 0 0 4px ${c.deep}` : undefined,
            }}
          >
            <span className="text-3xl">{colorOf(c.key).emoji}</span>
            <span className={`${answered && c.key === card.key ? 'text-white font-black' : 'text-white/90 font-bold'} text-lg`}>{c.word}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}