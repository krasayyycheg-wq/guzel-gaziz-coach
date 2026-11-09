import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { sendLead } from '../lib/lead';
import { reachGoal } from '../utils/metrika';
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
  website: z.string().optional(),
  // 152-ФЗ: согласие на обработку ПДн — обязательный, НЕ проставленный по умолчанию чекбокс
  personalDataConsent: z
    .boolean()
    .refine((val) => val === true, 'Необходимо согласие на обработку персональных данных'),
  // Отдельное необязательное согласие на рекламную рассылку
  marketingConsent: z.boolean(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface ApplicationFormProps {
  /** slug программы ('life-strategy', 'public-speaking') или 'general' */
  program?: string;
  /** Компактный режим для модалки */
  compact?: boolean;
}

export function ApplicationForm({ program = 'general', compact = false }: ApplicationFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [formStartedAt] = useState(() => Date.now());
  const formId = useId();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      website: '',
      personalDataConsent: false,
      marketingConsent: false,
    },
  });

  const personalDataConsent = watch('personalDataConsent');
  const isSubmitting = status === 'loading';

  const onSubmit = async (data: ApplicationFormData) => {
    setStatus('loading');
    try {
      await sendLead({
        type: 'application',
        name: data.name,
        email: data.email,
        phone: data.phone,
        program,
        website: data.website,
        formStartedAt,
      });
      reachGoal('application_submit', { program });
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

      {/* Honeypot: человек не видит поле, автозаполняющие форму боты часто его заполняют. */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        <label htmlFor={`${formId}-website`}>Ваш сайт</label>
        <input
          {...register('website')}
          id={`${formId}-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor={`${formId}-name`} className="flex items-center gap-2 text-sm text-text-secondary mb-2">
          <User size={16} />
          Имя *
        </label>
        <input
          {...register('name')}
          id={`${formId}-name`}
          type="text"
          placeholder="Ваше имя"
          autoComplete="name"
          className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {errors.name && <p className="mt-1 text-danger text-xs">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor={`${formId}-email`} className="flex items-center gap-2 text-sm text-text-secondary mb-2">
          <Mail size={16} />
          Email *
        </label>
        <input
          {...register('email')}
          id={`${formId}-email`}
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {errors.email && <p className="mt-1 text-danger text-xs">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor={`${formId}-phone`} className="flex items-center gap-2 text-sm text-text-secondary mb-2">
          <Phone size={16} />
          Телефон
        </label>
        <input
          {...register('phone')}
          id={`${formId}-phone`}
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

  // Портал в body: без него fixed-модалка позиционируется относительно
  // анимированного родителя (transform от framer-motion) и может
  // оказаться ПОД футером или обрезаться.
  return createPortal(
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
              className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center text-text-muted hover:text-white transition-colors"
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
    </AnimatePresence>,
    document.body,
  );
}
