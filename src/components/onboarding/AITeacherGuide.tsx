import React from "react";
import { motion } from "motion/react";
import aiTutorImg from "@/assets/ai_tutor.png";

interface AITeacherGuideProps {
  message: string;
  className?: string;
}

export const AITeacherGuide = ({ message, className = "" }: AITeacherGuideProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`flex items-start gap-3 ${className}`}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="flex-shrink-0"
      >
        <img
          src={aiTutorImg}
          alt="AI老师"
          className="w-14 h-14 rounded-full object-cover object-top shadow-md"
          style={{ border: '2px solid rgba(255,255,255,0.8)' }}
        />
      </motion.div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 24 }}
        className="relative glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-[280px]"
        style={{
          background: 'rgba(255,255,255,0.75)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}
      >
        <p className="text-sm text-foreground leading-relaxed">{message}</p>
        {/* Speech bubble tail */}
        <div
          className="absolute -left-2 top-3 w-0 h-0"
          style={{
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '8px solid rgba(255,255,255,0.75)',
          }}
        />
      </motion.div>
    </motion.div>
  );
};
