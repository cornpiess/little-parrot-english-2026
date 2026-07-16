import { motion } from 'motion/react';
import { BookOpen, Users } from 'lucide-react';

interface CompactActionSectionProps {
  onStartClass: () => void;
  onPlayPartner: () => void;
}

export default function CompactActionSection({ onStartClass, onPlayPartner }: CompactActionSectionProps) {
  return (
    <div className="flex gap-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onStartClass}
        className="flex-1 py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2.5"
        style={{
          background: 'linear-gradient(135deg, #874FF0, #A06BF5)',
          boxShadow: '0 6px 20px rgba(135, 79, 240, 0.35)'
        }}>
        <BookOpen className="w-5 h-5" />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[15px]">一起学习</span>
          <span className="text-[10px] font-normal opacity-80">动画·绘本·儿歌</span>
        </div>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onPlayPartner}
        className="flex-1 py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2.5"
        style={{
          background: 'linear-gradient(135deg, #E13886, #F06BA8)',
          boxShadow: '0 6px 20px rgba(225, 56, 134, 0.35)'
        }}>
        <Users className="w-5 h-5" />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[15px]">一起玩耍</span>
          <span className="text-[10px] font-normal opacity-80">AI老师·情感陪伴</span>
        </div>
      </motion.button>
    </div>
  );
}
