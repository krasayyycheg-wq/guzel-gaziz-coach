import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { useState } from 'react';

interface QuizWelcomeProps {
  onStart: () => void;
}

export function QuizWelcome({ onStart }: QuizWelcomeProps) {
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
    >
      <div className="text-center mb-10">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-4 py-1.5 mb-6 text-xs sm:text-sm font-medium text-accent bg-accent/10 rounded-full border border-accent/20"
        >
          Авторский стратегический скрининг
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4"
        >
          На своём ли я месте?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-text-secondary text-base sm:text-lg"
        >
          Индекс присвоенности жизни
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-bg-card rounded-2xl p-6 sm:p-8 border border-border mb-8"
      >
        <p className="text-text-secondary leading-relaxed mb-6">
          Тест измеряет не то, насколько ваша жизнь успешна, а насколько вы присвоили её себе. 
          21 утверждение, 2-3 минут, персональный отчёт.
        </p>

        <div className="bg-bg-secondary rounded-xl p-4 sm:p-6 mb-6">
          <p className="text-sm text-text-secondary leading-relaxed italic">
            «Перед Вами тест, который поможет ответить на вопрос — «На своем ли я месте?». 
            Здесь нет правильных или неправильных ответов — только Вы и Ваша рефлексия. 
            Поэтому постарайтесь отвечать максимально честно. Прохождение теста займет не более 3 минут, 
            после Вы получите отчет и рекомендации на что обратить внимание.»
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-white mb-3">Шкала ответов:</p>
          <div className="grid grid-cols-5 gap-2 text-center text-xs sm:text-sm">
            <div className="p-2 sm:p-3 bg-bg-secondary rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-danger mb-1">1</div>
              <div className="text-text-muted">Совсем не про меня</div>
            </div>
            <div className="p-2 sm:p-3 bg-bg-secondary rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-warning mb-1">2</div>
              <div className="text-text-muted">Скорее не про меня</div>
            </div>
            <div className="p-2 sm:p-3 bg-bg-secondary rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-text-secondary mb-1">3</div>
              <div className="text-text-muted">Бывает по-разному</div>
            </div>
            <div className="p-2 sm:p-3 bg-bg-secondary rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-success mb-1">4</div>
              <div className="text-text-muted">Скорее про меня</div>
            </div>
            <div className="p-2 sm:p-3 bg-bg-secondary rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-accent mb-1">5</div>
              <div className="text-text-muted">Очень про меня</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-4"
      >
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center mt-0.5">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-text-muted rounded peer-checked:bg-accent peer-checked:border-accent transition-colors" />
            <Shield size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-bg-primary opacity-0 peer-checked:opacity-100" />
          </div>
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            Я согласен на обработку персональных данных и получение результатов
          </span>
        </label>

        <button
          onClick={onStart}
          disabled={!isAgreed}
          className="w-full sm:w-auto sm:self-center px-8 py-4 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-hover transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          Начать тест
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </motion.div>
  );
}
