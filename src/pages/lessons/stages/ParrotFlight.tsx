import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useParrotSpeech } from '../../../hooks/useParrotSpeech';

// ============================================================
// 飞船驾驶舱（沉浸式第一人称）：
//   视角随旅程转换：深空初见地球 → 拉近地球 → 低空掠过火山 → 重力驾驶 → 降落选择
//  - 窗外是真正的 SVG 场景（不是 emoji），用缩放/位移模拟镜头推进
//  - 画面尽量少文字，幼儿看不懂字，靠画面和小鹦鹉的声音
//  - 幼儿=船长，小鹦鹉=副驾（在协调器里并肩）；重力传感器可控制飞船
//  - 本阶段只出现英文 "IN" 一词（我们都在飞船里）
// ============================================================
type Phase = 'cosmos' | 'approach' | 'flyover' | 'pilot' | 'landing';

const LANDING_SPOTS = [
  { id: 'valley', emoji: '🦖', label: 'Dino Valley' },
  { id: 'volcano', emoji: '🌋', label: 'Volcano Lake' },
  { id: 'forest', emoji: '🌳', label: 'Forest' },
];

const SKY_BG: Record<Phase, string> = {
  cosmos: 'linear-gradient(180deg,#05060f 0%,#0b1233 55%,#1a1a4a 100%)',
  approach: 'linear-gradient(180deg,#06122e 0%,#0a3d62 60%,#4aa3df 100%)',
  flyover: 'linear-gradient(180deg,#ff9a5a 0%,#f0544f 35%,#5c2a3d 70%,#2b0f2e 100%)',
  pilot: 'linear-gradient(180deg,#05060f 0%,#0b1233 55%,#1a1a4a 100%)',
  landing: 'linear-gradient(180deg,#87ceeb 0%,#b0e0c0 55%,#8fbf7f 100%)',
};

interface Props {
  onDone: () => void;
}

export function ParrotFlight({ onDone }: Props) {
  const { setParrot, sayLines, showParrotAction, resetSpeech } = useParrotSpeech();
  const [phase, setPhase] = useState<Phase>('cosmos');
  const [picked, setPicked] = useState<string | null>(null);
  const [gyroOn, setGyroOn] = useState(false);
  const [gyroPower, setGyroPower] = useState(0);
  const [gyroTilt, setGyroTilt] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tiltRef = useRef(0);

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

  // 视角推进：深空初见地球 → 拉近 → 掠过火山 → 交给船长重力驾驶
  // 关键：等小鹦鹉把台词说完（sayLines 完成回调）再切视角，绝不打断它说话。
  useEffect(() => {
    if (phase === 'cosmos') {
      setParrot('excited');
      sayLines(['We are riding IN the spaceship now!', 'Look out the window, that is our planet Earth!'], () => {
        later(() => setPhase('approach'), 1400);
      });
    } else if (phase === 'approach') {
      setParrot('surprised');
      sayLines(['Look, we are flying closer and closer!', 'Wow, there is a giant volcano down there!'], () => {
        later(() => setPhase('flyover'), 1400);
      });
    } else if (phase === 'flyover') {
      setParrot('excited');
      sayLines(['Wheee, hold on tight!', 'We are zooming right over the hot volcanoes!'], () => {
        later(() => setPhase('pilot'), 1400);
      });
    } else if (phase === 'pilot') {
      setParrot('excited');
      sayLines(['Look down, the Dino Planet is right below us!', 'You are the pilot now, Captain. Tilt your phone!']);
    }
  }, [phase, later, sayLines, setParrot]);

  // 重力传感器：倾斜手机 → 飞船跟着倾斜
  useEffect(() => {
    if (!gyroOn || phase !== 'pilot') return;
    const handler = (e: DeviceOrientationEvent) => {
      const g = e.gamma ?? 0;
      tiltRef.current = Math.max(-24, Math.min(24, g / 1.5));
      setGyroTilt(tiltRef.current);
    };
    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, [gyroOn, phase]);

  const startGyro = () => {
    if (gyroOn) return;
    const DOW = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
      .DeviceOrientationEvent;
    if (DOW && typeof DOW.requestPermission === 'function') {
      DOW.requestPermission().then(() => setGyroOn(true)).catch(() => setGyroOn(true));
    } else {
      setGyroOn(true);
    }
    setGyroPower(0);
    showParrotAction('excited', 2000);
    sayLines(['Ready, Captain? Hold your phone and tilt it left and right!']);
  };

  useEffect(() => {
    if (!gyroOn) return;
    let p = 0;
    const iv = window.setInterval(() => {
      p = Math.min(100, p + 2.2 + Math.abs(tiltRef.current) / 8);
      setGyroPower(p);
      if (p >= 100) {
        window.clearInterval(iv);
        sayLines(['Yay, you did it! That was super flying, Captain!', 'The Dino Planet is right below us now!'], () => {
          later(() => setPhase('landing'), 600);
        });
      }
    }, 80);
    return () => window.clearInterval(iv);
  }, [gyroOn, later, sayLines]);

  const autoLand = () => {
    if (phase !== 'pilot') return;
    sayLines(['Here we go, auto landing the spaceship now!', 'Hold on tight, Captain!'], () => {
      later(() => setPhase('landing'), 600);
    });
  };

  const handleLand = () => {
    if (!picked) return;
    showParrotAction('happy', 2000);
    sayLines([`What a great choice, Captain!`, `Let's go OUT of the ship and find the little baby!`], () => {
      later(onDone, 800);
    });
  };

  const pickSpot = (label: string) => setPicked(label);

  const speedPct =
    phase === 'cosmos' ? 30 : phase === 'approach' ? 55 : phase === 'flyover' ? 80 : phase === 'pilot' ? gyroPower : 25;

  return (
    <motion.div
      key="flight"
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#08080f 0%,#141a3a 60%,#2b1450 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 座舱内饰背景：舱壁 + 顶灯 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-10" style={{ background: 'linear-gradient(180deg,#3a3f55,#1d2130)' }} />
        <div className="absolute inset-x-0 bottom-0 h-28" style={{ background: 'linear-gradient(0deg,#23263a,#11142a)' }} />
        <div className="absolute left-0 top-10 bottom-28 w-6" style={{ background: 'linear-gradient(90deg,#2b2f45,#14162a)' }} />
        <div className="absolute right-0 top-10 bottom-28 w-6" style={{ background: 'linear-gradient(270deg,#2b2f45,#14162a)' }} />
      </div>

      <div className="relative z-10 min-h-full flex flex-col items-center px-4 pt-5 pb-44">
        {/* 舱顶（尽量少文字） */}
        <div className="text-center">
          <p className="text-2xl font-black text-white drop-shadow">🛸 Cockpit</p>
        </div>

        {/* ===== 前挡风（舷窗）：窗外是真正的场景 ===== */}
        <div
          className="mt-3 w-full max-w-sm relative rounded-[2rem] overflow-hidden border-4 border-white/25 shadow-2xl"
          style={{ height: 340, background: SKY_BG[phase], transition: 'background 1.2s' }}
        >
          {/* 挡风玻璃反光 + 暗角（沉浸感） */}
          <div className="absolute inset-0 z-20 pointer-events-none" style={{ boxShadow: 'inset 0 0 70px rgba(0,0,0,0.55)' }} />
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 28%, transparent 34%)' }}
          />

          {/* IN 小词卡（本阶段唯一英文词） */}
          <div className="absolute top-2 left-3 z-30">
            <span className="text-xs font-black text-cyan-200 bg-black/45 rounded-full px-2.5 py-0.5 border border-cyan-300/40">
              IN
            </span>
          </div>

          {/* 窗外世界（重力驾驶时整体倾斜） */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: gyroOn ? gyroTilt : 0, x: gyroOn ? gyroTilt * 1.5 : 0 }}
            transition={{ type: 'spring', stiffness: 70, damping: 14 }}
          >
            {phase === 'cosmos' && <CosmosScene />}
            {phase === 'approach' && <ApproachScene />}
            {phase === 'flyover' && <FlyoverScene />}
            {phase === 'pilot' && <PilotScene power={gyroOn ? gyroPower : 0} />}
            {phase === 'landing' && <LandingScene />}
          </motion.div>

          {/* 降落选择（船长拍板） */}
          {phase === 'landing' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-end gap-2 p-3 bg-black/25">
              {LANDING_SPOTS.map((spot, i) => (
                <motion.button
                  key={spot.id}
                  onClick={() => pickSpot(spot.label)}
                  whileTap={{ scale: 0.92 }}
                  className={`w-full py-3 rounded-2xl flex items-center justify-between px-4 text-white text-lg font-bold shadow-lg ${
                    picked === spot.label ? 'ring-4 ring-yellow-300' : ''
                  }`}
                  style={{ background: ['linear-gradient(135deg,#66BB6A,#43A047)', 'linear-gradient(135deg,#FF7043,#E64A19)', 'linear-gradient(135deg,#42A5F5,#1E88E5)'][i] }}
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
                  className="w-full py-3 rounded-2xl bg-white text-amber-700 text-lg font-black shadow-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  🛬 Land!
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* ===== 操作台（少文字） ===== */}
        <div className="mt-3 w-full max-w-sm rounded-2xl bg-black/50 border border-white/15 p-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-3 rounded-full bg-white/15 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#4FC3F7,#81C784)' }}
                  animate={{ width: `${speedPct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
            <div className="text-right text-sm font-bold text-white/80 tabular-nums">
              {gyroOn ? `${Math.round(gyroPower)}%` : `${speedPct}`}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {phase === 'pilot' ? (
              <>
                {!gyroOn ? (
                  <motion.button
                    onClick={startGyro}
                    whileTap={{ scale: 0.92 }}
                    className="flex-1 py-3 rounded-2xl text-white text-lg font-bold shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#AB47BC,#7B1FA2)' }}
                  >
                    🎮 Tilt phone!
                  </motion.button>
                ) : (
                  <div className="flex-1 py-3 rounded-2xl bg-white/10 text-center text-white font-bold text-base">
                    Tilt ✈️
                  </div>
                )}
                <motion.button
                  onClick={autoLand}
                  whileTap={{ scale: 0.92 }}
                  className="py-3 px-4 rounded-2xl text-white font-bold shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#78909C,#546E7A)' }}
                >
                  🛬 Land
                </motion.button>
              </>
            ) : (
              <div className="flex-1 py-3 rounded-2xl bg-white/10 text-center text-white/70 text-sm">
                {phase === 'cosmos' ? '🪐' : phase === 'approach' ? '🌍' : phase === 'flyover' ? '🌋' : '🛰️'}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// 窗外场景（SVG 实景，视角有转换）
// ============================================================

/** 深空初见地球：地球小小地在远方，镜头缓缓推进 */
function CosmosScene() {
  const stars = [...Array(26)].map((_, i) => ({ x: (i * 47) % 320, y: (i * 29) % 360, r: 1 + (i % 3), d: 1 + (i % 5) * 0.5 }));
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 360" preserveAspectRatio="xMidYMid slice">
      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x} cy={s.y} r={s.r}
          fill="white"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.d, repeat: Infinity, delay: (i % 7) * 0.3 }}
        />
      ))}
      <motion.g animate={{ scale: [0.34, 0.42], opacity: [1, 1] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '160px 180px' }}>
        <circle cx="160" cy="180" r="150" fill="#1E90FF" />
        <ellipse cx="118" cy="140" rx="40" ry="58" fill="#3CB371" transform="rotate(-18 118 140)" opacity="0.85" />
        <ellipse cx="205" cy="230" rx="48" ry="62" fill="#2E8B57" transform="rotate(12 205 230)" opacity="0.8" />
        <circle cx="160" cy="180" r="150" fill="url(#eglow)" opacity="0.5" />
        <defs>
          <radialGradient id="eglow" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1E90FF" stopOpacity="0" />
          </radialGradient>
        </defs>
      </motion.g>
    </svg>
  );
}

/** 地球拉近：蓝色星球充满视野，云层漂过，镜头继续推进 */
function ApproachScene() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 360" preserveAspectRatio="xMidYMid slice">
      <motion.g animate={{ scale: [1.05, 1.45] }} transition={{ duration: 3.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} style={{ transformOrigin: '160px 180px' }}>
        <circle cx="160" cy="180" r="260" fill="#1E90FF" />
        <ellipse cx="120" cy="120" rx="70" ry="90" fill="#3CB371" transform="rotate(-12 120 120)" />
        <ellipse cx="210" cy="260" rx="90" ry="80" fill="#2E8B57" transform="rotate(8 210 260)" />
        <ellipse cx="250" cy="90" rx="46" ry="30" fill="#8D6E63" transform="rotate(-6 250 90)" />
        <path d="M220 60 L238 30 L258 62 Z" fill="#E74C3C" opacity="0.9" />
        {[...Array(5)].map((_, i) => (
          <motion.ellipse
            key={i}
            cx={40 + i * 60} cy={40 + (i % 2) * 30}
            rx={40} ry={16}
            fill="white" opacity="0.5"
            animate={{ x: [0, -120], opacity: [0.5, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: i * 1.2 }}
          />
        ))}
      </motion.g>
    </svg>
  );
}

/** 低空掠过火山：火山群从船下快速掠过，烟柱上升 */
function FlyoverScene() {
  const vols = [
    { x: -40, w: 90, h: 130, c: '#8D4A3B', delay: 0 },
    { x: 60, w: 120, h: 175, c: '#6E3427', delay: 1 },
    { x: 150, w: 90, h: 150, c: '#7E3D2E', delay: 2 },
    { x: 260, w: 110, h: 180, c: '#5C2A1E', delay: 0.5 },
  ];
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 360" preserveAspectRatio="xMidYMid slice">
      {vols.map((v, i) => (
        <motion.g
          key={i}
          animate={{ x: [-340, 340] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'linear', delay: v.delay }}
        >
          <path
            d={`M${v.x} 360 L${v.x + v.w / 2} ${360 - v.h} L${v.x + v.w} 360 Z`}
            fill={v.c}
          />
          <ellipse cx={v.x + v.w / 2} cy={360 - v.h} rx={10} ry={4} fill="#FF7043" />
        </motion.g>
      ))}
      {[...Array(3)].map((_, i) => (
        <motion.g
          key={`s${i}`}
          animate={{ y: [0, -90], opacity: [0.7, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 1.1 }}
        >
          <circle cx={70 + i * 100} cy={300 - i * 20} r={5} fill="#FFB74D" opacity="0.6" />
          <circle cx={74 + i * 100} cy={292 - i * 20} r={3} fill="#FF8A65" opacity="0.5" />
        </motion.g>
      ))}
      {[...Array(8)].map((_, i) => (
        <motion.line
          key={`l${i}`}
          x1={-30} y1={20 + i * 42} x2={30} y2={20 + i * 42}
          stroke="white" strokeWidth={1.5} strokeLinecap="round" opacity="0.25"
          animate={{ x: [0, 350] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: (i % 4) * 0.2 }}
        />
      ))}
    </svg>
  );
}

/** 重力驾驶：深空 + 身下恐龙星球，速度线 */
function PilotScene({ power }: { power: number }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 360" preserveAspectRatio="xMidYMid slice">
      {[...Array(20)].map((_, i) => (
        <circle key={i} cx={(i * 53) % 320} cy={(i * 37) % 360} r={1 + (i % 2)} fill="white" opacity={0.3 + (i % 5) * 0.1} />
      ))}
      {[...Array(9)].map((_, i) => (
        <motion.line
          key={i}
          x1={-30} y1={i * 40} x2={-10} y2={i * 40}
          stroke="white" strokeWidth={2} strokeLinecap="round"
          animate={{ x: [0, 350] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear', delay: (i % 3) * 0.15 }}
        />
      ))}
      <motion.g
        animate={{ y: [40, -20, 40], scale: [0.8, 1.05, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '160px 260px' }}
      >
        <circle cx="160" cy="260" r="120" fill="#2E8B57" />
        <ellipse cx="140" cy="240" rx="34" ry="44" fill="#66BB6A" opacity="0.8" />
        <ellipse cx="185" cy="290" rx="40" ry="30" fill="#4CAF50" opacity="0.7" />
        <circle cx="210" cy="225" r="22" fill="#8D6E63" />
        <path d="M205 195 L214 172 L222 196 Z" fill="#FF7043" />
        <circle cx="160" cy="260" r="120" fill="url(#pg)" opacity="0.4" />
        <defs>
          <radialGradient id="pg" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2E8B57" stopOpacity="0" />
          </radialGradient>
        </defs>
      </motion.g>
      {power > 0 && (
        <g>
          <text x="160" y="60" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white" opacity="0.9">
            {Math.round(power)}%
          </text>
        </g>
      )}
    </svg>
  );
}

/** 降落视野：恐龙星球地面，河流/火山/森林/蛋窝 */
function LandingScene() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 360" preserveAspectRatio="xMidYMid slice">
      <motion.g animate={{ y: [-8, 8, -8] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx="160" cy="330" rx="190" ry="70" fill="#6fae5f" />
        <path d="M0 210 Q160 150 320 210 L320 360 L0 360 Z" fill="#7cbb6a" />
        <path d="M0 240 Q120 300 320 235" stroke="#5aa8d8" strokeWidth="26" fill="none" opacity="0.9" strokeLinecap="round" />
        <path d="M300 40 L318 4 L336 42 Z" fill="#B0563C" />
        <ellipse cx="318" cy="42" rx="10" ry="4" fill="#FF7043" />
        <circle cx="70" cy="210" r="34" fill="#3E7C2F" />
        <circle cx="60" cy="198" r="26" fill="#4E9A3B" />
        <rect x="64" y="232" width="12" height="40" rx="5" fill="#7A4E22" />
        <circle cx="230" cy="230" r="28" fill="#3E7C2F" />
        <circle cx="238" cy="222" r="20" fill="#4E9A3B" />
        <rect x="226" y="250" width="10" height="32" rx="4" fill="#7A4E22" />
        <g>
          <ellipse cx="160" cy="205" rx="26" ry="30" fill="#FFE0B2" stroke="#FFB74D" strokeWidth="3" />
          <ellipse cx="152" cy="196" rx="6" ry="8" fill="#FFF3E0" opacity="0.8" />
          <rect x="160" y="226" width="24" height="4" rx="2" fill="#7A4E22" opacity="0.6" />
          <circle cx="172" cy="228" r="5" fill="#7A4E22" />
          <circle cx="178" cy="228" r="3" fill="#8D6E63" />
        </g>
      </motion.g>
    </svg>
  );
}
