import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function GlowButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}: GlowButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-300 overflow-hidden';
  
  const variants = {
    primary: 'bg-accent text-bg-primary hover:bg-accent-hover',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
    outline: 'border border-white/20 text-white hover:bg-white/5',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {/* Glow effect */}
      {variant === 'primary' && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,214,0,0.3) 0%, transparent 60%)',
          }}
        />
      )}
      
      {/* Shimmer effect */}
      {variant === 'primary' && !disabled && (
        <motion.div
          className="absolute inset-0 -translate-x-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut',
          }}
        />
      )}
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
