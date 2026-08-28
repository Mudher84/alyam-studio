import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguageStore } from '../stores/useLanguageStore';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  openGraphImage?: string;
  type?: string;
  jsonLd?: Record<string, any>;
  keywords?: string;
}

export default function SEO({ 
  title, 
  description, 
  canonicalUrl, 
  openGraphImage, 
  type = 'website',
  jsonLd,
  keywords
}: SEOProps) {
  const { language, isRTL } = useLanguageStore();
  const siteTitle = language === 'ar' ? 'استوديو اليم - الطباعة والتصميم والبرمجيات' : 'ALYAM Studio';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteDescription = description || (
    language === 'ar' 
      ? 'استوديو اليم المتخصص في تصميم وطباعة أغلفة الكتب، الملازم التعليمية، التطبيقات، والحلول البرمجية الفاخرة.' 
      : 'Premium web experiences, publication designs, and custom digital products.'
  );
  const defaultKeywords = language === 'ar' 
    ? 'استوديو اليم, تصميم ملازم, غلاف كتاب, طباعة العراق, تصميم أغلفة, برمجيات تعليمية, سكربتات, ملازم سادس علمي'
    : 'ALYAM Studio, Book Cover Design, Educational Booklets, Web Development, Iraq Printing';
  const activeKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const image = openGraphImage || 'https://alyamstudio.com/og-image.jpg';

  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'استوديو اليم | ALYAM Studio',
    'url': 'https://alyamstudio.com',
    'logo': 'https://alyamstudio.com/logo.png',
    'description': siteDescription,
    'sameAs': [
      'https://t.me/alyamstudio',
      'https://instagram.com/alyamstudio'
    ]
  };

  const activeJsonLd = jsonLd || defaultJsonLd;

  return (
    <Helmet>
      <html lang={language} dir={isRTL ? 'rtl' : 'ltr'} />
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={activeKeywords} />
      <meta name="robots" content="index, follow" />
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={language === 'ar' ? 'ar_IQ' : 'en_US'} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={image} />

      <script type="application/ld+json">
        {JSON.stringify(activeJsonLd)}
      </script>
    </Helmet>
  );
}


