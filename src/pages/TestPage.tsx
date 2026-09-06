import { motion, useReducedMotion } from 'framer-motion';
import { BackButton } from '../components/BackButton';
import { Quiz } from '../components/quiz/Quiz';

export function TestPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pt-24 sm:pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <BackButton />
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            На своём ли я месте?
          </h1>
        </motion.div>

        <Quiz />
      </div>
    </div>
  );
}
