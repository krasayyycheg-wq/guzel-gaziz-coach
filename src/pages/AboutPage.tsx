import { motion, useReducedMotion } from 'framer-motion';
import { Award, Compass, HeartHandshake, ShieldCheck, Target } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { FeatureGrid } from '../components/FeatureGrid';
import { ApplicationForm } from '../components/ApplicationForm';

// TODO(контент): заменить плейсхолдеры биографии, регалий и цифр на реальные данные клиента
const stats = [
  { value: '10+', label: 'лет практики' },
  { value: '500+', label: 'часов индивидуального коучинга' },
  { value: '100+', label: 'клиентов и трансформаций' },
  { value: 'ICF', label: 'международная сертификация' },
];

const credentials = [
  'ICF Certified Executive Coach — сертификация International Coaching Federation',
  'Аккредитованная программа обучения коучингу по стандартам ICF',
  'Регулярная супервизия и профессиональное развитие',
  'Работа по этическому кодексу ICF',
];

const approachFeatures = [
  {
    icon: Compass,
    title: 'Опора на ваши ценности',
    description:
      'Мы не навязываем готовые решения — стратегия строится из ваших ценностей, сильных сторон и реального контекста жизни.',
  },
  {
    icon: Target,
    title: 'Фокус на результате',
    description:
      'Каждая сессия завершается конкретными шагами. Изменения закрепляются в делах, а не остаются на уровне разговоров.',
  },
  {
    icon: ShieldCheck,
    title: 'Конфиденциальность',
    description:
      'Всё, что звучит на сессиях, остаётся между нами — это требование этического кодекса ICF и основа доверия.',
  },
  {
    icon: HeartHandshake,
    title: 'Партнёрство, а не инструктаж',
    description:
      'Я не «веду» вас за руку — я рядом как равный партнёр, который помогает увидеть больше и выбрать своё.',
  },
];

export function AboutPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pt-24 sm:pt-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
        <BackButton />
      </div>

      {/* Заголовок */}
      <section className="pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              О тренере
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Гузель Газиз
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              ICF Certified Executive Coach. Помогаю людям вернуть себе авторство
              собственной жизни и научиться говорить так, чтобы их слышали.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Фото */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative max-w-md mx-auto"
          >
            {/* Decorative gradient frame */}
            <div className="absolute -inset-1 rounded-[1.25rem] bg-gradient-to-br from-accent/70 via-accent/20 to-transparent opacity-80" />
            <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-accent/80 via-accent/30 to-transparent">
              <div className="relative rounded-2xl overflow-hidden bg-transparent aspect-[4/5]">
                <img
                  src="/images/trainer.png"
                  alt="Гузель Газиз — executive coach"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Биография */}
      <section className="py-16 sm:py-24 bg-bg-secondary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Биография</h2>
            {/* TODO(контент): заменить на реальную биографию клиента */}
            <div className="space-y-5 text-text-secondary leading-relaxed">
              <p>
                Мой путь в коучинг начался с собственного вопроса: «Почему при внешнем
                успехе внутри так мало ощущения, что это — моя жизнь?» Поиск ответа привёл
                меня к профессиональному обучению коучингу по стандартам ICF и многолетней
                практике с руководителями и профессионалами.
              </p>
              <p>
                Сегодня я работаю с людьми, которые стоят на развилке: карьерный рост
                перестал приносить энергию, привычные опоры перестали работать, а впереди —
                непонятно что. Вместе мы разбираемся, что для вас действительно важно,
                и выстраиваем стратегию, которую вы готовы присвоить и реализовать.
              </p>
              <p>
                Отдельное направление моей практики — публичные выступления: я помогаю
                превратить страх сцены в ресурс и научиться говорить убедительно перед
                любой аудиторией.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Регалии ICF */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Award size={24} className="text-accent" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Регалии и сертификация</h2>
            </div>
            {/* TODO(контент): уточнить точные регалии, уровень сертификации ICF (ACC/PCC) и программы обучения */}
            <ul className="space-y-4">
              {credentials.map((item, index) => (
                <motion.li
                  key={item}
                  initial={reducedMotion ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
                  className="flex items-start gap-3 bg-bg-card rounded-xl border border-border p-4 sm:p-5"
                >
                  <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="text-text-secondary text-sm sm:text-base">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Подход к работе */}
      <section className="py-16 sm:py-24 bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Подход к работе
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Принципы, на которых строится каждая сессия и каждая программа.
            </p>
          </div>

          <FeatureGrid features={approachFeatures} columns={2} />
        </div>
      </section>

      {/* Цифры */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="bg-bg-card rounded-2xl border border-border p-6 text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-accent font-mono mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Подать заявку
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Первая встреча — бесплатная. Познакомимся, обсудим ваш запрос
                и поймём, подходим ли мы друг другу для работы.
              </p>
            </div>

            <div className="bg-bg-card rounded-2xl border border-border p-6 sm:p-8">
              <ApplicationForm program="general" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
