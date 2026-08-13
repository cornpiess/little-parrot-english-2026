import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useParrotSpeech, playPop, playSuccess, playCelebration } from '../../../hooks/useParrotSpeech';

// ============================================================
// STAGE - 蚂蚁王国冒险（4 个节拍，只学 IN / OUT，和恐龙世界同结构）
//   beat 1 anthill: 宝宝蚂蚁 IN 蚁丘里 → 敲敲敲 → OUT!（出来）
//   beat 2 leaf:    蚂蚁饿了 → 把果子放 IN 篮子
//   beat 3 family:  蚂蚁妈妈来了 → 宝宝 IN 妈妈怀里
//   beat 4 home:    缩小机器回去变大 → 该回家找自己的妈妈了
// 每个节拍都用全身反应法(TPR)反复说 IN/OUT，3 岁幼儿靠重复习得。
// ============================================================
type Beat = 'anthill' | 'leaf' | 'family' | 'home';

interface Props {
  onDone: () => void;
}

// ---------- 小蚂蚁 ----------
function Ant({ size = 1, color = '#3E2723' }: { size?: number; color?: string }) {
  return (
    <svg width={40 * size} height={28 * size} viewBox="0 0 40 28">
      <path d="M8 4 L2 -4 M14 4 L20 -4" stroke={color} strokeWidth="1.4" />
      <circle cx="10" cy="8" r="5" fill={color} />
      <ellipse cx="20" cy="13" rx="9" ry="6" fill={color} />
      <ellipse cx="32" cy="11" rx="6" ry="4" fill={color} opacity="0.85" />
      <path d="M22 12 l6 -8 M28 14 l7 -1 M22 17 l6 8 M29 16 l7 5" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="7" cy="6" r="1.6" fill="white" />
    </svg>
  );
}

// ---------- 蚁丘（草叶盖住洞口，宝宝蚂蚁在里面） ----------
function AntHill({ taps }: { taps: number }) {
  const uncovered = taps >= 4;
  const leafX = Math.min(taps, 4) * 46;
  return (
    <svg width="220" height="190" viewBox="0 0 220 190">
      <path d="M30 190 Q20 120 90 100 Q170 110 190 190 Z" fill="#A1887F" />
      <path d="M40 190 Q38 130 90 112 Q150 122 170 190 Z" fill="#8D6E63" opacity="0.7" />
      <path d="M70 190 Q75 150 110 145 Q150 150 150 190 Z" fill="#A1887F" />
      {/* 洞口 */}
      <motion.ellipse
        cx="110" cy="128" rx="30" ry="22" fill="#3E2723"
        initial={{ opacity: uncovered ? 1 : 0 }}
        animate={{ opacity: uncovered ? 1 : 0.15 }}
      />
      {/* 盖住洞口的草叶（随敲击往旁边挪开） */}
      <motion.g animate={{ x: leafX, rotate: leafX > 0 ? 18 : 0 }} style={{ transformOrigin: '40px 120px' }} initial={false}>
        <path d="M38 108 Q120 80 170 120 Q120 150 46 138 Z" fill="#8BC34A" stroke="#689F38" strokeWidth="2" />
        <path d="M60 118 Q110 104 150 118" stroke="#689F38" strokeWidth="2" fill="none" />
      </motion.g>
      {uncovered && (
        <motion.g initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Ant size={1.1} color="#4E342E" />
          <g transform="translate(84 150)">
            <Ant size={1.1} color="#4E342E" />
          </g>
        </motion.g>
      )}
      <text x="110" y="182" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#5D4037">
        Ant Hill
      </text>
    </svg>
  );
}

// ---------- 篮子 + 果子 ----------
const BERRY_POS = [
  { x: 30, y: 40 },
  { x: 150, y: 60 },
  { x: 90, y: 170 },
];

function Berry({ collected }: { collected: boolean }) {
  return (
    <motion.svg
      width="40" height="44" viewBox="0 0 40 44"
      animate={collected ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 12 }}
    >
      <circle cx="20" cy="20" r="13" fill="#E53935" />
      <circle cx="14" cy="16" r="4" fill="#FFCDD2" opacity="0.8" />
      <path d="M20 7 L26 2 M20 7 L14 2" stroke="#66BB6A" strokeWidth="2" />
    </motion.svg>
  );
}

function Basket({ filled }: { filled: number }) {
  return (
    <svg width="120" height="90" viewBox="0 0 120 90">
      <path d="M12 30 L108 30 L98 84 L22 84 Z" fill="#FFB74D" stroke="#F57C00" strokeWidth="3" />
      <path d="M12 30 L40 14 L80 14 L108 30 Z" fill="#FFCC80" stroke="#F57C00" strokeWidth="3" />
      <path d="M4 30 L116 30 L116 38 L4 38 Z" fill="#F57C00" opacity="0.9" />
      {[...Array(filled)].map((_, i) => (
        <circle key={i} cx={30 + i * 28} cy={64} r="10" fill="#E53935" />
      ))}
      {filled > 0 && <text x="60" y="58" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#6D4C41">IN!</text>}
    </svg>
  );
}

// ---------- 蚂蚁一家 ----------
function AntFamily({ babyInArms = true }: { babyInArms?: boolean }) {
  return (
    <svg width="260" height="200" viewBox="0 0 260 200">
      <ellipse cx="130" cy="120" rx="96" ry="52" fill="#A1887F" opacity="0.35" />
      <g>
        <Ant size={2.4} color="#4E342E" />
        <text x="12" y="20" fontSize="12" fontWeight="bold" fill="#5D4037">Mom</text>
      </g>
      <g transform="translate(120 96)">
        <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <Ant size={1.5} color="#4E342E" />
        </motion.g>
      </g>
      {[...Array(3)].map((_, i) => (
        <motion.g key={i} animate={{ x: [0, i % 2 ? -8 : 8, 0] }} transition={{ duration: 2 + i, repeat: Infinity }}>
          <g transform={`translate(${30 + i * 55} 150)`}>
            <Ant size={0.8} />
          </g>
        </motion.g>
      ))}
      <motion.g animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity }}>
        <path d="M214 40 q10 -16 20 0 q-14 14 -20 14 q-6 0 -20 -14 q10 -16 20 0 Z" fill="#FF156D" />
      </motion.g>
      {babyInArms && (
        <text x="130" y="60" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#6A1B9A">
          IN mommy's arms! 💕
        </text>
      )}
    </svg>
  );
}

// ---------- 主组件 ----------
export function ParrotAntAdventure({ onDone }: Props) {
  const { setParrot, sayLines, showParrotAction, resetSpeech } = useParrotSpeech();

  const [beat, setBeat] = useState<Beat>('anthill');
  const [antTaps, setAntTaps] = useState(0);
  const [collected, setCollected] = useState<boolean[]>([false, false, false]);

  const parrotTimer = useRef<ReturnType<typeof setTimeout>>();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  useEffect(() => {
    resetSpeech();
    return () => resetSpeech();
  }, [resetSpeech]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // 每个节拍进场的旁白（反复说 IN/OUT）
  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    if (beat === 'anthill') {
      t.push(setTimeout(() => {
        showParrotAction('surprised', 2000);
        sayLines(['Guess what? There is a baby ant hiding IN the anthill!', 'Come tap the hill and help it come OUT!', 'Tap, tap, tap!']);
      }, 400));
    }
    if (beat === 'leaf') {
      t.push(setTimeout(() => {
        showParrotAction('excited', 1500);
        sayLines(['The baby ant is so hungry, look!', 'Here are some yummy berries.', 'Let us put every berry IN the basket!']);
      }, 400));
    }
    if (beat === 'family') {
      playCelebration();
      t.push(setTimeout(() => showParrotAction('hearts', 3000), 300));
      t.push(setTimeout(() => {
        sayLines(['Mommy ant is here at last!', 'The baby ant is safe and cuddly IN mommy\u2019s arms!']);
      }, 500));
    }
    if (beat === 'home') {
      playCelebration();
      t.push(setTimeout(() => showParrotAction('happy', 3000), 300));
      t.push(setTimeout(() => {
        sayLines(['Zap! The shrink machine made us big again!', 'Hooray, the ant family is all together now.', 'Let us wave bye bye to the ants, then go find YOUR mommy!']);
      }, 500));
    }
    return () => t.forEach(clearTimeout);
  }, [beat, sayLines, showParrotAction]);

  // beat1 完成：宝宝蚂蚁 OUT 出丘
  useEffect(() => {
    if (beat === 'anthill' && antTaps >= 4) {
      playCelebration();
      showParrotAction('cheer', 2500);
      sayLines(['Hooray, it worked! The baby ant is OUT of the hill now!'], () => {
        later(() => setBeat('leaf'), 900);
      }, 'en-US', 'cheer');
    }
  }, [antTaps, beat, setBeat, showParrotAction, sayLines, later]);

  // beat2 完成：果子都 IN 篮子里了
  const berriesCount = collected.filter(Boolean).length;
  useEffect(() => {
    if (beat === 'leaf' && berriesCount >= 3) {
      playSuccess();
      showParrotAction('clap', 2000);
      sayLines(['All the berries are IN the basket! Yum, what a yummy snack!'], () => {
        later(() => setBeat('family'), 900);
      }, 'en-US', 'clap');
    }
  }, [berriesCount, beat, setBeat, showParrotAction, sayLines, later]);

  const handleAntTap = () => {
    if (beat !== 'anthill' || antTaps >= 4) return;
    setAntTaps((c) => c + 1);
    playPop();
    setParrot('excited');
    if (parrotTimer.current) clearTimeout(parrotTimer.current);
    parrotTimer.current = setTimeout(() => setParrot('idle'), 900);
    if (antTaps === 3) sayLines(['Keep tapping! We can get it OUT!']);
    else sayLines(['Tap, tap, tap! Good job!']);
  };

  const handleBerry = (i: number) => {
    if (beat !== 'leaf' || collected[i]) return;
    playPop();
    setParrot('excited');
    setCollected((prev) => prev.map((v, j) => (j === i ? true : v)));
    if (parrotTimer.current) clearTimeout(parrotTimer.current);
    parrotTimer.current = setTimeout(() => setParrot('idle'), 900);
    sayLines(['In the basket! Yum!']);
  };

  const bg =
    beat === 'anthill' ? '#FFF8E1' :
    beat === 'leaf' ? '#E8F5E9' :
    beat === 'family' ? '#F3E5F5' :
    'linear-gradient(180deg,#FFF8E1 0%,#FFE0B2 60%,#FFCC80 100%)';

  const word = beat === 'anthill' ? 'OUT' : 'IN';
  const showWord = beat !== 'home';
  const wordHint =
    beat === 'anthill' ? 'OUT! 🐜' :
    beat === 'leaf' ? 'IN! 🫐' :
    'IN! 💕';

  return (
    <motion.div
      key="ant-adventure"
      className="absolute inset-0 overflow-hidden"
      style={{ background: bg, transition: 'background 1s' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 本课核心词大牌（反复出现） */}
      {showWord && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <motion.div
            key={word + beat}
            className="flex items-center gap-2 rounded-full bg-black/70 px-5 py-1.5 shadow-lg"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <span className={`text-3xl font-black ${word === 'OUT' ? 'text-orange-300' : 'text-emerald-300'}`}>{word}</span>
            <span className="text-sm text-white/85 font-bold">{wordHint}</span>
          </motion.div>
        </div>
      )}

      {/* 停在旁边的缩小机器（提示待会要回去） */}
      {beat !== 'anthill' && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 shadow text-sm pointer-events-none">
          <span>⚡</span>
          <span className="text-xs font-semibold text-gray-600">Shrink</span>
        </div>
      )}

      {/* 旁白气泡 */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
        <div className="px-5 py-2 rounded-2xl bg-white/80 text-center max-w-[80vw] shadow">
          <p className="text-lg font-bold text-gray-700">
            {beat === 'anthill' && (antTaps >= 4 ? 'OUT! The ant is out! 🐜' : 'IN the hill. Tap, tap!')}
            {beat === 'leaf' && (berriesCount >= 3 ? 'IN! The basket is full! 🫐' : 'IN the basket! Pick!')}
            {beat === 'family' && "IN mommy's arms!"}
            {beat === 'home' && 'Go find YOUR mommy! 🏠'}
          </p>
        </div>
      </div>

      {/* 场景内容 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {beat === 'anthill' && (
          <div className="flex flex-col items-center">
            <motion.button onClick={handleAntTap} whileTap={{ scale: 0.9 }} className="bg-transparent border-none" aria-label="敲蚁丘">
              <AntHill taps={antTaps} />
            </motion.button>
            {antTaps < 4 && <p className="mt-2 text-xl font-black text-amber-700">IN 🐜 → tap!</p>}
          </div>
        )}
        {beat === 'leaf' && (
          <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: 210, height: 190 }}>
              <div className="absolute left-0 right-0 bottom-0 flex justify-center">
                <Basket filled={berriesCount} />
              </div>
              {BERRY_POS.map((p, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleBerry(i)}
                  whileTap={{ scale: 0.85 }}
                  className="absolute bg-transparent border-none"
                  style={{ left: p.x, top: p.y }}
                  aria-label={`果子${i + 1}`}
                >
                  <Berry collected={collected[i]} />
                </motion.button>
              ))}
            </div>
            <p className="text-lg text-gray-600">{berriesCount} / 3</p>
          </div>
        )}
        {beat === 'family' && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center px-4">
            <AntFamily />
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setBeat('home')}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="mt-4 px-8 py-4 rounded-full text-white text-xl font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg,#AB47BC,#8E24AA)' }}
            >🛸 Go home!</motion.button>
          </motion.div>
        )}
        {beat === 'home' && (
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center px-4">
            <div className="relative rounded-3xl overflow-hidden border-4 border-purple-200 shadow-2xl p-4" style={{ background: 'linear-gradient(180deg,#E8F5E9,#A5D6A7)', width: 260 }}>
              <AntFamily />
              <p className="mt-1 text-center text-xl font-bold text-purple-700">Ant family is happy! 💕</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onDone}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="mt-4 px-8 py-4 rounded-full text-white text-xl font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg,#FFB74D,#FB8C00)' }}
            >🏠 Go find YOUR mommy!</motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}