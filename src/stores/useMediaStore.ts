import { create } from 'zustand';
import { MediaAsset } from '../types';
import { mediaService } from '../lib/services/media';
import { processImageClientSide } from '../lib/utils/imageProcessing';
import { activityLogService } from '../lib/services/activity';
import { auth } from '../lib/firebase';

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
  asset?: MediaAsset;
}

interface MediaState {
  assets: MediaAsset[];
  loading: boolean;
  error: string | null;
  uploads: UploadTask[];
  
  fetchAssets: () => Promise<void>;
  uploadFiles: (files: File[]) => void;
  deleteAsset: (asset: MediaAsset) => Promise<void>;
  deleteAssets: (assets: MediaAsset[]) => Promise<void>;
  updateAsset: (id: string, data: Partial<MediaAsset>) => Promise<void>;
  clearCompletedUploads: () => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  assets: [],
  loading: false,
  error: null,
  uploads: [],

  fetchAssets: async () => {
    set({ loading: true, error: null });
    try {
      const assets = await mediaService.getAll();
      set({ assets, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  uploadFiles: (files: File[]) => {
    const newUploads = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending' as const
    }));
    
    set({ uploads: [...get().uploads, ...newUploads] });

    newUploads.forEach(async (task) => {
      set(state => ({
        uploads: state.uploads.map(u => u.id === task.id ? { ...u, status: 'processing' } : u)
      }));

      try {
        const customEndpoint = import.meta.env.VITE_MEDIA_API_ENDPOINT;

        if (customEndpoint) {
          set(state => ({
            uploads: state.uploads.map(u => u.id === task.id ? { ...u, status: 'uploading', progress: 50 } : u)
          }));
          
          try {
            const result = await mediaService.uploadFile(task.file);
            
            if (typeof result === 'object' && result.id) {
              set(state => ({
                assets: [result, ...state.assets],
                uploads: state.uploads.map(u => u.id === task.id ? { ...u, status: 'success', progress: 100, asset: result } : u)
              }));

              activityLogService.logAction(
                auth.currentUser?.uid || 'unknown',
                'media_uploaded',
                `Uploaded media: ${result.title}`,
                'media',
                result.id,
                result.title
              );
              return; // Success - EXIT
            } else {
              throw new Error('Upload succeeded but returned invalid data');
            }
          } catch (error: any) {
            set(state => ({
              uploads: state.uploads.map(u => u.id === task.id ? { ...u, status: 'error', error: error.message || 'Upload failed' } : u)
            }));
            return; // Failure - EXIT (don't fall through to Firebase)
          }
        }

        const extension = task.file.name.split('.').pop()?.toLowerCase() || '';
        
        let originalFile = task.file;
        let webpFile: File | null = null;
        let thumbnailFile: File | null = null;
        
        // Process images
        if (task.file.type.startsWith('image/') && task.file.type !== 'image/svg+xml' && task.file.type !== 'image/gif') {
          const processed = await processImageClientSide(task.file);
          originalFile = processed.original;
          webpFile = processed.webp;
          thumbnailFile = processed.thumbnail;
        }

        set(state => ({
          uploads: state.uploads.map(u => u.id === task.id ? { ...u, status: 'uploading', progress: 20 } : u)
        }));

        // Upload primary and WebP
        let originalUrl = '';
        let webpUrl = '';
        let thumbnailUrl = '';

        if (webpFile) {
          // If we have a WebP version, we upload it as the primary webpUrl
          // and also use it as the originalUrl if requested, but better to keep both
          webpUrl = await mediaService.uploadFile(webpFile, 'webp');
          originalUrl = await mediaService.uploadFile(originalFile, 'originals');
        } else {
          originalUrl = await mediaService.uploadFile(originalFile, 'originals');
        }

        if (thumbnailFile) {
          thumbnailUrl = await mediaService.uploadFile(thumbnailFile, 'thumbnails');
        }

        set(state => ({
          uploads: state.uploads.map(u => u.id === task.id ? { ...u, progress: 90 } : u)
        }));

        // Create metadata
        const asset = await mediaService.createMetadata({
          filename: originalFile.name,
          originalFilename: task.file.name,
          mimeType: originalFile.type,
          extension,
          originalSize: originalFile.size,
          alt: '',
          caption: '',
          title: task.file.name,
          tags: [],
          folder: 'general',
          originalUrl,
          webpUrl: webpUrl || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
        });

        set(state => ({
          assets: [asset, ...state.assets],
          uploads: state.uploads.map(u => u.id === task.id ? { ...u, status: 'success', progress: 100, asset } : u)
        }));
        
        activityLogService.logAction(
          auth.currentUser?.uid || 'unknown',
          'media_uploaded',
          `Uploaded media: ${asset.title}`,
          'media',
          asset.id,
          asset.title
        );

      } catch (error: any) {
        set(state => ({
          uploads: state.uploads.map(u => u.id === task.id ? { ...u, status: 'error', error: error.message } : u)
        }));
      }
    });
  },

  deleteAsset: async (asset: MediaAsset) => {
    const totalUsage = (asset.linkedProjects?.length || 0) + (asset.linkedArticles?.length || 0);
    if (totalUsage > 0) {
      throw new Error("Cannot delete asset that is currently in use.");
    }
    
    await mediaService.deleteAsset(asset);
    
    set(state => ({
      assets: state.assets.filter(a => a.id !== asset.id)
    }));
    
    activityLogService.logAction(
      auth.currentUser?.uid || 'unknown',
      'media_deleted',
      `Deleted media: ${asset.title}`,
      'media',
      asset.id,
      asset.title
    );
  },

  deleteAssets: async (assetsToDelete: MediaAsset[]) => {
    if (assetsToDelete.length === 0) return;

    const successfulIds: string[] = [];
    const errors: string[] = [];

    for (const asset of assetsToDelete) {
      try {
        const totalUsage = (asset.linkedProjects?.length || 0) + (asset.linkedArticles?.length || 0);
        if (totalUsage > 0) {
          errors.push(`${asset.title} (In use)`);
          continue;
        }

        await mediaService.deleteAsset(asset);
        successfulIds.push(asset.id);

        activityLogService.logAction(
          auth.currentUser?.uid || 'unknown',
          'media_deleted',
          `Deleted media: ${asset.title}`,
          'media',
          asset.id,
          asset.title
        );
      } catch (err: any) {
        console.error(`Failed to delete ${asset.title}:`, err);
        errors.push(`${asset.title} (${err.message})`);
      }
    }

    set(state => ({
      assets: state.assets.filter(a => !successfulIds.includes(a.id))
    }));

    if (errors.length > 0) {
      throw new Error(`Failed to delete some assets:\n${errors.join('\n')}`);
    }
  },

  updateAsset: async (id: string, data: Partial<MediaAsset>) => {
    await mediaService.updateMetadata(id, data);
    set(state => ({
      assets: state.assets.map(a => a.id === id ? { ...a, ...data } : a)
    }));
    
    activityLogService.logAction(
      auth.currentUser?.uid || 'unknown',
      'media_updated',
      `Updated media properties`,
      'media',
      id
    );
  },
  
  clearCompletedUploads: () => {
    set(state => ({
      uploads: state.uploads.filter(u => u.status !== 'success' && u.status !== 'error')
    }));
  }
}));
