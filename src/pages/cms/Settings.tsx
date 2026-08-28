import React, { useState, useEffect } from 'react';
import { Save, Globe, Paintbrush, Phone, FileText, Share2, Upload, X, Image, BarChart2, User , Layout, ArrowUp, ArrowDown, Eye, EyeOff} from 'lucide-react';
import { cn } from '../../lib/utils';
import { mediaService } from '../../lib/services/media';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import SocialIcon from '../../components/ui/SocialIcon';

export default function Settings() {
  const { t, isRTL } = useLanguageStore();
  const { settings, loading, fetchSettings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState(settings);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await mediaService.uploadFile(file, 'settings');
      const url = typeof res === 'string' ? res : (res?.originalUrl || res?.webpUrl || res?.url || '');
      setFormData(prev => ({ ...prev, adminAvatarUrl: url }));
      await updateSettings({ adminAvatarUrl: url });
    } catch (error) {
      console.error(error);
      alert(isRTL ? 'فشل رفع صورة المدير' : 'Failed to upload admin avatar');
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      const defaultTabsOrder = [
        { id: 'general', order: 0 },
        { id: 'contact', order: 1 },
        { id: 'stats', order: 2 },
        { id: 'content', order: 3 },
        { id: 'appearance', order: 4 },
        { id: 'social', order: 5 },
        { id: 'home', order: 6 },
      ];
      
      setFormData({
        ...settings,
        settingsTabs: settings.settingsTabs || defaultTabsOrder
      });
    }
  }, [settings]);

  const tabMeta: Record<string, { name: string; icon: any }> = {
    general: { id: 'general', name: t('cms.settingsGeneral'), icon: Globe },
    contact: { id: 'contact', name: t('cms.settingsContact'), icon: Phone },
    stats: { id: 'stats', name: isRTL ? 'الإحصائيات والأرقام' : 'Stats & Numbers', icon: BarChart2 },
    content: { id: 'content', name: t('cms.settingsContent'), icon: FileText },
    appearance: { id: 'appearance', name: t('cms.settingsAppearance'), icon: Paintbrush },
    social: { id: 'social', name: t('cms.settingsSocial'), icon: Share2 },
    home: { id: 'home', name: isRTL ? 'الصفحة الرئيسية' : 'Home Page', icon: Layout },
  } as any;

  const tabs = formData.settingsTabs && formData.settingsTabs.length > 0
    ? [...formData.settingsTabs]
        .sort((a, b) => a.order - b.order)
        .map(t => ({ ...tabMeta[t.id], id: t.id }))
    : [
        { id: 'general', name: t('cms.settingsGeneral'), icon: Globe },
        { id: 'contact', name: t('cms.settingsContact'), icon: Phone },
        { id: 'stats', name: isRTL ? 'الإحصائيات والأرقام' : 'Stats & Numbers', icon: BarChart2 },
        { id: 'content', name: t('cms.settingsContent'), icon: FileText },
        { id: 'appearance', name: t('cms.settingsAppearance'), icon: Paintbrush },
        { id: 'social', name: t('cms.settingsSocial'), icon: Share2 },
        { id: 'home', name: isRTL ? 'الصفحة الرئيسية' : 'Home Page', icon: Layout },
      ];

  const handleTabDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTabIndex(index);
    e.currentTarget.classList.add('opacity-40');
  };

  const handleTabDragEnd = (e: React.DragEvent) => {
    setDraggedTabIndex(null);
    e.currentTarget.classList.remove('opacity-40');
  };

  const handleTabDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedTabIndex === null || draggedTabIndex === dropIndex) return;

    const currentTabs = formData.settingsTabs || [
      { id: 'general', order: 0 },
      { id: 'contact', order: 1 },
      { id: 'stats', order: 2 },
      { id: 'content', order: 3 },
      { id: 'appearance', order: 4 },
      { id: 'social', order: 5 },
      { id: 'home', order: 6 },
    ];

    const sortedTabs = [...currentTabs].sort((a, b) => a.order - b.order);
    const [draggedItem] = sortedTabs.splice(draggedTabIndex, 1);
    sortedTabs.splice(dropIndex, 0, draggedItem);
    
    const reorderedTabs = sortedTabs.map((tab, i) => ({ ...tab, order: i }));
    setFormData({ ...formData, settingsTabs: reorderedTabs });
  };

  
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSectionIndex(index);
    // Optional: make it look slightly transparent while dragging
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedSectionIndex(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === dropIndex) return;

    if (!formData.homeSections) return;
    const newSections = [...formData.homeSections].sort((a, b) => a.order - b.order);
    
    // Remove the item from its original position
    const [draggedItem] = newSections.splice(draggedSectionIndex, 1);
    
    // Insert it at the new position
    newSections.splice(dropIndex, 0, draggedItem);
    
    // Reassign orders based on new array index
    const reorderedSections = newSections.map((sec, i) => ({ ...sec, order: i }));
    
    setFormData({ ...formData, homeSections: reorderedSections });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!formData.homeSections) return;
    const newSections = [...formData.homeSections].sort((a, b) => a.order - b.order);
    if (direction === 'up' && index > 0) {
      const temp = newSections[index].order;
      newSections[index].order = newSections[index - 1].order;
      newSections[index - 1].order = temp;
    } else if (direction === 'down' && index < newSections.length - 1) {
      const temp = newSections[index].order;
      newSections[index].order = newSections[index + 1].order;
      newSections[index + 1].order = temp;
    }
    setFormData({ ...formData, homeSections: newSections });
  };

  const toggleSectionVisible = (index: number) => {
    if (!formData.homeSections) return;
    const newSections = [...formData.homeSections].sort((a, b) => a.order - b.order);
    newSections[index].isVisible = !newSections[index].isVisible;
    setFormData({ ...formData, homeSections: newSections });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await mediaService.uploadFile(file, 'settings');
      const url = typeof res === 'string' ? res : (res?.originalUrl || res?.webpUrl || res?.url || '');
      setFormData(prev => ({ ...prev, logoUrl: url }));
      await updateSettings({ logoUrl: url });
    } catch (error) {
      console.error(error);
      alert(isRTL ? 'فشل رفع الشعار' : 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const res = await mediaService.uploadFile(file, 'settings');
      const url = typeof res === 'string' ? res : (res?.originalUrl || res?.webpUrl || res?.url || '');
      setFormData(prev => ({ ...prev, faviconUrl: url }));
      await updateSettings({ faviconUrl: url });
    } catch (error) {
      console.error(error);
      alert(isRTL ? 'فشل رفع الأيقونة' : 'Failed to upload favicon');
    } finally {
      setUploadingFavicon(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      alert(isRTL ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(isRTL ? 'فشل حفظ الإعدادات. يرجى المحاولة مرة أخرى.' : 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading && !formData.siteName) return <div className="p-8 text-gray-500">{t('common.loading')}</div>;

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-black mb-1">{t('cms.settingsTitle')}</h1>
          <p className="text-sm text-gray-500">{t('cms.settingsSubtitle')}</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-70 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? t('common.saving') : t('cms.saveChanges')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col overflow-x-auto pb-2 md:pb-0 gap-1.5 md:space-y-1 bg-gray-100/50 p-1 md:p-0 md:bg-transparent rounded-xl hide-scrollbar">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                draggable
                onDragStart={(e) => handleTabDragStart(e, index)}
                onDragEnd={handleTabDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleTabDrop(e, index)}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  `flex items-center gap-2.5 px-3.5 py-2 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-grab active:cursor-grabbing`,
                  activeTab === tab.id
                    ? "bg-white text-black shadow-sm font-semibold border border-gray-200"
                    : "text-gray-500 hover:bg-white/60 hover:text-black"
                )}
              >
                <tab.icon className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 space-y-6">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-serif mb-4">{t('cms.settingsGeneral')}</h2>
                <div className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                        {isRTL ? 'اسم الموقع (بالعربية)' : 'Site Name (Arabic)'}
                      </label>
                      <input 
                        name="siteName_ar" 
                        value={formData.siteName_ar || ''} 
                        onChange={handleChange} 
                        type="text" 
                        dir="rtl"
                        placeholder="استوديو اليم"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                        {isRTL ? 'اسم الموقع (بالإنكليزية)' : 'Site Name (English)'}
                      </label>
                      <input 
                        name="siteName" 
                        value={formData.siteName || ''} 
                        onChange={handleChange} 
                        type="text" 
                        dir="ltr"
                        placeholder="ALYAM Studio"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'وصف الموقع (بالعربية)' : 'Site Description (Arabic)'}
                    </label>
                    <textarea 
                      name="siteDescription_ar" 
                      value={formData.siteDescription_ar || ''} 
                      onChange={handleChange} 
                      rows={2} 
                      dir="rtl"
                      placeholder="استوديو متخصص في نشر المناهج وتصميم الأغلفة..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'وصف الموقع (بالإنكليزية)' : 'Site Description (English)'}
                    </label>
                    <textarea 
                      name="siteDescription" 
                      value={formData.siteDescription || ''} 
                      onChange={handleChange} 
                      rows={2} 
                      dir="ltr"
                      placeholder="Premium digital experiences, branding..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{t('cms.seoTitleFormat')}</label>
                    <input 
                      name="seoTitleFormat" 
                      value={formData.seoTitleFormat || ''} 
                      onChange={handleChange} 
                      type="text" 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'صورة المدير (صورة الحساب)' : 'Manager / Admin Avatar Photo'}
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 overflow-hidden flex items-center justify-center shrink-0">
                        {formData.adminAvatarUrl ? (
                          <img 
                            src={typeof formData.adminAvatarUrl === 'string' ? formData.adminAvatarUrl : ((formData.adminAvatarUrl as any)?.originalUrl || (formData.adminAvatarUrl as any)?.webpUrl || (formData.adminAvatarUrl as any)?.url || '')} 
                            alt="Manager Avatar" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User className="w-8 h-8 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          {uploadingAvatar ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'تغيير صورة المدير' : 'Upload Manager Photo')}
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </label>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {isRTL ? 'تظهر هذه الصورة في شريط لوحة التحكم العلوي وحساب المسؤول.' : 'Appears in top CMS header.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-serif mb-4">{t('cms.settingsContact')}</h2>
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{t('cms.contactEmail')}</label>
                    <input 
                      name="contactEmail" 
                      value={formData.contactEmail || ''} 
                      onChange={handleChange} 
                      type="email" 
                      placeholder="info@alyamstudio.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{t('cms.contactPhone')}</label>
                      <input 
                        name="contactPhone" 
                        value={formData.contactPhone || ''} 
                        onChange={handleChange} 
                        type="text" 
                        placeholder="+964 770 123 4567"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                        {isRTL ? 'رقم الواتساب (WhatsApp)' : 'WhatsApp Phone'}
                      </label>
                      <input 
                        name="whatsappPhone" 
                        value={formData.whatsappPhone || ''} 
                        onChange={handleChange} 
                        type="text" 
                        placeholder="+9647701234567"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'العنوان الجغرافي (بالعربية)' : 'Physical Address (Arabic)'}
                    </label>
                    <textarea 
                      name="contactAddress_ar" 
                      value={formData.contactAddress_ar || ''} 
                      onChange={handleChange} 
                      rows={2} 
                      dir="rtl"
                      placeholder="العراق - بغداد - شارع المتنبي / الحارثية"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'العنوان الجغرافي (بالإنكليزية)' : 'Physical Address (English)'}
                    </label>
                    <textarea 
                      name="contactAddress" 
                      value={formData.contactAddress || ''} 
                      onChange={handleChange} 
                      rows={2} 
                      dir="ltr"
                      placeholder="Baghdad, Iraq - Al-Mutanabbi / Al-Harthiya"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATS & NUMBERS TAB */}
          {activeTab === 'stats' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-serif mb-2">{isRTL ? 'أرقام وإحصائيات الاستوديو' : 'Studio Experience Numbers'}</h2>
                <p className="text-xs text-gray-500 mb-6">
                  {isRTL ? 'تظهر هذه الأرقام في الشريط الذهبي بالصفحة الرئيسية وصفحة عن الاستوديو.' : 'These stats appear on the golden numbers section on the Home and About pages.'}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'عدد أغطية الكتب المنجزة' : 'Book Covers Completed'}
                    </label>
                    <input 
                      name="stats.bookCovers" 
                      value={formData.stats?.bookCovers || '400+'} 
                      onChange={handleChange} 
                      type="text" 
                      placeholder="400+"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-black" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'عدد الملازم التعليمية' : 'Educational Booklets'}
                    </label>
                    <input 
                      name="stats.educationalBooklets" 
                      value={formData.stats?.educationalBooklets || '150+'} 
                      onChange={handleChange} 
                      type="text" 
                      placeholder="150+"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-black" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'الأنظمة البرمجية المخصصة' : 'Custom Software Systems'}
                    </label>
                    <input 
                      name="stats.customSystems" 
                      value={formData.stats?.customSystems || '50+'} 
                      onChange={handleChange} 
                      type="text" 
                      placeholder="50+"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-black" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'سنة التأسيس في العراق' : 'Founding Year in Iraq'}
                    </label>
                    <input 
                      name="stats.foundingYear" 
                      value={formData.stats?.foundingYear || '2013'} 
                      onChange={handleChange} 
                      type="text" 
                      placeholder="2013"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-black" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-serif mb-4">{t('cms.settingsContent')}</h2>
                <div className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                        {isRTL ? 'عنوان الهيرو (بالعربية)' : 'Hero Title (Arabic)'}
                      </label>
                      <input 
                        name="heroText_ar.title" 
                        value={formData.heroText_ar?.title || ''} 
                        onChange={handleChange} 
                        type="text" 
                        dir="rtl"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                        {isRTL ? 'عنوان الهيرو (بالإنكليزية)' : 'Hero Title (English)'}
                      </label>
                      <input 
                        name="heroText.title" 
                        value={formData.heroText?.title || ''} 
                        onChange={handleChange} 
                        type="text" 
                        dir="ltr"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                        {isRTL ? 'الوصف الفرعي (بالعربية)' : 'Hero Subtitle (Arabic)'}
                      </label>
                      <textarea 
                        name="heroText_ar.subtitle" 
                        value={formData.heroText_ar?.subtitle || ''} 
                        onChange={handleChange} 
                        rows={2} 
                        dir="rtl"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                        {isRTL ? 'الوصف الفرعي (بالإنكليزية)' : 'Hero Subtitle (English)'}
                      </label>
                      <textarea 
                        name="heroText.subtitle" 
                        value={formData.heroText?.subtitle || ''} 
                        onChange={handleChange} 
                        rows={2} 
                        dir="ltr"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h2 className="text-lg font-serif mb-4">{t('cms.aboutSection')}</h2>
                <div className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                        {isRTL ? 'عنوان قسم من نحن (بالعربية)' : 'About Title (Arabic)'}
                      </label>
                      <input 
                        name="aboutText_ar.title" 
                        value={formData.aboutText_ar?.title || ''} 
                        onChange={handleChange} 
                        type="text" 
                        dir="rtl"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                        {isRTL ? 'عنوان قسم من نحن (بالإنكليزية)' : 'About Title (English)'}
                      </label>
                      <input 
                        name="aboutText.title" 
                        value={formData.aboutText?.title || ''} 
                        onChange={handleChange} 
                        type="text" 
                        dir="ltr"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'محتوى عن الاستوديو (بالعربية)' : 'About Content (Arabic)'}
                    </label>
                    <textarea 
                      name="aboutText_ar.content" 
                      value={formData.aboutText_ar?.content || ''} 
                      onChange={handleChange} 
                      rows={3} 
                      dir="rtl"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                      {isRTL ? 'محتوى عن الاستوديو (بالإنكليزية)' : 'About Content (English)'}
                    </label>
                    <textarea 
                      name="aboutText.content" 
                      value={formData.aboutText?.content || ''} 
                      onChange={handleChange} 
                      rows={3} 
                      dir="ltr"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" 
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h2 className="text-lg font-serif mb-4">{t('cms.footerSettings')}</h2>
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{t('cms.footerText')}</label>
                    <input 
                      name="footerText" 
                      value={formData.footerText || ''} 
                      onChange={handleChange} 
                      type="text" 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-serif mb-4">{t('cms.settingsAppearance')}</h2>
                
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{t('cms.logo')}</label>
                    <div className="flex items-start gap-6 mt-4">
                      <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                        {formData.logoUrl ? (
                          <>
                            <img 
                              src={typeof formData.logoUrl === 'string' ? formData.logoUrl : ((formData.logoUrl as any)?.originalUrl || (formData.logoUrl as any)?.webpUrl || (formData.logoUrl as any)?.url || '')} 
                              alt="Logo" 
                              className="w-full h-full object-contain p-2" 
                            />
                            <button 
                              onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                              className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 shadow-sm hover:bg-red-50"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <Image className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                          {isRTL 
                            ? 'صيغة الشعار الموصى بها: SVG أو PNG شفاف. عند رفع الشعار، يرتبط تلقائياً بكافة العناوين والأوسمة وشعار الهيدر في كافة أرجاء الموقع.' 
                            : 'Recommended format: SVG or transparent PNG. Once uploaded, this logo will automatically link to all site badges, icons, and headers.'}
                        </p>
                        <label className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer transition-colors opacity-90 hover:opacity-100">
                          <Upload className="w-4 h-4" />
                          {uploadingLogo ? t('common.loading') : t('cms.chooseFile')}
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{t('cms.favicon')}</label>
                    <div className="flex items-start gap-6 mt-4">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                        {formData.faviconUrl ? (
                          <>
                            <img 
                              src={typeof formData.faviconUrl === 'string' ? formData.faviconUrl : ((formData.faviconUrl as any)?.originalUrl || (formData.faviconUrl as any)?.webpUrl || (formData.faviconUrl as any)?.url || '')} 
                              alt="Favicon" 
                              className="w-full h-full object-contain p-2" 
                            />
                            <button 
                              onClick={() => setFormData(prev => ({ ...prev, faviconUrl: '' }))}
                              className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 shadow-sm hover:bg-red-50"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <Globe className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">PNG or ICO, 32x32px or larger.</p>
                        <label className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer transition-colors opacity-90 hover:opacity-100">
                          <Upload className="w-4 h-4" />
                          {uploadingFavicon ? t('common.loading') : t('cms.chooseFile')}
                          <input type="file" className="hidden" accept="image/*" onChange={handleFaviconUpload} disabled={uploadingFavicon} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SOCIAL TAB */}
          {activeTab === 'social' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-serif mb-4">{t('cms.settingsSocial')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  {['facebook', 'instagram', 'telegram', 'whatsapp', 'youtube', 'tiktok', 'twitter', 'linkedin', 'behance', 'dribbble'].map(platform => (
                    <div key={platform}>
                      <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-gray-500 mb-1.5 capitalize">
                        <SocialIcon platform={platform} className="w-3.5 h-3.5 text-gray-600" />
                        <span>{platform}</span>
                      </label>
                      <input 
                        name={`socialLinks.${platform}`} 
                        value={(formData.socialLinks as any)?.[platform] || ''} 
                        onChange={handleChange} 
                        type="url" 
                        placeholder={`https://${platform}.com/...`}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-serif mb-4">{isRTL ? 'ترتيب الصفحة الرئيسية' : 'Home Page Layout'}</h2>
                <p className="text-sm text-gray-500 mb-6">
                  {isRTL 
                    ? 'قم بتغيير ترتيب العناصر في الصفحة الرئيسية أو إخفائها.' 
                    : 'Change the order of sections on the home page or hide them.'}
                </p>
                <div className="space-y-3 max-w-2xl">
                  {formData.homeSections?.sort((a, b) => a.order - b.order).map((section, index) => {
                    const sectionNames: Record<string, string> = {
                      covers: isRTL ? 'أغلفة الكتب (Cinematic Slider)' : 'Book Covers',
                      booklets: isRTL ? 'الملازم التعليمية (Educational Accordion)' : 'Educational Booklets',
                      digital: isRTL ? 'الحلول البرمجية والرقمية' : 'Digital & Software Solutions',
                      gallery: isRTL ? 'معرض الأعمال (Accordion Gallery)' : 'Accordion Gallery',
                      services: isRTL ? 'الخدمات (Services Summary)' : 'Services Summary',
                      experience: isRTL ? 'الأرقام والإحصائيات' : 'Numbers & Stats',
                      about: isRTL ? 'نبذة عن الاستوديو (About)' : 'About Preview'
                    };
                    const name = sectionNames[section.id] || section.id;
                    return (
                      <div 
                        key={section.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-move hover:border-amber-400 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Layout className="w-5 h-5 text-gray-400" />
                          <span className={`text-sm font-medium ${!section.isVisible ? 'text-gray-400 line-through' : 'text-black'}`}>
                            {name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSectionVisible(index)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors"
                            title={isRTL ? 'إظهار/إخفاء' : 'Toggle Visibility'}
                          >
                            {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleMoveSection(index, 'up')}
                            disabled={index === 0}
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveSection(index, 'down')}
                            disabled={index === (formData.homeSections?.length || 0) - 1}
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
