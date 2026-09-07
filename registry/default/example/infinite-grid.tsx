'use client';

import React, { useRef, useEffect, useCallback, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GridItem {
  id: string | number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  category?: string;
  customContent?: React.ReactNode;
}

export interface LiquidGlassInfiniteGridProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: GridItem[];
  columns?: number;
  gapVw?: number;
  cardWidthVw?: number;
  enableLiquidBlobs?: boolean;
  onItemClick?: (item: GridItem) => void;
  cardClassName?: string;
  itemClassName?: string;
}

export const DEFAULT_GRID_ITEMS: GridItem[] = [
  {
    id: 'a-01',
    title: 'A-01 OVER-EAR STUDIO',
    subtitle: '$540.00',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=85&w=1200&auto=format&fit=crop',
  },
  {
    id: 'w-02',
    title: 'W-02 CHRONO AUTOMATIC',
    subtitle: '$2,100.00',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=85&w=1200&auto=format&fit=crop',
  },
  {
    id: 'c-03',
    title: 'C-03 MONOCHROME OPTIC',
    subtitle: '$3,450.00',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=85&w=1200&auto=format&fit=crop',
  },
  {
    id: 's-04',
    title: 'S-04 TRANSLUCENT SPEAKER',
    subtitle: '$680.00',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=85&w=1200&auto=format&fit=crop',
  },
  {
    id: 'k-05',
    title: 'K-05 MACHINED KEYBOARD',
    subtitle: '$320.00',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=85&w=1200&auto=format&fit=crop',
  },
  {
    id: 'm-06',
    title: 'M-06 ERGONOMIC POINTER',
    subtitle: '$160.00',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=85&w=1200&auto=format&fit=crop',
  },
  {
    id: 'e-07',
    title: 'E-07 TITANIUM EYEWEAR',
    subtitle: '$410.00',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=85&w=1200&auto=format&fit=crop',
  },
  {
    id: 'l-08',
    title: 'L-08 ARCHITECTURAL LAMP',
    subtitle: '$750.00',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=85&w=1200&auto=format&fit=crop',
  },
];

export interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  item: GridItem;
  aspectRatio?: string;
  imageClassName?: string;
}

export const LiquidGlassCard = forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ item, className, imageClassName, aspectRatio = '1 / 1', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('group flex flex-col items-center gap-[18px] w-full select-none', className)}
        {...props}
      >
        {item.customContent ? (
          item.customContent
        ) : (
          <>
            <div
              className="relative w-full aspect-square overflow-hidden flex items-center justify-center"
              style={{ aspectRatio }}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                  className={cn(
                    'w-full h-full object-contain object-center select-none pointer-events-none transition-transform duration-200 ease-out group-hover:scale-105',
                    imageClassName
                  )}
                  style={{
                    filter: 'grayscale(100%) contrast(108%)',
                    mixBlendMode: 'multiply',
                  }}
                />
              )}
            </div>

            <div className="flex flex-col items-center w-full text-center pointer-events-none">
              <p className="font-mono text-[13px] leading-[1.2em] font-medium uppercase tracking-tight text-neutral-950">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="font-mono text-[13px] leading-[1.2em] font-normal uppercase mt-0.5 text-neutral-400">
                  {item.subtitle}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
);
LiquidGlassCard.displayName = 'LiquidGlassCard';

export const LiquidGlassInfiniteGrid = forwardRef<HTMLDivElement, LiquidGlassInfiniteGridProps>(
  (
    {
      items = DEFAULT_GRID_ITEMS,
      columns = 4,
      gapVw = 2.5,
      cardWidthVw = 24,
      enableLiquidBlobs = true,
      onItemClick,
      className,
      cardClassName,
      itemClassName,
      size: _size,
      ...props
    }: LiquidGlassInfiniteGridProps & { size?: string },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gridMatrixRef = useRef<HTMLDivElement>(null);
    const singleBlockRef = useRef<HTMLDivElement>(null);

    const currentPos = useRef({ x: 0, y: 0 });
    const targetPos = useRef({ x: 0, y: 0 });
    const velocity = useRef({ vx: 0, vy: 0 });
    const blockDim = useRef({ w: 0, h: 0 });

    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const dragStartTarget = useRef({ x: 0, y: 0 });
    const lastPointer = useRef({ x: 0, y: 0, time: 0 });
    const dragDistance = useRef(0);
    const isInitialized = useRef(false);

    const measureAndCenter = useCallback(() => {
      const block = singleBlockRef.current;
      const container = containerRef.current;
      if (!block || !container) return;
      const rect = block.getBoundingClientRect();
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (rect.width > 0 && rect.height > 0 && cw > 0 && ch > 0) {
        blockDim.current = { w: rect.width, h: rect.height };

        if (!isInitialized.current) {
          const initX = -rect.width + (cw - rect.width) / 2;
          const initY = -rect.height + (ch - rect.height) / 2;
          currentPos.current = { x: initX, y: initY };
          targetPos.current = { x: initX, y: initY };
          if (gridMatrixRef.current) {
            gridMatrixRef.current.style.transform = `translate3d(${initX.toFixed(2)}px, ${initY.toFixed(2)}px, 0)`;
          }
          isInitialized.current = true;
        }
      }
    }, []);

    useEffect(() => {
      measureAndCenter();
      const container = containerRef.current;
      const ro = container ? new ResizeObserver(measureAndCenter) : null;
      if (container && ro) ro.observe(container);

      let rafId: number;

      const renderLoop = () => {
        const { w, h } = blockDim.current;

        if (!isDragging.current) {
          if (Math.abs(velocity.current.vx) > 0.01 || Math.abs(velocity.current.vy) > 0.01) {
            velocity.current.vx *= 0.95;
            velocity.current.vy *= 0.95;
            targetPos.current.x += velocity.current.vx;
            targetPos.current.y += velocity.current.vy;
          }
        }

        const lerpFactor = isDragging.current ? 0.16 : 0.09;
        currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerpFactor;
        currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerpFactor;

        if (w > 0 && h > 0) {
          while (currentPos.current.x < -w * 1.75) {
            currentPos.current.x += w;
            targetPos.current.x += w;
            dragStartTarget.current.x += w;
          }
          while (currentPos.current.x > -w * 0.25) {
            currentPos.current.x -= w;
            targetPos.current.x -= w;
            dragStartTarget.current.x -= w;
          }
          while (currentPos.current.y < -h * 1.75) {
            currentPos.current.y += h;
            targetPos.current.y += h;
            dragStartTarget.current.y += h;
          }
          while (currentPos.current.y > -h * 0.25) {
            currentPos.current.y -= h;
            targetPos.current.y -= h;
            dragStartTarget.current.y -= h;
          }
        }

        const skewX = Math.max(Math.min(velocity.current.vx * 0.08, 3), -3);
        const skewY = Math.max(Math.min(velocity.current.vy * 0.08, 3), -3);

        if (gridMatrixRef.current) {
          gridMatrixRef.current.style.transform = `translate3d(${currentPos.current.x.toFixed(2)}px, ${currentPos.current.y.toFixed(2)}px, 0) skew(${skewX.toFixed(2)}deg, ${skewY.toFixed(2)}deg)`;
        }

        rafId = requestAnimationFrame(renderLoop);
      };

      rafId = requestAnimationFrame(renderLoop);

      return () => {
        cancelAnimationFrame(rafId);
        ro?.disconnect();
      };
    }, [measureAndCenter]);

    const handlePointerDown = (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      isDragging.current = true;
      dragDistance.current = 0;
      dragStart.current = { x: e.clientX, y: e.clientY };
      dragStartTarget.current = { ...targetPos.current };
      lastPointer.current = { x: e.clientX, y: e.clientY, time: performance.now() };
      velocity.current = { vx: 0, vy: 0 };

      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
      }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging.current) return;

      const dragMultiplier = 0.85;
      const dx = (e.clientX - dragStart.current.x) * dragMultiplier;
      const dy = (e.clientY - dragStart.current.y) * dragMultiplier;
      dragDistance.current += Math.hypot(e.movementX, e.movementY);

      const now = performance.now();
      const dt = Math.max(now - lastPointer.current.time, 1);

      const vx = ((e.clientX - lastPointer.current.x) / dt) * 12;
      const vy = ((e.clientY - lastPointer.current.y) / dt) * 12;

      velocity.current = {
        vx: velocity.current.vx * 0.25 + vx * 0.75,
        vy: velocity.current.vy * 0.25 + vy * 0.75,
      };

      lastPointer.current = { x: e.clientX, y: e.clientY, time: now };
      targetPos.current.x = dragStartTarget.current.x + dx;
      targetPos.current.y = dragStartTarget.current.y + dy;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
        containerRef.current.releasePointerCapture(e.pointerId);
      }
    };

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const scrollSensitivity = 0.45;
        const deltaX = -e.deltaX * scrollSensitivity;
        const deltaY = -e.deltaY * scrollSensitivity;

        velocity.current.vx = velocity.current.vx * 0.3 + deltaX * 0.7;
        velocity.current.vy = velocity.current.vy * 0.3 + deltaY * 0.7;

        targetPos.current.x += deltaX;
        targetPos.current.y += deltaY;
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const matrix = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ];

    return (
      <div
        ref={ref}
        className={cn('infinite-grid-root relative h-full min-h-dvh w-full overflow-hidden bg-white', className)}
      >
        <style>{`
          @keyframes fluidBlob1 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            33% { transform: translate(8vw, -6vh) scale(1.15) rotate(45deg); }
            66% { transform: translate(-6vw, 8vh) scale(0.9) rotate(-30deg); }
          }
          @keyframes fluidBlob2 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            33% { transform: translate(-10vw, 8vh) scale(1.2) rotate(-50deg); }
            66% { transform: translate(7vw, -5vh) scale(0.85) rotate(35deg); }
          }
          @keyframes fluidBlob3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(5vw, 6vh) scale(1.1); }
          }
          .animate-fluid-1 { animation: fluidBlob1 22s ease-in-out infinite alternate; }
          .animate-fluid-2 { animation: fluidBlob2 26s ease-in-out infinite alternate; }
          .animate-fluid-3 { animation: fluidBlob3 18s ease-in-out infinite alternate; }
        `}</style>

        <section
          ref={containerRef}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative h-full w-full cursor-grab overflow-hidden select-none bg-white active:cursor-grabbing"
          style={{
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            backgroundColor: '#ffffff',
          }}
          {...props}
        >
          {enableLiquidBlobs && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
              <div className="absolute top-1/4 left-1/5 w-[45vw] h-[45vw] rounded-full bg-slate-100 blur-[90px] animate-fluid-1" />
              <div className="absolute top-2/3 right-1/4 w-[50vw] h-[50vw] rounded-full bg-zinc-100 blur-[100px] animate-fluid-2" />
              <div className="absolute -top-1/4 right-1/3 w-[40vw] h-[40vw] rounded-full bg-slate-50 blur-[85px] animate-fluid-3" />
            </div>
          )}

          <div
            ref={gridMatrixRef}
            className="absolute top-0 left-0"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, max-content)',
              gridTemplateRows: 'repeat(3, max-content)',
              width: 'max-content',
              willChange: 'transform',
              transform: 'translate3d(0,0,0)',
              transformOrigin: '50% 50%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {matrix.map((row, rowIndex) =>
              row.map((blockId, colIndex) => {
                const isCenterBlock = rowIndex === 1 && colIndex === 1;
                return (
                  <div
                    key={`block-${blockId}`}
                    ref={isCenterBlock ? singleBlockRef : null}
                    aria-hidden={!isCenterBlock ? 'true' : undefined}
                    style={{
                      display: 'grid',
                      width: 'max-content',
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      alignItems: 'center',
                      gap: `${gapVw}vw`,
                      padding: '1.25vw',
                    }}
                  >
                    {items.map((item) => (
                      <div
                        key={`b${blockId}-${item.id}`}
                        onClick={() => {
                          if (dragDistance.current < 6) onItemClick?.(item);
                        }}
                        style={{
                          width: `${cardWidthVw}vw`,
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                        }}
                        className={cn('select-none', itemClassName)}
                      >
                        <LiquidGlassCard item={item} className={cardClassName} />
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    );
  }
);
LiquidGlassInfiniteGrid.displayName = 'LiquidGlassInfiniteGrid';

export default LiquidGlassInfiniteGrid;
