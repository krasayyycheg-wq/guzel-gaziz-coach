import { Link } from 'react-router-dom';
import { Mail, Phone, Camera, Send } from 'lucide-react';
import { Ph } from '../pages/legal/LegalLayout';

export function Footer() {
  return (
    <footer id="contacts" className="relative z-10 bg-black/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {/* Brand */}
          <div>
            <h3 className="text-base font-semibold text-white/90 mb-2">Гузель Газиз</h3>
            <p className="text-text-muted text-xs leading-relaxed">
              ICF Certified Executive Coach. Помогаю людям найти свою траекторию развития и научиться публичным выступлениям.
            </p>
            <div className="flex gap-4 pt-3">
              <a href="#" className="text-text-muted hover:text-accent transition-colors" aria-label="Instagram">
                <Camera size={18} />
              </a>
              <a
                href="https://t.me/guzelvoice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-accent transition-colors"
                aria-label="Telegram"
              >
                <Send size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-medium text-white/70 mb-3 uppercase tracking-wider">Программы</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li><Link to="/programs/life-strategy" className="hover:text-accent transition-colors">Личный трек развития</Link></li>
              <li><Link to="/programs/public-speaking" className="hover:text-accent transition-colors">Публичные выступления</Link></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="text-xs font-medium text-white/70 mb-3 uppercase tracking-wider">Контакты</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li><a href="mailto:info@guzelgaziz.ru" className="flex items-center gap-2 hover:text-accent transition-colors"><Mail size={14} />info@guzelgaziz.ru</a></li>
              <li><a href="tel:+79999999999" className="flex items-center gap-2 hover:text-accent transition-colors"><Phone size={14} />+7 (999) 999-99-99</a></li>
              <li><a href="https://t.me/guzelvoice" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors"><Send size={14} />@guzelvoice</a></li>
            </ul>
          </div>

          {/* Юридические документы */}
          <div>
            <h4 className="text-xs font-medium text-white/70 mb-3 uppercase tracking-wider">Документы</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Политика конфиденциальности</Link></li>
              <li><Link to="/consent" className="hover:text-accent transition-colors">Согласие на обработку ПДн</Link></li>
              <li><Link to="/offer" className="hover:text-accent transition-colors">Публичная оферта</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors">Пользовательское соглашение</Link></li>
            </ul>
          </div>
        </div>

        {/* Реквизиты — компактная служебная строка */}
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-text-muted">
          <span className="text-white/60 uppercase tracking-wider">Реквизиты</span>
          <Ph>УКАЗАТЬ: ФИО / статус ИП или самозанятого</Ph>
          <span>ИНН <Ph>УКАЗАТЬ</Ph></span>
          <span>email <Ph>УКАЗАТЬ</Ph></span>
          <span>телефон <Ph>УКАЗАТЬ</Ph></span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-text-muted/80">
          <p>Персональные данные обрабатываются на территории Российской Федерации.</p>
          <p>© {new Date().getFullYear()} Гузель Газиз. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
