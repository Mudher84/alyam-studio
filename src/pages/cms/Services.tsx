import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Briefcase, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useServiceStore } from '../../stores/useServiceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { getLocalizedField } from '../../lib/localize';
import { Service } from '../../types';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { translateText } from '../../utils/translate';
import MediaPicker from '../../components/cms/MediaPicker';

export default function ServicesCMS() {
  const { t, language, isRTL } = useLanguageStore();
  const { services, loading, error, fetchServices, addService, updateService, deleteService } = useServiceStore();
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title_ar: '',
    title: '',
    description_ar: '',
    description: '',
    iconName: 'Briefcase',
    imageUrl: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Translation states
  const [translatingFields, setTranslatingFields] = useState<Record<string, boolean>>({});

  const translateField = async (
    sourceKey: 'title_ar' | 'description_ar' | 'title' | 'description', 
    targetKey: 'title' | 'description' | 'title_ar' | 'description_ar', 
    fromLang: 'ar' | 'en', 
    toLang: 'ar' | 'en'
  ) => {
    const textToTranslate = formData[sourceKey];
    if (!textToTranslate || !textToTranslate.trim()) return;

    setTranslatingFields(prev => ({ ...prev, [targetKey]: true }));
    try {
      const translated = await translateText(textToTranslate, { from: fromLang, to: toLang });
      if (translated && translated !== textToTranslate) {
        setFormData(prev => ({ ...prev, [targetKey]: translated }));
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslatingFields(prev => ({ ...prev, [targetKey]: false }));
    }
  };

  const translateAll = async (direction: 'ar_to_en' | 'en_to_ar') => {
    setTranslatingFields(prev => ({ ...prev, all: true }));
    try {
      if (direction === 'ar_to_en') {
        const titlePromise = formData.title_ar ? translateText(formData.title_ar, { from: 'ar', to: 'en' }) : Promise.resolve('');
        const descPromise = formData.description_ar ? translateText(formData.description_ar, { from: 'ar', to: 'en' }) : Promise.resolve('');

        const [translatedTitle, translatedDesc] = await Promise.all([titlePromise, descPromise]);

        setFormData(prev => ({
          ...prev,
          title: translatedTitle || prev.title,
          description: translatedDesc || prev.description
        }));
      } else {
        const titlePromise = formData.title ? translateText(formData.title, { from: 'en', to: 'ar' }) : Promise.resolve('');
        const descPromise = formData.description ? translateText(formData.description, { from: 'en', to: 'ar' }) : Promise.resolve('');

        const [translatedTitle, translatedDesc] = await Promise.all([titlePromise, descPromise]);

        setFormData(prev => ({
          ...prev,
          title_ar: translatedTitle || prev.title_ar,
          description_ar: translatedDesc || prev.description_ar
        }));
      }
    } catch (err) {
      console.error('Translation all error:', err);
    } finally {
      setTranslatingFields(prev => ({ ...prev, all: false }));
    }
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormData({
      title_ar: '',
      title: '',
      description_ar: '',
      description: '',
      iconName: 'Briefcase',
      imageUrl: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      title_ar: service.title_ar || '',
      title: service.title || '',
      description_ar: service.description_ar || '',
      description: service.description || '',
      iconName: service.iconName || 'Briefcase',
      imageUrl: service.imageUrl || '',
      status: service.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('cms.confirmDeleteService'))) {
      await deleteService(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() && !formData.title_ar.trim()) {
      alert(isRTL ? 'يرجى إدخال اسم الخدمة بالعربية أو بالإنكليزية.' : 'Please enter service title in Arabic or English.');
      return;
    }

    const payload = {
      title: formData.title || formData.title_ar,
      title_ar: formData.title_ar,
      description: formData.description || formData.description_ar,
      description_ar: formData.description_ar,
      iconName: formData.iconName,
      imageUrl: formData.imageUrl,
      status: formData.status,
      features: [],
      link: '/services',
      order: editingService ? editingService.order : (services.length + 1),
    };

    if (editingService) {
      await updateService(editingService.id, payload);
    } else {
      await addService(payload);
    }
    setIsModalOpen(false);
  };

  const filteredServices = services.filter(s => {
    const title = getLocalizedField(s, 'title', language).toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || (s.title || '').toLowerCase().includes(query) || (s.title_ar || '').toLowerCase().includes(query);
  });

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-black">{t('cms.servicesTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('cms.servicesSubtitle')}</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          {t('cms.newService')}
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">{isRTL ? 'خطأ في قاعدة البيانات:' : 'Database Error:'}</span>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => fetchServices()} 
            className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
          >
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input 
              type="text"
              placeholder={t('cms.searchServices')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-gray-50 border-none rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all`}
            />
          </div>
        </div>
        
        {/* Mobile & Tablet Card Layout */}
        <div className="block md:hidden p-4 space-y-4">
          {loading && services.length === 0 ? (
            <div className="py-12 text-center text-gray-400">{t('common.loading')}</div>
          ) : filteredServices.length === 0 ? (
            <div className="py-12 text-center text-gray-400">{t('cms.noData')}</div>
          ) : (
            filteredServices.map((service) => {
              const serviceTitle = getLocalizedField(service, 'title', language);
              return (
                <div key={service.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-3">
                  <div>
                    <h3 className="font-bold text-black text-sm">{serviceTitle}</h3>
                    <div className="text-xs text-gray-400 flex flex-col gap-0.5 mt-1">
                      {service.title_ar && <span>AR: {service.title_ar}</span>}
                      {service.title && <span>EN: {service.title}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      service.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {service.status === 'active' ? t('cms.active') : service.status}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenEditModal(service)}
                        className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'اسم الخدمة بالعربية والإنكليزية' : 'Service Title (AR & EN)'}
                </th>
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cms.status')}</th>
                <th className={`py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>{t('cms.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && services.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-400">{t('common.loading')}</td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-400">{t('cms.noData')}</td>
                </tr>
              ) : (
                filteredServices.map((service) => {
                  const serviceTitle = getLocalizedField(service, 'title', language);
                  return (
                    <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-medium text-black">{serviceTitle}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          {service.title_ar && <span>AR: {service.title_ar}</span>}
                          {service.title && <span>EN: {service.title}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          service.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {service.status === 'active' ? t('cms.active') : service.status}
                        </span>
                      </td>
                      <td className={`py-4 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                          <button 
                            onClick={() => handleOpenEditModal(service)}
                            className="p-2 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(service.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
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
      </div>

      {/* Service Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-200">
          <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0 z-20 shadow-xs">
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 -ml-2 text-gray-500 hover:text-black rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <X size={22} />
                <span className="hidden sm:inline text-sm font-medium">{isRTL ? 'إلغاء' : 'Cancel'}</span>
              </button>

              <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />

              <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <Briefcase size={20} className="text-amber-500" />
                {editingService 
                  ? (isRTL ? 'تعديل الخدمة (بالعربية والإنكليزية)' : 'Edit Service (AR & EN)')
                  : (isRTL ? 'إضافة خدمة جديدة (بالعربية والإنكليزية)' : 'Add New Service (AR & EN)')
                }
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                {t('cms.cancel')}
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
              >
                {t('cms.save')}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8 space-y-6">
                
                {/* Auto-Translate Master Assistant */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{isRTL ? 'مساعد الترجمة الذكية المزدوجة' : 'Dual Smart Translation Assistant'}</h4>
                      <p className="text-[10px] text-gray-500">{isRTL ? 'ترجمة الحقول المعبأة تلقائياً بين اللغتين بضغطة زر واحدة' : 'Translate all filled fields instantly between Arabic and English'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={translatingFields.all || (!formData.title_ar && !formData.description_ar)}
                      onClick={() => translateAll('ar_to_en')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-full text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      {translatingFields.all ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>{isRTL ? 'عربي ➔ إنجليزي' : 'AR ➔ EN'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={translatingFields.all || (!formData.title && !formData.description)}
                      onClick={() => translateAll('en_to_ar')}
                      className="px-3 py-1.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-full text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      {translatingFields.all ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>{isRTL ? 'إنجليزي ➔ عربي' : 'EN ➔ AR'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        {isRTL ? 'عنوان الخدمة بالعربية' : 'Service Title (Arabic)'}
                      </label>
                      {formData.title_ar && (
                        <button
                          type="button"
                          onClick={() => translateField('title_ar', 'title', 'ar', 'en')}
                          disabled={translatingFields.title}
                          className="text-[10px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          {translatingFields.title ? '...' : (isRTL ? 'ترجم ➔' : 'Translate ➔')}
                        </button>
                      )}
                    </div>
                    <input 
                      type="text" 
                      dir="rtl"
                      value={formData.title_ar} 
                      onChange={e => setFormData({ ...formData, title_ar: e.target.value })} 
                      placeholder="مثال: تصميم الأغلفة..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 transition-colors font-medium" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        {isRTL ? 'عنوان الخدمة بالإنكليزية' : 'Service Title (English)'}
                      </label>
                      {formData.title && (
                        <button
                          type="button"
                          onClick={() => translateField('title', 'title_ar', 'en', 'ar')}
                          disabled={translatingFields.title_ar}
                          className="text-[10px] font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          {translatingFields.title_ar ? '...' : (isRTL ? 'ترجم ➔' : 'Translate ➔')}
                        </button>
                      )}
                    </div>
                    <input 
                      type="text" 
                      dir="ltr"
                      value={formData.title} 
                      onChange={e => setFormData({ ...formData, title: e.target.value })} 
                      placeholder="e.g. Cover Design..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 transition-colors font-medium" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        {isRTL ? 'وصف الخدمة بالعربية' : 'Description (Arabic)'}
                      </label>
                      {formData.description_ar && (
                        <button
                          type="button"
                          onClick={() => translateField('description_ar', 'description', 'ar', 'en')}
                          disabled={translatingFields.description}
                          className="text-[10px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          {translatingFields.description ? '...' : (isRTL ? 'ترجم ➔' : 'Translate ➔')}
                        </button>
                      )}
                    </div>
                    <textarea 
                      rows={5}
                      dir="rtl"
                      value={formData.description_ar} 
                      onChange={e => setFormData({ ...formData, description_ar: e.target.value })} 
                      placeholder="تفاصيل الخدمة بالعربية..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 text-sm transition-colors" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        {isRTL ? 'وصف الخدمة بالإنكليزية' : 'Description (English)'}
                      </label>
                      {formData.description && (
                        <button
                          type="button"
                          onClick={() => translateField('description', 'description_ar', 'en', 'ar')}
                          disabled={translatingFields.description_ar}
                          className="text-[10px] font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          {translatingFields.description_ar ? '...' : (isRTL ? 'ترجم ➔' : 'Translate ➔')}
                        </button>
                      )}
                    </div>
                    <textarea 
                      rows={5}
                      dir="ltr"
                      value={formData.description} 
                      onChange={e => setFormData({ ...formData, description: e.target.value })} 
                      placeholder="Detailed description in English..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 text-sm transition-colors" 
                    />
                  </div>
                </div>

                {/* Service Image Section */}
                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-3">
                    {isRTL ? 'صورة الخدمة' : 'Service Image'}
                  </label>
                  
                  {formData.imageUrl ? (
                    <div className="relative aspect-[16/9] w-full max-w-md rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50">
                      <img 
                        src={formData.imageUrl} 
                        alt="Service cover" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowMediaPicker(true)}
                          className="p-2.5 bg-white text-black rounded-full hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                          title={isRTL ? 'تغيير الصورة' : 'Change Image'}
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
                          title={isRTL ? 'حذف الصورة' : 'Delete Image'}
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="w-full max-w-md aspect-[16/9] border-2 border-dashed border-gray-200 rounded-2xl hover:border-black hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-black cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-bold block mb-1">
                          {isRTL ? 'اختر صورة للخدمة' : 'Choose Service Image'}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {isRTL ? 'من مكتبة الوسائط' : 'From the media library'}
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {isRTL ? 'الحالة' : 'Status'}
                  </label>
                  <CustomSelect
                    value={formData.status}
                    onChange={val => setFormData({ ...formData, status: val as any })}
                    options={[
                      { value: 'active', label: isRTL ? 'نشط / Active' : 'Active' },
                      { value: 'inactive', label: isRTL ? 'غير نشط / Inactive' : 'Inactive' },
                    ]}
                  />
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm transition-colors"
                  >
                    {t('cms.cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="px-8 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    {t('cms.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker 
          onSelect={(url) => {
            setFormData({ ...formData, imageUrl: url });
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
