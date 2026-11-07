import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Question } from '../../types/test';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number;
  onAnswer: (value: number) => void;
  onBack: () => void;
  canGoBack: boolean;
}

const answerLabels = [
  'Совсем не про меня',
  'Скорее не про меня',
  'Бывает по-разному',
  'Скорее про меня',
  'Очень про меня',
];

const answerGradients = [
  // Пять ступеней: красный → оранжевый → нейтральный → лаймовый → зелёный
  { bg: 'linear-gradient(135deg, rgba(239,68,68,0.28), rgba(153,27,27,0.15))', border: 'rgba(239,68,68,0.55)', text: '#fca5a5' },
  { bg: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(154,52,18,0.15))', border: 'rgba(249,115,22,0.5)', text: '#fdba74' },
  { bg: 'linear-gradient(135deg, rgba(148,163,184,0.2), rgba(71,85,105,0.15))', border: 'rgba(148,163,184,0.4)', text: '#cbd5e1' },
  { bg: 'linear-gradient(135deg, rgba(163,230,53,0.23), rgba(77,124,15,0.15))', border: 'rgba(163,230,53,0.5)', text: '#bef264' },
  { bg: 'linear-gradient(135deg, rgba(16,185,129,0.27), rgba(6,95,70,0.16))', border: 'rgba(16,185,129,0.55)', text: '#6ee7b7' },
];

const selectedGradients = [
  { bg: 'linear-gradient(135deg, rgba(239,68,68,0.58), rgba(153,27,27,0.45))', border: 'rgba(239,68,68,0.95)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, rgba(249,115,22,0.56), rgba(154,52,18,0.44))', border: 'rgba(249,115,22,0.95)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, rgba(148,163,184,0.5), rgba(71,85,105,0.4))', border: 'rgba(148,163,184,0.9)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, rgba(163,230,53,0.5), rgba(77,124,15,0.42))', border: 'rgba(163,230,53,0.9)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, rgba(16,185,129,0.56), rgba(6,95,70,0.45))', border: 'rgba(16,185,129,0.95)', text: '#ffffff' },
];

export function QuizQuestionComponent({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onBack,
  canGoBack,
}: QuizQuestionProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16"
    >
      {/* Progress */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-secondary">
            Вопрос {questionNumber} из {totalQuestions}
          </span>
          <span className="text-sm text-accent font-mono">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question — fixed min-height to prevent answers from shifting */}
      <div className="mb-6 sm:mb-10 min-h-[120px] sm:min-h-[100px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-lg sm:text-xl lg:text-2xl text-white leading-relaxed font-medium w-full"
          >
            {question.text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Answers — horizontal grid, fixed position */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3 mb-8">
        {[1, 2, 3, 4, 5].map((value) => {
          const isSelected = selectedAnswer === value;
          const style = isSelected ? selectedGradients[value - 1] : answerGradients[value - 1];
          return (
            <motion.button
              key={value}
              onClick={() => onAnswer(value)}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border-2 transition-all duration-200 text-center"
              style={{
                background: style.bg,
                borderColor: style.border,
                color: style.text,
              }}
            >
              <span className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1">{value}</span>
              <span className="text-[10px] sm:text-xs leading-tight">{answerLabels[value - 1]}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="flex items-center gap-2 px-4 py-3 text-text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Назад</span>
        </button>

        {selectedAnswer && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onAnswer(selectedAnswer)}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-bg-primary font-medium rounded-lg hover:bg-accent-hover transition-colors"
          >
            <span className="text-sm">
              {questionNumber === totalQuestions ? 'Получить результат' : 'Далее'}
            </span>
            <ArrowRight size={18} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
