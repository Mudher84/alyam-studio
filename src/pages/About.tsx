import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FoldText from '../components/ui/FoldText';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { ArrowRight, ArrowLeft, Code, PenTool, Layout, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FormattedText } from '../components/ui/FormattedText';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';

export default function About() {
  const { settings } = useSettingsStore();
  const { t, isRTL, language } = useLanguageStore();
  useTranslationUpdate();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1c1917] flex flex-col selection:bg-amber-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('about.title')} description={t('about.p1')} />
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Hero Section */}
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-24 md:mb-32">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 border border-black/10 text-black text-xs font-mono uppercase tracking-widest mb-6">
            <StudioBadgeIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('about.badge')}</span>
          </div>
          <div className="mb-8 h-[48px] md:h-[68px]">
            <FoldText
              text={getLocalizedField(settings, 'aboutText.title', language)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed mb-6">
                <FormattedText text={getLocalizedField(settings, 'aboutText.content', language)} />
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" 
                  alt="Alyam Studio Workspace"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-amber-500 text-black p-6 rounded-xl shadow-xl hidden md:block">
                <div className="text-4xl font-serif font-bold mb-1">10+</div>
                <div className="text-xs font-mono uppercase tracking-widest">{t('about.yearsExperience')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-28 md:mb-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-600 block mb-3 font-semibold">
                {isRTL ? '// قدراتنا الأساسية' : '// OUR CAPABILITIES'}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight font-bold">
                {t('about.skillsTitle')}
              </h2>
              <p className="text-gray-500 font-light leading-relaxed">
                {t('about.skillsSubtitle')}
              </p>
            </div>
            
            <div className="lg:col-span-7 space-y-8">
              {(settings.aboutSkills || [
                { name: t('about.skill1'), percent: 95 },
                { name: t('about.skill2'), percent: 98 },
                { name: t('about.skill3'), percent: 90 },
                { name: t('about.skill4'), percent: 88 }
              ]).map((skill, index) => {
                const skillName = getLocalizedField(skill, 'name', language);
                return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-serif font-semibold text-black">{skillName}</span>
                    <span className="font-mono text-amber-600 font-bold">{skill.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black rounded-full origin-left transition-all duration-1000 ease-out" 
                      style={{ width: `${skill.percent}%` }}
                    />
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>

        {/* Experience / Timeline Section */}
        <div className="bg-zinc-50 border-y border-zinc-100 py-24 px-6 md:px-12 lg:px-24 mb-28 md:mb-36">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-600 block mb-3 font-semibold">
                {isRTL ? '// رحلتنا المهنية' : '// OUR JOURNEY'}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight font-bold">
                {t('about.expTitle')}
              </h2>
              <p className="text-gray-500 font-light leading-relaxed text-sm md:text-base">
                {t('about.expSubtitle')}
              </p>
            </div>

            <div className={`relative border-zinc-200 space-y-12 py-4 ${isRTL ? 'border-r mr-4 md:mr-12 pr-8' : 'border-l ml-4 md:ml-12 pl-8'}`}>
              {(settings.aboutExperience || [
                { year: t('about.exp1Year'), title: t('about.exp1Title'), desc: t('about.exp1Desc') },
                { year: t('about.exp2Year'), title: t('about.exp2Title'), desc: t('about.exp2Desc') },
                { year: t('about.exp3Year'), title: t('about.exp3Title'), desc: t('about.exp3Desc') },
                { year: t('about.exp4Year'), title: t('about.exp4Title'), desc: t('about.exp4Desc') }
              ]).map((item, idx) => {
                const itemTitle = getLocalizedField(item, 'title', language);
                const itemDesc = getLocalizedField(item, 'desc', language);
                return (
                <div key={idx} className="relative group">
                  {/* Bullet */}
                  <div className={`absolute top-2.5 w-4 h-4 rounded-full bg-white border-4 border-black group-hover:border-amber-500 transition-colors duration-300 z-10 ${isRTL ? '-right-[41px]' : '-left-[41px]'}`} />
                  
                  {/* Timeline content */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 items-start">
                    {/* Year on Left (desktop) or Inline (mobile) */}
                    <div className="md:col-span-2">
                      <span className="text-2xl md:text-3xl font-serif font-extrabold text-black/25 group-hover:text-amber-500 transition-colors duration-300 block">
                        {item.year}
                      </span>
                    </div>
                    {/* Details */}
                    <div className="md:col-span-10 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h3 className="text-lg font-serif font-bold text-black mb-2">
                        {itemTitle}
                      </h3>
                      <p className="text-sm text-gray-500 font-light leading-relaxed">
                        {itemDesc}
                      </p>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>

        {/* Core Values / Services */}
        <div className="bg-alyam-black text-white py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-serif mb-4">{t('about.ourExpertise')}</h2>
                <p className="text-gray-400 max-w-xl font-light leading-relaxed">
                  {t('about.expertiseDesc')}
                </p>
              </div>
              <Link 
                to="/services"
                className="inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-mono uppercase tracking-widest hover:text-amber-400 hover:border-amber-400 transition-colors"
              >
                {t('about.allServices')} <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: PenTool, title: t('services.list.print'), desc: t('covers.description') },
                { icon: Code, title: t('services.list.software'), desc: t('tech.customWeb.desc') },
                { icon: Layout, title: t('marketplace.title'), desc: t('marketplace.subtitle') },
                { icon: Lightbulb, title: t('services.list.brand'), desc: t('services.subtitle') }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-400 font-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 md:px-12 lg:px-24 py-24 max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight max-w-3xl mx-auto">
            {t('about.readyTitle')}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-10 font-light text-lg">
            {t('about.readyDesc')}
          </p>
          <Link 
            to="/contact"
            className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full text-sm font-mono uppercase tracking-widest hover:bg-gray-800 transition-colors group"
          >
            {t('about.startProject')} <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

