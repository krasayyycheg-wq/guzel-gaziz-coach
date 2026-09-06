import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

export function QuizCalculating() {
  const [step, setStep] = useState(0);
  const messages = [
    { icon: Brain, text: 'Анализируем ваши ответы...' },
    { icon: Target, text: 'Формируем персональный профиль...' },
    { icon: Sparkles, text: 'Готовим рекомендации...' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[60dvh] flex flex-col items-center justify-center px-4"
    >
      {/* Animated circles */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-accent/30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-dashed border-accent/20"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-4 rounded-full bg-accent/10 flex items-center justify-center"
        >
          {(() => {
            const Icon = messages[step].icon;
            return <Icon size={32} className="text-accent" />;
          })()}
        </motion.div>
      </div>

      {/* Messages */}
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-lg text-white font-medium">
              {messages[step].text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scale indicators */}
      <div className="flex gap-2 mt-8">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((scale, index) => (
          <motion.div
            key={scale}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 }}
            className="w-8 h-8 rounded-lg bg-bg-card border border-border flex items-center justify-center"
          >
            <span className="text-xs text-accent font-mono">{scale}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
