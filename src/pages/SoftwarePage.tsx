import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { Search, Sparkles } from 'lucide-react';
import { useProjectStore } from '../stores/useProjectStore';
import { Link } from 'react-router-dom';
import FoldText from '../components/ui/FoldText';
import RandomTopSlider from '../components/ui/RandomTopSlider';
import { useLanguageStore } from '../stores/useLanguageStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';
import { cn, getCategoryLabel } from '../lib/utils';

export default function SoftwarePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, language, isRTL } = useLanguageStore();
  useTranslationUpdate();
  const { projects, loading, fetchPublishedProjects } = useProjectStore();

  useEffect(() => {
    fetchPublishedProjects();
  }, [fetchPublishedProjects]);

  const filteredItems = projects.filter(item => {
    if (item.category !== 'Software') return false;
    
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const locTitle = getLocalizedField(item, 'title', language);
    const locDesc = getLocalizedField(item, 'description', language);
    const searchString = `${item.title} ${locTitle} ${item.description || ''} ${locDesc} ${item.category}`.toLowerCase();
    return searchString.includes(query);
  });

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1A1815] flex flex-col selection:bg-amber-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('software.title')} description={t('software.description')} />
      <Navbar />
      
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-mono uppercase tracking-widest mb-4 font-semibold">
            <StudioBadgeIcon className="w-3.5 h-3.5" />
            <span>{t('portfolio.badge')}</span>
          </div>
          <div className="mb-6 h-[48px] md:h-[68px]">
            <FoldText
              text={t('software.title')}
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
        </div>

        {/* Random Software Showcase Top Section - Dashboard Screen Variant */}
        <div className="max-w-7xl mx-auto">
          <RandomTopSlider 
            category="Software" 
            variant="dashboard"
            badgeText={t('software.sliderBadge')}
            headline={t('software.sliderHeadline')}
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

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[16/9] bg-[#FCFAF7] rounded-2xl animate-pulse border border-[#E0D7C9]"></div>
            ))
          ) : filteredItems.map((item) => {
            const title = getLocalizedField(item, 'title', language);
            const desc = getLocalizedField(item, 'description', language);
            return (
              <Link 
                to={`/portfolio/${item.slug}`}
                key={item.id} 
                className="group cursor-pointer block bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl p-4 hover:border-amber-600 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[16/9] bg-[#EAE2D5] rounded-xl overflow-hidden relative mb-4 shadow-sm border border-[#E0D7C9]/60">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-500"></div>
                </div>
                <h3 className="text-xl font-serif group-hover:text-amber-700 transition-colors text-[#1A1815] font-bold line-clamp-1">{title}</h3>
                <p className="text-xs text-[#5A534B] mt-1 line-clamp-2 leading-relaxed">
                  {desc || t('software.description')}
                </p>
                
                <div className="mt-4 flex items-center justify-between border-t border-[#E0D7C9] pt-3">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider px-2 py-0.5 rounded border border-amber-300 bg-amber-100/50">
                       {getLocalizedField(item, 'subject', language) || t('services.list.dev')}
                     </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#736B63]">{item.year || '2026'}</span>
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

