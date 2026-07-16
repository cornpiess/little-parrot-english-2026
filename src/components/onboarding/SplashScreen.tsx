import React from "react";
import { motion } from "motion/react";
import parrotLogo from "@/assets/parrot-logo.png";
import { AITeacherGuide } from "./AITeacherGuide";
import { containerVariants, itemVariants, Button } from "./Shared";

export const SplashScreen = ({ onNext }: { onNext: () => void }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center gap-0"
    >
      <motion.div variants={itemVariants} className="mx-auto mb-4">
        <img src={parrotLogo} alt="小鹦鹉AI" className="w-28 h-28 object-cover rounded-full" style={{ border: '3px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="text-4xl font-extrabold mb-2"
        style={{
          background: 'linear-gradient(135deg, #5A9BD5, #3DD6C8, #7BB8F0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        小鹦鹉AI
      </motion.h1>

      <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-2">
        Little Parrot AI
      </motion.p>

      <motion.p variants={itemVariants} className="text-base text-muted-foreground/70 mb-6">
        让每一个孩子享受双语启蒙机会
      </motion.p>

      <motion.div variants={itemVariants} className="w-full max-w-xs mb-6">
        <AITeacherGuide message="嗨！我是你的AI老师 👋 接下来我会帮你完成设置，一起开始英语学习之旅吧！" />
      </motion.div>

      <motion.div variants={itemVariants} className="w-full max-w-xs">
        <Button onClick={onNext} variant="primary" colorScheme="blue">
          开始探索 ✨
        </Button>
      </motion.div>
    </motion.div>
  );
};
