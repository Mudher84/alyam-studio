import { create } from 'zustand';

export interface QuoteModalData {
  defaultCategory?: string;
  subjectClass?: string;
  serviceTitle?: string;
  details?: string;
}

export interface AIModalData {
  defaultTab?: 'cover_ideas' | 'booklet_summary' | 'general';
  subject?: string;
  teacher?: string;
  prompt?: string;
}

interface ModalState {
  isQuoteOpen: boolean;
  quoteData: QuoteModalData | null;
  openQuoteModal: (data?: QuoteModalData) => void;
  closeQuoteModal: () => void;

  isAIOpen: boolean;
  aiData: AIModalData | null;
  openAIModal: (data?: AIModalData) => void;
  closeAIModal: () => void;

  isSearchOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;

  closeAll: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isQuoteOpen: false,
  quoteData: null,
  openQuoteModal: (data) => set({ isQuoteOpen: true, quoteData: data || null }),
  closeQuoteModal: () => set({ isQuoteOpen: false, quoteData: null }),

  isAIOpen: false,
  aiData: null,
  openAIModal: (data) => set({ isAIOpen: true, aiData: data || null }),
  closeAIModal: () => set({ isAIOpen: false, aiData: null }),

  isSearchOpen: false,
  openSearchModal: () => set({ isSearchOpen: true }),
  closeSearchModal: () => set({ isSearchOpen: false }),

  closeAll: () => set({ isQuoteOpen: false, isAIOpen: false, isSearchOpen: false, quoteData: null, aiData: null }),
}));
