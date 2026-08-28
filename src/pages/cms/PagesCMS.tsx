import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, FileText, Sparkles, Globe, Link as LinkIcon, CheckCircle2, XCircle } from 'lucide-react';
import { usePageStore } from '../../stores/usePageStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { StudioPage } from '../../types';
import { translateText } from '../../utils/translate';

export default function PagesCMS() {
  const { t, isRTL } = useLanguageStore();
  const { pages, loading, fetchPages, addPage, updatePage, deletePage } = usePageStore();
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<StudioPage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    slug: '',
    categoriesStr: '', // comma separated or tags
    status: 'active' as 'active' | 'inactive',
    order: 1,
  });

  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleOpenCreateModal = () => {
    setEditingPage(null);
    setFormData({
      name: '',
      name_ar: '',
      slug: '/',
      categoriesStr: '',
      status: 'active',
      order: pages.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (page: StudioPage) => {
    setEditingPage(page);
    setFormData({
      name: page.name || '',
      name_ar: page.name_ar || '',
      slug: page.slug || '',
      categoriesStr: (page.categories || []).join(', '),
      status: page.status || 'active',
      order: page.order || 1,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه الصفحة؟' : 'Are you sure you want to delete this page?')) {
      await deletePage(id);
    }
  };

  const handleTranslate = async (direction: 'ar_to_en' | 'en_to_ar') => {
    setTranslating(true);
    try {
      if (direction === 'ar_to_en' && formData.name_ar) {
        const translated = await translateText(formData.name_ar, { from: 'ar', to: 'en' });
        if (translated) {
          setFormData(prev => ({ ...prev, name: translated }));
        }
      } else if (direction === 'en_to_ar' && formData.name) {
        const translated = await translateText(formData.name, { from: 'en', to: 'ar' });
        if (translated) {
          setFormData(prev => ({ ...prev, name_ar: translated }));
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() && !formData.name_ar.trim()) {
      alert(isRTL ? 'يرجى إدخال اسم الصفحة.' : 'Please enter page name.');
      return;
    }

    const categories = formData.categoriesStr
      ? formData.categoriesStr.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name || formData.name_ar,
      name_ar: formData.name_ar || formData.name,
      slug: formData.slug.startsWith('/') ? formData.slug : `/${formData.slug}`,
      categories,
      status: formData.status,
      order: Number(formData.order) || 1,
    };

    if (editingPage) {
      await updatePage(editingPage.id, payload);
    } else {
      await addPage(payload);
    }
    setIsModalOpen(false);
  };

  const filteredPages = pages.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.name_ar && p.name_ar.includes(searchQuery)) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-serif text-black font-bold flex items-center gap-3">
            <FileText className="w-7 h-7 text-amber-500" />
            {isRTL ? t('cms.pages') : 'Pages Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRTL ? 'تحكم بأسماء الصفحات، امتداداتها (الروابط)، وربطها مع الفئات المختلفة.' : 'Manage site pages, custom slugs/paths, and associated categories.'}
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>{isRTL ? 'إضافة صفحة جديدة' : 'New Page'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isRTL ? 'البحث في الصفحات والروابط...' : 'Search pages and slugs...'}
          className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
        />
      </div>

      {/* Pages Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            {isRTL ? 'جاري التحميل...' : 'Loading pages...'}
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {isRTL ? 'لم يتم العثور على صفحات.' : 'No pages found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-mono uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="py-4 px-6">{isRTL ? 'الترتيب' : 'Order'}</th>
                  <th className="py-4 px-6">{isRTL ? 'اسم الصفحة' : 'Page Name'}</th>
                  <th className="py-4 px-6">{isRTL ? 'الامتداد (الرابط)' : 'Slug / Path'}</th>
                  <th className="py-4 px-6">{isRTL ? 'الفئات المرتبطة' : 'Linked Categories'}</th>
                  <th className="py-4 px-6">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="py-4 px-6 text-right">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-mono text-gray-400 w-20">#{page.order}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-black">{page.name_ar || page.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{page.name}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-amber-600 text-xs">
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                        <LinkIcon className="w-3.5 h-3.5" />
                        {page.slug}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {page.categories && page.categories.length > 0 ? (
                          page.categories.map((cat, idx) => (
                            <span key={idx} className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-600 font-mono">
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">{isRTL ? 'لا توجد فئات' : 'No categories'}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {page.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isRTL ? 'نشط' : 'Active'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-medium bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" />
                          {isRTL ? 'معطل' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(page)}
                          className="p-2 text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif text-black font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-500" />
              {editingPage ? (isRTL ? 'تعديل الصفحة' : 'Edit Page') : (isRTL ? 'إضافة صفحة جديدة' : 'New Page')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                    {isRTL ? 'اسم الصفحة بالعربية' : 'Arabic Page Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.name_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                      placeholder="مثال: معرض الأعمال"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleTranslate('ar_to_en')}
                      disabled={translating || !formData.name_ar}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-amber-500 hover:bg-gray-100 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Translate to English"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                    {isRTL ? 'اسم الصفحة بالإنكليزية' : 'English Page Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Portfolio"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleTranslate('en_to_ar')}
                      disabled={translating || !formData.name}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-amber-500 hover:bg-gray-100 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Translate to Arabic"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                    {isRTL ? 'امتداد الرابط (Slug / Path)' : 'Slug / Path'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="/portfolio"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-amber-600 font-mono text-sm placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {isRTL ? 'يجب أن يبدأ بـ / مثل /portfolio أو /covers' : 'Must start with / like /portfolio or /covers'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                    {isRTL ? 'الترتيب' : 'Order'}
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black font-mono placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                  {isRTL ? 'الفئات المرتبطة (مفصولة بفواصل)' : 'Linked Categories (Comma separated)'}
                </label>
                <input
                  type="text"
                  value={formData.categoriesStr}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoriesStr: e.target.value }))}
                  placeholder="All, Covers, Booklets, Software, Apps"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                  {isRTL ? 'الحالة' : 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="active">{isRTL ? 'نشط (ظاهر في الموقع)' : 'Active (Visible)'}</option>
                  <option value="inactive">{isRTL ? 'معطل (مخفي)' : 'Inactive (Hidden)'}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  {editingPage ? (isRTL ? 'حفظ التعديلات' : 'Save Changes') : (isRTL ? 'إنشاء الصفحة' : 'Create Page')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
