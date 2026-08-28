import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { translateText } from '../utils/translate';
import { useLanguageStore } from '../stores/useLanguageStore';

interface Props {
  sourceText: string;
  onTranslate: (translated: string) => void;
  className?: string;
  fromLang?: string;
  toLang?: string;
}

export function AutoTranslateButton({ sourceText, onTranslate, className = '', fromLang = 'en', toLang = 'ar' }: Props) {
  const { isRTL } = useLanguageStore();
  const [loading, setLoading] = useState(false);

  const safeText = sourceText || '';

  const handleTranslate = async () => {
    if (!safeText.trim()) return;
    setLoading(true);
    try {
      const translated = await translateText(safeText, { from: fromLang, to: toLang });
      if (translated && translated !== safeText) {
        onTranslate(translated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={loading || !safeText.trim()}
      className={`text-xs flex items-center gap-1 text-amber-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isRTL ? 'ترجمة تلقائية' : 'Auto Translate'}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {isRTL ? 'ترجمة' : 'Translate'}
    </button>
  );
}
