import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useArticleStore } from '../../stores/useArticleStore';
import { useLanguageStore } from '../../stores/useLanguageStore';

export type ConstellationCategory = 'covers' | 'booklets' | 'software' | 'scripts' | 'articles' | null;

export type PerformanceTier = 'ULTRA' | 'STANDARD' | 'ECO';

interface FooterConstellationProps {
  activeCategory: ConstellationCategory;
}

interface Node {
  id: string;
  category: 'covers' | 'booklets' | 'software' | 'scripts' | 'articles';
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  targetBaseX: number;
  targetBaseY: number;
  offsetDist: number;
  offsetAngle: number;
  radius: number;
  currentRadius: number;
  alpha: number;
  targetAlpha: number;
  phase: number;
  speed: number;
  forceX: number;
  forceY: number;
  isLeaving?: boolean;
}

// Normalize CMS count to safe visual node count
function calculateClusterCount(cmsCount: number): number {
  if (cmsCount <= 0) return 4;
  if (cmsCount <= 5) return 6;
  if (cmsCount <= 15) return 9;
  return 12;
}

export default function FooterConstellation({ activeCategory }: FooterConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { projects } = useProjectStore();
  const { articles } = useArticleStore();
  const { isRTL } = useLanguageStore();

  // Diagnostics State (Dev Mode Only)
  const [diagnostics, setDiagnostics] = useState<{
    fps: number;
    tier: PerformanceTier;
    nodeCount: number;
    checks: number;
    dpr: number;
  }>({
    fps: 60,
    tier: 'ULTRA',
    nodeCount: 0,
    checks: 0,
    dpr: 1,
  });

  const [showDevHUD, setShowDevHUD] = useState(false);

  // References
  const nodesRef = useRef<Node[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const isLoopRunningRef = useRef(false);
  const isIntersectingRef = useRef(false);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Performance Engine Ref
  const perfRef = useRef<{
    tier: PerformanceTier;
    fpsHistory: number[];
    lastFrameTime: number;
    lowFpsStart: number | null;
    highFpsStart: number | null;
    checksCount: number;
    frameCount: number;
    errorCount: number;
  }>({
    tier: 'ULTRA',
    fpsHistory: [],
    lastFrameTime: performance.now(),
    lowFpsStart: null,
    highFpsStart: null,
    checksCount: 0,
    frameCount: 0,
    errorCount: 0,
  });

  // Color & Theme interpolation state ref
  const themeFactorRef = useRef(0); // 0 = Dark, 1 = Light

  // Categorized CMS counts
  const coversCount = projects.filter((p) => p.category === 'Covers' || p.category === 'Book Cover').length;
  const bookletsCount = projects.filter((p) => p.category === 'Educational' || p.category === 'Booklets').length;
  const softwareCount = projects.filter((p) => p.category === 'Software').length;
  const scriptsCount = projects.filter((p) => p.category === 'Web Applications' || p.category === 'Scripts').length;
  const articlesCount = articles.length;

  // Toggle Dev HUD via Shift+D
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        setShowDevHUD((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    let width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.parentElement?.clientHeight || 280;

    // Target counts per category
    const targetCounts = {
      covers: calculateClusterCount(coversCount),
      booklets: calculateClusterCount(bookletsCount),
      software: calculateClusterCount(softwareCount),
      scripts: calculateClusterCount(scriptsCount),
      articles: calculateClusterCount(articlesCount),
    };

    // Calculate cluster anchors dynamically based on width & RTL
    const getClusterAnchors = (w: number) => {
      if (isRTL) {
        return {
          covers: { cx: 0.8, cy: 0.35 },
          booklets: { cx: 0.65, cy: 0.6 },
          software: { cx: 0.45, cy: 0.3 },
          scripts: { cx: 0.25, cy: 0.7 },
          articles: { cx: 0.1, cy: 0.45 },
        };
      }
      return {
        covers: { cx: 0.15, cy: 0.35 },
        booklets: { cx: 0.35, cy: 0.6 },
        software: { cx: 0.55, cy: 0.3 },
        scripts: { cx: 0.75, cy: 0.7 },
        articles: { cx: 0.9, cy: 0.45 },
      };
    };

    // Sync Node Population with CMS Data without destroying active nodes
    const syncNodes = () => {
      const anchors = getClusterAnchors(width);
      const categories: Array<'covers' | 'booklets' | 'software' | 'scripts' | 'articles'> = [
        'covers',
        'booklets',
        'software',
        'scripts',
        'articles',
      ];

      categories.forEach((cat) => {
        const targetCount = targetCounts[cat];
        const anchor = anchors[cat];
        const existingCatNodes = nodesRef.current.filter((n) => n.category === cat && !n.isLeaving);

        // Add missing nodes smoothly
        if (existingCatNodes.length < targetCount) {
          const toAdd = targetCount - existingCatNodes.length;
          for (let i = 0; i < toAdd; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 25 + Math.random() * 75;
            const bx = anchor.cx * width + Math.cos(angle) * dist;
            const by = anchor.cy * height + Math.sin(angle) * (dist * 0.6);

            nodesRef.current.push({
              id: `${cat}-${Date.now()}-${Math.random()}`,
              category: cat,
              x: bx,
              y: by,
              baseX: bx,
              baseY: by,
              targetBaseX: bx,
              targetBaseY: by,
              offsetDist: dist,
              offsetAngle: angle,
              radius: 2 + Math.random() * 2,
              currentRadius: 2 + Math.random() * 2,
              alpha: 0,
              targetAlpha: 1,
              phase: Math.random() * Math.PI * 2,
              speed: 0.005 + Math.random() * 0.01,
              forceX: 0,
              forceY: 0,
            });
          }
        } else if (existingCatNodes.length > targetCount) {
          // Mark excess nodes for removal
          const toRemoveCount = existingCatNodes.length - targetCount;
          for (let i = 0; i < toRemoveCount; i++) {
            existingCatNodes[i].isLeaving = true;
            existingCatNodes[i].targetAlpha = 0;
          }
        }

        // Update target positions for existing nodes (RTL/Resize handling)
        existingCatNodes.forEach((node) => {
          node.targetBaseX = anchor.cx * width + Math.cos(node.offsetAngle) * node.offsetDist;
          node.targetBaseY = anchor.cy * height + Math.sin(node.offsetAngle) * (node.offsetDist * 0.6);
        });
      });
    };

    // Update DPR and Canvas size safely
    const updateCanvasDPI = () => {
      let dpr = 1;
      if (!isMobile && !prefersReducedMotion) {
        if (perfRef.current.tier === 'ULTRA') dpr = Math.min(window.devicePixelRatio || 1, 2);
        else if (perfRef.current.tier === 'STANDARD') dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        else dpr = 1;
      }

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale
      ctx.scale(dpr, dpr);
      return dpr;
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.parentElement.clientHeight || 280;
      updateCanvasDPI();
      syncNodes();
      if (isMobile || prefersReducedMotion) {
        renderStaticFrame();
      }
    };

    window.addEventListener('resize', handleResize);
    syncNodes();
    updateCanvasDPI();

    // IntersectionObserver to pause RAF when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersectingRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !prefersReducedMotion && !isMobile) {
            startLoop();
          } else {
            stopLoop();
            if (isMobile || prefersReducedMotion) {
              renderStaticFrame();
            }
          }
        });
      },
      { threshold: 0.02 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Visibility change handler (Hidden browser tab)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (isIntersectingRef.current && !prefersReducedMotion && !isMobile) {
        startLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Render single static frame for mobile or reduced motion
    const renderStaticFrame = () => {
      if (!ctx) return;
      try {
        ctx.clearRect(0, 0, width, height);
        drawConstellation(performance.now(), true);
      } catch (err) {
        console.error('Constellation static frame error:', err);
      }
    };

    // Draw Constellation Logic with Spatial Hashing & Self-Optimizing Engine
    const drawConstellation = (timestamp: number, isStatic = false) => {
      const now = performance.now();
      const delta = now - perfRef.current.lastFrameTime;
      perfRef.current.lastFrameTime = now;

      // 1. Calculate Rolling FPS
      if (delta > 0 && !isStatic) {
        const currentFps = 1000 / delta;
        perfRef.current.fpsHistory.push(currentFps);
        if (perfRef.current.fpsHistory.length > 60) {
          perfRef.current.fpsHistory.shift();
        }
      }

      const avgFps =
        perfRef.current.fpsHistory.length > 0
          ? perfRef.current.fpsHistory.reduce((a, b) => a + b, 0) / perfRef.current.fpsHistory.length
          : 60;

      // 2. Performance Tier Hysteresis Management
      if (!isStatic) {
        if (avgFps < 40) {
          if (!perfRef.current.lowFpsStart) perfRef.current.lowFpsStart = now;
          if (now - perfRef.current.lowFpsStart > 3000) {
            perfRef.current.tier = 'ECO';
            perfRef.current.highFpsStart = null;
          }
        } else if (avgFps < 52) {
          if (perfRef.current.tier === 'ULTRA') {
            if (!perfRef.current.lowFpsStart) perfRef.current.lowFpsStart = now;
            if (now - perfRef.current.lowFpsStart > 3000) {
              perfRef.current.tier = 'STANDARD';
              perfRef.current.highFpsStart = null;
            }
          }
        } else if (avgFps >= 55) {
          perfRef.current.lowFpsStart = null;
          if (!perfRef.current.highFpsStart) perfRef.current.highFpsStart = now;
          if (now - perfRef.current.highFpsStart > 5000) {
            if (perfRef.current.tier === 'ECO') perfRef.current.tier = 'STANDARD';
            else if (perfRef.current.tier === 'STANDARD') perfRef.current.tier = 'ULTRA';
            perfRef.current.highFpsStart = null;
          }
        }
      }

      const currentTier = perfRef.current.tier;
      const maxDistance = isMobile ? 80 : currentTier === 'ULTRA' ? 120 : currentTier === 'STANDARD' ? 95 : 70;

      // 3. Theme Factor Interpolation
      const isDark = document.documentElement.classList.contains('dark') || true;
      const targetTheme = isDark ? 0 : 1;
      themeFactorRef.current += (targetTheme - themeFactorRef.current) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Clean up fully faded out leaving nodes
      nodesRef.current = nodesRef.current.filter((n) => !n.isLeaving || n.alpha > 0.01);

      const mouse = mousePosRef.current;
      const activeCat = activeCategory;

      // 4. Update Node Positions & Interpolations
      nodesRef.current.forEach((n) => {
        // Base Position Interpolation (smooth RTL / resize)
        n.baseX += (n.targetBaseX - n.baseX) * 0.08;
        n.baseY += (n.targetBaseY - n.baseY) * 0.08;

        // Alpha Interpolation
        n.alpha += (n.targetAlpha - n.alpha) * 0.08;

        if (!isStatic && !prefersReducedMotion) {
          // Floating Oscillation
          n.phase += n.speed;
          const floatX = Math.sin(n.phase) * 10;
          const floatY = Math.cos(n.phase * 0.8) * 8;

          // Pointer Physics (Restrained desktop force field)
          if (mouse && currentTier !== 'ECO') {
            const dx = mouse.x - (n.baseX + floatX);
            const dy = mouse.y - (n.baseY + floatY);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const forceRadius = 140;

            if (dist < forceRadius && dist > 0) {
              const force = (1 - dist / forceRadius) * (currentTier === 'ULTRA' ? 12 : 6);
              n.forceX += ((dx / dist) * force - n.forceX) * 0.1;
              n.forceY += ((dy / dist) * force - n.forceY) * 0.1;
            } else {
              n.forceX *= 0.9;
              n.forceY *= 0.9;
            }
          } else {
            n.forceX *= 0.9;
            n.forceY *= 0.9;
          }

          n.x = n.baseX + floatX + n.forceX;
          n.y = n.baseY + floatY + n.forceY;
        } else {
          n.x = n.baseX;
          n.y = n.baseY;
        }

        // Active Category Radius & Glow Scale
        const isCatActive = activeCat === n.category;
        const targetRadius = n.radius * (isCatActive ? 1.8 : 1.0);
        n.currentRadius += (targetRadius - n.currentRadius) * 0.1;

        // Render Node
        ctx.beginPath();
        let colorStr = `rgba(255, 255, 255, ${n.alpha * 0.3})`;

        if (n.category === 'covers')
          colorStr = isCatActive
            ? `rgba(245, 158, 11, ${n.alpha * 0.95})`
            : activeCat
            ? `rgba(245, 158, 11, ${n.alpha * 0.2})`
            : `rgba(245, 158, 11, ${n.alpha * 0.6})`;
        if (n.category === 'booklets')
          colorStr = isCatActive
            ? `rgba(251, 191, 36, ${n.alpha * 0.95})`
            : activeCat
            ? `rgba(251, 191, 36, ${n.alpha * 0.2})`
            : `rgba(251, 191, 36, ${n.alpha * 0.6})`;
        if (n.category === 'software')
          colorStr = isCatActive
            ? `rgba(59, 130, 246, ${n.alpha * 0.95})`
            : activeCat
            ? `rgba(59, 130, 246, ${n.alpha * 0.2})`
            : `rgba(59, 130, 246, ${n.alpha * 0.6})`;
        if (n.category === 'scripts')
          colorStr = isCatActive
            ? `rgba(16, 185, 129, ${n.alpha * 0.95})`
            : activeCat
            ? `rgba(16, 185, 129, ${n.alpha * 0.2})`
            : `rgba(16, 185, 129, ${n.alpha * 0.6})`;
        if (n.category === 'articles')
          colorStr = isCatActive
            ? `rgba(168, 85, 247, ${n.alpha * 0.95})`
            : activeCat
            ? `rgba(168, 85, 247, ${n.alpha * 0.2})`
            : `rgba(168, 85, 247, ${n.alpha * 0.6})`;

        if (isCatActive) {
          ctx.shadowBlur = 14;
          ctx.shadowColor = colorStr;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.arc(n.x, n.y, n.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = colorStr;
        ctx.fill();
      });

      // 5. Spatial Grid Partitioning for O(N) Connection Checks
      const cellSize = maxDistance;
      const grid: Map<string, Node[]> = new Map();

      nodesRef.current.forEach((node) => {
        const cellX = Math.floor(node.x / cellSize);
        const cellY = Math.floor(node.y / cellSize);
        const key = `${cellX},${cellY}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(node);
      });

      let checkCount = 0;

      // Draw Connections using spatial grid neighbor queries
      grid.forEach((cellNodes, cellKey) => {
        const [cx, cy] = cellKey.split(',').map(Number);

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighborKey = `${cx + dx},${cy + dy}`;
            const neighborNodes = grid.get(neighborKey);
            if (!neighborNodes) continue;

            cellNodes.forEach((n1) => {
              neighborNodes.forEach((n2) => {
                // Avoid duplicate comparisons & self-comparison
                if (n1.id >= n2.id) return;
                checkCount++;

                const dX = n1.x - n2.x;
                const dY = n1.y - n2.y;
                const dist = Math.sqrt(dX * dX + dY * dY);

                if (dist < maxDistance) {
                  const isLineActive = activeCat === n1.category || activeCat === n2.category;
                  const sameCategory = n1.category === n2.category;

                  let baseAlpha = (1 - dist / maxDistance) * (sameCategory ? 0.3 : 0.12) * Math.min(n1.alpha, n2.alpha);
                  if (isLineActive) {
                    baseAlpha = (1 - dist / maxDistance) * 0.6;
                  } else if (activeCat) {
                    baseAlpha *= 0.25;
                  }

                  ctx.beginPath();
                  ctx.moveTo(n1.x, n1.y);
                  ctx.lineTo(n2.x, n2.y);

                  let strokeColor = `rgba(255, 255, 255, ${baseAlpha})`;
                  if (sameCategory) {
                    if (n1.category === 'covers' || n1.category === 'booklets')
                      strokeColor = `rgba(245, 158, 11, ${baseAlpha})`;
                    if (n1.category === 'software') strokeColor = `rgba(59, 130, 246, ${baseAlpha})`;
                    if (n1.category === 'scripts') strokeColor = `rgba(16, 185, 129, ${baseAlpha})`;
                    if (n1.category === 'articles') strokeColor = `rgba(168, 85, 247, ${baseAlpha})`;
                  }

                  ctx.strokeStyle = strokeColor;
                  ctx.lineWidth = isLineActive ? 1.6 : 0.8;
                  ctx.stroke();
                }
              });
            });
          }
        }
      });

      perfRef.current.checksCount = checkCount;

      // Update Dev HUD stats if enabled
      if (showDevHUD && !isStatic && perfRef.current.frameCount % 10 === 0) {
        const effectiveDPR = updateCanvasDPI();
        setDiagnostics({
          fps: Math.round(avgFps),
          tier: currentTier,
          nodeCount: nodesRef.current.length,
          checks: checkCount,
          dpr: effectiveDPR,
        });
      }

      perfRef.current.frameCount++;
    };

    // Safe RAF Animation Loop with Failure Recovery
    const animate = (timestamp: number) => {
      try {
        drawConstellation(timestamp);
        perfRef.current.errorCount = 0; // Reset error count on successful frame
      } catch (err) {
        console.error('Constellation engine rendering error:', err);
        perfRef.current.errorCount++;
        if (perfRef.current.errorCount > 3) {
          console.warn('Constellation engine disabled due to repeated errors.');
          stopLoop();
          return;
        }
      }

      if (isLoopRunningRef.current) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      }
    };

    const startLoop = () => {
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(animate);
      }
    };

    const stopLoop = () => {
      isLoopRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };

    if (isMobile || prefersReducedMotion) {
      renderStaticFrame();
    } else if (isIntersectingRef.current) {
      startLoop();
    }

    // Cleanup Lifecycle
    return () => {
      stopLoop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [coversCount, bookletsCount, softwareCount, scriptsCount, articlesCount, activeCategory, isRTL, showDevHUD]);

  // Pointer Movement Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 w-full h-full pointer-events-auto overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none block" />

      {/* Dev Diagnostics HUD (Dev Mode Shift+D Only) */}
      {process.env.NODE_ENV !== 'production' && showDevHUD && (
        <div className="absolute top-2 left-2 z-50 p-2.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 text-[10px] font-mono text-gray-300 space-y-1 shadow-2xl pointer-events-none">
          <div className="text-amber-400 font-bold uppercase tracking-widest border-b border-white/10 pb-1 mb-1">
            Constellation Engine
          </div>
          <div>
            FPS: <span className="text-white font-bold">{diagnostics.fps}</span>
          </div>
          <div>
            Tier:{' '}
            <span
              className={
                diagnostics.tier === 'ULTRA'
                  ? 'text-emerald-400 font-bold'
                  : diagnostics.tier === 'STANDARD'
                  ? 'text-amber-400 font-bold'
                  : 'text-rose-400 font-bold'
              }
            >
              {diagnostics.tier}
            </span>
          </div>
          <div>
            Active Nodes: <span className="text-white font-bold">{diagnostics.nodeCount}</span>
          </div>
          <div>
            Connection Checks: <span className="text-white font-bold">{diagnostics.checks}</span>
          </div>
          <div>
            Effective DPR: <span className="text-white font-bold">{diagnostics.dpr}</span>
          </div>
        </div>
      )}
    </div>
  );
}
