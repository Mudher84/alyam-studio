import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useModalStore } from '../../stores/useModalStore';
import { getLocalizedField } from '../../lib/localize';
import FooterConstellation, { ConstellationCategory } from './FooterConstellation';
import { Sparkles, FileText, Search } from 'lucide-react';

export default function Footer() {
  const { settings } = useSettingsStore();
  const { t, language } = useLanguageStore();
  const { openQuoteModal, openAIModal, openSearchModal } = useModalStore();
  const [activeCategory, setActiveCategory] = useState<ConstellationCategory>(null);

  return (
    <footer className="bg-[#140207] text-white py-16 border-t border-[#3d0b1a] relative overflow-hidden selection:bg-gold-500 selection:text-black">
      {/* Ambient Maroon Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,rgba(190,24,60,0.12),transparent_70%)] pointer-events-none" />

      {/* BACKGROUND INTERACTIVE CONSTELLATION LAYER */}
      <FooterConstellation activeCategory={activeCategory} />

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif tracking-wider font-bold text-white" dir="ltr" style={{ unicodeBidi: 'isolate', display: 'inline-block' }}>
              ALYAM <span className="text-gold-500">Studio.</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 font-light max-w-sm text-center md:text-start">
            {t('footer.slogan')}
          </p>

          {/* Quick Popup Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => openQuoteModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-400 text-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('common.requestQuote')}</span>
            </button>
            <button
              onClick={() => openAIModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{t('common.aiAssistant')}</span>
            </button>
            <button
              onClick={() => openSearchModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('common.search')}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-widest text-gray-400">
          <Link 
            to="/" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory(null)}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory(null)}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.home')}
          </Link>
          <Link 
            to="/portfolio" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory('covers')}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory('covers')}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.portfolio')}
          </Link>
          <Link 
            to="/covers" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory('covers')}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory('covers')}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.covers')}
          </Link>
          <Link 
            to="/booklets" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory('booklets')}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory('booklets')}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.booklets')}
          </Link>
          <Link 
            to="/software" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory('software')}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory('software')}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.software')}
          </Link>
          <Link 
            to="/websites" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory('scripts')}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory('scripts')}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.websites')}
          </Link>
          <Link 
            to="/apps" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory('software')}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory('software')}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.apps')}
          </Link>
          <Link 
            to="/magazine" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory('articles')}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory('articles')}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.magazine') || 'Magazine'}
          </Link>
          <Link 
            to="/services" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory(null)}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory(null)}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.services')}
          </Link>
          <Link 
            to="/about" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory(null)}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory(null)}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.about')}
          </Link>
          <Link 
            to="/contact" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory(null)}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory(null)}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.contact')}
          </Link>
          <Link 
            to="/privacy" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory(null)}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory(null)}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.privacy') || 'Privacy'}
          </Link>
          <Link 
            to="/terms" 
            className="hover:text-gold-400 focus:text-gold-400 focus:outline-none transition-colors"
            onMouseEnter={() => setActiveCategory(null)}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory(null)}
            onBlur={() => setActiveCategory(null)}
          >
            {t('nav.terms') || 'Terms'}
          </Link>
        </div>

        <div className="text-xs text-gray-500 font-mono text-center md:text-end">
          {getLocalizedField(settings, 'footerText', language) || `© ${new Date().getFullYear()} ${getLocalizedField(settings, 'siteName', language) || 'ALYAM Studio'}. ${t('footer.rights')}`}
        </div>
      </div>
    </footer>
  );
}


