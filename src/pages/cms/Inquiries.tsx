import React, { useEffect, useState } from 'react';
import { Search, MailOpen, Trash2, CheckCircle2, Eye, User, Mail, Calendar, MessageSquare, X } from 'lucide-react';
import { useInquiryStore } from '../../stores/useInquiryStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { Inquiry } from '../../types';

export default function InquiriesCMS() {
  const { t, language, isRTL } = useLanguageStore();
  const { inquiries, loading, fetchInquiries, updateInquiry, deleteInquiry } = useInquiryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleDelete = async (id: string) => {
    if (confirm(t('cms.confirmDeleteInquiry'))) {
      await deleteInquiry(id);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  const handleMarkStatus = async (id: string, status: 'new' | 'read' | 'replied' | 'archived') => {
    await updateInquiry(id, { status });
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleOpenInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    if (inquiry.status === 'new') {
      await updateInquiry(inquiry.id, { status: 'read' });
    }
  };

  const filteredInquiries = inquiries.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.message && i.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-black">{t('cms.inquiriesTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('cms.inquiriesSubtitle')}</p>
        </div>
      </header>

      <div className="bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-[#E0D7C9] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input 
              type="text"
              placeholder={t('cms.searchInquiries')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-[#F6F2EB] border border-[#E0D7C9] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all`}
            />
          </div>
        </div>
        
        {/* Mobile & Tablet Card Layout */}
        <div className="block md:hidden p-4 space-y-4">
          {loading && inquiries.length === 0 ? (
            <div className="py-12 text-center text-gray-400">{t('common.loading')}</div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-12 text-center text-gray-400">{t('cms.noInquiriesFound')}</div>
          ) : (
            filteredInquiries.map((inquiry) => (
              <div 
                key={inquiry.id} 
                onClick={() => handleOpenInquiry(inquiry)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                  inquiry.status === 'new' 
                    ? 'bg-amber-50/40 border-amber-200 shadow-xs' 
                    : 'bg-[#FCFAF7] border-[#E0D7C9]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-black text-sm">{inquiry.name}</h3>
                    <p className="text-xs text-gray-500">{inquiry.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    inquiry.status === 'new' ? 'bg-amber-100 text-amber-800' : 
                    inquiry.status === 'read' ? 'bg-blue-50 text-blue-700' :
                    inquiry.status === 'replied' ? 'bg-green-50 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {inquiry.status === 'new' ? t('cms.statusNew') : 
                     inquiry.status === 'read' ? t('cms.statusRead') : 
                     inquiry.status === 'replied' ? t('cms.statusReplied') : 
                     t('cms.statusArchived')}
                  </span>
                </div>

                <div className="text-xs font-semibold text-gray-800 mb-2 truncate">
                  {inquiry.subject}
                </div>
                
                {inquiry.message && (
                  <p className="text-xs text-gray-400 line-clamp-2 bg-[#F6F2EB] border border-[#E0D7C9]/60 p-2 rounded-lg mb-3">
                    {inquiry.message}
                  </p>
                )}

                <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-[#E0D7C9]">
                  <span>{new Date(inquiry.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInquiry(inquiry);
                      }}
                      className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-[#F6F2EB] transition-colors"
                      title={isRTL ? "عرض الرسالة" : "View Message"}
                    >
                      <Eye size={16} />
                    </button>
                    {inquiry.status === 'new' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkStatus(inquiry.id, 'read');
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title={t('cms.markAsRead')}
                      >
                        <MailOpen size={16} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkStatus(inquiry.id, 'replied');
                      }}
                      className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                      title={isRTL ? "تم الرد" : "Replied"}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(inquiry.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title={t('cms.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
            <thead>
              <tr className="bg-[#F6F2EB]/60 border-b border-[#E0D7C9]">
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cms.sender')}</th>
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cms.subject')}</th>
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cms.status')}</th>
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cms.received')}</th>
                <th className={`py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>{t('cms.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D7C9]">
              {loading && inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">{t('common.loading')}</td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">{t('cms.noInquiriesFound')}</td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <tr 
                    key={inquiry.id} 
                    onClick={() => handleOpenInquiry(inquiry)}
                    className={`hover:bg-[#F6F2EB]/50 transition-colors group cursor-pointer ${inquiry.status === 'new' ? 'bg-amber-50/30' : ''}`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-black">{inquiry.name}</div>
                      <div className="text-xs text-gray-500">{inquiry.email}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800">
                      <div className="font-medium">{inquiry.subject}</div>
                      {inquiry.message && (
                        <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{inquiry.message}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        inquiry.status === 'new' ? 'bg-amber-100 text-amber-800' : 
                        inquiry.status === 'read' ? 'bg-blue-50 text-blue-700' :
                        inquiry.status === 'replied' ? 'bg-green-50 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {inquiry.status === 'new' ? t('cms.statusNew') : 
                         inquiry.status === 'read' ? t('cms.statusRead') : 
                         inquiry.status === 'replied' ? t('cms.statusReplied') : 
                         t('cms.statusArchived')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className={`py-4 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>
                      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInquiry(inquiry);
                          }}
                          className="p-2 text-gray-400 hover:text-black rounded-lg hover:bg-[#F6F2EB] transition-colors"
                          title={isRTL ? "عرض الرسالة" : "View Message"}
                        >
                          <Eye size={16} />
                        </button>
                        {inquiry.status === 'new' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkStatus(inquiry.id, 'read');
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title={t('cms.markAsRead')}
                          >
                            <MailOpen size={16} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkStatus(inquiry.id, 'replied');
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                          title="Replied"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(inquiry.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title={t('cms.delete')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Viewer Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-[#E0D7C9] flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-black">
                {isRTL ? "تفاصيل الرسالة" : "Inquiry Details"}
              </h2>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-[#F6F2EB] rounded-full text-gray-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm text-gray-700">
              {/* Sender Details */}
              <div className="flex flex-col gap-3 p-4 bg-[#F6F2EB] border border-[#E0D7C9] rounded-xl">
                <div className="flex items-center gap-2.5">
                  <User size={16} className="text-amber-500" />
                  <div>
                    <span className="font-medium text-black">{selectedInquiry.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-amber-500" />
                  <a href={`mailto:${selectedInquiry.email}`} className="text-amber-600 hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-400">
                  <Calendar size={14} />
                  <span>{new Date(selectedInquiry.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                </div>
              </div>

              {/* Quote Specifications */}
              {selectedInquiry.phone && (
                <div className="p-4 bg-amber-50/20 border border-amber-200/40 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-amber-200/50 pb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-amber-500 rounded-full" />
                    {isRTL ? "مواصفات طلب التسعيرة" : "Quote Specifications"}
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-gray-700">
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "الهاتف" : "Phone"}</span>
                      <span className="font-semibold text-black font-mono">{selectedInquiry.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "الواتساب" : "WhatsApp"}</span>
                      <span className="font-semibold text-black font-mono">{selectedInquiry.whatsapp}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "التواصل المفضل" : "Preferred Contact"}</span>
                      <span className="font-semibold text-black">{selectedInquiry.contactMethod || "واتساب"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "نوع المشروع" : "Project Type"}</span>
                      <span className="font-semibold text-black">{selectedInquiry.projectType}</span>
                    </div>
                    {selectedInquiry.subjectClass && (
                      <div>
                        <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "المادة والصف" : "Subject & Class"}</span>
                        <span className="font-semibold text-black">{selectedInquiry.subjectClass}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "الصفحات التقريبية" : "Approx. Pages"}</span>
                      <span className="font-semibold text-black font-mono">{selectedInquiry.pageCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "نظام الألوان" : "Color System"}</span>
                      <span className="font-semibold text-black">{selectedInquiry.colorSystem}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "الموعد النهائي" : "Deadline"}</span>
                      <span className="font-semibold text-black">{selectedInquiry.deadline}</span>
                    </div>
                    {selectedInquiry.budget && (
                      <div>
                        <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "الميزانية التقريبية" : "Approx. Budget"}</span>
                        <span className="font-semibold text-black">{selectedInquiry.budget}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 block font-medium mb-0.5">{isRTL ? "ذكاء اصطناعي؟" : "Needs AI?"}</span>
                      <span className="font-semibold text-black">{selectedInquiry.needsAI}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subject */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isRTL ? "الموضوع" : "Subject"}
                </h4>
                <p className="text-base font-medium text-black bg-[#F6F2EB] p-3 rounded-lg border border-[#E0D7C9]">
                  {selectedInquiry.subject}
                </p>
              </div>

              {/* Message */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {isRTL ? "الرسالة" : "Message"}
                </h4>
                <div className="p-4 bg-[#F6F2EB] border border-[#E0D7C9] rounded-xl whitespace-pre-wrap font-sans text-gray-800 leading-relaxed max-h-60 overflow-y-auto">
                  {selectedInquiry.message || (isRTL ? "لا توجد رسالة مرفقة." : "No message provided.")}
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {isRTL ? "حالة الرسالة:" : "Status:"}
                </span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  selectedInquiry.status === 'new' ? 'bg-amber-100 text-amber-800' : 
                  selectedInquiry.status === 'read' ? 'bg-blue-50 text-blue-700' :
                  selectedInquiry.status === 'replied' ? 'bg-green-50 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {selectedInquiry.status === 'new' ? t('cms.statusNew') : 
                   selectedInquiry.status === 'read' ? t('cms.statusRead') : 
                   selectedInquiry.status === 'replied' ? t('cms.statusReplied') : 
                   t('cms.statusArchived')}
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-[#F6F2EB] border-t border-[#E0D7C9] flex flex-wrap gap-2 justify-end">
              {selectedInquiry.status === 'new' && (
                <button
                  onClick={() => handleMarkStatus(selectedInquiry.id, 'read')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-medium transition-colors"
                >
                  <MailOpen size={14} />
                  <span>{isRTL ? "تحديد كمقروء" : "Mark as Read"}</span>
                </button>
              )}
              {selectedInquiry.status !== 'replied' && (
                <button
                  onClick={() => handleMarkStatus(selectedInquiry.id, 'replied')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-xs font-medium transition-colors"
                >
                  <CheckCircle2 size={14} />
                  <span>{isRTL ? "تم الرد" : "Mark as Replied"}</span>
                </button>
              )}
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-medium transition-colors"
              >
                <MessageSquare size={14} />
                <span>{isRTL ? "إرسال إيميل رد" : "Send Reply Email"}</span>
              </a>
              <button
                onClick={() => handleDelete(selectedInquiry.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-medium transition-colors"
              >
                <Trash2 size={14} />
                <span>{isRTL ? "حذف" : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

