export interface SiteSettings {
  id: string; // usually 'global'
  siteName: string;
  siteName_ar?: string;
  logoUrl?: string;
  faviconUrl?: string;
  adminAvatarUrl?: string;
  siteDescription: string;
  siteDescription_ar?: string;
  contactEmail: string;
  contactPhone: string;
  whatsappPhone?: string;
  contactAddress: string;
  contactAddress_ar?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
    whatsapp?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    dribbble?: string;
    behance?: string;
    tiktok?: string;
  };
  stats?: {
    bookCovers: string;
    educationalBooklets: string;
    customSystems: string;
    foundingYear: string;
  };
  seoTitleFormat: string;
  heroText: {
    title: string;
    subtitle: string;
  };
  heroText_ar?: {
    title: string;
    subtitle: string;
  };
  heroText_fr?: { title: string; subtitle: string; };
  heroText_tr?: { title: string; subtitle: string; };
  heroText_de?: { title: string; subtitle: string; };
  heroText_es?: { title: string; subtitle: string; };
  heroText_fa?: { title: string; subtitle: string; };
  heroText_ku?: { title: string; subtitle: string; };
  aboutText: {
    title: string;
    content: string;
  };
  aboutText_ar?: {
    title: string;
    content: string;
  };
  aboutText_fr?: { title: string; content: string; };
  aboutText_tr?: { title: string; content: string; };
  aboutText_de?: { title: string; content: string; };
  aboutText_es?: { title: string; content: string; };
  aboutText_fa?: { title: string; content: string; };
  aboutText_ku?: { title: string; content: string; };
  aboutSkills?: {
    name: string;
    name_ar?: string;
    percent: number;
  }[];
  aboutExperience?: {
    year: string;
    title: string;
    title_ar?: string;
    desc: string;
    desc_ar?: string;
  }[];
  footerText: string;
  footerText_ar?: string;
  privacyContent?: string;
  privacyContent_ar?: string;
  termsContent?: string;
  termsContent_ar?: string;
  updatedAt: number;
  homeSections?: { id: string; type: string; isVisible: boolean; order: number }[];
  settingsTabs?: { id: string; order: number }[];
  sidebarOrder?: { id: string; order: number }[];
}
