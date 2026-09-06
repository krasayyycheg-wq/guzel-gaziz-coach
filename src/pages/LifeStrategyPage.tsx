import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Mic, Target, Users, Zap } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { HeroSection } from '../components/HeroSection';
import { GlowButton } from '../components/GlowButton';

const audienceGroups = [
  {
    num: '01',
    title: 'Те, кто потерял ориентиры',
    tag: 'Синдром неопределённости',
    desc: 'Когда вы понимаете, что хотите перемен, но не знаете, каких именно',
    quotes: [
      'Хочу разобраться, чего хочу на самом деле',
      'Вроде бы всё хорошо, но что-то не так',
      'Хочу что-то поменять в своей жизни, но не понимаю, что',
      'Хочу понять, что для меня действительно важно',
    ],
  },
  {
    num: '02',
    title: 'Те, кто уперся в потолок',
    tag: 'Кризис роста',
    desc: 'Когда есть достижения, но они больше не драйвят и появляется страх, что выше уже не прыгнуть',
    quotes: [
      'Чувствую, что достиг потолка',
      'Как открыть второе дыхание?',
      'Как выйти на новый профессиональный уровень?',
      'Хочу понять, в чём мой потенциал?',
    ],
  },
  {
    num: '03',
    title: 'Те, кто боится нового статуса',
    tag: 'Синдром самозванца',
    desc: 'Когда вы не можете присвоить себе свои достижения и двигаться дальше',
    quotes: [
      'Меня только что повысили, не знаю, справлюсь ли',
      'Хочу поменять место работы, но не знаю, куда',
      'Хочу принимать важные решения, но боюсь сказать своё мнение',
      'Хочу быть более уверенным',
    ],
  },
  {
    num: '04',
    title: 'Те, кто выгорел',
    tag: 'Хочет насыщенной жизни',
    desc: 'Когда появляется желание вернуть в жизнь маленькие радости, а не просто деньги',
    quotes: [
      'У меня есть чувство, что жизнь проходит мимо',
      'Я ничего не успеваю, жить тоже не успеваю',
      'Не хочу работать, но хочу реализации. Это нормально?',
      'Хочу начать получать удовольствие от своего дела',
    ],
  },
];

const sessions = [
  {
    num: '01',
    title: 'ТОЧКА ОПОРЫ. КТО Я СЕЙЧАС?',
    desc: 'Мы проведём ревизию вашего текущего состояния без оценок «хорошо/плохо».',
    points: [
      'Выявим ваши сильные стороны и зоны роста',
      'Определим ваш уникальный талант и способы его реализации',
      'Проанализируем доминирующий стиль поведения и поймём, где он работает, а где требует адаптации',
    ],
    result: 'Вы обретёте внутреннюю опору, которая не зависит от должности, зарплаты и мнения окружающих. Теперь вы точно знаете, на что опираться в любых жизненных выборах.',
  },
  {
    num: '02',
    title: 'ЧТО МНЮ ДВИЖЕТ И ЧТО МНЕ НУЖНО?',
    desc: 'Разберёмся с драйверами вашего поведения — часто мы бежим не туда, потому что не слышим своих истинных желаний.',
    points: [
      'Определим ваши истинные потребности и глубинные мотиваторы, найдём способы их экологичной реализации в работе и жизни',
      'Бонусом выявим вашу главную потребность в коммуникациях и как это можно использовать для достижения своих целей',
    ],
    result: 'Вы научитесь видеть и применять то, что даёт вам в жизни удовлетворение и энергию.',
  },
  {
    num: '03',
    title: 'ФУНДАМЕНТ ЛИЧНОСТИ. ВО ЧТО Я ВЕРЮ.',
    desc: 'Это сердце программы. Проработаем уровень ценностей и убеждений — туда, где часто лежат главные ограничения.',
    points: [
      'Выявим ваши истинные ценности и проверим, насколько им соответствует ваша текущая жизнь',
      'Исследуем ограничивающие убеждения и инструменты их трансформации',
    ],
    result: 'Список ценностей как критериев принятия решений и устранённые внутренние барьеры.',
  },
  {
    num: '04',
    title: 'ОБРАЗ БУДУЩЕГО. КЕМ Я СТАНУ.',
    desc: 'Самый вдохновляющий этап. Мы спроектируем видение будущего.',
    points: [
      'Сформируем чёткий образ вашего желаемого состояния через 5–7 лет',
      'Разработаем стратегию формирования вашего личного бренда, которая будет поддерживать это видение',
      'Соединим ваш образ с рынком и средой, в которой вы хотите быть',
    ],
    result: 'Яркая, энергетически заряженная картина будущего, которая даёт ответ на вопрос «куда идти».',
  },
  {
    num: '05',
    title: 'ПЛАН ДЕЙСТВИЙ. ПЕРВЫЙ ШАГ.',
    desc: 'Переведём видение в плоскость конкретики и первых шагов.',
    points: [
      'Определим верхнеуровневые цели на ближайший год',
      'Составим пошаговый план действий, включающий развитие нужных компетенций и выстраивание полезного нетворкинга',
      'Закрепим систему поддержки, чтобы после сессий вы не скатились в старые сценарии',
    ],
    result: 'Готовая дорожная карта с конкретными действиями на год.',
  },
];

export function LifeStrategyPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
        <BackButton />
      </div>

      <HeroSection
        title="Личная стратегия развития"
        subtitle="Программа трансформации"
        description="Индивидуальная программа из 5 сессий для тех, кто чувствует, что живёт «по чужому ТЗ», и хочет вернуть себе авторство собственной жизни."
        ctaText="Пройти тестирование"
        ctaAction={() => navigate('/test/life-ownership-index')}
        secondaryCtaText="Узнать подробнее"
        secondaryCtaAction={() => {
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Для кого программа */}
      <section id="about" className="py-16 sm:py-24 border-y border-white/5">
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
              5 сессий по 2 часа · Индивидуальный формат
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
                    <div className="text-xs uppercase tracking-wider text-text-muted mt-1">Сессия</div>
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
              { label: 'Длительность', value: '5 сессий по 2 часа', icon: Target },
              { label: 'Формат', value: 'Онлайн (Zoom) или офлайн (г. Казань)', icon: Users },
              { label: 'Длительность программы', value: '~2 месяца', icon: Zap },
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
            <div className="text-xs uppercase tracking-wider text-text-muted mb-2">Полная программа</div>
            <div className="text-4xl sm:text-5xl font-bold text-accent font-mono mb-2">75 000 ₽</div>
            <div className="text-text-secondary text-sm mb-6">или 15 000 ₽ за сессию при оплате поэтапно</div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                <span className="text-accent text-sm font-medium">Скидка 10%</span>
                <span className="text-text-secondary text-sm">При единовременной оплате — 67 500 ₽</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <GlowButton onClick={() => navigate('/test/life-ownership-index')} variant="primary">
                  Подать заявку
                </GlowButton>
                <span className="text-text-muted text-xs">Первая встреча бесплатная</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Навигация на другую программу */}
      <section className="py-16 sm:py-24">
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
              Если ваша цель — уверенность на сцене и мастерство публичных выступлений
            </p>
            <button
              onClick={() => navigate('/programs/public-speaking')}
              className="inline-flex items-center gap-3 card-glass rounded-2xl p-6 sm:p-8 hover:border-accent/40 transition-colors group text-left w-full max-w-lg mx-auto"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Mic size={24} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-accent font-medium mb-1">Курс ораторского мастерства</div>
                <div className="text-white font-semibold text-lg">Публичные выступления</div>
              </div>
              <ArrowRight size={20} className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
