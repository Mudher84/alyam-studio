import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { Search, Sparkles, FileText } from 'lucide-react';
import { useProjectStore } from '../stores/useProjectStore';
import { Link } from 'react-router-dom';
import FoldText from '../components/ui/FoldText';
import RandomTopSlider from '../components/ui/RandomTopSlider';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useModalStore } from '../stores/useModalStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';
import { cn } from '../lib/utils';

export default function CoversPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, language, isRTL } = useLanguageStore();
  const { openQuoteModal, openAIModal } = useModalStore();
  useTranslationUpdate();
  const { projects, loading, fetchPublishedProjects } = useProjectStore();

  useEffect(() => {
    fetchPublishedProjects();
  }, [fetchPublishedProjects]);

  const filteredItems = projects.filter(item => {
    if (item.category !== 'Book Covers' && item.category !== 'Educational Covers' && item.category !== 'Covers') return false;
    
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const locTitle = getLocalizedField(item, 'title', language);
    const locDesc = getLocalizedField(item, 'description', language);
    const searchString = `${item.title} ${locTitle} ${item.description || ''} ${locDesc} ${item.category}`.toLowerCase();
    return searchString.includes(query);
  });

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1A1815] flex flex-col selection:bg-amber-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('covers.title')} description={t('covers.description')} />
      <Navbar />
      
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-mono uppercase tracking-widest mb-4 font-semibold">
            <StudioBadgeIcon className="w-3.5 h-3.5" />
            <span>{t('portfolio.badge')}</span>
          </div>
          <div className="mb-6 h-[48px] md:h-[68px]">
            <FoldText
              text={t('covers.title')}
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

        {/* Random Slideshow Top Section - 3D Book Shelf Variant */}
        <div className="max-w-7xl mx-auto">
          <RandomTopSlider 
            category="Book Covers" 
            variant="shelf"
            badgeText={t('covers.sliderBadge')}
            headline={t('covers.sliderHeadline')}
          />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-16 pb-6 border-b border-[#E0D7C9]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openQuoteModal({ defaultCategory: 'cover', serviceTitle: 'تصميم غلاف ملزمة' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('common.requestQuote')}</span>
            </button>
            <button
              onClick={() => openAIModal({ defaultTab: 'cover_ideas' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FCFAF7] border border-[#E0D7C9] hover:border-amber-600 text-amber-800 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('covers.aiIdeasBadge') || 'أفكار أغلفة ذكية'}</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
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

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[22.5/31] bg-[#FCFAF7] rounded-lg animate-pulse border border-[#E0D7C9]"></div>
            ))
          ) : filteredItems.map((item) => {
            const title = getLocalizedField(item, 'title', language);
            const desc = getLocalizedField(item, 'description', language);
            return (
              <Link 
                to={`/portfolio/${item.slug}`}
                key={item.id} 
                className="group cursor-pointer block relative flex flex-col gap-4 bg-[#FCFAF7] p-3 rounded-xl border border-[#E0D7C9] hover:border-amber-600 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[22.5/31] bg-[#EAE2D5] rounded-lg overflow-hidden relative border border-[#E0D7C9] shadow-md group-hover:shadow-lg transition-all duration-500">
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
                  
                  {/* Subtle Inner Shadow for Book feel */}
                  <div className="absolute inset-0 shadow-[inset_4px_0_10px_rgba(0,0,0,0.15),inset_-1px_0_2px_rgba(255,255,255,0.4)] pointer-events-none"></div>
                </div>
                
                <div className="flex flex-col px-1">
                  <h3 className="text-lg font-serif group-hover:text-amber-700 transition-colors text-[#1A1815] font-bold line-clamp-1">{title}</h3>
                  <p className="text-sm text-[#5A534B] mt-1 font-light line-clamp-1">
                    {item.teacher ? `${t('portfolio.teacherLabel')}: ${getLocalizedField(item, 'teacher', language)}` : (desc || t('covers.description'))}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                     <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider px-2 py-0.5 rounded-sm border border-amber-300 bg-amber-100/50">
                       {getLocalizedField(item, 'subject', language) || t('services.list.graphic')}
                     </span>
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

