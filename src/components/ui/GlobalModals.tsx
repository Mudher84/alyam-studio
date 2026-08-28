import React, { useEffect } from 'react';
import RequestQuoteModal from './RequestQuoteModal';
import AIAssistantModal from './AIAssistantModal';
import QuickSearchModal from './QuickSearchModal';
import { useModalStore } from '../../stores/useModalStore';

export default function GlobalModals() {
  const { isQuoteOpen, closeQuoteModal, quoteData, isAIOpen, closeAIModal, aiData, isSearchOpen, closeSearchModal, openSearchModal } = useModalStore();

  // Keyboard shortcuts (Cmd+K / Ctrl+K for Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      }
      if (e.key === 'Escape') {
        if (isQuoteOpen) closeQuoteModal();
        if (isAIOpen) closeAIModal();
        if (isSearchOpen) closeSearchModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuoteOpen, isAIOpen, isSearchOpen, openSearchModal, closeQuoteModal, closeAIModal, closeSearchModal]);

  return (
    <>
      <RequestQuoteModal isOpen={isQuoteOpen} onClose={closeQuoteModal} initialData={quoteData} />
      <AIAssistantModal isOpen={isAIOpen} onClose={closeAIModal} initialData={aiData} />
      <QuickSearchModal isOpen={isSearchOpen} onClose={closeSearchModal} />
    </>
  );
}
