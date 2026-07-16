import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard, Button, containerVariants, itemVariants } from "./Shared";
import { Sparkles, ArrowRight, Keyboard, RefreshCw } from "lucide-react";
import { AITeacherGuide } from "./AITeacherGuide";

const nameDatabase: Record<string, { name: string; meaning: string }[]> = {
  default: [
    { name: "Leo", meaning: "源自拉丁语「狮子」，象征勇气与领导力" },
    { name: "Mia", meaning: "源自斯堪的纳维亚语「我的」，代表珍贵与挚爱" },
    { name: "Luna", meaning: "拉丁语「月亮」，象征温柔与光芒" },
    { name: "Noah", meaning: "源自希伯来语「安息」，象征和平与宁静" },
    { name: "Aria", meaning: "意大利语「旋律」，代表优美与和谐" },
    { name: "Ethan", meaning: "希伯来语「坚定」，象征力量与坚韧" },
    { name: "Chloe", meaning: "希腊语「嫩芽」，象征青春与成长" },
    { name: "Oliver", meaning: "源自橄榄树，象征和平与智慧" },
    { name: "Emma", meaning: "日耳曼语「完整」，代表优雅与力量" },
    { name: "Felix", meaning: "拉丁语「幸运的」，代表快乐与好运" },
  ],
};

export const Step2Name = ({ onNext }: { onNext: (data: any) => void }) => {
  const [mode, setMode] = useState<"generate" | "manual">("generate");
  const [chineseName, setChineseName] = useState("");
  const [manualName, setManualName] = useState("");
  const [generatedResult, setGeneratedResult] = useState<{ name: string; meaning: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!chineseName) return;
    setIsGenerating(true);
    setTimeout(() => {
      const pool = nameDatabase.default;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setGeneratedResult(pick);
      setIsGenerating(false);
    }, 1500);
  };

  const handleRegenerate = () => {
    setGeneratedResult(null);
    setIsGenerating(true);
    setTimeout(() => {
      const pool = nameDatabase.default;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setGeneratedResult(pick);
      setIsGenerating(false);
    }, 1200);
  };

  const handleNext = () => {
    if (mode === "generate" && generatedResult) {
      onNext({ nameType: "generated", chineseName, englishName: generatedResult.name });
    } else if (mode === "manual" && manualName) {
      onNext({ nameType: "manual", englishName: manualName });
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="px-4 py-8 flex flex-col w-full" style={{ height: 'calc(100vh - 40px)' }}>
      <motion.div variants={itemVariants} className="text-center mb-2">
        <h2 className="text-2xl font-bold text-foreground">第四步</h2>
      </motion.div>
      <motion.div variants={itemVariants} className="mb-4">
        <AITeacherGuide message="给小朋友取一个好听的英文名吧！我可以帮你用AI生成哦 ✨" />
      </motion.div>

      <div className="flex-1 overflow-y-auto min-h-0 mt-6">
        <GlassCard>
          {mode === "generate" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600 font-medium">
                <Sparkles className="w-4 h-4" />
                AI 智能起名
              </div>
              <input
                value={chineseName}
                onChange={(e) => setChineseName(e.target.value)}
                placeholder="输入中文名，例如：乐乐"
                className="w-full h-14 bg-white/50 border border-amber-100 rounded-[20px] px-4 text-xl outline-none focus:ring-2 focus:ring-amber-300/50 transition-all placeholder:text-muted-foreground/40"
                disabled={generatedResult !== null}
              />

              {!generatedResult ? (
                <Button onClick={handleGenerate} colorScheme="orange">
                  {isGenerating ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto" />
                  ) : (
                    "AI 生成英文名"
                  )}
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-3"
                >
                  <p className="text-sm text-green-600 font-medium">✨ AI 已生成英文名</p>
                  <div className="py-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl space-y-2">
                    <div className="text-4xl font-bold text-foreground">{generatedResult.name}</div>
                    <div className="text-sm text-amber-700/70 px-4 leading-relaxed">
                      {generatedResult.meaning}
                    </div>
                  </div>
                  <button
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-1.5 text-sm text-amber-600 font-medium hover:text-amber-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    换一个
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <Keyboard className="w-4 h-4" />
                手动输入
              </div>
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="输入英文名"
                className="w-full h-14 bg-white/50 border border-blue-100 rounded-[20px] px-4 text-xl outline-none focus:ring-2 focus:ring-blue-300/50 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          )}
        </GlassCard>
      </div>

      <div className="sticky bottom-0 pt-3 pb-6 flex gap-3">
        <button
          onClick={() => { setMode(mode === "generate" ? "manual" : "generate"); setGeneratedResult(null); }}
          className="px-4 py-3 rounded-2xl glass text-sm text-muted-foreground border border-border"
        >
          {mode === "generate" ? "手动输入" : "AI起名"}
        </button>
        <div className="flex-1">
          <Button onClick={handleNext} colorScheme="blue">
            下一步 <ArrowRight className="inline w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
