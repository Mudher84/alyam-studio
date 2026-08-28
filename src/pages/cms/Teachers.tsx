import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Search, Edit2, Trash2, GraduationCap, CheckCircle2, 
  XCircle, Phone, BookOpen, Sparkles, X, Image as ImageIcon, User, UploadCloud 
} from 'lucide-react';
import { 
  useTeacherStore, 
  formatArabicTeacherName, 
  formatEnglishTeacherName 
} from '../../stores/useTeacherStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useMediaStore } from '../../stores/useMediaStore';
import { mediaService } from '../../lib/services/media';
import { Teacher } from '../../types';
import MediaPicker from '../../components/cms/MediaPicker';
import { CustomSelect } from '../../components/ui/CustomSelect';
import StudioBadgeIcon from '../../components/ui/StudioBadgeIcon';
import { translateText } from '../../utils/translate';

export default function TeachersCMS() {
  const { t, language, isRTL } = useLanguageStore();
  const { teachers, loading, fetchTeachers, addTeacher, updateTeacher, deleteTeacher } = useTeacherStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Translation states
  const [translatingFields, setTranslatingFields] = useState<Record<string, boolean>>({});

  const translateField = async (
    sourceKey: 'name_ar' | 'subject_ar' | 'bio_ar' | 'name_en' | 'subject_en' | 'bio_en', 
    targetKey: 'name_en' | 'subject_en' | 'bio_en' | 'name_ar' | 'subject_ar' | 'bio_ar', 
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
        const namePromise = formData.name_ar ? translateText(formData.name_ar, { from: 'ar', to: 'en' }) : Promise.resolve('');
        const subjectPromise = formData.subject_ar ? translateText(formData.subject_ar, { from: 'ar', to: 'en' }) : Promise.resolve('');
        const bioPromise = formData.bio_ar ? translateText(formData.bio_ar, { from: 'ar', to: 'en' }) : Promise.resolve('');

        const [translatedName, translatedSubject, translatedBio] = await Promise.all([namePromise, subjectPromise, bioPromise]);

        setFormData(prev => ({
          ...prev,
          name_en: translatedName || prev.name_en,
          subject_en: translatedSubject || prev.subject_en,
          bio_en: translatedBio || prev.bio_en
        }));
      } else {
        const namePromise = formData.name_en ? translateText(formData.name_en, { from: 'en', to: 'ar' }) : Promise.resolve('');
        const subjectPromise = formData.subject_en ? translateText(formData.subject_en, { from: 'en', to: 'ar' }) : Promise.resolve('');
        const bioPromise = formData.bio_en ? translateText(formData.bio_en, { from: 'en', to: 'ar' }) : Promise.resolve('');

        const [translatedName, translatedSubject, translatedBio] = await Promise.all([namePromise, subjectPromise, bioPromise]);

        setFormData(prev => ({
          ...prev,
          name_ar: translatedName || prev.name_ar,
          subject_ar: translatedSubject || prev.subject_ar,
          bio_ar: translatedBio || prev.bio_ar
        }));
      }
    } catch (err) {
      console.error('Translation all error:', err);
    } finally {
      setTranslatingFields(prev => ({ ...prev, all: false }));
    }
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingAvatar(true);
    try {
      const url = await mediaService.uploadFile(file, 'teachers');
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      useMediaStore.getState().uploadFiles([file]);
    } catch (err) {
      console.error('Error uploading avatar:', err);
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    subject_ar: '',
    subject_en: '',
    bio_ar: '',
    bio_en: '',
    phone: '',
    avatarUrl: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleOpenCreateModal = () => {
    setEditingTeacher(null);
    setFormData({
      name_ar: '',
      name_en: '',
      subject_ar: '',
      subject_en: '',
      bio_ar: '',
      bio_en: '',
      phone: '',
      avatarUrl: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name_ar: teacher.name_ar || '',
      name_en: teacher.name_en || '',
      subject_ar: teacher.subject_ar || '',
      subject_en: teacher.subject_en || '',
      bio_ar: teacher.bio_ar || '',
      bio_en: teacher.bio_en || '',
      phone: teacher.phone || '',
      avatarUrl: teacher.avatarUrl || '',
      status: teacher.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmMsg = isRTL 
      ? `هل أنت أأكد من رغبتك في حذف الأستاذ (${name})؟` 
      : `Are you sure you want to delete ${name}?`;
    if (confirm(confirmMsg)) {
      await deleteTeacher(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ar.trim() && !formData.name_en.trim()) {
      alert(isRTL ? 'يرجى إدخال اسم الأستاذ بالعربية أو بالإنجليزي.' : 'Please enter teacher name.');
      return;
    }

    // Auto-apply prefix formatting
    const formattedAr = formatArabicTeacherName(formData.name_ar);
    const formattedEn = formatEnglishTeacherName(formData.name_en);

    const payload = {
      name_ar: formattedAr || formData.name_ar,
      name_en: formattedEn || formData.name_en,
      subject_ar: formData.subject_ar,
      subject_en: formData.subject_en,
      bio_ar: formData.bio_ar,
      bio_en: formData.bio_en,
      phone: formData.phone,
      avatarUrl: formData.avatarUrl,
      status: formData.status,
    };

    if (editingTeacher) {
      await updateTeacher(editingTeacher.id, payload);
    } else {
      await addTeacher(payload);
    }

    setIsModalOpen(false);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const query = searchQuery.toLowerCase();
    const nameAr = (teacher.name_ar || '').toLowerCase();
    const nameEn = (teacher.name_en || '').toLowerCase();
    const subjAr = (teacher.subject_ar || '').toLowerCase();
    const subjEn = (teacher.subject_en || '').toLowerCase();
    return nameAr.includes(query) || nameEn.includes(query) || subjAr.includes(query) || subjEn.includes(query);
  });

  const activeCount = teachers.filter(t => t.status === 'active').length;

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif text-black font-bold">
                {isRTL ? 'إدارة الأساتذة والمدرسين' : 'Teachers Management'}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {isRTL 
                  ? 'إضافة وتعديل بيانات كادر الأساتذة، مع التنسيق التلقائي للبادئة (أ.) بالعربية و (T.) بالإنجليزي.' 
                  : 'Manage teachers with automatic prefixing ("أ." in Arabic & "T." in English).'}
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-all text-sm font-medium shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus size={18} />
          <span>{isRTL ? 'إضافة أستاذ جديد' : 'Add New Teacher'}</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-black">{teachers.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">{isRTL ? 'إجمالي الكادر والأساتذة' : 'Total Instructors'}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-black">{activeCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">{isRTL ? 'أساتذة نشطون' : 'Active Profiles'}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-black">
              {new Set(teachers.map(t => t.subject_ar || t.subject_en).filter(Boolean)).size}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{isRTL ? 'التخصصات والمواد' : 'Unique Subjects'}</div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Search Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input 
              type="text"
              placeholder={isRTL ? 'ابحث باسم الأستاذ، المادة، أو اللقب...' : 'Search teachers, subjects...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-black focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all`}
            />
          </div>

          <div className="text-xs text-gray-500 font-medium">
            {isRTL ? `تم العثور على (${filteredTeachers.length}) أستاذ` : `Showing ${filteredTeachers.length} teachers`}
          </div>
        </div>

        {/* Teachers Cards Grid */}
        <div className="p-6">
          {loading && teachers.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="flex flex-col items-center gap-6"
              >
                <StudioBadgeIcon className="w-10 h-10 opacity-20" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-300">
                  {isRTL ? 'جاري التحميل والمزامنة...' : 'Syncing Data...'}
                </span>
              </motion.div>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-300 stroke-1" />
              <p className="text-base font-medium text-gray-600">{isRTL ? 'لم يتم العثور على أساتذة' : 'No teachers found'}</p>
              <p className="text-xs text-gray-400 mt-1">{isRTL ? 'يمكنك إضافة أستاذ جديد بالضغط على الزر أعلاه.' : 'Try adding a new teacher profile.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <div 
                  key={teacher.id} 
                  className="bg-gray-50/70 border border-gray-200/80 hover:border-amber-500/40 rounded-2xl p-5 transition-all hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Avatar + Status */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="relative">
                        {teacher.avatarUrl ? (
                          <img 
                            src={teacher.avatarUrl} 
                            alt={teacher.name_ar} 
                            className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-sm" 
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xl">
                            <GraduationCap className="w-7 h-7" />
                          </div>
                        )}
                      </div>

                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                        teacher.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {teacher.status === 'active' 
                          ? (isRTL ? 'نشط' : 'Active') 
                          : (isRTL ? 'غير نشط' : 'Inactive')}
                      </span>
                    </div>

                    {/* Teacher Names */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[11px] font-bold rounded">
                          أ.
                        </span>
                        <h3 className="text-lg font-serif font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                          {teacher.name_ar || 'بدون اسم عربي'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 font-sans dir-ltr" style={{ unicodeBidi: 'isolate' }}>
                        <span className="px-1.5 py-0.5 bg-gray-200/80 text-gray-700 text-[10px] font-bold rounded font-mono">
                          T.
                        </span>
                        <span>{teacher.name_en || 'No English Name'}</span>
                      </div>
                    </div>

                    {/* Subject */}
                    {(teacher.subject_ar || teacher.subject_en) && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 mb-3">
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isRTL ? (teacher.subject_ar || teacher.subject_en) : (teacher.subject_en || teacher.subject_ar)}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {(teacher.bio_ar || teacher.bio_en) && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {isRTL ? (teacher.bio_ar || teacher.bio_en) : (teacher.bio_en || teacher.bio_ar)}
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between gap-2 mt-2">
                    {teacher.phone ? (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone size={12} />
                        <span dir="ltr">{teacher.phone}</span>
                      </span>
                    ) : <span />}

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenEditModal(teacher)}
                        className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                        title={isRTL ? 'تعديل' : 'Edit'}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher.id, teacher.name_ar || teacher.name_en)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                        title={isRTL ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating / Editing Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-200">
          {/* Header Bar */}
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

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-black">
                    {editingTeacher 
                      ? (isRTL ? 'تعديل بيانات أستاذ' : 'Edit Teacher Profile') 
                      : (isRTL ? 'إضافة أستاذ جديد' : 'Add New Teacher')}
                  </h2>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {isRTL ? 'سيتم إضافة البادئات الرسمية تلقائياً للأثر الاحترافي.' : 'Auto-prefixes applied automatically.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap size={16} />
                <span>
                  {editingTeacher 
                    ? (isRTL ? 'حفظ التغييرات' : 'Save Changes') 
                    : (isRTL ? 'إضافة الأستاذ الآن' : 'Create Teacher')}
                </span>
              </button>
            </div>
          </header>

          {/* Full Page Content Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
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
                      disabled={translatingFields.all || (!formData.name_ar && !formData.subject_ar && !formData.bio_ar)}
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
                      disabled={translatingFields.all || (!formData.name_en && !formData.subject_en && !formData.bio_en)}
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
              
              {/* Arabic Name Input */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-900">
                    {isRTL ? 'اسم الأستاذ باللغة العربية' : 'Arabic Teacher Name'} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {formData.name_ar && (
                      <button
                        type="button"
                        onClick={() => translateField('name_ar', 'name_en', 'ar', 'en')}
                        disabled={translatingFields.name_en}
                        className="text-[10px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        {translatingFields.name_en ? '...' : (isRTL ? 'ترجم للإنجليزي ➔' : 'Translate to En ➔')}
                      </button>
                    )}
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-800 rounded-full">
                      بادئة تلقائية: أ.
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="مثال: علي الحسين (اكتب الاسم مباشرة وسيُضاف أ. تلقائياً)"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* Live Preview Badge */}
                {formData.name_ar.trim() && (
                  <div className="flex items-center gap-2 text-xs text-amber-900 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{isRTL ? 'المعاينة النهائية بالعربية:' : 'Arabic Preview:'}</span>
                    <span className="font-bold bg-white px-2.5 py-0.5 rounded-full border border-amber-200 shadow-sm">
                      {formatArabicTeacherName(formData.name_ar)}
                    </span>
                  </div>
                )}
              </div>

              {/* English Name Input */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-900">
                    {isRTL ? 'اسم الأستاذ باللغة الإنجليزية' : 'English Teacher Name'}
                  </label>
                  <div className="flex items-center gap-2">
                    {formData.name_en && (
                      <button
                        type="button"
                        onClick={() => translateField('name_en', 'name_ar', 'en', 'ar')}
                        disabled={translatingFields.name_ar}
                        className="text-[10px] font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        {translatingFields.name_ar ? '...' : (isRTL ? 'ترجم للعربي ➔' : 'Translate to Ar ➔')}
                      </button>
                    )}
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full">
                      Auto Prefix: T.
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <input 
                    type="text"
                    placeholder="e.g. Ali Al-Hussain (Auto-prefixed with T.)"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all dir-ltr"
                  />
                </div>

                {/* Live Preview Badge */}
                {formData.name_en.trim() && (
                  <div className="flex items-center gap-2 text-xs text-gray-700 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>English Preview:</span>
                    <span className="font-bold bg-white px-2.5 py-0.5 rounded-full border border-gray-300 shadow-sm dir-ltr">
                      {formatEnglishTeacherName(formData.name_en)}
                    </span>
                  </div>
                )}
              </div>

              {/* Subjects Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      {isRTL ? 'المادة الدراسية (بالعربية)' : 'Subject (Arabic)'}
                    </label>
                    {formData.subject_ar && (
                      <button
                        type="button"
                        onClick={() => translateField('subject_ar', 'subject_en', 'ar', 'en')}
                        disabled={translatingFields.subject_en}
                        className="text-[10px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        {translatingFields.subject_en ? '...' : (isRTL ? 'ترجم ➔' : 'Translate ➔')}
                      </button>
                    )}
                  </div>
                  <input 
                    type="text"
                    placeholder="مثال: الكيمياء - السادس العلمي"
                    value={formData.subject_ar}
                    onChange={(e) => setFormData({ ...formData, subject_ar: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-black focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      {isRTL ? 'المادة الدراسية ( بالإنجليزي)' : 'Subject (English)'}
                    </label>
                    {formData.subject_en && (
                      <button
                        type="button"
                        onClick={() => translateField('subject_en', 'subject_ar', 'en', 'ar')}
                        disabled={translatingFields.subject_ar}
                        className="text-[10px] font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        {translatingFields.subject_ar ? '...' : (isRTL ? 'ترجم ➔' : 'Translate ➔')}
                      </button>
                    )}
                  </div>
                  <input 
                    type="text"
                    placeholder="e.g. Chemistry - 6th Grade"
                    value={formData.subject_en}
                    onChange={(e) => setFormData({ ...formData, subject_en: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-black focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dir-ltr"
                  />
                </div>
              </div>

              {/* Avatar Image Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isRTL ? 'رابط الصورة الشخصية' : 'Profile Picture / Avatar URL'}
                </label>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <input 
                    type="text"
                    placeholder="https://..."
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="flex-1 min-w-[200px] px-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-black focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dir-ltr"
                  />
                  
                  <input 
                    type="file" 
                    ref={avatarFileInputRef} 
                    accept="image/*" 
                    onChange={handleAvatarFileUpload} 
                    className="hidden" 
                  />

                  <button 
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                  >
                    <UploadCloud size={14} className={uploadingAvatar ? 'animate-bounce' : ''} />
                    <span>{uploadingAvatar ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'Upload from PC' : 'Upload from PC')}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0"
                  >
                    <ImageIcon size={14} />
                    <span>{isRTL ? 'المكتبة' : 'Media'}</span>
                  </button>
                </div>
              </div>

              {/* Bio / Description Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      {isRTL ? 'ملاحظات وسيرة مختصرة (بالعربية)' : 'Bio / Notes (Arabic)'}
                    </label>
                    {formData.bio_ar && (
                      <button
                        type="button"
                        onClick={() => translateField('bio_ar', 'bio_en', 'ar', 'en')}
                        disabled={translatingFields.bio_en}
                        className="text-[10px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        {translatingFields.bio_en ? '...' : (isRTL ? 'ترجم ➔' : 'Translate ➔')}
                      </button>
                    )}
                  </div>
                  <textarea 
                    rows={2}
                    placeholder="استاذ مادة ومؤلف ملازم..."
                    value={formData.bio_ar}
                    onChange={(e) => setFormData({ ...formData, bio_ar: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-2xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      {isRTL ? 'ملاحظات وسيرة مختصرة (بالإنجليزي)' : 'Bio / Notes (English)'}
                    </label>
                    {formData.bio_en && (
                      <button
                        type="button"
                        onClick={() => translateField('bio_en', 'bio_ar', 'en', 'ar')}
                        disabled={translatingFields.bio_ar}
                        className="text-[10px] font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        {translatingFields.bio_ar ? '...' : (isRTL ? 'ترجم ➔' : 'Translate ➔')}
                      </button>
                    )}
                  </div>
                  <textarea 
                    rows={2}
                    placeholder="Author & instructor notes..."
                    value={formData.bio_en}
                    onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-2xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dir-ltr"
                  />
                </div>
              </div>

              {/* Phone & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isRTL ? 'رقم الهاتف / الواتساب' : 'Phone / Contact'}
                  </label>
                  <input 
                    type="text"
                    placeholder="+964 770 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-black focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isRTL ? 'حالة الملف' : 'Profile Status'}
                  </label>
                  <CustomSelect
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val as 'active' | 'inactive' })}
                    options={[
                      { value: 'active', label: isRTL ? 'نشط (مفعل)' : 'Active' },
                      { value: 'inactive', label: isRTL ? 'غير نشط' : 'Inactive' },
                    ]}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <GraduationCap size={16} />
                  <span>
                    {editingTeacher 
                      ? (isRTL ? 'حفظ التغييرات' : 'Save Changes') 
                      : (isRTL ? 'إضافة الأستاذ الآن' : 'Create Teacher')}
                  </span>
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
            setFormData({ ...formData, avatarUrl: url });
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
