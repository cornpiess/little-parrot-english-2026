import React from "react";
import { motion } from "motion/react";

export const RedPandaLogo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className={className}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Ears */}
      <circle cx="35" cy="25" r="18" fill="#FF8A65" />
      <circle cx="85" cy="25" r="18" fill="#FF8A65" />
      {/* Inner Ears */}
      <circle cx="35" cy="25" r="10" fill="#FFCCBC" />
      <circle cx="85" cy="25" r="10" fill="#FFCCBC" />
      {/* Face Background Circle */}
      <circle cx="60" cy="62" r="45" fill="#FF7043" />
      {/* White Face Area */}
      <ellipse cx="60" cy="72" rx="32" ry="28" fill="white" />
      {/* Eye Patches (Panda style) */}
      <ellipse cx="43" cy="55" rx="12" ry="10" fill="#BF360C" opacity="0.6" />
      <ellipse cx="77" cy="55" rx="12" ry="10" fill="#BF360C" opacity="0.6" />
      {/* Eyes (white with black pupils) */}
      <circle cx="43" cy="55" r="7" fill="white" />
      <circle cx="77" cy="55" r="7" fill="white" />
      {/* Pupils with sparkle */}
      <circle cx="45" cy="54" r="4" fill="#1A1A2E" />
      <circle cx="79" cy="54" r="4" fill="#1A1A2E" />
      <circle cx="46.5" cy="52.5" r="1.5" fill="white" />
      <circle cx="80.5" cy="52.5" r="1.5" fill="white" />
      {/* Cute Nose */}
      <ellipse cx="60" cy="68" rx="5" ry="3.5" fill="#1A1A2E" />
      {/* Happy Smile */}
      <path d="M52 74 Q60 82 68 74" fill="none" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
      {/* Rosy Cheeks */}
      <circle cx="35" cy="70" r="6" fill="#FF8A80" opacity="0.5" />
      <circle cx="85" cy="70" r="6" fill="#FF8A80" opacity="0.5" />
      {/* ABC Book in paw */}
      <text x="52" y="100" fontSize="12" fill="#FF7043" fontWeight="bold" fontFamily="sans-serif">ABC</text>
    </motion.svg>
  );
};
