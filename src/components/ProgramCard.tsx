import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight, ClipboardCheck, UserCheck, Users } from 'lucide-react';
import type { ProgramInfo } from '../data/programs';

interface ProgramCardProps {
  program: ProgramInfo;
  index?: number;
}

const typeConfig = {
  individual: {
    label: 'Индивидуальная',
    icon: UserCheck,
    color: 'text-accent bg-accent/10 border-accent/20',
  },
  group: {
    label: 'Групповая',
    icon: Users,
    color: 'text-green-400 bg-green-400/10 border-green-400/20',
  },
};

/**
 * Карточка программы: scroll-reveal снизу с каскадной задержкой,
 * hover — 3D-tilt (rotateX/rotateY по положению курсора) + светящаяся жёлтая рамка.
 * При prefers-reduced-motion tilt отключён.
 */
export function ProgramCard({ program, index = 0 }: ProgramCardProps) {
  const reducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width);
    mouseY.set((event.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const typeInfo = typeConfig[program.type];
  const TypeIcon = typeInfo.icon;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: 'easeOut' }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={
          reducedMotion
            ? undefined
            : { rotateX, rotateY, transformStyle: 'preserve-3d' }
        }
        className="group relative h-full flex flex-col card-glass rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-accent/60 hover:shadow-[0_0_40px_rgba(255,214,0,0.15)]"
      >
        {/* Top row: badge + type indicator */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="inline-block px-3 py-1 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
            {program.badge}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${typeInfo.color}`}
          >
            <TypeIcon size={12} />
            {typeInfo.label}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{program.title}</h3>

        <div className="space-y-4 mb-6 flex-1">
          <div>
            <div className="text-xs uppercase tracking-wider text-text-muted mb-1">Для кого</div>
            <p className="text-text-secondary text-sm leading-relaxed">{program.audience}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-text-muted mb-1">Результат</div>
            <p className="text-text-secondary text-sm leading-relaxed">{program.result}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-text-muted mb-1">Формат</div>
            <p className="text-white text-sm font-medium">{program.format}</p>
          </div>
        </div>

        {/* Test badge */}
        <div className="space-y-3 mb-6">
          {program.testSlug && (
            <Link
              to={program.testSlug}
              className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-accent/30 hover:bg-white/[0.05] transition-colors group/test"
            >
              <ClipboardCheck size={18} className="text-accent flex-shrink-0" />
              <span className="text-sm text-text-secondary group-hover/test:text-white transition-colors">
                Пройдите тест, чтобы узнать — нужна ли вам эта программа
              </span>
            </Link>
          )}
        </div>

        <Link
          to={`/programs/${program.slug}`}
          className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-hover transition-colors group-hover:gap-3"
        >
          Подробнее
          <ArrowRight size={18} />
        </Link>
      </motion.div>
    </motion.div>
  );
}
