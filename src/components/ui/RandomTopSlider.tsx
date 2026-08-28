import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowUpLeft, 
  Sparkles, 
  BookOpen, 
  Code, 
  UserCheck, 
  CheckCircle2, 
  ExternalLink, 
  Monitor, 
  Globe, 
  Award,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudioBadgeIcon from './StudioBadgeIcon';
import { projectService } from '../../lib/services/projects';
import { Project } from '../../types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { getLocalizedField } from '../../lib/localize';
import { cn, getCategoryLabel } from '../../lib/utils';

// No fallback items - display only real uploaded projects
const FALLBACK_SLIDES: Record<string, Partial<Project>[]> = {
  'Book Covers': [],
  'Educational Covers': [],
  'Software': [],
  'Scripts': []
};

export interface RandomTopSliderProps {
  category?: 'Book Covers' | 'Educational Covers' | 'Software' | 'Scripts' | 'All' | string;
  badgeText?: string;
  headline?: string;
  variant?: 'shelf' | 'educational' | 'dashboard' | 'hero' | 'cinema';
}

export default function RandomTopSlider({
  category = 'All',
  badgeText,
  headline,
  variant = 'shelf',
}: RandomTopSliderProps) {
  const { t, language, isRTL } = useLanguageStore();
  const [items, setItems] = useState<Partial<Project>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  const ArrowIcon = isRTL ? ArrowUpLeft : ArrowUpRight;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      direction: isRTL ? 'rtl' : 'ltr',
    },
    [Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const allPublished = await projectService.getPublished();
        
        let filtered = allPublished;
        if (category !== 'All') {
          if (category === 'Educational Covers' || category === 'Educational Booklets' || category === 'Booklets') {
            filtered = allPublished.filter(p => p.category === 'Educational Covers' || p.category === 'Educational Booklets' || p.category === 'Booklets');
          } else {
            filtered = allPublished.filter(p => p.category === category);
          }
        }

        // Random Shuffle algorithm (Fisher-Yates) for uploaded projects
        const shuffled = [...filtered];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setItems(shuffled.slice(0, 7));
      } catch (err) {
        console.error('Failed to load random slider items:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [category]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  if (loading) {
    return (
      <div className="w-full h-64 bg-[#FCFAF7] border border-[#E0D7C9] rounded-3xl flex items-center justify-center my-8 shadow-xs">
        <div className="flex flex-col items-center gap-6 opacity-30 text-amber-900">
          <StudioBadgeIcon className="w-10 h-10" />
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const defaultBadge = badgeText || (isRTL ? 'معاينة عشوائية مميزة' : 'SPOTLIGHT SHOWCASE');
  const defaultHeadline = headline || (
    category === 'Book Covers' ? (isRTL ? 'استعراض رف الكتب والأغلفة' : 'Featured Book Shelf') :
    category === 'Educational Covers' ? (isRTL ? 'معرض الملازم والأدلة الدراسية' : 'Educational Booklet Showcase') :
    category === 'Software' ? (isRTL ? 'استعراض الأنظمة والشاشات البرمجية' : 'Software Dashboard Showcase') :
    category === 'Scripts' ? (isRTL ? 'استعراض المواقع والسكربتات الجاهزة' : 'Websites & Scripts Hero Showcase') :
    (isRTL ? 'جولة عشوائية في معارض اليم' : 'Random Portfolio Highlights')
  );

  /* -------------------------------------------------------------------------- */
  /* VARIANT 1: 3D BOOK SHELF (FOR BOOK COVERS)                                */
  /* -------------------------------------------------------------------------- */
  if (variant === 'shelf') {
    return (
      <div className="relative mb-16 overflow-hidden rounded-3xl bg-[#FCFAF7] border border-[#E0D7C9] p-6 md:p-10 shadow-lg">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E0D7C9] relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] font-mono font-bold uppercase tracking-widest mb-2">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>{defaultBadge}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1815] tracking-wide">
              {defaultHeadline}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-800 mr-2 font-semibold">
              {String(selectedIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <PrevIcon size={18} />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <NextIcon size={18} />
            </button>
          </div>
        </div>

        {/* 3D Shelf Carousel Viewport */}
        <div className="embla overflow-hidden relative z-10 pb-4" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {items.map((item, idx) => {
              const title = getLocalizedField(item, 'title', language);

              return (
                <div
                  key={item.id || idx}
                  className="pl-4 min-w-0 flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%]"
                >
                  <Link
                    to={`/portfolio/${item.slug || 'view'}`}
                    className="group block relative h-full p-2 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* 3D Book Cover Frame */}
                    <div className="aspect-[22.5/31] bg-[#EAE2D5] rounded-r-lg rounded-l-sm overflow-hidden relative border border-[#E0D7C9] shadow-[10px_10px_25px_rgba(0,0,0,0.12)] mb-4 group-hover:border-amber-600 transition-all">
                      <img
                        src={item.coverImage || undefined}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      />
                      {!item.coverImage && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <StudioBadgeIcon className="w-10 h-10 text-amber-900/10" />
                        </div>
                      )}
                      {/* Spine Lighting Effect */}
                      <div className="absolute inset-0 shadow-[inset_10px_0_12px_rgba(0,0,0,0.15),inset_-2px_0_3px_rgba(255,255,255,0.4)] pointer-events-none"></div>
                    </div>

                    <div className="text-start">
                      <h3 className="font-serif text-base font-bold text-[#1A1815] group-hover:text-amber-700 transition-colors line-clamp-1">
                        {title}
                      </h3>
                      <p className="text-xs text-[#5A534B] mt-1 line-clamp-1">
                        {item.teacher ? `${t('portfolio.teacherLabel')}: ${item.teacher}` : (item.subject || 'ALYAM')}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Glossy Wooden Shelf Base Line */}
        <div className="mt-2 w-full h-2.5 bg-gradient-to-r from-amber-700/30 via-amber-600/50 to-amber-700/30 rounded-full border-t border-[#E0D7C9] shadow-xs"></div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* VARIANT 2: EDUCATIONAL BOOKLET STACK (FOR BOOKLETS & STUDY GUIDES)         */
  /* -------------------------------------------------------------------------- */
  if (variant === 'educational') {
    return (
      <div className="relative mb-16 overflow-hidden rounded-3xl bg-[#FCFAF7] border border-[#E0D7C9] p-6 md:p-10 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E0D7C9] relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[11px] font-mono font-medium uppercase tracking-widest mb-2 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>{defaultBadge}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1815] tracking-wide">
              {defaultHeadline}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <PrevIcon size={18} />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <NextIcon size={18} />
            </button>
          </div>
        </div>

        <div className="embla overflow-hidden relative z-10" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {items.map((item, idx) => {
              const title = getLocalizedField(item, 'title', language);

              return (
                <div
                  key={item.id || idx}
                  className="pl-4 min-w-0 flex-[0_0_85%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%]"
                >
                  <Link
                    to={`/portfolio/${item.slug || 'view'}`}
                    className="group block relative h-full bg-[#F6F2EB] rounded-2xl border border-[#E0D7C9] hover:border-emerald-600 p-4 transition-all duration-300 hover:-translate-y-1 shadow-sm"
                  >
                    {/* Top Teacher Verification Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#E0D7C9] text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-800 font-semibold truncate">
                        <UserCheck size={14} className="text-emerald-700" />
                        <span className="truncate">{item.teacher || (isRTL ? 'الأستاذ المعتمد' : 'Verified Educator')}</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#736B63] px-2 py-0.5 rounded bg-white/60">
                        {item.year || '2026'}
                      </span>
                    </div>

                    <div className="aspect-[22.5/31] bg-[#EAE2D5] rounded-xl overflow-hidden relative border border-[#E0D7C9] mb-4 group-hover:border-emerald-600 transition-colors">
                      <img
                        src={item.coverImage || undefined}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      {!item.coverImage && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <StudioBadgeIcon className="w-10 h-10 text-amber-900/10" />
                        </div>
                      )}
                      {/* Corner Folder Page Flip Design */}
                      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/40 to-transparent pointer-events-none"></div>
                    </div>

                    <div className="text-start">
                      <h3 className="font-serif text-sm font-bold text-[#1A1815] group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#5A534B]">
                        <span className="text-amber-800 font-medium">{item.subject || 'مادة منهجية'}</span>
                        <span className="flex items-center gap-1 group-hover:text-[#1A1815] transition-colors">
                          <span>{t('showcase.viewProject')}</span>
                          <ArrowIcon size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* VARIANT 3: SOFTWARE & SYSTEM DASHBOARD FRAME (FOR SOFTWARE)               */
  /* -------------------------------------------------------------------------- */
  if (variant === 'dashboard') {
    return (
      <div className="relative mb-16 overflow-hidden rounded-3xl bg-[#FCFAF7] border border-[#E0D7C9] p-6 md:p-10 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E0D7C9] relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-800 text-[11px] font-mono font-bold uppercase tracking-widest mb-2">
              <Monitor className="w-3.5 h-3.5 text-cyan-700" />
              <span>{defaultBadge}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1815] tracking-wide">
              {defaultHeadline}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <PrevIcon size={18} />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <NextIcon size={18} />
            </button>
          </div>
        </div>

        <div className="embla overflow-hidden relative z-10" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {items.map((item, idx) => {
              const title = getLocalizedField(item, 'title', language);
              const desc = getLocalizedField(item, 'description', language);

              return (
                <div
                  key={item.id || idx}
                  className="pl-4 min-w-0 flex-[0_0_100%] md:flex-[0_0_50%]"
                >
                  <Link
                    to={`/portfolio/${item.slug || 'view'}`}
                    className="group block relative h-full bg-[#F6F2EB] rounded-2xl border border-[#E0D7C9] hover:border-cyan-600 p-5 transition-all duration-500 hover:-translate-y-1 shadow-sm"
                  >
                    {/* Simulated Browser Bar Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0D7C9]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-800 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20 font-semibold">
                        {item.subject || 'ALYAM Enterprise ERP'}
                      </span>
                    </div>

                    <div className="aspect-[16/9] bg-[#EAE2D5] rounded-xl overflow-hidden relative mb-4 border border-[#E0D7C9] shadow-xs">
                      <img
                        src={item.coverImage || undefined}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-90 group-hover:opacity-100"
                      />
                      {!item.coverImage && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <StudioBadgeIcon className="w-12 h-12 text-amber-900/10" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-700 border border-emerald-300 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{isRTL ? 'نظام حي مفعل' : 'LIVE SYSTEM'}</span>
                      </div>
                    </div>

                    <div className="text-start">
                      <h3 className="font-serif text-lg font-bold text-[#1A1815] group-hover:text-cyan-700 transition-colors line-clamp-1 mb-1">
                        {title}
                      </h3>
                      <p className="text-xs text-[#5A534B] line-clamp-2 leading-relaxed">
                        {desc || t('software.description')}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* VARIANT 4: SPLIT HERO BANNER (FOR SCRIPTS & WEBSITES)                    */
  /* -------------------------------------------------------------------------- */
  if (variant === 'hero') {
    return (
      <div className="relative mb-16 overflow-hidden rounded-3xl bg-[#FCFAF7] border border-[#E0D7C9] p-6 md:p-10 shadow-lg">
        <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] font-mono font-bold uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5 text-amber-700" />
            <span>{defaultBadge}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              className="w-9 h-9 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <PrevIcon size={16} />
            </button>
            <button
              onClick={scrollNext}
              className="w-9 h-9 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <NextIcon size={16} />
            </button>
          </div>
        </div>

        <div className="embla overflow-hidden relative z-10" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {items.map((item, idx) => {
              const title = getLocalizedField(item, 'title', language);
              const desc = getLocalizedField(item, 'description', language);

              return (
                <div key={item.id || idx} className="pl-4 min-w-0 flex-[0_0_100%]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F6F2EB] p-6 md:p-8 rounded-2xl border border-[#E0D7C9]">
                    <div className="lg:col-span-7 aspect-[16/9] rounded-xl overflow-hidden bg-[#EAE2D5] border border-[#E0D7C9] relative shadow-md group">
                      <img
                        src={item.coverImage || undefined}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      />
                      {!item.coverImage && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <StudioBadgeIcon className="w-14 h-14 text-amber-900/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40"></div>
                    </div>

                    <div className="lg:col-span-5 text-start space-y-4">
                      <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded text-xs font-mono font-semibold">
                        {item.subject || 'جاهز للتسليم والربط'}
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-[#1A1815] leading-snug">
                        {title}
                      </h3>
                      <p className="text-xs md:text-sm text-[#5A534B] leading-relaxed font-light">
                        {desc || 'سكربت وموقع إلكتروني جاهز للاستخدام مع لوحة تحكم عربية كاملة وبوابة حجز وتواصل متقدمة.'}
                      </p>

                      <div className="pt-2 flex items-center gap-4">
                        <Link
                          to={`/portfolio/${item.slug || 'view'}`}
                          className="px-5 py-2.5 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-700 transition-colors inline-flex items-center gap-2 shadow-sm"
                        >
                          <span>{t('showcase.viewProject')}</span>
                          <ArrowIcon size={14} />
                        </Link>
                        <Link
                          to="/contact"
                          className="px-5 py-2.5 bg-[#FCFAF7] border border-[#E0D7C9] text-[#1A1815] text-xs font-medium rounded hover:bg-[#EAE2D5] transition-colors"
                        >
                          {t('portfolio.inquireProject')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* DEFAULT / CINEMA VARIANT (FOR MAIN PORTFOLIO PAGE)                        */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="relative mb-16 overflow-hidden rounded-3xl bg-[#FCFAF7] border border-[#E0D7C9] p-6 md:p-10 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E0D7C9] relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] font-mono font-medium uppercase tracking-widest mb-2 font-semibold">
            <StudioBadgeIcon className="w-3.5 h-3.5 text-amber-700" />
            <span>{defaultBadge}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1815] tracking-wide">
            {defaultHeadline}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <PrevIcon size={18} />
          </button>
          <button
            onClick={scrollNext}
            className="w-10 h-10 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] text-[#1A1815] flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <NextIcon size={18} />
          </button>
        </div>
      </div>

      <div className="embla overflow-hidden relative z-10" ref={emblaRef}>
        <div className="flex touch-pan-y -ml-4">
          {items.map((item, idx) => {
            const title = getLocalizedField(item, 'title', language);

            return (
              <div
                key={item.id || idx}
                className="pl-4 min-w-0 flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%]"
              >
                <Link
                  to={`/portfolio/${item.slug || 'view'}`}
                  className="group block relative h-full bg-[#F6F2EB] rounded-2xl border border-[#E0D7C9] hover:border-amber-600 p-4 transition-all duration-500 hover:-translate-y-1 shadow-xs"
                >
                  <div className="aspect-[16/11] bg-[#EAE2D5] rounded-xl overflow-hidden relative mb-4 border border-[#E0D7C9]">
                    <img
                      src={item.coverImage || undefined}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    {!item.coverImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <StudioBadgeIcon className="w-12 h-12 text-amber-900/10" />
                      </div>
                    )}
                  </div>

                  <div className="text-start">
                    <h3 className="font-serif text-base font-bold text-[#1A1815] group-hover:text-amber-700 transition-colors line-clamp-1">
                      {title}
                    </h3>
                    <p className="text-xs text-[#5A534B] mt-1 line-clamp-1 font-light">
                      {item.teacher ? `${t('portfolio.teacherLabel')}: ${item.teacher}` : (item.subject || 'ALYAM')}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
