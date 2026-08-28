import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Simple synthesized sounds using Web Audio API
const playSound = (type: 'hover' | 'click') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'hover') {
      // Soft, high-pitched tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } else {
      // Click: Slightly lower, fuller click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    // Ignore audio errors (e.g. before user interaction)
  }
};

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [hoverState, setHoverState] = useState<'default' | 'pointer' | 'view'>('default');
  const hoverStateRef = useRef(hoverState);

  useEffect(() => {
    hoverStateRef.current = hoverState;
  }, [hoverState]);

  useEffect(() => {
    // Only enable on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if hovering over a clickable image or project card
      let newHoverState: 'default' | 'pointer' | 'view' = 'default';
      
      if (
        target.closest('.group\\/project') || 
        target.closest('[data-cursor="view"]') ||
        (target.tagName.toLowerCase() === 'img' && target.closest('a'))
      ) {
        newHoverState = 'view';
      } else if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        newHoverState = 'pointer';
      }
      
      // Play hover sound if transitioning from default to pointer/view
      if (hoverStateRef.current === 'default' && newHoverState !== 'default') {
        playSound('hover');
      }
      
      setHoverState(newHoverState);
    };
    
    const handleMouseDown = () => {
      if (hoverStateRef.current !== 'default') {
        playSound('click');
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  if (window.matchMedia('(pointer: coarse)').matches) return null;

  const isHovering = hoverState === 'pointer';
  const isView = hoverState === 'view';

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-gold-500 rounded-full pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center overflow-hidden"
        animate={{
          x: mousePosition.x - (isView ? 40 : 8),
          y: mousePosition.y - (isView ? 40 : 8),
          scale: isView ? 1 : isHovering ? 2 : 1,
          width: isView ? 80 : 16,
          height: isView ? 80 : 16,
          backgroundColor: isView ? 'rgba(212, 175, 55, 1)' : 'rgba(212, 175, 55, 1)'
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
          mass: 0.1
        }}
      >
        <AnimatePresence>
          {isView && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-alyam-black text-xs font-mono font-bold tracking-widest uppercase"
            >
              View
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-gold-500/50 rounded-full pointer-events-none z-[9998] mix-blend-difference"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isView ? 0 : isHovering ? 1.5 : 1,
          opacity: (isHovering || isView) ? 0 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.5
        }}
      />
    </>
  );
}
