import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import FoxCharacter from '@/components/FoxCharacter';
import ParrotCharacter from '@/components/ParrotCharacter';

// AI Tutor images
import imgTutor1 from '@/assets/18466f7d75c7f0003c756fab4f226f5acaf0b786.webp';
import imgTutor2 from '@/assets/1ebf0cda2cde974b5ed9ae6990f1305cc10602a8.webp';
import imgTutor3 from '@/assets/aeb3bf3332ef650a0757436b3785006b754ee466.webp';

// AI Partner images
import imgPartner1 from '@/assets/5beb9546513432ce9c4c07c79c92908956d92ffb.webp';
import imgPartner2 from '@/assets/5f34b76305073c932c45e9a1ca6982a3b0701c51.webp';
import imgPartner3 from '@/assets/7f5840355d80debdd7cbea5b1b0cfcd8797475cf.webp';
import imgPartner4 from '@/assets/865cc265587e2b67df878968a8f421d99f400e41.webp';
import imgPartner5 from '@/assets/9ace1b69d6a8cf0749e3bc5affa90c3f4b1856da.webp';
import imgPartner6 from '@/assets/adc9f9dc90a165002cdfaac86d27cb447763afc7.webp';

const mainCharacters = [
  { id: 'parrot' as const, name: '小鹦鹉', desc: 'AI学习伙伴', color: '#1CB0F6', emoji: '🦜' },
  { id: 'fox' as const, name: '小狐狸', desc: 'AI学习伙伴', color: '#E87040', emoji: '🦊' },
];

const teachers = [
  { id: 1, name: '小鹿姐姐', role: '幼儿教育专家', image: imgTutor3, skills: '行为引导·自我认知·情绪管理', color: '#FF6B9D' },
  { id: 2, name: '贝多芬β', role: '音乐家', image: imgTutor1, skills: '乐器启蒙·儿歌韵律', color: '#1CB0F6' },
  { id: 3, name: '爱因斯坦α', role: '科学家', image: imgTutor2, skills: '恐龙·动植物·太空探索', color: '#58CC02' },
];

const partners = [
  { name: 'Bull', subtitle: '巴西', image: imgPartner5, flag: '🇧🇷' },
  { name: 'Bred', subtitle: '中东', image: imgPartner4, flag: '🕌' },
  { name: 'Allen', subtitle: '美国', image: imgPartner2, flag: '🇺🇸' },
  { name: 'Coco', subtitle: '小鹦鹉', image: imgPartner6, flag: '🦜' },
  { name: 'Harry', subtitle: '英国', image: imgPartner3, flag: '🇬🇧' },
  { name: 'Xizi', subtitle: '日本', image: imgPartner1, flag: '🇯🇵' },
];

export default function CharacterSelect() {
  const navigate = useNavigate();
  const [selectedChar, setSelectedChar] = useState<'parrot' | 'fox'>(() => {
    return (localStorage.getItem('selected_character') as 'parrot' | 'fox') || 'parrot';
  });

  const handleSelectChar = (id: 'parrot' | 'fox') => {
    setSelectedChar(id);
    localStorage.setItem('selected_character', id);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-page)' }}>
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto pb-32">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-8 pb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/ai-parrot')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-foreground">选择角色</h1>
            <p className="text-xs text-muted-foreground">选一个AI伙伴或老师开始对话</p>
          </div>
        </div>

        {/* Main Character Switcher */}
        <div className="px-5 mb-6">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-base">🌟</span> 我的AI伙伴
          </h2>
          <div className="flex gap-4">
            {mainCharacters.map((c) => {
              const isActive = selectedChar === c.id;
              return (
                <motion.button
                  key={c.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectChar(c.id)}
                  className="flex-1 rounded-2xl overflow-hidden relative"
                  style={{
                    border: `3px solid ${isActive ? c.color : 'transparent'}`,
                    boxShadow: isActive ? `0 4px 20px ${c.color}30` : '0 2px 10px rgba(0,0,0,0.05)',
                    background: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-10"
                      style={{ background: c.color }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  )}
                  <div className="pt-4 pb-2 flex justify-center">
                    {c.id === 'parrot' ? (
                      <ParrotCharacter state="idle" size={0.45} />
                    ) : (
                      <FoxCharacter state="idle" size={0.45} />
                    )}
                  </div>
                  <div className="px-3 pb-3 text-center">
                    <p className="text-sm font-bold text-foreground">{c.emoji} {c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* AI Teachers - Locked */}
        <div className="px-5 mb-6">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-base">🎓</span> AI老师
            <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">即将解锁</span>
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {teachers.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl overflow-hidden relative pointer-events-none"
                style={{
                  border: `2px solid ${t.color}20`,
                  boxShadow: `0 4px 16px ${t.color}10`,
                  filter: 'grayscale(0.6)',
                  opacity: 0.55,
                }}
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-2" style={{
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                  }}>
                    <p className="text-white text-[11px] font-bold">{t.name}</p>
                    <p className="text-white/70 text-[9px]">{t.role}</p>
                  </div>
                </div>
                <div className="px-2 py-2 bg-white/60">
                  <p className="text-[9px] text-muted-foreground leading-snug">{t.skills}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Partners - Locked */}
        <div className="px-5 mb-8">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="text-base">🤝</span> AI小伙伴
            <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">即将解锁</span>
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {partners.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex flex-col items-center pointer-events-none"
                style={{ filter: 'grayscale(0.6)', opacity: 0.55 }}
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-1.5 relative"
                  style={{
                    border: '2px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}>
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-lg">🔒</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-foreground">{p.name}</span>
                <span className="text-[9px] text-muted-foreground">{p.subtitle} {p.flag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
