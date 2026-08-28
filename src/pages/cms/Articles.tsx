import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, LayoutGrid, List, FileText, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { useArticleStore } from '../../stores/useArticleStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { getLocalizedField } from '../../lib/localize';
import ArticleForm from '../../components/cms/ArticleForm';
import { Article } from '../../types';

export default function Articles() {
  const { t, language, isRTL } = useLanguageStore();
  const { articles, loading, fetchArticles, addArticle, updateArticle, deleteArticle } = useArticleStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleCreate = () => {
    setEditingArticle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('cms.confirmDeleteArticle'))) {
      await updateArticle(id, { status: 'trash' });
    }
  };

  const handleFormSubmit = async (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingArticle) {
      await updateArticle(editingArticle.id, data);
    } else {
      await addArticle(data);
    }
    setIsFormOpen(false);
  };

  const filteredArticles = articles.filter(a => {
    const title = getLocalizedField(a, 'title', language).toLowerCase();
    const cat = (a.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || cat.includes(query) || (a.title || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus && a.status !== 'trash';
  });

  const totalCount = articles.filter(a => a.status !== 'trash').length;
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-black">{t('cms.articlesTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('cms.articlesSubtitle')}</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm hover:shadow"
        >
          <Plus size={18} />
          {t('cms.writeArticle')}
        </button>
      </header>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FCFAF7] border border-[#E0D7C9] p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{isRTL ? 'إجمالي المقالات' : 'Total Articles'}</p>
            <p className="text-2xl font-serif font-bold text-black mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 border border-amber-500/20">
            <BookOpen size={22} />
          </div>
        </div>

        <div className="bg-[#FCFAF7] border border-[#E0D7C9] p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{isRTL ? 'المقالات المنشورة' : 'Published'}</p>
            <p className="text-2xl font-serif font-bold text-green-600 mt-1">{publishedCount}</p>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 border border-green-500/20">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-[#FCFAF7] border border-[#E0D7C9] p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{isRTL ? 'مسودات' : 'Drafts'}</p>
            <p className="text-2xl font-serif font-bold text-gray-600 mt-1">{draftCount}</p>
          </div>
          <div className="w-12 h-12 bg-[#F6F2EB] rounded-xl flex items-center justify-center text-gray-600 border border-[#E0D7C9]">
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E0D7C9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input 
              type="text"
              placeholder={t('cms.searchArticles')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-[#F6F2EB] border border-[#E0D7C9] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all`}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar bg-[#F6F2EB] p-1 rounded-xl border border-[#E0D7C9]">
              {['all', 'published', 'draft', 'scheduled'].map(status => (
                <button 
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${statusFilter === status ? 'bg-black text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  {status === 'all' ? t('common.viewAll') : status === 'published' ? t('cms.published') : status === 'draft' ? t('cms.draft') : status}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#F6F2EB] p-1 rounded-xl border border-[#E0D7C9]">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#FCFAF7] text-black shadow-xs border border-[#E0D7C9]' : 'text-gray-400 hover:text-black'}`}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#FCFAF7] text-black shadow-xs border border-[#E0D7C9]' : 'text-gray-400 hover:text-black'}`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content View */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
              <thead>
                <tr className="bg-[#F6F2EB]/80 border-b border-[#E0D7C9]">
                  <th className="py-4 px-6 font-semibold text-sm text-gray-900 border-b border-[#E0D7C9]">{t('cms.articleTitle')}</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-900 border-b border-[#E0D7C9]">{t('cms.category')}</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-900 border-b border-[#E0D7C9]">{t('cms.status')}</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-900 border-b border-[#E0D7C9]">{t('cms.date')}</th>
                  <th className={`py-4 px-6 font-semibold text-sm text-gray-900 border-b border-[#E0D7C9] ${isRTL ? 'text-left' : 'text-right'}`}>{t('cms.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D7C9]">
                {loading && articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">{t('cms.loadingArticles')}</td>
                  </tr>
                ) : filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">{t('cms.noArticlesFound')}</td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => {
                    const articleTitle = getLocalizedField(article, 'title', language);
                    return (
                      <tr key={article.id} className="hover:bg-[#F6F2EB]/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {article.featuredImage ? (
                              <img src={article.featuredImage} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#F6F2EB] shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#F6F2EB] flex items-center justify-center text-gray-400 font-serif text-xs shrink-0">TXT</div>
                            )}
                            <div>
                              <div className="font-medium text-black max-w-xs truncate">{articleTitle}</div>
                              <div className="text-xs text-gray-400 truncate max-w-xs">{article.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{article.category}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            article.status === 'published' ? 'bg-green-50 text-green-700' :
                            article.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                            'bg-yellow-50 text-yellow-700'
                          }`}>
                            {article.status === 'published' ? t('cms.published') : article.status === 'draft' ? t('cms.draft') : article.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium' }).format(new Date(article.createdAt))}
                        </td>
                        <td className={`py-4 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>
                          <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <button onClick={() => window.open(`/magazine/${article.slug}`, '_blank')} className="text-gray-400 hover:text-black p-2 rounded-lg hover:bg-[#F6F2EB] transition-colors" title="View">
                              <Eye size={18} />
                            </button>
                            <button onClick={() => handleEdit(article)} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(article.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Trash">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && articles.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">{t('cms.loadingArticles')}</div>
            ) : filteredArticles.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">{t('cms.noArticlesFound')}</div>
            ) : (
              filteredArticles.map((article) => {
                const articleTitle = getLocalizedField(article, 'title', language);
                return (
                  <div key={article.id} className="bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                    <div className="h-48 bg-[#F6F2EB] relative overflow-hidden">
                      {article.featuredImage ? (
                        <img src={article.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-serif">ALYAM Magazine</div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm backdrop-blur-md ${
                          article.status === 'published' ? 'bg-green-500/90 text-white' : 'bg-black/75 text-white'
                        }`}>
                          {article.status === 'published' ? t('cms.published') : t('cms.draft')}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-amber-600 font-medium uppercase tracking-wider">{article.category}</span>
                        <h3 className="text-lg font-serif font-bold text-black mt-1 line-clamp-2">{articleTitle}</h3>
                        <p className="text-xs text-gray-400 mt-2">{new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium' }).format(new Date(article.createdAt))}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#E0D7C9]">
                        <button onClick={() => window.open(`/magazine/${article.slug}`, '_blank')} className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-[#F6F2EB] transition-colors" title="View">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEdit(article)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <ArticleForm 
          initialData={editingArticle}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

