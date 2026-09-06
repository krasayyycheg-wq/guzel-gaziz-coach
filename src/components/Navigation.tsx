import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { ApplicationModal } from './ApplicationForm';

const navItems = [
  { label: 'О тренере', path: '/about' },
  { label: 'Программы', path: '/programs' },
  { label: 'Тесты', path: '/test/life-ownership-index' },
  { label: 'Анонсы', path: '/#announcements' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isActive = (path: string) =>
    path === '/programs'
      ? location.pathname.startsWith('/programs')
      : location.pathname === path;

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const id = path.slice(2);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tighter text-white">
                GG
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`relative text-sm transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* CTA + Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <GlowButton
                  onClick={() => setIsApplicationOpen(true)}
                  variant="primary"
                  className="!px-5 !py-2.5 text-sm"
                >
                  Записаться
                </GlowButton>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bg-primary pt-20"
          >
            <nav className="flex flex-col items-center gap-8 p-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`text-2xl font-medium ${
                      isActive(item.path) ? 'text-accent' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
              >
                <GlowButton
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsApplicationOpen(true);
                  }}
                  variant="primary"
                >
                  Записаться
                </GlowButton>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка заявки */}
      <ApplicationModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        program="general"
      />
    </>
  );
}
