import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Twitter, Facebook, Linkedin, Maximize2, X } from 'lucide-react';
import { useArticleStore } from '../stores/useArticleStore';
import SEO from '../components/SEO';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Article } from '../types';
import { INITIAL_ARTICLES } from '../data/initialContent';
import { useLanguageStore } from '../stores/useLanguageStore';
import { getLocalizedField, useTranslationUpdate } from '../lib/localize';

export default function ArticleDetails() {
  const { slug } = useParams();
  const { fetchPublished } = useArticleStore();
  const { t, language, isRTL } = useLanguageStore();
  useTranslationUpdate();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Article[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const BackChevron = isRTL ? ChevronRight : ChevronLeft;

  useEffect(() => {
    fetchPublished().then(data => {
      const articlesList = data.length > 0 ? data : INITIAL_ARTICLES;
      const found = articlesList.find(a => a.slug === slug);
      if (found) {
        setArticle(found);
        setRelated(articlesList.filter(a => a.id !== found.id).slice(0, 3));
      }
      setLoading(false);
    }).catch(() => {
      const found = INITIAL_ARTICLES.find(a => a.slug === slug);
      if (found) {
        setArticle(found);
        setRelated(INITIAL_ARTICLES.filter(a => a.id !== found.id).slice(0, 3));
      }
      setLoading(false);
    });
  }, [slug, fetchPublished]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-24 px-6 text-center text-gray-400 font-mono text-xs uppercase tracking-widest flex flex-col items-center justify-center">
        {t('common.loading')}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F6F2EB] pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center">
        <Navbar />
        <h1 className="text-4xl font-serif text-black mb-4">{t('common.notFound')}</h1>
        <Link to="/magazine" className="text-amber-600 hover:text-black border-b border-amber-600 transition-colors pb-1 text-xs uppercase tracking-widest font-semibold">
          {t('magazine.backToMagazine')}
        </Link>
      </div>
    );
  }

  const title = getLocalizedField(article, 'title', language);
  const excerpt = getLocalizedField(article, 'excerpt', language);
  const content = getLocalizedField(article, 'content', language);

  const articleUrl = `https://alyamstudio.com/magazine/${article.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.seoTitle || title,
    "image": article.openGraphImage || article.featuredImage,
    "datePublished": new Date(article.publishDate || article.createdAt).toISOString(),
    "dateModified": new Date(article.updatedAt).toISOString(),
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "ALYAM Studio",
      "logo": {
        "@type": "ImageObject",
        "url": "https://alyamstudio.com/logo.png"
      }
    },
    "description": article.seoDescription || excerpt
  };

  return (
    <div className="min-h-screen bg-[#F6F2EB] flex flex-col text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO 
        title={article.seoTitle || title}
        description={article.seoDescription || excerpt}
        keywords={article.seoKeywords || article.tags?.join(',')}
        canonicalUrl={article.canonicalUrl || articleUrl}
        openGraphImage={article.openGraphImage || article.featuredImage}
        type="article"
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-6 mb-16 text-center">
          <Link to="/magazine" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-12">
            <BackChevron size={16} />
            <span>{t('magazine.backToMagazine')}</span>
          </Link>
          
          <div className="flex items-center justify-center gap-4 text-xs font-mono text-amber-700 mb-6 uppercase tracking-widest">
            <span>{getLocalizedField(article, 'category', language)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>{new Date(article.publishDate || article.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>{article.readingTime} {t('magazine.minRead')}</span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-serif text-black mb-6 leading-tight tracking-tight max-w-3xl mx-auto">
            {title}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            {excerpt}
          </p>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="max-w-6xl mx-auto px-6 mb-20">
            <div className="aspect-[21/9] md:aspect-[2.35/1] rounded-2xl overflow-hidden bg-gray-100 shadow-md">
              <img 
                src={article.featuredImage} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 mb-24">
          <div 
            dir="auto"
            className="prose prose-lg md:prose-xl max-w-none text-gray-800 font-light leading-relaxed prose-headings:font-serif prose-headings:text-black prose-a:text-amber-700 prose-img:rounded-xl prose-img:my-12 prose-img:w-full prose-img:object-cover"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tags & Share */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {article.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-mono">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono uppercase text-gray-500 tracking-widest">{t('magazine.share')}</span>
              <div className="flex gap-2">
                <a href={`https://twitter.com/intent/tweet?url=${articleUrl}&text=${title}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-colors">
                  <Twitter size={18} />
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-colors">
                  <Facebook size={18} />
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${articleUrl}&title=${title}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-colors">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Article Gallery */}
        {article.gallery && article.gallery.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 mb-24">
            <h2 className="text-xl font-serif text-black mb-6 border-b border-gray-100 pb-3 font-bold">
              {t('magazine.galleryTitle')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {article.gallery.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedImage(img)}
                  className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square cursor-pointer group relative shadow-xs"
                >
                  <img src={img} alt={`${title} gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 size={20} className="text-amber-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="bg-[#FCFAF7] py-24 border-t border-[#E0D7C9]">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl font-serif text-black mb-12 text-center">{t('magazine.relatedArticles')}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {related.map(rel => {
                  const relTitle = getLocalizedField(rel, 'title', language);
                  return (
                    <Link key={rel.id} to={`/magazine/${rel.slug}`} className="group block bg-[#FAF6F0] rounded-xl p-4 border border-[#E0D7C9] hover:border-amber-500 transition-colors shadow-sm">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-gray-100">
                        {rel.featuredImage && (
                          <img 
                            src={rel.featuredImage} 
                            alt={relTitle} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-amber-700 mb-2 uppercase tracking-wider">
                        <span>{getLocalizedField(rel, 'category', language)}</span>
                      </div>
                      <h3 className="text-lg font-serif text-black mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">{relTitle}</h3>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* High-Res Image Viewer Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
          <div className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center relative">
            <img 
              src={selectedImage} 
              alt="High-Res Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/5"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

