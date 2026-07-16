import React, { useState } from "react";
import { motion } from "motion/react";
import { GlassCard, Button, containerVariants, itemVariants } from "./Shared";
import { Check, Star, Zap, BookOpen, MessageCircle } from "lucide-react";
import { AITeacherGuide } from "./AITeacherGuide";

const levels = [
  { id: 1, label: "完全不会说", sub: "Zero Basis", color: "from-green-400 to-emerald-500", bg: "bg-green-50", border: "border-green-200", icon: Star },
  { id: 2, label: "能读ABC", sub: "Letters Only", color: "from-blue-400 to-cyan-500", bg: "bg-blue-50", border: "border-blue-200", icon: BookOpen },
  { id: 3, label: "能蹦单词", sub: "Simple Words", color: "from-purple-400 to-violet-500", bg: "bg-purple-50", border: "border-purple-200", icon: Zap },
  { id: 4, label: "能简单对话", sub: "Basic Conversation", color: "from-pink-400 to-rose-500", bg: "bg-pink-50", border: "border-pink-200", icon: MessageCircle },
];

export const Step3Level = ({ onNext }: { onNext: (data: any) => void }) => {
  const [selectedLevel, setSelectedLevel] = useState(2);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="px-4 py-8 flex flex-col w-full" style={{ height: 'calc(100vh - 40px)' }}>
      <motion.div variants={itemVariants} className="text-center mb-2">
        <h2 className="text-2xl font-bold text-foreground">最后一步</h2>
      </motion.div>
      <motion.div variants={itemVariants} className="mb-4">
        <AITeacherGuide message="马上就好了！小朋友现在的英语水平是怎样的呢？🎓" />
      </motion.div>

      <div className="flex-1 overflow-y-auto min-h-0 mt-6">
        <GlassCard className="space-y-3">
          {levels.map((level) => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.id;

            return (
              <motion.button
                key={level.id}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedLevel(level.id)}
                className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all ${
                  isSelected
                    ? `${level.bg} ${level.border} border-2 shadow-md`
                    : "bg-card/40 border border-border"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${level.color}`}>
                  {isSelected ? <Check className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5 text-white/70" />}
                </div>
                <div>
                  <p className={`font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{level.label}</p>
                  <p className="text-xs text-muted-foreground">{level.sub}</p>
                </div>
              </motion.button>
            );
          })}
        </GlassCard>
      </div>

      <div className="sticky bottom-0 pt-3 pb-6">
        <Button onClick={() => onNext({ level: selectedLevel })} variant="primary" colorScheme="blue">
          开启AI外教之旅 {">"}
        </Button>
      </div>
    </motion.div>
  );
};
