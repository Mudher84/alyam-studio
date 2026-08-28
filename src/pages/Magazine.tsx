import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import FoldText from '../components/ui/FoldText';
import { useArticleStore } from '../stores/useArticleStore';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Search, Sparkles, BookOpen, Clock, ArrowUpRight, ArrowUpLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { INITIAL_ARTICLES } from '../data/initialContent';
import { useLanguageStore } from '../stores/useLanguageStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';

export default function Magazine() {
  const { fetchPublished } = useArticleStore();
  const { t, language, isRTL } = useLanguageStore();
  useTranslationUpdate();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const ArrowLink = isRTL ? ArrowUpLeft : ArrowUpRight;

  useEffect(() => {
    fetchPublished().then(data => {
      setArticles(data.length > 0 ? data : INITIAL_ARTICLES);
      setLoading(false);
    }).catch(() => {
      setArticles(INITIAL_ARTICLES);
      setLoading(false);
    });
  }, [fetchPublished]);

  const categories = [
    { key: 'All', label: t('magazine.filterAll') },
    { key: 'Design & Publishing', label: t('magazine.filterDesign') },
    { key: 'Technology & Software', label: t('magazine.filterTech') },
    { key: 'Case Studies', label: t('magazine.filterCase') }
  ];

  const filteredArticles = articles.filter(art => {
    const matchesCat = activeCategory === 'All' || art.category === activeCategory;
    if (!searchQuery) return matchesCat;
    const q = searchQuery.toLowerCase();
    const locTitle = getLocalizedField(art, 'title', language);
    const locExcerpt = getLocalizedField(art, 'excerpt', language);
    const searchStr = `${art.title} ${locTitle} ${art.excerpt} ${locExcerpt} ${art.category} ${art.tags?.join(' ') || ''}`.toLowerCase();
    return matchesCat && searchStr.includes(q);
  });

  const featured = filteredArticles[0];
  const rest = filteredArticles.slice(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "ALYAM Studio Magazine",
    "description": t('magazine.subtitle')
  };

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1c1917] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO 
        title={t('magazine.title')} 
        description={t('magazine.subtitle')}
        jsonLd={jsonLd}
      />
      <Navbar />
      
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        {/* Magazine Header */}
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-mono uppercase tracking-widest mb-4">
            <StudioBadgeIcon className="w-3.5 h-3.5" />
            <span>{t('magazine.badge')}</span>
          </div>
          <div className="mb-6 h-[48px] md:h-[68px]">
            <FoldText
              text={t('magazine.title')}
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
              color="#000000"
            />
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl font-light leading-relaxed">
            {t('magazine.subtitle')}
          </p>
        </header>

        {/* Filters & Search UI */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 pb-8 border-b border-[#E0D7C9]">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors border",
                  activeCategory === cat.key 
                    ? "bg-black text-white border-black shadow-sm" 
                    : "bg-[#FCFAF7] text-gray-600 border-[#E0D7C9] hover:border-gray-400 hover:text-black"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400",
              isRTL ? "right-3.5" : "left-3.5"
            )} />
            <input 
              type="text"
              placeholder={t('magazine.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full bg-[#FCFAF7] border border-[#E0D7C9] rounded-full py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors",
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              )}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center text-gray-400 flex flex-col items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              <StudioBadgeIcon className="w-12 h-12 opacity-20" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-300">
                {t('common.loading')}
              </span>
            </motion.div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-24 text-center bg-[#FCFAF7] rounded-2xl p-12 border border-[#E0D7C9]">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-serif text-gray-800 mb-2">{t('magazine.emptyTitle')}</h3>
            <p className="text-sm text-gray-500 font-light max-w-md mx-auto mb-6">
              {t('magazine.emptyDesc')}
            </p>
            <button 
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest rounded hover:bg-gray-800 transition-colors"
            >
              {t('magazine.resetFilters')}
            </button>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Featured Article */}
            {featured && (() => {
              const fTitle = getLocalizedField(featured, 'title', language);
              const fExcerpt = getLocalizedField(featured, 'excerpt', language);
              return (
                <section>
                  <Link to={`/magazine/${featured.slug}`} className="group block">
                    <div className="relative aspect-[21/9] md:aspect-[2.35/1] rounded-2xl overflow-hidden mb-8 bg-gray-100 shadow-md">
                      {featured.featuredImage ? (
                        <img 
                          src={featured.featuredImage} 
                          alt={fTitle} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white font-serif text-3xl">
                          {t('nav.magazine')}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-6 left-6 right-6 text-white md:hidden">
                        <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">{getLocalizedField(featured, 'category', language)}</span>
                        <h2 className="text-xl font-serif">{fTitle}</h2>
                      </div>
                    </div>
                    <div className="max-w-3xl mx-auto text-center hidden md:block">
                      <div className="flex items-center justify-center gap-3 text-xs font-mono text-amber-600 mb-3 uppercase tracking-widest">
                        <span>{getLocalizedField(featured, 'category', language)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.readingTime || 5} {t('magazine.minRead')}</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-serif text-black mb-4 group-hover:text-amber-600 transition-colors leading-tight">
                        {fTitle}
                      </h2>
                      <p className="text-base text-gray-600 font-light leading-relaxed mb-6">{fExcerpt}</p>
                      <span className="inline-flex items-center gap-1 border-b-2 border-black text-black pb-1 uppercase tracking-widest text-xs font-semibold group-hover:text-amber-600 group-hover:border-amber-600 transition-colors">
                        {t('magazine.readFullArticle')} <ArrowLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </section>
              );
            })()}

            {/* Grid of Remaining Articles */}
            {rest.length > 0 && (
              <section className="pt-12 border-t border-[#E0D7C9]">
                <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-gray-400 mb-10">{t('magazine.moreArticles')}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {rest.map(article => {
                    const aTitle = getLocalizedField(article, 'title', language);
                    const aExcerpt = getLocalizedField(article, 'excerpt', language);
                    return (
                      <Link key={article.id} to={`/magazine/${article.slug}`} className="group block flex flex-col justify-between h-full bg-[#FCFAF7] p-6 rounded-2xl border border-[#E0D7C9] hover:border-gray-400 hover:bg-[#FDFBF7] transition-all shadow-sm">
                        <div>
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-6 bg-gray-200">
                            {article.featuredImage ? (
                              <img 
                                src={article.featuredImage} 
                                alt={aTitle} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-serif text-xl">
                                {t('nav.home')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-amber-600 mb-3 uppercase tracking-wider">
                            <span>{getLocalizedField(article, 'category', language)}</span>
                            <span>•</span>
                            <span>{article.readingTime || 4} {t('magazine.minRead')}</span>
                          </div>
                          <h3 className="text-2xl font-serif text-black mb-3 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                            {aTitle}
                          </h3>
                          <p className="text-xs text-gray-600 font-light leading-relaxed line-clamp-3 mb-6">
                            {aExcerpt}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-black group-hover:text-amber-600 transition-colors mt-auto">
                          {t('magazine.readStory')} <ArrowLink className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

