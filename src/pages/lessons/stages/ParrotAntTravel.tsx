import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useParrotSpeech, playPop, playSuccess } from '../../../hooks/useParrotSpeech';

// ============================================================
// STAGE - 蚂蚁王国之旅（类似《蚁人》的缩小机器）
//   机器 IN → 缩小！Zap! → 花园蚂蚁国 → 选降落点
//   只出现英文 "IN"（我们 IN 缩小机器里）；每个视角等小鹦鹉
//   把台词说完（sayLines 完成回调）再切换，绝不打断它说话。
// ============================================================
type Phase = 'machine' | 'shrink' | 'garden' | 'land';

const LANDING_SPOTS = [
  { id: 'hill', emoji: '🐜', label: 'Ant Hill' },
  { id: 'leaf', emoji: '🌿', label: 'Big Leaf' },
  { id: 'flower', emoji: '🌸', label: 'Flower' },
];

const PHASE_BG: Record<Phase, string> = {
  machine: 'linear-gradient(180deg,#FFF8E1 0%,#FFECB3 55%,#FFE0B2 100%)',
  shrink: 'linear-gradient(180deg,#FFF8E1 0%,#F8E1FF 55%,#E1BEE7 100%)',
  garden: 'linear-gradient(180deg,#E8F5E9 0%,#C8E6C9 55%,#A5D6A7 100%)',
  land: 'linear-gradient(180deg,#E8F5E9 0%,#C8E6C9 55%,#A5D6A7 100%)',
};

interface Props {
  onDone: () => void;
}

export function ParrotAntTravel({ onDone }: Props) {
  const { setParrot, sayLines, showParrotAction, resetSpeech } = useParrotSpeech();
  const [phase, setPhase] = useState<Phase>('machine');
  const [picked, setPicked] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    resetSpeech();
    return () => resetSpeech();
  }, [resetSpeech]);

  // 视角推进：进机器 → 缩小 → 花园蚂蚁国 → 选降落
  useEffect(() => {
    if (phase === 'machine') {
      setParrot('excited');
      sayLines(['Are you ready, Captain?', 'We are getting IN the shrink machine together!']);
    } else if (phase === 'shrink') {
      showParrotAction('dizzy', 1800);
      sayLines(['Zap! Oh my, we are shrinking smaller and smaller!', 'Now we are so tiny and small!'], () => {
        later(() => setPhase('garden'), 1400);
      });
    } else if (phase === 'garden') {
      setParrot('excited');
      sayLines(['Welcome to the Ant Kingdom!', 'Wow, look at all the busy little ants!'], () => {
        later(() => setPhase('land'), 1400);
      });
    } else if (phase === 'land') {
      setParrot('excited');
      sayLines(['Where shall we land first?', 'You choose, Captain!']);
    }
  }, [phase, later, sayLines, setParrot, showParrotAction]);

  const startMachine = () => {
    playPop();
    setPhase('shrink');
    setParrot('excited');
  };

  const handleLand = () => {
    if (!picked) return;
    playSuccess();
    showParrotAction('happy', 2000);
    sayLines(['Zoom! Now we are small and ready in the Ant Kingdom!', 'Come on, let us go find the baby ant!'], () => {
      later(onDone, 800);
    });
  };

  return (
    <motion.div
      key="ant-travel"
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#FFF8E1,#FFE0B2)', transition: 'background 1s' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative z-10 min-h-full flex flex-col items-center px-4 pt-5 pb-40">
        <div className="text-center">
          <p className="text-2xl font-black text-purple-800 drop-shadow">🐜 Shrink Lab</p>
        </div>

        {/* 主视窗：缩小世界实景 */}
        <div
          className="mt-3 w-full max-w-sm relative rounded-[2rem] overflow-hidden border-4 border-purple-200 shadow-2xl"
          style={{ height: 340, background: PHASE_BG[phase], transition: 'background 1.2s' }}
        >
          {phase === 'machine' && (
            <div className="absolute top-2 left-3 z-30">
              <span className="text-xs font-black text-purple-900 bg-purple-200/90 rounded-full px-2.5 py-0.5 border border-purple-400/40">
                IN
              </span>
            </div>
          )}

          {phase === 'machine' && <MachineScene />}
          {phase === 'shrink' && <ShrinkScene />}
          {(phase === 'garden' || phase === 'land') && <GardenScene />}

          {/* 降落选择 */}
          {phase === 'land' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-end gap-2 p-3 bg-black/20">
              {LANDING_SPOTS.map((spot, i) => (
                <motion.button
                  key={spot.id}
                  onClick={() => setPicked(spot.label)}
                  whileTap={{ scale: 0.92 }}
                  className={`w-full py-3 rounded-2xl flex items-center justify-between px-4 text-white text-lg font-bold shadow-lg ${
                    picked === spot.label ? 'ring-4 ring-yellow-300' : ''
                  }`}
                  style={{ background: ['linear-gradient(135deg,#8D6E63,#5D4037)', 'linear-gradient(135deg,#66BB6A,#2E7D32)', 'linear-gradient(135deg,#EC407A,#C2185B)'][i] }}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 * i }}
                >
                  <span>{spot.emoji} {spot.label}</span>
                </motion.button>
              ))}
              {picked && (
                <motion.button
                  onClick={handleLand}
                  whileTap={{ scale: 0.92 }}
                  className="w-full py-3 rounded-2xl bg-white text-purple-700 text-lg font-black shadow-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  🐜 Land!
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* 操作台 */}
        <div className="mt-3 w-full max-w-sm rounded-2xl bg-black/30 border border-white/20 p-3 shadow-xl">
          {phase === 'machine' ? (
            <motion.button
              onClick={startMachine}
              whileTap={{ scale: 0.92 }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-full py-4 rounded-2xl text-white text-2xl font-black shadow-lg"
              style={{ background: 'linear-gradient(135deg,#AB47BC,#7B1FA2)' }}
            >
              IN! Get IN!
            </motion.button>
          ) : (
            <div className="flex-1 py-2 rounded-2xl bg-white/15 text-center text-white font-bold text-base">
              {phase === 'shrink' ? '⚡ Small!' : phase === 'garden' ? '🌿 Garden!' : '👇 Choose a spot!'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// 缩小世界场景（SVG 实景）
// ============================================================

function TinyKid({ scale = 1 }: { scale?: number }) {
  return (
    <g style={{ transformOrigin: '160px 150px' }} transform={`scale(${scale})`}>
      <circle cx="160" cy="118" r="16" fill="#FFD54F" />
      <circle cx="154" cy="114" r="2.5" fill="#333" />
      <circle cx="166" cy="114" r="2.5" fill="#333" />
      <path d="M154 124 Q160 130 166 124" stroke="#333" strokeWidth="2" fill="none" />
      <rect x="146" y="136" width="28" height="34" rx="10" fill="#EF5350" />
      <path d="M146 148 L132 158 M174 148 L188 158" stroke="#EF5350" strokeWidth="7" strokeLinecap="round" />
      <rect x="152" y="170" width="6" height="14" rx="3" fill="#37474F" />
      <rect x="164" y="170" width="6" height="14" rx="3" fill="#37474F" />
    </g>
  );
}

/** 缩小机器：宝宝站进去，等按下 IN */
function MachineScene() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 340" preserveAspectRatio="xMidYMid slice">
      <rect x="0" y="0" width="320" height="340" fill="#FFF8E1" />
      <rect x="0" y="290" width="320" height="50" fill="#FFE0B2" />
      <motion.g
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <rect x="120" y="60" width="80" height="160" rx="40" fill="#90CAF9" stroke="#1E88E5" strokeWidth="4" />
        <rect x="130" y="70" width="60" height="150" rx="30" fill="#E3F2FD" />
        <ellipse cx="160" cy="150" rx="34" ry="60" fill="#4FC3F7" opacity="0.45" />
        <rect x="148" y="218" width="24" height="18" fill="#546E7A" />
        <rect x="138" y="236" width="44" height="10" rx="5" fill="#78909C" />
        <path d="M96 280 L160 250 L224 280 Z" fill="#CFD8DC" />
        <path d="M120 160 Q88 158 84 130" stroke="#8D6E63" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="84" cy="124" r="8" fill="#EF5350" />
      </motion.g>
      <TinyKid />
      <text x="160" y="46" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#7B1FA2">
        SHRINK MACHINE
      </text>
      <text x="160" y="306" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#8D6E63">
        Shrink Machine
      </text>
    </svg>
  );
}

/** 缩小中：宝宝变小、闪光环扩散 */
function ShrinkScene() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 340" preserveAspectRatio="xMidYMid slice">
      <rect x="0" y="0" width="320" height="340" fill="#F8E1FF" />
      <rect x="0" y="290" width="320" height="50" fill="#F3D5F5" />
      <rect x="120" y="60" width="80" height="160" rx="40" fill="#90CAF9" stroke="#1E88E5" strokeWidth="4" />
      <rect x="130" y="70" width="60" height="150" rx="30" fill="#E3F2FD" />
      {[...Array(3)].map((_, i) => (
        <motion.circle
          key={i}
          cx="160" cy="150" r={30 + i * 24}
          fill="none"
          stroke="#7B1FA2"
          strokeWidth={4}
          initial={{ opacity: 0.8, scale: 0.4 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
      <motion.g animate={{ scale: [1, 0.35] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} style={{ transformOrigin: '160px 150px' }}>
        <TinyKid />
      </motion.g>
      <motion.text
        x="160" y="50" textAnchor="middle" fontSize="22" fontWeight="black" fill="#7B1FA2"
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      >
        ZAP!
      </motion.text>
    </svg>
  );
}

/** 花园蚂蚁国：我们变小后，草叶都巨大，看到蚁丘和蚂蚁 */
function GardenScene() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 340" preserveAspectRatio="xMidYMid slice">
      <rect x="0" y="0" width="320" height="200" fill="#B3E5FC" />
      <rect x="0" y="200" width="320" height="140" fill="#C8E6C9" />
      <circle cx="60" cy="50" r="24" fill="#FFF176" opacity="0.9" />
      <motion.ellipse cx="90" cy="42" rx="26" ry="12" fill="white" opacity="0.85" animate={{ x: [0, 14, 0] }} transition={{ duration: 6, repeat: Infinity }} />
      <motion.ellipse cx="230" cy="30" rx="20" ry="10" fill="white" opacity="0.7" animate={{ x: [0, -12, 0] }} transition={{ duration: 7, repeat: Infinity }} />
      {/* 巨大草叶（我们很小） */}
      {[24, 62, 260, 296].map((x, i) => (
        <path key={i} d={`M${x} 340 Q${x - 10} 220 ${x + (i % 2 ? 18 : -18)} 150`} stroke="#66BB6A" strokeWidth={10} strokeLinecap="round" fill="none" opacity="0.9" />
      ))}
      <path d="M180 340 Q150 250 208 180 L268 210 Q230 270 250 340 Z" fill="#81C784" opacity="0.9" />
      {/* 花朵 */}
      <g>
        <path d="M250 340 Q252 290 258 262" stroke="#66BB6A" strokeWidth="5" fill="none" />
        <circle cx="258" cy="252" r="14" fill="#EC407A" />
        {[...Array(5)].map((_, i) => (
          <ellipse key={i} cx={258 + 16 * Math.cos((i * 2 * Math.PI) / 5)} cy={252 + 16 * Math.sin((i * 2 * Math.PI) / 5)} rx="10" ry="10" fill="#F06292" />
        ))}
        <circle cx="258" cy="252" r="7" fill="#FFF176" />
      </g>
      {/* 蚁丘 */}
      <path d="M70 340 Q40 300 70 268 Q100 300 100 340 Z" fill="#A1887F" />
      <path d="M78 340 Q62 316 78 296 Q90 316 92 340 Z" fill="#8D6E63" opacity="0.8" />
      <ellipse cx="76" cy="290" rx="9" ry="7" fill="#4E342E" />
      {/* 小蚂蚁 */}
      {[...Array(3)].map((_, i) => (
        <motion.g
          key={i}
          animate={{ x: [0, i % 2 ? -18 : 18, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity }}
          style={{ transformOrigin: `${40 + i * 30}px ${318 - i * 14}px` }}
        >
          <ellipse cx={40 + i * 30} cy={318 - i * 14} rx="6" ry="4" fill="#3E2723" />
          <circle cx={40 + i * 30 - 7} cy={318 - i * 14 - 3} r="3.4" fill="#3E2723" />
          <path d={`M${40 + i * 30 + 2} ${318 - i * 14 - 2} l-3 -5 M${40 + i * 30 + 6} ${318 - i * 14 - 2} l3 -5`} stroke="#3E2723" strokeWidth="1.4" />
        </motion.g>
      ))}
      {/* 蝴蝶/瓢虫点缀 */}
      <motion.g animate={{ x: [0, 26, 0], y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}>
        <circle cx="140" cy="120" r="5" fill="#EF5350" />
        <circle cx="133" cy="115" r="3" fill="#333" />
      </motion.g>
    </svg>
  );
}