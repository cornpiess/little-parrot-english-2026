import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mic, Camera } from 'lucide-react';
import AICharacter from './AICharacter';
import ExploreWorldTab from './ExploreWorldTab';
import GameAssessmentView from './GameAssessmentView';

type ParrotState = 'sleeping' | 'listening' | 'thinking' | 'speaking';
type PlayMode = 'select' | 'pretend' | 'draw' | 'chat' | 'photo';
type SceneType = 'kitchen' | 'park' | 'underwater';

const SCENES: Record<SceneType, {
  label: string;
  emoji: string;
  bgImage: string;
  overlay: string;
}> = {
  kitchen: {
    label: '厨房',
    emoji: '🍳',
    bgImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    overlay: 'linear-gradient(180deg, rgba(255,248,225,0.3) 0%, rgba(255,236,179,0.4) 100%)',
  },
  park: {
    label: '公园',
    emoji: '🌳',
    bgImage: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80',
    overlay: 'linear-gradient(180deg, rgba(227,242,253,0.3) 0%, rgba(200,230,201,0.4) 100%)',
  },
  underwater: {
    label: '海底',
    emoji: '🐠',
    bgImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    overlay: 'linear-gradient(180deg, rgba(21,101,192,0.4) 0%, rgba(10,36,114,0.5) 100%)',
  },
};

const MODE_OPTIONS = [
  { id: 'pretend' as PlayMode, emoji: '🏠', label: '过家家', desc: '角色扮演、情景对话', color: 'hsl(25, 85%, 58%)' },
  { id: 'draw' as PlayMode, emoji: '🎨', label: '画画', desc: '创意涂鸦、学习表达', color: 'hsl(280, 55%, 60%)' },
  { id: 'chat' as PlayMode, emoji: '🎮', label: '游戏测评', desc: 'AI出题、测试水平', color: 'hsl(152, 60%, 48%)' },
  { id: 'photo' as PlayMode, emoji: '📸', label: '拍照问问', desc: '拍照识物、学习新词', color: 'hsl(210, 75%, 58%)' },
];

// Camera preview
function CameraPreview({ active }: { active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (active) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => {});
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
      className="absolute bottom-28 right-4 z-20 rounded-2xl overflow-hidden shadow-lg"
      style={{ width: 100, height: 130, border: '3px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
    </motion.div>
  );
}

// Incoming call removed - go straight to mode select
// Mode selection screen with parrot
// Listening wave bar at the bottom of the page
function ListeningWave() {
  return (
    <div className="w-full px-6 pb-8 pt-2 flex flex-col items-center gap-2">
      <span className="text-[11px] text-muted-foreground/70 font-medium tracking-wider">聆听中</span>
      <div className="flex items-center justify-center gap-[6px] h-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: `hsla(25, 85%, 58%, ${0.4 + i * 0.1})` }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ModeSelect({ onSelect, onBack }: { onSelect: (mode: PlayMode) => void; onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--gradient-page)' }}>
      <div className="flex items-center gap-3 px-4 pt-10 pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-2"
        >
          <AICharacter state="listening" size={0.7} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl px-5 py-3 mb-5 max-w-[280px] text-center"
          style={{ background: 'rgba(255,255,255,0.8)' }}
        >
          <p className="text-sm font-medium text-foreground">
            今天想玩什么呀？直接告诉我或选一个吧 🎉
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {MODE_OPTIONS.map((mode, i) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(mode.id)}
              className="rounded-3xl p-5 text-center space-y-2 glass"
              style={{
                background: `linear-gradient(135deg, ${mode.color}18, ${mode.color}08)`,
                border: `1.5px solid ${mode.color}30`,
              }}
            >
              <div className="text-4xl">{mode.emoji}</div>
              <p className="font-bold text-sm text-foreground">{mode.label}</p>
              <p className="text-[11px] text-muted-foreground">{mode.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom listening wave */}
      <ListeningWave />
    </div>
  );
}

// Dreamy bubble background for chat mode
function DreamyBubbleBackground() {
  const bubbles = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    size: 20 + Math.random() * 60,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 6 + Math.random() * 6,
    hue: 180 + Math.random() * 120,
    opacity: 0.08 + Math.random() * 0.12,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg, hsl(220, 60%, 92%) 0%, hsl(260, 50%, 90%) 30%, hsl(200, 55%, 88%) 60%, hsl(280, 45%, 92%) 100%)',
      }} />
      {bubbles.map(b => (
        <motion.div
          key={b.id}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            top: `${b.y}%`,
            background: `radial-gradient(circle at 30% 30%, hsla(${b.hue}, 70%, 80%, ${b.opacity + 0.1}), hsla(${b.hue}, 60%, 70%, ${b.opacity * 0.5}))`,
            border: `1px solid hsla(${b.hue}, 60%, 85%, ${b.opacity})`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 20, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 30%, hsla(240, 60%, 85%, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, hsla(200, 70%, 85%, 0.25) 0%, transparent 50%)',
      }} />
    </div>
  );
}

// Chat/Pretend play view
function VoiceChatView({ onBack, isPretend }: { onBack: () => void; isPretend?: boolean }) {
  const [parrotState, setParrotState] = useState<ParrotState>('sleeping');
  const [isHolding, setIsHolding] = useState(false);
  const [scene, setScene] = useState<SceneType>('kitchen');
  const [cameraOn, setCameraOn] = useState(isPretend || false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const sceneData = SCENES[scene];
  const sceneKeys = Object.keys(SCENES) as SceneType[];

  useEffect(() => {
    if (!isPretend) return;
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = sceneData.bgImage;
  }, [sceneData.bgImage, isPretend]);

  const simulateCycle = useCallback(() => {
    setParrotState('thinking');
    setTimeout(() => {
      setParrotState('speaking');
      setTimeout(() => setParrotState('sleeping'), 3000 + Math.random() * 2000);
    }, 1500 + Math.random() * 1000);
  }, []);

  const handlePressStart = useCallback(() => {
    setIsHolding(true);
    setParrotState('listening');
  }, []);

  const handlePressEnd = useCallback(() => {
    setIsHolding(false);
    if (parrotState === 'listening') simulateCycle();
  }, [parrotState, simulateCycle]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {isPretend ? (
        <motion.div className="absolute inset-0" key={scene}
          initial={{ opacity: 0 }} animate={{ opacity: bgLoaded ? 1 : 0 }} transition={{ duration: 0.8 }}>
          <img src={sceneData.bgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: sceneData.overlay }} />
        </motion.div>
      ) : (
        <DreamyBubbleBackground />
      )}

      <div className="relative z-10 flex items-center gap-3 px-4 pt-10 pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <span className="text-sm font-bold text-foreground/80">{isPretend ? '🏠 过家家' : '💬 聊天'}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4 relative z-10">
        <div className="relative">
          {parrotState !== 'sleeping' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="absolute rounded-full border-2 border-white/30"
                  style={{ width: 160 + i * 40, height: 160 + i * 40 }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.05, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }} />
              ))}
            </div>
          )}
          <div className="w-48 h-52">
            <AICharacter state={parrotState} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={parrotState} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} className="text-3xl">
            {parrotState === 'sleeping' ? '💤' : parrotState === 'listening' ? '🎙️' : parrotState === 'thinking' ? '💭' : '🔊'}
          </motion.div>
        </AnimatePresence>

        {parrotState === 'speaking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-1 h-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div key={i} className="w-1 rounded-full bg-white/60"
                animate={{ height: [4, 12 + Math.random() * 20, 4] }}
                transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }} />
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        <CameraPreview active={cameraOn} />
      </AnimatePresence>

      <div className="relative z-10 px-4 pb-8 pt-2 flex items-end justify-between">
        {isPretend && (
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => {
              const idx = sceneKeys.indexOf(scene);
              setScene(sceneKeys[(idx + 1) % sceneKeys.length]);
              setBgLoaded(false);
            }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)' }}>
            🔄
          </motion.button>
        )}
        {!isPretend && <div className="w-12" />}

        <motion.button whileTap={{ scale: 0.95 }}
          onPointerDown={handlePressStart} onPointerUp={handlePressEnd}
          onPointerLeave={() => isHolding && handlePressEnd()}
          className="w-20 h-20 rounded-full flex items-center justify-center text-white relative"
          style={{
            background: isHolding ? 'hsl(25, 85%, 55%)' : 'var(--gradient-primary-btn)',
            boxShadow: isHolding
              ? '0 0 0 8px hsla(25, 85%, 58%, 0.2), 0 8px 30px hsla(25, 85%, 58%, 0.4)'
              : '0 6px 20px hsla(25, 90%, 60%, 0.3)',
          }}>
          {isHolding ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
              <Mic className="w-8 h-8" />
            </motion.div>
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCameraOn(!cameraOn)}
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: cameraOn ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <span className="text-lg">{cameraOn ? '📹' : '📷'}</span>
        </motion.button>
      </div>
    </div>
  );
}

// Photo recognition view
function PhotoRecognitionView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'capture' | 'result'>('capture');
  const [result, setResult] = useState<{ word: string; emoji: string; meaning: string } | null>(null);

  const handleCapture = () => {
    const objects = [
      { word: 'Apple', emoji: '🍎', meaning: 'A round fruit that is red, green or yellow.\n苹果是一种圆形水果。' },
      { word: 'Book', emoji: '📚', meaning: 'Pages bound together for reading.\n书本是装订在一起用于阅读的纸页。' },
      { word: 'Cup', emoji: '☕', meaning: 'A small container for drinking.\n杯子是用来喝水的小容器。' },
      { word: 'Pencil', emoji: '✏️', meaning: 'A tool for writing and drawing.\n铅笔是用来写字和画画的工具。' },
      { word: 'Chair', emoji: '🪑', meaning: 'A piece of furniture for sitting.\n椅子是用来坐的家具。' },
    ];
    setResult(objects[Math.floor(Math.random() * objects.length)]);
    setStep('result');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-page)' }}>
      <div className="flex items-center gap-3 px-4 pt-10 pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <span className="text-sm font-bold text-foreground">📸 拍照问AI</span>
      </div>

      <div className="flex-1 px-4 pb-8">
        <AnimatePresence mode="wait">
          {step === 'capture' && (
            <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <AICharacter state="speaking" size={0.35} />
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.8)' }}>
                  <p className="text-sm text-foreground">拍一张照片，我来告诉你这是什么！📷</p>
                </div>
              </div>

              <div className="aspect-[3/4] rounded-3xl overflow-hidden flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '2px solid rgba(255,255,255,0.1)' }}>
                <div className="absolute inset-4 border-2 border-white/20 rounded-2xl" />
                <div className="text-center space-y-3">
                  <Camera className="w-12 h-12 text-white/40 mx-auto" />
                  <p className="text-white/50 text-sm">对准物体拍照</p>
                </div>
              </div>
              <div className="flex justify-center">
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleCapture}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                  <div className="w-13 h-13 rounded-full border-4 border-primary" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <AICharacter state="speaking" size={0.35} />
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.8)' }}>
                  <p className="text-sm text-foreground">我知道了！这是 <strong>{result.word}</strong>！🎉</p>
                </div>
              </div>

              <div className="rounded-3xl p-6 text-center space-y-4 glass" style={{ background: 'rgba(255,255,255,0.8)' }}>
                <div className="text-6xl">{result.emoji}</div>
                <h3 className="text-3xl font-bold text-foreground">{result.word}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{result.meaning}</p>
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { setStep('capture'); setResult(null); }}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 glass">
                  📷 再拍一张
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onBack}
                  className="flex-1 py-3 rounded-2xl font-semibold text-white text-sm"
                  style={{ background: 'var(--gradient-primary-btn)' }}>
                  ✅ 完成
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PlayTogetherPage() {
  const navigate = useNavigate();
  const [playMode, setPlayMode] = useState<PlayMode>('select');
  const [drawSecondaryOpen, setDrawSecondaryOpen] = useState(false);

  if (playMode === 'select') {
    return <ModeSelect onSelect={(mode) => setPlayMode(mode)} onBack={() => navigate('/home-v3')} />;
  }

  if (playMode === 'pretend') {
    return <VoiceChatView onBack={() => setPlayMode('select')} isPretend />;
  }

  if (playMode === 'chat') {
    return <GameAssessmentView onBack={() => setPlayMode('select')} />;
  }

  if (playMode === 'photo') {
    return <PhotoRecognitionView onBack={() => setPlayMode('select')} />;
  }

  if (playMode === 'draw') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-page)' }}>
        <div className="flex items-center gap-3 px-4 pt-10 pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPlayMode('select')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-foreground">🎨 画画</h1>
            <p className="text-xs text-muted-foreground">和AI一起画画</p>
          </div>
        </div>
        {/* Parrot companion */}
        <div className="flex items-center gap-3 px-5 pb-3">
          <AICharacter state="speaking" size={0.35} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl rounded-tl-sm px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.8)' }}
          >
            <p className="text-xs text-foreground">一起来画画吧！试着画个你喜欢的东西 🎨</p>
          </motion.div>
        </div>
        <div className="flex-1">
          <ExploreWorldTab onSecondaryPageChange={setDrawSecondaryOpen} drawingOnly />
        </div>
      </div>
    );
  }

  return null;
}
