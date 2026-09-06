import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowRight, User, Mail, Phone, Shield } from 'lucide-react';
import { useState } from 'react';

const contactSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50, 'Имя слишком длинное'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().optional(),
  agreed: z.boolean().refine((val) => val === true, 'Необходимо согласие'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  onSkip: () => void;
}

export function ContactForm({ onSubmit, onSkip }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      agreed: false,
    },
  });

  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-20"
    >
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
          Почти готово
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Получите полный отчёт
        </h2>
        <p className="text-text-secondary">
          Оставьте контакты, и мы пришлём вам детальный разбор результатов
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <User size={16} />
            Имя *
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Ваше имя"
            className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {errors.name && (
            <p className="mt-1 text-danger text-xs">{errors.name.message}</p>
          )}
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
            className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {errors.email && (
            <p className="mt-1 text-danger text-xs">{errors.email.message}</p>
          )}
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
            className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center mt-0.5">
              <input
                {...register('agreed')}
                type="checkbox"
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-text-muted rounded peer-checked:bg-accent peer-checked:border-accent transition-colors" />
              <Shield size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-bg-primary opacity-0 peer-checked:opacity-100" />
            </div>
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              Я согласен на обработку персональных данных и получение результатов *
            </span>
          </label>
          {errors.agreed && (
            <p className="mt-1 text-danger text-xs">{errors.agreed.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-4 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-hover transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Отправка...' : 'Получить отчёт'}
            <ArrowRight size={18} />
          </button>
          
          <button
            type="button"
            onClick={onSkip}
            className="w-full px-8 py-3 border border-white/20 text-text-secondary rounded-lg hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            Пропустить и посмотреть результат
          </button>
        </div>
      </form>
    </motion.div>
  );
}
