import { create } from 'zustand';
import i18n from '../i18n';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'fa', name: 'فارسی', dir: 'rtl' },
  { code: 'ku', name: 'Kurdî', dir: 'rtl' }
] as const;

export type Language = typeof SUPPORTED_LANGUAGES[number]['code'];

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, options?: any) => string;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const applyLanguageToDOM = (langCode: Language) => {
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  const dir = langConfig?.dir || 'ltr';
  
  document.documentElement.lang = langCode;
  document.documentElement.dir = dir;
  
  if (dir === 'rtl') {
    document.documentElement.classList.add('rtl-mode');
  } else {
    document.documentElement.classList.remove('rtl-mode');
  }
};

// Initial setup
const savedLang = localStorage.getItem('alyam_lang') as Language;
const initialLang = savedLang || (i18n.language?.split('-')[0] as Language) || 'en';
applyLanguageToDOM(initialLang);

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: initialLang,
  isRTL: SUPPORTED_LANGUAGES.find(l => l.code === initialLang)?.dir === 'rtl',
  supportedLanguages: SUPPORTED_LANGUAGES,

  setLanguage: (lang: Language) => {
    i18n.changeLanguage(lang);
    applyLanguageToDOM(lang);
    set({ 
      language: lang, 
      isRTL: SUPPORTED_LANGUAGES.find(l => l.code === lang)?.dir === 'rtl' 
    });
    localStorage.setItem('alyam_lang', lang);
  },

  toggleLanguage: () => {
    // Cycle through languages
    const currentIdx = get().supportedLanguages.findIndex(l => l.code === get().language);
    const nextIdx = (currentIdx + 1) % get().supportedLanguages.length;
    get().setLanguage(get().supportedLanguages[nextIdx].code);
  },

  t: (key: string, options?: any) => {
    return i18n.t(key, options) as string;
  }
}));
