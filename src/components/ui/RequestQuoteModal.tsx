import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertTriangle, MessageSquare, Phone, HelpCircle } from 'lucide-react';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useModalStore, QuoteModalData } from '../../stores/useModalStore';
import { inquiryService } from '../../lib/services/inquiries';
import { cn } from '../../lib/utils';

interface RequestQuoteModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialData?: QuoteModalData | null;
}

export default function RequestQuoteModal({ isOpen: propIsOpen, onClose: propOnClose, initialData }: RequestQuoteModalProps) {
  const { isRTL, t, language } = useLanguageStore();
  const { isQuoteOpen: storeIsOpen, closeQuoteModal, quoteData: storeQuoteData } = useModalStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const onClose = propOnClose || closeQuoteModal;
  const currentData = initialData || storeQuoteData;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [contactMethod, setContactMethod] = useState('واتساب');
  const [projectType, setProjectType] = useState('');
  const [subjectClass, setSubjectClass] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [colorSystem, setColorSystem] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [needsAI, setNeedsAI] = useState('لا');
  const [details, setDetails] = useState('');

  // Math Verification States
  const [mathNum1, setMathNum1] = useState(9);
  const [mathNum2, setMathNum2] = useState(0);
  const [userMathAnswer, setUserMathAnswer] = useState('');

  // Generate random math check when modal opens
  useEffect(() => {
    if (isOpen) {
      const n1 = Math.floor(Math.random() * 10);
      const n2 = Math.floor(Math.random() * 10);
      setMathNum1(n1);
      setMathNum2(n2);
      setUserMathAnswer('');
      setSuccess(false);
      setError(null);
      
      // Populate form fields with any initial data
      setName('');
      setPhone('');
      setWhatsapp('');
      setContactMethod('واتساب');
      setProjectType(currentData?.defaultCategory || '');
      setSubjectClass(currentData?.subjectClass || '');
      setPageCount('');
      setColorSystem('');
      setDeadline('');
      setBudget('');
      setNeedsAI('لا');
      setDetails(currentData?.details || (currentData?.serviceTitle ? `طلب استفسار / تسعيرة بخصوص: ${currentData.serviceTitle}` : ''));
    }
  }, [isOpen, currentData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name.trim()) {
      setError(t('quote.errorName'));
      return;
    }
    if (!phone.trim()) {
      setError(t('quote.errorPhone'));
      return;
    }
    if (!whatsapp.trim()) {
      setError(t('quote.errorWhatsapp'));
      return;
    }
    if (!projectType) {
      setError(t('quote.errorType'));
      return;
    }
    if (!pageCount.trim()) {
      setError(t('quote.errorPages'));
      return;
    }
    if (!colorSystem) {
      setError(t('quote.errorColors'));
      return;
    }
    if (!deadline) {
      setError(t('quote.errorDeadline'));
      return;
    }

    // Verify Math Answer
    const correctAnswer = mathNum1 + mathNum2;
    if (parseInt(userMathAnswer.trim(), 10) !== correctAnswer) {
      setError(t('quote.errorMath'));
      return;
    }

    setLoading(true);

    try {
      const formattedEmail = `${phone.trim()}@alyam.com`;
      const formattedSubject = t('quote.title') + ': ' + projectType;
      const formattedMessage = (isRTL ? `تفاصيل طلب التسعيرة:\n` : `Quote Request Details:\n`) +
        `- ${t('quote.nameLabel')}: ${name}\n` +
        `- ${t('quote.phoneLabel')}: ${phone}\n` +
        `- ${t('quote.whatsappLabel')}: ${whatsapp}\n` +
        `- ${t('quote.contactMethodLabel')}: ${contactMethod}\n` +
        `- ${t('quote.projectTypeLabel')}: ${projectType}\n` +
        `- ${t('quote.subjectClassLabel')}: ${subjectClass || '---'}\n` +
        `- ${t('quote.pageCountLabel')}: ${pageCount}\n` +
        `- ${t('quote.colorSystemLabel')}: ${colorSystem}\n` +
        `- ${t('quote.deadlineLabel')}: ${deadline}\n` +
        `- ${t('quote.budgetLabel')}: ${budget || '---'}\n` +
        `- ${t('quote.needsAILabel')}: ${needsAI}\n` +
        `- ${t('quote.detailsLabel')}: ${details || '---'}`;

      await inquiryService.add({
        name: name.trim(),
        email: formattedEmail,
        subject: formattedSubject,
        message: formattedMessage,
        status: 'new',
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        contactMethod,
        projectType,
        subjectClass: subjectClass.trim(),
        pageCount: pageCount.trim(),
        colorSystem,
        deadline,
        budget: budget.trim(),
        needsAI,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Error adding quote inquiry:', err);
      setError(t('quote.errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-alyam-black border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-6 bg-amber-500 rounded-full" />
            <h2 className="text-lg sm:text-xl font-bold text-amber-400 font-serif">
              {t('quote.title')}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 scrollbar-thin">
          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center text-green-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">{t('quote.successTitle')}</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                {t('quote.successDesc')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Row 1: Name and Primary Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.nameLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ali Ahmed"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/80 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.phoneLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07xxxxxxxx"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/80 transition-colors ltr text-start"
                  />
                </div>
              </div>

              {/* Row 2: WhatsApp Number and Preferred Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.whatsappLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="07xxxxxxxx"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/80 transition-colors ltr text-start"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.contactMethodLabel')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className={cn(
                      "w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/80 transition-colors appearance-none",
                      isRTL ? "bg-[position:left_12px_center]" : "bg-[position:right_12px_center]"
                    )}
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="whatsapp">{t('quote.methodWhatsapp')}</option>
                    <option value="phone">{t('quote.methodPhone')}</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Project Type and Subject & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.projectTypeLabel')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className={cn(
                      "w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/80 transition-colors appearance-none",
                      isRTL ? "bg-[position:left_12px_center]" : "bg-[position:right_12px_center]"
                    )}
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="">-- {t('common.viewAll')} --</option>
                    <option value="booklet">{t('quote.typeBooklet')}</option>
                    <option value="cover">{t('quote.typeCover')}</option>
                    <option value="presentation">{t('quote.typePresentation')}</option>
                    <option value="other">{t('quote.typeOther')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.subjectClassLabel')}
                  </label>
                  <input 
                    type="text"
                    value={subjectClass}
                    onChange={(e) => setSubjectClass(e.target.value)}
                    placeholder="e.g. Biology - 6th Grade"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/80 transition-colors"
                  />
                </div>
              </div>

              {/* Row 4: Page Count and Color System */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.pageCountLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    placeholder="40"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/80 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.colorSystemLabel')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={colorSystem}
                    onChange={(e) => setColorSystem(e.target.value)}
                    className={cn(
                      "w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/80 transition-colors appearance-none",
                      isRTL ? "bg-[position:left_12px_center]" : "bg-[position:right_12px_center]"
                    )}
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="">-- {t('common.viewAll')} --</option>
                    <option value="CMYK">{t('quote.colorPrint')}</option>
                    <option value="RGB">{t('quote.colorScreen')}</option>
                    <option value="both">{t('quote.colorBoth')}</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Deadline and Approximate Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.deadlineLabel')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={cn(
                      "w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/80 transition-colors appearance-none",
                      isRTL ? "bg-[position:left_12px_center]" : "bg-[position:right_12px_center]"
                    )}
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="">-- {t('common.viewAll')} --</option>
                    <option value="1 week">{t('quote.timeWeek')}</option>
                    <option value="2 weeks">{t('quote.time2Weeks')}</option>
                    <option value="1 month">{t('quote.timeMonth')}</option>
                    <option value="flexible">{t('quote.timeFlexible')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                    {t('quote.budgetLabel')}
                  </label>
                  <input 
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 150-200k"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/80 transition-colors"
                  />
                </div>
              </div>

              {/* Custom Radio Group: Needs AI */}
              <div>
                <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                  {t('quote.needsAILabel')} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'yes', label: t('quote.yes') },
                    { id: 'no', label: t('quote.no') },
                    { id: 'notSure', label: t('quote.notSure') }
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setNeedsAI(option.id)}
                      className={cn(
                        "py-3 px-4 rounded-xl text-xs font-medium border transition-all text-center cursor-pointer",
                        needsAI === option.id 
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold" 
                          : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea: Additional details */}
              <div>
                <label className="block text-xs font-bold text-amber-500/90 mb-1.5">
                  {t('quote.detailsLabel')}
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t('quote.detailsPlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/80 transition-colors resize-none"
                />
              </div>

              {/* Simple math verification check */}
              <div className="pt-4 border-t border-white/10">
                <label className="block text-xs font-bold text-amber-400 mb-1.5">
                  {t('quote.mathLabel', { n1: mathNum1, n2: mathNum2 })} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={userMathAnswer}
                  onChange={(e) => setUserMathAnswer(e.target.value)}
                  placeholder={t('quote.mathPlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/80 transition-colors"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-400/10 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className={cn("w-4 h-4", isRTL ? "rotate-180" : "")} />
                  <span>{loading ? t('quote.sending') : t('quote.submitBtn')}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3.5 border border-white/10 text-white hover:bg-white/5 rounded-xl text-sm transition-colors cursor-pointer text-center"
                >
                  {t('quote.cancel')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
