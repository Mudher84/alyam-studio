import { create } from 'zustand';
import { Inquiry } from '../types';
import { inquiryService } from '../lib/services/inquiries';
import { auth } from '../lib/firebase';
import { activityLogService } from '../lib/services/activity';

interface InquiryState {
  inquiries: Inquiry[];
  loading: boolean;
  error: string | null;
  fetchInquiries: () => Promise<void>;
  updateInquiry: (id: string, data: Partial<Inquiry>) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
}

export const useInquiryStore = create<InquiryState>((set, get) => ({
  inquiries: [],
  loading: false,
  error: null,

  fetchInquiries: async () => {
    set({ loading: true, error: null });
    try {
      const inquiries = await inquiryService.getAll();
      set({ inquiries, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateInquiry: async (id, data) => {
    try {
      await inquiryService.update(id, data);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'update', 'Updated inquiry status', 'inquiry', id);
      }
      await get().fetchInquiries();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteInquiry: async (id) => {
    try {
      await inquiryService.delete(id);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'delete', 'Deleted inquiry', 'inquiry', id);
      }
      await get().fetchInquiries();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
}));
