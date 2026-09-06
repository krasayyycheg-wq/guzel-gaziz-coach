import { useRef } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';

interface ProgramStepsProps {
  steps: string[];
}

/**
 * Вертикальная timeline: линия «дорисовывается» при скролле (scaleY по scrollYProgress),
 * шаги подсвечиваются по очереди. При prefers-reduced-motion линия статична.
 */
export function ProgramSteps({ steps }: ProgramStepsProps) {
  const reducedMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.85', 'end 0.55'],
  });

  return (
    <div ref={listRef} className="relative">
      {/* Статичная направляющая */}
      <div className="absolute left-[19px] sm:left-[23px] top-3 bottom-3 w-px bg-white/10" />
      {/* Прогресс-линия, дорисовывается при скролле */}
      <motion.div
        className="absolute left-[19px] sm:left-[23px] top-3 bottom-3 w-px bg-accent origin-top shadow-[0_0_8px_rgba(255,214,0,0.5)]"
        style={reducedMotion ? { scaleY: 1 } : { scaleY: scrollYProgress }}
      />

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            initial={reducedMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
            className="relative flex items-center gap-4 sm:gap-5"
          >
            <motion.div
              initial={false}
              whileInView={
                reducedMotion
                  ? undefined
                  : { scale: [1, 1.15, 1], borderColor: 'rgba(255,214,0,0.7)' }
              }
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-bg-card border border-accent/40 flex items-center justify-center flex-shrink-0"
            >
              <span className="text-accent font-bold font-mono">{index + 1}</span>
            </motion.div>
            <div className="flex-1 bg-bg-card rounded-xl p-4 sm:p-5 border border-border hover:border-accent/30 transition-colors duration-300">
              <p className="text-white font-medium">{step}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
