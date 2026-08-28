import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { Search, Sparkles, ShoppingCart } from 'lucide-react';
import { useProjectStore } from '../stores/useProjectStore';
import { Link } from 'react-router-dom';
import FoldText from '../components/ui/FoldText';
import RandomTopSlider from '../components/ui/RandomTopSlider';
import { useLanguageStore } from '../stores/useLanguageStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';
import { cn } from '../lib/utils';

export default function ScriptsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, language, isRTL } = useLanguageStore();
  useTranslationUpdate();
  const { projects, loading, fetchPublishedProjects } = useProjectStore();

  useEffect(() => {
    fetchPublishedProjects();
  }, [fetchPublishedProjects]);

  const filteredItems = projects.filter(item => {
    if (item.category !== 'Software Scripts' && item.category !== 'Scripts' && item.category !== 'Websites' && item.category !== 'Web Applications') return false;
    
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const locTitle = getLocalizedField(item, 'title', language);
    const locDesc = getLocalizedField(item, 'description', language);
    const searchString = `${item.title} ${locTitle} ${item.description || ''} ${locDesc}`.toLowerCase();
    return searchString.includes(query);
  });

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1A1815] flex flex-col selection:bg-amber-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('scripts.title')} description={t('scripts.subtitle')} />
      <Navbar />
      
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-mono uppercase tracking-widest mb-4 font-semibold">
            <StudioBadgeIcon className="w-3.5 h-3.5" />
            <span>{t('scripts.badge')}</span>
          </div>
          <div className="mb-6 h-[48px] md:h-[68px]">
            <FoldText
              text={t('scripts.title')}
              splitBy="char"
              hinge="top"
              trigger="scroll"
              duration={0.65}
              stagger={0.045}
              ease="power3.out"
              perspective={700}
              creaseShading={0.55}
              fontSize="clamp(2rem, 5vw, 3.5rem)"
              fontWeight={800}
              color="#1A1815"
            />
          </div>
          <p className="text-xl text-[#5A534B] max-w-2xl font-light leading-relaxed">
            {t('scripts.subtitle')}
          </p>
        </div>

        {/* Random Scripts & Websites Showcase Top Section - Split Hero Banner Variant */}
        <div className="max-w-7xl mx-auto">
          <RandomTopSlider 
            category="Scripts" 
            variant="hero"
            badgeText={t('scripts.sliderBadge')}
            headline={t('scripts.sliderHeadline')}
          />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 pb-6 border-b border-[#E0D7C9]">
          <div className="relative w-full md:w-72 ms-auto">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400",
              isRTL ? "right-3.5" : "left-3.5"
            )} />
            <input 
              type="text"
              placeholder={t('portfolio.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full bg-[#FCFAF7] border border-[#E0D7C9] rounded-full py-2 text-xs text-[#1A1815] placeholder:text-gray-400 focus:outline-none focus:border-amber-700 transition-colors shadow-xs",
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              )}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] bg-[#FCFAF7] rounded-2xl animate-pulse border border-[#E0D7C9]"></div>
            ))
          ) : filteredItems.map((item) => {
            const title = getLocalizedField(item, 'title', language);
            const desc = getLocalizedField(item, 'description', language);
            return (
              <Link 
                to={`/portfolio/${item.slug}`}
                key={item.id} 
                className="group cursor-pointer block bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl p-6 hover:border-amber-600 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[16/10] bg-[#EAE2D5] rounded-xl overflow-hidden relative mb-6 shadow-sm border border-[#E0D7C9]/60">
                  <img 
                    src={item.coverImage || undefined} 
                    alt={title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  {!item.coverImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <StudioBadgeIcon className="w-12 h-12 text-amber-900/10" />
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-500"></div>
                  
                  <div className={cn(
                    "absolute top-4 bg-amber-600 text-white px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded shadow-md",
                    isRTL ? "right-4" : "left-4"
                  )}>
                    {t('scripts.forSale')}
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-2xl font-serif group-hover:text-amber-700 transition-colors text-[#1A1815] font-bold mb-2">{title}</h3>
                  <p className="text-sm text-[#5A534B] line-clamp-2 leading-relaxed mb-6">
                    {desc || t('scripts.subtitle')}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-[#E0D7C9] pt-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider px-2.5 py-1 rounded border border-amber-300 bg-amber-100/50">
                         {item.subject || t('scripts.fullScript')}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#1A1815] group-hover:text-amber-700 transition-colors">
                      <span className="text-xs font-mono uppercase tracking-widest font-semibold">{t('portfolio.viewDetails')}</span>
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-24 text-gray-500 font-serif text-xl bg-[#FCFAF7] rounded-2xl border border-[#E0D7C9] max-w-2xl mx-auto">
            {t('portfolio.empty')}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

