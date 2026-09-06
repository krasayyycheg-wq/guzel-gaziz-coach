import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  /** Количество колонок на десктопе */
  columns?: 2 | 3;
}

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 ${
        columns === 3 ? 'lg:grid-cols-3' : ''
      }`}
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
          className="bg-bg-card rounded-2xl p-6 sm:p-8 border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,214,0,0.1)]"
        >
          <motion.div
            className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5"
            whileHover={reducedMotion ? undefined : { scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <feature.icon size={24} className="text-accent" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
