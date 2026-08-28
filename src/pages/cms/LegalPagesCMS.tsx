import React, { useState, useEffect } from 'react';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Save, ShieldCheck, FileText, CheckCircle2, Eye, Globe } from 'lucide-react';

export default function LegalPagesCMS() {
  const { t, isRTL, language } = useLanguageStore();
  const { settings, updateSettings } = useSettingsStore();
  const [activeSubTab, setActiveSubTab] = useState<'privacy' | 'terms'>('privacy');
  const [editLanguage, setEditLanguage] = useState<'en' | 'ar'>(language === 'ar' ? 'ar' : 'en');

  const [privacyContent, setPrivacyContent] = useState('');
  const [termsContent, setTermsContent] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setPrivacyContent(editLanguage === 'ar' ? (settings.privacyContent_ar || '') : (settings.privacyContent || ''));
      setTermsContent(editLanguage === 'ar' ? (settings.termsContent_ar || '') : (settings.termsContent || ''));
    }
  }, [settings, editLanguage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = editLanguage === 'ar' 
        ? { privacyContent_ar: privacyContent, termsContent_ar: termsContent }
        : { privacyContent: privacyContent, termsContent: termsContent };
      
      await updateSettings(updateData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving legal pages:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-serif text-black flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            {t('cms.legalPages')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRTL ? 'إدارة محتوى سياسة الخصوصية وشروط الخدمة والأحكام القانونية.' : 'Manage Privacy Policy and Terms of Service page contents.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href="/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-medium rounded-xl transition-colors"
          >
            <Eye size={14} />
            {isRTL ? 'معاينة الخصوصية' : 'View Privacy'}
          </a>
          <a 
            href="/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-medium rounded-xl transition-colors"
          >
            <Eye size={14} />
            {isRTL ? 'معاينة الشروط' : 'View Terms'}
          </a>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 gap-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === 'privacy' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            <ShieldCheck size={16} />
            {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </button>
          <button
            onClick={() => setActiveSubTab('terms')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === 'terms' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            <FileText size={16} />
            {isRTL ? 'شروط الخدمة والأحكام' : 'Terms of Service'}
          </button>
        </div>

        <div className="flex items-center gap-2 pb-3">
          <button
            onClick={() => setEditLanguage('ar')}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              editLanguage === 'ar' 
                ? 'bg-amber-500 border-amber-600 text-black font-bold' 
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => setEditLanguage('en')}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              editLanguage === 'en' 
                ? 'bg-amber-500 border-amber-600 text-black font-bold' 
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={20} className="text-green-600" />
          <span className="text-sm font-medium">
            {isRTL ? 'تم حفظ النواحي والصفحات القانونية بنجاح!' : 'Legal page contents saved successfully!'}
          </span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        {activeSubTab === 'privacy' ? (
          <div>
            <h2 className="text-lg font-serif text-black mb-4">
              {isRTL ? 'محتوى صفحة سياسة الخصوصية' : 'Privacy Policy Content'}
            </h2>
            <textarea
              rows={12}
              value={privacyContent}
              onChange={(e) => setPrivacyContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black leading-relaxed focus:ring-2 focus:ring-black/5 focus:border-black font-mono text-sm"
            />
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-serif text-black mb-4">
              {isRTL ? 'محتوى صفحة شروط الخدمة والاتفاقية' : 'Terms of Service Content'}
            </h2>
            <textarea
              rows={12}
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black leading-relaxed focus:ring-2 focus:ring-black/5 focus:border-black font-mono text-sm"
            />
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
}
