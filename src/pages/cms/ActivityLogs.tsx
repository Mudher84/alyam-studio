import React, { useState } from 'react';
import { Search, Filter, Clock, User, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguageStore } from '../../stores/useLanguageStore';

export default function ActivityLogs() {
  const { t, isRTL } = useLanguageStore();
  const [search, setSearch] = useState('');

  const mockLogs = [
    { id: 1, type: t('cms.create') || 'create', resource: t('cms.articles') || 'Article', title: 'New design trends in 2026', user: t('cms.admin') || 'Admin', time: '10 mins ago', status: 'success' },
    { id: 2, type: t('cms.update') || 'update', resource: t('cms.projects') || 'Project', title: 'Enterprise Dashboard UI', user: t('cms.admin') || 'Admin', time: '1 hour ago', status: 'success' },
    { id: 3, type: t('cms.delete') || 'delete', resource: t('cms.media') || 'Media', title: 'hero-banner.jpg', user: t('cms.admin') || 'Admin', time: '3 hours ago', status: 'warning' },
    { id: 4, type: t('cms.login') || 'login', resource: 'System', title: 'Admin Login', user: t('cms.admin') || 'Admin', time: '5 hours ago', status: 'success' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-black mb-1">{t('cms.logsTitle')}</h1>
          <p className="text-sm text-gray-500">{t('cms.logsSubtitle')}</p>
        </div>
      </div>

      <div className="bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E0D7C9] flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-72">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input 
              type="text" 
              placeholder={t('cms.searchLogs')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-[#F6F2EB] border border-[#E0D7C9] rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black`}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F6F2EB] border border-[#E0D7C9] rounded-xl text-sm font-medium hover:bg-[#E0D7C9]/40 text-gray-700">
            <Filter className="w-4 h-4" /> {t('cms.filterLogs')}
          </button>
        </div>

        {/* Mobile & Tablet Card Layout */}
        <div className="block md:hidden p-4 space-y-4">
          {mockLogs.map((log) => (
            <div key={log.id} className="p-4 bg-[#FCFAF7] rounded-xl border border-[#E0D7C9] shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                      {log.type}
                    </span>
                    <h3 className="font-bold text-black text-sm mt-0.5">{log.title}</h3>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs pt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F6F2EB] border border-[#E0D7C9] text-gray-700 font-mono text-[10px]">
                  <FileText className="w-3 h-3" /> {log.resource}
                </span>
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <User className="w-3.5 h-3.5" /> {log.user}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-2 border-t border-[#E0D7C9]">
                <Clock className="w-3.5 h-3.5" />
                <span>{log.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
            <thead>
              <tr className="bg-[#F6F2EB]/60 border-b border-[#E0D7C9]">
                <th className="py-3 px-6 text-xs font-mono uppercase tracking-wider text-gray-500">{t('cms.action')}</th>
                <th className="py-3 px-6 text-xs font-mono uppercase tracking-wider text-gray-500">{t('cms.resource')}</th>
                <th className="py-3 px-6 text-xs font-mono uppercase tracking-wider text-gray-500">{t('cms.user')}</th>
                <th className="py-3 px-6 text-xs font-mono uppercase tracking-wider text-gray-500">{t('cms.time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D7C9]">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F6F2EB]/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-black capitalize">{log.type}</p>
                        <p className="text-xs text-gray-500">{log.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F6F2EB] border border-[#E0D7C9] text-xs font-mono text-gray-700">
                      <FileText className="w-3 h-3" /> {log.resource}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-[#F6F2EB] border border-[#E0D7C9] flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-500" />
                      </div>
                      {log.user}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {log.time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
