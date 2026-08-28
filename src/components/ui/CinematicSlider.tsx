import React, { useEffect, useState, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowUpLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../../lib/services/projects';
import { Project } from '../../types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { getLocalizedField } from '../../lib/localize';
import { getCategoryLabel } from '../../lib/utils';
import StudioBadgeIcon from './StudioBadgeIcon';

// Fallback data in case Firestore is completely empty
const FALLBACK_PROJECTS: Partial<Project>[] = [];

export default function CinematicSlider() {
  const { t, language, isRTL } = useLanguageStore();
  const [projects, setProjects] = useState<Partial<Project>[]>([]);
  const [loading, setLoading] = useState(true);

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  const ArrowIcon = isRTL ? ArrowUpLeft : ArrowUpRight;
  
  // Initialize Embla with Autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start', 
      skipSnaps: false,
      direction: isRTL ? 'rtl' : 'ltr',
    }, 
    [Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isAnimating = useRef(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const allPublished = await projectService.getForSlider(15);
        const hasValidImage = (p: Project) => p.coverImage || (p.images && p.images.length > 0);

        let filtered = allPublished.filter(p => 
          p.featured && hasValidImage(p) && (p.category?.toLowerCase().includes('cover') || p.category?.toLowerCase().includes('print'))
        );
        
        if (filtered.length < 3) {
          filtered = allPublished.filter(p => p.featured && hasValidImage(p));
        }
        
        if (filtered.length < 3) {
           filtered = allPublished.filter(p => hasValidImage(p));
        }

        if (filtered.length > 0) {
          const normalized = filtered.map(p => ({
            ...p,
            coverImage: p.coverImage || (p.images && p.images[0]) || ''
          }));
          setProjects(normalized.slice(0, 8));
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching for slider:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      isAnimating.current = true;
    };

    const onSettle = () => {
      isAnimating.current = false;
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('settle', onSettle);
    emblaApi.on('reInit', onSelect);

    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('settle', onSettle);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi || isAnimating.current) return;
    const autoplay = emblaApi.plugins().autoplay;
    if (autoplay) autoplay.reset();
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi || isAnimating.current) return;
    const autoplay = emblaApi.plugins().autoplay;
    if (autoplay) autoplay.reset();
    emblaApi.scrollNext();
  }, [emblaApi]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (!target.dataset.fallbackApplied) {
      target.dataset.fallbackApplied = "true";
      target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg width='800' height='1200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23111' /%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='32' font-weight='200' letter-spacing='0.5em' fill='%23555' dominant-baseline='middle' text-anchor='middle'%3EALYAM%3C/text%3E%3C/svg%3E";
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen min-h-[500px] flex items-center justify-center bg-[#F6F2EB] transition-colors duration-500">
        <div className="flex flex-col items-center gap-6 opacity-20">
          <StudioBadgeIcon className="w-12 h-12" />
        </div>
      </div>
    );
  }

  if (projects.length === 0) return null;

  const formattedIndex = String(selectedIndex + 1).padStart(2, '0');
  const formattedTotal = String(projects.length).padStart(2, '0');
  const currentProject = projects[selectedIndex] || projects[0];

  const currentTitle = getLocalizedField(currentProject, 'title', language);
  const currentTeacher = getLocalizedField(currentProject, 'teacher', language) || currentProject.teacher;
  const currentSubject = getLocalizedField(currentProject, 'subject', language) || currentProject.subject;

  return (
    <section className="py-24 bg-[#F6F2EB] text-[#1A1815] transition-colors duration-500 overflow-hidden relative selection:bg-amber-200 border-t border-[#E0D7C9]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12">
         <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold block mb-3">
           {t('covers.label')}
         </span>
         <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1A1815]">{t('covers.headline')}</h2>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* CAROUSEL VIEWPORT */}
          <div className="lg:col-span-6 embla overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y -ml-4">
              {projects.map((project, index) => {
                const projectTitle = getLocalizedField(project, 'title', language);
                return (
                  <div key={project.id || index} className="flex-[0_0_100%] sm:flex-[0_0_50%] pl-4 min-w-0">
                    <Link to={`/portfolio/${project.slug}`} className="block group">
                      <div className="relative aspect-[3/4] bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl overflow-hidden p-5 flex items-center justify-center shadow-lg transition-transform duration-700 group-hover:scale-[1.02] group-hover:shadow-2xl">
                        <img 
                          src={project.coverImage || undefined} 
                          alt={projectTitle} 
                          onError={handleImageError}
                          className="w-full h-full object-cover rounded-xl shadow-md"
                        />
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROJECT INFO & CONTROLS */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono tracking-widest text-gray-500 mb-6">
                {formattedIndex} / {formattedTotal}
              </div>

              <p className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold mb-3">
                {getCategoryLabel(currentProject.category) || (isRTL ? 'غلاف كتاب' : 'Book Cover')}
              </p>
              
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-8 leading-tight text-[#1A1815]">
                {currentTitle}
              </h3>

              <div className="space-y-3 mb-10 text-xs font-mono uppercase tracking-widest text-gray-600">
                {currentTeacher && (
                  <div className="flex gap-4">
                    <span className="w-24 text-gray-500">{t('edu.forTeacher')}</span>
                    <span className="text-[#1A1815] font-medium">{currentTeacher}</span>
                  </div>
                )}
                {currentSubject && (
                  <div className="flex gap-4">
                    <span className="w-24 text-gray-500">{t('edu.subject')}</span>
                    <span className="text-[#1A1815] font-medium">{currentSubject}</span>
                  </div>
                )}
                {currentProject.year && (
                  <div className="flex gap-4">
                    <span className="w-24 text-gray-500">{t('edu.year')}</span>
                    <span className="text-[#1A1815] font-medium">{currentProject.year}</span>
                  </div>
                )}
              </div>

              <Link 
                to={`/portfolio/${currentProject.slug}`}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 border-[#1A1815] pb-1 text-[#1A1815] hover:text-amber-700 hover:border-amber-700 transition-colors"
              >
                {t('showcase.viewProject')} <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-[#E0D7C9] flex items-center justify-between">
              <div className="flex gap-3">
                <button 
                  onClick={scrollPrev}
                  className="w-12 h-12 flex items-center justify-center border border-[#E0D7C9] bg-[#FCFAF7] text-[#1A1815] rounded-full hover:bg-[#1A1815] hover:text-white transition-colors shadow-xs"
                  aria-label="Previous slide"
                >
                  <PrevIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={scrollNext}
                  className="w-12 h-12 flex items-center justify-center border border-[#E0D7C9] bg-[#FCFAF7] text-[#1A1815] rounded-full hover:bg-[#1A1815] hover:text-white transition-colors shadow-xs"
                  aria-label="Next slide"
                >
                  <NextIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="w-48 h-[3px] bg-[#E0D7C9] relative overflow-hidden rounded-full hidden sm:block">
                <div 
                  className="absolute top-0 h-full bg-amber-600 transition-all duration-300"
                  style={{ width: `${((selectedIndex + 1) / projects.length) * 100}%` }}
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
