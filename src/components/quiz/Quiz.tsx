import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QuizWelcome } from './QuizWelcome';
import { QuizQuestionComponent } from './QuizQuestion';
import { QuizCalculating } from './QuizCalculating';
import { QuizReport } from './QuizReport';
import { ContactForm } from './ContactForm';
import { QUESTIONS } from '../../data/testData';
import { calculateTestResult } from '../../utils/calculations';
import { reachGoal } from '../../utils/metrika';
import { sendLead } from '../../lib/lead';
import type { TestResult } from '../../types/test';

type QuizStep = 'welcome' | 'questions' | 'contact' | 'calculating' | 'report';

export function Quiz() {
  const [step, setStep] = useState<QuizStep>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<TestResult | null>(null);

  const handleStart = useCallback(() => {
    reachGoal('quiz_start');
    setStep('questions');
    setCurrentQuestion(0);
  }, []);

  const handleAnswer = useCallback((value: number) => {
    const questionId = QUESTIONS[currentQuestion].id;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setStep('contact');
      }
    }, 300);
  }, [currentQuestion]);

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [currentQuestion]);

  const handleContactSubmit = useCallback(async (contactData: { name: string; email: string; phone?: string }) => {
    setStep('calculating');

    // Simulate calculation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const testResult = calculateTestResult(answers);
    setResult(testResult);
    setStep('report');
    reachGoal('quiz_complete', { score: testResult.overallIndex });
    reachGoal('quiz_lead');

    sendLead({
      type: 'quiz_contact',
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      testScore: testResult.overallIndex,
      testProfile: `${testResult.profile.key} · ${testResult.profile.name}`,
    }).catch((error) => {
      console.error('[Quiz] Не удалось отправить контакт после теста:', error);
    });
  }, [answers]);

  const handleSkipContact = useCallback(async () => {
    setStep('calculating');

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const testResult = calculateTestResult(answers);
    setResult(testResult);
    setStep('report');
    reachGoal('quiz_complete', { score: testResult.overallIndex });

    // Обезличенный результат теста: без имени и контактов
    sendLead({
      type: 'quiz_result',
      testScore: testResult.overallIndex,
      testProfile: `${testResult.profile.key} · ${testResult.profile.name}`,
    }).catch((error) => {
      console.error('[Quiz] Не удалось отправить результат теста:', error);
    });
  }, [answers]);

  const handleSaveResult = useCallback((email: string) => {
    reachGoal('quiz_report_save');
    if (result) {
      sendLead({
        type: 'quiz_result',
        email,
        testScore: result.overallIndex,
        testProfile: `${result.profile.key} · ${result.profile.name}`,
      }).catch((error) => {
        console.error('[Quiz] Не удалось отправить запрос отчёта:', error);
      });
    }
  }, [result]);

  return (
    <section className="min-h-[80dvh] py-8 sm:py-16" id="quiz">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizWelcome onStart={handleStart} />
          </motion.div>
        )}

        {step === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizQuestionComponent
              question={QUESTIONS[currentQuestion]}
              questionNumber={currentQuestion + 1}
              totalQuestions={QUESTIONS.length}
              selectedAnswer={answers[QUESTIONS[currentQuestion].id]}
              onAnswer={handleAnswer}
              onBack={handleBack}
              canGoBack={currentQuestion > 0}
            />
          </motion.div>
        )}

        {step === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ContactForm onSubmit={handleContactSubmit} onSkip={handleSkipContact} />
          </motion.div>
        )}

        {step === 'calculating' && (
          <motion.div
            key="calculating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizCalculating />
          </motion.div>
        )}

        {step === 'report' && result && (
          <motion.div
            key="report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizReport result={result} onSave={handleSaveResult} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
