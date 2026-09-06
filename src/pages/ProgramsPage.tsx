import { motion, useReducedMotion } from 'framer-motion';
import { BackButton } from '../components/BackButton';
import { ProgramCard } from '../components/ProgramCard';
import { PROGRAMS } from '../data/programs';

export function ProgramsPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <BackButton />
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
            Программы
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Каталог программ
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Индивидуальные программы коучинга — от личной стратегии развития
            до мастерства публичных выступлений.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent/5 rounded-full border border-accent/10">
            <span className="text-sm text-accent font-medium">
              Первая консультация бесплатная
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {PROGRAMS.map((program, index) => (
            <ProgramCard key={program.slug} program={program} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
