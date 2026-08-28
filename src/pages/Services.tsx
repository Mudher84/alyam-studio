import React, { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FoldText from '../components/ui/FoldText';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { PenTool, Code, Layout, Lightbulb, ArrowRight, ArrowLeft, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageParallax from '../components/ui/ImageParallax';
import { useServiceStore } from '../stores/useServiceStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useModalStore } from '../stores/useModalStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';

export default function Services() {
  const { services: dynamicServices, fetchServices } = useServiceStore();
  const { t, language, isRTL } = useLanguageStore();
  const { openQuoteModal, openAIModal } = useModalStore();
  useTranslationUpdate();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const defaultServices = [
    {
      id: 'print-covers',
      title: t('services.list.print'),
      description: t('covers.description'),
      features: [t('services.list.graphic'), t('services.list.covers'), t('services.list.print'), t('edu.subject')],
      link: '/covers',
      icon: PenTool,
      imageUrl: 'https://images.unsplash.com/photo-1628155930533-8e066b7b5320?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 'software',
      title: t('services.list.software'),
      description: t('tech.subtitle'),
      features: [t('tech.customWeb.title'), t('tech.bizMgmt.title'), t('tech.accounting.title'), t('services.list.systems')],
      link: '/software',
      icon: Code,
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 'scripts',
      title: t('marketplace.title'),
      description: t('marketplace.subtitle'),
      features: [t('marketplace.forSale'), t('tech.customWeb.title'), t('services.list.web'), t('services.list.software')],
      link: '/websites',
      icon: Layout,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 'brand',
      title: t('services.list.brand'),
      description: t('services.subtitle'),
      features: [t('services.list.brand'), t('services.list.graphic'), t('services.list.covers'), t('services.list.print')],
      link: '/contact',
      icon: Lightbulb,
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop'
    }
  ];

  const activeServices = dynamicServices.filter(s => s.status === 'active');
  const displayServices = activeServices.length > 0 ? activeServices.map((s, index) => ({
    id: s.id,
    title: getLocalizedField(s, 'title', language),
    description: getLocalizedField(s, 'description', language),
    features: s.features || [],
    link: s.link || '/contact',
    icon: Layout,
    imageUrl: s.imageUrl || `https://images.unsplash.com/photo-${index === 0 ? '1628155930533-8e066b7b5320' : index === 1 ? '1555066931-4365d14bab8c' : index === 2 ? '1460925895917-afdab827c52f' : '1611162617474-5b21e879e113'}?q=80&w=1000&auto=format&fit=crop`
  })) : defaultServices;

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1c1917] flex flex-col selection:bg-amber-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('services.title')} description={t('services.subtitle')} />
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 border border-black/10 text-black text-xs font-mono uppercase tracking-widest mb-6">
            <StudioBadgeIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('services.label')}</span>
          </div>
          <div className="mb-8 h-[48px] md:h-[68px]">
            <FoldText
              text={t('services.title')}
              splitBy="char"
              hinge="top"
              trigger="scroll"
              duration={0.65}
              stagger={0.045}
              ease="power3.out"
              perspective={700}
              creaseShading={0.55}
              fontSize="clamp(2rem, 5vw, 3.5rem)"
              fontWeight={800}
              color="#000000"
            />
          </div>
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl font-light leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services List */}
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto space-y-24">
          {displayServices.map((service, index) => (
            <div 
              key={service.id}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-24 items-center`}
            >
              {/* Content */}
              <div className="flex-1 space-y-8">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                  <Layout className="w-8 h-8" />
                </div>
                
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif mb-4">{service.title}</h2>
                  <p className="text-lg text-gray-600 font-light leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {service.features && service.features.length > 0 && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Link 
                    to={service.link}
                    className="group inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-[0.15em] hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    {t('services.explore')} <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <button
                    onClick={() => openQuoteModal({ serviceTitle: service.title, defaultCategory: service.id === 'print-covers' ? 'cover' : 'other' })}
                    className="inline-flex items-center gap-2 border border-gray-300 text-gray-800 hover:border-amber-500 hover:text-amber-700 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-[0.15em] transition-all cursor-pointer font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    {t('common.requestQuote')}
                  </button>
                </div>
              </div>

              {/* Visual/Image area placeholder */}
              <div className="flex-1 w-full">
                <div className="aspect-[4/3] rounded-3xl bg-gray-100 border border-gray-200 overflow-hidden relative group">
                  <ImageParallax 
                    src={service.imageUrl || `https://images.unsplash.com/photo-${index === 0 ? '1628155930533-8e066b7b5320' : index === 1 ? '1555066931-4365d14bab8c' : index === 2 ? '1460925895917-afdab827c52f' : '1611162617474-5b21e879e113'}?q=80&w=1000&auto=format&fit=crop`}
                    alt={service.title}
                    imageClassName="opacity-90 group-hover:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="px-6 md:px-12 lg:px-24 pt-32 pb-12 max-w-7xl mx-auto text-center">
          <div className="bg-alyam-black text-white rounded-3xl p-12 md:p-24 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight max-w-2xl">
                {t('services.ctaTitle')}
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-10 font-light text-lg">
                {t('services.ctaDesc')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => openQuoteModal()}
                  className="group inline-flex items-center gap-3 bg-amber-500 text-black px-8 py-4 rounded-full text-sm font-mono font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors cursor-pointer shadow-lg"
                >
                  <FileText className="w-4 h-4" />
                  {t('common.requestQuote')}
                </button>
                <Link 
                  to="/contact"
                  className="group inline-flex items-center gap-3 border border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-full text-sm font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  {t('nav.contact')} <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => openAIModal()}
                  className="group inline-flex items-center gap-2 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 px-6 py-4 rounded-full text-sm font-mono font-medium tracking-wider transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {t('common.aiAssistant')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

