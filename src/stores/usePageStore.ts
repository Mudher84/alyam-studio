import { create } from 'zustand';
import { StudioPage } from '../types';
import { pageService } from '../lib/services/pages';
import { auth } from '../lib/firebase';
import { activityLogService } from '../lib/services/activity';

interface PageState {
  pages: StudioPage[];
  loading: boolean;
  error: string | null;
  fetchPages: () => Promise<void>;
  addPage: (data: Omit<StudioPage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePage: (id: string, data: Partial<StudioPage>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
}

export const usePageStore = create<PageState>((set, get) => ({
  pages: [],
  loading: false,
  error: null,

  fetchPages: async () => {
    set({ loading: true, error: null });
    try {
      const pages = await pageService.getAll();
      set({ pages, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addPage: async (data) => {
    try {
      await pageService.add(data);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'create', `Created page ${data.name}`, 'page', '');
      }
      await get().fetchPages();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updatePage: async (id, data) => {
    try {
      await pageService.update(id, data);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'update', `Updated page ${id}`, 'page', id);
      }
      await get().fetchPages();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deletePage: async (id) => {
    try {
      await pageService.delete(id);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'delete', `Deleted page ${id}`, 'page', id);
      }
      await get().fetchPages();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
}));
