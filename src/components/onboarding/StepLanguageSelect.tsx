import React, { useState } from "react";
import { motion } from "motion/react";
import { GlassCard, Button, containerVariants, itemVariants } from "./Shared";
import { AITeacherGuide } from "./AITeacherGuide";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  available: boolean;
}

const languages: Language[] = [
  { code: "zh", name: "中文", nativeName: "中文", flag: "🇨🇳", available: true },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", available: true },
  { code: "ja", name: "日本語", nativeName: "日本語", flag: "🇯🇵", available: true },
  { code: "ko", name: "한국어", nativeName: "한국어", flag: "🇰🇷", available: true },
  { code: "es", name: "Español", nativeName: "Español", flag: "🇪🇸", available: true },
  { code: "fr", name: "Français", nativeName: "Français", flag: "🇫🇷", available: true },
  { code: "de", name: "Deutsch", nativeName: "Deutsch", flag: "🇩🇪", available: true },
  { code: "ru", name: "Русский", nativeName: "Русский", flag: "🇷🇺", available: true },
  { code: "ar", name: "العربية", nativeName: "العربية", flag: "🇸🇦", available: true },
  { code: "pt", name: "Português", nativeName: "Português", flag: "🇧🇷", available: true },
];

const targetLanguages: Language[] = [
  { code: "en", name: "English", nativeName: "英语", flag: "🇺🇸", available: true },
  { code: "ja", name: "日本語", nativeName: "日语", flag: "🇯🇵", available: false },
  { code: "ko", name: "한국어", nativeName: "韩语", flag: "🇰🇷", available: false },
  { code: "es", name: "Español", nativeName: "西班牙语", flag: "🇪🇸", available: false },
  { code: "fr", name: "Français", nativeName: "法语", flag: "🇫🇷", available: false },
  { code: "de", name: "Deutsch", nativeName: "德语", flag: "🇩🇪", available: false },
  { code: "ru", name: "Русский", nativeName: "俄语", flag: "🇷🇺", available: false },
  { code: "ar", name: "العربية", nativeName: "阿拉伯语", flag: "🇸🇦", available: false },
  { code: "pt", name: "Português", nativeName: "葡萄牙语", flag: "🇧🇷", available: false },
];

export const StepNativeLanguage = ({ onNext }: { onNext: (data: any) => void }) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="px-4 py-8 flex flex-col w-full" style={{ height: 'calc(100vh - 40px)' }}>
      <motion.div variants={itemVariants} className="text-center mb-2">
        <h2 className="text-2xl font-bold text-foreground">第一步</h2>
      </motion.div>
      <motion.div variants={itemVariants} className="mb-4">
        <AITeacherGuide message="先告诉我，小朋友平时说什么语言呀？🌍" />
      </motion.div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <GlassCard className="!p-4">
          <div className="grid grid-cols-2 gap-2.5">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(lang.code)}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl text-left transition-all ${
                  selected === lang.code
                    ? "border-2 shadow-md"
                    : "bg-card/50 border border-border"
                }`}
                style={
                  selected === lang.code
                    ? { background: "hsla(210, 70%, 55%, 0.1)", borderColor: "hsl(210, 70%, 55%)" }
                    : {}
                }
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{lang.nativeName}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="sticky bottom-0 pt-3 pb-6">
        <Button
          onClick={() => selected && onNext({ nativeLanguage: selected })}
          variant="primary"
          colorScheme="blue"
          className={!selected ? "opacity-50" : ""}
        >
          下一步
        </Button>
      </div>
    </motion.div>
  );
};

export const StepTargetLanguage = ({ onNext }: { onNext: (data: any) => void }) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="px-4 py-8 flex flex-col w-full" style={{ height: 'calc(100vh - 40px)' }}>
      <motion.div variants={itemVariants} className="text-center mb-2">
        <h2 className="text-2xl font-bold text-foreground">第二步</h2>
      </motion.div>
      <motion.div variants={itemVariants} className="mb-4">
        <AITeacherGuide message="很棒！那小朋友想学什么语言呢？🎯" />
      </motion.div>

      <div className="flex-1 overflow-y-auto min-h-0 mt-5">
        <GlassCard className="!p-4">
          <div className="grid grid-cols-1 gap-2.5">
            {targetLanguages.map((lang) => (
              <motion.button
                key={lang.code}
                whileTap={lang.available ? { scale: 0.95 } : {}}
                onClick={() => lang.available && setSelected(lang.code)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all relative ${
                  !lang.available
                    ? "opacity-45 cursor-not-allowed bg-muted/30 border border-border"
                    : selected === lang.code
                    ? "border-2 shadow-md"
                    : "bg-card/50 border border-border"
                }`}
                style={
                  selected === lang.code && lang.available
                    ? { background: "hsla(25, 85%, 58%, 0.1)", borderColor: "hsl(25, 85%, 58%)" }
                    : {}
                }
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{lang.name}</p>
                  <p className="text-xs text-muted-foreground">{lang.nativeName}</p>
                </div>
                {!lang.available && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    即将上线
                  </span>
                )}
                {lang.available && selected === lang.code && (
                  <span className="text-lg">✓</span>
                )}
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="sticky bottom-0 pt-3 pb-6">
        <Button
          onClick={() => selected && onNext({ targetLanguage: selected })}
          variant="primary"
          colorScheme="orange"
          className={!selected ? "opacity-50" : ""}
        >
          下一步
        </Button>
      </div>
    </motion.div>
  );
};
