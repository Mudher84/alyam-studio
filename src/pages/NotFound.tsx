import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../stores/useLanguageStore';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { t, isRTL } = useLanguageStore();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-alyam-black text-white flex flex-col selection:bg-gold-500/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('notFound.title') || 'Page Not Found'} description={t('notFound.desc') || 'The requested page could not be found.'} />
      
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-32 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center mt-12 md:mt-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-mono uppercase tracking-widest mb-8">
            <StudioBadgeIcon className="w-3.5 h-3.5" />
            <span>ERROR 404</span>
          </div>
          
          <h1 className="text-[8rem] md:text-[12rem] font-serif leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 mb-4 select-none">
            404
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-serif mb-6 font-light">
            {t('notFound.title') || 'Page Not Found'}
          </h2>
          
          <p className="text-white/50 text-base md:text-lg font-light leading-relaxed mb-12 max-w-md">
            {t('notFound.desc') || 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
          </p>
          
          <Link
            to="/"
            className="group relative inline-flex items-center gap-4 bg-white text-alyam-black px-8 py-4 rounded-full text-sm font-mono uppercase tracking-widest font-semibold overflow-hidden transition-transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gold-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
            <span className="relative z-10 group-hover:text-black transition-colors duration-500">
              {t('notFound.backHome') || 'Return to Homepage'}
            </span>
            <ArrowIcon className="relative z-10 w-4 h-4 group-hover:text-black transition-colors duration-500" />
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
