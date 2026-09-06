import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { loadMetrika } from '../utils/metrika';

const CONSENT_KEY = 'cookie_consent';

export function CookieBanner() {
  const [showIcon, setShowIcon] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === null) {
      setShowIcon(true);
    } else if (consent === 'all') {
      loadMetrika();
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'all');
    loadMetrika();
    setShowPopup(false);
    setShowIcon(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'necessary');
    setShowPopup(false);
    setShowIcon(false);
  };

  return (
    <>
      {/* Floating cookie icon */}
      <AnimatePresence>
        {showIcon && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowPopup(true)}
            aria-label="Настройки cookies"
            className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-bg-card border border-border text-accent shadow-lg flex items-center justify-center hover:border-accent/40 transition-colors"
          >
            <Cookie size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Popup modal */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl"
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Cookie size={20} className="text-accent" />
                </div>
                <h3 className="text-lg font-bold text-white">Cookies</h3>
              </div>

              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Мы используем cookies для работы сайта и аналитики (Яндекс.Метрика).
                Аналитические cookies загружаются только с вашего согласия.{' '}
                <Link
                  to="/privacy"
                  className="text-accent hover:text-accent-hover underline underline-offset-2"
                >
                  Подробнее
                </Link>
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={decline}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary border border-border hover:text-white hover:border-text-muted transition-colors"
                >
                  Только необходимые
                </button>
                <button
                  type="button"
                  onClick={accept}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-bg-primary hover:bg-accent-hover transition-colors"
                >
                  Ок
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
