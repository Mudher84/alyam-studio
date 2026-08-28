import { create } from 'zustand';
import { SiteSettings } from '../types/settings';
import { settingsService, DEFAULT_SETTINGS } from '../lib/services/settings';
import { auth } from '../lib/firebase';
import { activityLogService } from '../lib/services/activity';

interface SettingsState {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<SiteSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.getSettings();
      set({ settings, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateSettings: async (data) => {
    try {
      await settingsService.updateSettings(data);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'update', 'Updated site settings', 'system', 'global');
      }
      // Re-fetch to get merged result
      const newSettings = await settingsService.getSettings();
      set({ settings: newSettings });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
}));
