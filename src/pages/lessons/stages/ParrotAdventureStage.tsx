import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useParrotSpeech, playCrack, playPop, playSuccess, playCelebration } from '../../../hooks/useParrotSpeech';

// ============================================================
// STAGE 3 - 恐龙星球冒险（5 个节拍，只学 IN / OUT）
//   beat 1 hatching: 宝宝恐龙 IN 蛋里 → 敲敲敲 → OUT!（出壳）
//   beat 2 rock:     大石头 IN 路中间 → 一起推 → OUT of the way!
//   beat 3 reunion:  回到妈妈怀里 IN
//   beat 4 board:    登上飞船 IN，告诉幼儿该回家找自己的妈妈了
//   beat 5 home:     从舷窗看到小恐龙和妈妈幸福生活 → 起飞回家
// 每个节拍都用全身反应法(TPR)反复说 IN/OUT，3 岁幼儿靠重复习得。
// 幼儿摄像头 + 小鹦鹉（伙伴座）在协调器里一直并肩。
// ============================================================
export type SceneId = 'hatching' | 'rock' | 'reunion' | 'board' | 'home';

interface Props {
  scene: SceneId;
  setScene: React.Dispatch<React.SetStateAction<SceneId>>;
  onDone: () => void;
}

// ---------- SVG components ----------
function DinoEgg({ level }: { level: number }) {
  const crack = level >= 2;
  const split = level >= 4;
  return (
    <svg width="180" height="200" viewBox="0 0 180 200">
      {!split ? (
        <g>
          <ellipse cx="90" cy="110" rx="62" ry="78" fill="#FFE0B2" stroke="#FFB74D" strokeWidth="4" />
          <ellipse cx="68" cy="92" rx="14" ry="20" fill="#FFF3E0" opacity="0.7" />
          {crack && (
            <path d="M40 70 L60 95 L48 110 L72 120 L55 145" stroke="#8D6E63" strokeWidth="3" fill="none" />
          )}
          {crack && (
            <path d="M140 75 L118 100 L132 118 L110 130 L128 152" stroke="#8D6E63" strokeWidth="3" fill="none" />
          )}
        </g>
      ) : (
        <g>
          <path d="M30 70 Q90 -10 150 70 L150 95 L30 95 Z" fill="#FFE0B2" stroke="#FFB74D" strokeWidth="4" />
          <path d="M30 95 L150 95 L150 120 Q90 150 30 120 Z" fill="#FFCC80" stroke="#FFB74D" strokeWidth="4" />
          <BabyDino size={70} x={90} y={140} />
        </g>
      )}
    </svg>
  );
}

function BabyDino({ size = 120, x = 0, y = 0 }: { size?: number; x?: number; y?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ marginLeft: x, marginTop: y }}>
      <ellipse cx="60" cy="80" rx="40" ry="32" fill="#AED581" />
      <ellipse cx="60" cy="46" rx="28" ry="26" fill="#AED581" />
      <circle cx="50" cy="42" r="5" fill="#333" />
      <circle cx="70" cy="42" r="5" fill="#333" />
      <path d="M52 54 Q60 62 68 54" stroke="#333" strokeWidth="3" fill="none" />
      <path d="M88 40 L104 36 L92 52 Z" fill="#FFB74D" />
      <path d="M28 80 L12 96 M92 80 L108 96" stroke="#AED581" strokeWidth="8" strokeLinecap="round" />
      <path d="M44 108 L44 120 M76 108 L76 120" stroke="#AED581" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function BigRock({ pushes }: { pushes: number }) {
  const offset = Math.min(pushes, 5) * 34;
  return (
    <motion.svg
      width="200" height="160" viewBox="0 0 200 160"
      animate={{ x: offset, opacity: pushes >= 5 ? 0.4 : 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      <ellipse cx="100" cy="120" rx="80" ry="36" fill="#90A4AE" />
      <ellipse cx="100" cy="100" rx="70" ry="50" fill="#B0BEC5" />
      <path d="M60 80 L80 60 L100 78 L120 58 L140 82" stroke="#78909C" strokeWidth="4" fill="none" />
    </motion.svg>
  );
}

function MommaDino() {
  return (
    <svg width="280" height="220" viewBox="0 0 280 220">
      <ellipse cx="140" cy="150" rx="90" ry="55" fill="#81C784" />
      <ellipse cx="140" cy="90" rx="46" ry="44" fill="#81C784" />
      <circle cx="124" cy="84" r="7" fill="#333" />
      <circle cx="156" cy="84" r="7" fill="#333" />
      <path d="M126 102 Q140 114 154 102" stroke="#333" strokeWidth="4" fill="none" />
      <path d="M186 78 L214 70 L194 98 Z" fill="#FFB74D" />
      <path d="M50 150 Q10 130 0 160 Q30 160 50 168 Z" fill="#81C784" />
      <path d="M100 200 L100 215 M180 200 L180 215" stroke="#81C784" strokeWidth="14" strokeLinecap="round" />
      <BabyDino size={70} x={190} y={130} />
    </svg>
  );
}

/** 登上飞船后从舷窗看到：小恐龙和妈妈幸福生活在一起 */
function ShipHomeScene({ onDone }: { onDone: () => void }) {
  const stars = [...Array(22)].map((_, i) => ({ x: (i * 61) % 240, y: (i * 41) % 240, r: 1 + (i % 3), d: 1 + (i % 4) * 0.5 }));
  return (
    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center px-4">
      {/* 舷窗 */}
      <div className="relative rounded-[3rem] overflow-hidden border-8 border-[#3f4tag] shadow-2xl" style={{ borderColor: '#4a5568', width: 250, height: 250, background: 'linear-gradient(180deg,#0b1030,#3d86ff)' }}>
        <svg width="250" height="250" viewBox="0 0 240 240" className="absolute inset-0">
          {stars.map((s, i) => (
            <motion.circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.6, repeat: Infinity, delay: (i % 6) * 0.3 }} />
          ))}
          <path d="M0 170 Q120 150 240 170 L240 240 L0 240 Z" fill="#2E4B2F" />
          <ellipse cx="120" cy="214" rx="130" ry="40" fill="#3a6b3a" />
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="230" height="230" viewBox="0 0 230 230">
            <ellipse cx="120" cy="160" rx="70" ry="42" fill="#81C784" />
            <ellipse cx="120" cy="112" rx="36" ry="34" fill="#81C784" />
            <circle cx="108" cy="106" r="5.5" fill="#333" />
            <circle cx="132" cy="106" r="5.5" fill="#333" />
            <path d="M110 124 Q120 132 130 124" stroke="#333" strokeWidth="3" fill="none" />
            <ellipse cx="70" cy="180" rx="30" ry="20" fill="#AED581" />
            <ellipse cx="70" cy="158" rx="18" ry="18" fill="#AED581" />
            <circle cx="64" cy="154" r="3.5" fill="#333" />
            <circle cx="77" cy="154" r="3.5" fill="#333" />
            <path d="M66 164 Q71 169 76 164" stroke="#333" strokeWidth="2.5" fill="none" />
            <path d="M88 196 Q94 206 100 196" stroke="#102027" strokeWidth="3" />
            <path d="M140 196 Q146 206 152 196" stroke="#102027" strokeWidth="3" />
            <motion.g animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity }}>
              <path d="M150 70 q10 -14 20 0 q-5 12 -20 12 q-15 0 -20 -12 q10 -14 20 0 Z" fill="#FF156D" />
            </motion.g>
            <motion.g animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 }}>
              <path d="M100 60 q8 -11 16 0 q-10 10 -16 10 q-6 0 -16 -10 q8 -11 16 0 Z" fill="#FF69B4" />
            </motion.g>
            <circle cx="56" cy="210" r="7" fill="#FF156D" />
            <circle cx="172" cy="208" r="6" fill="#FF156D" />
          </svg>
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1">
          <span className="text-[11px] text-white bg-black/45 rounded-t px-2 py-0.5 font-bold">🌍 Dino Planet · Bye bye!</span>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onDone}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="mt-4 px-8 py-4 rounded-full text-white text-xl font-bold shadow-lg"
        style={{ background: 'linear-gradient(135deg,#FFB74D,#FB8C00)' }}
      >🛸 Fly home!</motion.button>
    </motion.div>
  );
}

/** 登上飞船：宝宝和小鹦鹉 IN 驾驶舱，从挡风窗望向回家的路（过渡到 home 的舷窗幸福画面） */
function ShipCockpitScene() {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative rounded-[2rem] overflow-hidden border-4 border-white/30 shadow-2xl"
      style={{ width: 260, height: 250, background: 'linear-gradient(180deg,#1a1a4a,#2a3a7a)' }}
    >
      {/* 挡风窗外：太空 + 远方家园地球 */}
      <div className="absolute inset-2 rounded-[1.6rem] overflow-hidden" style={{ background: 'linear-gradient(180deg,#05060f,#0b1233)' }}>
        <svg width="100%" height="100%" viewBox="0 0 240 220" preserveAspectRatio="xMidYMid slice">
          {[...Array(18)].map((_, i) => (
            <motion.circle
              key={i}
              cx={(i * 43) % 240}
              cy={(i * 29) % 220}
              r={1 + (i % 2)}
              fill="white"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: (i % 6) * 0.3 }}
            />
          ))}
          <motion.g animate={{ scale: [0.7, 0.85], opacity: [0.9, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '180px 60px' }}>
            <circle cx="180" cy="60" r="42" fill="#1E90FF" />
            <ellipse cx="172" cy="52" rx="14" ry="18" fill="#3CB371" transform="rotate(-12 172 52)" />
          </motion.g>
          <path d="M0 150 Q120 130 240 150 L240 220 L0 220 Z" fill="#2a2f55" />
          <text x="120" y="205" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#FFD54F">🏠 HOME ➜</text>
        </svg>
      </div>

      {/* 舱内仪表台 */}
      <div className="absolute inset-x-0 bottom-0 h-14" style={{ background: 'linear-gradient(0deg,#23263a,#14162a)' }}>
        <div className="flex items-end justify-center gap-6 pt-2">
          <div className="w-10 h-8 rounded-md bg-cyan-400/80 shadow-inner" />
          <div className="w-10 h-10 rounded-full bg-red-500 border-4 border-red-300 animate-pulse" />
          <div className="w-10 h-8 rounded-md bg-emerald-400/80 shadow-inner" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-14 flex justify-center pb-1">
        <span className="text-[11px] text-white bg-black/45 rounded-t px-2 py-0.5 font-bold">🛸 Cockpit</span>
      </div>
    </motion.div>
  );
}

// ---------- Main stage ----------
export function ParrotAdventureStage({ scene, setScene, onDone }: Props) {
  const { setParrot, sayLines, showParrotAction, resetSpeech } = useParrotSpeech();

  const [eggClicks, setEggClicks] = useState(0);
  const [rockPushes, setRockPushes] = useState(0);
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
    if (scene === 'hatching') {
      t.push(setTimeout(() => {
        showParrotAction('surprised', 2000);
        sayLines(['Guess what? There is a sleepy baby dino hiding IN the egg!', 'Come tap the egg and help it come OUT!', 'Tap, tap, tap!']);
      }, 400));
    }
    if (scene === 'rock') {
      t.push(setTimeout(() => {
        showParrotAction('excited', 1500);
        sayLines(['Oh no, look at that! A big rock is IN the way!', 'We have to push it so it moves OUT of the path!', 'Together we go: push, push, push!']);
      }, 400));
    }
    if (scene === 'reunion') {
      playCelebration();
      t.push(setTimeout(() => showParrotAction('hearts', 3000), 300));
      t.push(setTimeout(() => {
        sayLines(['Mommy is finally here! She is so happy to see her baby.', 'The baby dino is safe IN mommy\u2019s arms right now.', 'Give them a happy wave, then hop back IN the ship!']);
      }, 500));
    }
    if (scene === 'board') {
      t.push(setTimeout(() => showParrotAction('happy', 2500), 300));
      t.push(setTimeout(() => {
        sayLines(['We are riding home IN the spaceship now.', 'Goodbye, little dino! It is time to go home to YOUR mommy!']);
      }, 500));
    }
    if (scene === 'home') {
      playCelebration();
      t.push(setTimeout(() => showParrotAction('happy', 3000), 300));
      t.push(setTimeout(() => {
        sayLines(['Look through the window, can you see them?', 'The little dino and mommy are so happy together!', 'Let us wave and say bye bye to the dinos, then fly home!']);
      }, 500));
    }
    return () => t.forEach(clearTimeout);
  }, [scene, sayLines, showParrotAction]);

  // beat1 完成：敲开蛋壳 → OUT!
  useEffect(() => {
    if (scene === 'hatching' && eggClicks >= 4) {
      playCelebration();
      showParrotAction('cheer', 2500);
      sayLines(['Hooray, it worked! The baby dino is OUT of the egg now!'], () => {
        later(() => setScene('rock'), 900);
      }, 'en-US', 'cheer');
    }
  }, [eggClicks, scene, setScene, showParrotAction, sayLines, later]);

  // beat2 完成：推开石头 → OUT of the way!
  useEffect(() => {
    if (scene === 'rock' && rockPushes >= 5) {
      playSuccess();
      showParrotAction('clap', 2000);
      sayLines(['The rock is OUT of the way now! What great pushing!'], () => {
        later(() => setScene('reunion'), 900);
      }, 'en-US', 'clap');
    }
  }, [rockPushes, scene, setScene, showParrotAction, sayLines, later]);

  const handleEggTap = () => {
    if (scene !== 'hatching' || eggClicks >= 4) return;
    setEggClicks((c) => c + 1);
    playPop();
    setParrot('excited');
    if (parrotTimer.current) clearTimeout(parrotTimer.current);
    parrotTimer.current = setTimeout(() => setParrot('idle'), 900);
    if (eggClicks === 3) sayLines(['Keep tapping! We can get it OUT!']);
    else sayLines(['Tap, tap, tap! Good job!']);
  };

  const handleRockPush = () => {
    if (scene !== 'rock' || rockPushes >= 5) return;
    setRockPushes((p) => p + 1);
    playCrack();
    setParrot('excited');
    if (parrotTimer.current) clearTimeout(parrotTimer.current);
    parrotTimer.current = setTimeout(() => setParrot('idle'), 900);
    sayLines(['Push hard! We want it OUT of the way!']);
  };

  const bg =
    scene === 'hatching' ? '#FFF3E0' :
    scene === 'rock' ? '#ECEFF1' :
    scene === 'reunion' ? '#F3E5F5' :
    scene === 'board' ? 'linear-gradient(180deg,#1a1a4a 0%,#2a3a7a 60%,#4a5a9a 100%)' :
    'linear-gradient(180deg,#0b1030 0%,#21124a 60%,#3d4a8f 100%)';

  const word = scene === 'hatching' || scene === 'rock' ? 'OUT' : 'IN';
  const wordHint =
    scene === 'hatching' ? 'OUT! 🐣' :
    scene === 'rock' ? 'OUT! 🪨' :
    scene === 'reunion' ? 'IN! 💕' :
    scene === 'board' ? 'IN! 🛸' :
    'IN! 🛸';

  return (
    <motion.div
      key="adventure"
      className="absolute inset-0 overflow-hidden"
      style={{ background: bg, transition: 'background 1s' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 本课核心词大牌（反复出现） */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          key={word}
          className="flex items-center gap-2 rounded-full bg-black/70 px-5 py-1.5 shadow-lg"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          <span className={`text-3xl font-black ${word === 'OUT' ? 'text-orange-300' : 'text-emerald-300'}`}>{word}</span>
          <span className="text-sm text-white/85 font-bold">{wordHint}</span>
        </motion.div>
      </div>

      {/* 停在一旁的飞船（提示下船了/待会要回去） */}
      {scene !== 'hatching' && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 shadow text-sm pointer-events-none">
          <span>🛸</span>
          <span className="text-xs font-semibold text-gray-600">Ship</span>
        </div>
      )}

      {/* 旁白气泡（小鹦鹉在左下角陪幼儿，不重复画） */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
        <div className="px-5 py-2 rounded-2xl bg-white/80 text-center max-w-[80vw] shadow">
          <p className="text-lg font-bold text-gray-700">
            {scene === 'hatching' && (eggClicks >= 4 ? 'OUT! It is out! 🐣' : 'IN the egg. Tap, tap!')}
            {scene === 'rock' && (rockPushes >= 5 ? 'OUT! The way is clear! 🪨' : 'IN the way! Push it!')}
            {scene === 'reunion' && "IN mommy's arms!"}
            {scene === 'board' && 'IN the ship!'}
            {scene === 'home' && 'Dino family is happy! 🛸'}
          </p>
        </div>
      </div>

      {/* 场景内容 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {scene === 'hatching' && (
          <div className="flex flex-col items-center">
            <motion.button onClick={handleEggTap} whileTap={{ scale: 0.9 }} className="bg-transparent border-none" aria-label="敲蛋">
              <DinoEgg level={eggClicks} />
            </motion.button>
          </div>
        )}
        {scene === 'rock' && (
          <div className="flex flex-col items-center gap-4">
            <BigRock pushes={rockPushes} />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleRockPush}
              className="px-8 py-4 rounded-full bg-blue-500 text-white text-2xl font-bold shadow"
            >💪 PUSH! OUT!</motion.button>
            <p className="text-lg text-gray-600">{rockPushes} / 5</p>
          </div>
        )}
        {scene === 'reunion' && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center px-4">
            <MommaDino />
            <p className="mt-2 text-2xl font-bold text-purple-700">IN mommy's arms! 🏡</p>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setScene('board')}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="mt-4 px-8 py-4 rounded-full text-white text-xl font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg,#AB47BC,#8E24AA)' }}
            >🛸 Hop IN the ship!</motion.button>
          </motion.div>
        )}
        {scene === 'board' && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center px-4">
            <ShipCockpitScene />
            <p className="mt-2 text-2xl font-bold text-indigo-100">Go find mommy! 🏠</p>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setScene('home')}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="mt-4 px-8 py-4 rounded-full text-white text-xl font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg,#5C6BC0,#3949AB)' }}
            >🛸 Go home!</motion.button>
          </motion.div>
        )}
        {scene === 'home' && <ShipHomeScene onDone={onDone} />}
      </div>
    </motion.div>
  );
}
