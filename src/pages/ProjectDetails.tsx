import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { projectService } from '../lib/services/projects';
import { Project } from '../types';
import { ArrowLeft, ArrowRight, Sparkles, Maximize2, X, BookOpen, UserCheck, Calendar, Layers, ExternalLink, GraduationCap, FileText } from 'lucide-react';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useModalStore } from '../stores/useModalStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';
import { cn, getAuthorLabel, getSubjectLabel, getCategoryLabel } from '../lib/utils';

export default function ProjectDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { t, language, isRTL } = useLanguageStore();
  const { openQuoteModal, openAIModal } = useModalStore();
  useTranslationUpdate();

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      const data = await projectService.getBySlug(slug);
      setProject(data);
      setLoading(false);
    }
    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F2EB] text-[#1A1815] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-4">
          <div className="text-xl font-serif tracking-[0.2em] font-bold text-amber-900/40 uppercase animate-pulse">
            AL<span className="text-amber-600">.</span>YAM
          </div>
        </div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-700">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F6F2EB] text-[#1A1815] flex flex-col items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Navbar />
        <h1 className="text-4xl font-serif mb-4 text-[#1A1815]">{t('common.notFound')}</h1>
        <Link to="/portfolio" className="text-amber-700 hover:underline text-sm uppercase tracking-widest font-semibold">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const title = getLocalizedField(project, 'title', language);
  const description = getLocalizedField(project, 'description', language);
  const isBookType = project.category === 'Book Covers' || project.category === 'Educational Covers';

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1A1815] flex flex-col selection:bg-amber-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={title} description={description} />
      <Navbar />
      
      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-amber-500 hover:text-black rounded-full text-white transition-all cursor-pointer z-50"
            onClick={() => setSelectedImage(null)}
            aria-label="Close Preview"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <main className="flex-1 pt-32 pb-24">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 mb-12">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-[#736B63] hover:text-[#1A1815] transition-colors mb-8 text-xs font-mono uppercase tracking-widest font-medium">
            <BackArrow className="w-4 h-4 text-amber-700" />
            <span>{t('portfolio.backToPortfolio')}</span>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-mono uppercase tracking-widest mb-4 font-semibold">
            <StudioBadgeIcon className="w-3.5 h-3.5" />
            <span>{getCategoryLabel(project.category)}</span>
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif mb-6 leading-tight font-bold text-[#1A1815]">{title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-[#5A534B] pt-4 border-t border-[#E0D7C9]">
            {project.teacher && (
              <div className="flex items-center gap-2 text-amber-800 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <UserCheck size={14} />
                <span>{getAuthorLabel(project.category)}: <strong className="text-[#1A1815]">{getLocalizedField(project, 'teacher', language)}</strong></span>
              </div>
            )}
            {project.subject && (
              <div className="flex items-center gap-2 text-[#5A534B]">
                <BookOpen size={14} className="text-amber-700" />
                <span>{getSubjectLabel(project.category)}: <strong className="text-[#1A1815]">{getLocalizedField(project, 'subject', language)}</strong></span>
              </div>
            )}
            {(project.gradeLevel_ar || project.gradeLevel) && (
              <div className="flex items-center gap-2 text-amber-800 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <GraduationCap size={14} />
                <span>{t('project.gradeLevel')}: <strong className="text-[#1A1815]">{getLocalizedField(project, 'gradeLevel', language)}</strong></span>
              </div>
            )}
            {(project.bookName_ar || project.bookName) && (
              <div className="flex items-center gap-2 text-amber-800 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <BookOpen size={14} />
                <span>{t('project.bookName')}: <strong className="text-[#1A1815]">{getLocalizedField(project, 'bookName', language)}</strong></span>
              </div>
            )}
            {project.year && (
              <div className="flex items-center gap-2 text-[#5A534B]">
                <Calendar size={14} className="text-amber-700" />
                <span>{t('portfolio.yearLabel')}: <strong className="text-[#1A1815]">{project.year}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Main Presentation Section */}
        {project.coverImage && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 mb-16">
            {isBookType ? (
              /* Vertical 3D Book Cover Presentation */
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 bg-[#FCFAF7] p-8 md:p-14 rounded-3xl border border-[#E0D7C9] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* 3D Book Spine Effect Container */}
                <div 
                  onClick={() => setSelectedImage(project.coverImage!)}
                  className="relative group cursor-pointer shrink-0 max-w-sm w-full perspective-1000"
                >
                  <div className="relative aspect-[22.5/31] w-full rounded-r-xl rounded-l-sm overflow-hidden bg-[#EAE2D5] shadow-[15px_15px_35px_rgba(0,0,0,0.15),-2px_0_8px_rgba(255,255,255,0.8)] border border-[#E0D7C9] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1">
                    <img 
                      src={project.coverImage} 
                      alt={title} 
                      className="w-full h-full object-cover"
                    />
                    {/* Realistic Book Spine Shadow Effect */}
                    <div className="absolute inset-0 shadow-[inset_12px_0_15px_rgba(0,0,0,0.2),inset_-2px_0_4px_rgba(255,255,255,0.4)] pointer-events-none"></div>
                    
                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-mono text-xs uppercase tracking-widest backdrop-blur-[2px]">
                      <Maximize2 size={18} className="text-amber-300" />
                      <span>{t('project.enlargeCover')}</span>
                    </div>
                  </div>
                </div>

                {/* Cover Details Showcase */}
                <div className="flex-1 space-y-6 text-start">
                  <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-800 font-mono text-xs font-semibold">
                    {t('project.officialDesign')}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif text-[#1A1815] font-bold leading-snug">
                    {title}
                  </h3>
                  <p className="text-[#5A534B] text-sm font-light leading-relaxed">
                    {description || t('project.exclusiveDesign')}
                  </p>

                  <div className="pt-4 flex flex-wrap gap-4">
                    <button
                      onClick={() => setSelectedImage(project.coverImage!)}
                      className="px-6 py-3 bg-amber-600 text-white rounded font-medium text-xs uppercase tracking-widest hover:bg-amber-700 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Maximize2 size={16} />
                      <span>{t('project.viewHighRes')}</span>
                    </button>
                    <Link
                      to="/contact"
                      className="px-6 py-3 bg-[#FCFAF7] hover:bg-[#EAE2D5] border border-[#E0D7C9] text-[#1A1815] rounded font-medium text-xs uppercase tracking-widest transition-all"
                    >
                      {t('project.inquireProject')}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Wide Software / Website Showcase Frame */
              <div 
                onClick={() => setSelectedImage(project.coverImage!)}
                className="w-full aspect-[16/9] md:aspect-[2.35/1] rounded-2xl overflow-hidden bg-[#EAE2D5] border border-[#E0D7C9] shadow-md relative group cursor-pointer"
              >
                <img 
                  src={project.coverImage} 
                  alt={title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-mono text-xs uppercase tracking-widest backdrop-blur-[2px]">
                  <Maximize2 size={18} className="text-amber-300" />
                  <span>{t('project.enlargeImage')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Details Overview Content */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif mb-6 text-amber-800 font-bold">{t('project.overview')}</h2>
            <div className="text-base text-[#5A534B] font-light leading-relaxed whitespace-pre-wrap bg-[#FCFAF7] border border-[#E0D7C9] p-6 md:p-8 rounded-2xl shadow-xs">
              {description}
            </div>
          </div>
          
          <div className="space-y-8 bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl p-6 shadow-xs">
             {project.softwareUsed && project.softwareUsed.length > 0 && (
               <div>
                 <h3 className="text-xs uppercase font-mono tracking-widest text-amber-800 mb-3 font-semibold">{t('project.tools')}</h3>
                 <div className="flex flex-wrap gap-2">
                   {project.softwareUsed.map(sw => (
                     <span key={sw} className="px-3 py-1 bg-[#F6F2EB] border border-[#E0D7C9] rounded-full text-xs font-mono text-[#1A1815]">
                       {sw}
                     </span>
                   ))}
                 </div>
               </div>
             )}
             
             {project.tags && project.tags.length > 0 && (
               <div>
                 <h3 className="text-xs uppercase font-mono tracking-widest text-amber-800 mb-3 font-semibold">{t('project.tags')}</h3>
                 <div className="flex flex-wrap gap-2">
                   {project.tags.map(tag => (
                     <span key={tag} className="text-xs font-mono text-[#736B63]">
                       #{tag}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             <div className="pt-4 border-t border-[#E0D7C9] space-y-2.5">
               <button 
                 onClick={() => openQuoteModal({ 
                   serviceTitle: title, 
                   subjectClass: project.subject ? `${project.subject} ${project.grade || ''}` : '',
                   defaultCategory: project.category === 'Educational Covers' || project.category === 'Book Covers' ? 'cover' : 'other',
                   details: `طلب تصميم / مشروع مماثل لـ: "${title}" (${project.subject || ''})`
                 })}
                 className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer"
               >
                 <FileText className="w-4 h-4" />
                 <span>{t('common.requestQuote')}</span>
               </button>

               <button 
                 onClick={() => openAIModal({
                   defaultTab: isBookType ? 'cover_ideas' : 'general',
                   subject: project.subject,
                   teacher: project.teacher,
                   prompt: `أفكار واقتراحات تصميمية مشابهة لمشروع ${title}`
                 })}
                 className="w-full py-2.5 bg-white border border-[#E0D7C9] hover:border-amber-500 text-amber-800 text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded-xl cursor-pointer"
               >
                 <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                 <span>{t('common.aiAssistant')}</span>
               </button>
             </div>
          </div>
        </div>

        {/* Gallery */}
        {project.images && project.images.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 space-y-8">
             <h2 className="text-2xl font-serif text-[#1A1815] mb-6 font-bold">{t('project.gallery')}</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {project.images.map((img, i) => (
                 <div 
                   key={i} 
                   onClick={() => setSelectedImage(img)}
                   className="rounded-2xl overflow-hidden border border-[#E0D7C9] bg-[#EAE2D5] aspect-[4/3] cursor-pointer group relative shadow-md"
                 >
                   <img src={img} alt={`${title} gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-amber-300">
                     <Maximize2 size={22} />
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}


