import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import i18n from '../i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEducationalCategory(category?: string): boolean {
  if (!category) return false;
  const cat = category.toLowerCase();
  return (
    cat.includes('booklet') ||
    cat.includes('cover') ||
    cat.includes('educational') ||
    cat.includes('ملزمة') ||
    cat.includes('ملازم') ||
    cat.includes('غلاف') ||
    cat.includes('أغلفة') ||
    cat.includes('تعليمي') ||
    cat.includes('كتاب') ||
    cat.includes('كتب')
  );
}

export function getAuthorLabel(category?: string): string {
  if (isEducationalCategory(category)) {
    return i18n.t('portfolio.teacherLabel');
  }
  return i18n.t('portfolio.byLabel');
}

export function getSubjectLabel(category?: string): string {
  if (isEducationalCategory(category)) {
    return i18n.t('portfolio.subjectLabel');
  }
  return i18n.t('portfolio.fieldLabel');
}

export function getCategoryLabel(category?: string): string {
  if (!category) return '';
  const cat = category.toLowerCase();
  
  if (cat.includes('booklet') || cat.includes('ملزم')) return i18n.t('portfolio.catBooklet');
  if (cat.includes('educational cover') || (cat.includes('غلاف') && cat.includes('تعليمي'))) return i18n.t('portfolio.catEduCover');
  if (cat.includes('book cover') || cat.includes('غلاف كتاب')) return i18n.t('portfolio.catBookCover');
  if (cat.includes('software') || cat.includes('برمجيات')) return i18n.t('portfolio.catSoftware');
  if (cat.includes('app') || cat.includes('تطبيق')) return i18n.t('portfolio.catApps');
  if (cat.includes('website') || cat.includes('موقع')) return i18n.t('portfolio.catWeb');
  if (cat.includes('branding') || cat.includes('هوية')) return i18n.t('portfolio.catBranding');
  if (cat.includes('cover')) return i18n.t('portfolio.catCovers');
  
  return category;
}
