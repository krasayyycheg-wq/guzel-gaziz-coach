import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Compass, Mic, Target, Users, Zap } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { HeroSection } from '../components/HeroSection';
import { GlowButton } from '../components/GlowButton';
import { ApplicationForm } from '../components/ApplicationForm';

const audienceGroups = [
  {
    num: '01',
    title: 'Руководители и топ-менеджеры',
    tag: 'Статус требует',
    desc: 'Когда от вашей речи зависят решения инвесторов, настроение команды и имидж компании',
    quotes: [
      'Нужно убедительно доносить стратегию до команды',
      'Боюсь выглядеть неуверенно на совете директоров',
      'Хочу, чтобы меня слушали, а не просто слышали',
      'Как выступать на камеру без дискомфорта?',
    ],
  },
  {
    num: '02',
    title: 'Эксперты и спикеры',
    tag: 'Масштаб влияния',
    desc: 'Когда знаний много, но они не конвертируются в доход и признание из-за слабой подачи',
    quotes: [
      'Пишу классные посты, но на сцене теряюсь',
      'Хочу брать больше за выступления',
      'Не умею вовлекать аудиторию с первых минут',
      'Как продавать сцену, не продавая?',
    ],
  },
  {
    num: '03',
    title: 'Предприниматели и фрилансеры',
    tag: 'Продажи через речь',
    desc: 'Когда каждый питч — это либо контракт, либо провал, и от вашей уверенности зависит выручка',
    quotes: [
      'Нужно закрывать клиентов на встречах',
      'На презентациях меняюсь в лице и сбиваюсь',
      'Как говорить так, чтобы хотели купить?',
      'Хочу вести переговоры без дрожи в голосе',
    ],
  },
  {
    num: '04',
    title: 'Те, кто боится микрофона',
    tag: 'Страх сцены',
    desc: 'Когда даже мысль о публичном выступлении вызывает тревогу, потливость и желание сбежать',
    quotes: [
      'Стою у микрофона и забываю всё на свете',
      'Сердце колотится так, что не могу говорить',
      'Боюсь, что меня раскритикуют публично',
      'Хочу спокойно выступать, как это делают другие',
    ],
  },
];

const sessions = [
  {
    num: '01',
    title: 'ДИАГНОСТИКА. КТО Я НА СЦЕНЕ?',
    desc: 'Проведём аудит вашего текущего уровня и поймём, с чего начинать именно вам.',
    points: [
      'Выявим ваши сильные стороны как спикера и зоны, которые дадут быстрый рост',
      'Определим ваш «спикерский архетип» — в чём ваша уникальность на сцене',
      'Разберём конкретные ситуации, где вы теряете уверенность',
    ],
    result: 'Вы точно знаете, какие 2–3 навыка дадут вам максимальный эффект за минимальное время.',
  },
  {
    num: '02',
    title: 'СТРУКТУРА И СЮЖЕТ. КАК УДЕРЖАТЬ ВНИМАНИЕ?',
    desc: 'Научимся строить речь так, чтобы аудитория не отвлекалась на телефон даже через 30 минут.',
    points: [
      'Освоите 3 проверенные структуры выступлений: для продаж, для вдохновения, для обучения',
      'Научитесь открываться с «крючка» — первые 60 секунд, которые решают всё',
      'Разберём, как использовать истории, цифры и паузы для максимального вовлечения',
    ],
    result: 'Вы сможете готовить выступления в 2 раза быстрее и знать точно, что аудитория дослушает до конца.',
  },
  {
    num: '03',
    title: 'ТЕЛО И ГОЛОС. ЯЗЫК УВЕРЕННОСТИ.',
    desc: 'Поработаем над невербаликой: когда тело и голос говорят «я авторитет» ещё до первого слова.',
    points: [
      'Освоите техники управления голосом: громкость, темп, интонация, силу слова',
      'Научитесь занимать пространство сцены и использовать жесты убедительно, а не отвлекающе',
      'Разберём, как скрывать волнение и выглядеть спокойным даже когда внутри буря',
    ],
    result: 'Ваше присутствие на сцене меняется — люди начинают воспринимать вас как эксперта до того, как вы скажете суть.',
  },
  {
    num: '04',
    title: 'ИМПРОВИЗАЦИЯ И СЛОЖНЫЕ СИТУАЦИИ.',
    desc: 'Подготовимся к тому, что пойдёт не по плану: вопросы из зала, сбои, негатив, неожиданные повороты.',
    points: [
      'Научитесь держать связь с аудиторией при отвлечениях и технических сбоях',
      'Освоите техники ответов на каверзные вопросы без агрессии и потери лица',
      'Потренируем импровизацию: как говорить красиво, даже если забыли текст',
    ],
    result: 'Вы перестанете бояться «что если» и будете чувствовать себя хозяином ситуации в любых условиях.',
  },
  {
    num: '05',
    title: 'ПРАКТИКА И ЛИЧНЫЙ БРЕНД СПИКЕРА.',
    desc: 'Закрепим навыки на реальных выступлениях и спроектируем ваш путь как спикера.',
    points: [
      'Проведём финальное выступление с разбором и обратной связью',
      'Составим план развития вашего спикерского бренда: где выступать, как продавать себя',
      'Определим конкретные шаги на ближайшие 3–6 месяцев для масштабирования',
    ],
    result: 'У вас есть записанное выступление, которое можно использовать как портфолио, и чёткий план дальнейшего роста.',
  },
];

export function PublicSpeakingPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
        <BackButton />
      </div>

      <HeroSection
        title="Публичные выступления"
        subtitle="Курс ораторского мастерства"
        description="Научитесь выступать уверенно, убедительно и естественно. Превратите страх сцены в ваше преимущество и научитесь вдохновлять любую аудиторию."
        ctaText="Подать заявку"
        ctaAction={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
        secondaryCtaText="Узнать подробнее"
        secondaryCtaAction={() => {
          document.getElementById('about-speaking')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Для кого программа */}
      <section id="about-speaking" className="py-16 sm:py-24 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              Аудитория
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Для кого программа?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {audienceGroups.map((group, index) => (
              <motion.div
                key={group.num}
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="card-glass rounded-2xl p-6 sm:p-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="font-mono text-4xl font-bold text-accent/40">{group.num}</span>
                  <span className="px-3 py-1 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
                    {group.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{group.title}</h3>
                <p className="text-text-secondary text-sm mb-4">{group.desc}</p>
                <ul className="space-y-2">
                  {group.quotes.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-accent mt-1 flex-shrink-0">·</span>
                      <span>«{q}»</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Программа курса */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              Программа курса
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              5 модулей от страха до уверенности на сцене
            </h2>
          </motion.div>

          <div className="space-y-6">
            {sessions.map((session, index) => (
              <motion.div
                key={session.num}
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
                className="card-glass rounded-2xl p-6 sm:p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-2">
                    <span className="font-mono text-5xl font-bold text-accent/30">{session.num}</span>
                    <div className="text-xs uppercase tracking-wider text-text-muted mt-1">Модуль</div>
                  </div>
                  <div className="lg:col-span-7">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{session.title}</h3>
                    <p className="text-text-secondary text-sm mb-4">{session.desc}</p>
                    <ul className="space-y-2">
                      {session.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="text-accent mt-1 flex-shrink-0">·</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:col-span-3">
                    <div className="bg-accent/5 rounded-xl border border-accent/10 p-4">
                      <div className="text-xs uppercase tracking-wider text-accent mb-2">Результат</div>
                      <p className="text-sm text-text-secondary leading-relaxed">{session.result}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Формат и стоимость */}
      <section className="py-16 sm:py-24 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              Инвестиция
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Формат и стоимость
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
            {[
              { label: 'Длительность', value: '5 модулей по 2 часа', icon: Target },
              { label: 'Формат', value: 'Онлайн (Zoom) или офлайн (г. Казань)', icon: Users },
              { label: 'Длительность курса', value: '~2 месяца', icon: Zap },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="card-glass rounded-2xl p-6 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon size={20} className="text-accent" />
                </div>
                <div className="text-xs uppercase tracking-wider text-text-muted mb-1">{item.label}</div>
                <div className="text-white font-medium text-sm">{item.value}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="card-glass rounded-3xl border border-accent/20 p-8 sm:p-12 text-center"
          >
            <div className="text-xs uppercase tracking-wider text-text-muted mb-2">Полный курс</div>
            <div className="text-4xl sm:text-5xl font-bold text-accent font-mono mb-2">65 000 ₽</div>
            <div className="text-text-secondary text-sm mb-6">или 13 000 ₽ за модуль при оплате поэтапно</div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                <span className="text-accent text-sm font-medium">Скидка 10%</span>
                <span className="text-text-secondary text-sm">При единовременной оплате — 58 500 ₽</span>
              </div>

              <GlowButton onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })} variant="primary">
                Подать заявку
              </GlowButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Запись на консультацию */}
      <section id="consultation" className="py-16 sm:py-24">
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
                <Mic size={28} className="text-accent" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Записаться на консультацию
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Оставьте заявку на бесплатную консультацию — обсудим ваши задачи
                и подберём формат, который поможет вам уверенно выступать
                перед любой аудиторией.
              </p>
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="card-glass rounded-2xl p-6 sm:p-8"
            >
              <ApplicationForm program="public-speaking" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Навигация на другую программу */}
      <section className="py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
              Другое направление
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Также смотрите
            </h2>
            <p className="text-text-secondary mb-8 max-w-xl mx-auto">
              Если ваша цель — найти свою траекторию развития и вернуть авторство жизни
            </p>
            <button
              onClick={() => navigate('/programs/life-strategy')}
              className="inline-flex items-center gap-3 card-glass rounded-2xl p-6 sm:p-8 hover:border-accent/40 transition-colors group text-left w-full max-w-lg mx-auto"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Compass size={24} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-accent font-medium mb-1">Программа трансформации</div>
                <div className="text-white font-semibold text-lg">Личная стратегия развития</div>
              </div>
              <ArrowRight size={20} className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
