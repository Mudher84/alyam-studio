import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { Search, Sparkles } from 'lucide-react';
import { useProjectStore } from '../stores/useProjectStore';
import { useArticleStore } from '../stores/useArticleStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';
import { cn, getCategoryLabel } from '../lib/utils';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  
  const { t, language, isRTL } = useLanguageStore();
  useTranslationUpdate();
  const { projects, fetchPublishedProjects, loading: loadingProjects } = useProjectStore();
  const { fetchPublished } = useArticleStore();
  const [articles, setArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    fetchPublishedProjects();
    fetchPublished().then(data => {
      setArticles(data);
      setLoadingArticles(false);
    }).catch(() => setLoadingArticles(false));
  }, [fetchPublishedProjects, fetchPublished]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const matchingProjects = projects.filter(p => {
    if (!queryParam) return false;
    const q = queryParam.toLowerCase();
    const locTitle = getLocalizedField(p, 'title', language);
    const locDesc = getLocalizedField(p, 'description', language);
    const str = `${p.title} ${locTitle} ${p.teacher || ''} ${p.subject || ''} ${p.category} ${locDesc}`.toLowerCase();
    return str.includes(q);
  });

  const matchingArticles = articles.filter(a => {
    if (!queryParam) return false;
    const q = queryParam.toLowerCase();
    const locTitle = getLocalizedField(a, 'title', language);
    const locExcerpt = getLocalizedField(a, 'excerpt', language);
    const str = `${a.title} ${locTitle} ${locExcerpt} ${a.category}`.toLowerCase();
    return str.includes(q);
  });

  const totalCount = matchingProjects.length + matchingArticles.length;

  return (
    <div className="min-h-screen bg-alyam-black text-white flex flex-col selection:bg-amber-500/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={`${t('search.title')}: ${queryParam}`} description={t('search.placeholder')} />
      <Navbar />

      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest mb-4">
            <StudioBadgeIcon className="w-3.5 h-3.5" />
            <span>{t('search.title')}</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mt-4">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400",
              isRTL ? "right-4" : "left-4"
            )} />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className={cn(
                "w-full bg-white/5 border border-white/20 rounded-full py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500 transition-colors",
                isRTL ? "pr-12 pl-6" : "pl-12 pr-6"
              )}
            />
          </form>

          {queryParam && (
            <p className="mt-4 text-sm font-mono text-gray-400">
              {t('search.resultsCount').replace('{count}', String(totalCount)).replace('{query}', queryParam)}
            </p>
          )}
        </header>

        {queryParam && totalCount === 0 && !loadingProjects && !loadingArticles && (
          <div className="py-20 text-center text-gray-400 font-serif text-xl bg-white/5 rounded-2xl border border-white/10 max-w-2xl mx-auto">
            {t('search.noResults')}
          </div>
        )}

        {/* Results Grid */}
        <div className="space-y-16">
          {matchingProjects.length > 0 && (
            <section>
              <h2 className="text-xl font-serif text-amber-400 mb-6 border-b border-white/10 pb-3">{t('nav.portfolio')} ({matchingProjects.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {matchingProjects.map(project => {
                  const title = getLocalizedField(project, 'title', language);
                  return (
                    <Link 
                      key={project.id} 
                      to={`/portfolio/${project.slug}`}
                      className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-amber-500 transition-colors block"
                    >
                      <h3 className="text-lg font-serif text-white mb-1">{title}</h3>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">{getCategoryLabel(project.category)}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {matchingArticles.length > 0 && (
            <section>
              <h2 className="text-xl font-serif text-amber-400 mb-6 border-b border-white/10 pb-3">{t('nav.magazine')} ({matchingArticles.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {matchingArticles.map(art => {
                  const title = getLocalizedField(art, 'title', language);
                  return (
                    <Link 
                      key={art.id} 
                      to={`/magazine/${art.slug}`}
                      className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-amber-500 transition-colors block"
                    >
                      <h3 className="text-lg font-serif text-white mb-1">{title}</h3>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">{art.category}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
