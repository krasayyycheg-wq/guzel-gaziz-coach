import type { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { AnimatedBackground } from './AnimatedBackground';
import { CookieBanner } from './CookieBanner';
import { ScrollToTop } from './ScrollToTop';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg-primary relative">
      <AnimatedBackground />
      <Navigation />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <Footer />
      <CookieBanner />
      <ScrollToTop />
    </div>
  );
}
