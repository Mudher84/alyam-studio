const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const originalHeroGsap = `  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Calculate a refined, non-extreme scale so ALYAM fills/exceeds the viewport smoothly
      const vpWidth = window.innerWidth;
      const isMobile = vpWidth < 768;
      
      const baseFontSize = Math.min(vpWidth * 0.28, 280);
      const targetScale = isMobile 
        ? Math.min(Math.max((vpWidth * 1.35) / baseFontSize, 6.5), 8.5)
        : Math.min(Math.max((vpWidth * 1.5) / baseFontSize, 8.5), 11.5);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=240%', // Shorter scroll distance (approx 2.4 viewport heights)
          scrub: 1.2, // Smooth scrubbing
          pin: true,
          anticipatePin: 1,
        }
      });

      // 1. Scale BOTH the mask cutout text AND the visible ALYAM typography in 100% sync
      tl.to([maskTextRef.current, visibleTextRef.current], {
        scale: targetScale,
        transformOrigin: '50% 50%',
        ease: 'power2.inOut',
        duration: 1,
      }, 0);

      // 2. Secondary elements ("STUDIO", tagline, scroll prompt) fade out gently as ALYAM scales
      tl.to(secondaryHeroTextRef.current, {
        opacity: 0,
        y: -20,
        ease: 'power1.inOut',
        duration: 0.35,
      }, 0.08);

      // 3. Layer 1 (Next Section) fades in smoothly
      tl.fromTo(layer1Ref.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'power1.inOut',
          duration: 0.3,
        },
        0.2
      );

      // 4. Visible ALYAM typography fades out smoothly as it fills the screen
      tl.fromTo(visibleTextRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'power2.inOut',
          duration: 0.4,
        },
        0.38
      );

      // 5. Revealed Content comes in gently
      tl.fromTo(revealedContentRef.current,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          duration: 0.45,
        },
        0.45
      );

      // 6. Gently fade Threads WebGL layer near the end
      tl.to(threadsContainerRef.current, {
        opacity: 0,
        ease: 'power1.inOut',
        duration: 0.3,
      }, 0.65);

    }, containerRef);

    return () => ctx.revert();
  }, []);`;

const originalHeroMarkup = `      {/* SVG MASK DEFINITION */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <mask id="alyam-gate-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            {/* White background means visible (reveals Layer 2 underlying canvas) */}
            <rect width="100%" height="100%" fill="white" />
            
            {/* Black ALYAM text acts as the cutout portal gate (reveals Layer 1 underlying section) */}
            <g ref={maskTextRef} style={{ transformOrigin: '50% 50%' }}>
              <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="central" 
                fill="black"
                className="font-serif font-medium tracking-tighter"
                style={{ 
                  fontSize: 'min(28vw, 280px)',
                  letterSpacing: '-0.04em'
                }}
              >
                ALYAM
              </text>
            </g>
          </mask>
        </defs>
      </svg>

      {/* 1. PINNED HERO PORTAL CONTAINER */}
      <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
        
        {/* LAYER 1: UNDERLYING REVEALED SECTION (Exists behind ALYAM Hero) */}
        <div ref={layer1Ref} className="absolute inset-0 z-0 w-full h-full bg-[#08080a] text-white flex flex-col justify-center items-center px-6 md:px-12 select-none opacity-0">
          {/* Subtle Grid Background for Revealed Section */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
          
          <div ref={revealedContentRef} className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest mb-8 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('hero.welcome')}</span>
            </div>
            
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-serif font-medium leading-[1.08] tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400">
              {settings.heroText?.title || t('hero.title')}
            </h2>
            
            <p className="max-w-2xl text-gray-400 font-light text-sm sm:text-base md:text-lg tracking-wide leading-relaxed mb-10">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pointer-events-auto">
              <Link 
                to="/portfolio" 
                className="w-full sm:w-auto px-8 py-4 bg-amber-400 text-black text-xs sm:text-sm font-semibold uppercase tracking-widest hover:bg-amber-300 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group"
              >
                {t('hero.exploreWorks')}
                <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/services" 
                className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white text-xs sm:text-sm uppercase tracking-widest hover:border-white hover:bg-white/5 transition-all duration-300 backdrop-blur-sm text-center"
              >
                {t('hero.ourCapabilities')}
              </Link>
            </div>
          </div>
        </div>

        {/* LAYER 2: MASKED HERO CANVAS (Dark Canvas + Threads WebGL) */}
        <div 
          ref={heroCanvasRef}
          onMouseMove={handleMouseMove}
          className="absolute inset-0 z-10 w-full h-full pointer-events-auto"
          style={{
            maskImage: 'url(#alyam-gate-mask)',
            WebkitMaskImage: 'url(#alyam-gate-mask)',
          }}
        >
          {/* Solid Dark Background */}
          <div className="absolute inset-0 bg-[#050505]" />
          
          {/* Ambient Mouse Spotlight */}
          <div 
            className="absolute inset-0 opacity-40 transition-all duration-300 pointer-events-none"
            style={{
              background: \`radial-gradient(circle 700px at \${mousePos.x} \${mousePos.y}, rgba(229,184,105,0.18), transparent 75%)\`
            }}
          />

          {/* Threads WebGL Layer */}
          <div ref={threadsContainerRef} className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[60vh] max-h-[700px] opacity-80 pointer-events-none">
            <Threads 
              color={[0.9, 0.72, 0.41]}
              secondaryColor={[0.18, 0.35, 0.85]}
              amplitude={1.1}
              distance={0.7}
              opacity={0.65}
              count={32}
              enableMouseInteraction={true}
            />
          </div>
        </div>

        {/* LAYER 3: REAL VISIBLE ALYAM TYPOGRAPHY & SECONDARY HERO TEXT (Synchronized Layer 4 at z-20) */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4">
          
          {/* REAL VISIBLE ALYAM WORDMARK (SVG for 1:1 Pixel-Perfect Alignment with Mask) */}
          <svg className="w-full h-[35vh] max-h-[350px] max-w-7xl mx-auto overflow-visible select-none">
            <defs>
              <linearGradient id="alyam-visible-gold-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#F5F5F7" />
                <stop offset="100%" stopColor="#E5B869" />
              </linearGradient>
            </defs>
            <g ref={visibleTextRef} style={{ transformOrigin: '50% 50%' }}>
              <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="central" 
                fill="url(#alyam-visible-gold-grad)"
                className="font-serif font-medium tracking-tighter"
                style={{ 
                  fontSize: 'min(28vw, 280px)',
                  letterSpacing: '-0.04em',
                  filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))'
                }}
              >
                ALYAM
              </text>
            </g>
          </svg>

          {/* Minimal Subtitle & Scroll Indicator (Wrapped in secondaryHeroTextRef for synchronized fade out) */}
          <div ref={secondaryHeroTextRef} className="mt-4 md:mt-6 flex flex-col items-center text-center relative">
            <p className="text-sm sm:text-lg md:text-2xl text-amber-400/90 font-sans font-light uppercase tracking-[0.6em] mb-2 drop-shadow-[0_0_12px_rgba(229,184,105,0.4)]">
              STUDIO
            </p>
            
            {/* Glowing Horizon Light Beam below STUDIO */}
            <div className="relative w-48 sm:w-80 h-[1px] my-3 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent">
              <div className="absolute inset-0 bg-amber-400 blur-[2px] opacity-90" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-amber-300 blur-sm rounded-full opacity-70" />
            </div>

            {/* Ambient Gold Radial Flare below ALYAM */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.3em] text-gray-300/90 mb-8 relative z-10">
              {t('hero.tagline')}
            </p>

            {/* Enhanced Glowing Scroll Pillar & Pulse Light */}
            <div className="flex flex-col items-center gap-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-300/90 font-mono drop-shadow-[0_0_8px_rgba(229,184,105,0.5)]">
                {t('hero.scrollPrompt')}
              </span>
              <div className="relative w-[2px] h-14 bg-gradient-to-b from-amber-400 via-amber-400/50 to-transparent overflow-hidden rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white blur-[0.5px] animate-bounce" />
              </div>
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_14px_#fbbf24] animate-ping" />
            </div>
          </div>
        </div>

        {/* HERO BOTTOM HORIZON GLOW & GRADIENT EDGE */}
        <div className="absolute bottom-0 inset-x-0 z-30 pointer-events-none">
          <div className="h-28 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent shadow-[0_0_20px_rgba(245,180,105,0.8)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent blur-[1px]" />
        </div>
      </div>`;

// Replace useLayoutEffect
const oldLayoutEffectRegex = /useLayoutEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*\},\s*\[\s*\]\s*\);/;
content = content.replace(oldLayoutEffectRegex, originalHeroGsap);

// Replace static hero markup with originalHeroMarkup
const staticHeroRegex = /\{\/\*\s*STATIC HERO SECTION\s*\*\/\}[\s\S]*?(?=\s*<ShowcaseSlider)/;
if (staticHeroRegex.test(content)) {
  content = content.replace(staticHeroRegex, originalHeroMarkup + '\n\n');
  fs.writeFileSync('src/pages/Home.tsx', content);
  console.log('Hero successfully restored!');
} else {
  console.log('Could not match static hero regex');
}
