import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// AI Tutor images (3)
import imgTutor1 from '@/assets/18466f7d75c7f0003c756fab4f226f5acaf0b786.webp';
import imgTutor2 from '@/assets/1ebf0cda2cde974b5ed9ae6990f1305cc10602a8.webp';
import imgTutor3 from '@/assets/aeb3bf3332ef650a0757436b3785006b754ee466.webp';

// AI Partner images (6)
import imgPartner1 from '@/assets/5beb9546513432ce9c4c07c79c92908956d92ffb.webp';
import imgPartner2 from '@/assets/5f34b76305073c932c45e9a1ca6982a3b0701c51.webp';
import imgPartner3 from '@/assets/7f5840355d80debdd7cbea5b1b0cfcd8797475cf.webp';
import imgPartner4 from '@/assets/865cc265587e2b67df878968a8f421d99f400e41.webp';
import imgPartner5 from '@/assets/9ace1b69d6a8cf0749e3bc5affa90c3f4b1856da.webp';
import imgPartner6 from '@/assets/adc9f9dc90a165002cdfaac86d27cb447763afc7.webp';

const experts = [
  { id: 1, name: '幼儿教育专家', subtitle: '小鹿姐姐', image: imgTutor3, skills: '擅长：行为引导、自我认知、情绪管理', color: '#FF6B9D' },
  { id: 2, name: '音乐家', subtitle: '贝多芬β', image: imgTutor1, skills: '擅长：乐器启蒙、儿歌韵律', color: '#1CB0F6' },
  { id: 3, name: '科学家', subtitle: '爱因斯坦α', image: imgTutor2, skills: '擅长：恐龙时代、动植物百科、太空探索', color: '#58CC02' },
];

const partners = [
  { name: 'Bull', subtitle: '巴西', image: imgPartner5, flag: '🇧🇷' },
  { name: 'Bred', subtitle: '中东', image: imgPartner4, flag: '🕌' },
  { name: 'Allen', subtitle: '美国', image: imgPartner2, flag: '🇺🇸' },
  { name: 'Coco', subtitle: '小鹦鹉', image: imgPartner6, flag: '🦜' },
  { name: 'Harry', subtitle: '英国', image: imgPartner3, flag: '🇬🇧' },
  { name: 'Xizi', subtitle: '日本', image: imgPartner1, flag: '🇯🇵' },
];

const engineHighlights = [
  { label: '每月测评', value: '测评中', cssColor: '#AF57DB', icon: '📊',
    detail: { title: '每月测评', subtitle: 'AI 无感测评', status: '正在测评中（根据最近 7 天互动分析）', letter: '💡 给家长的信', letterBody: 'AI 伙伴会在宝贝与它的对话过程中，自动分析发音、词汇掌握及逻辑表达。无需额外考试，每个月 1 号为您生成深度成长报告。', metricsTitle: '📊 核心指标预览', metrics: [{ value: '156', label: '词汇量', color: '#AF57DB' }, { value: '85%', label: '表达力', color: '#1CB0F6' }, { value: '92%', label: '积极度', color: '#58CC02' }] } },
  { label: 'i+1匹配', value: '100%', cssColor: '#1CB0F6', icon: '🎯',
    detail: { title: 'i+1 动态匹配', subtitle: '智能难度调节', status: '当前处于 L2 水平', letter: '📈 匹配详情', letterBody: '当前处于 L2 水平。AI 已为您调整对话难度：新词率 10%，语速 85%。', metricsTitle: '📊 难度参数', metrics: [{ value: '10%', label: '新词率', color: '#FF9500' }, { value: '85%', label: '语速', color: '#1CB0F6' }, { value: 'L2', label: '等级', color: '#58CC02' }] } },
  { label: 'AI计划', value: '15分钟', cssColor: '#58CC02', icon: '📋',
    detail: { title: 'AI 计划', subtitle: '今日学习计划', status: '推荐学习 15 分钟', letter: '📅 计划详情', letterBody: '今日推荐学习 15 分钟，包含 2 个新单词复习和 1 个新场景探索。', metricsTitle: '📊 今日目标', metrics: [{ value: '15', label: '分钟', color: '#58CC02' }, { value: '2', label: '新词', color: '#FF9500' }, { value: '1', label: '场景', color: '#AF57DB' }] } },
  { label: '遗忘曲线', value: '3个词', cssColor: '#FF9500', icon: '🧠',
    detail: { title: '遗忘曲线', subtitle: '记忆巩固提醒', status: '5 个词汇即将到达遗忘临界点', letter: '🔄 巩固详情', letterBody: '今日有 5 个词汇即将到达遗忘临界点，AI 已将它们编入今日对话开场白。', metricsTitle: '📊 记忆状态', metrics: [{ value: '5', label: '待巩固', color: '#FF9500' }, { value: '23', label: '已掌握', color: '#58CC02' }, { value: '89%', label: '留存率', color: '#1CB0F6' }] } },
];

function HighlightModal({ highlight, onClose }: { highlight: typeof engineHighlights[0]; onClose: () => void }) {
  const d = highlight.detail;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-t-3xl overflow-hidden bg-background pb-8"
        style={{ boxShadow: '0 -4px 0 #E5E7EB' }}>
        <div className="p-5 pb-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `${highlight.cssColor}18`, border: `2px solid ${highlight.cssColor}30` }}>
            <span className="text-2xl">{highlight.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-foreground">{d.title}</h3>
            <p className="text-xs text-muted-foreground">{d.subtitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 mb-4">
          <div className="px-4 py-2.5 rounded-2xl text-xs font-bold"
            style={{ background: `${highlight.cssColor}12`, color: highlight.cssColor, border: `2px solid ${highlight.cssColor}25` }}>
            {d.status}
          </div>
        </div>
        <div className="px-5 mb-4">
          <p className="text-sm font-extrabold text-foreground mb-1.5">{d.letter}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{d.letterBody}</p>
        </div>
        <div className="px-5 mb-5">
          <p className="text-sm font-extrabold text-foreground mb-3">{d.metricsTitle}</p>
          <div className="grid grid-cols-3 gap-3">
            {d.metrics.map((m, i) =>
              <div key={i} className="rounded-2xl p-3 text-center" style={{ background: `${m.color}12`, border: `2px solid ${m.color}20` }}>
                <p className="text-xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{m.label}</p>
              </div>
            )}
          </div>
        </div>
        <div className="px-5">
          <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm"
            style={{ background: highlight.cssColor, boxShadow: `0 4px 16px ${highlight.cssColor}40` }}>
            知道了
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const AIPartnerTab = memo(function AIPartnerTab() {
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  return (
    <div className="py-2 space-y-6">
      {/* Expert Cards — infinite scroll marquee */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-3 px-5"
          style={{ width: 'max-content' }}
          animate={{ x: [0, -(experts.length * 156)] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          {[...experts, ...experts, ...experts].map((expert, i) => (
            <motion.div key={i} whileTap={{ scale: 0.97 }}
              className="w-[140px] flex-shrink-0 cursor-pointer">
              <div className="w-full aspect-[3/4] overflow-hidden rounded-2xl relative"
                style={{
                  border: '3px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                }}>
                <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" loading="eager" decoding="async" />
              </div>
              <div className="pt-2 px-0.5 space-y-1">
                <p className="font-bold text-xs text-foreground leading-tight">{expert.name}：{expert.subtitle}</p>
                <p className="text-[10px] leading-snug rounded-lg px-2 py-1 font-medium inline-block"
                  style={{ background: `${expert.color}15`, color: expert.color }}>
                  {expert.skills}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Partner Avatars — infinite scroll marquee (reverse) */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-3 px-5"
          style={{ width: 'max-content' }}
          animate={{ x: [-(partners.length * 88), 0] }}
          transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
        >
          {[...partners, ...partners, ...partners].map((partner, i) => (
            <motion.div key={i} whileTap={{ scale: 0.95 }}
              className="w-[72px] flex-shrink-0 cursor-pointer">
              <div className="w-full aspect-[3/4] overflow-hidden rounded-xl relative"
                style={{
                  border: '2px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}>
                <img src={partner.image} alt={partner.name} className="w-full h-full object-cover" loading="eager" decoding="async" />
                <span className="absolute top-1 right-1 text-xs">{partner.flag}</span>
              </div>
              <div className="pt-1.5 text-center">
                <p className="text-[10px] font-bold text-muted-foreground">{partner.subtitle}：{partner.name}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* AI Engine Status */}
      <div className="px-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(var(--accent))' }} />
          <span className="text-xs font-bold text-foreground">AI 引擎持续运行中</span>
        </div>
        <div className="flex gap-2">
          {engineHighlights.map((h, i) => (
            <motion.button key={i} whileTap={{ scale: 0.96 }} onClick={() => setActiveHighlight(i)}
              className="flex-1 glass rounded-2xl p-2.5 flex flex-col items-center gap-1 text-center cursor-pointer">
              <span className="text-base">{h.icon}</span>
              <span className="text-[9px] text-muted-foreground leading-tight">{h.label}</span>
              <span className="text-[11px] font-bold" style={{ color: h.cssColor }}>{h.value}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeHighlight !== null &&
          <HighlightModal highlight={engineHighlights[activeHighlight]} onClose={() => setActiveHighlight(null)} />
        }
      </AnimatePresence>
    </div>
  );
});

export default AIPartnerTab;
