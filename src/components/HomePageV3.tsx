import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';
import { BookOpen, Users, ShoppingBag, Sun, Moon, Wifi, X, ChevronDown, UserPlus, HelpCircle, Sparkles, Lock, Check } from 'lucide-react';
import ParrotCharacter from '@/components/ParrotCharacter';
import FoxCharacter from '@/components/FoxCharacter';
import OlafCharacter from '@/components/OlafCharacter';
import { getCharacterState, startTrial, purchaseCharacter, subscribeCharacter, formatTrialTime, CHARACTER_STORIES, CharacterState, getBondLevel, addBondExp, getLearningProgress, markActiveDay, beginLearningSession, endLearningSession, getTrialDurationMs, isTrialExpired } from '@/lib/characterState';

import imgTeacher1 from '@/assets/1ebf0cda2cde974b5ed9ae6990f1305cc10602a8.webp';
import imgTeacher2 from '@/assets/18466f7d75c7f0003c756fab4f226f5acaf0b786.webp';
import imgTeacher3 from '@/assets/aeb3bf3332ef650a0757436b3785006b754ee466.webp';

import imgPartnerAllen from '@/assets/5f34b76305073c932c45e9a1ca6982a3b0701c51.webp';
import imgPartnerHarry from '@/assets/7f5840355d80debdd7cbea5b1b0cfcd8797475cf.webp';
import imgPartnerXizi from '@/assets/5beb9546513432ce9c4c07c79c92908956d92ffb.webp';
import imgPartnerBull from '@/assets/9ace1b69d6a8cf0749e3bc5affa90c3f4b1856da.webp';
import imgPartnerBred from '@/assets/865cc265587e2b67df878968a8f421d99f400e41.webp';
import imgPartnerCoco from '@/assets/adc9f9dc90a165002cdfaac86d27cb447763afc7.webp';

interface Character {
  id: string; name: string; subtitle: string; color: string; accent: string;
  component: React.ReactNode; image?: string; desc?: string;
}

const TEACHERS: Character[] = [
  { id: 'einstein', name: '爱因斯坦α', subtitle: '科学家', color: '#58CC02', accent: 'rgba(88,204,2,0.12)', image: imgTeacher1, desc: '擅长：恐龙时代、动植物百科、太空探索' },
  { id: 'beethoven', name: '贝多芬β', subtitle: '音乐家', color: '#1CB0F6', accent: 'rgba(28,176,246,0.12)', image: imgTeacher2, desc: '擅长：乐器启蒙、儿歌韵律' },
  { id: 'deer', name: '小鹿姐姐', subtitle: '幼儿教育专家', color: '#FF6B9D', accent: 'rgba(255,107,157,0.12)', image: imgTeacher3, desc: '擅长：行为引导、自我认知、情绪管理' },
];

const PARTNERS: Character[] = [
  { id: 'parrot', name: '小鹦鹉', subtitle: '学习伙伴', color: '#1CB0F6', accent: 'rgba(28,176,246,0.12)', component: <ParrotCharacter state="idle" size={0.85} />, desc: '活泼 · 爱唱歌 · 快乐学英语' },
  { id: 'fox', name: '小狐狸', subtitle: '好奇宝宝', color: '#E87040', accent: 'rgba(232,112,64,0.12)', component: <FoxCharacter state="idle" size={0.85} />, desc: '聪明 · 好奇 · 爱探险' },
  { id: 'olaf', name: '雪宝', subtitle: '雪人朋友', color: '#38BDF8', accent: 'rgba(56,189,248,0.12)', component: <OlafCharacter size={1} />, desc: '温暖 · 友善 · 爱讲故事' },
  { id: 'allen', name: 'Allen', subtitle: '美国', color: '#1CB0F6', accent: 'rgba(28,176,246,0.12)', image: imgPartnerAllen, desc: '阳光 · 运动 · 音乐' },
  { id: 'harry', name: 'Harry', subtitle: '英国', color: '#58CC02', accent: 'rgba(88,204,2,0.12)', image: imgPartnerHarry, desc: '绅士 · 阅读 · 下午茶' },
  { id: 'xizi', name: 'Xizi', subtitle: '日本', color: '#FF6B9D', accent: 'rgba(255,107,157,0.12)', image: imgPartnerXizi, desc: '可爱 · 画画 · 手工' },
  { id: 'bull', name: 'Bull', subtitle: '巴西', color: '#FF9500', accent: 'rgba(255,149,0,0.12)', image: imgPartnerBull, desc: '热情 · 足球 · 开朗' },
  { id: 'bred', name: 'Bred', subtitle: '中东', color: '#AF57DB', accent: 'rgba(175,87,219,0.12)', image: imgPartnerBred, desc: '神秘 · 冒险 · 友善' },
  { id: 'coco', name: 'Coco', subtitle: '小鹦鹉', color: '#58CC02', accent: 'rgba(88,204,2,0.12)', image: imgPartnerCoco, desc: '聪明 · 模仿 · 快乐' },
];

const GREETINGS: Record<string, string[]> = {
  einstein: ['来吧，一起探索科学的奥秘！', '今天想了解恐龙还是太空呢？', '准备好开启知识之旅了吗？'],
  beethoven: ['来，我们一起唱首歌吧！', '准备好了吗？音乐时间到！', '今天想学什么旋律呢？'],
  deer: ['宝贝今天心情怎么样呀？', '来，我们一起做个小游戏吧！', '准备好了吗？开始今天的学习！'],
  parrot: ['嗨！准备好一起学英语了吗？', '嘿呀！快来跟我一起玩吧！', '你来啦！今天一起探险吧！'],
  fox: ['嘿嘿～想不想跟我去冒险？', '嘘！我发现一个超酷的秘密！', '终于来啦！快来快来！'],
  olaf: ['嗨～朋友！见到你好开心！', '啊！是你呀！我好想你！', '来啦！我有好多故事讲给你听！'],
  allen: ['Hey! Ready to learn English with me?', "What's up! Let's have some fun!", "Nice to see you! Let's play!"],
  harry: ['Hello there! Fancy meeting you!', "Welcome! Shall we read a book?", "Jolly good! Let's get started!"],
  xizi: ['こんにちは！一緒に玩耍吧！', '你好呀！今天一起画画吧！', '来啦！我准备了手工材料哦！'],
  bull: ['Olá! Vamos jogar juntos?', '嗨！准备好踢球了吗？', '来吧！今天我们学葡萄牙语！'],
  bred: ['مرحبا! مرحبا بك!', '你好！想听一个神秘故事吗？', '来啦！我带你去探险！'],
  coco: ['嘎嘎～你好呀小朋友！', '嘿嘿！我学会新单词了！', '快来！我们一起唱歌吧！'],
};

const ENGINE_HIGHLIGHTS = [
  { label: '每月测评', value: '测评中', color: '#AF57DB', icon: '📊',
    detail: { title: '每月测评', subtitle: 'AI 无感测评', status: '正在测评中（根据最近 7 天互动分析）', letter: '💡 给家长的信', letterBody: 'AI 伙伴会在宝贝与它的对话过程中，自动分析发音、词汇掌握及逻辑表达。无需额外考试，每个月 1 号为您生成深度成长报告。', metrics: [{ value: '156', label: '词汇量', color: '#AF57DB' }, { value: '85%', label: '表达力', color: '#1CB0F6' }, { value: '92%', label: '积极度', color: '#58CC02' }] } },
  { label: 'i+1匹配', value: '100%', color: '#1CB0F6', icon: '🎯',
    detail: { title: 'i+1 动态匹配', subtitle: '智能难度调节', status: '当前处于 L2 水平', letter: '📈 匹配详情', letterBody: '当前处于 L2 水平。AI 已为您调整对话难度：新词率 10%，语速 85%。', metrics: [{ value: '10%', label: '新词率', color: '#FF9500' }, { value: '85%', label: '语速', color: '#1CB0F6' }, { value: 'L2', label: '等级', color: '#58CC02' }] } },
  { label: 'AI计划', value: '15分钟', color: '#58CC02', icon: '📋',
    detail: { title: 'AI 计划', subtitle: '今日学习计划', status: '推荐学习 15 分钟', letter: '📅 计划详情', letterBody: '今日推荐学习 15 分钟，包含 2 个新单词复习和 1 个新场景探索。', metrics: [{ value: '15', label: '分钟', color: '#58CC02' }, { value: '2', label: '新词', color: '#FF9500' }, { value: '1', label: '场景', color: '#AF57DB' }] } },
  { label: '遗忘曲线', value: '3个词', color: '#FF9500', icon: '🧠',
    detail: { title: '遗忘曲线', subtitle: '记忆巩固提醒', status: '5 个词汇即将到达遗忘临界点', letter: '🔄 巩固详情', letterBody: '今日有 5 个词汇即将到达遗忘临界点，AI 已将它们编入今日对话开场白。', metrics: [{ value: '5', label: '待巩固', color: '#FF9500' }, { value: '23', label: '已掌握', color: '#58CC02' }, { value: '89%', label: '留存率', color: '#1CB0F6' }] } },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return '夜深了'; if (h < 11) return '早安'; if (h < 13) return '午安';
  if (h < 18) return '下午好'; if (h < 22) return '晚上好'; return '夜深了';
};

/* ═══════════════════════════════════════
   V2-quality card with holo + tilt + expand
   ═══════════════════════════════════════ */
function V2Card({ char, isActive, size, onClick, theme, isFlipped, onFlip, isNew, trialState }: {
  char: Character; isActive: boolean; size: 'front' | 'back'; onClick?: () => void; theme: 'dark' | 'light';
  isFlipped?: boolean; onFlip?: (flipped: boolean, rect?: DOMRect) => void;
  isNew?: boolean; trialState?: CharacterState;
}) {
  const isFront = size === 'front';
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);
  const [hovered, setHovered] = useState(false);
  const flipped = isFlipped ?? false;

  const onMove = useCallback((cx: number, cy: number) => {
    if (!cardRef.current || !isFront || flipped) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (cx - r.left) / r.width;
    const py = (cy - r.top) / r.height;
    setTilt({ x: (py - 0.5) * -24, y: (px - 0.5) * 24 });
    setMx(px * 100); setMy(py * 100);
  }, [isFront, flipped]);

  const handleClick = useCallback(() => {
    if (isFront) {
      const next = !flipped;
      const rect = cardRef.current?.getBoundingClientRect();
      if (onFlip) {
        onFlip(next, rect);
      } else if (onClick) {
        onClick();
      }
      setTilt({ x: 0, y: 0 });
    }
  }, [isFront, flipped, onFlip, onClick]);

  /* When flipped, render invisible placeholder — parent shows expanded overlay */
  if (isFront && flipped) {
    return (
      <motion.div className="flex-shrink-0 relative"
        style={{ width: 195, height: 270, visibility: 'hidden' }} />
    );
  }

  return (
    <motion.div
      className={`flex-shrink-0 relative rounded-[2rem] ${isFront ? 'cursor-pointer' : ''} ${isActive && isFront ? 'card-wobble card-glow' : ''}`}
      /* Landing animation for newly activated characters */
      initial={isNew ? { y: -300, opacity: 0, scale: 0.5, rotateZ: -10 } : false}
      animate={isNew ? { y: 0, opacity: 1, scale: 1, rotateZ: 0 } : undefined}
      transition={isNew ? { type: 'spring', stiffness: 120, damping: 14, delay: 0.3 } : undefined}
      style={{
        width: isFront ? 195 : 120,
        zIndex: 5,
        '--glow-color': `${char.color}50`,
        transform: isFront && hovered
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.06,1.06,1.06)`
          : 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)',
        transformStyle: 'preserve-3d' as const,
        transition: hovered ? 'transform 0.12s ease-out, box-shadow 0.3s' : 'transform 0.5s cubic-bezier(.23,1,.32,1), box-shadow 0.3s',
      } as React.CSSProperties}
      whileTap={isFront ? { scale: 0.97 } : undefined}
      onClick={handleClick}
      onPointerMove={(e) => onMove(e.clientX, e.clientY)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); setMx(50); setMy(50); }}
    >
      <div ref={cardRef}
        className="relative overflow-hidden rounded-[2rem] flex flex-col items-center"
        style={{
          height: isFront ? 270 : 140,
          background: isActive
            ? theme === 'dark'
              ? `linear-gradient(180deg, ${char.color}18 0%, ${char.accent} 50%, rgba(10,10,15,0.9) 100%)`
              : `linear-gradient(180deg, ${char.color}15 0%, ${char.accent} 50%, rgba(255,255,255,0.95) 100%)`
            : theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
          boxShadow: isActive
            ? isFront && hovered
              ? theme === 'dark'
                ? `0 24px 50px ${char.color}30, 0 0 60px ${char.color}15`
                : `0 24px 50px ${char.color}25, 0 0 60px ${char.color}12`
              : theme === 'dark'
                ? `0 8px 32px ${char.color}15, 0 0 0 1px rgba(255,255,255,0.03)`
                : `0 8px 32px ${char.color}12, 0 0 0 1px ${char.color}15`
            : theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
        }}>

        {/* ── Front face ── */}
        <div className="absolute inset-0 rounded-[2rem] flex flex-col items-center">

          {/* Holo shine */}
          {isActive && (
            <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
              style={{
                background: `linear-gradient(${110 + tilt.y}deg, rgba(255,0,102,0.05), rgba(0,255,153,0.06), rgba(0,102,255,0.05), rgba(255,204,0,0.05), rgba(255,0,102,0.05))`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${mx}% ${my}%`,
                mixBlendMode: 'color-dodge',
                opacity: isFront && hovered ? 0.6 : 0.15,
                transition: 'opacity 0.4s',
              }} />
          )}

          {/* Scanlines */}
          {isActive && isFront && hovered && (
            <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10 opacity-20"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)', mixBlendMode: 'overlay' }} />
          )}

          {/* Border glow */}
          {isActive && (
            <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
              style={{
                border: `2px solid ${char.color}50`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2), inset 0 0 30px ${char.color}15, 0 0 25px ${char.color}20, 0 0 50px ${char.color}10`,
              }} />
          )}

          {/* Mouse-follow glare */}
          {isActive && isFront && hovered && (
            <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-20"
              style={{
                background: `radial-gradient(circle at ${mx}% ${my}%, ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.25)'} 0%, transparent 50%)`,
                mixBlendMode: 'overlay', opacity: 0.7,
              }} />
          )}

          {/* Character visual */}
          <div className="flex-1 flex items-center justify-center px-2 pt-4 pb-1 relative z-5 pointer-events-none overflow-hidden">
            {char.component || (char.image ? (
              <div className="w-full h-full rounded-xl overflow-hidden" style={{ maxHeight: isFront ? 160 : 80 }}>
                <img src={char.image} alt={char.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ) : null)}
          </div>

          {/* Name + desc */}
          <div className={`text-center px-2 relative z-5 pointer-events-none ${isFront ? 'pb-3 pt-0' : 'pb-2'}`}>
            <div className="flex items-center justify-center gap-1">
              <p className={`font-bold ${isFront ? 'text-[13px]' : 'text-[10px]'}`}
                style={{ color: isActive ? (theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)') : 'rgba(128,128,128,0.3)' }}>
                {char.name}
              </p>
              {isFront && (
                <span className="text-[10px]" style={{ color: `${char.color}90` }}>
                  {char.subtitle}
                </span>
              )}
            </div>
            {isFront && char.desc && (
              <p className="text-[10px] mt-0.5"
                style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
                {char.desc}
              </p>
            )}
            {/* Bond hearts — independent per character, shown for purchased characters */}
            {isFront && (trialState?.status === 'purchased' || trialState?.status === 'subscribed') && (() => {
              const bond = getBondLevel(char.id);
              return (
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className="text-[8px]" style={{ color: i < bond.hearts ? char.color : 'rgba(255,255,255,0.15)' }}>
                      ♥
                    </span>
                  ))}
                  <span className="text-[8px] ml-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Lv{bond.level}</span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Unread dot — character-colored, like iPhone unopened app indicator */}
      {isFront && isNew && (
        <motion.div
          className="absolute -top-1 -right-1 z-30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 1.2 }}
        >
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: char.color,
              boxShadow: `0 0 6px ${char.color}80, 0 1px 3px rgba(0,0,0,0.3)`,
            }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      {/* Trial timer badge — top-right */}
      {isFront && trialState?.status === 'trialing' && (
        <motion.div
          className="absolute top-2 right-2 z-30 px-2 py-0.5 rounded-full flex items-center gap-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{ background: 'rgba(88,204,2,0.9)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div className="w-1 h-1 rounded-full bg-white"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }} />
          <span className="text-[9px] font-bold text-white">
            {formatTrialTime(trialState.remainingMs)}
          </span>
        </motion.div>
      )}

      {/* Purchased badge — top-right */}
      {isFront && (trialState?.status === 'purchased' || trialState?.status === 'subscribed') && (
        <div className="absolute top-2 right-2 z-30 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: trialState.status === 'subscribed' ? '#AF57DB' : '#58CC02' }}>
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Locked badge — small corner indicator */}
      {isFront && trialState?.status === 'locked' && (
        <div className="absolute top-2 left-2 z-30 px-1.5 py-0.5 rounded-full"
          style={{
            background: isTrialExpired(char.id) ? `${char.color}20` : 'rgba(255,255,255,0.08)',
            border: `1px solid ${isTrialExpired(char.id) ? `${char.color}30` : 'rgba(255,255,255,0.1)'}`,
          }}>
          <span className="text-[8px] font-bold" style={{ color: isTrialExpired(char.id) ? char.color : 'rgba(255,255,255,0.45)' }}>
            {isTrialExpired(char.id) ? '已体验' : getTrialDurationMs(char.id) > 5 * 60 * 1000 ? '试用' : '体验'}
          </span>
        </div>
      )}

      {/* Trial progress bar — bottom of card */}
      {isFront && trialState?.status === 'trialing' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 z-20 pointer-events-none rounded-b-[2rem] overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          <motion.div className="h-full"
            style={{ background: '#58CC02', width: `${trialState.elapsedPercent}%` }}
            transition={{ duration: 0.5 }} />
        </div>
      )}

      {/* Landing flash effect */}
      {isFront && isNew && (
        <motion.div
          className="absolute inset-0 rounded-[2rem] pointer-events-none z-25"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${char.color}60 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   Swipeable row — manual touch (no drag conflict)
   ═══════════════════════════════════════ */
const sharedX = { current: typeof window !== 'undefined' ? window.innerWidth / 2 - 195 / 2 : 0 };

function FrontRow({ chars, selectedId, onSelect, theme, onVerticalSwipe, flippedCard, onFlipCard, onAdd, newlyActivated, trialStates, veteranMode }: {
  chars: Character[]; selectedId: string; onSelect: (id: string) => void; theme: 'dark' | 'light';
  onVerticalSwipe?: (direction: 'up' | 'down') => void;
  flippedCard: string | null; onFlipCard: (id: string | null, rect?: DOMRect) => void;
  onAdd?: () => void;
  newlyActivated?: string | null;
  trialStates?: Record<string, CharacterState>;
  veteranMode?: boolean;
}) {
  const CARD_W = 195;
  const GAP = 16;
  const centerOffset = window.innerWidth / 2 - CARD_W / 2;
  const idx = chars.findIndex(c => c.id === selectedId);
  const maxIdx = chars.length - 1;
  const minX = centerOffset - maxIdx * (CARD_W + GAP);
  const targetX = idx >= 0 ? centerOffset - idx * (CARD_W + GAP) : centerOffset;
  const x = useMotionValue(sharedX.current);

  useEffect(() => {
    sharedX.current = targetX;
    animate(x, targetX, { type: 'spring', stiffness: 350, damping: 30 });
  }, [targetX]);

  const touchRef = useRef({ startX: 0, startY: 0, startVal: 0, decided: false, dir: '' as '' | 'h' | 'v' });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    touchRef.current = { startX: e.clientX, startY: e.clientY, startVal: x.get(), decided: false, dir: '' };
  }, [x]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!(e.buttons & 1)) return;
    const t = touchRef.current;
    if (!t.decided) {
      const dx = Math.abs(e.clientX - t.startX);
      const dy = Math.abs(e.clientY - t.startY);
      if (dx > 8 || dy > 8) {
        t.dir = dx > dy ? 'h' : 'v';
        t.decided = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    }
    if (t.dir === 'h') {
      const dx = e.clientX - t.startX;
      const clamped = Math.max(minX - 40, Math.min(centerOffset + 40, t.startVal + dx));
      x.set(clamped);
    }
  }, [x, minX, centerOffset]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const t = touchRef.current;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (t.dir === 'h') {
      const cur = x.get();
      if (cur > centerOffset + 20) { animate(x, centerOffset, { type: 'spring', stiffness: 350, damping: 30 }); onSelect(chars[0].id); return; }
      if (cur < minX - 20) { animate(x, minX, { type: 'spring', stiffness: 350, damping: 30 }); onSelect(chars[maxIdx].id); return; }
      let ci = Math.round((centerOffset - cur) / (CARD_W + GAP));
      ci = Math.max(0, Math.min(maxIdx, ci));
      onSelect(chars[ci].id);
    } else if (t.dir === 'v') {
      const dy = e.clientY - t.startY;
      if (Math.abs(dy) > 30 && onVerticalSwipe) {
        onVerticalSwipe(dy < 0 ? 'up' : 'down');
      }
    }
    touchRef.current.dir = '';
  }, [chars, maxIdx, centerOffset, minX, onSelect, x, CARD_W, GAP, onVerticalSwipe]);

  const addCard: Character = {
    id: '__add__', name: '添加角色', subtitle: '发现更多',
    color: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    accent: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    component: (
      <div className="flex flex-col items-center justify-center gap-1" style={{ height: 140 }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ border: `2px dashed ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}` }}>
          <span className="text-2xl" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}>+</span>
        </div>
      </div>
    ),
  };

  return (
    <div className="relative w-full" style={{ touchAction: 'none' }}>
      <motion.div className="flex items-center" style={{ x, gap: GAP }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}>
        {chars.map(c => {
          const ts = veteranMode ? undefined : trialStates?.[c.id];
          const isLocked = !veteranMode && ts?.status === 'locked';
          return (
          <V2Card key={c.id} char={c} isActive={c.id === selectedId && !isLocked} size="front"
            onClick={() => onSelect(c.id)}
            theme={theme}
            isFlipped={flippedCard === c.id}
            onFlip={(f, rect) => { if (!isLocked) onFlipCard(f ? c.id : null, rect); }}
            isNew={c.id === newlyActivated}
            trialState={ts} />
          );
        })}
        <V2Card key="__add__" char={addCard} isActive={false} size="front"
          onClick={() => onAdd?.()} theme={theme} />
      </motion.div>
    </div>
  );
}

const sharedBackX = { current: typeof window !== 'undefined' ? window.innerWidth / 2 - 60 : 0 };

/* ═══════════════════════════════════════
   Back row (static, non-interactive)
   ═══════════════════════════════════════ */
function BackRow({ chars, selectedId, theme, trialStates }: { chars: Character[]; selectedId: string; theme: 'dark' | 'light'; trialStates?: Record<string, CharacterState> }) {
  const CARD_W = 120;
  const GAP = 8;
  const containerW = typeof window !== 'undefined' ? window.innerWidth : 400;
  const centerOffset = containerW / 2 - CARD_W / 2;
  const idx = chars.findIndex(c => c.id === selectedId);
  const maxIdx = chars.length - 1;
  const targetX = idx >= 0 ? centerOffset - idx * (CARD_W + GAP) : centerOffset;
  const x = useMotionValue(sharedBackX.current);

  useEffect(() => {
    sharedBackX.current = targetX;
    animate(x, targetX, { type: 'spring', stiffness: 350, damping: 30 });
  }, [targetX]);

  const addCardBack: Character = {
    id: '__add__', name: '+', subtitle: '',
    color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    accent: 'transparent',
    component: (
      <div className="flex items-center justify-center" style={{ height: 80 }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ border: `2px dashed ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'}` }}>
          <span className="text-sm" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}>+</span>
        </div>
      </div>
    ),
  };

  return (
    <div className="w-full" style={{ padding: '0 0px' }}>
      <motion.div className="flex items-center" style={{ x, gap: GAP }}>
        {chars.map(c => (
          <V2Card key={c.id} char={c} isActive={c.id === selectedId} size="back" theme={theme}
            trialState={trialStates?.[c.id]} />
        ))}
        <V2Card key="__add__" char={addCardBack} isActive={false} size="back" theme={theme} />
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Spin card — 360° flip from origin to center
   ═══════════════════════════════════════ */
function SpinCard({ char, origin, theme, onDismiss, actions, trialState }: {
  char: Character; origin: { x: number; y: number; w: number; h: number };
  theme: 'dark' | 'light'; onDismiss: () => void;
  actions: { label: string; icon: React.ReactNode; onClick: () => void }[];
  trialState?: CharacterState;
}) {
  const [showBtns, setShowBtns] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingText, setGreetingText] = useState('');
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);

  // Poll trial state every 1s so we detect when parent's useEffect updates localStorage
  const [expired, setExpired] = useState(() => isTrialExpired(char.id));
  const [remaining, setRemaining] = useState(trialState?.remainingMs ?? null);
  useEffect(() => {
    const check = () => {
      setExpired(isTrialExpired(char.id));
      const s = getCharacterState(char.id);
      setRemaining(s.remainingMs);
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [char.id]);

  useEffect(() => {
    const el = flipRef.current;
    if (!el) return;
    const onEnd = () => el.classList.remove('spin-card-enter');
    el.addEventListener('animationend', onEnd, { once: true });
    return () => el.removeEventListener('animationend', onEnd);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setShowBtns(true), 750);
    let t3: ReturnType<typeof setTimeout>;
    const t2 = setTimeout(() => {
      const greetings = GREETINGS[char.id];
      if (greetings) {
        setGreetingText(greetings[Math.floor(Math.random() * greetings.length)]);
        setShowGreeting(true);
        t3 = setTimeout(() => setShowGreeting(false), 4000);
      }
    }, 500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [char.id]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (py - 0.5) * -24, y: (px - 0.5) * 24 });
    setMx(px * 100);
    setMy(py * 100);
  }, []);

  const onPointerLeave = useCallback(() => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
    setMx(50);
    setMy(50);
  }, []);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const targetW = Math.min(300, vw * 0.75);
  const targetH = targetW * (280 / 195);
  const targetX = vw / 2 - targetW / 2;
  const targetY = vh * 0.12;

  const MEMORIES: Record<string, { emoji: string; title: string; date: string }[]> = {
    parrot: [
      { emoji: '🌈', title: '彩虹桥探险', date: '3天前' },
      { emoji: '🎵', title: '一起唱儿歌', date: '5天前' },
      { emoji: '🦜', title: '学说Hello', date: '1周前' },
      { emoji: '🌟', title: '夜晚看星星', date: '2周前' },
    ],
    fox: [
      { emoji: '🔍', title: '森林寻宝', date: '2天前' },
      { emoji: '🍄', title: '蘑菇王国', date: '4天前' },
      { emoji: '🦊', title: '学会分享', date: '1周前' },
      { emoji: '🍂', title: '秋天的树叶', date: '2周前' },
    ],
    olaf: [
      { emoji: '⛄', title: '堆雪人', date: '1天前' },
      { emoji: '❄️', title: '冰雪世界', date: '3天前' },
      { emoji: '📖', title: '睡前故事', date: '1周前' },
      { emoji: '🤗', title: '温暖拥抱', date: '2周前' },
    ],
    einstein: [
      { emoji: '🚀', title: '太空探险', date: '2天前' },
      { emoji: '🦕', title: '恐龙时代', date: '5天前' },
      { emoji: '🔬', title: '小小科学家', date: '1周前' },
      { emoji: '🌌', title: '银河之旅', date: '3周前' },
    ],
    beethoven: [
      { emoji: '🎹', title: '钢琴启蒙', date: '1天前' },
      { emoji: '🎶', title: '摇篮曲', date: '3天前' },
      { emoji: '🎻', title: '小提琴初体验', date: '1周前' },
      { emoji: '🎤', title: '第一次唱歌', date: '2周前' },
    ],
    deer: [
      { emoji: '🎨', title: '画画时间', date: '2天前' },
      { emoji: '🧸', title: '情绪小怪兽', date: '4天前' },
      { emoji: '🌈', title: '认识颜色', date: '1周前' },
      { emoji: '😊', title: '今天真开心', date: '2周前' },
    ],
  };

  const memories = MEMORIES[char.id] || MEMORIES.parrot;

  const renderSpinCharacter = (c: Character) => {
    switch (c.id) {
      case 'parrot': return <ParrotCharacter state="greeting" size={1.1} />;
      case 'fox': return <FoxCharacter state="greeting" size={1.1} />;
      case 'olaf': return <OlafCharacter size={1.2} />;
      default: return c.component;
    }
  };

  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        left: targetX, top: targetY,
        width: targetW, height: targetH,
      }}
      onClick={(e) => { e.stopPropagation(); onDismiss(); }}
    >
    {/* Flip wrapper — CSS flip entrance + CSS tilt (same as V2Card) */}
    <div
      ref={flipRef}
      className="card-glow spin-card-enter"
      style={{
        width: '100%', height: '100%',
        borderRadius: '2rem',
        '--glow-color': `${char.color}50`,
        transform: hovered
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.06,1.06,1.06)`
          : 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)',
        transformStyle: 'preserve-3d',
        transition: hovered ? 'transform 0.12s ease-out' : 'transform 0.5s cubic-bezier(.23,1,.32,1)',
      } as React.CSSProperties}
      onPointerMove={(e) => { setHovered(true); onPointerMove(e); }}
      onPointerLeave={onPointerLeave}
    >
      {/* Greeting bubble */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            style={{ top: -60, width: 'max-content', maxWidth: 200 }}
          >
            <div className="rounded-2xl px-4 py-2.5 text-center shadow-lg backdrop-blur-sm"
              style={{
                background: theme === 'dark' ? 'rgba(20,20,30,0.92)' : 'rgba(255,255,255,0.95)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: theme === 'dark'
                  ? `0 4px 20px rgba(0,0,0,0.4), 0 0 30px ${char.color}15`
                  : `0 4px 20px rgba(0,0,0,0.1), 0 0 30px ${char.color}10`,
              }}>
              <p className="text-[11px] font-medium leading-relaxed"
                style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)' }}>
                {greetingText}
              </p>
            </div>
            <div className="w-2.5 h-2.5 mx-auto rotate-45 -mt-1.5"
              style={{
                background: theme === 'dark' ? 'rgba(20,20,30,0.92)' : 'rgba(255,255,255,0.95)',
                borderRight: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
              }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card face — same style as original */}
      <div ref={cardRef} className="w-full h-full rounded-[2rem] overflow-hidden flex flex-col items-center relative"
        style={{
          background: theme === 'dark'
            ? `linear-gradient(180deg, ${char.color}18 0%, ${char.accent} 50%, rgba(10,10,15,0.9) 100%)`
            : `linear-gradient(180deg, ${char.color}15 0%, ${char.accent} 50%, rgba(255,255,255,0.95) 100%)`,
          boxShadow: theme === 'dark'
            ? `0 32px 60px ${char.color}40, 0 0 80px ${char.color}20, 0 0 0 2px ${char.color}60`
            : `0 32px 60px ${char.color}30, 0 0 80px ${char.color}15, 0 0 0 2px ${char.color}50`,
          backfaceVisibility: 'hidden',
        }}>
        {/* Border glow */}
        <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
          style={{
            border: `2px solid ${char.color}50`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2), inset 0 0 30px ${char.color}15`,
          }} />
        {/* Holo */}
        <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-10"
          style={{
            background: `linear-gradient(110deg, rgba(255,0,102,0.05), rgba(0,255,153,0.06), rgba(0,102,255,0.05), rgba(255,204,0,0.05), rgba(255,0,102,0.05))`,
            backgroundSize: '200% 200%',
            backgroundPosition: `${mx}% ${my}%`,
            mixBlendMode: 'color-dodge',
            opacity: 0.6,
          }} />
        {/* Mouse-follow glare */}
        <div className="absolute inset-0 rounded-[2rem] pointer-events-none z-20"
          style={{
            background: `radial-gradient(circle at ${mx}% ${my}%, ${theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'} 0%, transparent 50%)`,
            mixBlendMode: 'overlay',
            opacity: 0.7,
          }} />
        {/* Character visual */}
        <div className="flex-1 flex items-center justify-center px-2 pt-2 pb-0 relative z-5 pointer-events-none overflow-visible">
          {renderSpinCharacter(char) || (char.image ? (
            <div className="w-full h-full rounded-xl overflow-hidden" style={{ maxHeight: '75%' }}>
              <img src={char.image} alt={char.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ) : null)}
        </div>
        {/* Name + desc */}
        <div className="text-center px-2 relative z-5 pointer-events-none pb-2 pt-0">
          <div className="flex items-center justify-center gap-1">
            <p className="font-bold text-[13px]"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>
              {char.name}
            </p>
            <span className="text-[10px]" style={{ color: `${char.color}90` }}>
              {char.subtitle}
            </span>
          </div>
          {char.desc && (
            <p className="text-[10px] mt-0.5"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
              {char.desc}
            </p>
          )}
        </div>
      </div>
      </div>{/* End flip wrapper */}

      {/* Action buttons — fade in after spin */}
      <AnimatePresence>
        {showBtns && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center gap-3 w-full"
            style={{ position: 'absolute', bottom: -70, left: 0 }}
          >
            {/* Trial state: show trial button or timer */}
            {trialState?.status === 'locked' && expired ? (
              /* Trial expired — show purchase prompt */
              <motion.button whileTap={{ scale: 0.93 }} onClick={(e) => {
                e.stopPropagation();
                setPurchaseModal({ char });
                setTimeout(() => { setFlippedCard(null); setFlipOrigin(null); }, 50);
              }}
                className="px-7 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${char.color}, ${char.color}CC)`,
                  boxShadow: `0 8px 32px ${char.color}50`,
                }}>
                解锁 {char.name}
              </motion.button>
            ) : trialState?.status === 'locked' ? (
              /* Trial not started — show trial button */
              <motion.button whileTap={{ scale: 0.93 }} onClick={(e) => { e.stopPropagation(); actions[0]?.onClick(); }}
                className="px-7 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${char.color}, ${char.color}CC)`,
                  boxShadow: `0 8px 32px ${char.color}50`,
                }}>
                {actions[0]?.icon} {getTrialDurationMs(char.id) > 5 * 60 * 1000 ? '免费试用20分钟' : '免费体验3分钟'}
              </motion.button>
            ) : trialState?.status === 'trialing' ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(88,204,2,0.12)', border: '1px solid rgba(88,204,2,0.25)' }}>
                <motion.div className="w-2 h-2 rounded-full bg-green-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }} />
                <span className="text-xs font-bold" style={{ color: '#58CC02' }}>
                  {getTrialDurationMs(char.id) > 5 * 60 * 1000 ? '试用中' : '体验中'} {formatTrialTime(remaining)}
                </span>
              </div>
            ) : (
              actions.map((a, i) => (
                <motion.button key={i} whileTap={{ scale: 0.93 }} onClick={(e) => { e.stopPropagation(); a.onClick(); }}
                  className="px-7 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center gap-2 whitespace-nowrap"
                  style={{
                    background: i === 0
                      ? `linear-gradient(135deg, ${char.color}, ${char.color}CC)`
                      : theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    color: i === 0 ? 'white' : theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    boxShadow: i === 0 ? `0 8px 32px ${char.color}50` : 'none',
                    border: i === 0 ? 'none' : `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  }}>
                  {a.icon} {a.label}
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory cards — full screen width, below buttons */}
      <AnimatePresence>
        {showBtns && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="fixed left-0 right-0 z-40 px-4"
            style={{ bottom: 20 }}
          >
            <p className="text-[10px] font-bold mb-2 px-1" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>
              📸 冒险回忆
            </p>
            <div className="overflow-hidden rounded-2xl"
              style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${char.color}15`,
              }}>
              <motion.div
                className="flex gap-3 py-3 px-3"
                animate={{ x: [0, -200, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              >
                {[...memories, ...memories].map((m, i) => (
                  <div key={i} className="flex-shrink-0 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5"
                    style={{
                      width: 80, height: 80,
                      background: theme === 'dark' ? `${char.color}12` : `${char.color}08`,
                      border: `1px solid ${char.color}20`,
                    }}>
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-[9px] font-bold text-center leading-tight" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                      {m.title}
                    </span>
                    <span className="text-[7px]" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}>
                      {m.date}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════
   Main
   ═══════════════════════════════════════ */
export default function HomePageV3() {
  const navigate = useNavigate();
  const [userMode, setUserMode] = useState<'new' | 'veteran'>(() => (localStorage.getItem('homev3_userMode') as 'new' | 'veteran') || 'veteran');
  const [childName, setChildName] = useState('小朋友');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark');
  const [selTeacher, setSelTeacher] = useState(() => localStorage.getItem('homev3_selTeacher') || 'einstein');
  const [selPartner, setSelPartner] = useState(() => localStorage.getItem('homev3_selPartner') || 'parrot');
  const [focus, setFocus] = useState<'teacher' | 'partner'>(() => (localStorage.getItem('homev3_focus') as 'teacher' | 'partner') || 'teacher');
  const [slideDir, setSlideDir] = useState<'up' | 'down'>('down');
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [newlyActivated, setNewlyActivated] = useState<string | null>(() => localStorage.getItem('homev3_newlyActivated'));
  const [trialStates, setTrialStates] = useState<Record<string, CharacterState>>({});
  const [purchaseModal, setPurchaseModal] = useState<{ char: Character } | null>(null);
  const [purchasePlan, setPurchasePlan] = useState<'buy' | 'subscribe'>('buy');

  const switchFocus = (target: 'teacher' | 'partner') => {
    if (target !== focus) navigator.vibrate?.(15);
    setSlideDir(target === 'partner' ? 'down' : 'up');
    setFocus(target);
    setFlippedCard(null);
    setFlipOrigin(null);
  };

  const toggleUserMode = () => {
    const next = userMode === 'new' ? 'veteran' : 'new';
    setUserMode(next);
    localStorage.setItem('homev3_userMode', next);
    // Reset all trial/purchase states when switching to new user mode
    if (next === 'new') {
      [...TEACHERS, ...PARTNERS].forEach(c => {
        localStorage.removeItem(`char_trial_${c.id}`);
        localStorage.removeItem(`char_trial_used_${c.id}`);
        localStorage.removeItem(`char_trial_active_${c.id}`);
        localStorage.removeItem(`char_trial_active_${c.id}_start`);
        localStorage.removeItem(`char_purchased_${c.id}`);
      });
      setTrialStates({});
    }
  };

  const [greetingActive, setGreetingActive] = useState(false);
  const [greetingText, setGreetingText] = useState('');
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [engineStatus, setEngineStatus] = useState<Record<number, 'loading' | 'done'>>({
    0: 'loading', // 每月测评
    2: 'loading', // AI计划
  });
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [flipOrigin, setFlipOrigin] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greetingDurationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleTheme = () => { const t = theme === 'dark' ? 'light' : 'dark'; setTheme(t); localStorage.setItem('app_theme', t); };
  useEffect(() => { const s = localStorage.getItem('child_name'); if (s) setChildName(s); }, []);
  useEffect(() => { markActiveDay(); }, []);

  // Persist card selection state
  useEffect(() => { localStorage.setItem('homev3_selTeacher', selTeacher); }, [selTeacher]);
  useEffect(() => { localStorage.setItem('homev3_selPartner', selPartner); }, [selPartner]);
  useEffect(() => { localStorage.setItem('homev3_focus', focus); }, [focus]);

  // Trial timer — ticks every second to update countdown displays
  useEffect(() => {
    const update = () => {
      const states: Record<string, CharacterState> = {};
      [...TEACHERS, ...PARTNERS].forEach(c => { states[c.id] = getCharacterState(c.id); });
      setTrialStates(states);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle newly activated character — switch to partner mode, select the new char, auto-open SpinCard
  useEffect(() => {
    if (!newlyActivated) return;
    const isPartner = PARTNERS.some(p => p.id === newlyActivated);
    if (isPartner) {
      setFocus('partner');
      setSlideDir('down');
      setSelPartner(newlyActivated);
      localStorage.setItem('homev3_selPartner', newlyActivated);
      localStorage.setItem('homev3_focus', 'partner');
    }
    // Auto-open the SpinCard for the new character after landing animation
    const t = setTimeout(() => {
      setFlippedCard(newlyActivated);
      setFlipOrigin({ x: window.innerWidth / 2 - 150, y: window.innerHeight * 0.12, w: 300, h: 420 });
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Clear newlyActivated only when SpinCard is dismissed for that character
  const prevFlippedRef = useRef(flippedCard);
  useEffect(() => {
    const prev = prevFlippedRef.current;
    prevFlippedRef.current = flippedCard;
    // Only clear when transitioning from the new character's card to null (card dismissed)
    if (newlyActivated && prev === newlyActivated && flippedCard === null) {
      setNewlyActivated(null);
      localStorage.removeItem('homev3_newlyActivated');
    }
  }, [flippedCard, newlyActivated]);

  // Close add menu on outside click
  useEffect(() => {
    if (!showAddMenu) return;
    const handler = () => setShowAddMenu(false);
    const timer = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener('click', handler); };
  }, [showAddMenu]);

  // Learning session — begin/end when SpinCard opens/closes for trial characters
  useEffect(() => {
    if (!flippedCard) return;
    const state = getCharacterState(flippedCard);
    // Only start session for characters that can still trial (not expired, not purchased)
    if (state.status === 'trialing' || (state.status === 'locked' && !isTrialExpired(flippedCard))) {
      startTrial(flippedCard);
      beginLearningSession(flippedCard);
      return () => {
        endLearningSession(flippedCard);
      };
    }
  }, [flippedCard]);

  // Engine highlight loading → done transitions
  useEffect(() => {
    const t1 = setTimeout(() => setEngineStatus(prev => ({ ...prev, 0: 'done' })), 4000);
    const t2 = setTimeout(() => setEngineStatus(prev => ({ ...prev, 2: 'done' })), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    setGreetingActive(false);
    [greetingTimerRef, greetingDurationRef].forEach(r => { if (r.current) clearTimeout(r.current); });
    if (!flippedCard || focus !== 'teacher') return;
    const g = GREETINGS[flippedCard];
    if (!g) return;
    greetingTimerRef.current = setTimeout(() => {
      setGreetingText(g[Math.floor(Math.random() * g.length)]);
      setGreetingActive(true);
      greetingDurationRef.current = setTimeout(() => setGreetingActive(false), 4000);
    }, 400);
    return () => { [greetingTimerRef, greetingDurationRef].forEach(r => { if (r.current) clearTimeout(r.current); }); };
  }, [flippedCard, focus]);

  // Wheel debounce
  const wheelLockRef = useRef(false);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    const dy = e.deltaY;
    if (Math.abs(dy) < 20) return;
    wheelLockRef.current = true;
    setTimeout(() => { wheelLockRef.current = false; }, 400);
    if (dy > 0 && focus === 'teacher') switchFocus('partner');
    else if (dy < 0 && focus === 'partner') switchFocus('teacher');
  }, [focus]);

  // Track slide direction for animation
  const prevFocusRef = useRef(focus);
  if (prevFocusRef.current !== focus) {
    prevFocusRef.current = focus;
  }

  // Vertical swipe — unified pointer handler on the strip
  const vTouchRef = useRef({ startY: 0, decided: false });

  const onStripPointerDown = useCallback((e: React.PointerEvent) => {
    vTouchRef.current = { startY: e.clientY, decided: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onStripPointerMove = useCallback((e: React.PointerEvent) => {
    const t = vTouchRef.current;
    if (!t.decided) {
      if (Math.abs(e.clientY - t.startY) > 15) t.decided = true;
    }
  }, []);

  const onStripPointerUp = useCallback((e: React.PointerEvent) => {
    const dy = e.clientY - vTouchRef.current.startY;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (Math.abs(dy) > 30) {
      if (dy < 0 && focus === 'teacher') switchFocus('partner');
      else if (dy > 0 && focus === 'partner') switchFocus('teacher');
    }
  }, [focus]);

  const isT = focus === 'teacher';
  const aT = TEACHERS.find(c => c.id === selTeacher)!;
  const aP = PARTNERS.find(c => c.id === selPartner)!;
  const activeChar = isT ? aT : aP;

  const teacherBg = theme === 'dark' ? '#1a0f05' : '#fef6eb';
  const partnerBg = theme === 'dark' ? '#050d1a' : '#eaf2fe';

  return (
    <div className="h-screen flex flex-col relative overflow-hidden select-none"
      style={{
        background: isT ? teacherBg : partnerBg,
        transition: 'background 0.8s ease',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      onWheel={onWheel}>

      <style>{`
        *::-webkit-scrollbar{display:none!important}
        *{-ms-overflow-style:none!important;scrollbar-width:none!important}
        @keyframes shine{0%,100%{background-position:0% 0%}50%{background-position:100% 100%}}
        @keyframes driftGlow{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
        .glow-drift{animation:driftGlow 20s ease-in-out infinite}
        .glow-drift-alt{animation:driftGlow 25s ease-in-out 5s infinite reverse}
        @keyframes wobble{0%,100%{transform:rotate(0deg)}15%{transform:rotate(3deg)}30%{transform:rotate(-2.5deg)}45%{transform:rotate(2deg)}60%{transform:rotate(-1.5deg)}75%{transform:rotate(1deg)}90%{transform:rotate(-0.5deg)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 20px var(--glow-color, rgba(28,176,246,0.3)), 0 0 40px var(--glow-color, rgba(28,176,246,0.15))}50%{box-shadow:0 0 30px var(--glow-color, rgba(28,176,246,0.5)), 0 0 60px var(--glow-color, rgba(28,176,246,0.25))}}
        @keyframes spinEnter{0%{transform:perspective(800px) rotateY(0deg) scale(0.3)}99.9%{transform:perspective(800px) rotateY(360deg) scale(1)}100%{transform:perspective(800px) rotateY(0deg) scale(1)}}
        .card-wobble{animation:wobble 2s ease-in-out infinite}
        .card-glow{animation:glowPulse 2s ease-in-out infinite}
        .spin-card-enter{animation:spinEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)}
        @keyframes engineLive{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.85)}}
        .engine-live{animation:engineLive 2s ease-in-out infinite}
      `}</style>

      {/* BG glow — strong, mode-specific */}
      <div className="absolute inset-0 pointer-events-none glow-drift" style={{
        background: theme === 'dark'
          ? `radial-gradient(ellipse 90% 70% at 40% 40%, ${activeChar.color}35 0%, transparent 70%),
             radial-gradient(ellipse 70% 60% at 65% 55%, ${activeChar.color}15 0%, transparent 60%)`
          : `radial-gradient(ellipse 90% 70% at 40% 40%, ${activeChar.color}25 0%, transparent 70%),
             radial-gradient(ellipse 70% 60% at 65% 55%, ${activeChar.color}12 0%, transparent 60%)`,
        transition: 'background 0.8s',
      }} />
      <div className="absolute inset-0 pointer-events-none glow-drift-alt" style={{
        background: theme === 'dark'
          ? `radial-gradient(ellipse 60% 50% at 70% 30%, ${activeChar.color}20 0%, transparent 65%),
             radial-gradient(ellipse 50% 40% at 20% 70%, ${activeChar.color}15 0%, transparent 60%)`
          : `radial-gradient(ellipse 60% 50% at 70% 30%, ${activeChar.color}15 0%, transparent 65%),
             radial-gradient(ellipse 50% 40% at 20% 70%, ${activeChar.color}10 0%, transparent 60%)`,
        transition: 'background 0.8s',
      }} />
      {/* Active character center glow — follows the card */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse 50% 40% at 50% 50%, ${activeChar.color}60 0%, ${activeChar.color}25 35%, transparent 70%)`,
        }}
        transition={{ duration: 0.6 }}
        style={{ filter: 'blur(4px)' }} />
      {/* Card position highlight ring */}
      <motion.div className="absolute pointer-events-none"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 220,
          height: 300,
          borderRadius: '2rem',
          background: `radial-gradient(ellipse at center, ${activeChar.color}30 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }} />
      {/* Additional top corner glow */}
      <div className="absolute inset-0 pointer-events-none glow-float-slow" style={{
        background: theme === 'dark'
          ? `radial-gradient(ellipse 35% 25% at 15% 15%, rgba(255,215,0,0.15) 0%, transparent 60%),
             radial-gradient(ellipse 30% 20% at 85% 80%, rgba(0,255,200,0.12) 0%, transparent 55%)`
          : `radial-gradient(ellipse 35% 25% at 15% 15%, rgba(255,215,0,0.1) 0%, transparent 60%),
             radial-gradient(ellipse 30% 20% at 85% 80%, rgba(0,255,200,0.08) 0%, transparent 55%)`,
      }} />

      {/* ===== HEADER ===== */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative z-20 flex-shrink-0 px-6"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top, 0px))', paddingBottom: 4 }}>
        <div className="flex items-start justify-between">
          <div>
            {/* Mode indicator */}
            <motion.div
              layout
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-1.5"
              style={{
                background: `${activeChar.color}20`,
                border: `1px solid ${activeChar.color}30`,
              }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" animate={{ background: activeChar.color }} />
              <span className="text-[10px] font-bold" style={{ color: activeChar.color }}>
                {isT ? 'AI 老师' : 'AI 伙伴'}
              </span>
            </motion.div>
            {/* Shared learning progress badge */}
            {(() => {
              const progress = getLearningProgress();
              if (progress.wordsLearned === 0 && progress.streakDays === 0) return null;
              return (
                <div className="inline-flex items-center gap-2 mb-1.5 ml-2">
                  {progress.wordsLearned > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(88,204,2,0.12)', color: '#58CC02' }}>
                      📖 {progress.wordsLearned}词
                    </span>
                  )}
                  {progress.streakDays > 1 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,149,0,0.12)', color: '#FF9500' }}>
                      🔥 {progress.streakDays}天连续
                    </span>
                  )}
                </div>
              );
            })()}
            <h1 className={`text-[20px] font-extrabold leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {getGreeting()}，{childName}
            </h1>
            <p className={`text-[11px] mt-0.5 ${theme === 'dark' ? 'text-white/30' : 'text-gray-500'}`}>
              {isT ? '↑ 上滑切换到小伙伴' : '↓ 下滑切换到 AI 老师'}
            </p>
          </div>
          <div className="flex items-center gap-2 relative">
            <motion.button whileTap={{ scale: 0.85 }} onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowAddMenu(!showAddMenu)}
              className="h-9 px-3 rounded-full flex items-center gap-1.5 relative"
              style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
              <UserPlus className="w-4 h-4" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
              <span className="text-[11px] font-bold" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>添加角色</span>
              <ChevronDown className="w-3 h-3" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', transform: showAddMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </motion.button>
            <AnimatePresence>
              {showAddMenu && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: theme === 'dark' ? 'rgba(28,28,40,0.95)' : 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: theme === 'dark' ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.12)',
                  }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowAddMenu(false); navigate('/activate'); }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left">
                    <Wifi className="w-4 h-4" style={{ color: '#E87040', transform: 'rotate(90deg)' }} />
                    <div>
                      <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>激活角色</p>
                      <p className={`text-[10px] ${theme === 'dark' ? 'text-white/35' : 'text-gray-400'}`}>扫描卡片激活新伙伴</p>
                    </div>
                  </motion.button>
                  <div style={{ height: 1, background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowAddMenu(false); navigate('/shop'); }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left">
                    <ShoppingBag className="w-4 h-4" style={{ color: '#AF57DB' }} />
                    <div>
                      <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>角色商城</p>
                      <p className={`text-[10px] ${theme === 'dark' ? 'text-white/35' : 'text-gray-400'}`}>探索更多角色图鉴</p>
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

  {/* ===== FROSTED BACKDROP (when card is flipped) ===== */}
  <AnimatePresence>
    {flippedCard && (
      <motion.div key="frost-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-30"
        style={{
          background: theme === 'dark' ? 'rgba(5,5,10,0.7)' : 'rgba(240,240,245,0.7)',
          backdropFilter: 'blur(20px) saturate(1.2)', WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        }}
        onClick={() => { setFlippedCard(null); setFlipOrigin(null); }}
      />
    )}
  </AnimatePresence>

  {/* ===== EXPANDED CARD — 360° spin from origin to center ===== */}
  <AnimatePresence>
    {flippedCard && flipOrigin && (() => {
      const allChars = [...TEACHERS, ...PARTNERS];
      const fc = allChars.find(c => c.id === flippedCard);
      if (!fc) return null;
      const isTeacherChar = TEACHERS.some(t => t.id === flippedCard);
      return (
        <SpinCard key="spin-card" char={fc} origin={flipOrigin} theme={theme}
          onDismiss={() => { setFlippedCard(null); setFlipOrigin(null); }}
          trialState={flippedCard ? getCharacterState(flippedCard) : undefined}
          actions={isTeacherChar ? [
            { label: '一起学习', icon: <BookOpen className="w-4 h-4" />, onClick: () => { if (flippedCard) addBondExp(flippedCard, 10); setFlippedCard(null); setFlipOrigin(null); navigate('/lessons'); } },
            { label: '十万个为什么', icon: <HelpCircle className="w-4 h-4" />, onClick: () => { if (flippedCard) addBondExp(flippedCard, 10); setFlippedCard(null); setFlipOrigin(null); navigate(`/why?teacher=${flippedCard}`); } },
          ] : [
            { label: '一起冒险', icon: <Sparkles className="w-4 h-4" />, onClick: () => { if (flippedCard) addBondExp(flippedCard, 10); setFlippedCard(null); setFlipOrigin(null); navigate('/adventure'); } },
            { label: '一起玩耍', icon: <Users className="w-4 h-4" />, onClick: () => { if (flippedCard) addBondExp(flippedCard, 10); setFlippedCard(null); setFlipOrigin(null); navigate('/ai-parrot'); } },
          ]}
        />
      );
    })()}
  </AnimatePresence>

  {/* ===== VERTICAL SWIPE ZONE (right edge) ===== */}
  <div className="fixed right-0 top-0 bottom-0 z-40 pointer-events-auto"
    style={{ width: 64, touchAction: 'none' }}
    onPointerDown={onStripPointerDown}
    onPointerMove={onStripPointerMove}
    onPointerUp={onStripPointerUp}
    onPointerCancel={onStripPointerUp}>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
      <motion.div className="w-1 h-8 rounded-full"
        animate={{ background: isT ? aT.color : 'rgba(255,255,255,0.08)', opacity: isT ? 0.6 : 0.2 }}
        transition={{ duration: 0.3 }} />
      <motion.div className="w-1 h-8 rounded-full"
        animate={{ background: !isT ? aP.color : 'rgba(255,255,255,0.08)', opacity: !isT ? 0.6 : 0.2 }}
        transition={{ duration: 0.3 }} />
    </div>
  </div>

      {/* ===== THREE ZONES ===== */}
      <div className="flex-1 min-h-0 relative z-10 flex flex-col">

        {/* TOP zone — teachers behind (only when partner is in front) */}
        <motion.div className="flex-shrink-0 flex items-end justify-center overflow-hidden"
          animate={{
            height: isT ? '0%' : '16%',
            opacity: isT ? 0 : 0.4,
            scale: isT ? 0.85 : 0.95,
            y: isT ? -20 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ borderBottom: isT ? 'none' : '1px solid rgba(255,255,255,0.04)', transformStyle: 'preserve-3d' }}>
          <BackRow chars={TEACHERS} selectedId={selTeacher} theme={theme} trialStates={trialStates} />
        </motion.div>

        {/* MIDDLE zone — front cards */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-2 overflow-visible">
          {/* Greeting bubble */}
          <AnimatePresence>
            {greetingActive && isT && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                transition={{ type: 'tween', duration: 0.2 }}
                className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{ top: '10%' }}>
                <div className="rounded-2xl px-4 py-2.5 text-center max-w-[180px]"
                  style={{
                    background: theme === 'dark' ? 'rgba(20,20,30,0.92)' : 'rgba(255,255,255,0.95)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                    boxShadow: theme === 'dark' ? `0 4px 20px rgba(0,0,0,0.4), 0 0 30px ${activeChar.color}15` : `0 4px 20px rgba(0,0,0,0.1)`,
                  }}>
                  <p className="text-[11px] font-medium leading-relaxed"
                    style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)' }}>{greetingText}</p>
                </div>
                <div className="w-2.5 h-2.5 mx-auto rotate-45 -mt-1.5"
                  style={{ background: theme === 'dark' ? 'rgba(20,20,30,0.92)' : 'rgba(255,255,255,0.95)',
                    borderRight: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                    borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}` }} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={focus}
                initial={{ y: slideDir === 'down' ? 60 : -60, opacity: 0, rotateX: slideDir === 'down' ? -8 : 8, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
                exit={{ y: slideDir === 'down' ? -60 : 60, opacity: 0, rotateX: slideDir === 'down' ? 12 : -12, scale: 0.95 }}
                transition={{
                  y: { type: 'spring', stiffness: 280, damping: 28 },
                  opacity: { duration: 0.25 },
                  rotateX: { type: 'spring', stiffness: 200, damping: 25 },
                  scale: { type: 'spring', stiffness: 250, damping: 26 },
                }}
                style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
                className="w-full">
                <FrontRow chars={isT ? TEACHERS : PARTNERS} selectedId={isT ? selTeacher : selPartner}
                  onSelect={isT ? setSelTeacher : setSelPartner} theme={theme}
                  flippedCard={flippedCard} onFlipCard={(id, rect) => { setFlippedCard(id); setFlipOrigin(rect || null); }}
                  onAdd={() => navigate('/shop')}
                  newlyActivated={newlyActivated}
                  trialStates={trialStates}
                  veteranMode={userMode === 'veteran'}
                  onVerticalSwipe={(dir) => {
                     if (dir === 'up' && focus === 'teacher') switchFocus('partner');
                     else if (dir === 'down' && focus === 'partner') switchFocus('teacher');
                   }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM zone — partners behind (only when teacher is in front) */}
        <motion.div className="flex-shrink-0 flex items-start justify-center overflow-hidden"
          animate={{
            height: !isT ? '0%' : '16%',
            opacity: !isT ? 0 : 0.4,
            scale: !isT ? 0.85 : 0.95,
            y: !isT ? 20 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ borderTop: !isT ? 'none' : '1px solid rgba(255,255,255,0.04)', transformStyle: 'preserve-3d' }}>
          <BackRow chars={PARTNERS} selectedId={selPartner} theme={theme} trialStates={trialStates} />
        </motion.div>
      </div>

      {/* ===== ENGINE HIGHLIGHTS — 4 selling points ===== */}
      {!flippedCard && (
      <div className="flex-shrink-0 relative z-30 px-4 pb-2">
        <div className="flex gap-2">
          {ENGINE_HIGHLIGHTS.map((h, i) => {
            const status = engineStatus[i];
            const isLoading = status === 'loading';
            const isDone = status === 'done';
            return (
            <motion.button key={i} whileTap={{ scale: 0.96 }} onClick={() => setActiveHighlight(i)}
              className="flex-1 rounded-2xl p-2.5 flex flex-col items-center gap-1 text-center cursor-pointer"
              style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              }}>
              <span className="text-base">{h.icon}</span>
              <span className="text-[9px] leading-tight" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>{h.label}</span>
              <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: h.color }}>
                {isLoading ? (
                  <motion.span className="inline-flex items-center gap-1">
                    <motion.span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: h.color }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>分析中</span>
                  </motion.span>
                ) : isDone ? (
                  <motion.span className="inline-flex items-center gap-1"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke={h.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }} />
                    </svg>
                    {h.value}
                  </motion.span>
                ) : (
                  <>{h.value}<span className="inline-block w-1.5 h-1.5 rounded-full engine-live" style={{ background: h.color }} /></>
                )}
              </span>
            </motion.button>
            );
          })}
        </div>
      </div>
      )}

      {/* ===== BOTTOM BAR — Liquid Glass with mode tint ===== */}
      <div className="flex-shrink-0 relative z-20"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))', paddingTop: 10,
          background: theme === 'dark'
            ? `linear-gradient(180deg, ${activeChar.color}08 0%, ${activeChar.color}15 50%, ${activeChar.color}08 100%)`
            : `linear-gradient(180deg, ${activeChar.color}08 0%, ${activeChar.color}12 50%, ${activeChar.color}08 100%)`,
          backdropFilter: 'blur(40px) saturate(1.8)', WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          borderTop: `1px solid ${activeChar.color}30`,
          boxShadow: theme === 'dark'
            ? `inset 0 1px 0 ${activeChar.color}15, inset 0 -1px 0 rgba(0,0,0,0.2), 0 -8px 32px ${activeChar.color}10`
            : `inset 0 1px 0 ${activeChar.color}20, inset 0 -1px 0 rgba(0,0,0,0.05), 0 -8px 32px ${activeChar.color}10`,
          transition: 'background 0.8s ease, border-color 0.8s ease, box-shadow 0.8s ease',
        }}>
        {/* Liquid glass highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
        <div className="px-5">
          <div className="flex items-center gap-2 mb-2.5">
            <motion.div className="w-2 h-2 rounded-full flex-shrink-0" animate={{ background: activeChar.color }} />
            <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>
              {activeChar.name}
              <span className="text-[10px] font-normal ml-1.5" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>{activeChar.subtitle}</span>
            </p>
          </div>
          <div className="flex gap-3">
            {isT ? (
              <>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { addBondExp(activeChar.id, 10); navigate('/lessons'); }}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${activeChar.color}, ${activeChar.color}CC)`,
                    boxShadow: `0 8px 32px ${activeChar.color}40`, color: 'white', minHeight: 48,
                  }}>
                  <BookOpen className="w-4 h-4" /> 一起学习
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { addBondExp(activeChar.id, 10); navigate(`/why?teacher=${selTeacher}`); }}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: `${activeChar.color}15`,
                    color: theme === 'dark' ? 'white' : '#1f2937',
                    border: `2px solid ${activeChar.color}50`,
                    boxShadow: `0 0 20px ${activeChar.color}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
                    minHeight: 48,
                  }}>
                  <HelpCircle className="w-4 h-4" /> 十万个为什么
                </motion.button>
              </>
            ) : (
              <>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { addBondExp(activeChar.id, 10); navigate('/adventure'); }}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${activeChar.color}, ${activeChar.color}CC)`,
                    boxShadow: `0 8px 32px ${activeChar.color}40`, color: 'white', minHeight: 48,
                  }}>
                  <Sparkles className="w-4 h-4" /> 一起冒险
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { addBondExp(activeChar.id, 10); navigate('/ai-parrot'); }}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: `${activeChar.color}15`,
                    color: theme === 'dark' ? 'white' : '#1f2937',
                    border: `2px solid ${activeChar.color}50`,
                    boxShadow: `0 0 20px ${activeChar.color}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
                    minHeight: 48,
                  }}>
                  <Users className="w-4 h-4" /> 一起玩耍
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== HIGHLIGHT MODAL ===== */}
      <AnimatePresence>
        {activeHighlight !== null && (() => {
          const h = ENGINE_HIGHLIGHTS[activeHighlight];
          const d = h.detail;
          return (
            <motion.div key="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end justify-center" onClick={() => setActiveHighlight(null)}>
              <div className="absolute inset-0 bg-black/30" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-t-3xl overflow-hidden pb-8"
                style={{ background: theme === 'dark' ? '#1a1a2e' : '#ffffff', boxShadow: `0 -4px 0 ${theme === 'dark' ? '#333' : '#E5E7EB'}` }}>
                <div className="p-5 pb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: `${h.color}18`, border: `2px solid ${h.color}30` }}>
                    <span className="text-2xl">{h.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-extrabold" style={{ color: theme === 'dark' ? 'white' : '#1f2937' }}>{d.title}</h3>
                    <p className="text-xs" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>{d.subtitle}</p>
                  </div>
                  <button onClick={() => setActiveHighlight(null)} className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                    <X className="w-4 h-4" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                  </button>
                </div>
                <div className="px-5 mb-4">
                  <div className="px-4 py-2.5 rounded-2xl text-xs font-bold"
                    style={{ background: `${h.color}12`, color: h.color, border: `2px solid ${h.color}25` }}>
                    {d.status}
                  </div>
                </div>
                <div className="px-5 mb-4">
                  <p className="text-sm font-extrabold mb-1.5" style={{ color: theme === 'dark' ? 'white' : '#1f2937' }}>{d.letter}</p>
                  <p className="text-xs leading-relaxed" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>{d.letterBody}</p>
                </div>
                <div className="px-5 mb-5">
                  <p className="text-sm font-extrabold mb-3" style={{ color: theme === 'dark' ? 'white' : '#1f2937' }}>📊 核心指标预览</p>
                  <div className="grid grid-cols-3 gap-3">
                    {d.metrics.map((m, i) => (
                      <div key={i} className="rounded-2xl p-3 text-center" style={{ background: `${m.color}12`, border: `2px solid ${m.color}20` }}>
                        <p className="text-xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
                        <p className="text-[10px] font-bold mt-0.5" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-5">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveHighlight(null)}
                    className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                    style={{ background: h.color, boxShadow: `0 4px 16px ${h.color}40` }}>
                    知道了
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ===== PURCHASE MODAL — Story-driven ===== */}
      <AnimatePresence>
        {purchaseModal && (() => {
          const c = purchaseModal.char;
          const story = CHARACTER_STORIES[c.id] || '这个角色正等着和你一起冒险！';
          const isBuy = purchasePlan === 'buy';
          return (
            <motion.div key="purchase-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end justify-center" onClick={() => setPurchaseModal(null)}>
              <div className="absolute inset-0 bg-black/40" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-t-3xl overflow-hidden pb-8"
                style={{ background: theme === 'dark' ? '#12121A' : '#ffffff', boxShadow: `0 -4px 0 ${theme === 'dark' ? '#333' : '#E5E7EB'}` }}>

                {/* Section 1: Character Story */}
                <div className="relative px-5 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: `${c.color}18`, border: `2px solid ${c.color}30` }}>
                      <span className="text-2xl">✨</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-extrabold" style={{ color: theme === 'dark' ? 'white' : '#1f2937' }}>{c.name}</h3>
                      <p className="text-xs" style={{ color: c.color }}>{c.subtitle}</p>
                    </div>
                    <button onClick={() => setPurchaseModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                      <X className="w-4 h-4" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                    </button>
                  </div>
                  <div className="rounded-2xl px-4 py-3"
                    style={{ background: `${c.color}08`, border: `1px solid ${c.color}15` }}>
                    <p className="text-sm leading-relaxed" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)' }}>
                      "{story}"
                    </p>
                  </div>
                </div>

                {/* Section 2: Pricing Options */}
                <div className="px-5 mb-4">
                  <p className="text-xs font-bold mb-3" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>选择解锁方式</p>
                  <div className="flex gap-3">
                    {/* Buy option */}
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => setPurchasePlan('buy')}
                      className="flex-1 rounded-2xl p-3.5 text-left relative"
                      style={{
                        background: isBuy ? `${c.color}12` : theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: `2px solid ${isBuy ? `${c.color}60` : theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      }}>
                      {isBuy && <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: c.color }}><Check className="w-2.5 h-2.5 text-white" strokeWidth={3} /></div>}
                      <p className="text-xl font-extrabold mb-0.5" style={{ color: c.color }}>¥49</p>
                      <p className="text-[10px] font-bold mb-1.5" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>永久买断</p>
                      <div className="space-y-1">
                        <p className="text-[9px]" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 永久解锁该角色</p>
                        <p className="text-[9px]" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 赠送实体角色卡片</p>
                        <p className="text-[9px]" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 独立情感羁绊</p>
                      </div>
                    </motion.button>
                    {/* Subscribe option */}
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => setPurchasePlan('subscribe')}
                      className="flex-1 rounded-2xl p-3.5 text-left relative"
                      style={{
                        background: !isBuy ? '#AF57DB12' : theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: `2px solid ${!isBuy ? '#AF57DB60' : theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      }}>
                      {!isBuy && <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: '#AF57DB' }}><Check className="w-2.5 h-2.5 text-white" strokeWidth={3} /></div>}
                      <div className="flex items-baseline gap-1 mb-0.5">
                        <p className="text-xl font-extrabold" style={{ color: '#AF57DB' }}>¥79</p>
                        <span className="text-[10px] font-bold" style={{ color: '#AF57DB' }}>/月</span>
                      </div>
                      <p className="text-[10px] font-bold mb-1.5" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>连续包月</p>
                      <div className="space-y-1">
                        <p className="text-[9px]" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 月度自动续订解锁</p>
                        <p className="text-[9px] font-bold" style={{ color: '#AF57DB' }}>✓ 送实体角色玩具/卡片</p>
                        <p className="text-[9px]" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 独立情感羁绊</p>
                        <p className="text-[9px]" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>✓ 持续内容更新</p>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Section 3: CTA */}
                <div className="px-5">
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (isBuy) purchaseCharacter(c.id);
                      else subscribeCharacter(c.id);
                      setPurchaseModal(null);
                    }}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
                    style={{
                      background: isBuy ? `linear-gradient(135deg, ${c.color}, ${c.color}CC)` : 'linear-gradient(135deg, #AF57DB, #9035C0)',
                      boxShadow: isBuy ? `0 8px 32px ${c.color}40` : '0 8px 32px rgba(175,87,219,0.4)',
                    }}>
                    {isBuy ? `¥49 永久解锁 ${c.name}` : `¥79/月 连续包月 ${c.name}`}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Mode toggle — always visible */}
      <motion.button
        className="fixed z-[100] flex items-center gap-1 px-2 py-1 rounded-full"
        style={{
          bottom: 'max(100px, env(safe-area-inset-bottom, 80px))',
          left: 12,
          background: 'rgba(20,20,30,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
        }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleUserMode}
      >
        <span className="text-[8px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {userMode === 'new' ? '重置为新用户' : '切换新用户'}
        </span>
      </motion.button>
    </div>
  );
}
