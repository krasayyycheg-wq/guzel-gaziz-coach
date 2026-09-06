import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Shield,
  Send,
  User,
  X,
} from 'lucide-react';

const applicationSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя слишком длинное'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().optional(),
  // 152-ФЗ: согласие на обработку ПДн — обязательный, НЕ проставленный по умолчанию чекбокс
  personalDataConsent: z
    .boolean()
    .refine((val) => val === true, 'Необходимо согласие на обработку персональных данных'),
  // Отдельное необязательное согласие на рекламную рассылку
  marketingConsent: z.boolean(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationPayload extends ApplicationFormData {
  program: string;
  timestamp: string;
  page: string;
  utm: Record<string, string>;
}

function collectUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    const value = params.get(key);
    if (value) utm[key] = value;
  });
  return utm;
}

// TODO(этап 2 — интеграция заявок): заменить заглушку на реальный fetch
// на российский endpoint, например:
//   await fetch('/api/submit-form', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   });
// Целевая цепочка: Vercel Function (api/submit-form.ts) → Google Apps Script → Яндекс Таблица.
async function submitApplication(payload: ApplicationPayload): Promise<void> {
  console.log('[ApplicationForm] Заявка (payload для будущего endpoint):', payload);
  // Имитация сетевого запроса
  await new Promise((resolve) => setTimeout(resolve, 900));
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface ApplicationFormProps {
  /** slug программы ('life-strategy', 'public-speaking') или 'general' */
  program?: string;
  /** Компактный режим для модалки */
  compact?: boolean;
}

export function ApplicationForm({ program = 'general', compact = false }: ApplicationFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      personalDataConsent: false,
      marketingConsent: false,
    },
  });

  const personalDataConsent = watch('personalDataConsent');
  const isSubmitting = status === 'loading';

  const onSubmit = async (data: ApplicationFormData) => {
    setStatus('loading');
    try {
      await submitApplication({
        ...data,
        program,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        utm: collectUtmParams(),
      });
      setStatus('success');
    } catch (error) {
      console.error('[ApplicationForm] Ошибка отправки:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle2 size={32} className="text-success" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white mb-2">Заявка отправлена!</h3>
        <p className="text-text-secondary text-sm">
          Мы свяжемся с вами в течение дня
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={compact ? 'space-y-4' : 'space-y-5'}>
      {/* Скрытое поле — slug программы передаётся в payload из пропса */}
      <input type="hidden" value={program} readOnly />

      <div>
        <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
          <User size={16} />
          Имя *
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="Ваше имя"
          autoComplete="name"
          className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {errors.name && <p className="mt-1 text-danger text-xs">{errors.name.message}</p>}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
          <Mail size={16} />
          Email *
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {errors.email && <p className="mt-1 text-danger text-xs">{errors.email.message}</p>}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
          <Phone size={16} />
          Телефон
        </label>
        <input
          {...register('phone')}
          type="tel"
          placeholder="+7 (999) 999-99-99"
          autoComplete="tel"
          className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Согласие на обработку ПДн (152-ФЗ) — обязательное, по умолчанию не проставлено */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center mt-0.5">
            <input {...register('personalDataConsent')} type="checkbox" className="peer sr-only" />
            <div className="w-5 h-5 border-2 border-text-muted rounded peer-checked:bg-accent peer-checked:border-accent transition-colors" />
            <Shield
              size={12}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-bg-primary opacity-0 peer-checked:opacity-100"
            />
          </div>
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            Я даю{' '}
            <Link to="/consent" className="text-accent hover:text-accent-hover underline underline-offset-2">
              согласие на обработку персональных данных
            </Link>{' '}
            в соответствии с{' '}
            <Link to="/privacy" className="text-accent hover:text-accent-hover underline underline-offset-2">
              политикой конфиденциальности
            </Link>{' '}
            *
          </span>
        </label>
        {errors.personalDataConsent && (
          <p className="mt-1 text-danger text-xs">{errors.personalDataConsent.message}</p>
        )}
      </div>

      {/* Согласие на рекламную рассылку — отдельное, необязательное */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center mt-0.5">
            <input {...register('marketingConsent')} type="checkbox" className="peer sr-only" />
            <div className="w-5 h-5 border-2 border-text-muted rounded peer-checked:bg-accent peer-checked:border-accent transition-colors" />
            <Send
              size={12}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-bg-primary opacity-0 peer-checked:opacity-100"
            />
          </div>
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            Я согласен(на) получать полезные материалы и предложения
          </span>
        </label>
      </div>

      {status === 'error' && (
        <p className="text-danger text-sm text-center">
          Не удалось отправить заявку. Попробуйте ещё раз или напишите нам на почту.
        </p>
      )}

      <motion.button
        type="submit"
        disabled={!personalDataConsent || isSubmitting}
        whileHover={{ scale: !personalDataConsent || isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: !personalDataConsent || isSubmitting ? 1 : 0.98 }}
        className="w-full px-8 py-4 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-hover transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            Подать заявку
            <ArrowRight size={18} />
          </>
        )}
      </motion.button>
    </form>
  );
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** slug программы ('life-strategy', 'public-speaking') или 'general' */
  program?: string;
  title?: string;
  subtitle?: string;
}

export function ApplicationModal({
  isOpen,
  onClose,
  program = 'general',
  title = 'Подать заявку',
  subtitle = 'Оставьте контакты, и мы свяжемся с вами в течение дня',
}: ApplicationModalProps) {
  // Закрытие по Escape + блокировка скролла фона
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-bg-secondary rounded-2xl border border-border p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]"
          >
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="mb-6 pr-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h3>
              <p className="text-text-secondary text-sm">{subtitle}</p>
            </div>
            <ApplicationForm program={program} compact />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
