import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGestureControl } from '../../hooks/useGestureControl';
import { stopSpeech } from '../../hooks/useParrotSpeech';
import { CameraProp, PropKind } from '../../components/CameraProp';
import Mascot, { getMascotId, getMascotName, type MascotId } from '../../components/Mascot';
import { dispatchKidGesture, subscribeKidParrot } from './colorland/kidInput';
import type { ParrotAnim } from '../../hooks/useParrotSpeech';
import { ParrotGreeting } from './stages/ParrotGreeting';
import { ParrotChoice, World } from './stages/ParrotChoice';
import { ParrotFlight } from './stages/ParrotFlight';
import { ParrotAdventureStage } from './stages/ParrotAdventureStage';
import { ParrotAntTravel } from './stages/ParrotAntTravel';
import { ParrotAntAdventure } from './stages/ParrotAntAdventure';
import ParrotColorAdventure from './colorland/ParrotColorAdventure';

type Step = 'greet' | 'pick' | 'travel' | 'adventure' | 'farewell';
type SceneId = 'hatching' | 'rock' | 'reunion' | 'board' | 'home';

// 计时器独立组件：自身每秒 setInterval + setState，重渲染只作用于这一小块，
// 不触发包含 <video> 的协调容器重渲染，避免摄像头预览被反复重挂/重渲染导致卡顿。
function LessonTimer({ startTimeRef }: { startTimeRef: React.RefObject<number> }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTimeRef]);
  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  return (
    <div
      className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 shadow text-gray-700"
      title="本课用时（打招呼 + 飞行 + 冒险 + 告别）"
    >
      <span className="text-xs">⏱️</span>
      <span className="text-base font-bold tabular-nums">{mmss}</span>
    </div>
  );
}

// ============================================================
// 前置「舷窗」主题装饰框：飞船驾驶舱 / 缩小服。
// 让幼儿的摄像头画面像透过真正的飞船窗或缩小面罩在看世界。
// ============================================================
function CockpitShrinkFrame({ theme }: { theme: 'cockpit' | 'shrink' | null }) {
  if (theme === 'shrink') {
    return (
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* 圆形缩小窗口 */}
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-emerald-300/70 m-1.5" />
        <div className="absolute inset-0 rounded-full border-2 border-emerald-100/40 m-4" />
        {/* 缩小服缝线 */}
        <div className="absolute inset-x-0 top-2 h-px bg-emerald-200/40 rotate-12" />
        <div className="absolute inset-x-0 bottom-2 h-px bg-emerald-200/40 -rotate-12" />
        {/* 度数刻表（像温度计显示你正在变小） */}
        <div className="absolute top-2 right-2 rounded-md bg-emerald-500/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
          ⬇ tiny!
        </div>
        {/* 角落加强件 */}
        <div className="absolute top-2 left-2 h-4 w-1 rounded bg-emerald-400/80" />
        <div className="absolute bottom-2 left-2 h-4 w-1 rounded bg-emerald-400/80" />
      </div>
    );
  }

  if (theme === 'cockpit') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* 驾驶舱玻璃：浅蓝渐变 + 反光斜线 */}
        <div className="absolute inset-0 rounded-2xl border-[3px] border-cyan-200/80" />
        <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-cyan-200/40 to-transparent skew-x-[-18deg]" />
        {/* 仪表盘提示 */}
        <div className="absolute top-2 left-2 rounded-md bg-cyan-500/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
          ⚙️ AUTO
        </div>
        <div className="absolute top-2 right-2 rounded-md bg-amber-500/75 px-1.5 py-0.5 text-[9px] font-bold text-white">
          🛸
        </div>
        {/* 瞄准十字 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40">
          <span className="text-white text-[10px] tracking-widest">＋</span>
        </div>
      </div>
    );
  }
  return null;
}

// 伙伴座底色：跟随角色主题色。
function seatBg(character: MascotId): string {
  switch (character) {
    case 'fox': return 'linear-gradient(160deg,#FF8A65,#D84315)';
    case 'olaf': return 'linear-gradient(160deg,#4FC3F7,#0277BD)';
    case 'dino': return 'linear-gradient(160deg,#66BB6A,#2E7D32)';
    case 'xiaobanlong': return 'linear-gradient(160deg,#FFD54F,#F57C00)';
    default: return 'linear-gradient(160deg,#FFCA28,#F57C00)';
  }
}

// ============================================================
// 双座舱带背景：跟随「角色 + 场景」变化，避免全场都是黄色。
//  - greet/pick：按当前角色主题色（鹦鹉暖黄 / 狐狸橙 / 雪宝冰雪蓝 / 恐龙嫩绿）
//  - travel/adventure（dino/ant）：沉浸式暗色座舱，配合夜空/地洞氛围
//  - adventure color（颜色乐园）：浅蓝，配合课堂主背景
//  - farewell：粉紫，配合告别舞台
// ============================================================
function dockBandBg(step: Step, world: World, character: MascotId): string {
  if (step === 'travel') {
    return world === 'dino'
      ? 'linear-gradient(180deg,#2E3560,#1A1F42)'
      : 'linear-gradient(180deg,#2E5D3A,#1F3B25)';
  }
  if (step === 'adventure') {
    if (world === 'dino') return 'linear-gradient(180deg,#3A3A6E,#26265A)';
    if (world === 'ant') return 'linear-gradient(180deg,#5D4037,#3E2723)';
    return 'linear-gradient(180deg,#B3E5FC,#81D4FA)';
  }
  if (step === 'farewell') return 'linear-gradient(180deg,#E1BEE7,#CE93D8)';
  switch (character) {
    case 'fox': return 'linear-gradient(180deg,#FFB74D,#FF8A65)';
    case 'olaf': return 'linear-gradient(180deg,#B3E5FC,#81D4FA)';
    case 'dino': return 'linear-gradient(180deg,#A5D6A7,#66BB6A)';
    case 'xiaobanlong': return 'linear-gradient(180deg,#FFE082,#FFB74D)';
    default: return 'linear-gradient(180deg,#FFE082,#FFB74D)';
  }
}

// ============================================================
// 小鹦鹉冒险（可任选：恐龙世界 / 蚂蚁王国 / 颜色乐园）
// 阶段：打招呼 → 自主选目的地 → 前往（飞船/缩小机器）→ 落地冒险 → 告别回程
// 摄像头 = 常驻「舷窗」，从打招呼一直挂到告别，从不卸载，
//         所以前置摄像头画面不会丢/不会变黑。
// 颜色乐园(Color Land)里，小鹦鹉不占用课程内容区，而是坐在
// 幼儿前置摄像头的右侧伙伴座上，跟随课程实时做动作。
// ============================================================

/** 右侧伙伴座里的小鹦鹉：订阅颜色课实时动画，保持动作同步 */
function LiveParrotSeat({ fallback, character }: { fallback: ParrotAnim; character: MascotId }) {
  const [anim, setAnim] = useState<ParrotAnim>(fallback);
  useEffect(() => subscribeKidParrot(setAnim), []);
  return (
    <motion.div
      className="absolute inset-0 flex items-end justify-center"
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Mascot state={anim} size={0.6} character={character} />
    </motion.div>
  );
}

export default function ParrotDinoAdventure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 产品特色：任意角色（小鹦鹉/小狐狸/雪宝/小恐龙）都能带领学习。
  // 进入冒险前把 ?character=xxx 写入 localStorage，整条课程都用该角色。
  const charParam = searchParams.get('character');
  const character: MascotId =
    charParam === 'fox' || charParam === 'olaf' || charParam === 'dino' || charParam === 'xiaobanlong' || charParam === 'parrot'
      ? charParam as MascotId
      : getMascotId();
  useEffect(() => {
    localStorage.setItem('selected_character', character);
  }, [character]);
  const characterName = getMascotName(character);

  const [step, setStep] = useState<Step>('greet');
  const [world, setWorld] = useState<World>('dino');
  const [scene, setScene] = useState<SceneId>('hatching');

  const startTimeRef = useRef<number>(Date.now());

  // Color Land 阶段启用 MediaPipe 手势识别，并把幼儿手势（点头/点赞/微笑/张开手）
  // 转发给当前正在等待回答的 KidTurn（由 kidInput 单例分发）。
  const kidGesturesOn = step === 'adventure' && world === 'color';
  const { ready: cameraReady, cameraError, mirrored } = useGestureControl({
    enabled: kidGesturesOn,
    onGesture: (g) => dispatchKidGesture(g),
    videoRef,
  });

  const goTo = (s: Step) => {
    if (s === 'greet') startTimeRef.current = Date.now(); // 重玩：重置计时
    setStep(s);
    setScene('hatching');
  };

  useEffect(() => {
    stopSpeech();
  }, [step]);

  const getProp = (): PropKind => {
    if (step === 'adventure' && world === 'dino') {
      if (scene === 'rock') return 'hardhat';
      if (scene === 'reunion') return 'party';
      return null;
    }
    if (step === 'farewell') return 'party';
    return null;
  };

  const goBack = () => {
    stopSpeech();
    navigate('/');
  };

  // 常驻「组长 + 伙伴」双座舱：幼儿摄像头（组长）与小鹦鹉（伙伴）永远并肩在一起。
  // 选目的地/交通工具/恐龙/蚂蚁/颜色乐园冒险阶段都显示。
  // 颜色乐园(Color Land)里伙伴座的小鹦鹉实时同步课程动作（不占用课程内容区）。
  const companionOn =
    step === 'pick' || step === 'travel' ||
    step === 'adventure';
  const isColorAdventure = step === 'adventure' && world === 'color';
  // 双座舱带（摄像头+伙伴座）常驻屏幕底部文档流中，课程内容区在其上方，
  // 内容永远不可能滑到座舱底下 —— 幼儿的 ✅/❌ 大按钮绝不会被遮挡。
  // 前置「舷窗」装饰：根据目的地世界切换成 飞船驾驶舱 / 缩小服 氛围框
  const hudTheme: 'cockpit' | 'shrink' | null =
    step === 'travel' && world === 'dino' ? 'cockpit' :
    step === 'travel' && world === 'ant' ? 'shrink' : null;
  const windshieldStyle: React.CSSProperties = {
    width: 150,
    height: 150,
    borderColor: 'rgba(255,255,255,0.6)',
  };
  const captainTag =
    step === 'travel' && world === 'dino' ? 'You · Captain 🧑‍🚀' :
    step === 'travel' && world === 'ant' ? 'You · Tiny Hero 🦸' :
    step === 'pick' ? 'You · Explorer 🧭' :
    'You · Explorer 🧑‍🚀';
  const parrotTag =
    step === 'travel' && world === 'dino' ? `${characterName} · Copilot ${character === 'fox' ? '🦊' : character === 'olaf' ? '⛄' : character === 'dino' ? '🦖' : '🦜'}` :
    step === 'travel' && world === 'ant' ? `${characterName} · Shrinker ${character === 'fox' ? '🦊' : character === 'olaf' ? '⛄' : character === 'dino' ? '🦖' : '🦜'}` :
    isColorAdventure ? `${characterName} · Teacher ${character === 'fox' ? '🦊' : character === 'olaf' ? '⛄' : character === 'dino' ? '🦖' : '🦜'}` :
    `${characterName} · Buddy ${character === 'fox' ? '🦊' : character === 'olaf' ? '⛄' : character === 'dino' ? '🦖' : '🦜'}`;

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col" style={{ background: '#FFF8E1' }}>
      {/* 返回按钮 */}
      <button
        onClick={goBack}
        className="fixed top-3 left-3 z-50 w-11 h-11 rounded-full bg-white/80 shadow flex items-center justify-center text-xl"
        aria-label="返回"
      >
        ←
      </button>

      <LessonTimer startTimeRef={startTimeRef} />

      {/* 课程内容区：永远在座舱带上方（flex-1），座舱带下方 shrink-0，
          两者是文档流上下关系而非叠加，天然互不遮挡。 */}
      <div className="relative flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {step === 'greet' && (
            <ParrotGreeting key="greet" mode="chat" character={character} onDone={() => goTo('pick')} />
          )}
          {step === 'pick' && <ParrotChoice key="pick" onChoose={(w) => {
            setWorld(w);
            // 颜色乐园直接进入 5 步法整课（无需飞行/缩小旅程）
            if (w === 'color') { goTo('adventure'); } else { goTo('travel'); }
          }} />}
          {step === 'adventure' && world === 'color' && (
            <ParrotColorAdventure key="color-adventure" onDone={() => goTo('farewell')} />
          )}
          {step === 'travel' && (world === 'dino'
            ? <ParrotFlight key="flight" onDone={() => goTo('adventure')} />
            : <ParrotAntTravel key="ant-travel" onDone={() => goTo('adventure')} />)}
          {step === 'adventure' && world === 'dino' && (
            <ParrotAdventureStage
              key="adventure"
              scene={scene}
              setScene={setScene}
              onDone={() => goTo('farewell')}
            />
          )}
          {step === 'adventure' && world === 'ant' && (
            <ParrotAntAdventure key="ant-adventure" onDone={() => goTo('farewell')} />
          )}
          {step === 'farewell' && (
            <ParrotGreeting key="farewell" mode="farewell" world={world} character={character} onDone={() => goTo('greet')} />
          )}
        </AnimatePresence>
      </div>

      {/* 常驻「组长 + 伙伴」双座舱带：幼儿摄像头（组长）与小鹦鹉（伙伴）永远并肩。
          位于页面底部文档流，不覆盖任何课程内容（✅/❌ 按钮、选择按钮都不会被挡）。
          颜色乐园里伙伴座实时跟随课程动作；其他阶段保持固定打招呼。 */}
      <div
        className="shrink-0 flex items-center justify-center gap-3 px-3 pt-2"
        style={{ background: dockBandBg(step, world, character), borderTop: '3px solid rgba(255,255,255,0.7)' }}
      >
        {/* 组长摄像头 HUD（永不卸载） */}
        <div
          className="relative overflow-hidden rounded-2xl shadow-lg"
          style={{ ...windshieldStyle, background: '#222', border: '3px solid rgba(255,255,255,0.6)' }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
          />
          <CameraProp kind={getProp()} />

          {/* 舷窗主题装饰框：飞船驾驶舱 / 缩小服 */}
          <CockpitShrinkFrame theme={hudTheme} />

          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center text-white/80 text-xs">camera…</div>
          )}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center text-white/90 text-xs px-2 text-center">
              camera off
            </div>
          )}
          <div className="absolute top-1 left-1 rounded-full bg-red-500 w-2.5 h-2.5 animate-pulse" />
          {companionOn && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <span className="text-[10px] text-white bg-cyan-600/80 rounded-t px-2 py-0.5">{captainTag}</span>
            </div>
          )}
        </div>

        {/* 伙伴座：紧挨着幼儿摄像头，两人永远并肩在一起。
            和摄像头一样是正方形，避免角色被上下裁切。
            座舱底色跟随角色主题色。 */}
        {companionOn && (
          <div
            className="relative overflow-hidden rounded-2xl shadow-lg border-[3px] border-white/70"
            style={{ width: 150, height: 150, background: seatBg(character) }}
          >
            {isColorAdventure
              ? <LiveParrotSeat fallback="wave" character={character} />
              : (
                <motion.div
                  className="absolute inset-0 flex items-end justify-center"
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Mascot state="wave" size={0.6} character={character} />
                </motion.div>
              )}
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <span className="text-[10px] text-white bg-black/45 rounded-t px-2 py-0.5">{parrotTag}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
