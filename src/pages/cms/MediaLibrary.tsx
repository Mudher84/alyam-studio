import React, { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, AlertCircle, X, Search, File as FileIcon, Info, Trash2, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMediaStore } from '../../stores/useMediaStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { MediaAsset } from '../../types';
import StudioBadgeIcon from '../../components/ui/StudioBadgeIcon';

export default function MediaLibrary() {
  const { t, isRTL } = useLanguageStore();
  const { assets, loading, fetchAssets, uploadFiles, uploads, clearCompletedUploads, deleteAsset, deleteAssets, updateAsset } = useMediaStore();
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    uploadFiles(acceptedFiles);
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onDrop as any });

  const filteredAssets = assets.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map(a => a.id)));
    }
  };

  const handleBulkDelete = async () => {
    const assetsToDelete = assets.filter(a => selectedIds.has(a.id));
    if (assetsToDelete.length === 0) return;

    if (confirm(isRTL ? `هل أنت متأكد من حذف ${selectedIds.size} ملف؟` : `Are you sure you want to delete ${selectedIds.size} items?`)) {
      try {
        await deleteAssets(assetsToDelete);
        setSelectedIds(new Set());
        if (selectedAsset && selectedIds.has(selectedAsset.id)) {
          setSelectedAsset(null);
        }
      } catch (err: any) {
        alert(err.message || 'Error deleting assets');
      }
    }
  };

  const handleDeleteAsset = async (e: React.MouseEvent, asset: MediaAsset) => {
    e.stopPropagation();
    const totalUsage = (asset.linkedProjects?.length || 0) + (asset.linkedArticles?.length || 0);
    if (totalUsage > 0) {
      alert(isRTL ? "لا يمكن حذف ملف مستخدم حالياً في المشاريع أو المقالات." : "Cannot delete an asset that is currently in use. Please remove it from all projects and articles first.");
      return;
    }
    if (confirm(isRTL ? 'هل أنت تأكد من حذف هذا الملف من الوسائط؟' : t('cms.confirmDeleteMedia'))) {
      try {
        await deleteAsset(asset);
        if (selectedAsset?.id === asset.id) {
          setSelectedAsset(null);
        }
        if (selectedIds.has(asset.id)) {
          const newSelected = new Set(selectedIds);
          newSelected.delete(asset.id);
          setSelectedIds(newSelected);
        }
      } catch (err: any) {
        alert(err.message || 'Error deleting asset');
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
        <header className="mb-6 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-black">{t('cms.mediaTitle')}</h1>
            <p className="text-gray-500 mt-1">{t('cms.mediaSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={selectAll}
               className="text-xs font-medium px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
             >
               {selectedIds.size === filteredAssets.length ? (isRTL ? 'إلغاء التحديد' : 'Deselect All') : (isRTL ? 'تحديد الكل' : 'Select All')}
             </button>
          </div>
        </header>

        {/* Top Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input 
              type="text"
              placeholder={t('cms.searchMedia')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-[#FCFAF7] border border-[#E0D7C9] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5`}
            />
          </div>
          
          <div {...getRootProps()} className="shrink-0">
            <input {...getInputProps()} />
            <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium">
              <UploadCloud size={18} />
              {t('cms.uploadFiles')}
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="z-30 bg-[#FCFAF7] border border-amber-300 shadow-lg rounded-2xl p-4 mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold">
                  {selectedIds.size}
                </div>
                <span className="text-sm font-medium text-black">
                  {isRTL ? 'عناصر محددة' : 'Items Selected'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedIds(new Set())}
                  className="text-sm text-gray-500 hover:text-black font-medium"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Trash2 size={16} />
                  {isRTL ? 'حذف المحدد' : 'Delete Selected'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dropzone overlay */}
        <div 
          {...getRootProps()} 
          className={`flex-1 relative border-2 border-dashed rounded-2xl p-4 overflow-y-auto transition-colors ${isDragActive ? 'border-amber-500 bg-amber-50/50' : 'border-transparent'}`}
        >
          {isDragActive && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#FCFAF7]/90 backdrop-blur-xs rounded-2xl">
              <UploadCloud size={48} className="text-amber-500 mb-4" />
              <p className="text-xl font-medium text-black">{t('cms.dragDropMedia')}</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploads.length > 0 && (
            <div className="mb-8 bg-[#FCFAF7] p-4 rounded-2xl border border-[#E0D7C9] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-black">{t('cms.uploadFiles')} ({uploads.filter(u => u.status === 'success').length}/{uploads.length})</h3>
                <button onClick={clearCompletedUploads} className="text-sm text-gray-500 hover:text-black">Clear Completed</button>
              </div>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                {uploads.map(upload => (
                  <div key={upload.id} className="flex items-center gap-4 text-sm">
                    <div className="w-8 h-8 rounded bg-[#F6F2EB] flex items-center justify-center shrink-0">
                      {upload.status === 'success' ? <CheckCircle size={16} className="text-green-500" /> :
                       upload.status === 'error' ? <AlertCircle size={16} className="text-red-500" /> :
                       <UploadCloud size={16} className="text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-black">{upload.file.name}</div>
                      <div className="w-full bg-[#F6F2EB] h-1.5 rounded-full mt-1">
                        <div className={`h-full rounded-full transition-all duration-300 ${upload.status === 'error' ? 'bg-red-500' : 'bg-black'}`} style={{ width: `${upload.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="shrink-0 w-16 text-right text-gray-500 text-xs">
                      {upload.status === 'error' ? 'Failed' : `${upload.progress}%`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Masonry Layout */}
          <div className="columns-4 sm:columns-6 md:columns-8 lg:columns-10 gap-2 pb-12 space-y-2">
            {loading && assets.length === 0 ? (
              <div className="py-24 text-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="flex flex-col items-center gap-6 opacity-20"
                >
                  <StudioBadgeIcon className="w-12 h-12" />
                </motion.div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="py-12 text-center text-gray-400">{t('cms.noData')}</div>
            ) : (
              filteredAssets.map(asset => {
                const isSelected = selectedIds.has(asset.id);
                return (
                  <div 
                    key={asset.id} 
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        toggleSelection(e, asset.id);
                      } else {
                        setSelectedAsset(asset);
                      }
                    }}
                    className={`break-inside-avoid group relative mb-2 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-amber-500 shadow-md scale-95' : selectedAsset?.id === asset.id ? 'border-amber-500/50' : 'border-transparent hover:border-gray-300'}`}
                  >
                    {asset.mimeType.startsWith('image/') ? (
                      <img 
                        src={asset.thumbnailUrl || asset.originalUrl} 
                        alt={asset.alt || asset.title}
                        className="w-full h-auto block"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-square flex flex-col items-center justify-center text-gray-400 bg-white">
                        <FileIcon size={32} className="mb-2" />
                        <span className="text-xs uppercase font-medium">{asset.extension}</span>
                      </div>
                    )}
                    
                    {/* Subtle Dark Overlay on Hover */}
                    <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-amber-500/10' : 'bg-black/0 group-hover:bg-black/20'}`}></div>

                    {/* Selection Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => toggleSelection(e, asset.id)}
                      className={`absolute top-2 right-2 z-20 p-1.5 rounded-lg transition-all shadow-sm ${isSelected ? 'bg-amber-500 text-white opacity-100' : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-black'}`}
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>

                    {/* Quick Delete Button - Only show if not multiple selected */}
                    {selectedIds.size <= 1 && (
                      <button
                        type="button"
                        title={isRTL ? 'حذف الوسائط' : 'Delete Media'}
                        onClick={(e) => handleDeleteAsset(e, asset)}
                        className="absolute top-2 left-2 z-20 p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md transform hover:scale-110 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    {((asset.linkedProjects?.length || 0) + (asset.linkedArticles?.length || 0)) > 0 && !isSelected && (
                      <div className="absolute top-2 right-2 z-10 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" title="In use"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      {selectedAsset && (
        <div className="w-80 bg-[#FCFAF7] border-l border-[#E0D7C9] h-full overflow-y-auto shrink-0 p-6 flex flex-col animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif text-black">{t('cms.details')}</h2>
            <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-black">
              <X size={20} />
            </button>
          </div>

          <div className="aspect-video bg-[#F6F2EB] rounded-xl overflow-hidden mb-6 flex items-center justify-center border border-[#E0D7C9]">
            {selectedAsset.mimeType.startsWith('image/') ? (
              <img src={selectedAsset.originalUrl} alt={selectedAsset.title} className="max-w-full max-h-full object-contain" />
            ) : (
              <FileIcon size={48} className="text-gray-400" />
            )}
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t('cms.projectName')}</label>
              <input 
                type="text" 
                value={selectedAsset.title}
                onChange={(e) => updateAsset(selectedAsset.id, { title: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#F6F2EB] border border-[#E0D7C9] rounded text-sm text-black focus:bg-[#FCFAF7] focus:border-[#E0D7C9] focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t('cms.altText')}</label>
              <input 
                type="text" 
                value={selectedAsset.alt || ''}
                onChange={(e) => updateAsset(selectedAsset.id, { alt: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#F6F2EB] border border-[#E0D7C9] rounded text-sm text-black focus:bg-[#FCFAF7] focus:border-[#E0D7C9] focus:outline-none transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-[#E0D7C9] space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cms.fileType')}</span>
                <span className="text-black uppercase">{selectedAsset.extension}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cms.fileSize')}</span>
                <span className="text-black">{(selectedAsset.originalSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cms.uploadedDate')}</span>
                <span className="text-black">{new Date(selectedAsset.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 flex items-center gap-1 mt-0.5"><Info size={14}/> {t('cms.usage')}</span>
                <div className="text-right">
                  {((selectedAsset.linkedProjects?.length || 0) + (selectedAsset.linkedArticles?.length || 0)) > 0 ? (
                    <div className="text-green-600 font-medium text-sm flex flex-col gap-1">
                      {selectedAsset.linkedProjects?.length > 0 && <span>{selectedAsset.linkedProjects.length} {t('cms.projects')}</span>}
                      {selectedAsset.linkedArticles?.length > 0 && <span>{selectedAsset.linkedArticles.length} {t('cms.articles')}</span>}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">{t('cms.notInUse')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E0D7C9] space-y-2">
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(selectedAsset.originalUrl);
                   alert(t('cms.urlCopied'));
                 }}
                 className="w-full py-2 bg-[#F6F2EB] hover:bg-[#EAE4D9] text-black rounded-lg text-sm font-medium transition-colors border border-[#E0D7C9]"
               >
                 {t('cms.copyUrl')}
               </button>
               
               <button 
                 onClick={async () => {
                   const totalUsage = (selectedAsset.linkedProjects?.length || 0) + (selectedAsset.linkedArticles?.length || 0);
                   if (totalUsage > 0) {
                     alert("Cannot delete an asset that is currently in use. Please remove it from all projects and articles first.");
                     return;
                   }
                   if (confirm(t('cms.confirmDeleteMedia'))) {
                     await deleteAsset(selectedAsset);
                     setSelectedAsset(null);
                   }
                 }}
                 disabled={((selectedAsset.linkedProjects?.length || 0) + (selectedAsset.linkedArticles?.length || 0)) > 0}
                 className="w-full py-2 bg-[#FCFAF7] border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:hover:bg-[#FCFAF7]"
               >
                 {t('cms.delete')}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
