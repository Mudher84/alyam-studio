/**
 * ALYAM Studio Translation Service
 * 
 * This service handles on-the-fly translation for dynamic content
 * using the free MyMemory Translation API with client-side fallback.
 */

export interface TranslationOptions {
  from?: string;
  to: string;
}

// In-memory cache for translations to avoid redundant API calls
export const translationCache = new Map<string, string>();

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';
const TIMEOUT_MS = 5000;

function transliterateArabicToEnglish(str: string): string {
  const map: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ب': 'b', 'ت': 't', 'ث': 'th',
    'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': "'",
    'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a', 'ء': "'",
    'محمد': 'Mohammed', 'أحمد': 'Ahmed', 'علي': 'Ali', 'حسين': 'Hussein',
    'حسن': 'Hassan', 'إبراهيم': 'Ibrahim', 'فاطمة': 'Fatima', 'زينب': 'Zainab',
    'مريم': 'Maryam', 'سارة': 'Sara', 'الهاشمي': 'Al-Hashemi', 'البصري': 'Al-Basri',
    'الرافدين': 'Al-Rafidain', 'العبيدي': 'Al-Ubaidi', 'النجار': 'Al-Najjar',
    'النداوي': 'Al-Nadawi', 'الوائلي': 'Al-Waili', 'عادل': 'Adel',
    'الكيمياء': 'Chemistry', 'الرياضيات': 'Mathematics', 'الفيزياء': 'Physics',
    'الأحياء': 'Biology', 'الإنجليزية': 'English', 'العربية': 'Arabic',
    'التربية': 'Education', 'الإسلامية': 'Islamic'
  };

  const words = str.split(/\s+/);
  const translatedWords = words.map(word => {
    const clean = word.replace(/[^\u0600-\u06FF]/g, '');
    if (map[clean]) {
      return word.replace(clean, map[clean]);
    }
    let res = '';
    for (const char of word) {
      res += map[char] || char;
    }
    return res.charAt(0).toUpperCase() + res.slice(1);
  });
  return translatedWords.join(' ');
}

export async function translateText(text: string, options: TranslationOptions): Promise<string> {
  if (!text || !options.to) return text;
  
  const fromLang = options.from || 'en';
  const toLang = options.to;

  // If we're translating to the same language, just return the text
  if (fromLang === toLang) return text;

  // Generate cache key
  const cacheKey = `${fromLang}_${toLang}_${text}`;
  
  // Return cached result if available
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey) || text;
  }

  // Prevent multiple simultaneous requests for the same text
  const pendingKey = `pending_${cacheKey}`;
  if (translationCache.has(pendingKey)) {
    return text;
  }
  translationCache.set(pendingKey, 'true');

  let resultText = '';

  // 1. Try server-side API route first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        from: fromLang,
        to: toLang,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.translated) {
        resultText = data.translated;
      }
    }
  } catch (err) {
    // Server route unavailable (e.g. static hosting on Hostinger)
  }

  // 2. If server route failed or unavailable, try client-side MyMemory API directly
  if (!resultText) {
    try {
      const langpair = `${fromLang}|${toLang}`;
      const myMemoryUrl = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;
      
      const response = await fetch(myMemoryUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
          resultText = data.responseData.translatedText;
        }
      }
    } catch (err) {
      // MyMemory failed
    }
  }

  // 3. If still empty, fallback to original text
  if (!resultText) {
    resultText = text;
  }

  // 4. If translating Arabic to English and result still contains Arabic letters, apply phonetic transliteration
  if (fromLang === 'ar' && toLang === 'en' && /[\u0600-\u06FF]/.test(resultText)) {
    resultText = transliterateArabicToEnglish(text);
  }

  translationCache.delete(pendingKey);
  translationCache.set(cacheKey, resultText);
  return resultText;
}

/**
 * Utility to batch translate multiple strings
 */
export async function translateBatch(texts: string[], options: TranslationOptions): Promise<string[]> {
  return Promise.all(texts.map(t => translateText(t, options)));
}

