import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { getLocalizedField } from '../../lib/localize';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Project } from '../../types';

export default function EducationalAccordion() {
  const { projects, loading, fetchPublishedProjects, error } = useProjectStore();
  const { t, language, isRTL } = useLanguageStore();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [eduProjects, setEduProjects] = useState<Project[]>([]);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    fetchPublishedProjects();
  }, [fetchPublishedProjects]);

  useEffect(() => {
    const filtered = projects.filter(p => 
      p.category === 'Booklets' || 
      p.category === 'Educational' || 
      p.category === 'Print & Book Covers' ||
      p.tags?.some(t => t.toLowerCase() === 'educational' || t.toLowerCase() === 'booklet')
    );
    
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    setEduProjects(filtered.slice(0, 7));
  }, [projects]);

  if (loading && eduProjects.length === 0) {
    return (
      <section className="py-24 md:py-32 px-4 md:px-12 lg:px-24 bg-[#F6F2EB] text-[#1A1815] transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto animate-pulse flex flex-col gap-8">
          <div className="h-6 w-32 bg-[#E0D7C9] rounded"></div>
          <div className="h-16 w-3/4 max-w-xl bg-[#E0D7C9] rounded"></div>
          <div className="h-[600px] w-full bg-[#E0D7C9] rounded-2xl"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 md:py-32 px-4 md:px-12 lg:px-24 bg-[#F6F2EB] text-[#1A1815] transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-serif mb-2 text-[#1A1815]">Could not load gallery</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </section>
    );
  }

  const displayProjects = eduProjects.length > 0 ? eduProjects : FALLBACK_PROJECTS;

  if (displayProjects.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 px-4 md:px-12 lg:px-24 bg-[#F6F2EB] text-[#1A1815] transition-colors duration-500 border-t border-[#E0D7C9]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-amber-700 font-semibold mb-6">
              {t('edu.label')}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif leading-[1.1] mb-6 text-[#1A1815]">
              {t('edu.headline.line1')}<br/>
              <span className="text-gray-500">{t('edu.headline.line2')}</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 font-light leading-relaxed max-w-2xl">
              {t('edu.description')}
            </p>
          </div>
          <Link to="/booklets" className="hidden md:inline-flex items-center gap-2 text-sm uppercase tracking-widest border-b-2 border-[#1A1815] pb-1 text-[#1A1815] hover:text-amber-700 hover:border-amber-700 transition-colors shrink-0">
            {t('edu.viewAll')} <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* ACCORDION GALLERY - 7 COVERS WITHOUT GAPS */}
        <div className="flex flex-col md:flex-row h-[700px] md:h-[750px] gap-2 md:gap-3 w-full">
          {displayProjects.map((project, index) => {
            const isActive = activeIndex === index;
            const projectTitle = getLocalizedField(project, 'title', language);
            const teacherName = getLocalizedField(project, 'teacher', language) || project.teacher;
            const subjectName = getLocalizedField(project, 'subject', language) || project.subject;
            
            return (
              <div 
                key={project.id || index}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => {
                  if (window.innerWidth >= 768) {
                    setActiveIndex(index);
                  }
                }}
                className={cn(
                  "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group border-0 select-none",
                  "w-full",
                  isActive ? "h-[540px] md:h-full md:flex-[5]" : "h-[64px] md:h-full md:flex-1"
                )}
              >
                {/* FULL BLEED COVER IMAGE - FILLS 100% OF SLOT WITH ZERO GAPS */}
                <div className="absolute inset-0 bg-gray-950 overflow-hidden border-0">
                  <img 
                    src={project.coverImage} 
                    alt={projectTitle}
                    loading={isActive || Math.abs(activeIndex - index) <= 1 ? "eager" : "lazy"}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700 border-0",
                      isActive ? "scale-105 opacity-100" : "scale-100 opacity-60 grayscale-[30%] group-hover:grayscale-0 group-hover:opacity-90"
                    )}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  
                  {/* GRADIENT OVERLAY FOR TEXT READABILITY */}
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-700 pointer-events-none border-0",
                    isActive ? "bg-gradient-to-t from-black/95 via-black/40 to-transparent" : "bg-black/50 group-hover:bg-black/30"
                  )} />
                </div>

                {/* INACTIVE DESKTOP VERTICAL TITLE */}
                <div className={cn(
                  "absolute inset-0 p-3 flex items-center justify-center transition-opacity duration-300 md:opacity-100 opacity-0 z-10 border-0",
                  isActive ? "md:opacity-0 pointer-events-none" : "md:opacity-100"
                )}>
                  <h3 
                    className="text-white/90 font-serif text-sm lg:text-base font-bold tracking-wider group-hover:text-gold-400 transition-colors select-none py-2"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)'
                    }}
                  >
                    {projectTitle}
                  </h3>
                </div>

                {/* INACTIVE MOBILE BAR TITLE */}
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-between px-5 md:hidden z-10 border-0">
                    <h3 className="text-white/90 font-serif text-base truncate pr-3">{projectTitle}</h3>
                    <span className="text-gold-400 text-xs font-mono tracking-widest shrink-0">+</span>
                  </div>
                )}

                {/* ACTIVE CONTENT: FULL BLEED WITH TEXT OVERLAY AT BOTTOM (NO GAPS, NO PADDING BORDERS) */}
                <div className={cn(
                  "absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8 flex flex-col gap-2.5 sm:gap-3 justify-end transition-all duration-700 transform z-20 text-start border-0",
                  isActive ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-8 opacity-0 pointer-events-none"
                )}>
                  <div className="flex items-center justify-between gap-2">
                    {subjectName && (
                      <span className="bg-gold-500/20 text-gold-300 text-xs font-mono uppercase tracking-wider px-3.5 py-1 rounded-full font-semibold backdrop-blur-md border border-gold-500/30">
                        {subjectName}
                      </span>
                    )}
                    <span className="text-white/90 text-xs font-mono tracking-widest bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 dir-ltr" dir="ltr">
                      22.5 × 31 cm
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-3xl md:text-4xl text-white font-serif font-bold leading-tight drop-shadow-md">
                    {projectTitle}
                  </h3>

                  {teacherName && (
                    <p className="text-gray-200 text-xs sm:text-sm md:text-base font-medium">
                      {t('edu.forTeacher')}: <span className="text-gold-400 font-semibold">{teacherName}</span>
                    </p>
                  )}

                  <Link 
                    to={`/portfolio/${project.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-black text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full transition-all w-fit mt-1.5 shadow-xl hover:shadow-gold-500/20 group/btn"
                  >
                    <span>{t('edu.viewProject')}</span>
                    <ArrowIcon className={cn(
                      "w-4 h-4 transform transition-transform",
                      isRTL ? "group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1"
                    )} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 md:hidden text-center">
          <Link to="/booklets" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest border-b border-black pb-1 hover:text-amber-700 transition-colors">
            {t('edu.viewAll')} <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const FALLBACK_PROJECTS: Project[] = [];
