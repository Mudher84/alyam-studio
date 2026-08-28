import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SiteSettings } from '../../types/settings';

const DOC_ID = 'global';
const COLLECTION_NAME = 'settings';

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 'global',
  siteName: 'ALYAM Studio',
  siteName_ar: 'استوديو اليم',
  logoUrl: '',
  faviconUrl: '',
  adminAvatarUrl: '',
  siteDescription: 'Premium digital experiences, high-grade educational publishing, branding, and software engineering.',
  siteDescription_ar: 'استوديو متخصص في نشر المناهج وتصميم الأغلفة والملازم والحلول البرمجية المتكاملة في العراق.',
  contactEmail: 'info@alyamstudio.com',
  contactPhone: '+964 770 123 4567',
  whatsappPhone: '+9647701234567',
  contactAddress: 'Baghdad, Iraq - Al-Mutanabbi / Al-Harthiya',
  contactAddress_ar: 'العراق - بغداد - شارع المتنبي / الحارثية',
  socialLinks: {
    facebook: 'https://facebook.com/alyamstudio',
    instagram: 'https://instagram.com/alyamstudio',
    telegram: 'https://t.me/alyamstudio',
    whatsapp: 'https://wa.me/9647701234567',
    youtube: 'https://youtube.com/@alyamstudio',
    twitter: '#',
    linkedin: '#',
    dribbble: '#',
    behance: '#'
  },
  stats: {
    bookCovers: '400+',
    educationalBooklets: '150+',
    customSystems: '50+',
    foundingYear: '2013'
  },
  seoTitleFormat: '%s | ALYAM Studio - استوديو اليم',
  heroText: {
    title: 'Educational Publishing &\nCustom Digital Systems',
    subtitle: 'Specialized in curriculum design, editorial book covers, and high-performance software engineering.'
  },
  heroText_ar: {
    title: 'النشر التعليمي و\nالأنظمة الرقمية المخصصة',
    subtitle: 'متخصصون في إخراج المناهج التعليمية، أغلفة الكتب التحريرية، وهندسة البرمجيات والتطبيقات عالية الأداء.'
  },
  heroText_fr: {
    title: 'Édition Éducative &\nSystèmes Numériques Personnalisés',
    subtitle: 'Spécialisé dans la conception de programmes, les couvertures de livres éditoriaux et l\'ingénierie logicielle haute performance.'
  },
  heroText_tr: {
    title: 'Eğitim Yayıncılığı &\nÖzel Dijital Sistemler',
    subtitle: 'Müfredat tasarımı, editoryal kitap kapakları ve yüksek performanslı yazılım mühendisliği konularında uzmanlaşmıştır.'
  },
  heroText_de: {
    title: 'Bildungsverlag &\nKundenspezifische Digitale Systeme',
    subtitle: 'Spezialisiert auf Lehrplangestaltung, redaktionelle Buchcover und Hochleistungs-Softwareentwicklung.'
  },
  heroText_es: {
    title: 'Edición Educativa &\nSistemas Digitales Personalizados',
    subtitle: 'Especializado en diseño curricular, portadas de libros editoriales e ingeniería de software de alto rendimiento.'
  },
  heroText_fa: {
    title: 'نشر آموزشی و\nسیستم‌های دیجیتال سفارشی',
    subtitle: 'متخصص در طراحی برنامه درسی، جلدهای کتاب تحریریه و مهندسی نرم‌افزار با کارایی بالا.'
  },
  heroText_ku: {
    title: 'وەشانکردنی پەروەردەیی و\nسیستمە دیجیتاڵییە تایبەتەکان',
    subtitle: 'پسپۆڕە لە دیزاینی پرۆگرامی خوێندن، بەرگی کتێبی سەروتار و ئەندازیاری نەرمەکاڵا بە کارایی بەرز.'
  },
  aboutText: {
    title: 'About ALYAM Studio',
    content: 'Founded in 2013 in Iraq, ALYAM Studio is a multi-disciplinary creative practice bridging the worlds of high-grade educational publishing, editorial design, and custom software engineering.'
  },
  aboutText_ar: {
    title: 'عن استوديو اليم',
    content: 'تأسس استوديو اليم في عام 2013 في العراق، وهو ممارسة إبداعية متعددة التخصصات تجمع بين النشر التعليمي عالي المستوى، والتصميم التحريري، وهندسة البرمجيات المخصصة.'
  },
  aboutText_fr: {
    title: 'À propos d\'ALYAM Studio',
    content: 'Fondé en 2013 en Irak, ALYAM Studio est une pratique créative multidisciplinaire faisant le pont entre les mondes de l\'édition éducative de haut niveau, de la conception éditoriale et de l\'ingénierie logicielle personnalisée.'
  },
  aboutText_tr: {
    title: 'ALYAM Studio Hakkında',
    content: '2013 yılında Irak\'ta kurulan ALYAM Studio, üst düzey eğitim yayıncılığı, editoryal tasarım ve özel yazılım mühendisliği dünyalarını birleştiren çok disiplinli bir yaratıcı uygulamadır.'
  },
  aboutText_de: {
    title: 'Über ALYAM Studio',
    content: 'ALYAM Studio wurde 2013 im Irak gegründet und ist eine multidisziplinäre Kreativpraxis, die die Welten des hochwertigen Bildungsverlags, des redaktionellen Designs und der kundenspezifischen Softwareentwicklung schlägt.'
  },
  aboutText_es: {
    title: 'Sobre ALYAM Studio',
    content: 'Fundado en 2013 en Irak, ALYAM Studio es una práctica creativa multidisciplinaria que une los mundos de la edición educativa de alto nivel, el diseño editorial y la ingeniería de software personalizada.'
  },
  aboutText_fa: {
    title: 'درباره استوديو اليم',
    content: 'استودیو الیم که در سال ۲۰۱۳ در عراق تأسیس شد، یک مرکز خلاق چند رشته‌ای است که دنیای نشر آموزشی با کیفیت بالا، طراحی تحریریه و مهندسی نرم‌افزار سفارشي را به هم پیوند می‌دهد.'
  },
  aboutText_ku: {
    title: 'دەربارەی ستۆدیۆی ئەلیەم',
    content: 'ستۆدیۆی ئەلیەم لە ساڵی ٢٠١٣ لە عێراق دامەزراوە، پراکتیزەیەکی داهێنەرانەی فرە پسپۆڕییە کە جیهانەکانی وەشانکردنی پەروەردەیی ئاست بەرز، دیزاینی سەروتار و ئەندازیاری نەرمەکاڵای تایبەت بەیەکەوە دەبەستێتەوە.'
  },
  aboutSkills: [
    { name: 'Bespoke Book Covers & Graphic Artistry', name_ar: 'تصميم الأغلفة الفنية وإخراج الكتب الإبداعي', percent: 95 },
    { name: 'Curriculum, Academic Publishing & Booklets', name_ar: 'إعداد وتصميم المناهج والملازم التعليمية المتكاملة', percent: 98 },
    { name: 'Full-Stack Custom ERP & Web Development', name_ar: 'تطوير الأنظمة السحابية المخصصة ولوحات التحكم (ERP)', percent: 90 },
    { name: 'Visual Branding & Corporate Identities', name_ar: 'بناء الهويات البصرية والعلامات التجارية الراقية', percent: 88 }
  ],
  aboutExperience: [
    { year: '2013', title: 'Founding ALYAM Studio', title_ar: 'تأسيس استوديو اليم', desc: 'Established in Baghdad to provide premium book and booklet design services for elite educators.', desc_ar: 'تأسس الاستوديو في بغداد لتقديم خدمات تصميم الأغلفة والملازم الفاخرة للأساتذة والمدارس المتميزة.' },
    { year: '2018', title: 'Publishing Pre-press Automation', title_ar: 'أتمتة خطوط النشر والطباعة', desc: 'Introduced modern high-speed printing integrations, custom typography, and complete book manufacturing.', desc_ar: 'إدخال تقنيات فرز الألوان والطباعة الرقمية الحديثة لإنتاج وتجليد الكتب والملازم بأعلى كفاءة.' },
    { year: '2022', title: 'The Software Division Launch', title_ar: 'إطلاق قسم البرمجيات والأنظمة', desc: 'Formed a dedicated engineering team for custom ERP, web dashboards, and business management apps.', desc_ar: 'تأسيس فريق هندسي متخصص لتطوير أنظمة إدارة الأعمال، المحاسبة، ومواقع الويب المتطورة.' },
    { year: '2026', title: 'AI & Advanced Cloud Systems', title_ar: 'الأنظمة السحابية والذكاء الاصطناعي', desc: 'Integrating real-time generative capabilities, cloud-synced platforms, and hybrid systems for modern learning.', desc_ar: 'دمج حلول الذكاء الاصطناعي التوليدي، اللوحات السحابية الفورية، والتقنيات التفاعلية لدعم الأساتذة.' }
  ],
  footerText: '© 2026 ALYAM Studio. All rights reserved.',
  footerText_ar: '© 2026 استوديو اليم. جميع الحقوق محفوظة.',
  privacyContent: 'When you visit our website, submit inquiries via contact forms, or interact with our services, we may collect minimal personal information such as your name, email address, phone number, and project inquiry details to facilitate communication.\n\nThe information we collect is strictly utilized for client communication, project scoping, technical consultations, and providing customer support. We do not sell, rent, or share personal data with unauthorized third parties.\n\nWe implement industry-standard administrative, physical, and technical security measures to protect your personal data from loss, unauthorized access, disclosure, or alteration.\n\nOur website uses basic essential cookies to enhance session management, remember language preferences, and ensure optimal user performance.',
  privacyContent_ar: 'عند زيارتك لموقعنا، أو تقديم استفسارات عبر نماذج الاتصال، أو التفاعل مع خدماتنا، قد نجمع معلومات شخصية محدودة مثل اسمك، بريدك الإلكتروني، رقم هاتفك، وتفاصيل استفسار مشروعك لتسهيل التواصل.\n\nتُستخدم المعلومات التي نجمعها بشكل صارم للتواصل مع العملاء، وتحديد نطاق المشاريع، والاستشارات الفنية، وتقديم دعم العملاء. نحن لا نبيع أو نؤجر أو نشارك البيانات الشخصية مع أطراف ثالثة غير مصرح لها.\n\nنحن نطبق تدابير أمنية إدارية ومادية وتقنية متوافقة مع معايير الصناعة لحماية بياناتك الشخصية من الفقدان أو الوصول غير المصرح به أو الكشف عنها أو تغييرها.\n\nيستخدم موقعنا ملفات تعريف الارتباط الأساسية لتعزيز إدارة الجلسات، وتذكر تفضيلات اللغة، وضمان الأداء الأمثل للمستخدم.',
  termsContent: 'All materials on ALYAM Studio, including book cover designs, educational booklet layouts, software systems, source code, visual branding assets, typography, and site media, are the intellectual property of ALYAM Studio and protected by copyright laws unless otherwise agreed upon in client contracts.\n\nAll custom design, publishing pre-press, or bespoke software engineering contracts are governed by specific client proposals and scope agreements signed prior to project execution.\n\nALYAM Studio strives to provide error-free software systems and high-resolution print-ready files. However, users and clients are required to review proofing copies prior to final printing or production deployment.',
  termsContent_ar: 'جميع المواد الموجودة على استوديو اليم، بما في ذلك تصاميم أغلفة الكتب، وتنسيقات الملازم التعليمية، وأنظمة البرمجيات، والشيفرة المصدرية، وأصول الهوية البصرية، والخطوط، ووسائط الموقع، هي ملكية فكرية لاستوديو اليم ومحمية بموجب قوانين حقوق النشر ما لم يتم الاتفاق على خلاف ذلك في عقود العملاء.\n\nتخضع جميع عقود التصميم المخصص، أو النشر قبل الطباعة، أو هندسة البرمجيات المخصصة لمقترحات العملاء المحددة واتفاقيات النطاق الموقعة قبل تنفيذ المشروع.\n\nيسعى استوديو اليم لتوفير أنظمة برمجية خالية من الأخطاء وملفات جاهزة للطباعة عالية الدقة. ومع ذلك، يُطلب من المستخدمين والعملاء مراجعة نسخ التدقيق قبل الطباعة النهائية أو النشر الإنتاجي.',
  updatedAt: Date.now(),
  homeSections: [
    { id: 'covers', type: 'covers', isVisible: true, order: 0 },
    { id: 'booklets', type: 'booklets', isVisible: true, order: 1 },
    { id: 'digital', type: 'digital', isVisible: true, order: 2 },
    { id: 'gallery', type: 'gallery', isVisible: true, order: 3 },
    { id: 'services', type: 'services', isVisible: true, order: 4 },
    { id: 'experience', type: 'experience', isVisible: true, order: 5 },
    { id: 'about', type: 'about', isVisible: true, order: 6 },
  ],
  settingsTabs: [
    { id: 'general', order: 0 },
    { id: 'contact', order: 1 },
    { id: 'stats', order: 2 },
    { id: 'content', order: 3 },
    { id: 'appearance', order: 4 },
    { id: 'social', order: 5 },
    { id: 'home', order: 6 },
  ],
  sidebarOrder: [
    { id: 'dashboard', order: 0 },
    { id: 'pages-cms', order: 1 },
    { id: 'home-cms', order: 2 },
    { id: 'about-cms', order: 3 },
    { id: 'services-cms', order: 4 },
    { id: 'portfolio-cms', order: 5 },
    { id: 'covers-cms', order: 6 },
    { id: 'booklets-cms', order: 7 },
    { id: 'websites-cms', order: 8 },
    { id: 'software-cms', order: 9 },
    { id: 'apps-cms', order: 10 },
    { id: 'magazine-cms', order: 11 },
    { id: 'teachers-cms', order: 12 },
    { id: 'terms-cms', order: 13 },
    { id: 'messages', order: 14 },
    { id: 'media', order: 15 },
    { id: 'activity', order: 16 },
    { id: 'health', order: 17 },
    { id: 'settings', order: 18 },
  ]
};

export const settingsService = {
  async getSettings(): Promise<SiteSettings> {
    const ref = doc(db, COLLECTION_NAME, DOC_ID);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      return { 
        ...DEFAULT_SETTINGS, 
        id: snapshot.id, 
        ...snapshot.data(), 
        homeSections: snapshot.data().homeSections || DEFAULT_SETTINGS.homeSections,
        settingsTabs: snapshot.data().settingsTabs || DEFAULT_SETTINGS.settingsTabs,
        sidebarOrder: snapshot.data().sidebarOrder || DEFAULT_SETTINGS.sidebarOrder
      } as SiteSettings;
    }
    // Return default settings if none exist
    return DEFAULT_SETTINGS;
  },

  async updateSettings(data: Partial<SiteSettings>): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, DOC_ID);
    await setDoc(ref, { ...data, updatedAt: Date.now() }, { merge: true });
  }
};
