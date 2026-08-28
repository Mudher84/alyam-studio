import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useLanguageStore } from '../../stores/useLanguageStore';

export default function WhatsAppButton() {
  const { settings } = useSettingsStore();
  const { isRTL } = useLanguageStore();

  // Extract phone number and remove non-digits for the WhatsApp URL
  const phone = settings?.contactPhone?.replace(/\D/g, '') || '9647701234567';

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    isRTL ? 'مرحباً، أود الاستفسار حول خدمات استوديو اليم.' : 'Hello, I would like to inquire about ALYAM Studio services.'
  )}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-6 ${
        isRTL ? 'right-6 md:right-8' : 'left-6 md:left-8'
      } z-[50] flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] text-white shadow-2xl hover:bg-[#20ba59] transition-all duration-300 group cursor-pointer border border-white/20`}
      aria-label="Contact on WhatsApp"
    >
      <div className="relative flex items-center justify-center w-6 h-6">
        <span className="absolute inset-0 rounded-full bg-white/30 animate-ping"></span>
        <svg className="w-6 h-6 fill-current relative z-10" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2zM12.04 19.8c-1.4 0-2.77-.38-3.97-1.1l-.28-.17-3.08.81.82-3-.18-.29c-.79-1.25-1.21-2.71-1.21-4.21 0-4.38 3.56-7.94 7.94-7.94 2.12 0 4.11.83 5.61 2.33 1.5 1.5 2.33 3.49 2.33 5.61 0 4.38-3.56 7.94-7.94 7.94zm4.35-5.9c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.8-.2-.48-.4-.42-.55-.43h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.33.98 2.49c.12.16 1.69 2.58 4.1 3.62.58.25 1.03.4 1.38.51.58.18 1.11.15 1.53.09.47-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
        </svg>
      </div>
      <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline-block">
        {isRTL ? 'واتساب الرسمي' : 'Official WhatsApp'}
      </span>
    </motion.a>
  );
}
