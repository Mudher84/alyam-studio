import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { Search, Sparkles, FileText } from 'lucide-react';
import { cn, getAuthorLabel, getCategoryLabel } from '../lib/utils';
import { useProjectStore } from '../stores/useProjectStore';
import { ProjectSkeleton } from '../components/portfolio/ProjectSkeleton';
import { Link } from 'react-router-dom';
import FoldText from '../components/ui/FoldText';
import ImageParallax from '../components/ui/ImageParallax';
import RandomTopSlider from '../components/ui/RandomTopSlider';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useModalStore } from '../stores/useModalStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';

export default function Portfolio() {
  const { t, language, isRTL } = useLanguageStore();
  const { openQuoteModal, openAIModal } = useModalStore();
  useTranslationUpdate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { projects, loading, fetchPublishedProjects } = useProjectStore();

  useEffect(() => {
    fetchPublishedProjects();
  }, [fetchPublishedProjects]);

  const categories = [
    { key: 'All', label: t('portfolio.filterAll') },
    { key: 'Covers', label: t('nav.covers') },
    { key: 'Booklets', label: t('nav.booklets') },
    { key: 'Software', label: t('nav.software') },
    { key: 'Websites', label: t('nav.websites') },
    { key: 'Apps', label: t('nav.apps') },
  ];

  const filteredProjects = projects.filter(p => {
    let matchesCategory = false;
    if (activeCategory === 'All') matchesCategory = true;
    else if (activeCategory === 'Covers' && (p.category === 'Educational Covers' || p.category === 'Book Covers' || p.category === 'Covers')) matchesCategory = true;
    else if (activeCategory === 'Booklets' && (p.category === 'Educational Booklets' || p.category === 'Booklets')) matchesCategory = true;
    else if (activeCategory === 'Websites' && (p.category === 'Software Scripts' || p.category === 'Websites' || p.category === 'Web Applications')) matchesCategory = true;
    else matchesCategory = p.category === activeCategory;
    
    if (!searchQuery) return matchesCategory;
    
    const query = searchQuery.toLowerCase();
    const localizedTitle = getLocalizedField(p, 'title', language);
    const localizedDesc = getLocalizedField(p, 'description', language);
    const searchString = `
      ${p.title} 
      ${localizedTitle}
      ${p.teacher || ''} 
      ${p.subject || ''} 
      ${p.category} 
      ${localizedDesc}
      ${p.tags?.join(' ') || ''}
      ${p.year || ''}
    `.toLowerCase();

    const matchesSearch = searchString.includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1A1815] flex flex-col selection:bg-amber-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('portfolio.title')} description={t('portfolio.subtitle')} />
      <Navbar />
      
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-mono uppercase tracking-widest mb-4 font-semibold">
            <StudioBadgeIcon className="w-3.5 h-3.5" />
            <span>{t('portfolio.badge')}</span>
          </div>
          <div className="mb-6 h-[48px] md:h-[68px]">
            <FoldText
              text={t('portfolio.title')}
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
            {t('portfolio.subtitle')}
          </p>
        </div>

        {/* Random Portfolio Showcase Top Section - Cinema Filmstrip Variant */}
        <div className="max-w-7xl mx-auto">
          <RandomTopSlider 
            category="All" 
            variant="cinema"
            badgeText={t('portfolio.randomBadge')}
            headline={t('portfolio.randomTitle')}
          />
        </div>

        {/* Filters & Search */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 pb-6 border-b border-[#E0D7C9]">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors border cursor-pointer",
                  activeCategory === cat.key 
                    ? "bg-amber-700 text-white border-amber-700 font-semibold shadow-xs" 
                    : "bg-[#FCFAF7] text-[#4A453E] border-[#E0D7C9] hover:border-amber-600 hover:text-amber-700"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => openQuoteModal({ defaultCategory: activeCategory !== 'All' ? activeCategory.toLowerCase() : 'cover' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('common.requestQuote')}</span>
            </button>
            <button
              onClick={() => openAIModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FCFAF7] border border-[#E0D7C9] hover:border-amber-600 text-amber-800 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('common.aiAssistant')}</span>
            </button>

            <div className="relative w-full sm:w-64">
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
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <ProjectSkeleton key={i} />)
          ) : filteredProjects.map((project) => {
            const title = getLocalizedField(project, 'title', language);
            const desc = getLocalizedField(project, 'description', language);
            return (
              <Link 
                to={`/portfolio/${project.slug}`}
                key={project.id} 
                className="group cursor-pointer block bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl p-4 hover:border-amber-600 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-[#EAE2D5] rounded-xl overflow-hidden relative mb-4 border border-[#E0D7C9]/60">
                  {project.coverImage ? (
                    <ImageParallax 
                      src={project.coverImage} 
                      alt={title}
                      imageClassName="opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-900/30 bg-[#EAE2D5]">
                       <span className="font-serif text-2xl tracking-wider">AL<span className="text-amber-600">.</span>YAM</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-serif group-hover:text-amber-700 transition-colors text-[#1A1815] font-bold">{title}</h3>
                <p className="text-xs text-[#5A534B] mt-1 line-clamp-1">
                  {project.teacher ? `${getAuthorLabel(project.category)}: ${getLocalizedField(project, 'teacher', language)}` : desc}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E0D7C9] text-xs font-mono text-[#736B63]">
                  <span>{getLocalizedField(project, 'subject', language) || getCategoryLabel(project.category)}</span>
                  <span>{project.year || '2026'}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-24 text-gray-500 font-serif text-xl bg-[#FCFAF7] rounded-2xl border border-[#E0D7C9] max-w-2xl mx-auto">
            {t('portfolio.empty')}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

