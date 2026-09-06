import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlowButton } from './GlowButton';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaAction?: () => void;
  secondaryCtaText?: string;
  secondaryCtaAction?: () => void;
  imageSrc?: string;
  aboutText?: string;
  children?: React.ReactNode;
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaAction,
  secondaryCtaText,
  secondaryCtaAction,
  imageSrc,
  aboutText,
  children,
}: HeroSectionProps) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Fade on scroll for homepage hero
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Staggered title animation
  const titleContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };
  const titleChar = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const },
    },
  };

  const isHomePage = !title;
  const displayTitle = isHomePage ? 'ГУЗЕЛЬ ГАЗИЗ' : title;
  const hasImage = Boolean(imageSrc);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-transparent"
    >
      <motion.div
        style={reducedMotion ? undefined : { opacity: isHomePage ? opacity : undefined }}
        className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 ${
          hasImage ? '' : 'text-center'
        }`}
      >
        <div
          className={`grid grid-cols-1 ${
            hasImage ? 'lg:grid-cols-2 gap-12 lg:gap-16' : ''
          } items-center`}
        >
          {/* Text Content */}
          <div
            className={`text-center ${
              hasImage ? 'lg:text-left' : 'max-w-3xl mx-auto'
            } ${hasImage ? 'lg:order-1' : ''}`}
          >
            {isHomePage ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="inline-block px-4 py-1.5 mb-6 text-xs sm:text-sm font-medium text-accent bg-accent/10 rounded-full border border-accent/20 backdrop-blur-sm">
                  ICF Certified Executive Coach
                </span>
              </motion.div>
            ) : (
              subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-block px-4 py-1.5 mb-6 text-xs sm:text-sm font-medium text-accent bg-accent/10 rounded-full border border-accent/20 backdrop-blur-sm">
                    {subtitle}
                  </span>
                </motion.div>
              )
            )}

            {/* Title */}
            {isHomePage ? (
              reducedMotion ? (
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
                  {displayTitle}
                </h1>
              ) : (
                <motion.h1
                  variants={titleContainer}
                  initial="hidden"
                  animate="visible"
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 tracking-tight"
                >
                  {displayTitle!.split(' ').map((word, wordIndex) => (
                    <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
                      {word.split('').map((char, index) => (
                        <motion.span
                          key={`${char}-${index}`}
                          variants={titleChar}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      ))}
                      {wordIndex < displayTitle!.split(' ').length - 1 && (
                        <motion.span variants={titleChar} className="inline-block">{'\u00A0'}</motion.span>
                      )}
                    </span>
                  ))}
                </motion.h1>
              )
            ) : (
              reducedMotion ? (
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                  {displayTitle}
                </h1>
              ) : (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6"
                >
                  {displayTitle}
                </motion.h1>
              )
            )}

            {/* Description */}
            {isHomePage ? (
              <>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-lg sm:text-xl text-white/90 font-medium mb-4 max-w-2xl mx-auto"
                >
                  Андрагог, бизнес-тренер и коуч. Занимаюсь обучением и
                  развитием взрослых более 18 лет.
                </motion.p>
                <motion.blockquote
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="relative max-w-xl mx-auto mb-10 px-6 py-4 border-l-2 border-accent/40"
                >
                  <p className="text-sm sm:text-base text-text-secondary italic leading-relaxed">
                    «Искренне считаю, что секрет успеха – в умении использовать свой личный
                    ресурс и потенциал»
                  </p>
                </motion.blockquote>
              </>
            ) : (
              description && (
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className={`text-base sm:text-lg text-text-secondary leading-relaxed mb-6 max-w-xl ${
                    hasImage ? 'mx-auto lg:mx-0' : 'mx-auto'
                  }`}
                >
                  {description}
                </motion.p>
              )
            )}

            {aboutText && (
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className={`text-sm sm:text-base text-text-secondary/80 leading-relaxed mb-8 max-w-xl ${
                  hasImage ? 'mx-auto lg:mx-0' : 'mx-auto'
                }`}
              >
                {aboutText}
              </motion.p>
            )}

            {/* Buttons */}
            {isHomePage ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 justify-center items-center"
              >
                <Link to="/about">
                  <GlowButton variant="outline">Обо мне</GlowButton>
                </Link>
                <GlowButton variant="outline" onClick={() => scrollTo('journey')}>
                  С чего начать
                </GlowButton>
                <GlowButton variant="primary" onClick={() => scrollTo('programs')}>
                  Программы
                </GlowButton>
              </motion.div>
            ) : (
              (ctaText || secondaryCtaText) && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className={`flex flex-col sm:flex-row gap-4 justify-center ${
                    hasImage ? 'lg:justify-start' : ''
                  }`}
                >
                  {ctaText && ctaAction && (
                    <GlowButton onClick={ctaAction} variant="primary">
                      {ctaText}
                    </GlowButton>
                  )}
                  {secondaryCtaText && secondaryCtaAction && (
                    <GlowButton onClick={secondaryCtaAction} variant="outline">
                      {secondaryCtaText}
                    </GlowButton>
                  )}
                </motion.div>
              )
            )}

            {children && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-10"
              >
                {children}
              </motion.div>
            )}
          </div>

          {/* Image Content */}
          {hasImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:order-2"
            >
              <div className="relative aspect-[3/4] sm:aspect-[4/5] max-w-md mx-auto lg:max-w-none">
                {/* Decorative gradient frame */}
                <div className="absolute -inset-1 rounded-[1.25rem] bg-gradient-to-br from-accent/70 via-accent/20 to-transparent opacity-80" />
                <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-accent/80 via-accent/30 to-transparent">
                  <div className="relative rounded-2xl overflow-hidden bg-transparent">
                    <img
                      src={imageSrc}
                      alt="Гузель Газиз"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        {!hasImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-text-muted"
            >
              <span className="text-xs uppercase tracking-widest">Листайте</span>
              <ArrowDown size={20} />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
