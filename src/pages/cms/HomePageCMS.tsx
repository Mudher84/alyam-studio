import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { Save, Home as HomeIcon, CheckCircle2, Layout, Video, BarChart2, Eye } from 'lucide-react';

export default function HomePageCMS() {
  const { settings, updateSettings, loading } = useSettingsStore();
  const { t, isRTL } = useLanguageStore();

  const [formData, setFormData] = useState({
    heroTitle_ar: '',
    heroTitle: '',
    heroSubtitle_ar: '',
    heroSubtitle: '',
    siteName_ar: '',
    siteName: '',
    siteDescription_ar: '',
    siteDescription: '',
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Sync with store data when it loads
  useEffect(() => {
    if (settings && !loading) {
      setFormData({
        heroTitle_ar: settings.heroText_ar?.title || '',
        heroTitle: settings.heroText?.title || '',
        heroSubtitle_ar: settings.heroText_ar?.subtitle || '',
        heroSubtitle: settings.heroText?.subtitle || '',
        siteName_ar: settings.siteName_ar || '',
        siteName: settings.siteName || '',
        siteDescription_ar: settings.siteDescription_ar || '',
        siteDescription: settings.siteDescription || '',
      });
    }
  }, [settings, loading]);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateSettings({
        siteName: formData.siteName,
        siteName_ar: formData.siteName_ar,
        siteDescription: formData.siteDescription,
        siteDescription_ar: formData.siteDescription_ar,
        heroText: {
          title: formData.heroTitle,
          subtitle: formData.heroSubtitle,
        },
        heroText_ar: {
          title: formData.heroTitle_ar,
          subtitle: formData.heroSubtitle_ar,
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-serif text-black flex items-center gap-2">
            <HomeIcon className="w-6 h-6 text-amber-500" />
            {t('cms.homePage')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRTL ? 'التحكم بنصوص الواجهة الرئيسية للهيرو وأقسام الصفحة الرئيسية.' : 'Manage main hero title, subtitle, and homepage sections.'}
          </p>
        </div>
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-xl transition-colors shrink-0"
        >
          <Eye size={16} />
          {t('cms.viewWebsite')}
        </a>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={20} className="text-green-600" />
          <span className="text-sm font-medium">
            {isRTL ? 'تم حفظ تغييرات الصفحة الرئيسية بنجاح!' : 'Homepage settings saved successfully!'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Hero Banner Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-serif text-black flex items-center gap-2 border-b border-gray-100 pb-3">
            <Layout size={20} className="text-amber-500" />
            {isRTL ? 'قسم الهيرو والترويسة الرئيسية' : 'Hero Section & Main Header'}
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'عنوان الهيرو بالعربية' : 'Hero Title (Arabic)'}
                </label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={formData.heroTitle_ar}
                  onChange={e => setFormData({ ...formData, heroTitle_ar: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black font-serif text-lg focus:ring-2 focus:ring-black/5 focus:border-black"
                  placeholder="تصميم هويات ومناهج تعليمية..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'عنوان الهيرو بالإنكليزية' : 'Hero Title (English)'}
                </label>
                <input 
                  type="text" 
                  dir="ltr"
                  value={formData.heroTitle}
                  onChange={e => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black font-serif text-lg focus:ring-2 focus:ring-black/5 focus:border-black"
                  placeholder="Crafting digital experiences..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'الوصف الفرعي للهيرو بالعربية' : 'Hero Subtitle (Arabic)'}
                </label>
                <textarea 
                  rows={3}
                  dir="rtl"
                  value={formData.heroSubtitle_ar}
                  onChange={e => setFormData({ ...formData, heroSubtitle_ar: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black"
                  placeholder="استوديو متخصص في نشر وتصميم الأغلفة..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'الوصف الفرعي للهيرو بالإنكليزية' : 'Hero Subtitle (English)'}
                </label>
                <textarea 
                  rows={3}
                  dir="ltr"
                  value={formData.heroSubtitle}
                  onChange={e => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black"
                  placeholder="We are a multidisciplinary studio..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Site Metadata & Slogan */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-serif text-black flex items-center gap-2 border-b border-gray-100 pb-3">
            <BarChart2 size={20} className="text-amber-500" />
            {isRTL ? 'معلومات واجهة الاستوديو' : 'Studio Brand & Intro'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRTL ? 'اسم الاستوديو بالعربية' : 'Site Name (Arabic)'}
              </label>
              <input 
                type="text" 
                dir="rtl"
                value={formData.siteName_ar}
                onChange={e => setFormData({ ...formData, siteName_ar: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRTL ? 'اسم الاستوديو بالإنكليزية' : 'Site Name (English)'}
              </label>
              <input 
                type="text" 
                dir="ltr"
                value={formData.siteName}
                onChange={e => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRTL ? 'الوصف المختصر بالعربية' : 'Short Description (Arabic)'}
              </label>
              <input 
                type="text" 
                dir="rtl"
                value={formData.siteDescription_ar}
                onChange={e => setFormData({ ...formData, siteDescription_ar: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRTL ? 'الوصف المختصر بالإنكليزية' : 'Short Description (English)'}
              </label>
              <input 
                type="text" 
                dir="ltr"
                value={formData.siteDescription}
                onChange={e => setFormData({ ...formData, siteDescription: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400">
            {isRTL ? 'معاينة حية لقسم الهيرو' : 'Live Hero Preview'}
          </div>
          <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
            {formData.heroTitle || (isRTL ? 'العنوان الرئيسي' : 'Hero Title')}
          </h3>
          <p className="text-gray-300 font-light text-sm sm:text-base max-w-2xl leading-relaxed">
            {formData.heroSubtitle || (isRTL ? 'الوصف الفرعي للاستوديو...' : 'Hero Subtitle...')}
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving || loading}
            className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
}
