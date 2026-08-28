import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, UploadCloud, Plus, Trash2, Image as ImageIcon, BarChart } from 'lucide-react';
import { Project } from '../../types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useMediaStore } from '../../stores/useMediaStore';
import { useTeacherStore } from '../../stores/useTeacherStore';
import { mediaService } from '../../lib/services/media';
import MediaPicker from './MediaPicker';
import ContentAnalytics from './ContentAnalytics';
import { cn, isEducationalCategory } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { AutoTranslateButton } from '../AutoTranslateButton';

const SUBJECT_PRESETS = [
  { value: 'chemistry', ar: 'الكيمياء', en: 'Chemistry' },
  { value: 'physics', ar: 'الفيزياء', en: 'Physics' },
  { value: 'mathematics', ar: 'الرياضيات', en: 'Mathematics' },
  { value: 'biology', ar: 'الأحياء', en: 'Biology' },
  { value: 'arabic', ar: 'اللغة العربية', en: 'Arabic Language' },
  { value: 'english', ar: 'اللغة الإنجليزية', en: 'English Language' },
  { value: 'islamic', ar: 'التربية الإسلامية', en: 'Islamic Studies' },
  { value: 'computer', ar: 'الحاسوب والتكنولوجيا', en: 'Computer Science' },
  { value: 'history', ar: 'التاريخ', en: 'History' },
  { value: 'geography', ar: 'الجغرافيا', en: 'Geography' },
  { value: 'economics', ar: 'الاقتصاد', en: 'Economics' },
  { value: 'social', ar: 'الاجتماعيات والتربية الوطنية', en: 'Social Studies' },
  { value: 'french', ar: 'اللغة الفرنسية', en: 'French Language' },
  { value: 'science', ar: 'العلوم العامة', en: 'General Science' },
];

const GRADE_PRESETS = [
  // Primary Stage
  { value: 'p4', ar: 'الرابع الابتدائي', en: '4th Primary' },
  { value: 'p5', ar: 'الخامس الابتدائي', en: '5th Primary' },
  { value: 'p6', ar: 'السادس الابتدائي', en: '6th Primary' },
  // Intermediate Stage
  { value: 'm1', ar: 'الأول المتوسط', en: '1st Intermediate' },
  { value: 'm2', ar: 'الثاني المتوسط', en: '2nd Intermediate' },
  { value: 'm3', ar: 'الثالث المتوسط', en: '3rd Intermediate' },
  // Secondary / Preparatory Stage
  { value: 's4_sci', ar: 'الرابع العلمي', en: '4th Scientific' },
  { value: 's4_lit', ar: 'الرابع الأدبي', en: '4th Literary' },
  { value: 's5_sci', ar: 'الخامس العلمي', en: '5th Scientific' },
  { value: 's5_lit', ar: 'الخامس الأدبي', en: '5th Literary' },
  { value: 's6_sci', ar: 'السادس العلمي', en: '6th Scientific' },
  { value: 's6_lit', ar: 'السادس الأدبي', en: '6th Literary' },
];

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  title_ar: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  description_ar: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  teacher: z.string().optional(),
  teacher_ar: z.string().optional(),
  subject: z.string().optional(),
  subject_ar: z.string().optional(),
  bookName: z.string().optional(),
  bookName_ar: z.string().optional(),
  gradeLevel: z.string().optional(),
  gradeLevel_ar: z.string().optional(),
  year: z.string().optional(),
  tags: z.string(), // We will split by comma
  softwareUsed: z.string(), // We will split by comma
  coverImage: z.string().url().optional().or(z.literal('')),
  images: z.string(), // We will split by comma or newline
  featured: z.boolean(),
  status: z.enum(['draft', 'published', 'archived'])
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Project | null;
  defaultCategory?: string;
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({ initialData, defaultCategory, onSubmit, onCancel }: ProjectFormProps) {
  const { t, isRTL } = useLanguageStore();
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, setValue, getValues } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      title_ar: initialData.title_ar || '',
      slug: initialData.slug,
      description: initialData.description,
      description_ar: initialData.description_ar || '',
      category: initialData.category,
      teacher: initialData.teacher || '',
      teacher_ar: initialData.teacher_ar || '',
      subject: initialData.subject || '',
      subject_ar: initialData.subject_ar || '',
      bookName: initialData.bookName || '',
      bookName_ar: initialData.bookName_ar || '',
      gradeLevel: initialData.gradeLevel || '',
      gradeLevel_ar: initialData.gradeLevel_ar || '',
      year: initialData.year || '',
      tags: initialData.tags?.join(', ') || '',
      softwareUsed: initialData.softwareUsed?.join(', ') || '',
      coverImage: initialData.coverImage || '',
      images: initialData.images?.join('\n') || '',
      featured: initialData.featured || false,
      status: initialData.status || 'draft'
    } : {
      category: defaultCategory || '',
      featured: false,
      status: 'draft'
    }
  });

  const title = watch('title');
  const selectedCategory = watch('category');
  const isEdu = isEducationalCategory(selectedCategory);

  const { teachers, fetchTeachers } = useTeacherStore();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>('');
  const [selectedGradeKey, setSelectedGradeKey] = useState<string>('');

  React.useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  React.useEffect(() => {
    if (initialData) {
      if (teachers.length > 0) {
        const currentAr = initialData.teacher_ar;
        const currentEn = initialData.teacher;
        const match = teachers.find(
          t => (currentAr && t.name_ar === currentAr) || (currentEn && t.name_en === currentEn)
        );
        if (match) {
          setSelectedTeacherId(match.id);
        }
      }

      const curSubjAr = initialData.subject_ar || '';
      const curSubjEn = initialData.subject || '';
      const matchSubject = SUBJECT_PRESETS.find(
        s => (curSubjAr && curSubjAr.includes(s.ar)) || (curSubjEn && curSubjEn.toLowerCase().includes(s.en.toLowerCase()))
      );
      if (matchSubject) {
        setSelectedSubjectKey(matchSubject.value);
      }

      const curGradeAr = initialData.gradeLevel_ar || '';
      const curGradeEn = initialData.gradeLevel || '';
      const matchGrade = GRADE_PRESETS.find(
        g => (curGradeAr && curGradeAr === g.ar) || (curGradeEn && curGradeEn === g.en)
      );
      if (matchGrade) {
        setSelectedGradeKey(matchGrade.value);
      }
    }
  }, [initialData, teachers]);
  
  // Auto-generate slug from title if slug is untouched (simple implementation)
  React.useEffect(() => {
    if (!initialData && title) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [title, initialData, setValue]);

  const [showMediaPicker, setShowMediaPicker] = useState<'cover' | 'gallery' | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'analytics'>('content');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingCover(true);
    try {
      const url = await mediaService.uploadFile(file, 'projects');
      setValue('coverImage', url, { shouldValidate: true, shouldDirty: true });
      useMediaStore.getState().uploadFiles([file]);
    } catch (err) {
      console.error('Error uploading cover image:', err);
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const fileList = Array.from(files);
      const uploadedUrls: string[] = [];
      for (const file of fileList) {
        const url = await mediaService.uploadFile(file, 'projects');
        uploadedUrls.push(url);
      }
      useMediaStore.getState().uploadFiles(fileList);

      const currentVal = watch('images') || '';
      const updated = currentVal ? `${currentVal}\n${uploadedUrls.join('\n')}` : uploadedUrls.join('\n');
      setValue('images', updated, { shouldValidate: true, shouldDirty: true });
    } catch (err) {
      console.error('Error uploading gallery images:', err);
    } finally {
      setUploadingGallery(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    const formattedData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      ...data,
      tags: data.tags.split(',').map(s => s.trim()).filter(Boolean),
      softwareUsed: data.softwareUsed.split(',').map(s => s.trim()).filter(Boolean),
      images: data.images.split(/\r?\n/).map(s => s.trim()).filter(Boolean),
    };
    await onSubmit(formattedData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F6F2EB] flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-200">
      {/* Top Fixed Header */}
      <header className="bg-[#FCFAF7] border-b border-[#E0D7C9] px-6 py-3.5 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onCancel} 
            className="p-2 -ml-2 text-gray-500 hover:text-black rounded-xl hover:bg-[#F6F2EB] transition-colors flex items-center gap-2"
            title={isRTL ? "إغلاق والعودة" : "Close"}
          >
            <X size={22} />
            <span className="hidden sm:inline text-sm font-medium">{isRTL ? 'إلغاء' : 'Cancel'}</span>
          </button>
          
          <div className="h-6 w-[1px] bg-[#E0D7C9] hidden sm:block" />

          <div>
            <h2 className="text-lg font-serif font-bold text-black flex items-center gap-2">
              {initialData ? (isRTL ? 'تعديل مشروع' : 'Edit Project') : (isRTL ? 'مشروع جديد' : 'New Project')}
            </h2>
          </div>

          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            watch('status') === 'published' ? 'bg-green-50 text-green-700 border border-green-200' :
            watch('status') === 'draft' ? 'bg-[#F6F2EB] text-gray-700 border border-[#E0D7C9]' : 'bg-yellow-50 text-yellow-700'
          }`}>
            {watch('status') === 'published' ? (isRTL ? 'منشور' : 'Published') : watch('status') === 'draft' ? (isRTL ? 'مسودة' : 'Draft') : watch('status')}
          </span>
        </div>

        {/* Header Center Tabs */}
        <div className="flex items-center gap-2 bg-[#F6F2EB] p-1 rounded-xl border border-[#E0D7C9]">
          <button 
            type="button"
            onClick={() => setActiveTab('content')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all", 
              activeTab === 'content' ? "bg-[#FCFAF7] text-black shadow-xs border border-[#E0D7C9]" : "text-gray-600 hover:text-black"
            )}
          >
            {isRTL ? 'محتوى المشروع' : 'Content & Details'}
          </button>
          {initialData && (
            <button 
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5", 
                activeTab === 'analytics' ? "bg-[#FCFAF7] text-black shadow-xs border border-[#E0D7C9]" : "text-gray-600 hover:text-black"
              )}
            >
              <BarChart size={14} /> {isRTL ? 'الإحصائيات' : 'Analytics'}
            </button>
          )}
        </div>

        {/* Header Right Save Action */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onCancel} 
            className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            {t('cms.cancel')}
          </button>
          <button 
            type="button"
            onClick={handleSubmit(handleFormSubmit)} 
            disabled={isSubmitting} 
            className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ المشروع' : 'Save Project')}
          </button>
        </div>
      </header>

      {/* Main Full Page Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'content' ? (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-[#FCFAF7] rounded-2xl shadow-xs border border-[#E0D7C9] p-6 md:p-8 space-y-8">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {isRTL ? 'المعلومات الأساسية (العنوان والوصف بالعربية والإنكليزية)' : 'Basic Info (Arabic & English)'}
                  </h3>
                  <span className="text-xs text-gray-400 font-normal">
                    {isRTL ? 'أدخل البيانات باللغتين ليظهر للمستخدم حسَب لغته' : 'Bilingual Support'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {isRTL ? 'العنوان بالعربية' : 'Title in Arabic (العنوان بالعربية)'} <span className="text-red-500">*</span>
                      </label>
                      <AutoTranslateButton 
                        sourceText={watch('title')} 
                        onTranslate={(translated) => setValue('title_ar', translated, { shouldValidate: true, shouldDirty: true })} 
                      />
                    </div>
                    <input 
                      {...register('title_ar')} 
                      dir="rtl"
                      placeholder="أدخل العنوان بالعربية..."
                      className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors font-medium text-base" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {isRTL ? 'العنوان بالإنكليزية' : 'Title in English (العنوان بالإنكليزية)'} <span className="text-red-500">*</span>
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
                      placeholder="Title in English..."
                      className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors font-medium text-base" 
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1 mr-2">{errors.title.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {isRTL ? 'المعرف للرابط / Slug' : 'Web Identifier (Slug)'}
                  </label>
                  <input 
                    {...register('slug')} 
                    dir="ltr"
                    placeholder="my-project-slug"
                    className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors font-mono text-sm bg-gray-50/50" 
                  />
                  {errors.slug && <p className="text-red-500 text-xs mt-1 mr-2">{errors.slug.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {isRTL ? 'الوصف بالعربية' : 'Description in Arabic (الوصف بالعربية)'}
                      </label>
                      <AutoTranslateButton 
                        sourceText={watch('description')} 
                        onTranslate={(translated) => setValue('description_ar', translated, { shouldValidate: true, shouldDirty: true })} 
                      />
                    </div>
                    <textarea 
                      {...register('description_ar')} 
                      rows={5} 
                      dir="rtl"
                      placeholder="أدخل التفاصيل والوصف بالعربية..."
                      className="w-full px-5 py-3.5 border border-gray-200 rounded-3xl text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {isRTL ? 'الوصف بالإنكليزية' : 'Description in English (الوصف بالإنكليزية)'}
                      </label>
                      <AutoTranslateButton 
                        sourceText={watch('description_ar')}
                        fromLang="ar"
                        toLang="en"
                        onTranslate={(translated) => setValue('description', translated, { shouldValidate: true, shouldDirty: true })} 
                      />
                    </div>
                    <textarea 
                      {...register('description')} 
                      rows={5} 
                      dir="ltr"
                      placeholder="Enter detailed description in English..."
                      className="w-full px-5 py-3.5 border border-gray-200 rounded-3xl text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1 mr-2">{errors.description.message}</p>}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  {isRTL 
                    ? (isEdu ? 'بيانات التصنيف والأستاذ / Categories & Author' : 'بيانات التصنيف وبواسطة / Categories & Client (By)') 
                    : (isEdu ? 'Metadata & Author (Arabic & English)' : 'Metadata & Client (By)')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      {t('cms.category')} / القسم
                    </label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="اختر القسم / Select Category"
                          options={[
                            { value: 'Web Applications', label: 'تطبيقات ومواقع الويب / Web Applications' },
                            { value: 'Book Covers', label: 'أغلفة كتب ومطبوعات / Book Covers' },
                            { value: 'Educational Covers', label: 'أغلفة تعليمية وملازم / Educational Covers' },
                            { value: 'Educational Booklets', label: 'ملازم وكتب منهجية / Educational Booklets' },
                            { value: 'Software Scripts', label: 'سكربتات وأنظمة / Software Scripts' },
                            { value: 'Branding', label: 'هوية بصرية وتصميم / Branding' },
                            { value: 'Software', label: 'البرمجيات والأنظمة / Software and Systems' },
                            { value: 'Apps', label: 'تطبيقات الهواتف / Mobile Apps' },
                          ]}
                          error={!!errors.category}
                        />
                      )}
                    />
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      {t('cms.yearLabel')} / السنة
                    </label>
                    <input {...register('year')} placeholder="e.g. 2026" className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      {t('cms.status')} / الحالة
                    </label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { value: 'draft', label: `${t('cms.draft')} / مسودة` },
                            { value: 'published', label: `${t('cms.published')} / منشور` },
                            { value: 'archived', label: `${t('cms.archived')} / مؤرشف` },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Teacher / Client Block */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-3xl space-y-4">
                  {isEdu ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                          {isRTL ? 'اختيار المعلم من القائمة المنسدلة' : 'Select Teacher from Dropdown'}
                        </label>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {isRTL ? 'تحدد الخيارات تلقائياً عند الاختيار' : 'Auto-fills inputs upon selection'}
                        </span>
                      </div>

                      <CustomSelect
                        value={selectedTeacherId}
                        onChange={(teacherId) => {
                          setSelectedTeacherId(teacherId);
                          const found = teachers.find(t => t.id === teacherId);
                          if (found) {
                            setValue('teacher_ar', found.name_ar, { shouldValidate: true, shouldDirty: true });
                            setValue('teacher', found.name_en, { shouldValidate: true, shouldDirty: true });
                            if (found.subject_ar) setValue('subject_ar', found.subject_ar, { shouldValidate: true, shouldDirty: true });
                            if (found.subject_en) setValue('subject', found.subject_en, { shouldValidate: true, shouldDirty: true });
                          }
                        }}
                        placeholder={isRTL ? 'اختر المعلم من القائمة المنسدلة...' : 'Select teacher from list...'}
                        options={[
                          { value: '', label: isRTL ? '-- اختر معلم من القائمة المسجلة (أو اكتب مخصص) --' : '-- Select from list (or write custom) --' },
                          ...teachers.map(t => ({
                            value: t.id,
                            label: `${t.name_ar} (${t.name_en}) ${t.subject_ar ? `- ${t.subject_ar}` : ''}`
                          }))
                        ]}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                        {isRTL ? 'بواسطة (العميل أو الجهة المالكة للمشروع)' : 'Created By / Client'}
                      </label>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {isRTL ? 'إدخال مخصص لاسم العميل أو الجهة' : 'Direct manual input'}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        {isEdu 
                          ? (isRTL ? 'اسم المعلم بالعربية' : 'Teacher (Arabic)') 
                          : (isRTL ? 'بواسطة بالعربية (اسم العميل أو الجهة)' : 'By / Client (Arabic)')}
                      </label>
                      <input 
                        {...register('teacher_ar')} 
                        dir="rtl"
                        placeholder={isEdu ? "الأستاذ علي..." : "اسم العميل أو الشركة..."}
                        className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        {isEdu 
                          ? (isRTL ? 'اسم المعلم بالإنكليزية' : 'Teacher (English)') 
                          : (isRTL ? 'بواسطة بالإنكليزية (اسم العميل أو الجهة)' : 'By / Client (English)')}
                      </label>
                      <input 
                        {...register('teacher')} 
                        dir="ltr"
                        placeholder={isEdu ? "Prof. Ali..." : "Client or Company Name..."}
                        className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors" 
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Grade & Subject Block (Only for Educational categories) */}
                {isEdu && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-3xl space-y-4">
                    
                    {/* Grade Stage Selection */}
                    <div className="space-y-3 pb-3 border-b border-gray-200/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                          {isRTL ? 'المرحلة الدراسية (من الرابع الابتدائي إلى السادس)' : 'Grade Level / Academic Stage'}
                        </label>
                        <span className="text-[11px] text-amber-600 font-semibold">
                          {isRTL ? 'تختار المرحلة الدراسية بفرعيها العلمي والأدبي' : 'Primary to Scientific & Literary'}
                        </span>
                      </div>

                      <CustomSelect
                        value={selectedGradeKey}
                        onChange={(key) => {
                          setSelectedGradeKey(key);
                          const found = GRADE_PRESETS.find(g => g.value === key);
                          if (found) {
                            setValue('gradeLevel_ar', found.ar, { shouldValidate: true, shouldDirty: true });
                            setValue('gradeLevel', found.en, { shouldValidate: true, shouldDirty: true });

                            // Auto-append grade level to subject if subject exists without a dash
                            const curSubjAr = getValues('subject_ar');
                            const curSubjEn = getValues('subject');
                            if (curSubjAr) {
                              const baseAr = curSubjAr.split('-')[0].trim();
                              setValue('subject_ar', `${baseAr} - ${found.ar}`, { shouldValidate: true, shouldDirty: true });
                            }
                            if (curSubjEn) {
                              const baseEn = curSubjEn.split('-')[0].trim();
                              setValue('subject', `${baseEn} - ${found.en}`, { shouldValidate: true, shouldDirty: true });
                            }
                          }
                        }}
                        placeholder={isRTL ? 'اختر المرحلة الدراسية من القائمة المنسدلة...' : 'Select Grade Level from dropdown...'}
                        options={[
                          { value: '', label: isRTL ? '-- اختر المرحلة الدراسية (رابع ابتدائي إلى سادس علمي/أدبي) --' : '-- Select Grade Level --' },
                          ...GRADE_PRESETS.map(g => ({
                            value: g.value,
                            label: `${g.ar} (${g.en})`
                          }))
                        ]}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isRTL ? 'المرحلة الدراسية بالعربية' : 'Grade Level (Arabic)'}
                          </label>
                          <input 
                            {...register('gradeLevel_ar')} 
                            dir="rtl"
                            placeholder={isRTL ? "مثال: السادس العلمي" : "e.g. 6th Scientific"}
                            className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isRTL ? 'المرحلة الدراسية بالإنجليزي' : 'Grade Level (English)'}
                          </label>
                          <input 
                            {...register('gradeLevel')} 
                            dir="ltr"
                            placeholder="e.g. 6th Scientific Grade"
                            className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subject Selection */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                          {isRTL ? 'اختيار المادة الدراسية من القائمة المنسدلة' : 'Select Subject from Dropdown'}
                        </label>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {isRTL ? 'تحدد اسم المادة تلقائياً' : 'Auto-fills subject inputs'}
                        </span>
                      </div>

                      <CustomSelect
                        value={selectedSubjectKey}
                        onChange={(key) => {
                          setSelectedSubjectKey(key);
                          const found = SUBJECT_PRESETS.find(s => s.value === key);
                          if (found) {
                            const curGradeAr = getValues('gradeLevel_ar');
                            const curGradeEn = getValues('gradeLevel');
                            
                            if (curGradeAr) {
                              setValue('subject_ar', `${found.ar} - ${curGradeAr}`, { shouldValidate: true, shouldDirty: true });
                            } else {
                              setValue('subject_ar', found.ar, { shouldValidate: true, shouldDirty: true });
                            }

                            if (curGradeEn) {
                              setValue('subject', `${found.en} - ${curGradeEn}`, { shouldValidate: true, shouldDirty: true });
                            } else {
                              setValue('subject', found.en, { shouldValidate: true, shouldDirty: true });
                            }
                          }
                        }}
                        placeholder={isRTL ? 'اختر المادة من القائمة المنسدلة...' : 'Select subject from list...'}
                        options={[
                          { value: '', label: isRTL ? '-- اختر المادة من القائمة المسجلة (أو اكتب مخصص) --' : '-- Select subject from list (or write custom) --' },
                          ...SUBJECT_PRESETS.map(s => ({
                            value: s.value,
                            label: `${s.ar} (${s.en})`
                          }))
                        ]}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isRTL ? 'اسم المادة بالعربية' : 'Subject (Arabic)'}
                          </label>
                          <input 
                            {...register('subject_ar')} 
                            dir="rtl"
                            placeholder="الرياضيات - السادس العلمي..."
                            className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isRTL ? 'اسم المادة بالإنكليزية' : 'Subject (English)'}
                          </label>
                          <input 
                            {...register('subject')} 
                            dir="ltr"
                            placeholder="Mathematics - 6th Scientific..."
                            className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Book / Booklet Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200/80">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          {isRTL ? 'اسم الكتاب / الملزمة بالعربية' : 'Book / Booklet Name (Arabic)'}
                        </label>
                        <input 
                          {...register('bookName_ar')} 
                          dir="rtl"
                          placeholder={isRTL ? "مثال: ملزمة الكيمياء الذهبية 2025" : "e.g. Golden Chemistry Booklet"}
                          className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          {isRTL ? 'اسم الكتاب / الملزمة بالإنكليزية' : 'Book / Booklet Name (English)'}
                        </label>
                        <input 
                          {...register('bookName')} 
                          dir="ltr"
                          placeholder={isRTL ? "مثال: Golden Chemistry Booklet 2025" : "e.g. Golden Chemistry Booklet 2025"}
                          className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      {t('cms.tagsLabel')} (مفصولة بفارزة)
                    </label>
                    <input {...register('tags')} placeholder="design, ui, web" className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      {t('cms.softwareLabel')} (مفصولة بفارزة)
                    </label>
                    <input {...register('softwareUsed')} placeholder="Figma, React, GSAP" className="w-full px-5 py-2.5 border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" {...register('featured')} id="featured" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">{t('cms.featureOnHome')}</label>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('cms.mediaAndGallery')}</h3>
                
                {/* Cover Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">{t('cms.coverImage')}</label>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    <input 
                      {...register('coverImage')} 
                      placeholder="https://..." 
                      className="flex-1 min-w-[200px] px-5 py-2.5 border border-gray-200 rounded-full text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                    />
                    
                    <input 
                      type="file" 
                      ref={coverFileInputRef} 
                      accept="image/*" 
                      onChange={handleCoverFileUpload} 
                      className="hidden" 
                    />

                    <button 
                      type="button" 
                      disabled={uploadingCover}
                      onClick={() => coverFileInputRef.current?.click()} 
                      className="px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <UploadCloud size={16} className={uploadingCover ? 'animate-bounce' : ''} />
                      <span>{uploadingCover ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'رفع ملف من الحاسبة' : 'Upload from PC')}</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setShowMediaPicker('cover')} 
                      className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      <ImageIcon size={16} />
                      <span>{isRTL ? 'مكتبة الصور' : 'Media Library'}</span>
                    </button>
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">{t('cms.galleryImages')}</label>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start">
                    <textarea 
                      {...register('images')} 
                      rows={4} 
                      placeholder="https://..." 
                      className="flex-1 min-w-[200px] px-5 py-3 border border-gray-200 rounded-3xl text-black focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm" 
                    />

                    <input 
                      type="file" 
                      ref={galleryFileInputRef} 
                      accept="image/*" 
                      multiple 
                      onChange={handleGalleryFileUpload} 
                      className="hidden" 
                    />

                    <div className="flex flex-col sm:flex-row gap-2 shrink-0 mt-1">
                      <button 
                        type="button" 
                        disabled={uploadingGallery}
                        onClick={() => galleryFileInputRef.current?.click()} 
                        className="px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        <UploadCloud size={16} className={uploadingGallery ? 'animate-bounce' : ''} />
                        <span>{uploadingGallery ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'رفع ملف من الحاسبة' : 'Upload from PC')}</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => setShowMediaPicker('gallery')} 
                        className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 text-xs font-bold shrink-0 cursor-pointer"
                      >
                        <ImageIcon size={16} />
                        <span>{isRTL ? 'مكتبة الصور' : 'Media Library'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors text-sm cursor-pointer">
                  {t('cms.cancel')}
                </button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm shadow-sm cursor-pointer">
                  {isSubmitting ? '...' : (isRTL ? 'حفظ المشروع' : 'Save Project')}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-8">
              {initialData && <ContentAnalytics resourceId={initialData.id} resourceType="project" />}
            </div>
          )}
        </div>
      </div>

      {showMediaPicker && (
        <MediaPicker 
          multiple={showMediaPicker === 'gallery'}
          onClose={() => setShowMediaPicker(null)}
          onSelect={(url) => {
            if (showMediaPicker === 'cover') {
              setValue('coverImage', url);
            } else {
              const currentImages = watch('images');
              setValue('images', currentImages ? `${currentImages}\n${url}` : url);
            }
          }}
        />
      )}
    </div>
  );
}
