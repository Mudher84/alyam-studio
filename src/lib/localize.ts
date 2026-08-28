export function getLocalizedField<T extends Record<string, any>>(
  obj: T | null | undefined,
  field: string,
  lang: string
): string {
  if (!obj) return '';

  // Handle nested fields like 'heroText.title'
  const getNestedValue = (o: any, path: string) => {
    return path.split('.').reduce((prev, curr) => prev?.[curr], o);
  };

  const pathParts = field.split('.');
  const lastPart = pathParts.pop() || '';
  const prefix = pathParts.join('.');

  const getFieldVal = (f: string) => {
    const fullPath = prefix ? `${prefix}.${f}` : f;
    return getNestedValue(obj, fullPath) as string | undefined;
  };

  // 1. Try field-level suffix: field_lang (e.g. heroText.title_ar)
  const langVal = getFieldVal(`${lastPart}_${lang}`);
  if (langVal && langVal.trim() !== '') return langVal;

  // 2. Try object-level suffix: prefix_lang.field (e.g. heroText_ar.title)
  if (prefix) {
    const objLangPath = `${prefix}_${lang}.${lastPart}`;
    const objLangVal = getNestedValue(obj, objLangPath) as string | undefined;
    if (objLangVal && objLangVal.trim() !== '') return objLangVal;
  }

  // 3. If English is selected, return base value before falling back to Arabic
  if (lang === 'en') {
    const baseVal = getFieldVal(lastPart);
    if (baseVal && baseVal.trim() !== '') return baseVal;
  }

  // 4. Fallback to English specific fields if not already en
  if (lang !== 'en') {
    const enVal = getFieldVal(`${lastPart}_en`);
    if (enVal && enVal.trim() !== '') return enVal;
    
    if (prefix) {
      const enObjVal = getNestedValue(obj, `${prefix}_en.${lastPart}`) as string | undefined;
      if (enObjVal && enObjVal.trim() !== '') return enObjVal;
    }
  }

  // 5. Fallback to Arabic specific fields if not already ar
  if (lang !== 'ar') {
    const arVal = getFieldVal(`${lastPart}_ar`);
    if (arVal && arVal.trim() !== '') return arVal;
    
    if (prefix) {
      const arObjVal = getNestedValue(obj, `${prefix}_ar.${lastPart}`) as string | undefined;
      if (arObjVal && arObjVal.trim() !== '') return arObjVal;
    }
  }

  // 6. Base value as final resort
  const finalBaseVal = getFieldVal(lastPart);
  return finalBaseVal || '';
}

/**
 * Hook for asynchronous localization (Deprecated, but kept to avoid breaking imports).
 */
export function useTranslationUpdate() {
  // No-op
}
