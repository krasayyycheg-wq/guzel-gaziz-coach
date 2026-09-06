import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Award, ChevronDown, MessageCircle, Send } from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { ProgramCard } from '../components/ProgramCard';
import { ApplicationForm } from '../components/ApplicationForm';
import { PROGRAMS } from '../data/programs';

const trustStats = [
  { value: '10+', label: 'лет практики' },
  { value: '500+', label: 'часов коучинга' },
  { value: '100+', label: 'клиентов' },
  { value: 'ICF', label: 'сертификация' },
];

const journeySteps = [
  {
    number: '01',
    title: 'Познакомьтесь с тренером',
    text: 'Узнайте, кто я, как работаю и почему мне доверяют руководители. Биография, подход, сертификация ICF.',
    linkText: 'Обо мне',
    to: '/about',
  },
  {
    number: '02',
    title: 'Выберите программу',
    text: 'Два направления работы. Откройте программу и прочитайте, кому она подходит и что даст.',
    linkText: 'Смотреть программы',
    to: '/programs',
  },
  {
    number: '03',
    title: 'Проверьте, ваше ли это',
    text: 'Пройдите тест и получите персональный отчёт, который подскажет, нужна ли вам программа и с чего лучше начать.',
    to: '/test/life-ownership-index',
    noLink: true,
  },
];

const faqItems = [
  {
    question: 'Чем коучинг отличается от психотерапии и консалтинга?',
    answer:
      'Коучинг работает с настоящим и будущим: мы не «лечим» прошлое и не даём готовых советов. Вместо этого я помогаю вам найти собственные ответы, опереться на сильные стороны и выстроить стратегию, которую вы готовы реализовать.',
  },
  {
    question: 'Как проходят сессии?',
    answer:
      'Индивидуальные встречи онлайн или очно, обычно раз в 1–2 недели. Между сессиями вы выполняете небольшие практические шаги — так изменения закрепляются в реальной жизни, а не остаются разговором.',
  },
  {
    question: 'Как понять, какая программа мне подходит?',
    answer:
      'Начните с бесплатного тестирования «На своём ли я месте?» — она покажет ваш индекс присвоенности жизни и зоны роста. После теста можно обсудить результаты на бесплатной консультации и выбрать формат работы.',
  },
  {
    question: 'Что такое сертификация ICF?',
    answer:
      'ICF (International Coaching Federation) — ведущая международная федерация коучинга. Сертификация подтверждает, что коуч прошёл аккредитованное обучение, имеет подтверждённую практику и работает по этическому кодексу ICF.',
  },
  {
    question: 'Это конфиденциально?',
    answer:
      'Да. Всё, что обсуждается на сессиях, остаётся между нами — это требование этического кодекса ICF. Персональные данные обрабатываются в соответствии с политикой конфиденциальности.',
  },
];


export function HomePage() {
  const reducedMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      {/* 1. Hero */}
      <HeroSection imageSrc="/images/trainer.png" />

      {/* 2. С чего начать */}
      <section id="journey" className="py-14 sm:py-20 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              С чего начать
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Ваш путь к программе: 3 простых шага
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.12, duration: 0.5, ease: 'easeOut' }}
              >
                {step.noLink ? (
                  <div className="group block h-full card-glass rounded-2xl p-6 sm:p-8 transition-colors duration-300 hover:border-accent/40">
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-4xl font-bold text-accent/30 group-hover:text-accent transition-colors duration-300">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{step.text}</p>
                  </div>
                ) : (
                  <Link
                    to={step.to!}
                    className="group block h-full card-glass rounded-2xl p-6 sm:p-8 transition-colors duration-300 hover:border-accent/40"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-4xl font-bold text-accent/30 group-hover:text-accent transition-colors duration-300">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-5">{step.text}</p>
                    <span className="inline-flex items-center gap-2 text-accent text-sm font-semibold">
                      {step.linkText}
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Программы */}
      <section id="programs" className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              Программы
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Выберите программу
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {PROGRAMS.map((program, index) => (
              <ProgramCard key={program.slug} program={program} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Блок доверия */}
      <section id="trust" className="py-16 sm:py-24 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              Почему мне доверяют
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Международные стандарты и реальная практика
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {trustStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="card-glass rounded-2xl p-6 text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-accent font-mono mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 card-glass rounded-2xl border border-accent/20 p-6 sm:p-8"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Award size={24} className="text-accent" />
            </div>
            <p className="text-text-secondary text-sm sm:text-base text-center sm:text-left">
              Сертификация <span className="text-white font-medium">ICF (International Coaching Federation)</span> —
              работа по международным стандартам и этическому кодексу профессии.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section id="faq" className="py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Частые вопросы
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={item.question}
                  initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
                  className="card-glass rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-white font-medium">{item.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="flex-shrink-0 text-text-muted"
                    >
                      <ChevronDown size={20} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <p className="px-5 pb-5 text-text-secondary text-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Telegram-сообщество */}
      <section id="announcements" className="py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-10 sm:mb-12"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              Сообщество
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Telegram-канал
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Подпишитесь, чтобы первыми узнавать о новых программах, тестах и полезных материалах.
            </p>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-lg mx-auto"
          >
            <a
              href="https://t.me/guzelvoice"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row items-center gap-6 card-glass rounded-2xl p-6 sm:p-8 transition-colors duration-300 hover:border-accent/40 group text-center sm:text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Send size={32} className="text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                  @guzelvoice
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  Инсайты о развитии, анонсы программ и практические инструменты — в удобном формате.
                </p>
                <span className="inline-flex items-center gap-2 text-accent text-sm font-semibold">
                  Подписаться
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 7. Финальный CTA */}
      <section className="py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center lg:text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <MessageCircle size={28} className="text-accent" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Готовы начать путь к себе?
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Оставьте заявку на бесплатную консультацию — обсудим вашу ситуацию
                и подберём формат работы, который подойдёт именно вам.
              </p>
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="card-glass rounded-2xl p-6 sm:p-8"
            >
              <ApplicationForm program="general" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
