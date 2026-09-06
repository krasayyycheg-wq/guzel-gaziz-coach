import { Link } from 'react-router-dom';
import { Mail, Phone, Camera, Send } from 'lucide-react';
import { Ph } from '../pages/legal/LegalLayout';

export function Footer() {
  return (
    <footer id="contacts" className="bg-bg-secondary border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Гузель Газиз
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              ICF Certified Executive Coach. Помогаю людям найти свою траекторию развития и научиться публичным выступлениям.
            </p>
            <div className="flex gap-4 pt-4">
              <a
                href="#"
                className="text-text-secondary hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Camera size={20} />
              </a>
              <a
                href="https://t.me/guzelvoice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent transition-colors"
                aria-label="Telegram"
              >
                <Send size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">
              Программы
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  Личный трек развития
                </Link>
              </li>
              <li>
                <Link
                  to="/public-speaking"
                  className="text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  Публичные выступления
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты компактно */}
          <div>
            <h4 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">
              Контакты
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@guzelgaziz.ru"
                  className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  <Mail size={16} />
                  info@guzelgaziz.ru
                </a>
              </li>
              <li>
                <a
                  href="tel:+79999999999"
                  className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  <Phone size={16} />
                  +7 (999) 999-99-99
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/guzelvoice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  <Send size={16} />
                  Telegram: @guzelvoice
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Юридический блок */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Реквизиты */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">
                Реквизиты
              </h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <Ph>УКАЗАТЬ: ФИО / статус ИП или самозанятого</Ph>
                </li>
                <li>
                  ИНН <Ph>УКАЗАТЬ</Ph>
                </li>
                <li>
                  email <Ph>УКАЗАТЬ</Ph>
                </li>
                <li>
                  телефон <Ph>УКАЗАТЬ</Ph>
                </li>
              </ul>
            </div>

            {/* Юридические документы */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">
                Документы
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/privacy"
                    className="text-text-secondary hover:text-accent transition-colors text-sm"
                  >
                    Политика конфиденциальности
                  </Link>
                </li>
                <li>
                  <Link
                    to="/consent"
                    className="text-text-secondary hover:text-accent transition-colors text-sm"
                  >
                    Согласие на обработку ПДн
                  </Link>
                </li>
                <li>
                  <Link
                    to="/offer"
                    className="text-text-secondary hover:text-accent transition-colors text-sm"
                  >
                    Публичная оферта
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-text-secondary hover:text-accent transition-colors text-sm"
                  >
                    Пользовательское соглашение
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-text-muted text-xs mt-8">
            Персональные данные обрабатываются на территории Российской Федерации.
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-text-muted text-xs text-center">
            © {new Date().getFullYear()} Гузель Газиз. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
