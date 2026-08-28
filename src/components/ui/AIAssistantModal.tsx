import React, { useState, useEffect } from 'react';
import { Sparkles, X, Wand2, BookOpen, Palette, Send, Loader2, Copy, Check } from 'lucide-react';
import StudioBadgeIcon from './StudioBadgeIcon';
import { cn } from '../../lib/utils';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useModalStore, AIModalData } from '../../stores/useModalStore';

interface AIAssistantModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialData?: AIModalData | null;
}

export default function AIAssistantModal({ isOpen: propIsOpen, onClose: propOnClose, initialData }: AIAssistantModalProps) {
  const { isRTL, t } = useLanguageStore();
  const { isAIOpen: storeIsOpen, closeAIModal, aiData: storeAiData } = useModalStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const onClose = propOnClose || closeAIModal;
  const currentData = initialData || storeAiData;

  const [activeTab, setActiveTab] = useState<'cover_ideas' | 'booklet_summary' | 'general'>('cover_ideas');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentData?.defaultTab) setActiveTab(currentData.defaultTab);
      if (currentData?.subject) setSubject(currentData.subject);
      if (currentData?.teacher) setTeacher(currentData.teacher);
      if (currentData?.prompt) setPrompt(currentData.prompt);
    }
  }, [isOpen, currentData]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          subject,
          teacher,
          prompt,
        }),
      });
      const data = await res.json();
      setResult(data.result || t('ai.empty'));
    } catch (err) {
      setResult(t('ai.error'));
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-2xl bg-alyam-black border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <StudioBadgeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                  {t('ai.title')}
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full uppercase tracking-wider shrink-0">
                  AI STUDIO
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{t('ai.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0 cursor-pointer"
            title={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-2 sm:p-3 bg-black/60 border-b border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-serif font-medium">
            <button
              onClick={() => setActiveTab('cover_ideas')}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all text-center cursor-pointer",
                activeTab === 'cover_ideas' 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 font-bold" 
                  : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10"
              )}
            >
              <Palette className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="truncate">{t('ai.tabCovers')}</span>
            </button>

            <button
              onClick={() => setActiveTab('booklet_summary')}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all text-center cursor-pointer",
                activeTab === 'booklet_summary' 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 font-bold" 
                  : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10"
              )}
            >
              <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="truncate">{t('ai.tabBooklets')}</span>
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all text-center cursor-pointer",
                activeTab === 'general' 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 font-bold" 
                  : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10"
              )}
            >
              <Wand2 className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="truncate">{t('ai.tabGeneral')}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <form onSubmit={handleGenerate} className="space-y-4">
            {activeTab !== 'general' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">{t('ai.subjectLabel')}</label>
                  <input 
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('ai.subjectPlaceholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">{t('ai.teacherLabel')}</label>
                  <input 
                    type="text"
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    placeholder={t('ai.teacherPlaceholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">
                {activeTab === 'general' ? t('ai.promptLabelGeneral') : t('ai.promptLabelNotes')}
              </label>
              <textarea 
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'general' ? t('ai.promptPlaceholderGeneral') : t('ai.promptPlaceholderNotes')}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <StudioBadgeIcon className="w-4 h-4 opacity-40 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest">{t('ai.thinking')}</span>
                </div>
              ) : (
                <>
                  <Send className={cn("w-4 h-4", isRTL ? "rotate-180" : "")} />
                  <span>{t('ai.generateBtn')}</span>
                </>
              )}
            </button>
          </form>

          {/* AI Output Result Box */}
          {result && (
            <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-5 space-y-3 relative group">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('ai.resultTitle')}
                </span>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-gray-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t('ai.copied') : t('ai.copy')}</span>
                </button>
              </div>

              <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
