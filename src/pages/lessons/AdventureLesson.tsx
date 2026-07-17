import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

// Scene images (1:1 ratio)
import imgGarage from '@/assets/车库里的心跳声.png';
import imgFork from '@/assets/分叉路口的变形选择.png';
import imgBonding from '@/assets/兄弟的车库契约.png';
import imgWorld from '@/assets/世界观.png';

// ============================================================
// Types
// ============================================================
type TRocoState = 'stuck' | 'activated';
type SceneId = 'intro' | 'garage' | 'fork' | 'speed' | 'bonding' | 'done';
type GaragePhase = 'discover' | 'celebrate' | 'name';
type ForkPhase = 'observe' | 'choose';
type BondingPhase = 'recall' | 'respond' | 'covenant';

const WORD_EMOJIS: Record<string, string> = { Truck: '🚛', Car: '🏎️', Fast: '⚡', Slow: '🐢' };

// ============================================================
// Audio
// ============================================================
let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!audioCtx && typeof window !== 'undefined') audioCtx = new AudioContext();
  return audioCtx;
}
function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.12) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore audio errors */ }
}
const playMetalHit = () => { playTone(800, 0.1, 'square', 0.15); setTimeout(() => playTone(600, 0.12, 'sawtooth', 0.12), 80); };
const playVroom = () => { playTone(150, 0.2, 'sawtooth', 0.1); setTimeout(() => playTone(250, 0.3, 'sawtooth', 0.1), 150); setTimeout(() => playTone(400, 0.5, 'sawtooth', 0.08), 350); };
const playSuccess = () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.1), i * 80)); };
const playBubble = () => { playTone(1200, 0.06, 'sine', 0.05); };
const playUnlock = () => { playTone(440, 0.12, 'triangle', 0.1); setTimeout(() => playTone(880, 0.25, 'triangle', 0.08), 120); setTimeout(() => playTone(1320, 0.3, 'sine', 0.06), 250); };
const playClick = () => { playTone(600, 0.05, 'sine', 0.08); };
const playCountdown = () => { playTone(440, 0.15, 'sine', 0.12); };
const playSceneChange = () => { [392, 523, 659].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'triangle', 0.08), i * 100)); };
const vibrate = (ms: number | number[]) => { if (navigator.vibrate) navigator.vibrate(ms); };

// TTS utility
function speakText(text: string, opts?: { rate?: number; pitch?: number }) {
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = opts?.rate ?? 0.85;
    utterance.pitch = opts?.pitch ?? 1.1;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch { /* speech not available */ }
}

function stopSpeech() {
  window.speechSynthesis.cancel();
}

// ============================================================
// ASR
// ============================================================
interface SpeechRecognitionEvent { results: { length: number; [idx: number]: { transcript: string } }[] }
function startASR(onResult: (text: string) => void, onEnd?: () => void): () => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) { onEnd?.(); return () => {}; }
  const r = new Ctor();
  r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 3; r.continuous = false;
  r.onresult = (e: SpeechRecognitionEvent) => { for (let i = 0; i < e.results[0].length; i++) onResult(e.results[0][i].transcript.trim().toLowerCase()); };
  r.onend = () => onEnd?.(); r.onerror = () => onEnd?.();
  try { r.start(); } catch { onEnd?.(); }
  return () => { try { r.stop(); } catch { /* ignore */ } };
}

// ============================================================
// Tap detector
// ============================================================
function useTapDetector(onTap: () => void) {
  useEffect(() => {
    const handler = () => { onTap(); };
    window.addEventListener('click', handler);
    window.addEventListener('touchend', handler);
    return () => { window.removeEventListener('click', handler); window.removeEventListener('touchend', handler); };
  }, [onTap]);
}

// ============================================================
// UI Components
// ============================================================
// 1:1 场景图片 - 全屏展示
function SceneImage({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div className="w-full pt-24 pb-2 px-2"
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
      <div className="w-full rounded-2xl overflow-hidden" style={{ height: '52vh' }}>
        <img src={src} alt={alt} className="w-full h-full" style={{ objectFit: 'cover' }} />
      </div>
    </motion.div>
  );
}

function Bubble({ text, align = 'left' }: { text: string; align?: 'left' | 'right' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="rounded-2xl px-4 py-2.5 max-w-[85%]" style={{
        background: align === 'right' ? 'rgba(66,165,245,0.85)' : 'rgba(255,167,38,0.85)',
        borderRadius: align === 'right' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      }}>
        <p className="text-base font-bold text-white">{text}</p>
      </div>
    </motion.div>
  );
}

function BigButton({ emoji, label, onClick, color = '#FF7043' }: { emoji: string; label: string; onClick: () => void; color?: string }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3 overflow-hidden"
      style={{ background: color, minWidth: 200 }}>
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <span className="whitespace-nowrap">{label}</span>
    </motion.button>
  );
}

// ============================================================
// Countdown Timer Component
// ============================================================
function CountdownTimer({ duration, onDone }: { duration: number; onDone: () => void }) {
  const [count, setCount] = useState(duration);
  const firedRef = useRef(false);

  useEffect(() => {
    if (count <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onDone();
      }
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div className="flex items-center justify-center gap-2">
      <motion.span className="text-3xl font-extrabold text-white"
        key={count} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10 }}>
        {count}
      </motion.span>
    </div>
  );
}

// ============================================================
// Scene 1: Garage Wake-up
// ============================================================
function GarageScene({ onComplete, onNameRecorded }: { onComplete: () => void; onNameRecorded: (n: string) => void }) {
  const [phase, setPhase] = useState<GaragePhase>('discover');
  const [tapCount, setTapCount] = useState(0);
  const [trocoState, setTrocoState] = useState<TRocoState>('stuck');
  const [nameInput, setNameInput] = useState('');
  const submittedRef = useRef(false);

  // TTS on scene start
  useEffect(() => {
    speakText('Oh no! My gears are stuck! Tap three times to fix me!');
  }, []);

  const handleTap = useCallback(() => {
    if (phase !== 'discover') return;
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 3) {
      playMetalHit(); vibrate(100);
      setTimeout(() => { playMetalHit(); vibrate(100); }, 200);
      setTimeout(() => {
        playMetalHit(); vibrate(200);
        setTimeout(() => {
          setTrocoState('activated');
          playVroom(); vibrate(300);
          speakText('Vroom vroom! You fixed me! I am so happy!');
          setPhase('celebrate');
        }, 500);
      }, 400);
    }
  }, [phase, tapCount]);

  useTapDetector(handleTap);

  const handleNameSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const name = nameInput.trim() || 'Co-pilot';
    onNameRecorded(name);
    playSuccess();
    try { speakText(`Nice to meet you, ${name}! Let us go on an adventure!`); } catch { /* ignore */ }
    setTimeout(onComplete, 1500);
  }, [nameInput, onNameRecorded, onComplete]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'linear-gradient(180deg, #1a1a2e, #16213e)' }}>
      <SceneImage src={imgGarage} alt="车库" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          {phase === 'discover' && (
            <motion.div key="d" className="w-full max-w-sm text-center space-y-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Bubble text="Huff... My gears are stuck!" />
              <Bubble text="Tap 3 times to fix me!" />
              <motion.div className="flex justify-center gap-3 mt-2" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <span className="text-4xl">👆</span>
              </motion.div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3].map((i) => (
                  <motion.div key={i} className="w-4 h-4 rounded-full"
                    style={{ background: i <= tapCount ? '#FFB74D' : 'rgba(255,255,255,0.3)' }}
                    animate={i <= tapCount ? { scale: [1, 1.5, 1] } : {}} />
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'celebrate' && (
            <motion.div key="c" className="w-full max-w-sm text-center space-y-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Bubble text="Vroom vroom! You fixed me!" />
              <div className="flex justify-center gap-3">
                {['🫧', '✨', '🎉', '💫'].map((e, i) => (
                  <motion.span key={i} className="text-3xl" animate={{ y: [0, -15, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}>{e}</motion.span>
                ))}
              </div>
              <CountdownTimer duration={3} onDone={() => { playClick(); setPhase('name'); }} />
            </motion.div>
          )}

          {phase === 'name' && (
            <motion.div key="n" className="w-full max-w-sm text-center space-y-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Bubble text="What's your name?" />
              <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                placeholder="输入名字..." autoFocus onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="w-full px-4 py-4 rounded-2xl text-white text-center text-xl font-bold outline-none" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🎤</span>
                <span className="text-sm text-white/60">输入名字或等待自动继续</span>
              </div>
              <CountdownTimer duration={6} onDone={handleNameSubmit} />
            </motion.div>
          )}
      </div>
    </div>
  );
}

// ============================================================
// Scene 2: Fork Road
// ============================================================
function ForkScene({ onComplete, onChoiceMade }: { onComplete: () => void; onChoiceMade: (p: 'truck' | 'car') => void }) {
  const [phase, setPhase] = useState<ForkPhase>('observe');
  const [selected, setSelected] = useState<'truck' | 'car' | null>(null);

  // TTS on scene start
  useEffect(() => {
    speakText('Look! Two roads! Which one should we take?');
  }, []);

  useEffect(() => {
    if (phase === 'choose') {
      speakText('Muddy road? Say Truck! Winding road? Say Car!');
    }
  }, [phase]);

  // Auto transition to choose phase
  useEffect(() => {
    const t = setTimeout(() => setPhase('choose'), 3000);
    return () => clearTimeout(t);
  }, []);

  const choose = useCallback((path: 'truck' | 'car') => {
    setSelected(path);
    playSuccess(); vibrate(200);
    speakText(path === 'truck' ? 'Big truck mode! Let us crush the mud!' : 'Speed car mode! Let us zoom!');
    setTimeout(() => { onChoiceMade(path); onComplete(); }, 2000);
  }, [onChoiceMade, onComplete]);

  // Auto-choose if no selection after 8 seconds
  useEffect(() => {
    if (phase !== 'choose' || selected) return;
    const t = setTimeout(() => {
      if (!selected) choose('truck');
    }, 8000);
    return () => clearTimeout(t);
  }, [phase, selected, choose]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'linear-gradient(180deg, rgba(74,20,140,0.7), rgba(123,31,162,0.7))' }}>
      <SceneImage src={imgFork} alt="分叉路口" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          {phase === 'observe' && (
            <motion.div key="o" className="text-center"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Bubble text="Two roads! Which one?" />
            </motion.div>
          )}

          {phase === 'choose' && !selected && (
            <motion.div key="ch" className="w-full max-w-sm space-y-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-4">
                <motion.p className="text-lg font-bold text-white mb-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  选择你要变身的座驾！
                </motion.p>
                <motion.p className="text-sm text-white/70"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  变身大卡车碾压泥潭，还是变身赛车飞驰弯道？
                </motion.p>
              </div>
              <div className="flex gap-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { playClick(); choose('truck'); }}
                  className="flex-1 py-8 rounded-3xl flex flex-col items-center gap-3" style={{ background: 'rgba(255,255,255,0.2)' }}
                  initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <span className="text-5xl">🚛</span>
                  <span className="text-xl font-bold text-white">变身 Truck</span>
                  <span className="text-xs text-white/60">碾压泥潭</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { playClick(); choose('car'); }}
                  className="flex-1 py-8 rounded-3xl flex flex-col items-center gap-3" style={{ background: 'rgba(255,255,255,0.2)' }}
                  initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <span className="text-5xl">🏎️</span>
                  <span className="text-xl font-bold text-white">变身 Car</span>
                  <span className="text-xs text-white/60">飞驰弯道</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {selected && (
            <motion.div key="r" className="text-center"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.span className="text-7xl block" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                {selected === 'truck' ? '🚛' : '🏎️'}
              </motion.span>
              <motion.p className="text-lg font-bold text-white mt-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {selected === 'truck' ? '变身大卡车！碾压泥潭出发！' : '变身赛车！飞驰弯道出发！'}
              </motion.p>
            </motion.div>
          )}
      </div>
    </div>
  );
}

// ============================================================
// Scene 3: Racing Game (Canvas-based, invincible mode)
// ============================================================
function SpeedScene({ chosenPath, onComplete }: { chosenPath: 'truck' | 'car'; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'transform' | 'countdown' | 'play' | 'finish'>('transform');
  const [countdownNum, setCountdownNum] = useState(5);
  const gameRef = useRef({
    lane: 1,
    targetLane: 1,
    playerX: 0,
    playerY: 0,
    obstacles: [] as { x: number; y: number; w: number; h: number; type: number }[],
    speed: 3,
    score: 0,
    frame: 0,
    roadOffset: 0,
    hitTimer: 0,
    invincible: 0,
    distance: 0,
    totalDistance: 12000,
  });

  const isTruck = chosenPath === 'truck';

  const theme = useMemo(() => isTruck
    ? { bg: '#2d1b0e', road: '#5d4037', roadLine: '#8d6e63', grass: '#33691e', grassAlt: '#558b2f', obstacle: '#795548', obstacleAccent: '#3e2723', sky: '#1b3a1a' }
    : { bg: '#0a0e27', road: '#1a1a3e', roadLine: '#00e5ff', grass: '#0d1b2a', grassAlt: '#1b2838', obstacle: '#ff1744', obstacleAccent: '#d50000', sky: '#050a1a' },
    [isTruck]
  );

  // Transform phase
  useEffect(() => {
    if (phase !== 'transform') return;
    speakText('Transform!');
    playVroom();
    vibrate(300);
    const t = setTimeout(() => setPhase('countdown'), 2000);
    return () => { clearTimeout(t); window.speechSynthesis.cancel(); };
  }, [phase]);

  // Countdown phase - speak number first, then show visual in sync
  useEffect(() => {
    if (phase !== 'countdown') return;
    let active = true;

    const nums = [5, 4, 3, 2, 1];
    let idx = 0;

    const showAndSpeak = () => {
      if (!active) return;
      if (idx >= nums.length) {
        setCountdownNum(0);
        playSuccess();
        vibrate(200);
        setTimeout(() => { if (active) setPhase('play'); }, 600);
        return;
      }
      const n = nums[idx];
      setCountdownNum(n);
      playCountdown();

      const utterance = new SpeechSynthesisUtterance(String(n));
      utterance.lang = 'en-US';
      utterance.rate = 1.1;
      utterance.pitch = 1.3;
      utterance.volume = 1;
      utterance.onend = () => {
        idx++;
        if (active) setTimeout(showAndSpeak, 200);
      };
      utterance.onerror = () => {
        idx++;
        if (active) setTimeout(showAndSpeak, 200);
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    showAndSpeak();
    return () => { active = false; window.speechSynthesis.cancel(); };
  }, [phase]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== 'play') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const LANE_COUNT = 3;
    const LANE_W = () => W() / LANE_COUNT;
    const PLAYER_SIZE = () => Math.min(W() / 5, 70);
    const OBSTACLE_SIZE = () => Math.min(W() / 6, 60);

    const g = gameRef.current;
    g.playerX = W() / 2;
    g.playerY = H() - PLAYER_SIZE() * 2;
    g.lane = 1;
    g.targetLane = 1;
    g.obstacles = [];
    g.speed = 3;
    g.score = 0;
    g.frame = 0;
    g.hitTimer = 0;
    g.invincible = 0;
    g.distance = 0;

    let animId: number;

    const spawnObstacle = () => {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const x = LANE_W() * lane + LANE_W() / 2;
      g.obstacles.push({ x, y: -OBSTACLE_SIZE(), w: OBSTACLE_SIZE(), h: OBSTACLE_SIZE(), type: Math.floor(Math.random() * 3) });
    };

    const drawPlayer = () => {
      const px = g.playerX;
      const py = g.playerY;
      const s = PLAYER_SIZE();

      ctx.save();
      // Invincible flash
      if (g.invincible > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(g.frame * 0.5) * 0.5;
        // Shield effect
        ctx.strokeStyle = '#FFD600';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFD600';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(px, py, s * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (isTruck) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath(); ctx.roundRect(px - s * 0.4, py - s * 0.3, s * 0.8, s * 0.7, 8); ctx.fill();
        ctx.fillStyle = '#388E3C';
        ctx.beginPath(); ctx.roundRect(px - s * 0.3, py - s * 0.5, s * 0.6, s * 0.3, [8, 8, 0, 0]); ctx.fill();
        ctx.fillStyle = '#81D4FA';
        ctx.beginPath(); ctx.roundRect(px - s * 0.2, py - s * 0.45, s * 0.4, s * 0.15, 4); ctx.fill();
        ctx.fillStyle = '#FFD600';
        ctx.beginPath(); ctx.roundRect(px - s * 0.25, py - s * 0.58, s * 0.5, s * 0.12, [6, 6, 0, 0]); ctx.fill();
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.arc(px - s * 0.35, py + s * 0.25, s * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + s * 0.35, py + s * 0.25, s * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px - s * 0.35, py - s * 0.1, s * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + s * 0.35, py - s * 0.1, s * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath(); ctx.arc(px - s * 0.12, py - s * 0.38, s * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + s * 0.12, py - s * 0.38, s * 0.05, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = '#F44336';
        ctx.beginPath(); ctx.roundRect(px - s * 0.4, py - s * 0.15, s * 0.8, s * 0.5, [4, 4, 12, 12]); ctx.fill();
        ctx.fillStyle = '#D32F2F';
        ctx.beginPath(); ctx.roundRect(px - s * 0.25, py - s * 0.35, s * 0.5, s * 0.25, [8, 8, 0, 0]); ctx.fill();
        ctx.fillStyle = '#4FC3F7';
        ctx.beginPath(); ctx.roundRect(px - s * 0.18, py - s * 0.32, s * 0.36, s * 0.12, 3); ctx.fill();
        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 15;
        ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(px - s * 0.42, py - s * 0.17, s * 0.84, s * 0.54, [4, 4, 12, 12]); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.arc(px - s * 0.35, py + s * 0.22, s * 0.09, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + s * 0.35, py + s * 0.22, s * 0.09, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFEB3B'; ctx.shadowColor = '#FFEB3B'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.ellipse(px - s * 0.25, py - s * 0.12, s * 0.06, s * 0.03, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(px + s * 0.25, py - s * 0.12, s * 0.06, s * 0.03, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    };

    const drawObstacle = (o: { x: number; y: number; w: number; h: number; type: number }) => {
      ctx.save();
      if (isTruck) {
        const emojis = ['🪨', '💧', '🪵'];
        ctx.font = `${o.w * 0.8}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(emojis[o.type], o.x, o.y);
      } else {
        if (o.type === 0) {
          ctx.fillStyle = '#9C27B0';
          ctx.beginPath(); ctx.roundRect(o.x - o.w * 0.4, o.y - o.h * 0.3, o.w * 0.8, o.h * 0.6, [12, 12, 4, 4]); ctx.fill();
          ctx.fillStyle = '#CE93D8';
          ctx.beginPath(); ctx.roundRect(o.x - o.w * 0.2, o.y - o.h * 0.2, o.w * 0.4, o.h * 0.15, 3); ctx.fill();
          ctx.strokeStyle = '#e040fb'; ctx.lineWidth = 2; ctx.shadowColor = '#e040fb'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.roundRect(o.x - o.w * 0.4, o.y - o.h * 0.3, o.w * 0.8, o.h * 0.6, [12, 12, 4, 4]); ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (o.type === 1) {
          ctx.fillStyle = '#FF6D00'; ctx.shadowColor = '#FF6D00'; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.roundRect(o.x - o.w * 0.45, o.y - o.h * 0.15, o.w * 0.9, o.h * 0.3, 4); ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#455A64';
          ctx.beginPath(); ctx.arc(o.x, o.y, o.w * 0.35, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f44336';
          ctx.beginPath(); ctx.arc(o.x, o.y, o.w * 0.12, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(o.x - o.w * 0.35, o.y); ctx.lineTo(o.x - o.w * 0.5, o.y - o.h * 0.3); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(o.x + o.w * 0.35, o.y); ctx.lineTo(o.x + o.w * 0.5, o.y - o.h * 0.3); ctx.stroke();
        }
      }
      ctx.restore();
    };

    const drawRoad = () => {
      const w = W(); const h = H();
      ctx.fillStyle = theme.sky; ctx.fillRect(0, 0, w, h);
      const grassW = w * 0.08;
      ctx.fillStyle = theme.grass; ctx.fillRect(0, 0, grassW, h); ctx.fillRect(w - grassW, 0, grassW, h);
      ctx.fillStyle = theme.grassAlt;
      for (let y = (g.roadOffset % 40) - 40; y < h; y += 40) {
        ctx.fillRect(0, y, grassW * 0.6, 3); ctx.fillRect(w - grassW, y, grassW * 0.6, 3);
      }
      const roadLeft = grassW; const roadW = w - grassW * 2;
      ctx.fillStyle = theme.road; ctx.fillRect(roadLeft, 0, roadW, h);
      ctx.setLineDash([20, 20]); ctx.strokeStyle = theme.roadLine; ctx.lineWidth = 2; ctx.globalAlpha = 0.5;
      for (let i = 1; i < LANE_COUNT; i++) {
        const lx = roadLeft + (roadW / LANE_COUNT) * i;
        ctx.beginPath(); ctx.moveTo(lx, -20 + (g.roadOffset % 40)); ctx.lineTo(lx, h + 20); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.setLineDash([]);
      ctx.strokeStyle = isTruck ? '#8d6e63' : '#00e5ff'; ctx.lineWidth = 3;
      ctx.shadowColor = isTruck ? 'transparent' : '#00e5ff'; ctx.shadowBlur = isTruck ? 0 : 6;
      ctx.beginPath(); ctx.moveTo(roadLeft, 0); ctx.lineTo(roadLeft, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(roadLeft + roadW, 0); ctx.lineTo(roadLeft + roadW, h); ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const checkCollision = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => {
      return Math.abs(a.x - b.x) < (a.w + b.w) * 0.4 && Math.abs(a.y - b.y) < (a.h + b.h) * 0.4;
    };

    const gameLoop = () => {
      const w = W(); const h = H(); const ps = PLAYER_SIZE();
      g.frame++;
      g.speed = 3 + g.score * 0.04;
      if (g.frame % Math.max(25, 70 - g.score) === 0) spawnObstacle();

      // Move player
      const targetX = LANE_W() * g.targetLane + LANE_W() / 2;
      g.playerX += (targetX - g.playerX) * 0.15;
      g.lane = g.targetLane;

      // Move obstacles
      g.obstacles.forEach((o) => { o.y += g.speed; });
      g.obstacles = g.obstacles.filter((o) => o.y < h + 100);
      g.roadOffset += g.speed;

      // Distance progress
      g.distance += g.speed;

      // Collision check — invincible mode, never die
      const playerBox = { x: g.playerX, y: g.playerY, w: ps, h: ps };
      if (g.invincible <= 0) {
        for (const o of g.obstacles) {
          if (checkCollision(playerBox, o)) {
            g.invincible = 90; // ~1.5s invincible
            g.hitTimer = 20;
            g.speed = Math.max(1.5, g.speed - 1.5);
            playTone(200, 0.2, 'sawtooth', 0.12);
            vibrate(150);
            // Remove the obstacle we hit
            g.obstacles = g.obstacles.filter((x) => x !== o);
            break;
          }
        }
      }
      if (g.invincible > 0) g.invincible--;
      if (g.hitTimer > 0) g.hitTimer--;

      // Score
      if (g.frame % 10 === 0) { g.score++; setScore(g.score); }

      // Finish check
      if (g.distance >= g.totalDistance) {
        setPhase('finish');
        playSuccess();
        vibrate(200);
        return;
      }

      // Draw
      ctx.clearRect(0, 0, w, h);
      drawRoad();
      g.obstacles.forEach(drawObstacle);
      drawPlayer();

      // Speed lines
      if (!isTruck && g.speed > 4) {
        ctx.strokeStyle = 'rgba(0,229,255,0.15)'; ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const sx = Math.random() * w; const sy = Math.random() * h;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (Math.random() - 0.5) * 3, sy + 30 + Math.random() * 40); ctx.stroke();
        }
      }

      // Progress bar at bottom
      const progress = Math.min(1, g.distance / g.totalDistance);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, h - 6, w, 6);
      ctx.fillStyle = isTruck ? '#8d6e63' : '#00e5ff';
      ctx.fillRect(0, h - 6, w * progress, 6);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [phase, isTruck, theme]);

  // Touch / swipe
  useEffect(() => {
    if (phase !== 'play') return;
    const g = gameRef.current;
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 30) {
        if (dx < 0 && g.targetLane > 0) { g.targetLane--; playClick(); }
        if (dx > 0 && g.targetLane < 2) { g.targetLane++; playClick(); }
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && g.targetLane > 0) { g.targetLane--; playClick(); }
      if (e.key === 'ArrowRight' && g.targetLane < 2) { g.targetLane++; playClick(); }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('touchstart', handleTouchStart); window.removeEventListener('touchend', handleTouchEnd); window.removeEventListener('keydown', handleKey); };
  }, [phase]);

  // Transform animation
  if (phase === 'transform') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: isTruck ? 'linear-gradient(180deg, #1b5e20, #388e3c)' : 'linear-gradient(180deg, #0d47a1, #1976d2)' }}>
        <motion.div className="text-center" initial={{ scale: 0.5, rotate: -180, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', damping: 8, duration: 1.5 }}>
          <span className="text-[120px] block">{isTruck ? '🚛' : '🏎️'}</span>
        </motion.div>
        <motion.p className="text-2xl font-extrabold text-white mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {isTruck ? '重型卡车 · 变形！' : '流线跑车 · 变形！'}
        </motion.p>
      </div>
    );
  }

  // Countdown
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: isTruck ? 'linear-gradient(180deg, #1b5e20, #388e3c)' : 'linear-gradient(180deg, #0d47a1, #1976d2)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={countdownNum} className="text-center"
            initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 10, duration: 0.4 }}>
            <span className="text-[180px] font-extrabold text-white" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
              {countdownNum > 0 ? countdownNum : 'GO!'}
            </span>
          </motion.div>
        </AnimatePresence>
        <motion.span className="text-xl font-bold text-white/60 mt-4" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
          {isTruck ? '🚛 泥泞大冒险' : '🏎️ 极速霓虹'}
        </motion.span>
      </div>
    );
  }

  // Finish
  if (phase === 'finish') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: isTruck ? 'linear-gradient(180deg, #1b5e20, #388e3c)' : 'linear-gradient(180deg, #0d47a1, #1976d2)' }}>
        <motion.div className="text-center space-y-4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <motion.span className="text-8xl block" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5, repeat: 3 }}>🏁</motion.span>
          <h2 className="text-3xl font-extrabold text-white">到达终点！</h2>
          <p className="text-xl text-white/60">⭐ {score}</p>
          <div className="flex justify-center gap-3 text-3xl">
            {['🚛', '🏎️', '⚡', '🐢'].map((e, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}>{e}</motion.span>
            ))}
          </div>
          <BigButton emoji="👉" label="继续" onClick={() => { playClick(); onComplete(); }} />
        </motion.div>
      </div>
    );
  }

  // Play
  return (
    <div className="min-h-screen relative" style={{ background: '#000' }}>
      <canvas ref={canvasRef} className="absolute inset-0 touch-none" />
      <div className="absolute top-12 left-0 right-0 z-20 flex justify-between px-6 pointer-events-none">
        <span className="px-4 py-2 rounded-full text-lg font-bold text-white" style={{ background: 'rgba(0,0,0,0.4)' }}>⭐ {score}</span>
        <span className="px-4 py-2 rounded-full text-sm font-bold text-white/60" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {isTruck ? '🚛' : '🏎️'}
        </span>
      </div>
      {/* Invincible indicator */}
      {gameRef.current.invincible > 0 && (
        <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none">
          <motion.span className="text-sm font-bold text-yellow-400 px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }}
            animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.3, repeat: Infinity }}>
            🛡️ 无敌中
          </motion.span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Scene 4: Emotional Bonding
// ============================================================
function BondingScene({ childName, onComplete }: { childName: string; onComplete: () => void }) {
  const [phase, setPhase] = useState<BondingPhase>('recall');
  const [touchCount, setTouchCount] = useState(0);
  const [covenantDone, setCovenantDone] = useState(false);

  // TTS on phase changes
  useEffect(() => {
    speakText(`We did it, ${childName}! You are the coolest driver! I love fighting with you!`);
  }, [childName]);

  useEffect(() => {
    if (phase === 'respond') {
      speakText(`${childName}, say I love you too, T-Roco!`);
    }
  }, [phase, childName]);

  useEffect(() => {
    if (phase === 'covenant') {
      speakText('I give you my secret key! Tap my wheel! Team forever!');
    }
  }, [phase]);

  useEffect(() => {
    if (covenantDone) {
      speakText(`${childName}, key locked! See you tomorrow, buddy!`);
    }
  }, [covenantDone, childName]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('respond'), 6000);
    const t2 = setTimeout(() => setPhase('covenant'), 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleTouch = useCallback(() => {
    setTouchCount((p) => {
      const next = p + 1;
      if (next >= 3) { playUnlock(); vibrate([100, 50, 200]); setCovenantDone(true); setTimeout(onComplete, 2500); }
      return next;
    });
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'linear-gradient(180deg, #bf360c, #f57c00)' }}>
      <SceneImage src={imgBonding} alt="契约" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          {phase === 'recall' && (
            <motion.div key="r" className="space-y-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Bubble text={`We did it, ${childName}!`} />
              <Bubble text="You're the coolest driver!" />
            </motion.div>
          )}

          {phase === 'respond' && (
            <motion.div key="rp" className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Bubble text={`Say "I love you too!"`} align="right" />
              <div className="flex justify-center"><span className="text-3xl">🎤</span></div>
              <BigButton emoji="❤️" label="我也喜欢你！" onClick={() => { playClick(); playSuccess(); setPhase('covenant'); }} />
            </motion.div>
          )}

          {phase === 'covenant' && !covenantDone && (
            <motion.div key="cv" className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Bubble text="Tap my wheel! Team forever!" />
              <motion.div className="flex flex-col items-center gap-3">
                <motion.div className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: touchCount >= 3 ? '#FFD600' : 'rgba(255,255,255,0.2)', border: '3px dashed rgba(255,255,255,0.5)' }}
                  whileTap={{ scale: 0.9 }} onClick={() => { playClick(); handleTouch(); }}
                  animate={touchCount < 3 ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>
                  <span className="text-5xl">{touchCount >= 3 ? '🔑' : '✊'}</span>
                </motion.div>
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => <div key={i} className="w-3 h-3 rounded-full" style={{ background: i <= touchCount ? '#FFD600' : 'rgba(255,255,255,0.3)' }} />)}
                </div>
              </motion.div>
            </motion.div>
          )}

          {covenantDone && (
            <motion.div key="cd" className="text-center space-y-4"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.span className="text-6xl block" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>🤝</motion.span>
              <Bubble text={`${childName}, team forever!`} />
              <div className="flex justify-center gap-4">
                {['🚛', '🏎️', '⚡', '🐢'].map((e, i) => (
                  <motion.span key={i} className="text-3xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: 'spring' }}>{e}</motion.span>
                ))}
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
}

// ============================================================
// Celebration
// ============================================================
function CelebrationEnd({ childName, onHome }: { childName: string; onHome: () => void }) {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#A855F7', '#FF8C42'];

  useEffect(() => {
    speakText(`Great job, ${childName}! You are the best co-pilot! See you next time!`);
  }, [childName]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #1a237e, #3949ab)' }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-sm" style={{ width: 6 + Math.random() * 6, height: 6 + Math.random() * 6, background: colors[i % colors.length], left: `${Math.random() * 100}%`, top: -20 }}
          animate={{ y: [0, window.innerHeight + 50], x: [0, (Math.random() - 0.5) * 150], rotate: [0, Math.random() * 720], opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 3 }} />
      ))}
      <motion.span className="text-8xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>🦕</motion.span>
      <motion.h1 className="text-3xl font-extrabold text-white mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        🎉 Great Job!
      </motion.h1>
      <motion.p className="text-lg text-white/60 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        {childName}, you're the best!
      </motion.p>
      <motion.div className="flex gap-4 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        {['🚛', '🏎️', '⚡', '🐢'].map((e, i) => (
          <motion.span key={i} className="text-4xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 + i * 0.1, type: 'spring' }}>{e}</motion.span>
        ))}
      </motion.div>
      <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
        <BigButton emoji="🏠" label="回首页" onClick={() => { playClick(); onHome(); }} />
      </motion.div>
      <motion.p className="text-sm text-white/40 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }}>
        下一集：机甲零件大运送
      </motion.p>
    </div>
  );
}

// ============================================================
// World Intro
// ============================================================
function WorldIntroScene({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'start' | 'world' | 'character' | 'ready'>('start');
  const startedRef = useRef(false);
  const [dinoState, setDinoState] = useState<'idle' | 'wave' | 'happy' | 'blink'>('idle');
  const [dinoMsg, setDinoMsg] = useState('');
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const startIntro = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    window.speechSynthesis.cancel();
    const testUtterance = new SpeechSynthesisUtterance('');
    testUtterance.volume = 0;
    window.speechSynthesis.speak(testUtterance);
    setPhase('world');
  }, []);

  // TTS for world phase
  useEffect(() => {
    if (phase !== 'world') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('Welcome to Click Clack Valley! A magical valley where all machines run on colorful gear power!');
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;
    utterance.onend = () => setPhase('character');
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [phase]);

  useEffect(() => {
    if (phase === 'character') {
      window.speechSynthesis.cancel();
      setDinoState('wave');
      setDinoMsg("Hi! I'm T-Roco!");
      const utterance = new SpeechSynthesisUtterance('This is T-Roco! A green dinosaur truck with a yellow hard hat. The coolest rescue truck in the valley!');
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      utterance.onend = () => { setPhase('ready'); setDinoState('happy'); };
      window.speechSynthesis.speak(utterance);
      return () => window.speechSynthesis.cancel();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'ready') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Are you ready for an adventure? Let us go!');
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      utterance.onend = () => { setTimeout(onComplete, 2000); };
      window.speechSynthesis.speak(utterance);
      return () => window.speechSynthesis.cancel();
    }
  }, [phase, onComplete]);

  // Idle blink timer for character phase
  useEffect(() => {
    if (phase !== 'character') return;
    const tick = () => {
      setDinoState('blink');
      setTimeout(() => setDinoState('idle'), 200);
      blinkTimerRef.current = setTimeout(tick, 3000 + Math.random() * 2000);
    };
    blinkTimerRef.current = setTimeout(tick, 2000);
    return () => clearTimeout(blinkTimerRef.current);
  }, [phase]);

  const handleDinoTouch = () => {
    if (phase !== 'character') return;
    setDinoState('happy');
    setDinoMsg('Hehe, that tickles!');
    setTimeout(() => { setDinoState('idle'); setDinoMsg("Hi! I'm T-Roco!"); }, 1500);
  };

  const dinoAnimation = dinoState === 'wave'
    ? { rotate: [-5, 5, -5], y: [0, -8, 0] }
    : dinoState === 'happy'
    ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }
    : dinoState === 'blink'
    ? { scaleY: [1, 0.1, 1] }
    : { y: [0, -4, 0] };

  const dinoTransition = dinoState === 'wave'
    ? { rotate: { duration: 0.6, repeat: 3, ease: 'easeInOut' }, y: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } }
    : dinoState === 'happy'
    ? { scale: { duration: 0.4, repeat: 2 }, rotate: { duration: 0.3, repeat: 3 } }
    : dinoState === 'blink'
    ? { duration: 0.2 }
    : { y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'linear-gradient(180deg, #0d1b2a, #1b2838)', WebkitTapHighlightColor: 'transparent' }}
      onClick={startIntro}
      onTouchEnd={(e) => { e.preventDefault(); startIntro(); }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
          {phase === 'start' && (
            <motion.div key="start" className="text-center space-y-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SceneImage src={imgWorld} alt="咔哒山谷" />
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <span className="text-5xl">👆</span>
              </motion.div>
              <p className="text-lg text-white/80 font-bold">点击屏幕开始</p>
            </motion.div>
          )}

          {phase === 'world' && (
            <motion.div key="w" className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SceneImage src={imgWorld} alt="咔哒山谷" />
              <h1 className="text-3xl font-extrabold text-white">🏭 咔哒山谷</h1>
            </motion.div>
          )}

          {phase === 'character' && (
            <motion.div key="c" className="text-center space-y-4 w-full max-w-sm"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Interactive Dino Character */}
              <motion.div className="relative cursor-pointer select-none"
                onClick={handleDinoTouch}
                onTouchStart={handleDinoTouch}
                whileTap={{ scale: 0.95 }}>
                {/* Glow ring */}
                <motion.div className="absolute inset-0 rounded-full mx-auto"
                  style={{ width: 200, height: 200, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(76,175,80,0.3) 0%, transparent 70%)' }}
                  animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }} />

                {/* Dino body */}
                <motion.div className="relative z-10" animate={dinoAnimation} transition={dinoTransition}>
                  <svg viewBox="0 0 200 240" width="180" height="216" style={{ filter: 'drop-shadow(0 8px 20px rgba(76,175,80,0.4))' }}>
                    {/* Body */}
                    <ellipse cx="100" cy="150" rx="65" ry="70" fill="#4CAF50" />
                    {/* Belly */}
                    <ellipse cx="100" cy="160" rx="40" ry="45" fill="#81C784" />
                    {/* Hard hat */}
                    <path d="M55 85 Q100 50 145 85 L140 90 Q100 65 60 90 Z" fill="#FFC107" />
                    <rect x="50" y="85" width="100" height="8" rx="4" fill="#FFD54F" />
                    {/* Eyes */}
                    <circle cx="80" cy="110" r="12" fill="white" />
                    <circle cx="120" cy="110" r="12" fill="white" />
                    <circle cx="82" cy="108" r="6" fill="#1a1a2e" />
                    <circle cx="122" cy="108" r="6" fill="#1a1a2e" />
                    <circle cx="84" cy="106" r="2" fill="white" />
                    <circle cx="124" cy="106" r="2" fill="white" />
                    {/* Mouth */}
                    <path d="M85 125 Q100 138 115 125" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
                    {/* Arms */}
                    <path d="M40 140 Q25 150 30 170" fill="none" stroke="#4CAF50" strokeWidth="10" strokeLinecap="round" />
                    <path d="M160 140 Q175 150 170 170" fill="none" stroke="#4CAF50" strokeWidth="10" strokeLinecap="round" />
                    {/* Legs */}
                    <rect x="70" y="205" width="20" height="25" rx="8" fill="#4CAF50" />
                    <rect x="110" y="205" width="20" height="25" rx="8" fill="#4CAF50" />
                    {/* Tail */}
                    <path d="M35 170 Q15 165 10 150 Q5 140 15 135" fill="#4CAF50" stroke="#388E3C" strokeWidth="2" />
                    {/* Spikes */}
                    <polygon points="85,82 90,68 95,82" fill="#388E3C" />
                    <polygon points="95,78 100,62 105,78" fill="#388E3C" />
                    <polygon points="105,82 110,68 115,82" fill="#388E3C" />
                    {/* Gear on chest */}
                    <circle cx="100" cy="155" r="12" fill="none" stroke="#FFC107" strokeWidth="3" />
                    <circle cx="100" cy="155" r="5" fill="#FFC107" />
                  </svg>
                </motion.div>

                {/* Tap hint */}
                {dinoState === 'idle' && (
                  <motion.div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20"
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}>
                    <span className="text-xs text-white/50">👆 触碰打招呼</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Speech bubble */}
              {dinoMsg && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="relative mx-auto max-w-xs px-4 py-2 rounded-2xl text-sm font-bold text-white"
                  style={{ background: 'rgba(76,175,80,0.9)' }}>
                  {dinoMsg}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45" style={{ background: 'rgba(76,175,80,0.9)' }} />
                </motion.div>
              )}

              <h1 className="text-3xl font-extrabold text-white">🦕 T-Roco 洛可</h1>
              <p className="text-base text-white/60">"I'm the coolest driver!"</p>
            </motion.div>
          )}

          {phase === 'ready' && (
            <motion.div key="r" className="text-center space-y-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <motion.span className="text-8xl block" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>🦕</motion.span>
              <div className="flex justify-center gap-4">
                {['🚛', '🏎️', '⚡', '🐢'].map((e, i) => (
                  <motion.span key={i} className="text-3xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}>{e}</motion.span>
                ))}
              </div>
              <CountdownTimer duration={3} onDone={() => { playClick(); onComplete(); }} />
            </motion.div>
          )}
      </div>
    </div>
  );
}

// ============================================================
// Main
// ============================================================
export default function AdventureLesson() {
  const navigate = useNavigate();
  const [scene, setScene] = useState<SceneId>('intro');
  const [childName, setChildName] = useState('');
  const [chosenPath, setChosenPath] = useState<'truck' | 'car' | null>(null);

  const goNext = useCallback((s: SceneId) => {
    playSceneChange();
    setScene(s);
  }, []);

  return (
    <div className="min-h-screen h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {scene === 'intro' && <motion.div key="intro" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><WorldIntroScene onComplete={() => goNext('garage')} /></motion.div>}
        {scene === 'garage' && <motion.div key="g" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><GarageScene onComplete={() => goNext('fork')} onNameRecorded={setChildName} /></motion.div>}
        {scene === 'fork' && <motion.div key="f" className="h-full" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}><ForkScene onComplete={() => goNext('speed')} onChoiceMade={setChosenPath} /></motion.div>}
        {scene === 'speed' && <motion.div key="s" className="h-full" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}><SpeedScene chosenPath={chosenPath || 'truck'} onComplete={() => goNext('bonding')} /></motion.div>}
        {scene === 'bonding' && <motion.div key="b" className="h-full" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }}><BondingScene childName={childName || '副驾驶'} onComplete={() => goNext('done')} /></motion.div>}
        {scene === 'done' && <motion.div key="d" className="h-full" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><CelebrationEnd childName={childName || '副驾驶'} onHome={() => navigate('/home-v3')} /></motion.div>}
      </AnimatePresence>

      {scene !== 'done' && (
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { playClick(); navigate('/home-v3'); }}
          className="fixed top-12 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </motion.button>
      )}
    </div>
  );
}
