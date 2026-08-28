/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Home from './pages/Home';
import { useSettingsStore } from './stores/useSettingsStore';
import { useLanguageStore } from './stores/useLanguageStore';
import StudioBadgeIcon from './components/ui/StudioBadgeIcon';
import ScrollToTop from './components/ui/ScrollToTop';
import WhatsAppButton from './components/ui/WhatsAppButton';
import PageTransition from './components/ui/PageTransition';
import GlobalModals from './components/ui/GlobalModals';

// Lazy load non-critical public routes
const Portfolio = React.lazy(() => import('./pages/Portfolio'));
const ProjectDetails = React.lazy(() => import('./pages/ProjectDetails'));
const Magazine = React.lazy(() => import('./pages/Magazine'));
const ScriptsPage = React.lazy(() => import('./pages/ScriptsPage'));
const ArticleDetails = React.lazy(() => import('./pages/ArticleDetails'));
const CoversPage = React.lazy(() => import('./pages/CoversPage'));
const SoftwarePage = React.lazy(() => import('./pages/SoftwarePage'));
const AppsPage = React.lazy(() => import('./pages/AppsPage'));
const BookletsPage = React.lazy(() => import('./pages/BookletsPage'));
const About = React.lazy(() => import('./pages/About'));
const Services = React.lazy(() => import('./pages/Services'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Lazy load CMS routes (huge bundle size saving)
const CMSLayout = React.lazy(() => import('./pages/cms/CMSLayout'));
const Login = React.lazy(() => import('./pages/cms/Login'));

// Cosmetic pointer effects are heavy WebGL/animation code. Load them only on
// desktop-class pointers, after the critical page has become interactive.
const CustomCursor = React.lazy(() => import('./components/ui/CustomCursor'));
const SplashCursor = React.lazy(() => import('./components/ui/SplashCursor'));

// Minimal fallback loader for Suspense transitions
const PageLoader = () => (
  <div className="w-full h-screen flex items-center justify-center bg-[#050505] transition-colors duration-500">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex flex-col items-center gap-6"
    >
      <StudioBadgeIcon className="w-16 h-16 sm:w-20 sm:h-20 opacity-40" />
      <div className="text-sm font-serif tracking-[0.3em] font-bold text-white/40 uppercase">
        AL<span className="text-amber-400/40">.</span>YAM <span className="text-amber-500/40">STUDIO</span><span className="text-amber-500/40">.</span>
      </div>
    </motion.div>
  </div>
);

const TransitionWrapper = ({ children }: { children: React.ReactNode }) => (
  <PageTransition>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </PageTransition>
);

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<TransitionWrapper><Home /></TransitionWrapper>} />
        <Route path="/portfolio" element={<TransitionWrapper><Portfolio /></TransitionWrapper>} />
        <Route path="/portfolio/:slug" element={<TransitionWrapper><ProjectDetails /></TransitionWrapper>} />
        <Route path="/websites" element={<TransitionWrapper><ScriptsPage /></TransitionWrapper>} />
        <Route path="/magazine" element={<TransitionWrapper><Magazine /></TransitionWrapper>} />
        <Route path="/magazine/:slug" element={<TransitionWrapper><ArticleDetails /></TransitionWrapper>} />
        <Route path="/articles" element={<TransitionWrapper><Magazine /></TransitionWrapper>} />
        <Route path="/articles/:slug" element={<TransitionWrapper><ArticleDetails /></TransitionWrapper>} />
        <Route path="/covers" element={<TransitionWrapper><CoversPage /></TransitionWrapper>} />
        <Route path="/software" element={<TransitionWrapper><SoftwarePage /></TransitionWrapper>} />
        <Route path="/apps" element={<TransitionWrapper><AppsPage /></TransitionWrapper>} />
        <Route path="/booklets" element={<TransitionWrapper><BookletsPage /></TransitionWrapper>} />
        <Route path="/about" element={<TransitionWrapper><About /></TransitionWrapper>} />
        <Route path="/services" element={<TransitionWrapper><Services /></TransitionWrapper>} />
        <Route path="/contact" element={<TransitionWrapper><Contact /></TransitionWrapper>} />
        <Route path="/privacy" element={<TransitionWrapper><Privacy /></TransitionWrapper>} />
        <Route path="/terms" element={<TransitionWrapper><Terms /></TransitionWrapper>} />
        <Route path="/search" element={<TransitionWrapper><SearchPage /></TransitionWrapper>} />
        <Route path="/404" element={<TransitionWrapper><NotFound /></TransitionWrapper>} />
        <Route path="/login" element={<TransitionWrapper><Login /></TransitionWrapper>} />
        <Route path="*" element={<TransitionWrapper><NotFound /></TransitionWrapper>} />
        <Route path="/cms/*" element={<TransitionWrapper><CMSLayout /></TransitionWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const { settings, fetchSettings } = useSettingsStore();
  const { isRTL, language } = useLanguageStore();
  const [enablePointerEffects, setEnablePointerEffects] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const desktopWidth = window.matchMedia('(min-width: 1024px)').matches;
    if (reducedMotion || !finePointer || !desktopWidth) return;

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setEnablePointerEffects(true), { timeout: 1800 });
      return () => win.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(() => setEnablePointerEffects(true), 1200);
    return () => window.clearTimeout(id);
  }, []);
  
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (isRTL) {
      document.documentElement.classList.add('rtl-mode');
    } else {
      document.documentElement.classList.remove('rtl-mode');
    }
  }, [isRTL, language]);

  useEffect(() => {
    if (settings?.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings?.faviconUrl]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} lang={language} className="min-h-screen bg-alyam-black text-white selection:bg-amber-500/30">
      <Router>
        <ScrollToTop />
        <WhatsAppButton />
        {enablePointerEffects && (
          <Suspense fallback={null}>
            <SplashCursor DYE_RESOLUTION={512} CAPTURE_RESOLUTION={256} PRESSURE_ITERATIONS={12} />
            <CustomCursor />
          </Suspense>
        )}
        <GlobalModals />
        <AnimatedRoutes />
      </Router>
    </div>
  );
}
