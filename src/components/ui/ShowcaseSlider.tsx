import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../../lib/services/projects';
import { Project } from '../../types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { getLocalizedField } from '../../lib/localize';
import { getCategoryLabel } from '../../lib/utils';
import StudioBadgeIcon from './StudioBadgeIcon';

// Fallback data in case Firestore is completely empty
const FALLBACK_PROJECTS: Partial<Project>[] = [];

export default function ShowcaseSlider() {
  const { t, language, isRTL } = useLanguageStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    skipSnaps: false, 
    align: 'center',
    direction: isRTL ? 'rtl' : 'ltr'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const data = await projectService.getFeatured();
        // Fallback to published if no featured found, to ensure slider works
        if (data.length === 0) {
           const published = await projectService.getPublished();
           if (published.length === 0) {
             setProjects([]);
           } else {
             setProjects(published.slice(0, 6));
           }
        } else {
           setProjects(data.slice(0, 8));
         }
      } catch (error) {
        console.error("Error fetching featured projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center bg-[#F6F2EB] transition-colors duration-500">
        <div className="flex flex-col items-center gap-6 opacity-20">
          <StudioBadgeIcon className="w-12 h-12" />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return null; // hide if no projects
  }

  return (
    <div className="relative w-full h-auto min-h-[60vh] bg-[#F6F2EB] text-[#1A1815] transition-colors duration-500 overflow-hidden flex flex-col justify-center py-20 border-t border-[#E0D7C9] group">
      
      {/* Background Accent (subtle number of the current slide) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[32vw] font-serif font-black text-[#E0D7C9]/60 select-none z-0 pointer-events-none transition-all duration-700">
        0{selectedIndex + 1}
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 lg:px-24 flex items-end justify-between mb-12 relative z-20">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-700 block mb-3 font-semibold">
            {t('showcase.label')}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight text-[#1A1815]">
            {t('showcase.title')}
          </h2>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-3 sm:gap-4">
          <button 
            onClick={scrollPrev}
            aria-label="Previous Slide"
            className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-[#C8BFA] bg-[#FCFAF7] rounded-full hover:bg-[#1A1815] hover:text-white hover:border-[#1A1815] transition-all duration-300 active:scale-95 shadow-xs text-[#1A1815]"
          >
            <PrevIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={scrollNext}
            aria-label="Next Slide"
            className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-[#C8BFA] bg-[#FCFAF7] rounded-full hover:bg-[#1A1815] hover:text-white hover:border-[#1A1815] transition-all duration-300 active:scale-95 shadow-xs text-[#1A1815]"
          >
            <NextIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden relative z-10" ref={emblaRef}>
        <div className="flex touch-pan-y items-center">
          {projects.map((project, index) => {
            const isActive = index === selectedIndex;
            const projectTitle = getLocalizedField(project, 'title', language);
            return (
              <div 
                key={project.id} 
                className="flex-[0_0_82%] sm:flex-[0_0_52%] md:flex-[0_0_38%] lg:flex-[0_0_28%] min-w-0 px-3 sm:px-5 md:px-6 transition-all duration-500"
                style={{ opacity: isActive ? 1 : 0.55 }}
              >
                <Link to={`/portfolio/${project.slug}`} className="block group/slide">
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#FCFAF7] border border-[#E0D7C9] rounded-xl shadow-md transition-all duration-700 group-hover/slide:shadow-xl group-hover/slide:border-amber-600/50">
                    <img 
                      src={project.coverImage || project.images?.[0] || undefined} 
                      alt={projectTitle} 
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/slide:scale-105"
                    />
                    {!project.coverImage && !project.images?.[0] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <StudioBadgeIcon className="w-12 h-12 text-black/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover/slide:bg-transparent transition-colors duration-500" />
                  </div>
                  
                  {/* Info Container */}
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-serif mb-1.5 transition-colors duration-300 text-[#1A1815] group-hover/slide:text-amber-700 line-clamp-1">
                        {projectTitle}
                      </h3>
                      <p className="text-xs sm:text-sm font-mono text-gray-600 uppercase tracking-wider flex items-center gap-2.5">
                        <span>{getCategoryLabel(project.category)}</span>
                        {project.year && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-amber-600"></span>
                            <span>{project.year}</span>
                          </>
                        )}
                      </p>
                    </div>
                    
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full border border-[#E0D7C9] bg-[#FCFAF7] group-hover/slide:bg-[#1A1815] group-hover/slide:border-[#1A1815] group-hover/slide:text-white transition-all duration-300 shrink-0 text-[#1A1815] shadow-xs">
                      <ArrowIcon className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${isRTL ? 'rotate-45 group-hover/slide:rotate-0' : '-rotate-45 group-hover/slide:rotate-0'}`} />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 lg:px-24 mt-12 relative z-20">
        <div className="w-full h-[3px] bg-[#E0D7C9] relative overflow-hidden rounded-full">
          <div 
            className="absolute top-0 left-0 h-full bg-amber-600 transition-all duration-500 ease-out"
            style={{ 
              width: `${((selectedIndex + 1) / projects.length) * 100}%`,
              left: isRTL ? 'auto' : 0,
              right: isRTL ? 0 : 'auto'
            }}
          />
        </div>
      </div>
    </div>
  );
}


