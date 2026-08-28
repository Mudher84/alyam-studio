export interface Project {
  id: string;
  title: string;
  title_ar?: string;
  slug: string;
  description: string;
  description_ar?: string;
  category: string;
  teacher?: string;
  teacher_ar?: string;
  subject?: string;
  subject_ar?: string;
  bookName?: string;
  bookName_ar?: string;
  gradeLevel?: string;
  gradeLevel_ar?: string;
  year?: string;
  tags: string[];
  softwareUsed: string[];
  coverImage?: string;
  images: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
}

export interface ArticleRevision {
  id: string;
  articleId: string;
  content: string; // The full article HTML at the time of revision
  title: string;
  createdAt: number;
  createdBy?: string;
  note?: string;
}

export interface Article {
  id: string;
  title: string;
  title_ar?: string;
  slug: string;
  excerpt: string;
  excerpt_ar?: string;
  content: string; // HTML content from TipTap
  content_ar?: string;
  featuredImage?: string;
  gallery?: string[];
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived' | 'trash';
  publishDate?: number;
  scheduledDate?: number;
  readingTime: number; // in minutes
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  openGraphImage?: string;
  canonicalUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MediaAsset {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  extension: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  originalSize: number;
  optimizedSize?: number;
  alt: string;
  caption: string;
  title: string;
  tags: string[];
  folder: string;
  originalUrl: string;
  webpUrl?: string;
  thumbnailUrl?: string;
  blurDataURL?: string; // Dominant color or blur hash
  createdAt: number;
  updatedAt: number;
  uploadedBy?: string;
  linkedProjects: string[];
  linkedArticles: string[];
}

export interface ActivityLog {
  id: string;
  type: string; // e.g., 'project_created', 'article_published', 'login'
  timestamp: number;
  adminId: string;
  resourceType?: string; // 'project', 'article', 'media', 'system'
  resourceId?: string;
  resourceTitle?: string;
  description: string;
}

export interface AnalyticsEvent {
  id: string;
  eventType: string; // 'page_view', 'project_view', 'article_view', 'contact_click', 'search'
  timestamp: number;
  path: string;
  resourceId?: string;
  metadata?: Record<string, any>; // e.g. search query, referring url
}

export interface CmsNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: number;
  link?: string;
}


export interface Service {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  iconName: string;
  imageUrl?: string;
  features: string[];
  link: string;
  order: number;
  status: 'active' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: number;
  phone?: string;
  whatsapp?: string;
  contactMethod?: string;
  projectType?: string;
  subjectClass?: string;
  pageCount?: string;
  colorSystem?: string;
  deadline?: string;
  budget?: string;
  needsAI?: string;
}

export interface Teacher {
  id: string;
  name_ar: string;
  name_en: string;
  subject_ar?: string;
  subject_en?: string;
  bio_ar?: string;
  bio_en?: string;
  avatarUrl?: string;
  phone?: string;
  status: 'active' | 'inactive';
  order?: number;
  createdAt: number;
  updatedAt: number;
}

export interface StudioPage {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  categories: string[];
  status: 'active' | 'inactive';
  description?: string;
  description_ar?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}
