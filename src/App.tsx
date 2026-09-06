import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { LifeStrategyPage } from './pages/LifeStrategyPage';
import { PublicSpeakingPage } from './pages/PublicSpeakingPage';
import { TestPage } from './pages/TestPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { ConsentPage } from './pages/legal/ConsentPage';
import { OfferPage } from './pages/legal/OfferPage';
import { TermsPage } from './pages/legal/TermsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/programs/life-strategy" element={<LifeStrategyPage />} />
          <Route path="/programs/public-speaking" element={<PublicSpeakingPage />} />
          <Route path="/test/life-ownership-index" element={<TestPage />} />
          {/* Юридические документы */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/consent" element={<ConsentPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/terms" element={<TermsPage />} />
          {/* Редирект со старого адреса */}
          <Route path="/public-speaking" element={<Navigate to="/programs/public-speaking" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
