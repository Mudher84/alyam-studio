import React, { useState, useEffect, useRef } from 'react';
import { useMediaStore } from '../../stores/useMediaStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { X, Search, File as FileIcon, Check, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { MediaAsset } from '../../types';
import { mediaService } from '../../lib/services/media';

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  multiple?: boolean;
}

export default function MediaPicker({ onSelect, onClose, multiple = false }: MediaPickerProps) {
  const { t, isRTL } = useLanguageStore();
  const { assets, loading, fetchAssets, uploadFiles } = useMediaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fileList = Array.from(files);
      uploadFiles(fileList);

      for (const file of fileList) {
        const url = await mediaService.uploadFile(file, 'general');
        onSelect(url);
      }
      if (!multiple) {
        onClose();
      }
    } catch (err) {
      console.error("Direct upload failed:", err);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const filteredAssets = assets.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <div className="p-4 border-b border-[#E0D7C9] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif text-black">{t('cms.selectMediaModal')}</h2>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              multiple={multiple} 
              onChange={handleDirectUpload} 
              className="hidden" 
            />
            <button 
              type="button" 
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <UploadCloud size={16} className={isUploading ? 'animate-bounce' : ''} />
              <span>{isUploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'رفع ملف من الحاسبة' : 'Upload from PC')}</span>
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-[#E0D7C9]">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input 
              type="text"
              placeholder={t('cms.searchMediaPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-[#F6F2EB] border border-[#E0D7C9] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading && assets.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">{t('cms.loadingMedia')}</div>
            ) : filteredAssets.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">{t('cms.noMediaFound')}</div>
            ) : (
              filteredAssets.map(asset => (
                <div 
                  key={asset.id} 
                  onClick={() => {
                    onSelect(asset.originalUrl);
                    if (!multiple) onClose();
                  }}
                  className="group relative aspect-square bg-[#F6F2EB] rounded-xl overflow-hidden cursor-pointer border-2 border-[#E0D7C9] hover:border-black transition-all"
                >
                  {asset.mimeType.startsWith('image/') ? (
                    <img 
                      src={asset.thumbnailUrl || asset.originalUrl} 
                      alt={asset.alt || asset.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-[#F6F2EB]">
                      <FileIcon size={32} className="mb-2" />
                      <span className="text-xs uppercase font-medium">{asset.extension}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {multiple && (
          <div className="p-4 border-t border-[#E0D7C9] flex justify-end">
             <button onClick={onClose} className="px-6 py-2 bg-black text-white rounded-xl text-sm font-medium">{t('cms.done')}</button>
          </div>
        )}
      </div>
    </div>
  );
}
