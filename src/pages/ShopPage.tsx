import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Lock, BookOpen, Heart, Zap, X, Sun, Moon } from 'lucide-react';
import ParrotCharacter from '@/components/ParrotCharacter';
import FoxCharacter from '@/components/FoxCharacter';
import OlafCharacter from '@/components/OlafCharacter';

interface Character {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  personality: string;
  color: string;
  unlocked: boolean;
  skills: string[];
  component: React.ReactNode;
}

const CHARACTERS: Character[] = [
  {
    id: 'parrot', name: '小鹦鹉', subtitle: '你的学习伙伴',
    description: '聪明伶俐的小鹦鹉，喜欢和你一起学习新单词，每次答对都会开心地拍拍翅膀。它会用有趣的方式教你发音，让学习变得轻松愉快。',
    personality: '活泼、聪明、爱模仿',
    color: '#1CB0F6', unlocked: true,
    skills: ['发音教学', '单词记忆', '情景对话'],
    component: <ParrotCharacter state="idle" size={0.8} />,
  },
  {
    id: 'fox', name: '小狐狸', subtitle: '爱冒险的好奇宝宝',
    description: '勇敢的小狐狸，热爱探索未知的世界，会带你去发现英语的奇妙冒险。它总能找到学习中最有趣的部分，让每一次学习都充满惊喜。',
    personality: '勇敢、好奇、富有冒险精神',
    color: '#E87040', unlocked: true,
    skills: ['冒险故事', '探索发现', '勇气培养'],
    component: <FoxCharacter state="idle" size={0.8} />,
  },
  {
    id: 'olaf', name: '雪宝', subtitle: '温暖的雪人朋友',
    description: '来自冰雪世界的可爱雪人，虽然怕热但内心温暖。他会用独特的视角教你英语，让学习充满欢笑和惊喜。',
    personality: '温暖、乐观、充满好奇心',
    color: '#38BDF8', unlocked: true,
    skills: ['情景对话', '情感表达', '文化探索'],
    component: <OlafCharacter size={0.9} />,
  },
  {
    id: 'cat', name: '小猫咪', subtitle: '有艺术天赋的小可爱',
    description: '温柔的小猫咪，擅长用歌声教你英语，让学习变成一场音乐会。它会创作简单的英语歌曲，帮助你记住复杂的单词和句子。',
    personality: '温柔、艺术、富有创造力',
    color: '#FF6B9D', unlocked: false,
    skills: ['英语歌曲', '艺术创作', '情感表达'],
    component: <div className="text-8xl opacity-30">🐱</div>,
  },
  {
    id: 'rabbit', name: '小兔子', subtitle: '爱问为什么的小科学家',
    description: '好奇的小兔子，总是问"为什么"，会和你一起探索英语背后的奥秘。它会用实验和观察的方式，让你理解语言的规律。',
    personality: '好奇、理性、善于思考',
    color: '#58CC02', unlocked: false,
    skills: ['科学探索', '逻辑思维', '问题解决'],
    component: <div className="text-8xl opacity-30">🐰</div>,
  },
];

export default function ShopPage() {
  const navigate = useNavigate();
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [columns, setColumns] = useState(2);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark';
  });
  const unlockedCount = CHARACTERS.filter(c => c.unlocked).length;

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 400) setColumns(2);
      else if (width < 600) setColumns(2);
      else if (width < 900) setColumns(3);
      else setColumns(4);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Listen for theme changes from other pages
  useEffect(() => {
    const handleStorage = () => {
      const savedTheme = localStorage.getItem('app_theme') as 'dark' | 'light';
      if (savedTheme) setTheme(savedTheme);
    };
    window.addEventListener('storage', handleStorage);
    // Also poll for changes since storage event only fires in other tabs
    const interval = setInterval(() => {
      const savedTheme = localStorage.getItem('app_theme') as 'dark' | 'light';
      if (savedTheme && savedTheme !== theme) setTheme(savedTheme);
    }, 500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [theme]);

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050508]' : 'bg-gray-50'}`}>
      {/* Background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: theme === 'dark' ? [
            'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168,85,247,0.1) 0%, transparent 55%)',
            'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(168,85,247,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 70% 60%, rgba(59,130,246,0.1) 0%, transparent 55%)',
            'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168,85,247,0.1) 0%, transparent 55%)',
          ] : [
            'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168,85,247,0.05) 0%, transparent 55%)',
            'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(168,85,247,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 70% 60%, rgba(59,130,246,0.05) 0%, transparent 55%)',
            'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168,85,247,0.05) 0%, transparent 55%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: theme === 'dark' ? `
          linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
        ` : `
          linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />

      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-5 pt-12 pb-2 z-30 relative">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate('/home-v3')}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
          <ChevronLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`} />
        </motion.button>
        <h1 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white/80' : 'text-gray-800'}`}>角色图鉴</h1>
        <div className="w-10" />
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-8">
        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between mb-6 px-4 py-3 rounded-2xl ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-black/5 border border-black/5'}`}>
          <div className="flex items-center gap-2">
            <BookOpen className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
            <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>收集进度</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {CHARACTERS.slice(0, unlockedCount).map((c, i) => (
                <div key={i} className={`w-5 h-5 rounded-full ${theme === 'dark' ? 'border-[#050508]' : 'border-gray-50'}`}
                  style={{ background: c.color, border: '2px solid' }} />
              ))}
            </div>
            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{unlockedCount}/{CHARACTERS.length}</span>
          </div>
        </motion.div>

        {/* Character Grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {CHARACTERS.map((char, idx) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedChar(char)}
              className={`relative rounded-3xl overflow-hidden cursor-pointer transition-transform duration-200`}
              style={{
                background: char.unlocked 
                  ? theme === 'dark' 
                    ? `linear-gradient(180deg, ${char.color}20, ${char.color}08)`
                    : `linear-gradient(180deg, ${char.color}18, rgba(255,255,255,0.95))`
                  : theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
                border: `1.5px solid ${char.unlocked 
                  ? char.color + '60' 
                  : (theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)')}`,
                boxShadow: char.unlocked 
                  ? `0 4px 20px ${char.color}15, inset 0 1px 0 rgba(255,255,255,${theme === 'dark' ? '0.05' : '0.5'})`
                  : 'none',
                opacity: char.unlocked ? 1 : 0.6,
              }}
            >
              {/* Owned badge */}
              {char.unlocked && (
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[8px] font-bold"
                  style={{ background: `${char.color}30`, color: char.color, border: `1px solid ${char.color}40` }}>
                  已拥有
                </div>
              )}
              {/* Character */}
              <div className="h-40 flex items-center justify-center pt-4 pb-2 relative">
                <div className="scale-90">
                  {char.component}
                </div>
                {!char.unlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: theme === 'dark' ? 'rgba(5,5,8,0.85)' : 'rgba(255,255,255,0.85)' }}>
                    <Lock className={`w-6 h-6 mb-1 ${theme === 'dark' ? 'text-white/25' : 'text-gray-400'}`} />
                    <span className={`text-[10px] ${theme === 'dark' ? 'text-white/30' : 'text-gray-500'}`}>未解锁</span>
                  </div>
                )}
              </div>

              {/* Name & Info */}
              <div className="px-2 pb-3 pt-1">
                <p className="text-xs font-bold text-center" style={{ color: char.unlocked ? (theme === 'dark' ? 'white' : '#1f2937') : 'rgba(128,128,128,0.3)' }}>
                  {char.name}
                </p>
                <p className="text-[9px] text-center mt-0.5" style={{ color: char.unlocked ? (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)') : 'rgba(128,128,128,0.15)' }}>
                  {char.subtitle}
                </p>
                
                {/* Skills tags */}
                {char.unlocked && (
                  <div className="flex flex-wrap gap-1 mt-2 justify-center">
                    {char.skills.slice(0, 2).map((skill, i) => (
                      <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${char.color}20`, color: char.color }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom hint */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className={`text-center text-[11px] mt-6 ${theme === 'dark' ? 'text-white/25' : 'text-gray-400'}`}>
          购买实体卡片解锁更多角色
        </motion.p>
      </div>

      {/* Character Detail Modal */}
      <AnimatePresence>
        {selectedChar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            onClick={() => setSelectedChar(null)}
          >
            <div className="absolute inset-0" style={{ background: theme === 'dark' ? '#050508' : '#f9fafb' }} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden"
              style={{
                background: theme === 'dark'
                  ? `linear-gradient(135deg, ${selectedChar.color}30, #0f0f1a)`
                  : `linear-gradient(135deg, ${selectedChar.color}20, #ffffff)`,
                border: `1.5px solid ${selectedChar.color}40`,
                boxShadow: `0 20px 60px ${selectedChar.color}30`,
              }}
            >
              {/* Close button */}
              <button onClick={() => setSelectedChar(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
                style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <X className={`w-4 h-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`} />
              </button>

              {/* Header with gradient */}
              <div className="relative pt-8 pb-4 px-6"
                style={{ background: `linear-gradient(135deg, ${selectedChar.color}20, transparent)` }}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{ background: `${selectedChar.color}20` }}>
                    <div style={{ transform: 'scale(0.55)', transformOrigin: 'center' }}>
                      {selectedChar.component}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedChar.name}</h2>
                    <p className="text-sm" style={{ color: `${selectedChar.color}` }}>{selectedChar.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-4">
                {/* Personality */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4" style={{ color: selectedChar.color }} />
                    <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>性格特点</span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>{selectedChar.personality}</p>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" style={{ color: selectedChar.color }} />
                    <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>角色故事</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>{selectedChar.description}</p>
                </div>

                {/* Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" style={{ color: selectedChar.color }} />
                    <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>专属技能</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedChar.skills.map((skill, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ background: `${selectedChar.color}20`, color: selectedChar.color }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                {selectedChar.unlocked ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedChar(null);
                      navigate('/home-v3');
                    }}
                    className="w-full py-4 rounded-2xl font-bold text-white text-sm mt-4"
                    style={{
                      background: `linear-gradient(135deg, ${selectedChar.color}, ${selectedChar.color}CC)`,
                      boxShadow: `0 8px 24px ${selectedChar.color}40`,
                    }}
                  >
                    开始互动
                  </motion.button>
                ) : (
                  <div className={`w-full py-4 rounded-2xl font-bold text-sm text-center mt-4 ${theme === 'dark' ? 'bg-white/5 text-white/30' : 'bg-black/5 text-gray-400'}`}>
                    购买实体卡片解锁
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
