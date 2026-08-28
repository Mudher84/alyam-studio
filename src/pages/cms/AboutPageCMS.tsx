import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { AutoTranslateButton } from '../../components/AutoTranslateButton';
import { Save, Info, CheckCircle2, User, Eye, Image as ImageIcon, Plus, Trash2, Sparkles } from 'lucide-react';

export default function AboutPageCMS() {
  const { settings, updateSettings, loading } = useSettingsStore();
  const { t, isRTL } = useLanguageStore();

  const [formData, setFormData] = useState({
    aboutTitle: '',
    aboutTitle_ar: '',
    aboutContent: '',
    aboutContent_ar: '',
    aboutSkills: [] as any[],
    aboutExperience: [] as any[]
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Sync with store data when it loads
  useEffect(() => {
    if (settings && !loading && !isInitialized) {
      setFormData({
        aboutTitle: settings.aboutText?.title || '',
        aboutTitle_ar: settings.aboutText_ar?.title || '',
        aboutContent: settings.aboutText?.content || '',
        aboutContent_ar: settings.aboutText_ar?.content || '',
        aboutSkills: settings.aboutSkills || [],
        aboutExperience: settings.aboutExperience || []
      });
      setIsInitialized(true);
    }
  }, [settings, loading, isInitialized]);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateSettings({
        aboutText: {
          title: formData.aboutTitle,
          content: formData.aboutContent,
        },
        aboutText_ar: {
          title: formData.aboutTitle_ar,
          content: formData.aboutContent_ar,
        },
        aboutSkills: formData.aboutSkills,
        aboutExperience: formData.aboutExperience
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
            <Info className="w-6 h-6 text-amber-500" />
            {t('cms.aboutPage')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRTL ? 'إدارة ونصوص صفحة "عن الاستوديو"، الرؤية والقصة.' : 'Manage About Page content, vision, and studio story.'}
          </p>
        </div>
        <a 
          href="/about" 
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
            {isRTL ? 'تم حفظ بيانات صفحة "عن الاستوديو" بنجاح!' : 'About Page settings saved successfully!'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-serif text-black border-b border-gray-100 pb-3">
            {isRTL ? 'معلومات وعنوان صفحة عن الاستوديو' : 'About Page Content'}
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'عنوان الصفحة بالعربية' : 'Page Title (Arabic)'}
                </label>
                <input 
                  type="text"
                  dir="rtl"
                  value={formData.aboutTitle_ar}
                  onChange={e => setFormData({ ...formData, aboutTitle_ar: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black font-serif text-lg focus:ring-2 focus:ring-black/5 focus:border-black"
                  placeholder="نحن استوديو اليم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'عنوان الصفحة بالإنكليزية' : 'Page Title (English)'}
                </label>
                <input 
                  type="text"
                  dir="ltr"
                  value={formData.aboutTitle}
                  onChange={e => setFormData({ ...formData, aboutTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black font-serif text-lg focus:ring-2 focus:ring-black/5 focus:border-black"
                  placeholder="About ALYAM Studio"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'تفاصيل وقصة الاستوديو بالعربية' : 'Main Narrative (Arabic)'}
                </label>
                <textarea 
                  rows={6}
                  dir="rtl"
                  value={formData.aboutContent_ar}
                  onChange={e => setFormData({ ...formData, aboutContent_ar: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black leading-relaxed"
                  placeholder="اكتب القصة والتفاصيل..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'تفاصيل وقصة الاستوديو بالإنكليزية' : 'Main Narrative (English)'}
                </label>
                <textarea 
                  rows={6}
                  dir="ltr"
                  value={formData.aboutContent}
                  onChange={e => setFormData({ ...formData, aboutContent: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black leading-relaxed"
                  placeholder="Write story and details..."
                />
              </div>
            </div>
          </div>
        </div>
        {/* Studio Workspace Image */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-serif text-black border-b border-gray-100 pb-3 flex items-center gap-2">
            <ImageIcon size={20} className="text-amber-500" />
            {isRTL ? 'صورة بيئة العمل والمساحة الإبداعية' : 'Workspace / Studio Image'}
          </h2>
          <div className="aspect-[21/9] rounded-xl overflow-hidden bg-gray-100 relative group">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" 
              alt="Studio Workspace"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-medium text-sm">
              {isRTL ? 'مساحة العمل الافتراضية للعلامة' : 'Default Studio Workspace'}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-lg font-serif text-black">
              {isRTL ? 'القدرات والمهارات الأساسية' : 'Core Capabilities & Skills'}
            </h2>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                aboutSkills: [...prev.aboutSkills, { name: '', name_ar: '', percent: 50 }]
              }))}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <Plus size={16} />
              {isRTL ? 'إضافة مهارة' : 'Add Skill'}
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.aboutSkills.map((skill, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? 'المهارة (إنجليزي)' : 'Skill (English)'}</label>
                    <input 
                      type="text" 
                      value={skill.name}
                      onChange={e => {
                        const newSkills = [...formData.aboutSkills];
                        newSkills[index] = { ...newSkills[index], name: e.target.value };
                        setFormData(prev => ({ ...prev, aboutSkills: newSkills }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-white text-black"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="block text-xs font-medium text-gray-500">{isRTL ? 'المهارة (عربي)' : 'Skill (Arabic)'}</label>
                      <AutoTranslateButton 
                        sourceText={skill.name} 
                        onTranslate={(translated) => {
                          const newSkills = [...formData.aboutSkills];
                          newSkills[index] = { ...newSkills[index], name_ar: translated };
                          setFormData(prev => ({ ...prev, aboutSkills: newSkills }));
                        }} 
                      />
                    </div>
                    <input 
                      type="text" 
                      value={skill.name_ar || ''}
                      onChange={e => {
                        const newSkills = [...formData.aboutSkills];
                        newSkills[index] = { ...newSkills[index], name_ar: e.target.value };
                        setFormData(prev => ({ ...prev, aboutSkills: newSkills }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-white text-black"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="sm:w-32 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? 'النسبة (%)' : 'Percent (%)'}</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={skill.percent}
                      onChange={e => {
                        const newSkills = [...formData.aboutSkills];
                        newSkills[index] = { ...newSkills[index], percent: parseInt(e.target.value) || 0 };
                        setFormData(prev => ({ ...prev, aboutSkills: newSkills }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-white text-black"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSkills = formData.aboutSkills.filter((_, i) => i !== index);
                      setFormData({ ...formData, aboutSkills: newSkills });
                    }}
                    className="mt-4 sm:mt-0 text-red-500 hover:text-red-700 text-sm font-medium flex items-center justify-center gap-1 py-2 sm:py-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-lg font-serif text-black">
              {isRTL ? 'المحطات والخبرات العملية' : 'Journey & Experience'}
            </h2>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                aboutExperience: [...prev.aboutExperience, { year: '', title: '', title_ar: '', desc: '', desc_ar: '' }]
              }))}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <Plus size={16} />
              {isRTL ? 'إضافة محطة' : 'Add Journey Item'}
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.aboutExperience.map((exp, index) => (
              <div key={index} className="flex flex-col gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="flex justify-between items-start">
                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? 'السنة' : 'Year'}</label>
                    <input 
                      type="text" 
                      value={exp.year}
                      onChange={e => {
                        const newExp = [...formData.aboutExperience];
                        newExp[index] = { ...newExp[index], year: e.target.value };
                        setFormData(prev => ({ ...prev, aboutExperience: newExp }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-black/5 focus:border-black bg-white text-black"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newExp = formData.aboutExperience.filter((_, i) => i !== index);
                      setFormData({ ...formData, aboutExperience: newExp });
                    }}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                      <input 
                        type="text" 
                        value={exp.title}
                        onChange={e => {
                          const newExp = [...formData.aboutExperience];
                          newExp[index] = { ...newExp[index], title: e.target.value };
                          setFormData(prev => ({ ...prev, aboutExperience: newExp }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                      <textarea 
                        rows={3}
                        value={exp.desc}
                        onChange={e => {
                          const newExp = [...formData.aboutExperience];
                          newExp[index] = { ...newExp[index], desc: e.target.value };
                          setFormData(prev => ({ ...prev, aboutExperience: newExp }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-white text-black"
                      />
                    </div>
                  </div>
                  <div className="space-y-3" dir="rtl">
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-xs font-medium text-gray-500">{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                        <AutoTranslateButton 
                          sourceText={exp.title} 
                          onTranslate={(translated) => {
                            const newExp = [...formData.aboutExperience];
                            newExp[index] = { ...newExp[index], title_ar: translated };
                            setFormData(prev => ({ ...prev, aboutExperience: newExp }));
                          }} 
                        />
                      </div>
                      <input 
                        type="text" 
                        value={exp.title_ar || ''}
                        onChange={e => {
                          const newExp = [...formData.aboutExperience];
                          newExp[index] = { ...newExp[index], title_ar: e.target.value };
                          setFormData(prev => ({ ...prev, aboutExperience: newExp }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-white text-black"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-xs font-medium text-gray-500">{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                        <AutoTranslateButton 
                          sourceText={exp.desc} 
                          onTranslate={(translated) => {
                            const newExp = [...formData.aboutExperience];
                            newExp[index] = { ...newExp[index], desc_ar: translated };
                            setFormData(prev => ({ ...prev, aboutExperience: newExp }));
                          }} 
                        />
                      </div>
                      <textarea 
                        rows={3}
                        value={exp.desc_ar || ''}
                        onChange={e => {
                          const newExp = [...formData.aboutExperience];
                          newExp[index] = { ...newExp[index], desc_ar: e.target.value };
                          setFormData(prev => ({ ...prev, aboutExperience: newExp }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-white text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
