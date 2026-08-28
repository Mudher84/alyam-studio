import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AccordionItem {
  id: string | number;
  image: string;
  title?: string;
  description?: string;
  link?: string;
}

interface AccordionGalleryProps {
  items: AccordionItem[];
  defaultIndex?: number;
  expandRatio?: number;
  trigger?: 'hover' | 'click';
  height?: string | number;
  gap?: number;
  radius?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  grayscale?: boolean;
  showLabels?: boolean;
  duration?: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export default function AccordionGallery({
  items = [],
  defaultIndex = 0,
  expandRatio = 0.52,
  trigger = 'hover',
  height = '400px',
  gap = 12,
  radius = 16,
  accentColor = '#fbbf24',
  overlayColor = 'rgba(0, 0, 0, 0.4)',
  textColor = '#ffffff',
  grayscale = true,
  showLabels = true,
  duration = 0.5,
  className = '',
  orientation = 'horizontal',
}: AccordionGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleInteraction = (index: number) => {
    setActiveIndex(index);
  };

  const isHor = orientation === 'horizontal';

  return (
    <div 
      className={`flex ${isHor ? 'flex-row' : 'flex-col'} w-full overflow-hidden ${className}`}
      style={{ height, gap }}
    >
      {items.map((item, index) => {
        const isActive = activeIndex === index;

        return (
          <motion.div
            key={item.id}
            layout
            onMouseEnter={() => trigger === 'hover' && handleInteraction(index)}
            onClick={() => handleInteraction(index)}
            onFocus={() => handleInteraction(index)}
            tabIndex={0}
            className="relative overflow-hidden cursor-pointer flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-amber-400"
            style={{ 
              borderRadius: radius,
              ...(isHor ? { height: '100%' } : { width: '100%' })
            }}
            animate={{
              flex: isActive ? `${expandRatio * 100}%` : '1 1 0%',
              filter: grayscale && !isActive ? 'grayscale(80%)' : 'grayscale(0%)',
            }}
            transition={{
              duration,
              ease: [0.25, 1, 0.5, 1], // Custom ease-out
            }}
          >
            {/* Background Image */}
            <motion.img
              src={item.image}
              alt={item.title || 'Gallery image'}
              className="absolute inset-0 w-full h-full object-cover"
              animate={{
                scale: isActive ? 1 : 1.1,
              }}
              transition={{
                duration: duration * 1.5,
                ease: [0.25, 1, 0.5, 1],
              }}
            />

            {/* Gradient Overlay for Legibility */}
            <div 
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: `linear-gradient(to top, ${overlayColor} 0%, transparent 60%)`,
                opacity: isActive ? 1 : 0.4,
              }}
            />

            {/* Content Label */}
            {showLabels && (
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: duration * 0.2 }}
                    className="absolute bottom-0 left-0 right-0 p-6 z-10"
                    style={{ color: textColor }}
                  >
                    {item.title && (
                      <h3 className="text-2xl font-bold font-serif mb-2" style={{ color: accentColor }}>
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-sm font-sans opacity-90 line-clamp-2 max-w-md">
                        {item.description}
                      </p>
                    )}
                    {item.link && (
                      <a 
                        href={item.link} 
                        className="inline-block mt-4 text-sm uppercase tracking-wider font-semibold hover:underline"
                        style={{ color: accentColor }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Explore &rarr;
                      </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            
            {/* Highlight line on hover for collapsed items */}
            {!isActive && (
              <div 
                className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 transition-colors duration-300" 
                style={{ borderRadius: radius }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
