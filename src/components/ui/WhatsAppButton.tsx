import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import SocialIcon from './SocialIcon';

export default function WhatsAppButton() {
  const location = useLocation();
  const { settings } = useSettingsStore();
  const { isRTL } = useLanguageStore();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on CMS pages
  if (location.pathname.startsWith('/cms')) {
    return null;
  }

  // Determine WhatsApp link
  let whatsappUrl = 'https://wa.me/9647701234567';
  if (settings?.socialLinks?.whatsapp) {
    whatsappUrl = settings.socialLinks.whatsapp;
  } else if (settings?.whatsappPhone) {
    const cleaned = settings.whatsappPhone.replace(/[^\d]/g, '');
    if (cleaned) {
      whatsappUrl = `https://wa.me/${cleaned}`;
    }
  }

  return (
    <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 flex items-center gap-3 dir-ltr">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-alyam-black/90 backdrop-blur-md border border-white/10 text-white text-xs font-sans shadow-2xl pointer-events-none whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>{isRTL ? 'تواصل معنا مباشرة عبر الواتساب' : 'Chat with us on WhatsApp'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/25 hover:shadow-2xl hover:shadow-[#25D366]/40 transition-all cursor-pointer"
        aria-label="WhatsApp"
      >
        {/* Pulsing Aura Effect */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none group-hover:hidden"></span>
        
        {/* Icon */}
        <SocialIcon platform="whatsapp" className="w-6 h-6 md:w-7 md:h-7 text-white transition-transform group-hover:scale-110" />
      </motion.a>
    </div>
  );
}
