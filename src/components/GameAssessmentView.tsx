import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mic, Volume2 } from 'lucide-react';
import ParrotCharacter from './ParrotCharacter';

type ParrotState = 'sleeping' | 'listening' | 'thinking' | 'speaking';
type GamePhase = 'intro' | 'playing' | 'feedback' | 'result';

interface Question {
  id: number;
  type: 'listen-pick' | 'say-word' | 'match-emoji';
  prompt: string;
  options?: { label: string; emoji: string; correct: boolean }[];
  answer?: string;
  emoji?: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 1, type: 'listen-pick',
    prompt: '听一听，哪个是 "Apple"？',
    options: [
      { label: 'Apple', emoji: '🍎', correct: true },
      { label: 'Banana', emoji: '🍌', correct: false },
      { label: 'Grape', emoji: '🍇', correct: false },
    ],
  },
  {
    id: 2, type: 'match-emoji',
    prompt: '这是什么动物？',
    emoji: '🐱',
    options: [
      { label: 'Dog', emoji: '🐶', correct: false },
      { label: 'Cat', emoji: '🐱', correct: true },
      { label: 'Bird', emoji: '🐦', correct: false },
    ],
  },
  {
    id: 3, type: 'say-word',
    prompt: '试着说出这个单词吧！',
    answer: 'Sun',
    emoji: '☀️',
  },
  {
    id: 4, type: 'listen-pick',
    prompt: '听一听，哪个是 "Fish"？',
    options: [
      { label: 'Star', emoji: '⭐', correct: false },
      { label: 'Fish', emoji: '🐟', correct: true },
      { label: 'Moon', emoji: '🌙', correct: false },
    ],
  },
  {
    id: 5, type: 'match-emoji',
    prompt: '这个表情代表什么？',
    emoji: '🌈',
    options: [
      { label: 'Rainbow', emoji: '🌈', correct: true },
      { label: 'Cloud', emoji: '☁️', correct: false },
      { label: 'Rain', emoji: '🌧️', correct: false },
    ],
  },
];

function ProgressDots({ total, current, scores }: { total: number; current: number; scores: (boolean | null)[] }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full"
          style={{
            background: i === current
              ? 'hsl(25, 85%, 58%)'
              : scores[i] === true
                ? 'hsl(152, 60%, 48%)'
                : scores[i] === false
                  ? 'hsl(0, 70%, 60%)'
                  : 'hsl(0, 0%, 85%)',
            boxShadow: i === current ? '0 0 0 4px hsla(25, 85%, 58%, 0.25)' : 'none',
          }}
          animate={i === current ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export default function GameAssessmentView({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [scores, setScores] = useState<(boolean | null)[]>(Array(ASSESSMENT_QUESTIONS.length).fill(null));
  const [parrotState, setParrotState] = useState<ParrotState>('speaking');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = ASSESSMENT_QUESTIONS[questionIdx];
  const correctCount = scores.filter(s => s === true).length;

  const handleStart = () => {
    setPhase('playing');
    setParrotState('speaking');
  };

  const handleOptionSelect = useCallback((idx: number, correct: boolean) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    const newScores = [...scores];
    newScores[questionIdx] = correct;
    setScores(newScores);
    setParrotState(correct ? 'speaking' : 'thinking');

    setTimeout(() => {
      if (questionIdx < ASSESSMENT_QUESTIONS.length - 1) {
        setQuestionIdx(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
        setParrotState('speaking');
      } else {
        setPhase('result');
      }
    }, 1800);
  }, [questionIdx, scores, showFeedback]);

  const handleSayWord = useCallback(() => {
    setParrotState('listening');
    setTimeout(() => {
      setParrotState('thinking');
      setTimeout(() => {
        const pass = Math.random() > 0.3;
        const newScores = [...scores];
        newScores[questionIdx] = pass;
        setScores(newScores);
        setShowFeedback(true);
        setParrotState(pass ? 'speaking' : 'thinking');

        setTimeout(() => {
          if (questionIdx < ASSESSMENT_QUESTIONS.length - 1) {
            setQuestionIdx(prev => prev + 1);
            setSelectedOption(null);
            setShowFeedback(false);
            setParrotState('speaking');
          } else {
            setPhase('result');
          }
        }, 1800);
      }, 1200);
    }, 2000);
  }, [questionIdx, scores]);

  const getLevelLabel = () => {
    const ratio = correctCount / ASSESSMENT_QUESTIONS.length;
    if (ratio >= 0.8) return { label: '⭐ 小达人', desc: '你已经认识很多单词啦！', color: 'hsl(45, 90%, 55%)' };
    if (ratio >= 0.5) return { label: '🌱 小学徒', desc: '基础不错，继续加油！', color: 'hsl(152, 60%, 48%)' };
    return { label: '🐣 小萌新', desc: '没关系，我们一起慢慢学！', color: 'hsl(210, 75%, 58%)' };
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg, hsl(45, 80%, 95%) 0%, hsl(30, 70%, 93%) 30%, hsl(25, 60%, 91%) 60%, hsl(40, 75%, 94%) 100%)',
      }} />
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div key={i} className="absolute text-2xl" style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 3) * 25}%` }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}>
            {['⭐', '🎯', '🏆', '💎', '🎪', '🎨', '🎵', '🌟'][i]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-10 pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <span className="text-sm font-bold text-foreground/80">🎮 游戏测评</span>
        {phase === 'playing' && (
          <div className="flex-1 flex justify-end">
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.7)' }}>
              {questionIdx + 1}/{ASSESSMENT_QUESTIONS.length}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* INTRO */}
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 gap-5 relative z-10">
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <ParrotCharacter state="speaking" size={0.8} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass rounded-2xl px-6 py-4 max-w-[300px] text-center" style={{ background: 'rgba(255,255,255,0.85)' }}>
              <p className="text-base font-bold text-foreground mb-1">来玩个小游戏吧！🎮</p>
              <p className="text-xs text-muted-foreground">我会出几道题考考你，看看你已经学会了多少～别担心，答错了也没关系哦！</p>
            </motion.div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="px-10 py-3.5 rounded-2xl text-white font-bold text-sm"
              style={{ background: 'var(--gradient-primary-btn)', boxShadow: '0 6px 20px hsla(25, 90%, 60%, 0.3)' }}>
              开始挑战！🚀
            </motion.button>
          </motion.div>
        )}

        {/* PLAYING */}
        {phase === 'playing' && (
          <motion.div key={`q-${questionIdx}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="flex-1 flex flex-col px-5 pb-6 relative z-10">
            {/* Progress */}
            <div className="mb-4">
              <ProgressDots total={ASSESSMENT_QUESTIONS.length} current={questionIdx} scores={scores} />
            </div>

            {/* Parrot + prompt */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-16 h-18 flex-shrink-0">
                <ParrotCharacter state={parrotState} size={0.4} />
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex-1" style={{ background: 'rgba(255,255,255,0.85)' }}>
                <p className="text-sm font-semibold text-foreground">{question.prompt}</p>
                {question.type === 'listen-pick' && (
                  <motion.button whileTap={{ scale: 0.95 }} className="mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: 'hsla(25, 85%, 58%, 0.15)', color: 'hsl(25, 85%, 45%)' }}>
                    <Volume2 className="w-3.5 h-3.5" /> 再听一次
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Question content */}
            {question.type === 'say-word' ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className="text-8xl">{question.emoji}</motion.div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-3xl font-extrabold text-foreground">{question.answer}</motion.p>
                {showFeedback ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-center">
                    <div className="text-4xl mb-2">{scores[questionIdx] ? '🎉' : '💪'}</div>
                    <p className="text-sm font-bold text-foreground">
                      {scores[questionIdx] ? '发音真棒！' : '再练练就更好了！'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleSayWord}
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white"
                    style={{ background: 'var(--gradient-primary-btn)', boxShadow: '0 6px 20px hsla(25, 90%, 60%, 0.3)' }}>
                    <Mic className="w-8 h-8" />
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-3">
                {question.type === 'match-emoji' && (
                  <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                    className="text-7xl text-center my-3">{question.emoji}</motion.div>
                )}
                <div className="grid grid-cols-1 gap-3">
                  {question.options?.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    const showCorrect = showFeedback && opt.correct;
                    const showWrong = showFeedback && isSelected && !opt.correct;
                    return (
                      <motion.button key={i} whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        onClick={() => handleOptionSelect(i, opt.correct)}
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                        style={{
                          background: showCorrect
                            ? 'hsla(152, 60%, 48%, 0.15)'
                            : showWrong
                              ? 'hsla(0, 70%, 60%, 0.1)'
                              : isSelected
                                ? 'hsla(25, 85%, 58%, 0.1)'
                                : 'rgba(255,255,255,0.7)',
                          border: `2px solid ${showCorrect ? 'hsl(152, 60%, 48%)' : showWrong ? 'hsl(0, 70%, 60%)' : isSelected ? 'hsl(25, 85%, 58%)' : 'rgba(255,255,255,0.4)'}`,
                          backdropFilter: 'blur(12px)',
                        }}>
                        <span className="text-3xl">{opt.emoji}</span>
                        <span className="text-base font-bold text-foreground">{opt.label}</span>
                        {showCorrect && <span className="ml-auto text-xl">✅</span>}
                        {showWrong && <span className="ml-auto text-xl">❌</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-6 gap-5 relative z-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <ParrotCharacter state="speaking" size={0.7} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass rounded-3xl px-6 py-5 text-center w-full max-w-[320px]"
              style={{ background: 'rgba(255,255,255,0.88)' }}>
              <div className="text-5xl mb-2">{getLevelLabel().label}</div>
              <p className="text-lg font-extrabold text-foreground mb-1">测评完成！</p>
              <p className="text-sm text-muted-foreground mb-4">{getLevelLabel().desc}</p>

              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="px-4 py-2 rounded-2xl text-center" style={{ background: 'hsla(152, 60%, 48%, 0.1)' }}>
                  <p className="text-2xl font-extrabold" style={{ color: 'hsl(152, 60%, 42%)' }}>{correctCount}</p>
                  <p className="text-[10px] text-muted-foreground">答对</p>
                </div>
                <div className="text-muted-foreground/40 text-lg">/</div>
                <div className="px-4 py-2 rounded-2xl text-center" style={{ background: 'hsla(0, 0%, 50%, 0.08)' }}>
                  <p className="text-2xl font-extrabold text-foreground">{ASSESSMENT_QUESTIONS.length}</p>
                  <p className="text-[10px] text-muted-foreground">总题数</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span key={i} className="text-2xl"
                    initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + i * 0.15, type: 'spring' }}>
                    {i < Math.ceil(correctCount / ASSESSMENT_QUESTIONS.length * 5) ? '⭐' : '☆'}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <div className="flex gap-3 w-full max-w-[320px]">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                setPhase('intro');
                setQuestionIdx(0);
                setScores(Array(ASSESSMENT_QUESTIONS.length).fill(null));
                setSelectedOption(null);
                setShowFeedback(false);
              }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm glass">
                🔄 再来一次
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onBack}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                className="flex-1 py-3 rounded-2xl font-semibold text-white text-sm"
                style={{ background: 'var(--gradient-primary-btn)' }}>
                ✅ 完成
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
