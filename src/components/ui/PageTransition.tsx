import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const portalRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);
  
  const isFirstMount = useRef(true);
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    // Initial load handled by Preloader
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setDisplayChildren(children);
      prevPathname.current = location.pathname;
      return;
    }

    if (prevPathname.current === location.pathname) {
      setDisplayChildren(children);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const portal = portalRef.current;
    const text = textRef.current;
    const streak = streakRef.current;

    if (!portal || !text || !streak) {
      setDisplayChildren(children);
      prevPathname.current = location.pathname;
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(portal, { pointerEvents: 'none', visibility: 'hidden', yPercent: 0 });
        prevPathname.current = location.pathname;
      }
    });

    if (prefersReducedMotion) {
      tl.call(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        setDisplayChildren(children);
      });
      return;
    }

    // Set initial states for Center Reveal
    tl.set(portal, { visibility: 'visible', pointerEvents: 'auto', yPercent: 0 })
      .set(text, { clipPath: 'inset(0% 0% 0% 100%)', x: 60 })
      .set(streak, { scaleX: 0, transformOrigin: 'center center' });

    // 1. Gold line expands from center
    tl.fromTo(streak, 
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 0.8,
        ease: 'power3.inOut'
      }, 
      0
    );

    // 2. ALYAM Studio text reveals from right to left & settles in center
    tl.fromTo(text,
      { clipPath: 'inset(0% 0% 0% 100%)', x: 60 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        x: 0,
        duration: 1.2,
        ease: 'power3.out'
      },
      0.1
    );

    // Brief hold before sliding up portal
    // Switch children and scroll to top right before portal slides up
    tl.call(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setDisplayChildren(children);
    }, null, 2.4);

    // 4. Portal slides up to reveal new page
    tl.fromTo(portal,
      { yPercent: 0 },
      {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut'
      },
      2.4
    );

    return () => {
      tl.kill();
    };

  }, [location.pathname]);

  return (
    <>
      {/* Cinematic Portal Overlay */}
      <div 
        ref={portalRef}
        className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden"
        style={{ visibility: 'hidden', pointerEvents: 'none' }}
      >
        {/* ALYAM Brand Signature with Gold Light Streak Underneath */}
        <div 
          ref={brandRef}
          className="relative z-20 flex flex-col items-center px-4 text-center"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.25))'
          }}
        >
          <div ref={textRef} style={{ clipPath: 'inset(0% 0% 0% 100%)', transform: 'translateX(60px)', willChange: 'clip-path, transform' }}>
            <div className="text-2xl sm:text-3xl font-serif font-extrabold tracking-[0.25em] text-white" dir="ltr">
              ALYAM <span className="text-[#FBBF24]">Studio</span><span className="text-[#FBBF24]">.</span>
            </div>
          </div>
          {/* Yellow Light Streak right underneath the word */}
          <div 
            ref={streakRef}
            className="w-48 sm:w-64 h-[1.5px] mt-5 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), rgba(251,191,36,0.95), rgba(251,191,36,0.3), transparent)',
              transformOrigin: 'center center',
              transform: 'scaleX(0)',
              willChange: 'transform'
            }}
          />
        </div>
      </div>

      {/* Page Content Container */}
      <div className="w-full min-h-screen">
        {displayChildren}
      </div>
    </>
  );
}

