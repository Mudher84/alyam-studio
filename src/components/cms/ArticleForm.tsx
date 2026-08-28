import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Image as ImageIcon, Save, Send, Clock, Trash2, ArrowLeft, Activity } from 'lucide-react';
import { Article } from '../../types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import MediaPicker from './MediaPicker';
import RichTextEditor from './RichTextEditor';
import ContentAnalytics from './ContentAnalytics';
import { format } from 'date-fns';
import { CustomSelect } from '../ui/CustomSelect';
import { AutoTranslateButton } from '../AutoTranslateButton';

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  title_ar: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string(),
  excerpt_ar: z.string().optional(),
  content: z.string(),
  content_ar: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  author: z.string().min(1, "Author is required"),
  tags: z.string(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'scheduled', 'archived', 'trash']),
  publishDate: z.string().optional(),
  readingTime: z.number().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialData?: Article | null;
  onSubmit: (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export default function ArticleForm({ initialData, onSubmit, onCancel }: ArticleFormProps) {
  const { t, isRTL } = useLanguageStore();
  const [showMediaPicker, setShowMediaPicker] = useState<'featured' | 'editor' | 'gallery' | null>(null);
  const [editorContent, setEditorContent] = useState(initialData?.content || '');
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings' | 'analytics'>('content');
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);

  const [lastSaved, setLastSaved] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, watch, setValue, getValues, reset, control } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      title_ar: initialData.title_ar || '',
      slug: initialData.slug,
      excerpt: initialData.excerpt,
      excerpt_ar: initialData.excerpt_ar || '',
      content: initialData.content,
      content_ar: initialData.content_ar || '',
      category: initialData.category,
      author: initialData.author,
      tags: initialData.tags?.join(', ') || '',
      featuredImage: initialData.featuredImage || '',
      status: initialData.status,
      publishDate: initialData.publishDate ? format(new Date(initialData.publishDate), "yyyy-MM-dd'T'HH:mm") : '',
      readingTime: initialData.readingTime || 5,
      seoTitle: initialData.seoTitle || '',
      seoDescription: initialData.seoDescription || '',
      seoKeywords: initialData.seoKeywords || '',
    } : {
      status: 'draft',
      readingTime: 5,
      author: 'Admin',
      content: '',
      content_ar: ''
    }
  });

  const title = watch('title');
  
  useEffect(() => {
    if (!initialData && title) {
      const slug = title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [title, initialData, setValue]);

  useEffect(() => {
    setValue('content', editorContent, { shouldDirty: true });
  }, [editorContent, setValue]);

  // Autosave interval
  useEffect(() => {
    if (!initialData) return; // Only autosave existing articles to avoid creating multiple drafts
    
    const interval = setInterval(() => {
      if (isDirty) {
        handleSubmit(async (data) => {
          const formattedData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
            ...data,
            tags: data.tags.split(',').map(s => s.trim()).filter(Boolean),
            publishDate: data.publishDate ? new Date(data.publishDate).getTime() : undefined,
            gallery,
          };
          await onSubmit(formattedData);
          setLastSaved(Date.now());
          reset(data, { keepValues: true, keepDirty: false });
        })();
      }
    }, 60000); // Autosave every 60 seconds

    return () => clearInterval(interval);
  }, [isDirty, handleSubmit, onSubmit, initialData, reset]);

  const handleFormSubmit = async (data: ArticleFormData) => {
    const formattedData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
      ...data,
      tags: data.tags.split(',').map(s => s.trim()).filter(Boolean),
      publishDate: data.publishDate ? new Date(data.publishDate).getTime() : undefined,
      gallery,
    };
    await onSubmit(formattedData);
  };

  const setStatusAndSubmit = (status: ArticleFormData['status']) => {
    setValue('status', status);
    handleSubmit(handleFormSubmit)();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F6F2EB] flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-[#FCFAF7] border-b border-[#E0D7C9] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 -ml-2 text-gray-400 hover:text-black rounded-lg hover:bg-[#F6F2EB] transition-colors">
            <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <h2 className="text-xl font-serif text-black">{initialData ? t('cms.editArticle') : t('cms.newArticle')}</h2>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            watch('status') === 'published' ? 'bg-green-50 text-green-700' :
            watch('status') === 'draft' ? 'bg-[#F6F2EB] text-gray-700 border border-[#E0D7C9]' : 'bg-yellow-50 text-yellow-700'
          }`}>
            {watch('status') === 'published' ? t('cms.published') : watch('status') === 'draft' ? t('cms.draft') : watch('status')}
          </span>
          {isDirty && <span className="text-xs text-amber-500 font-medium">{t('cms.unsavedChanges')}</span>}
          {lastSaved && !isDirty && <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock size={12} /> {new Date(lastSaved).toLocaleTimeString()}</span>}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setStatusAndSubmit('draft')}
            disabled={isSubmitting} 
            className="px-4 py-2 bg-[#FCFAF7] border border-[#E0D7C9] text-gray-700 font-medium rounded-xl hover:bg-[#F6F2EB] transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            {t('cms.saveDraft')}
          </button>
          <button 
            type="button" 
            onClick={() => setStatusAndSubmit('published')}
            disabled={isSubmitting} 
            className="px-6 py-2 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Send size={16} />
            {t('cms.publish')}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-[#FCFAF7] overflow-y-auto">
          <div className="border-b border-[#E0D7C9] px-8 py-2 flex gap-6 shrink-0 bg-[#FCFAF7]">
            <button 
              onClick={() => setActiveTab('content')} 
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
            >
              {t('cms.tabContent')}
            </button>
            <button 
              onClick={() => setActiveTab('seo')} 
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'seo' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
            >
              {t('cms.tabSeo')}
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
            >
              {t('cms.tabSettings')}
            </button>
            {initialData && (
              <button 
                onClick={() => setActiveTab('analytics')} 
                className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'analytics' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
              >
                <Activity size={16} /> {t('cms.tabAnalytics')}
              </button>
            )}
          </div>

          <div className="flex-1 p-8 max-w-4xl w-full mx-auto">
            <form id="article-form" onSubmit={handleSubmit(handleFormSubmit)}>
              
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Titles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {isRTL ? 'عنوان المقال بالعربية (Title AR)' : 'Article Title in Arabic (عنوان المقال بالعربية)'}
                        </label>
                        <AutoTranslateButton 
                          sourceText={watch('title')} 
                          onTranslate={(translated) => setValue('title_ar', translated, { shouldValidate: true, shouldDirty: true })} 
                        />
                      </div>
                      <input 
                        {...register('title_ar')} 
                        dir="rtl"
                        placeholder="عنوان المقال بالعربية..." 
                        className="w-full text-2xl font-serif text-black placeholder:text-gray-300 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-black/5 bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {isRTL ? 'عنوان المقال بالإنكليزية (Title EN)' : 'Article Title in English (عنوان المقال بالإنكليزية)'}
                        </label>
                        <AutoTranslateButton 
                          sourceText={watch('title_ar')}
                          fromLang="ar"
                          toLang="en"
                          onTranslate={(translated) => setValue('title', translated, { shouldValidate: true, shouldDirty: true })} 
                        />
                      </div>
                      <input 
                        {...register('title')} 
                        dir="ltr"
                        placeholder="Article Title in English..." 
                        className="w-full text-2xl font-serif text-black placeholder:text-gray-300 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-black/5 bg-white"
                      />
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>
                  </div>
                  
                  {/* Excerpts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {isRTL ? 'ملخص المقال بالعربية (Excerpt AR)' : 'Excerpt in Arabic (ملخص المقال بالعربية)'}
                        </label>
                        <AutoTranslateButton 
                          sourceText={watch('excerpt')} 
                          onTranslate={(translated) => setValue('excerpt_ar', translated, { shouldValidate: true, shouldDirty: true })} 
                        />
                      </div>
                      <textarea 
                        {...register('excerpt_ar')} 
                        rows={3}
                        dir="rtl"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 resize-none text-sm" 
                        placeholder="ملخص قصير للمقال بالعربية..."
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {isRTL ? 'ملخص المقال بالإنكليزية (Excerpt EN)' : 'Excerpt in English (ملخص المقال بالإنكليزية)'}
                        </label>
                        <AutoTranslateButton 
                          sourceText={watch('excerpt_ar')}
                          fromLang="ar"
                          toLang="en"
                          onTranslate={(translated) => setValue('excerpt', translated, { shouldValidate: true, shouldDirty: true })} 
                        />
                      </div>
                      <textarea 
                        {...register('excerpt')} 
                        rows={3}
                        dir="ltr"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 resize-none text-sm" 
                        placeholder="Brief summary of the article in English..."
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {isRTL ? 'المحتوى الكامل للمقال (Article Body & Content)' : 'Full Article Content (محتوى المقال)'}
                    </label>
                    <div className="prose-editor-container min-h-[400px]">
                      <RichTextEditor 
                        content={editorContent} 
                        onChange={setEditorContent} 
                        onImageClick={() => setShowMediaPicker('editor')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="text-lg font-serif text-black mb-1">{isRTL ? 'SEO خاص بالمقال' : 'Article SEO & Sharing'}</h3>
                    <p className="text-xs text-gray-500 mb-6">{isRTL ? 'إعدادات محركات البحث (SEO) الخاصة بهذا المقال فقط' : 'Search Engine Optimization (SEO) settings for this article only'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {isRTL ? 'عنوان SEO' : 'SEO Title'}
                    </label>
                    <input 
                      {...register('seoTitle')} 
                      placeholder={isRTL ? "اتركه فارغًا لاستخدام عنوان المقال تلقائيًا" : "Leave blank to use article title automatically"} 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black text-sm" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'وصف SEO' : 'SEO Description'}
                      </label>
                      <span className={`text-xs font-mono ${(watch('seoDescription')?.length || 0) > 160 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                        {watch('seoDescription')?.length || 0} / 160
                      </span>
                    </div>
                    <textarea 
                      {...register('seoDescription')} 
                      rows={3} 
                      maxLength={200}
                      placeholder={isRTL ? "اكتب وصفًا مختصرًا للمقال، أو اتركه فارغًا لإنشائه تلقائيًا" : "Write a short description for the article, or leave blank..."} 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-black/5 focus:border-black text-sm resize-none" 
                    />
                  </div>
                  
                  {/* Google Preview */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      {isRTL ? 'معاينة Google' : 'Google Preview'}
                    </label>
                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
                      <div className="text-xs text-gray-500 font-mono">alyamstudio.com › magazine › {watch('slug') || '...'}</div>
                      <div className="text-blue-600 text-base font-medium hover:underline cursor-pointer line-clamp-1">
                        {watch('seoTitle') || watch('title') || (isRTL ? 'عنوان المقال' : 'Article Title')}
                      </div>
                      <div className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {watch('seoDescription') || watch('excerpt') || (isRTL ? 'سيظهر وصف المقال هنا...' : 'Article description will appear here...')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-lg font-serif text-black mb-4">{t('cms.tabSettings')}</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                    <input {...register('slug')} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-black/5 focus:border-black" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('cms.category')}</label>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="..."
                            options={[
                              { value: 'Technology', label: 'Technology' },
                              { value: 'Design', label: 'Design' },
                              { value: 'Programming', label: 'Programming' },
                              { value: 'AI', label: 'AI' },
                              { value: 'Case Studies', label: 'Case Studies' },
                            ]}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('cms.author')}</label>
                      <input {...register('author')} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-black/5 focus:border-black" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('cms.date')}</label>
                      <input type="datetime-local" {...register('publishDate')} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-black/5 focus:border-black bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('cms.estReadingTime')}</label>
                      <input type="number" {...register('readingTime', { valueAsNumber: true })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-black/5 focus:border-black" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('cms.tagsLabel')}</label>
                    <input {...register('tags')} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-black/5 focus:border-black" />
                  </div>
                </div>
              )}

            </form>

            {activeTab === 'analytics' && initialData && (
              <ContentAnalytics resourceId={initialData.id} resourceType="article" />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 h-full p-6 overflow-y-auto shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{t('cms.featuredImage')}</h3>
          
          <div className="mb-6">
            {watch('featuredImage') ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group border border-gray-200">
                <img src={watch('featuredImage')} alt="Featured" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => setShowMediaPicker('featured')} className="p-2 bg-white text-black rounded-lg hover:bg-gray-100" title={t('cms.replace')}>
                    <ImageIcon size={18} />
                  </button>
                  <button onClick={() => setValue('featuredImage', '')} className="p-2 bg-white text-red-600 rounded-lg hover:bg-gray-100" title={t('cms.remove')}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowMediaPicker('featured')}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-black transition-colors hover:bg-gray-100/50"
              >
                <ImageIcon size={24} className="mb-2" />
                <span className="text-sm font-medium">{t('cms.selectFeaturedImage')}</span>
              </button>
            )}
          </div>

          {/* Article Gallery */}
          <div className="pt-6 border-t border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {isRTL ? 'معرض صور المقال' : 'Article Gallery'}
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker('gallery')}
                className="text-xs text-amber-600 hover:text-black font-semibold uppercase tracking-wider"
              >
                {isRTL ? '+ إضافة' : '+ Add'}
              </button>
            </div>
            
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group border border-gray-200">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setGallery(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-gray-100"
                        title={t('cms.remove') || 'Remove'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => setShowMediaPicker('gallery')}
                className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-black transition-colors hover:bg-gray-100/50"
              >
                <ImageIcon size={18} className="mb-1" />
                <span className="text-xs font-medium">{isRTL ? 'إضافة صور للمعرض' : 'Add Gallery Images'}</span>
              </button>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{t('cms.details')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cms.wordsCount')}</span>
                <span className="text-black font-medium">{editorContent.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(w => w.length > 0).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cms.createdDate')}</span>
                <span className="text-black font-medium">{initialData ? new Date(initialData.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : t('cms.justNow')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMediaPicker && (
        <MediaPicker 
          multiple={showMediaPicker === 'gallery'}
          onClose={() => setShowMediaPicker(null)}
          onSelect={(url) => {
            if (showMediaPicker === 'featured') {
              setValue('featuredImage', url);
            } else if (showMediaPicker === 'editor') {
              // Insert image into TipTap editor
              setEditorContent(prev => prev + `<img src="${url}" />`);
            } else if (showMediaPicker === 'gallery') {
              setGallery(prev => {
                if (prev.includes(url)) return prev;
                return [...prev, url];
              });
            }
          }}
        />
      )}
    </div>
  );
}
