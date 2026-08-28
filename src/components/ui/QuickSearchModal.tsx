import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, BookOpen, Layers, ArrowLeft, ArrowRight } from 'lucide-react';
import StudioBadgeIcon from './StudioBadgeIcon';
import { Link, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/useProjectStore';
import { useArticleStore } from '../../stores/useArticleStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useModalStore } from '../../stores/useModalStore';
import { getLocalizedField } from '../../lib/localize';
import { cn, getCategoryLabel } from '../../lib/utils';

interface QuickSearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function QuickSearchModal({ isOpen: propIsOpen, onClose: propOnClose }: QuickSearchModalProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguageStore();
  const { isSearchOpen: storeIsOpen, closeSearchModal } = useModalStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const onClose = propOnClose || closeSearchModal;

  const [query, setQuery] = useState('');
  const { projects, fetchPublishedProjects } = useProjectStore();
  const { fetchPublished } = useArticleStore();
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchPublishedProjects();
      fetchPublished().then(data => setArticles(data)).catch(() => {});
    }
  }, [isOpen, fetchPublishedProjects, fetchPublished]);

  if (!isOpen) return null;

  const quickTags = ['كيمياء', 'رياضيات', 'أحياء', 'أغلفة 2026', 'سادس علمي', 'نظام محاسبي', 'استوديو اليم'];

  const filteredProjects = projects.filter(p => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    const locTitle = getLocalizedField(p, 'title', language);
    const str = `${p.title} ${locTitle} ${p.teacher || ''} ${p.subject || ''} ${p.category}`.toLowerCase();
    return str.includes(q);
  }).slice(0, 5);

  const filteredArticles = articles.filter(a => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    const locTitle = getLocalizedField(a, 'title', language);
    const str = `${a.title} ${locTitle} ${a.category}`.toLowerCase();
    return str.includes(q);
  }).slice(0, 5);

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl bg-alyam-black border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Search Header */}
        <form onSubmit={handleSubmit} className="relative flex items-center border-b border-white/10 px-6 py-4 bg-white/5">
          <Search className="w-5 h-5 text-amber-400 ml-3" />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن اسم أستاذ، مادة دراسية، تصميم غلاف، أو برنامج..."
            className="w-full bg-transparent text-white placeholder:text-gray-500 text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery('')}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-white/10 rounded-md ml-2"
            >
              مسح
            </button>
          )}
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Tags Suggestions */}
        <div className="p-4 bg-black/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs text-gray-400 scrollbar-none">
          <span className="font-mono text-amber-400/80 shrink-0 flex items-center gap-1">
            <StudioBadgeIcon className="w-3 h-3" /> اقتراحات البحث:
          </span>
          {quickTags.map(tag => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-3 py-1 bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 rounded-full transition-all shrink-0 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results Preview */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {!query.trim() ? (
            <div className="text-center py-10 text-gray-500 font-serif text-sm">
              اكتب كلمة البحث أعلاه للبدء بالبحث المباشر في كافة المعارض والمقالات والبرمجيات
            </div>
          ) : filteredProjects.length === 0 && filteredArticles.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-serif text-sm bg-white/5 rounded-xl border border-white/10">
              لم نجد نتائج متطابقة مع "{query}"
            </div>
          ) : (
            <>
              {filteredProjects.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    معرض الأعمال والأغلفة ({filteredProjects.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredProjects.map(proj => {
                      const title = getLocalizedField(proj, 'title', language);
                      return (
                        <button
                          key={proj.id}
                          onClick={() => handleSelect(`/portfolio/${proj.slug}`)}
                          className="w-full text-right p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/50 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="text-sm font-serif text-white group-hover:text-amber-300 transition-colors">{title}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{getCategoryLabel(proj.category)} {proj.teacher ? `• ${proj.teacher}` : ''}</div>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredArticles.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    المقالات والمجلات ({filteredArticles.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredArticles.map(art => {
                      const title = getLocalizedField(art, 'title', language);
                      return (
                        <button
                          key={art.id}
                          onClick={() => handleSelect(`/magazine/${art.slug}`)}
                          className="w-full text-right p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/50 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="text-sm font-serif text-white group-hover:text-amber-300 transition-colors">{title}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{art.category}</div>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  onClose();
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                }}
                className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest rounded-xl transition-all text-center block cursor-pointer"
              >
                عرض كل النتائج في صفحة البحث الشاملة ←
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
