/// <reference types="vite/client" />
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, where, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { MediaAsset } from '../../types';
import { fileToDataURL } from '../utils/imageProcessing';

const COLLECTION_NAME = 'media';

const normalizeUrl = (url: string) => {
  if (!url) return url;
  try {
    // Correctly handle double slashes in paths while preserving protocol
    const urlObj = new URL(url);
    urlObj.pathname = urlObj.pathname.replace(/\/+/g, '/');
    return urlObj.toString();
  } catch (e) {
    // Fallback for non-standard URLs
    return url.replace(/([^:])\/\//g, '$1/');
  }
};

export const mediaService = {
  async getAll(): Promise<MediaAsset[]> {
    const customEndpoint = import.meta.env.VITE_MEDIA_API_ENDPOINT;
    
    // Attempt to list from custom server if configured
    if (customEndpoint) {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          const response = await fetch(`${customEndpoint}?action=list`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const result = await response.json();
            const items = Array.isArray(result) ? result : (result.items || []);
            
            return items
              .filter((item: any) => {
                const name = item.filename || item.name || '';
                // Ignore system files and hidden files
                return name && !name.startsWith('.') && name !== '.htaccess';
              })
              .map((item: any) => ({
                id: item.id || item.filename || item.name || Math.random().toString(36).substr(2, 9),
                filename: item.filename || item.name || '',
                originalFilename: item.originalName || item.filename || item.name || '',
                mimeType: item.mimeType || 'image/webp',
                extension: (item.filename || item.name || '').split('.').pop() || 'webp',
                originalSize: item.size || 0,
                title: item.originalName || item.filename || item.name || '',
                alt: '',
                caption: '',
                folder: 'general',
                originalUrl: normalizeUrl(item.url || ''),
                thumbnailUrl: normalizeUrl(item.thumbUrl || item.thumbnails?.thumb || item.url || ''),
                webpUrl: normalizeUrl(item.url || ''),
                createdAt: item.createdAt ? (isNaN(Number(item.createdAt)) ? (isNaN(new Date(item.createdAt).getTime()) ? Date.now() : new Date(item.createdAt).getTime()) : Number(item.createdAt)) : Date.now(),
                updatedAt: Date.now(),
                linkedProjects: [],
                linkedArticles: [],
                tags: []
              } as MediaAsset));
          }
        }
      } catch (err) {
        console.warn('Custom media listing failed, falling back to Firestore:', err);
      }
    }

    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaAsset));
  },

  async uploadFile(file: File, folder: string = 'general', customName?: string): Promise<any> {
    // Check for custom media server
    const customEndpoint = import.meta.env.VITE_MEDIA_API_ENDPOINT;

    if (customEndpoint) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const token = await user.getIdToken();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        formData.append('action', 'upload');
        if (customName) formData.append('filename', customName);

        const response = await fetch(customEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.media) {
          const m = result.media;
          return {
            id: m.id || m.filename,
            filename: m.filename,
            originalFilename: m.originalName || file.name,
            mimeType: m.mimeType || file.type,
            extension: m.filename.split('.').pop() || 'webp',
            width: m.width,
            height: m.height,
            originalSize: m.size || file.size,
            title: m.originalName || file.name,
            alt: '',
            caption: '',
            folder: folder,
            originalUrl: normalizeUrl(m.url),
            thumbnailUrl: normalizeUrl(m.thumbnails?.thumb || m.url),
            webpUrl: normalizeUrl(m.url),
            createdAt: m.createdAt ? (isNaN(new Date(m.createdAt).getTime()) ? Date.now() : new Date(m.createdAt).getTime()) : Date.now(),
            updatedAt: Date.now(),
            linkedProjects: [],
            linkedArticles: [],
            tags: []
          } as MediaAsset;
        }

        const url = result.url || result.data?.url || result.filePath;
        if (!url) throw new Error('Upload succeeded but no media data returned');
        
        // Return a minimal asset object if full media data is missing but URL is present
        return {
          id: Math.random().toString(36).substr(2, 9),
          filename: url.split('/').pop() || '',
          originalFilename: file.name,
          mimeType: file.type,
          extension: file.name.split('.').pop() || '',
          originalSize: file.size,
          title: file.name,
          alt: '',
          caption: '',
          folder: folder,
          originalUrl: normalizeUrl(url),
          thumbnailUrl: normalizeUrl(url),
          webpUrl: normalizeUrl(url),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          linkedProjects: [],
          linkedArticles: [],
          tags: []
        } as MediaAsset;
      } catch (err) {
        console.error('Custom media server upload failed:', err);
        throw err;
      }
    }

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const filename = customName || `${Date.now()}_${sanitizedName}`;
      const storageRef = ref(storage, `media/${folder}/${filename}`);

      // Race uploadBytes with a 3.5s timeout to prevent UI freeze if Storage hangs
      const uploadTask = (async () => {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      })();

      const timeoutTask = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Firebase Storage timeout')), 3500);
      });

      return await Promise.race([uploadTask, timeoutTask]);
    } catch (error) {
      console.warn('Firebase Storage upload failed or timed out, using Data URL fallback:', error);
      return await fileToDataURL(file);
    }
  },

  async deleteFile(url: string): Promise<void> {
    const customEndpoint = import.meta.env.VITE_MEDIA_API_ENDPOINT;
    
    // Handle custom media server deletion
    if (customEndpoint && url.includes('wana84.com')) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const token = await user.getIdToken();
        const filename = url.split('/').pop();
        
        const response = await fetch(`${customEndpoint}?action=delete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filename: filename,
            url: url
          })
        });

        if (!response.ok) throw new Error(`Custom delete failed: ${response.statusText}`);
      } catch (err) {
        console.error('Custom media server delete failed:', err);
        throw err;
      }
      return;
    }

    if (!url.includes('firebasestorage')) return;
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.warn('Failed to delete storage file', error);
    }
  },

  async createMetadata(data: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt' | 'linkedProjects' | 'linkedArticles'>): Promise<MediaAsset> {
    const newDocRef = doc(collection(db, COLLECTION_NAME));
    const now = Date.now();
    const asset: MediaAsset = {
      ...data,
      id: newDocRef.id,
      linkedProjects: [],
      linkedArticles: [],
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDocRef, asset);
    return asset;
  },

  async updateMetadata(id: string, data: Partial<Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt' | 'linkedProjects' | 'linkedArticles'>>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now()
    });
  },

  async deleteAsset(asset: MediaAsset): Promise<void> {
    // Delete files
    if (asset.originalUrl) await this.deleteFile(asset.originalUrl);
    if (asset.webpUrl) await this.deleteFile(asset.webpUrl);
    if (asset.thumbnailUrl) await this.deleteFile(asset.thumbnailUrl);
    
    // Delete metadata
    await deleteDoc(doc(db, COLLECTION_NAME, asset.id));
  },

  async updateAssetLinks(id: string, type: 'project' | 'article', entityId: string, isLinking: boolean): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    
    const asset = docSnap.data() as MediaAsset;
    let list = type === 'project' ? (asset.linkedProjects || []) : (asset.linkedArticles || []);
    
    if (isLinking && !list.includes(entityId)) {
      list.push(entityId);
    } else if (!isLinking && list.includes(entityId)) {
      list = list.filter(item => item !== entityId);
    }

    await updateDoc(docRef, {
      [type === 'project' ? 'linkedProjects' : 'linkedArticles']: list,
      updatedAt: Date.now()
    });
  }
};
