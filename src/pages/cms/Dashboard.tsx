import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileImage, FileText, Activity, Image as ImageIcon, 
  TrendingUp, Clock, Search, Eye, MessageSquare, Briefcase
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useArticleStore } from '../../stores/useArticleStore';
import { useMediaStore } from '../../stores/useMediaStore';
import { useInquiryStore } from '../../stores/useInquiryStore';
import { useServiceStore } from '../../stores/useServiceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { analyticsService } from '../../lib/services/analytics';
import { AnalyticsEvent } from '../../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguageStore();
  const { projects, fetchProjects } = useProjectStore();
  const { articles, fetchArticles } = useArticleStore();
  const { assets, fetchAssets } = useMediaStore();
  const { inquiries, fetchInquiries } = useInquiryStore();
  const { services, fetchServices } = useServiceStore();
  
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchArticles();
    fetchAssets();
    fetchInquiries();
    fetchServices();
    analyticsService.getEvents(30).then(res => {
      setEvents(res);
      setLoading(false);
    });
  }, [fetchProjects, fetchArticles, fetchAssets, fetchInquiries, fetchServices]);

  // Derived stats
  const publishedProjects = projects.filter(p => p.status === 'published').length;
  const draftProjects = projects.filter(p => p.status === 'draft').length;
  
  const publishedArticles = articles.filter(a => a.status === 'published').length;
  const draftArticles = articles.filter(a => a.status === 'draft').length;
  const newInquiries = inquiries.filter(i => i.status === 'new').length;
  const activeServices = services.filter(s => s.status === 'active').length;

  const totalStorageSize = assets.reduce((acc, curr) => acc + (curr.originalSize || 0), 0);
  const formattedStorage = (totalStorageSize / (1024 * 1024)).toFixed(2) + ' MB';

  const totalViews = events.filter(e => e.eventType === 'page_view' || e.eventType.includes('_view')).length;
  const projectViews = events.filter(e => e.eventType === 'project_view').length;
  const articleViews = events.filter(e => e.eventType === 'article_view').length;

  // Chart data (last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayEvents = events.filter(e => isSameDay(new Date(e.timestamp), date));
    return {
      name: format(date, 'MMM dd'),
      views: dayEvents.filter(e => e.eventType.includes('_view')).length,
      projects: dayEvents.filter(e => e.eventType === 'project_view').length,
      articles: dayEvents.filter(e => e.eventType === 'article_view').length,
    };
  });

  const stats = [
    { label: t('cms.totalInquiries'), value: inquiries.length, subtext: `${newInquiries} ${t('cms.newMessages')}`, icon: MessageSquare },
    { label: t('cms.activeServices'), value: services.length, subtext: `${activeServices} ${t('cms.active')}`, icon: Briefcase },
    { label: t('cms.totalProjects'), value: projects.length, subtext: `${publishedProjects} ${t('cms.published')}, ${draftProjects} ${t('cms.drafts')}`, icon: FileImage },
    { label: t('cms.totalArticles'), value: articles.length, subtext: `${publishedArticles} ${t('cms.published')}, ${draftArticles} ${t('cms.drafts')}`, icon: FileText },
    { label: t('cms.mediaAssets'), value: assets.length, subtext: `${formattedStorage} ${t('cms.totalStorage')}`, icon: ImageIcon },
    { label: t('cms.totalViews'), value: totalViews === 0 ? t('cms.noData') : totalViews, subtext: `${projectViews} ${t('cms.projects')}, ${articleViews} ${t('cms.articles')}`, icon: Activity },
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-black">{t('cms.dashboardTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('cms.dashboardSubtitle')}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#FCFAF7] p-6 rounded-2xl border border-[#E0D7C9] shadow-xs flex flex-col justify-between min-h-[160px] h-auto gap-4">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-[#F6F2EB] rounded-xl text-black border border-[#E0D7C9]">
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-black mb-1">
                  {loading ? <span className="text-gray-300 text-lg">{t('common.loading')}</span> : stat.value}
                </h3>
                <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl p-6 shadow-xs min-h-[400px]">
          <h2 className="text-xl font-serif text-black mb-6">{t('cms.trafficOverview')}</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">{t('common.loading')}</div>
          ) : totalViews === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">{t('cms.noData')}</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0D7C9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E0D7C9', backgroundColor: '#FCFAF7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    cursor={{ stroke: '#E0D7C9', strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className="bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl p-6 shadow-xs flex flex-col">
          <h2 className="text-xl font-serif text-black mb-4">{t('cms.quickActions')}</h2>
          <div className="space-y-3 flex-1">
            <button 
              onClick={() => navigate('/cms/projects?new=true')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#F6F2EB] hover:bg-[#FAF6F0] border border-[#E0D7C9] rounded-xl text-sm font-medium transition-colors text-black"
            >
              <div className="p-1.5 bg-[#FCFAF7] rounded shadow-xs border border-[#E0D7C9]"><FileImage size={16} /></div>
              {t('cms.newProject')}
            </button>
            <button 
              onClick={() => navigate('/cms/articles?new=true')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#F6F2EB] hover:bg-[#FAF6F0] border border-[#E0D7C9] rounded-xl text-sm font-medium transition-colors text-black"
            >
              <div className="p-1.5 bg-[#FCFAF7] rounded shadow-xs border border-[#E0D7C9]"><FileText size={16} /></div>
              {t('cms.writeArticle')}
            </button>
            <button 
              onClick={() => navigate('/cms/media')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#F6F2EB] hover:bg-[#FAF6F0] border border-[#E0D7C9] rounded-xl text-sm font-medium transition-colors text-black"
            >
              <div className="p-1.5 bg-[#FCFAF7] rounded shadow-xs border border-[#E0D7C9]"><ImageIcon size={16} /></div>
              {t('cms.uploadMedia')}
            </button>
            <a 
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#F6F2EB] hover:bg-[#FAF6F0] border border-[#E0D7C9] rounded-xl text-sm font-medium transition-colors text-black"
            >
              <div className="p-1.5 bg-[#FCFAF7] rounded shadow-xs border border-[#E0D7C9]"><Eye size={16} /></div>
              {t('cms.viewWebsite')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
