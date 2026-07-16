import React, { useState } from "react";
import { motion } from "motion/react";
import { GlassCard, Button, containerVariants, itemVariants } from "./Shared";
import { WheelPicker } from "./WheelPicker";
import { AITeacherGuide } from "./AITeacherGuide";

export const Step1BasicInfo = ({ onNext }: { onNext: (data: any) => void }) => {
  const [gender, setGender] = useState<"boy" | "girl" | null>(null);
  const [year, setYear] = useState(2018);
  const [month, setMonth] = useState(6);

  const years = Array.from({ length: 15 }, (_, i) => 2025 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleNext = () => {
    if (gender) {
      onNext({ gender, year, month });
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="px-4 py-6 flex flex-col w-full" style={{ height: 'calc(100vh - 40px)' }}>
      <motion.div variants={itemVariants} className="text-center mb-1">
        <h2 className="text-2xl font-bold text-foreground">第三步</h2>
      </motion.div>
      <motion.div variants={itemVariants} className="mb-3">
        <AITeacherGuide message="告诉我小朋友的生日和性别吧！🎂" />
      </motion.div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        {/* Gender first - visible without scrolling */}
        <GlassCard>
          <p className="text-sm text-muted-foreground mb-2 font-medium">性别</p>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setGender("boy")}
              className={`flex-1 py-4 rounded-2xl text-center transition-all ${
                gender === "boy"
                  ? "border-2 shadow-lg"
                  : "bg-card/50 border border-border"
              }`}
              style={gender === "boy" ? { background: 'hsla(210, 70%, 55%, 0.1)', borderColor: 'hsl(210, 70%, 55%)' } : {}}
            >
              <span className="text-3xl">👦</span>
              <p className="text-sm mt-1 font-medium text-foreground">男宝</p>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setGender("girl")}
              className={`flex-1 py-4 rounded-2xl text-center transition-all ${
                gender === "girl"
                  ? "border-2 shadow-lg"
                  : "bg-card/50 border border-border"
              }`}
              style={gender === "girl" ? { background: 'hsla(340, 75%, 58%, 0.1)', borderColor: 'hsl(340, 75%, 58%)' } : {}}
            >
              <span className="text-3xl">👧</span>
              <p className="text-sm mt-1 font-medium text-foreground">女宝</p>
            </motion.button>
          </div>
        </GlassCard>

        {/* Birthday second */}
        <GlassCard>
          <p className="text-sm text-muted-foreground mb-2 font-medium">出生年月</p>
          <div className="flex gap-3 w-full">
            <WheelPicker items={years} value={year} onChange={setYear} label="年" />
            <WheelPicker items={months} value={month} onChange={setMonth} label="月" />
          </div>
        </GlassCard>
      </div>

      <div className="sticky bottom-0 pt-3 pb-6">
        <Button onClick={handleNext} variant="primary" colorScheme="orange" className={!gender ? "opacity-50" : ""}>
          下一步
        </Button>
      </div>
    </motion.div>
  );
};
