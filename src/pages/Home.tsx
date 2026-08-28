import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';
import Threads from '../components/ui/Threads';
import ShowcaseSlider from '../components/ui/ShowcaseSlider';
import CinematicSlider from '../components/ui/CinematicSlider';
import EducationalAccordion from '../components/ui/EducationalAccordion';
import AccordionGallery from '../components/ui/AccordionGallery';
import { Sparkles, ArrowRight, ArrowLeft, Code2, Workflow, Database } from 'lucide-react';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { useArticleStore } from '../stores/useArticleStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useProjectStore } from '../stores/useProjectStore';
import { useModalStore } from '../stores/useModalStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';
import { getCategoryLabel } from '../lib/utils';
import { Article } from '../types';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { settings } = useSettingsStore();
  const { t, language, isRTL } = useLanguageStore();
  const { openQuoteModal } = useModalStore();
  useTranslationUpdate();
  const containerRef = useRef<HTMLDivElement>(null);
  const maskTextRef = useRef<SVGGElement>(null);
  const visibleTextRef = useRef<SVGGElement>(null);
  const secondaryHeroTextRef = useRef<HTMLDivElement>(null);
  const threadsContainerRef = useRef<HTMLDivElement>(null);
  const heroCanvasRef = useRef<HTMLDivElement>(null);
  const revealedContentRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const [articles, setArticles] = useState<Article[]>([]);
  const { fetchPublished } = useArticleStore();
  const { projects, fetchPublishedProjects } = useProjectStore();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    fetchPublishedProjects();
    fetchPublished().then(data => {
      setArticles(data.slice(0, 4));
    });
  }, [fetchPublished, fetchPublishedProjects]);

  const softwareProjects = projects.filter(p => p.category === 'Software');

  const galleryItems = projects
    .filter(p => p.category === 'Educational Booklets' || p.category === 'Booklets' || p.category === 'Educational Covers')
    .slice(0, 7)
    .map((p, index) => ({
      id: p.id || index,
      image: p.coverImage || p.images?.[0] || '',
      title: getLocalizedField(p, 'title', language),
      description: p.teacher ? `${t('portfolio.teacherLabel')}: ${getLocalizedField(p, 'teacher', language)} | ${getLocalizedField(p, 'subject', language) || ''}` : '',
      link: `/portfolio/${p.slug}`
    }));

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Calculate a refined, non-extreme scale so ALYAM fills/exceeds the viewport smoothly
      const vpWidth = window.innerWidth;
      const isMobile = vpWidth < 768;
      
      const baseFontSize = Math.min(vpWidth * 0.28, 280);
      const targetScale = isMobile 
        ? Math.min(Math.max((vpWidth * 1.35) / baseFontSize, 6.5), 8.5)
        : Math.min(Math.max((vpWidth * 1.5) / baseFontSize, 8.5), 11.5);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=240%', // Shorter scroll distance (approx 2.4 viewport heights)
          scrub: 1.2, // Smooth scrubbing
          pin: true,
          anticipatePin: 1,
        }
      });

      // 1. Scale BOTH the mask cutout text AND the visible ALYAM typography in 100% sync
      tl.to([maskTextRef.current, visibleTextRef.current], {
        scale: targetScale,
        transformOrigin: 'center center',
        ease: 'power2.inOut',
        duration: 1,
      }, 0);

      // 2. Secondary elements ("STUDIO", tagline, scroll prompt) fade out gently as ALYAM scales
      tl.to(secondaryHeroTextRef.current, {
        opacity: 0,
        y: -20,
        ease: 'power1.inOut',
        duration: 0.35,
      }, 0.08);

      // 3. Layer 1 (Next Section) fades in smoothly
      tl.fromTo(layer1Ref.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'power1.inOut',
          duration: 0.3,
        },
        0.2
      );

      // 4. Visible ALYAM typography fades out smoothly as it fills the screen
      tl.fromTo(visibleTextRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'power2.inOut',
          duration: 0.4,
        },
        0.38
      );

      // 5. Revealed Content comes in gently
      tl.fromTo(revealedContentRef.current,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          duration: 0.45,
        },
        0.45
      );

      // 6. Gently fade Threads WebGL layer near the end
      tl.to(threadsContainerRef.current, {
        opacity: 0,
        ease: 'power1.inOut',
        duration: 0.3,
      }, 0.65);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCanvasRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = heroCanvasRef.current.getBoundingClientRect();
    const x = ((clientX - left) / width) * 100;
    const y = ((clientY - top) / height) * 100;
    setMousePos({ x: `${x}%`, y: `${y}%` });
  };

  
  const sectionMap: Record<string, React.ReactNode> = {
    'covers': <CinematicSlider key="covers" />,
    'booklets': <EducationalAccordion key="booklets" />,
    'digital': (
<React.Fragment key="digital">
{/* 6. PROGRAMMING & DIGITAL SOLUTIONS (ROYAL MAROON SECTION) */}
      <section className="py-24 md:py-32 px-4 sm:px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#1c040b] via-[#140207] to-[#1a0309] text-white border-t border-[#3d0b1a] relative overflow-hidden">
        {/* Ambient Subtle Maroon & Gold Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(190,24,60,0.18),transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-20">
             <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-500 font-semibold block mb-3">
               {t('tech.label')}
             </span>
             <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif leading-tight text-white">
               {t('tech.title')}
             </h2>
             <p className="max-w-2xl mx-auto mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-300/90 font-light leading-relaxed">
               {t('tech.subtitle')}
             </p>
          </div>

          {/* CMS REAL SOFTWARE PROJECTS (IF PUBLISHED) */}
          {softwareProjects.length > 0 && (
            <div className="mb-12 md:mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {softwareProjects.slice(0, 3).map((project) => {
                  const localizedTitle = getLocalizedField(project, 'title', language);
                  const localizedDesc = getLocalizedField(project, 'description', language);
                  const imageSrc = project.coverImage || project.images?.[0] || undefined;

                  return (
                    <Link 
                      key={project.id}
                      to={`/portfolio/${project.slug}`}
                      className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-xl border border-[#3d0b1a] hover:border-gold-500/50 bg-[#24060f]/60 hover:bg-[#2d0713]/80 transition-all duration-500 hover:shadow-[0_10px_30px_rgba(190,24,60,0.2)] backdrop-blur-xs"
                    >
                      <div>
                        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg bg-[#140207] border border-[#3d0b1a] mb-6 group-hover:border-gold-500/30 transition-colors">
                          <img 
                            src={imageSrc}
                            alt={localizedTitle}
                            loading="lazy"
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          {!imageSrc && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <StudioBadgeIcon className="w-10 h-10 text-white/5" />
                            </div>
                          )}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-serif mb-2.5 text-white group-hover:text-gold-400 transition-colors line-clamp-1">
                          {localizedTitle}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-6">
                          {localizedDesc}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#3d0b1a] flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-widest text-gold-400 group-hover:text-gold-300 font-medium">
                          {t('showcase.viewProject')}
                        </span>
                        <ArrowIcon className={`w-4 h-4 text-gold-400 transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* CORE SOFTWARE PILLARS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="group relative p-6 sm:p-8 rounded-xl border border-[#3d0b1a] hover:border-gold-500/50 bg-[#24060f]/60 hover:bg-[#2d0713]/80 transition-all duration-500 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(190,24,60,0.2)] backdrop-blur-xs">
              <div>
                <div className="w-12 h-12 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-black transition-all duration-300">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif mb-3 text-white group-hover:text-gold-400 transition-colors">
                  {t('tech.customWeb.title')}
                </h3>
                <p className="text-gray-300/80 text-xs sm:text-sm leading-relaxed mb-6">
                  {t('tech.customWeb.desc')}
                </p>
              </div>

              <div className="pt-4 border-t border-[#3d0b1a] flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">React</span>
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">TypeScript</span>
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">Vite</span>
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">Tailwind</span>
              </div>
            </div>

            <div className="group relative p-6 sm:p-8 rounded-xl border border-[#3d0b1a] hover:border-gold-500/50 bg-[#24060f]/60 hover:bg-[#2d0713]/80 transition-all duration-500 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(190,24,60,0.2)] backdrop-blur-xs">
              <div>
                <div className="w-12 h-12 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-black transition-all duration-300">
                  <Workflow className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif mb-3 text-white group-hover:text-gold-400 transition-colors">
                  {t('tech.bizMgmt.title')}
                </h3>
                <p className="text-gray-300/80 text-xs sm:text-sm leading-relaxed mb-6">
                  {t('tech.bizMgmt.desc')}
                </p>
              </div>

              <div className="pt-4 border-t border-[#3d0b1a] flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">Custom CRM</span>
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">Workflows</span>
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">Node.js</span>
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">REST API</span>
              </div>
            </div>

            <div className="group relative p-6 sm:p-8 rounded-xl border border-[#3d0b1a] hover:border-gold-500/50 bg-[#24060f]/60 hover:bg-[#2d0713]/80 transition-all duration-500 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(190,24,60,0.2)] backdrop-blur-xs">
              <div>
                <div className="w-12 h-12 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-black transition-all duration-300">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif mb-3 text-white group-hover:text-gold-400 transition-colors">
                  {t('tech.accounting.title')}
                </h3>
                <p className="text-gray-300/80 text-xs sm:text-sm leading-relaxed mb-6">
                  {t('tech.accounting.desc')}
                </p>
              </div>

              <div className="pt-4 border-t border-[#3d0b1a] flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">Financial Log</span>
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">Express</span>
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">Firestore</span>
                <span className="px-2.5 py-1 rounded bg-[#140207] border border-[#3d0b1a] text-[10px] font-mono text-gray-300">Security</span>
              </div>
            </div>
          </div>

          {/* ADDED ARTICLES SECTION */}
          <div className="mt-24 pt-24 border-t border-[#3d0b1a]">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-12 gap-6">
              <div className="text-center sm:text-right">
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold-500/80 mb-2 block">
                  {t('journal.label') || 'المجلة والمقالات'}
                </span>
                <h3 className="text-3xl sm:text-4xl font-serif text-white">
                  {t('journal.title')}
                </h3>
              </div>
              <Link to="/magazine" className="text-xs font-mono uppercase tracking-widest text-gold-400 border-b border-gold-400/30 pb-1 hover:text-gold-300 hover:border-gold-300 transition-all flex items-center gap-2 group">
                {t('journal.viewAll')}
                <ArrowIcon className={`w-3 h-3 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.length > 0 ? (
                articles.slice(0, 4).map((article) => (
                  <Link to={`/magazine/${article.slug}`} key={article.id} className="group flex flex-col bg-[#24060f]/60 border border-[#3d0b1a] rounded-xl overflow-hidden hover:border-gold-500/30 transition-all duration-500 backdrop-blur-xs">
                    <div className="aspect-[16/10] overflow-hidden">
                      {article.featuredImage ? (
                        <img loading="lazy" src={article.featuredImage} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={article.title} />
                      ) : (
                        <div className="w-full h-full bg-[#140207] flex items-center justify-center">
                          <StudioBadgeIcon className="w-8 h-8 text-white/10" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest mb-2">
                        {getLocalizedField(article, 'category', language) || (article.category === 'Technology' ? t('journal.filterTech') : article.category === 'Design' ? t('journal.filterDesign') : article.category) || t('journal.filterAll')}
                      </span>
                      <h4 className="text-lg font-serif text-white leading-snug group-hover:text-gold-400 transition-colors line-clamp-2">
                        {getLocalizedField(article, 'title', language)}
                      </h4>
                      <div className="mt-auto pt-4 flex items-center text-[10px] text-gray-400 uppercase tracking-widest">
                        {new Date(article.publishDate || article.createdAt || Date.now()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long' })}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col bg-[#24060f]/40 border border-[#3d0b1a] rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-[16/10] bg-[#140207]" />
                    <div className="p-5">
                      <div className="h-2 w-16 bg-gold-500/20 rounded mb-3" />
                      <div className="h-4 w-full bg-white/5 rounded mb-2" />
                      <div className="h-4 w-2/3 bg-white/5 rounded" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CTA BUTTON */}
          <div className="mt-12 md:mt-16 text-center">
            <Link 
              to="/software"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black text-xs sm:text-sm font-semibold uppercase tracking-widest rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] active:scale-95"
            >
              <span>{t('tech.explore')}</span>
              <ArrowIcon className={`w-4 h-4 transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </Link>
          </div>
        </div>
      </section>

      
    </React.Fragment>
    ),
    'gallery': (
<React.Fragment key="gallery">
{/* 6.5. ACCORDION GALLERY SHOWCASE */}
      <section className="py-24 px-4 md:px-12 lg:px-24 bg-[#08080a] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <span className="text-gold-500 font-mono text-xs tracking-widest uppercase mb-4 block">
                {t('common.gallery')}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif">{t('common.featuredWorks')}</h2>
            </div>
          </div>
          <div className="w-full">
            {galleryItems.length > 0 && (
              <AccordionGallery
                items={galleryItems}
                defaultIndex={Math.floor(galleryItems.length / 2)}
                expandRatio={0.35}
                height="auto"
                className="aspect-[207/100]"
                trigger="hover"
              />
            )}
          </div>
        </div>
      </section>

      
    </React.Fragment>
    ),
    'services': (
<React.Fragment key="services">
{/* 7. SERVICES SUMMARY */}
      <section className="py-24 px-4 md:px-12 lg:px-24 bg-[#F6F2EB] text-[#1c1917]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
             <h2 className="text-4xl font-serif mb-6">{t('services.title')}</h2>
             <p className="text-gray-600 mb-8">{t('services.subtitle')}</p>
             <Link to="/services" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest border-b border-black pb-1 hover:text-amber-700 hover:border-amber-700 transition-colors">
              {t('services.detailed')} <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
             {[
               t('services.list.graphic'), t('services.list.brand'), t('services.list.covers'), t('services.list.print'),
               t('services.list.web'), t('services.list.software'), t('services.list.systems'), t('services.list.accounting')
             ].map((service, i) => (
               <div key={i} className="py-4 border-b border-[#E0D7C9] text-lg font-serif">
                 {service}
               </div>
             ))}
          </div>
        </div>
      </section>

      
    </React.Fragment>
    ),
    'experience': (
<React.Fragment key="experience">
{/* 8. EXPERIENCE / NUMBERS */}
      <section className="py-24 px-4 md:px-12 lg:px-24 bg-[#ECE3D6] border-y border-[#E0D7C9] text-[#1A1815]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <span className="block text-5xl md:text-7xl font-serif mb-2 text-[#1A1815]">
              {settings?.stats?.foundingYear || '2013'}
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest font-semibold text-amber-700">{t('numbers.established')}</span>
          </div>
          <div>
            <span className="block text-5xl md:text-7xl font-serif mb-2 text-[#1A1815]">
              {settings?.stats?.bookCovers || '400+'}
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest font-semibold text-amber-700">{t('numbers.covers')}</span>
          </div>
          <div>
            <span className="block text-5xl md:text-7xl font-serif mb-2 text-[#1A1815]">
              {settings?.stats?.educationalBooklets || '150+'}
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest font-semibold text-amber-700">{t('numbers.curriculums')}</span>
          </div>
          <div>
            <span className="block text-5xl md:text-7xl font-serif mb-2 text-[#1A1815]">
              {settings?.stats?.customSystems || '50+'}
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest font-semibold text-amber-700">{t('numbers.systems')}</span>
          </div>
        </div>
      </section>

      
    </React.Fragment>
    ),
    'about': (
<React.Fragment key="about">
{/* 10. ABOUT PREVIEW & 11. FINAL CTA (ROYAL MAROON SECTION) */}
      <section className="py-32 px-4 md:px-12 lg:px-24 bg-gradient-to-b from-[#1c040b] via-[#140207] to-[#180309] text-white text-center relative overflow-hidden border-t border-[#3d0b1a]">
        {/* Ambient Maroon & Gold Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(190,24,60,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-10 flex justify-center">
            <StudioBadgeIcon className="w-20 h-20 text-gold-500 mx-auto drop-shadow-[0_0_25px_rgba(251,191,36,0.3)]" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-8 leading-tight text-white">
            {t('cta.title.line1')} <br/> {t('cta.title.line2')}
          </h2>
          <p className="text-gray-300/90 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/contact" className="px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black text-sm uppercase tracking-widest font-bold transition-all duration-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] w-full sm:w-auto text-center rounded-sm active:scale-95">
              {t('cta.book')}
            </Link>
            <Link to="/about" className="px-8 py-4 border border-[#3d0b1a] hover:border-gold-500/50 bg-[#24060f]/60 hover:bg-[#2d0713]/80 text-white text-sm uppercase tracking-widest transition-all duration-300 w-full sm:w-auto text-center rounded-sm">
              {t('cta.about')}
            </Link>
          </div>
        </div>
      </section>


    </React.Fragment>
    )
  };

  const defaultOrder = ['covers', 'booklets', 'digital', 'gallery', 'services', 'experience', 'about'];
  const renderedSections = settings?.homeSections 
    ? [...settings.homeSections].sort((a, b) => a.order - b.order).filter(s => s.isVisible).map(s => sectionMap[s.id])
    : defaultOrder.map(id => sectionMap[id]);

  return (
    <div className="bg-[#140207] text-white selection:bg-amber-900 selection:text-white overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO />
      <Navbar />

      
            {/* SVG MASK DEFINITION */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <mask id="alyam-gate-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            {/* White background means visible (reveals Layer 2 underlying canvas) */}
            <rect width="100%" height="100%" fill="white" />
            
            {/* Black ALYAM text acts as the cutout portal gate (reveals Layer 1 underlying section) */}
            <g ref={maskTextRef} style={{ transformOrigin: 'center center' }}>
              <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="central" 
                fill="black"
                className="font-serif font-bold"
                textRendering="geometricPrecision"
                style={{ 
                  fontSize: 'min(28vw, 280px)',
                  letterSpacing: '-0.02em',
                  userSelect: 'none'
                }}
              >
                AL<tspan fill="black">.</tspan>YAM
              </text>
            </g>
          </mask>
        </defs>
      </svg>

      {/* 1. PINNED HERO PORTAL CONTAINER */}
      <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#180309]">
        
        {/* LAYER 1: UNDERLYING REVEALED SECTION (Royal Maroon / Burgundy Canvas) */}
        <div ref={layer1Ref} className="absolute inset-0 z-0 w-full h-full bg-gradient-to-b from-[#2d0713] via-[#1a0309] to-[#120206] text-white select-none opacity-0">
          {/* Subtle Royal Grid Background for Revealed Section */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
          {/* Ambient Royal Maroon Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(159,18,57,0.25),transparent_70%)] pointer-events-none" />
        </div>

        {/* LAYER 2: MASKED HERO CANVAS (Royal Maroon Velvet Canvas & Spotlight) */}
        <div 
          ref={heroCanvasRef}
          onMouseMove={handleMouseMove}
          className="absolute inset-0 z-10 w-full h-full pointer-events-auto"
          style={{
            maskImage: 'url(#alyam-gate-mask)',
            WebkitMaskImage: 'url(#alyam-gate-mask)',
          }}
        >
          {/* Solid Royal Maroon Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2d0713] via-[#1a0309] to-[#120206]" />
          
          {/* Ambient Mouse Spotlight with Royal Maroon & Beige Undertones */}
          <div 
            className="absolute inset-0 opacity-50 transition-all duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle 750px at ${mousePos.x} ${mousePos.y}, rgba(190, 24, 60, 0.3), rgba(216, 202, 190, 0.15), transparent 75%)`
            }}
          />
        </div>

        {/* THREADS WEBGL BACKGROUND LAYER (Unmasked z-[15] Layer for Full Visibility) */}
        <div ref={threadsContainerRef} className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full flex items-center justify-center opacity-90 z-[15] pointer-events-auto">
          <div style={{ width: '100%', height: '600px', position: 'relative' }}>
            <Threads 
              amplitude={1}
              distance={0}
              color={[0.88, 0.82, 0.74]}
              secondaryColor={[0.75, 0.1, 0.25]}
              enableMouseInteraction={true}
            />
          </div>
        </div>

        {/* LAYER 3: REAL VISIBLE ALYAM TYPOGRAPHY & SECONDARY HERO TEXT (Synchronized Layer 4 at z-20) */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4">
          
          {/* REAL VISIBLE ALYAM WORDMARK (SVG for 1:1 Pixel-Perfect Alignment with Mask) */}
          <svg className="w-full h-[35vh] max-h-[350px] max-w-7xl mx-auto overflow-visible select-none">
            <defs>
              <linearGradient id="alyam-visible-beige-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FAF7F2" />
                <stop offset="35%" stopColor="#EAE2D5" />
                <stop offset="70%" stopColor="#D8CABE" />
                <stop offset="100%" stopColor="#BFAEA0" />
              </linearGradient>
            </defs>
            <g ref={visibleTextRef} style={{ transformOrigin: 'center center' }}>
              <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="central" 
                fill="url(#alyam-visible-beige-grad)"
                className="font-serif font-bold"
                textRendering="geometricPrecision"
                style={{ 
                  fontSize: 'min(28vw, 280px)',
                  letterSpacing: '-0.02em',
                  filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))',
                  userSelect: 'none'
                }}
              >
                AL<tspan fill="#F59E0B" style={{ fill: '#F59E0B' }}>.</tspan>YAM
              </text>
            </g>
          </svg>

          {/* Minimal Subtitle & Scroll Indicator (Wrapped in secondaryHeroTextRef for synchronized fade out) */}
          <div ref={secondaryHeroTextRef} className="mt-4 md:mt-6 flex flex-col items-center text-center relative">
            <p className="text-sm sm:text-lg md:text-2xl text-amber-400 font-sans font-bold uppercase tracking-[0.6em] mb-2 drop-shadow-[0_0_14px_rgba(245,158,11,0.5)]">
              {t('hero.studioLabel')}
            </p>
            
            {/* Glowing Horizon Light Beam below STUDIO */}
            <div className="relative w-48 sm:w-80 h-[1px] my-3 bg-gradient-to-r from-transparent via-[#D8CABE]/80 to-transparent">
              <div className="absolute inset-0 bg-[#D8CABE] blur-[2px] opacity-90" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-[#FAF7F2] blur-sm rounded-full opacity-70" />
            </div>

            {/* Ambient Beige Radial Flare below ALYAM */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-[#D8CABE]/15 blur-3xl rounded-full pointer-events-none" />

            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.3em] text-gray-300/90 mb-8 relative z-10">
              {t('hero.tagline')}
            </p>

            {/* Enhanced Glowing Scroll Pillar & Pulse Light */}
            <div className="flex flex-col items-center gap-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#EAE2D5] font-mono drop-shadow-[0_0_8px_rgba(216,202,190,0.4)]">
                {t('hero.scrollPrompt')}
              </span>
              <div className="relative w-[2px] h-14 bg-gradient-to-b from-[#EAE2D5] via-[#D8CABE]/50 to-transparent overflow-hidden rounded-full shadow-[0_0_10px_rgba(216,202,190,0.5)]">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white blur-[0.5px] animate-bounce" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#D8CABE] shadow-[0_0_14px_#D8CABE] animate-ping" />
            </div>
          </div>
        </div>

        {/* LAYER 4: INTERACTIVE REVEALED CONTENT (Topmost interactive layer) */}
        <div 
          ref={revealedContentRef} 
          className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 md:px-12 pointer-events-none opacity-0"
        >
          <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
            <div className="flex flex-col items-center gap-6 mb-8">
              <StudioBadgeIcon className="w-14 h-14 sm:w-20 sm:h-20 text-gold-500 drop-shadow-[0_0_25px_rgba(251,191,36,0.4)]" />
              <span className="text-xs font-mono uppercase tracking-[0.4em] text-gold-500 font-bold">{t('hero.welcome')}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.08] tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400">
              {getLocalizedField(settings, 'heroText.title', language)
                .split(/(\n|<br\s*\/?>|<\/br>)/i).map((part, i) => {
                  if (part === '\n' || /<br\s*\/?>|<\/br>/i.test(part)) return <br key={i} />;
                  return part;
                })}
            </h2>
            
            <p className="max-w-2xl text-gray-300 font-light text-sm sm:text-base md:text-lg tracking-wide leading-relaxed mb-10">
              {getLocalizedField(settings, 'heroText.subtitle', language)
                .split(/(\n|<br\s*\/?>|<\/br>)/i).map((part, i) => {
                  if (part === '\n' || /<br\s*\/?>|<\/br>/i.test(part)) return <br key={i} />;
                  return part;
                })}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pointer-events-auto">
              <Link 
                to="/portfolio" 
                className="w-full sm:w-auto px-8 py-4 bg-gold-500 text-black text-xs sm:text-sm font-semibold uppercase tracking-widest hover:bg-gold-400 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group rounded-xl"
              >
                {t('hero.exploreWorks')}
                <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => openQuoteModal()}
                className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white text-xs sm:text-sm uppercase tracking-widest hover:border-white hover:bg-white/5 transition-all duration-300 backdrop-blur-sm text-center cursor-pointer font-semibold rounded-xl"
              >
                {t('common.requestQuote')}
              </button>
            </div>
          </div>
        </div>

        {/* HERO BOTTOM HORIZON GLOW & GRADIENT EDGE */}
        <div className="absolute bottom-0 inset-x-0 z-30 pointer-events-none">
          <div className="h-28 bg-gradient-to-t from-[#120206] via-[#1a0309]/80 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-amber-200 to-transparent blur-[1px]" />
        </div>
      </div>

      <ShowcaseSlider />

      
      {renderedSections}
      <Footer />
    </div>
  );
}

