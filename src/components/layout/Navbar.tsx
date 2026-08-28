import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Menu, X, Globe, Search, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useModalStore } from '../../stores/useModalStore';
import { useTranslationUpdate } from '../../lib/localize';
import StudioBadgeIcon from '../ui/StudioBadgeIcon';
import StickerPeel from '../ui/StickerPeel';
import logo from '../../assets/logo.svg';

export default function Navbar() {
  const { settings } = useSettingsStore();
  const { language, toggleLanguage, setLanguage, supportedLanguages, t, isRTL } = useLanguageStore();
  const { openSearchModal, openAIModal, openQuoteModal } = useModalStore();
  useTranslationUpdate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const location = useLocation();

  // The header is styled with luxury warm beige theme
  const textColor = 'text-[#1A1815]';
  const textHover = 'hover:text-[#8C7A6B] text-[#1A1815]/80';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.portfolio'), path: '/portfolio' },
    { name: t('nav.covers'), path: '/covers' },
    { name: t('nav.booklets'), path: '/booklets' },
    { name: t('nav.software'), path: '/software' },
    { name: t('nav.websites'), path: '/websites' },
    { name: t('nav.apps'), path: '/apps' },
    { name: t('nav.magazine'), path: '/magazine' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
    { name: t('nav.privacy'), path: '/privacy' },
    { name: t('nav.terms'), path: '/terms' },
  ];

  return (
    <>
      <nav 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 flex items-center justify-between',
          'bg-[#F6F2EB]/95 backdrop-blur-md shadow-xs border-b border-[#E0D7C9]',
          isScrolled ? 'py-2 md:py-2.5' : 'py-2.5 md:py-3'
        )}
      >
        
        <Link to="/" className="flex items-center gap-3 group relative py-0.5">
          <span className="text-lg sm:text-xl font-serif font-bold tracking-[0.12em] text-[#1A1815] transition-colors whitespace-nowrap flex items-center" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
            <span>ALYAM</span>
            <span className="font-normal ml-1.5 text-[#800020]">Studio</span>
            <span className="font-normal text-[#800020]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.filter(link => !['/privacy', '/terms'].includes(link.path)).map((link) => (
            <Link
              key={link.path + link.name}
              to={link.path}
              className={cn(
                "text-xs sm:text-[13px] uppercase tracking-widest transition-colors font-medium",
                location.pathname === link.path
                  ? "text-[#8C7A6B] font-bold"
                  : textHover
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Controls: Search, Language, AI Assistant */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search Button */}
          <button
            onClick={() => openSearchModal()}
            className="h-8.5 w-8.5 flex items-center justify-center rounded-full border border-[#E0D7C9] hover:border-[#8C7A6B] text-[#1A1815] hover:text-[#8C7A6B] bg-[#FCFAF7] shadow-xs transition-all cursor-pointer"
            title={t('common.search')}
            aria-label={t('common.search')}
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="h-8.5 w-8.5 flex items-center justify-center rounded-full border border-[#E0D7C9] hover:border-[#8C7A6B] text-[#1A1815] hover:text-[#8C7A6B] bg-[#FCFAF7] shadow-xs transition-all cursor-pointer"
              title={t('common.language')}
              aria-label={t('common.language')}
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            
            {isLanguageMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLanguageMenuOpen(false)} />
                <div className={cn(
                  "absolute top-full mt-2 w-40 rounded-xl shadow-xl border overflow-hidden z-50 bg-[#FCFAF7] border-[#E0D7C9]",
                  isRTL ? "left-0" : "right-0"
                )}>
                  <div className="py-1 max-h-80 overflow-y-auto">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-start px-4 py-2 text-xs transition-colors flex items-center justify-between",
                          language === lang.code 
                            ? "bg-[#EAE2D5] text-[#1A1815] font-semibold"
                            : "text-gray-700 hover:bg-[#F6F2EB] hover:text-[#1A1815]"
                        )}
                      >
                        {lang.name}
                        {language === lang.code && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#8C7A6B]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* AI Features Button */}
          <button
            onClick={() => openAIModal()}
            className="h-8.5 w-8.5 flex items-center justify-center rounded-full border border-[#E0D7C9] hover:border-[#8C7A6B] text-[#8C7A6B] bg-[#FCFAF7] shadow-xs transition-all cursor-pointer"
            title={t('common.aiAssistant')}
            aria-label={t('common.aiAssistant')}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8C7A6B]" />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="p-1.5 relative z-50 cursor-pointer lg:hidden text-[#1A1815]"
            onClick={() => setIsOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={cn(
            "fixed inset-0 z-[60] bg-[#140207] text-white transition-all duration-500 flex flex-col",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between p-6 md:p-8">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <span className="text-lg sm:text-xl font-serif tracking-wider font-bold text-white whitespace-nowrap" dir="ltr" style={{ unicodeBidi: 'isolate', display: 'inline-block' }}>
                AL<span className="text-gold-500">.</span>YAM <span className="text-gold-500">Studio.</span>
              </span>
            </Link>
            <button 
              className="text-white/50 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X size={32} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-start items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex flex-col gap-6 sm:gap-8 items-center text-center my-auto min-h-full py-4">
              {navLinks.map((link, index) => (
                <Link 
                  key={link.path + link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl sm:text-4xl font-serif text-white/80 hover:text-gold-400 transition-colors"
                  style={{ 
                    transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                    transitionProperty: 'opacity, transform, color',
                    transitionDuration: '500ms',
                    transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-white/10 flex items-center justify-between gap-4">
            <button
              onClick={() => {
                openAIModal();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500 text-black text-sm font-semibold shadow-lg"
            >
              <StudioBadgeIcon className="w-4 h-4 text-black" />
              <span>{t('common.aiAssistant')}</span>
            </button>

            <button
              onClick={() => {
                toggleLanguage();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/50 text-gold-400 hover:bg-gold-500/10 transition-all text-sm uppercase tracking-widest"
              title={t('common.language')}
              aria-label={t('common.language')}
            >
              <Globe className="w-4 h-4" />
              {supportedLanguages.find(l => l.code === language)?.name || 'Language'}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

