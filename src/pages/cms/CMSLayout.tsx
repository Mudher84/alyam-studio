import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileImage, FileText, Settings, LogOut, Image, 
  Activity, Server, Bell, Search, Menu, X, User, Briefcase, MessageSquare, Globe,
  Home, BookOpen, BookMarked, Code, Cpu, Info, ShieldCheck, GraduationCap, Smartphone,
  GripVertical
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Reorder, motion, AnimatePresence } from 'motion/react';
import Dashboard from './Dashboard';
import Projects from './Projects';
import Articles from './Articles';
import MediaLibrary from './MediaLibrary';
import CommandPalette from '../../components/cms/CommandPalette';
import ActivityLogs from './ActivityLogs';
import SystemHealth from './SystemHealth';
import SettingsPage from './Settings';
import ServicesCMS from './Services';
import InquiriesCMS from './Inquiries';
import HomePageCMS from './HomePageCMS';
import AboutPageCMS from './AboutPageCMS';
import LegalPagesCMS from './LegalPagesCMS';
import TeachersCMS from './Teachers';
import PagesCMS from './PagesCMS';
import StudioBadgeIcon from '../../components/ui/StudioBadgeIcon';

export default function CMSLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage, supportedLanguages, isRTL } = useLanguageStore();
  const { user, isAdmin, loading, logout, initialized } = useAuthStore();
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setLanguageMenuOpen(false);
      setShowNotifications(false);
      setShowProfileMenu(false);
    };
    if (languageMenuOpen || showNotifications || showProfileMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [languageMenuOpen, showNotifications, showProfileMenu]);

  useEffect(() => {
    if (initialized && !loading && (!user || !isAdmin)) {
      navigate('/login', { replace: true });
    }
  }, [user, isAdmin, loading, initialized, navigate]);

  const notifications = [
    {
      id: 1,
      title: isRTL ? 'استفسار جديد من عميل' : 'New inquiry received',
      desc: isRTL ? 'تم استلام طلب جديد لتصميم غلاف كتاب تعليمي.' : 'New request for educational cover design.',
      time: isRTL ? 'منذ 5 دقائق' : '5m ago',
      type: 'inquiry',
      read: false,
    },
    {
      id: 2,
      title: isRTL ? 'تحديث محتوى المنصة' : 'Platform content update',
      desc: isRTL ? 'تم حفظ التعديلات الجديدة في إعدادات النظام بنجاح.' : 'System settings updated successfully.',
      time: isRTL ? 'منذ ساعة' : '1h ago',
      type: 'system',
      read: false,
    },
    {
      id: 3,
      title: isRTL ? 'سجل النشاطات والأعمال' : 'Activity log entry',
      desc: isRTL ? 'تم إضافة مشروع جديد في قسم المعرض والأعمال.' : 'New project item added to portfolio.',
      time: isRTL ? 'منذ 3 ساعات' : '3h ago',
      type: 'activity',
      read: false,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu & dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  // Sidebar Items Metadata
  const allNavItems = {
    'section:overview': { id: 'section:overview', name: t('cms.overview'), type: 'section' },
    dashboard: { id: 'dashboard', name: t('cms.dashboard'), path: '/cms', icon: LayoutDashboard, group: 'overview' },
    'section:content': { id: 'section:content', name: t('cms.pages'), type: 'section' },
    'pages-cms': { id: 'pages-cms', name: t('cms.pages'), path: '/cms/pages', icon: Globe, group: 'content' },
    'home-cms': { id: 'home-cms', name: t('cms.homePage'), path: '/cms/home-page', icon: Home, group: 'content' },
    'about-cms': { id: 'about-cms', name: t('cms.aboutPage'), path: '/cms/about-page', icon: Info, group: 'content' },
    'services-cms': { id: 'services-cms', name: t('cms.services'), path: '/cms/services', icon: Briefcase, group: 'content' },
    'portfolio-cms': { id: 'portfolio-cms', name: t('cms.projects'), path: '/cms/projects', icon: FileImage, group: 'content' },
    'covers-cms': { id: 'covers-cms', name: t('cms.covers'), path: '/cms/covers', icon: BookOpen, group: 'content' },
    'booklets-cms': { id: 'booklets-cms', name: t('cms.booklets'), path: '/cms/booklets', icon: BookMarked, group: 'content' },
    'websites-cms': { id: 'websites-cms', name: t('cms.scripts'), path: '/cms/scripts', icon: Code, group: 'content' },
    'software-cms': { id: 'software-cms', name: t('cms.software'), path: '/cms/software', icon: Cpu, group: 'content' },
    'apps-cms': { id: 'apps-cms', name: t('cms.apps'), path: '/cms/apps', icon: Smartphone, group: 'content' },
    'magazine-cms': { id: 'magazine-cms', name: t('cms.articles'), path: '/cms/articles', icon: FileText, group: 'content' },
    'teachers-cms': { id: 'teachers-cms', name: t('cms.teachers'), path: '/cms/teachers', icon: GraduationCap, group: 'content' },
    'terms-cms': { id: 'terms-cms', name: t('cms.legalPages'), path: '/cms/legal-pages', icon: ShieldCheck, group: 'content' },
    'section:contact': { id: 'section:contact', name: t('cms.pagesAndContact'), type: 'section' },
    messages: { id: 'messages', name: t('cms.inquiries'), path: '/cms/inquiries', icon: MessageSquare, group: 'contact' },
    'section:system': { id: 'section:system', name: t('cms.system'), type: 'section' },
    media: { id: 'media', name: t('cms.media'), path: '/cms/media', icon: Image, group: 'system' },
    activity: { id: 'activity', name: t('cms.activity'), path: '/cms/activity', icon: Activity, group: 'system' },
    health: { id: 'health', name: t('cms.health'), path: '/cms/system', icon: Server, group: 'system' },
    settings: { id: 'settings', name: t('cms.settings'), path: '/cms/settings', icon: Settings, group: 'system' },
  } as Record<string, any>;

  const [orderedItemIds, setOrderedItemIds] = useState<string[]>([]);

  useEffect(() => {
    const defaultOrder = Object.keys(allNavItems);
    if (settings.sidebarOrder && settings.sidebarOrder.length > 0) {
      const savedIds = [...settings.sidebarOrder].sort((a, b) => a.order - b.order).map(o => o.id);
      // Merge with default items in case some are missing
      const merged = [...savedIds, ...defaultOrder.filter(id => !savedIds.includes(id))];
      setOrderedItemIds(merged.filter(id => allNavItems[id]));
    } else {
      setOrderedItemIds(defaultOrder);
    }
  }, [settings.sidebarOrder, language, t]);

  const handleReorder = async (newIds: string[]) => {
    setOrderedItemIds(newIds);
    const sidebarOrder = newIds.map((id, index) => ({ id, order: index }));
    try {
      await updateSettings({ sidebarOrder });
    } catch (err) {
      console.error('Failed to save sidebar order:', err);
    }
  };

  const currentRouteName = Object.values(allNavItems).find((i: any) => 
    i.path === '/cms' ? location.pathname === '/cms' : location.pathname.startsWith(i.path)
  )?.name || t('cms.dashboard');

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <StudioBadgeIcon className="w-12 h-12 opacity-20" />
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-300">System Initializing</p>
        </motion.div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Dropdown Overlay Backdrop */}
      {(showNotifications || showProfileMenu) && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }} 
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-[#FCFAF7] border-r border-[#E0D7C9] flex flex-col fixed inset-y-0 z-30 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
        isRTL ? "right-0 border-l border-r-0" : "left-0 border-r",
        mobileMenuOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
      )}>
        <div className="h-16 border-b border-[#E0D7C9] flex items-center justify-between px-6 shrink-0">
          <div>
            <Link to="/" className="text-xl font-serif font-bold text-black tracking-wider block" dir="ltr" style={{ unicodeBidi: 'isolate', display: 'inline-block' }}>
              AL<span className="text-amber-400">.</span>YAM <span className="text-amber-500 font-normal">STUDIO</span>
            </Link>
          </div>
          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-black rounded-full hover:bg-[#F6F2EB] -mr-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 shrink-0">
          <button 
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center justify-center relative px-3 py-2.5 bg-[#F6F2EB] hover:bg-[#FAF6F0] border border-[#E0D7C9] rounded-xl text-sm text-gray-600 transition-colors"
          >
            <span className="flex items-center gap-2"><Search size={16} /> {t('cms.search')}</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-[#FCFAF7] px-1.5 py-0.5 rounded border border-[#E0D7C9] shadow-sm text-gray-500 hidden sm:block">⌘K</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <Reorder.Group axis="y" values={orderedItemIds} onReorder={handleReorder} className="space-y-1.5">
            {orderedItemIds.map((itemId) => {
              const item = allNavItems[itemId];
              if (!item) return null;

              if (item.type === 'section') {
                return (
                  <Reorder.Item
                    key={item.id}
                    value={item.id}
                    className="pt-6 pb-2 first:pt-0 cursor-grab active:cursor-grabbing group/section relative"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <GripVertical size={12} className={cn("text-gray-300 opacity-0 group-hover/section:opacity-100 transition-opacity absolute", isRTL ? "right-2" : "left-2")} />
                      <h3 className="px-3 text-xs font-mono uppercase tracking-[0.2em] text-gray-400 text-center select-none">
                        {item.name}
                      </h3>
                    </div>
                  </Reorder.Item>
                );
              }

              const isActive = location.pathname === item.path || (item.path !== '/cms' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Reorder.Item
                  key={item.id}
                  value={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="relative group/item"
                >
                  <div className="flex items-center gap-1">
                    <div className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                      <GripVertical size={14} />
                    </div>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex-1 flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                        isActive 
                          ? "bg-black text-white shadow-md transform scale-[1.02] z-10" 
                          : "bg-[#F6F2EB]/60 border border-[#E0D7C9]/80 text-gray-600 hover:bg-[#F6F2EB] hover:text-black hover:border-[#E0D7C9]"
                      )}
                    >
                      <span className={cn("absolute flex items-center", isRTL ? "right-4" : "left-4")}>
                        <Icon size={18} className={cn(isActive ? "text-amber-400" : "text-gray-500 group-hover/item:text-amber-600 transition-colors")} />
                      </span>
                      <span className={cn("flex-1 truncate", isRTL ? "pr-8 text-right" : "pl-8 text-left")}>
                        {item.name}
                      </span>
                      {isActive && (
                        <div className={cn("absolute w-1 h-5 bg-amber-500 rounded-full", isRTL ? "left-0" : "right-0")} />
                      )}
                    </Link>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </nav>

        <div className="p-4 border-t border-[#E0D7C9] shrink-0">
          <button 
            onClick={async () => {
              try {
                await logout();
                navigate('/login', { replace: true });
              } catch (err) {
                console.error('Logout error:', err);
              }
            }}
            className="flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-[#F6F2EB] border border-[#E0D7C9] text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 w-full transition-all"
          >
            <LogOut size={18} />
            {t('cms.exit')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F6F2EB]">
        {/* Top Header */}
        <header className="h-16 bg-[#FCFAF7] border-b border-[#E0D7C9] flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-600 hover:text-black rounded-lg hover:bg-[#F6F2EB]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-serif font-medium text-black hidden sm:block">
              {currentRouteName}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLanguageMenuOpen(!languageMenuOpen);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D7C9] text-xs font-medium text-gray-700 bg-[#F6F2EB] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                title={t('common.language') || 'Language'}
              >
                <Globe size={14} className="text-amber-500" />
                <span>{supportedLanguages.find(l => l.code === language)?.name || 'Language'}</span>
              </button>

              {languageMenuOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "absolute top-full mt-2 w-40 max-w-[calc(100vw-2rem)] bg-[#FCFAF7] rounded-xl shadow-xl border border-[#E0D7C9] overflow-hidden z-50",
                    isRTL ? "left-2 sm:left-4" : "right-0"
                  )}
                >
                  <div className="py-1">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLanguageMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-start px-4 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer",
                          language === lang.code 
                            ? "bg-amber-50 text-amber-800 font-medium" 
                            : "text-gray-700 hover:bg-[#F6F2EB] hover:text-amber-700"
                        )}
                      >
                        {lang.name}
                        {language === lang.code && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                  setLanguageMenuOpen(false);
                }}
                className={cn(
                  "relative p-2 transition-colors rounded-full cursor-pointer",
                  showNotifications ? "bg-amber-500/10 text-amber-600" : "text-gray-500 hover:text-black hover:bg-[#F6F2EB]"
                )}
                title={isRTL ? 'الإشعارات والتنبيهات' : 'Notifications'}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border-2 border-[#FCFAF7]"></span>
                  </span>
                )}
              </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={cn(
                    "absolute top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-[#FCFAF7] rounded-2xl shadow-2xl border border-[#E0D7C9] py-3 z-50",
                    isRTL ? "left-2 sm:left-4" : "right-0 sm:-right-2"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-[#E0D7C9]">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-amber-500" />
                      <span className="font-semibold text-xs text-gray-900">
                        {isRTL ? 'الإشعارات والتنبيهات' : 'Notifications'}
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => setUnreadCount(0)}
                        className="text-[11px] text-amber-600 hover:underline font-medium cursor-pointer"
                      >
                        {isRTL ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <Link 
                        key={n.id} 
                        to={n.type === 'inquiry' ? '/cms/inquiries' : n.type === 'system' ? '/cms/system' : '/cms/activity'}
                        onClick={() => setShowNotifications(false)}
                        className={cn(
                          "p-3.5 hover:bg-gray-50/80 transition-colors flex gap-3 text-start block",
                          !n.read && unreadCount > 0 ? "bg-amber-500/5" : ""
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                          {n.type === 'inquiry' ? <MessageSquare size={14} /> : n.type === 'system' ? <Server size={14} /> : <Activity size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-semibold text-gray-900 truncate">{n.title}</h4>
                            <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="pt-2 px-4 border-t border-gray-100 mt-1 text-center">
                    <Link 
                      to="/cms/activity" 
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-medium text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 py-1"
                    >
                      <span>{isRTL ? 'عرض سجل النشاطات الكامل' : 'View Full Activity Log'}</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

            <div className="w-px h-6 bg-[#E0D7C9] hidden sm:block"></div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                  setLanguageMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 pl-1 pr-2 py-1 rounded-xl transition-all cursor-pointer group text-start",
                  showProfileMenu ? "bg-[#F6F2EB]" : "hover:bg-[#F6F2EB]"
                )}
              >
                <div className="hidden sm:block text-start">
                  <div className="text-sm font-medium text-black leading-tight">{t('cms.adminUser')}</div>
                  <div className="text-xs text-gray-500 font-mono dir-ltr" style={{ unicodeBidi: 'isolate' }}>
                    {user?.email || 'admin@alyam.com'}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 overflow-hidden text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {settings.adminAvatarUrl ? (
                    <img 
                      src={typeof settings.adminAvatarUrl === 'string' ? settings.adminAvatarUrl : ((settings.adminAvatarUrl as any)?.originalUrl || (settings.adminAvatarUrl as any)?.webpUrl || (settings.adminAvatarUrl as any)?.url || '')} 
                      alt="Admin Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User size={18} />
                  )}
                </div>
              </button>

              {showProfileMenu && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "absolute top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-[#FCFAF7] rounded-2xl shadow-2xl border border-[#E0D7C9] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200",
                    isRTL ? "left-2 sm:left-4" : "right-0"
                  )}
                >
                  <div className="px-4 py-3 border-b border-[#E0D7C9] text-start">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-semibold text-gray-900">{t('cms.adminUser')}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 rounded">
                        {t('cms.adminRole') || 'Admin'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono dir-ltr" style={{ unicodeBidi: 'isolate' }}>
                      {user?.email || 'admin@alyam.com'}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/cms/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-[#F6F2EB] hover:text-amber-700 transition-colors group w-full text-start"
                    >
                      <Settings size={15} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                      <span className="flex-1">{t('cms.generalSettings') || 'General Settings'}</span>
                    </Link>

                    <Link
                      to="/cms/system"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-[#F6F2EB] hover:text-amber-700 transition-colors group w-full text-start"
                    >
                      <Server size={15} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                      <span className="flex-1">{t('cms.systemTitle') || 'System Health'}</span>
                    </Link>

                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-[#F6F2EB] hover:text-amber-700 transition-colors group w-full text-start"
                    >
                      <Globe size={15} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                      <span className="flex-1">{t('cms.viewWebsite') || 'View Website'}</span>
                    </a>
                  </div>

                  <div className="border-t border-[#E0D7C9] pt-1 mt-1">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await logout();
                          setShowProfileMenu(false);
                          navigate('/login', { replace: true });
                        } catch (err) {
                          console.error('Logout error:', err);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-start cursor-pointer group"
                    >
                      <LogOut size={15} className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                      <span className="flex-1">{t('cms.exit') || 'Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/home-page" element={<HomePageCMS />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/covers" element={
                <Projects 
                  categoryFilter="Book Covers" 
                  defaultCategory="Book Covers" 
                  pageTitle={isRTL ? "إدارة أغلفة الكتب والدفاتر" : "Book Covers Management"} 
                  pageSubtitle={isRTL ? "إدارة وإضافة أغلفة الكتب والروايات والدفاتر." : "Manage and add book covers."} 
                  createButtonText={isRTL ? "إضافة غلاف جديد" : "New Book Cover"} 
                />
              } />
              <Route path="/booklets" element={
                <Projects 
                  categoryFilter={["Educational Covers", "Booklets"]} 
                  defaultCategory="Educational Covers" 
                  pageTitle={isRTL ? "إدارة الملازم والكتيبات" : "Booklets & Notes Management"} 
                  pageSubtitle={isRTL ? "إدارة الملازم المدرسية والكتيبات التعليمية." : "Manage educational booklets and notes."} 
                  createButtonText={isRTL ? "إضافة ملزمة جديدة" : "New Booklet"} 
                />
              } />
              <Route path="/scripts" element={
                <Projects 
                  categoryFilter={['Web Applications', 'Software Scripts']} 
                  defaultCategory="Web Applications" 
                  pageTitle={isRTL ? "إدارة المواقع" : "Websites Management"} 
                  pageSubtitle={isRTL ? "إدارة المواقع وتطبيقات الويب." : "Manage websites and web applications."} 
                  createButtonText={isRTL ? "إضافة موقع جديد" : "New Website"} 
                />
              } />
              <Route path="/software" element={
                <Projects 
                  categoryFilter="Software" 
                  defaultCategory="Software" 
                  pageTitle={isRTL ? "إدارة البرمجيات" : "Software Management"} 
                  pageSubtitle={isRTL ? "إدارة البرمجيات والأنظمة." : "Manage software and desktop applications."} 
                  createButtonText={isRTL ? "إضافة برنامج جديد" : "New Software"} 
                />
              } />
              <Route path="/apps" element={
                <Projects 
                  categoryFilter={['Apps', 'Mobile Apps']} 
                  defaultCategory="Apps" 
                  pageTitle={isRTL ? "إدارة التطبيقات" : "Mobile Apps Management"} 
                  pageSubtitle={isRTL ? "إدارة تطبيقات الهواتف الذكية." : "Manage mobile applications."} 
                  createButtonText={isRTL ? "إضافة تطبيق جديد" : "New App"} 
                />
              } />
              <Route path="/pages" element={<PagesCMS />} />
              <Route path="/teachers" element={<TeachersCMS />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/services" element={<ServicesCMS />} />
              <Route path="/about-page" element={<AboutPageCMS />} />
              <Route path="/inquiries" element={<InquiriesCMS />} />
              <Route path="/legal-pages" element={<LegalPagesCMS />} />
              <Route path="/media" element={<MediaLibrary />} />
              <Route path="/activity" element={<ActivityLogs />} />
              <Route path="/system" element={<SystemHealth />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
      
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
