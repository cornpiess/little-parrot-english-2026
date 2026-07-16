import React from "react";
import { motion } from "motion/react";

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={itemVariants}
      className={`relative rounded-3xl p-6 glass ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: 'var(--gradient-page)' }}>
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, hsl(25, 80%, 90%) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, hsl(280, 50%, 88%) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div className="absolute top-[30%] right-[-5%] w-[40%] h-[40%] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, hsl(172, 50%, 85%) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>
    </div>
  );
};

export const Button = ({
  onClick,
  children,
  className = "",
  variant = "primary",
  colorScheme = "orange",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  colorScheme?: "blue" | "pink" | "orange" | "green";
}) => {
  const baseStyles = "w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 relative overflow-hidden";

  const colorSchemes = {
    blue: "text-white",
    pink: "text-white",
    orange: "text-white",
    green: "text-white",
  };

  const gradients: Record<string, string> = {
    blue: 'var(--gradient-secondary-btn)',
    pink: 'var(--gradient-primary-btn)',
    orange: 'var(--gradient-primary-btn)',
    green: 'var(--gradient-success-btn)',
  };

  const shadows: Record<string, string> = {
    blue: '0 8px 24px hsla(280, 55%, 60%, 0.3)',
    pink: '0 8px 24px hsla(340, 75%, 58%, 0.3)',
    orange: '0 8px 24px hsla(25, 90%, 60%, 0.3)',
    green: '0 8px 24px hsla(152, 60%, 48%, 0.3)',
  };

  if (variant === "primary") {
    return (
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onClick}
        className={`${baseStyles} ${colorSchemes[colorScheme]} ${className}`}
        style={{ background: gradients[colorScheme], boxShadow: shadows[colorScheme] }}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`${baseStyles} glass text-foreground ${className}`}
    >
      {children}
    </motion.button>
  );
};
