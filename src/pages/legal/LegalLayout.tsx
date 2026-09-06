import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface TocItem {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  toc: TocItem[];
  children: ReactNode;
}

/**
 * Плейсхолдер реквизитов, которые нужно заполнить перед публикацией.
 * Выделен accent-цветом, чтобы его было видно при заполнении.
 */
export function Ph({ children }: { children: ReactNode }) {
  return (
    <span className="bg-accent/15 text-accent font-medium px-1.5 py-0.5 rounded">
      [{children}]
    </span>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">{title}</h2>
      <div className="space-y-4 text-text-secondary leading-relaxed text-sm sm:text-base">
        {children}
      </div>
    </section>
  );
}

export function LegalLayout({ title, toc, children }: LegalLayoutProps) {
  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 text-balance">
            {title}
          </h1>
          <p className="text-text-muted text-sm mb-8">
            Редакция от <Ph>УКАЗАТЬ: дата</Ph>
          </p>

          {/* Оглавление */}
          <nav
            aria-label="Содержание документа"
            className="mb-10 sm:mb-12 bg-bg-card border border-border-custom rounded-2xl p-4 sm:p-6"
          >
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Содержание
            </p>
            <ol className="space-y-2 list-decimal list-inside">
              {toc.map((item) => (
                <li key={item.id} className="text-sm">
                  <a
                    href={`#${item.id}`}
                    className="text-text-secondary hover:text-accent transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-10 sm:space-y-12">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
