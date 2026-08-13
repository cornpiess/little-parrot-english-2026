import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Mascot from '../../../components/Mascot';
import ActionDemo from './ActionDemo';
import { useParrotSpeech, playPop, playSuccess, type ParrotAnim } from '../../../hooks/useParrotSpeech';

// ============================================================
// STAGE 1 + STAGE 4（同一个页面）
//  - mode="chat":    打招呼（第一阶段）——全英文、极短台词、大图标。
//                    内容：打招呼 / 天气 / 几岁（1-3）/ 零失败点读 apple。
//                    幼儿看不懂字，靠小鹦鹉的声音 + 大图标；短文字给家长辅助读。
//  - mode="farewell":告别（第四阶段）——全英文。夸赞→碰拳→挥手道别，
//                    孩子有动作参与，情绪更有仪式感。
//
// 规则：每问最多 2-3 个选项；一个具体名词；孩子点了就夸；
// 情绪由小鹦鹉自己的表情/动作表现，emoji 只做上下文图标（大）。
// ============================================================

interface ChatNode {
  q: string;
  emotion: string;
  hint: string;
  buttons: { label: string; emoji: string; isYes: boolean }[];
  yes: { parrot: string; emotion: string; hint: string; emoji: string };
  alt: { parrot: string; emotion: string; hint: string; emoji: string };
  held?: string; // 提问时小鸟手里拿的东西（如 🍎）
}

const chatFlow: ChatNode[] = [
  {
    q: 'Hello there, friend! I am Little Parrot. Who are you?',
    emotion: 'greeting',
    hint: 'Tap to say hi!',
    buttons: [
      { label: 'A kid', emoji: '👧', isYes: true },
      { label: 'A baby', emoji: '🐣', isYes: true },
    ],
    yes: { parrot: 'Yay! Nice to meet you, friend!', emotion: 'wave', hint: 'Hi!', emoji: '⭐' },
    alt: { parrot: 'Yay! Nice to meet you, friend!', emotion: 'wave', hint: 'Hi!', emoji: '⭐' },
  },
  {
    q: 'Is it sunny today, or is it rainy?',
    emotion: 'peek',
    hint: 'Peek up and look!',
    buttons: [
      { label: 'Sunny', emoji: '☀️', isYes: true },
      { label: 'Rainy', emoji: '🌧️', isYes: false },
    ],
    yes: { parrot: 'Sunny! The sun makes me so happy!', emotion: 'happy', hint: 'Sun!', emoji: '☀️' },
    alt: { parrot: 'Rain is fun too! Let us dance together!', emotion: 'dance', hint: 'Rain!', emoji: '🌧️' },
  },
  {
    q: 'How old are you? One? Two? Three?',
    emotion: 'thinking',
    hint: 'Count with your fingers!',
    buttons: [
      { label: '1', emoji: '✌️', isYes: false },
      { label: '2', emoji: '✌️', isYes: false },
      { label: '3', emoji: '✌️', isYes: true },
    ],
    yes: { parrot: 'Three! Wow, you are so big now!', emotion: 'surprised', hint: '3!', emoji: '🎉' },
    alt: { parrot: 'Aww, you are so loved and so big!', emotion: 'happy', hint: 'You are big!', emoji: '🎉' },
  },
  {
    q: 'I am holding something. What is it?',
    emotion: 'peek',
    hint: 'I am holding it! Peek!',
    held: '🍎',
    buttons: [
      { label: 'Apple', emoji: '🍎', isYes: true },
      { label: 'Bear', emoji: '🐻', isYes: false },
    ],
    yes: { parrot: 'Yes, that is an apple! Yum yum, apple!', emotion: 'clap', hint: 'Apple!', emoji: '🍎' },
    alt: { parrot: 'That is a bear. Close! This one is an apple!', emotion: 'shake', hint: 'Apple!', emoji: '🍎' },
  },
  {
    q: 'What do you like to eat? Ice cream or green veggies?',
    emotion: 'thinking',
    hint: 'Point to your favorite!',
    buttons: [
      { label: 'Ice cream', emoji: '🍦', isYes: true },
      { label: 'Veggies', emoji: '🥬', isYes: false },
    ],
    yes: { parrot: 'Ice cream! Oh my, I love ice cream too!', emotion: 'excited', hint: 'Yummy!', emoji: '🍦' },
    alt: { parrot: 'Green veggies are strong food! Hooray for you!', emotion: 'cheer', hint: 'Strong!', emoji: '🥬' },
  },
];

interface Props {
  mode: 'chat' | 'farewell';
  world?: 'dino' | 'ant' | 'color'; // farewell 时：这次是帮小恐龙/小蚂蚁/认识了颜色
  onDone: () => void; // chat 完成→过渡页；farewell「再玩一次」→回到 chat
  character?: 'parrot' | 'fox' | 'olaf' | 'dino';
}

/** 分发器：打招呼 → ChatGreeting；告别 → Farewell */
export function ParrotGreeting({ mode, world = 'dino', onDone, character = 'parrot' }: Props) {
  if (mode === 'farewell') return <Farewell world={world} onDone={onDone} character={character} />;
  return <ChatGreeting onDone={onDone} character={character} />;
}

// ============================================================
// 告别：夸赞 → 碰拳 → 道别。收尾尽量简单，适合幼儿。
// ============================================================
type FarewellStep = 'praise' | 'bump' | 'go';

function Farewell({ world, onDone, character = 'parrot' }: { world: 'dino' | 'ant' | 'color'; onDone: () => void; character: 'parrot' | 'fox' | 'olaf' | 'dino' }) {
  const navigate = useNavigate();
  const { parrot, setParrot, sayLines, resetSpeech } = useParrotSpeech();
  const [step, setStep] = useState<FarewellStep>('praise');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  useEffect(() => {
    resetSpeech();
    return () => resetSpeech();
  }, [resetSpeech]);

  // 开场词（全英文）：夸赞 → 自动进入碰拳
  useEffect(() => {
    setStep('praise');
    setParrot('hearts');
    const storyLine = world === 'color'
      ? 'You learned beautiful colors!'
      : `You helped the baby ${world === 'ant' ? 'ant' : 'dino'} find mommy!`;
    sayLines([
      `You are a big hero!`,
      storyLine,
      `I am so happy with you!`,
    ], () => {
      later(() => setStep('bump'), 500);
    }, 'en-US', 'hearts');
  }, [world, sayLines, setParrot, later]);

  const doBump = () => {
    playSuccess();
    setParrot('cheer');
    sayLines(['Fist bump! Boom boom boom! You are so strong!'], () => later(() => setStep('go'), 300), 'en-US', 'cheer');
  };

  // 最后一步：正式道别（拍手 + 挥手）
  const startedGo = useRef(false);
  useEffect(() => {
    if (step !== 'go' || startedGo.current) return;
    startedGo.current = true;
    playSuccess();
    setParrot('wave');
    sayLines(['We had so much fun together!'], () => {
      later(() => {
        setParrot('hearts');
        sayLines(['Wave, wave! Bye bye, see you soon!'], () => setParrot('fly'), 'en-US', 'hearts');
      }, 500);
    }, 'en-US', 'wave');
  }, [step, sayLines, setParrot, later]);

  return (
    <motion.div
      key="farewell"
      className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto px-4"
      style={{ background: 'linear-gradient(160deg,#CE93D8,#F48FB1)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="min-h-full flex flex-col items-center justify-center py-6 w-full max-w-md">
        {/* 小鹦鹉（情绪由它自己表现） */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="z-10"
        >
          <Mascot state={parrot} size={0.9} character={character} />
        </motion.div>

        {/* 中部舞台：掌声庆祝 / 碰拳 */}
        <div className="my-3 h-36 flex items-center justify-center w-full relative">
          {step === 'praise' && (
            <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <span className="text-6xl">👏</span>
            </motion.div>
          )}
          {step === 'bump' && (
            <FistBump />
          )}
          {step === 'go' && (
            <motion.span className="text-6xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>🎉</motion.span>
          )}
        </div>

        {/* 一句简短英文提示 */}
        <div className="px-5 py-2 rounded-2xl bg-white/80 text-center shadow">
          <p className="text-xl font-bold text-purple-800">
            {step === 'praise' && 'You did it, hero!'}
            {step === 'bump' && 'Bump your fist with me!'}
            {step === 'go' && 'Wave bye bye, hero!'}
          </p>
        </div>

        {/* 单个大按钮（一步一个动作） */}
        <div className="mt-5 flex flex-col items-center gap-3 z-30 w-full">
          {step === 'bump' && (
            <motion.button onClick={doBump} whileTap={{ scale: 0.92 }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
              className="w-full py-4 rounded-full text-white text-2xl font-bold shadow-lg" style={{ background: 'linear-gradient(135deg,#FF7043,#E64A19)' }}>
              👊 Bump!
            </motion.button>
          )}
          {step === 'go' && (
            <>
              <motion.button onClick={() => navigate('/play-together')} whileTap={{ scale: 0.92 }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                className="w-full py-4 rounded-full text-white text-2xl font-bold shadow-lg" style={{ background: 'linear-gradient(135deg,#66BB6A,#2E7D32)' }}>
                🎈 Let's play!
              </motion.button>
              <motion.button onClick={onDone} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-full bg-white/70 text-purple-700 text-base font-semibold shadow">
                🔄 One more time
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** 碰拳动画：两只拳头撞到一起 + 星星 */
function FistBump() {
  return (
    <div className="relative flex items-center justify-center gap-4">
      <motion.span className="text-6xl z-10" animate={{ x: [0, 26, 26, 0], scale: [1, 1.2, 1, 1] }} transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.5 }}>👊</motion.span>
      <motion.span className="text-6xl z-10" animate={{ x: [0, -26, -26, 0], scale: [1, 1.1, 1, 1] }} transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.5 }}>👊</motion.span>
      <motion.span
        className="absolute text-4xl z-0"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.5 }}
      >✨</motion.span>
    </div>
  );
}

// ============================================================
// 打招呼（状态机：思考 → 提问 → 倾听 → 回答后思考 → 再说）
// 两个阶段：qa（问答）→ done（出发）
// ============================================================

function ChatGreeting({ onDone, character = 'parrot' }: { onDone: () => void; character?: 'parrot' | 'fox' | 'olaf' | 'dino' }) {
  const { parrot, setParrot, sayLines, resetSpeech } = useParrotSpeech();

  const [phase, setPhase] = useState<'qa' | 'done'>('qa');
  const [chatIndex, setChatIndex] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatHint, setChatHint] = useState('');
  const [chatEmoji, setChatEmoji] = useState('');
  const [held, setHeld] = useState<string | undefined>();

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  useEffect(() => {
    resetSpeech();
    return () => resetSpeech();
  }, [resetSpeech]);

  // 聊天问答
  useEffect(() => {
    if (phase !== 'qa') return;
    if (chatIndex < chatFlow.length) {
      const node = chatFlow[chatIndex];
      setChatText(node.q);
      setChatHint(node.hint);
      setChatEmoji('');
      setHeld(node.held);
      setParrot(node.emotion as ParrotAnim);
      later(() => {
        setParrot(node.emotion as ParrotAnim);
        sayLines([node.q], () => {
          setTimeout(() => setParrot('listening'), 200);
        }, 'en-US', node.emotion as ParrotAnim);
      }, 700);
    } else {
      // 问答完成 → 出发
      setHeld(undefined);
      setParrot('excited');
      setChatText("Ready? Let's go!");
      setChatHint('');
      setChatEmoji('🚀');
      sayLines(['Ready! Let us go and find adventure!'], () => setPhase('done'));
    }
  }, [phase, chatIndex, sayLines, setParrot]);

  const handleChildAnswer = (isYes: boolean) => {
    if (phase !== 'qa' || chatIndex >= chatFlow.length) return;
    const resp = isYes ? node.yes : node.alt;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setParrot('thinking');
    later(() => {
      setChatText(resp.parrot);
      setChatHint(resp.hint);
      setChatEmoji(resp.emoji);
      setHeld(undefined);
      setParrot(resp.emotion as ParrotAnim);
      sayLines([resp.parrot], () => {
        setTimeout(() => setChatIndex((i) => i + 1), 500);
      }, 'en-US', resp.emotion as ParrotAnim);
    }, 1100);
  };

  const node = phase === 'qa' && chatIndex < chatFlow.length ? chatFlow[chatIndex] : null;

  return (
    <motion.div
      key="chat"
      className="absolute inset-0 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.4 }}
      style={{ background: '#FFF8E1' }}
    >
      {/* 装饰云朵 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute" style={{ left: `${10 + i * 25}%`, top: `${8 + (i % 2) * 12}%` }}>
            <svg width="80" height="40" viewBox="0 0 80 40" opacity="0.3">
              <ellipse cx="40" cy="25" rx="35" ry="15" fill="white" />
              <ellipse cx="25" cy="20" rx="20" ry="12" fill="white" />
              <ellipse cx="55" cy="20" rx="20" ry="12" fill="white" />
            </svg>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute bottom-2" style={{ left: `${8 + i * 9}%` }}>
            <svg width="20" height="26" viewBox="0 0 20 26">
              <circle cx="10" cy="7" r="5" fill={['#EF5350', '#FF9800', '#AB47BC', '#42A5F5', '#66BB6A'][i % 5]} opacity="0.6" />
              <rect x="9" y="12" width="2" height="14" rx="1" fill="#66BB6A" />
            </svg>
          </div>
        ))}
      </div>

      <div className="relative min-h-full flex flex-col items-center justify-center px-4 py-6">
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.3 }}
          className="z-10 relative"
        >
          <Mascot state={parrot} size={1.05} held={held} character={character} />
          {chatEmoji && (
            <motion.div
              className="absolute -top-4 -right-6 z-20"
              initial={{ scale: 0, rotate: 12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 8 }}
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80 shadow-lg text-3xl">
                {chatEmoji}
              </span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="mt-3 px-6 py-4 rounded-3xl bg-white shadow-lg max-w-[85%] text-center z-20 relative"
          key={chatText}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p className="text-2xl font-bold text-amber-800">{chatText}</p>
          <p className="text-base text-amber-500 mt-1">{chatHint}</p>
        </motion.div>

        <div className="mt-5 flex flex-wrap gap-3 justify-center z-20 relative px-4">
          {phase === 'qa' && node && node.buttons.map((b, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => handleChildAnswer(b.isYes)}
              className="px-7 py-3 rounded-full bg-white shadow-md text-xl font-semibold text-amber-700 flex items-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 * i }}
            >
              <span className="text-2xl">{b.emoji}</span>
              {b.label}
            </motion.button>
          ))}

          {phase === 'done' && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onDone}
              className="px-10 py-4 rounded-full text-white text-2xl font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg,#FFB74D,#FB8C00)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              🚀 Go!
            </motion.button>
          )}
        </div>
      </div>

      {/* 右下角：动作演示独立入口 */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowDemo(true)}
        className="absolute bottom-4 right-4 z-30 flex flex-col items-center justify-center rounded-2xl bg-white/85 shadow-lg px-3 py-2 border-2 border-amber-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-2xl">🎭</span>
        <span className="text-xs font-bold text-amber-700 mt-0.5">Watch me!</span>
      </motion.button>

      {/* 动作演示独立入口 */}
      <AnimatePresence>
        {showDemo && <ActionDemo character={character} onClose={() => setShowDemo(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}