import React, { useState, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FoldText from '../components/ui/FoldText';
import SEO from '../components/SEO';
import StudioBadgeIcon from '../components/ui/StudioBadgeIcon';
import { Mail, MapPin, Phone, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { inquiryService } from '../lib/services/inquiries';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import emailjs from '@emailjs/browser';
import { CustomSelect } from '../components/ui/CustomSelect';
import { getLocalizedField } from '../lib/localize';
import SocialIcon from '../components/ui/SocialIcon';

export default function Contact() {
  const { settings } = useSettingsStore();
  const { t, isRTL, language } = useLanguageStore();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [selectedSubject, setSelectedSubject] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      status: 'new' as const
    };

    try {
      // 1. Save to Firebase Database
      await inquiryService.add(data);

      // 2. Send via EmailJS (if configured)
      const env = (import.meta as unknown as { env: Record<string, string> }).env || {};
      const serviceId = env.VITE_EMAILJS_SERVICE_ID;
      const templateId = env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.sendForm(serviceId, templateId, form, publicKey);
      } else {
        console.warn('EmailJS is not configured. Saved to Firebase only.');
      }

      setFormState('success');
      setTimeout(() => setFormState('idle'), 5000);
      form.reset();
    } catch (err) {
      console.error('Error sending message:', err);
      setFormState('idle');
      alert(t('contact.sendError'));
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#1c1917] flex flex-col selection:bg-amber-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('contact.title')} description={t('contact.subtitle')} />
      <Navbar />
      
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 border border-black/10 text-black text-xs font-mono uppercase tracking-widest mb-6">
              <StudioBadgeIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('contact.badge')}</span>
            </div>
            <div className="mb-6 h-[48px] md:h-[68px]">
              <FoldText
                text={t('contact.title')}
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
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
            {/* Contact Info (Left) */}
            <div className="lg:col-span-4 flex flex-col gap-12">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400 mb-6 border-b border-[#E0D7C9] pb-4">{t('contact.detailsTitle')}</h3>
                <ul className="space-y-8">
                  <li className="flex items-start gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-[#FCFAF7] border border-[#E0D7C9] flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">{t('contact.email')}</span>
                      <a href={`mailto:${settings?.contactEmail || 'info@alyamstudio.com'}`} className="text-lg font-serif group-hover:text-amber-600 transition-colors">
                        {settings?.contactEmail || 'info@alyamstudio.com'}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-[#FCFAF7] border border-[#E0D7C9] flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">{t('contact.phone')}</span>
                      <a href={`tel:${settings?.contactPhone?.replace(/\D/g, '') || ''}`} className="text-lg font-serif group-hover:text-amber-600 transition-colors">
                        {settings?.contactPhone || '+964 770 123 4567'}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-[#FCFAF7] border border-[#E0D7C9] flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">{t('contact.studio')}</span>
                      <span className="text-lg font-serif text-black leading-snug block">
                        {getLocalizedField(settings, 'contactAddress', language) || (isRTL ? 'العراق - بغداد - الحارثية' : 'Baghdad, Iraq - Al-Harthiya')}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400 mb-6 border-b border-[#E0D7C9] pb-4">{t('contact.followUs')}</h3>
                <div className="flex flex-wrap gap-3">
                  {settings?.socialLinks && Object.entries(settings.socialLinks).map(([platform, url]) => {
                    if (!url || url === '#') return null;
                    return (
                      <a 
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E0D7C9] bg-[#FCFAF7] text-xs font-medium capitalize text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all group"
                      >
                        <SocialIcon platform={platform} className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>{platform}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contact Form (Right) */}
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="bg-[#FCFAF7] p-8 md:p-12 rounded-2xl border border-[#E0D7C9] shadow-xl shadow-[#D8CCBA]/20">
                {formState === 'success' ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-serif mb-4">{t('contact.sentSuccess')}</h3>
                    <p className="text-gray-500 font-light max-w-sm">
                      {t('contact.successText')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-xs font-mono uppercase tracking-widest text-gray-500">{t('contact.fullName')}</label>
                        <input 
                          type="text" 
                          id="name"
                          name="name"
                          required
                          className="w-full bg-transparent border-b border-gray-300 py-3 text-lg font-serif placeholder:text-gray-300 focus:outline-none focus:border-black focus:ring-0 transition-colors"
                          placeholder={t('contact.fullNamePlaceholder')}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-xs font-mono uppercase tracking-widest text-gray-500">{t('contact.emailAddress')}</label>
                        <input 
                          type="email" 
                          id="email"
                          name="email"
                          required
                          className="w-full bg-transparent border-b border-gray-300 py-3 text-lg font-serif placeholder:text-gray-300 focus:outline-none focus:border-black focus:ring-0 transition-colors"
                          placeholder={t('contact.emailPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-gray-500">{t('contact.subject')}</label>
                      <input type="hidden" name="subject" value={selectedSubject} />
                      <CustomSelect
                        value={selectedSubject}
                        onChange={setSelectedSubject}
                        placeholder={t('contact.selectSubject')}
                        options={[
                          { value: 'project', label: t('contact.subjectProject') },
                          { value: 'software', label: t('contact.subjectSoftware') },
                          { value: 'design', label: t('contact.subjectDesign') },
                          { value: 'other', label: t('contact.subjectOther') },
                        ]}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="message" className="text-xs font-mono uppercase tracking-widest text-gray-500">{t('contact.message')}</label>
                      <textarea 
                        id="message"
                        name="message"
                        required
                        rows={4}
                        className="w-full bg-transparent border-b border-gray-300 py-3 text-lg font-serif placeholder:text-gray-300 focus:outline-none focus:border-black focus:ring-0 transition-colors resize-none"
                        placeholder={t('contact.messagePlaceholder')}
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="group flex items-center justify-center gap-3 bg-black text-white px-8 py-5 rounded-full text-xs font-mono uppercase tracking-[0.2em] hover:bg-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 w-full md:w-auto md:self-start"
                    >
                      {formState === 'submitting' ? t('contact.sending') : t('contact.sendMessage')}
                      {formState !== 'submitting' && <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

