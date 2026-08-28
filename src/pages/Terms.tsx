import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';
import FoldText from '../components/ui/FoldText';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useSettingsStore } from '../stores/useSettingsStore';

export default function Terms() {
  const { t, isRTL } = useLanguageStore();
  const { settings } = useSettingsStore();

  const termsContent = isRTL 
    ? (settings.termsContent_ar || '') 
    : (settings.termsContent || '');

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1c1917] flex flex-col selection:bg-amber-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('terms.title')} description={t('terms.intro')} />
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto w-full">
        <header className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-600 mb-4">
            {t('terms.lastUpdated')}
          </p>
          <div className="mb-6 h-[42px] md:h-[58px]">
            <FoldText
              text={t('terms.title')}
              splitBy="char"
              hinge="top"
              trigger="scroll"
              duration={0.65}
              stagger={0.045}
              ease="power3.out"
              perspective={700}
              creaseShading={0.55}
              fontSize="clamp(1.8rem, 4vw, 3rem)"
              fontWeight={800}
              color="#000000"
            />
          </div>
          <p className="text-lg text-gray-600 font-light leading-relaxed">
            {t('terms.intro')}
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-700 font-light space-y-8 leading-relaxed whitespace-pre-wrap">
          {termsContent ? (
            <div dangerouslySetInnerHTML={{ __html: termsContent.replace(/\n/g, '<br/>') }} />
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-serif text-black mb-4">
                  {t('terms.ipTitle')}
                </h2>
                <p>
                  {t('terms.ipDesc')}
                </p>
              </section>
     
              <section>
                <h2 className="text-2xl font-serif text-black mb-4">
                  {t('terms.serviceTitle')}
                </h2>
                <p>
                  {t('terms.serviceDesc')}
                </p>
              </section>
     
              <section>
                <h2 className="text-2xl font-serif text-black mb-4">
                  {t('terms.liabilityTitle')}
                </h2>
                <p>
                  {t('terms.liabilityDesc')}
                </p>
              </section>
            </>
          )}
 
          <section className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-serif text-black mb-2">
              {t('terms.legalTitle')}
            </h2>
            <p className="text-sm">
              {t('terms.legalDesc')}{' '}
              <a href="mailto:hello@alyamstudio.com" className="text-amber-600 underline">hello@alyamstudio.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
