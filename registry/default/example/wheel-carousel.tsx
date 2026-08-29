import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  memo,
} from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface WheelCarouselItem {
  id?: string | number;
  label: string;
  image?: string;
  category?: string;
  description?: string;
  [key: string]: any;
}

export type WheelCarouselMode = 'light' | 'dark' | 'custom';
export type PhotoAspect = '3/4' | '1/1' | '4/3' | '16/9' | string;

export interface WheelCarouselRef {
  scrollToIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  getSelectedIndex: () => number;
  getSelectedItem: () => WheelCarouselItem | undefined;
}

export interface WheelCarouselProps {
  items?: WheelCarouselItem[];
  mode?: WheelCarouselMode;
  photoSide?: 'left' | 'right';
  photoWidth?: number;
  photoAspect?: PhotoAspect;
  contentWidth?: number;
  gap?: number;
  photoRadius?: number;
  crossfade?: number;
  radius?: number;
  spacing?: number;
  visibleItems?: number;
  apexInset?: number;
  itemFont?: React.CSSProperties;
  textColor?: string;
  selectedColor?: string;
  showMarker?: boolean;
  markerColor?: string;
  markerSize?: number;
  markerGap?: number;
  background?: string;
  scrollSpeed?: number;
  dragSpeed?: number;
  snap?: boolean;
  momentum?: boolean;
  edgeFade?: boolean;
  edgeFadeSize?: number;
  initialIndex?: number;
  onItemChange?: (item: WheelCarouselItem, index: number) => void;
  onItemClick?: (item: WheelCarouselItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

const unsplash4K = (id: string) =>
  `https://images.unsplash.com/photo-${id}?q=95&w=2400&auto=format&fit=crop`;

export const defaultCarouselItems: WheelCarouselItem[] = [
  { id: 1, label: 'Aethel Sanctuary', image: unsplash4K('1600585154340-be6161a56a0c'), category: 'Architecture' },
  { id: 2, label: 'Kanso Courtyard', image: unsplash4K('1600596542815-ffad4c1539a9'), category: 'Zen Design' },
  { id: 3, label: 'Vesper Mono', image: unsplash4K('1513694203232-719a280e022f'), category: 'Brutalism' },
  { id: 4, label: 'Sora Atrium', image: unsplash4K('1600607687939-ce8a6c25118c'), category: 'Interior' },
  { id: 5, label: 'Elysian Void', image: unsplash4K('1509316975850-ff9c5deb0cd9'), category: 'Landscape' },
  { id: 6, label: 'Solstice Villa', image: unsplash4K('1600566753376-12c8ab7fb75b'), category: 'Coastal' },
  { id: 7, label: 'Nox Gallery', image: unsplash4K('1600585154526-990dced4db0d'), category: 'Cultural' },
  { id: 8, label: 'Aura Sanctum', image: unsplash4K('1600210492486-724fe5c67fb0'), category: 'Minimalism' },
  { id: 9, label: 'Terraza Brut', image: unsplash4K('1600607687644-c7171b42498f'), category: 'Monolithic' },
  { id: 10, label: 'Calma House', image: unsplash4K('1600566753190-17f0baa2a6c3'), category: 'Residential' },
  { id: 11, label: 'Zenith Rotunda', image: unsplash4K('1600585152220-90363fe7e115'), category: 'Oculus' },
  { id: 12, label: 'Kyoto Basin', image: unsplash4K('1503899036084-c55cdd92da26'), category: 'Japanese Zen' },
];

const THEME_PRESETS = {
  dark: {
    bg: '#09090b',
    text: 'rgba(255, 255, 255, 0.35)',
    sel: '#fafafa',
    marker: '#3b82f6',
    panel: '#18181b',
  },
  light: {
    bg: '#ffffff',
    text: 'rgba(9, 9, 11, 0.28)',
    sel: '#09090b',
    marker: '#2563eb',
    panel: '#f4f4f5',
  },
};

export const Badge: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase transition-colors',
      'border-border/60 bg-background/80 text-foreground backdrop-blur-md shadow-sm',
      className
    )}
    {...props}
  />
);

interface PhotoCardProps {
  image?: string;
  label?: string;
  category?: string;
  aspect: PhotoAspect;
  radius: number;
  widthPercent: number;
  crossfade?: number;
  panel: string;
  isDark: boolean;
  mode?: string;
}

const PhotoCard = memo<PhotoCardProps>(
  ({ image, label, category, aspect, radius, widthPercent, crossfade = 0.45, panel, isDark, mode }) => {
    const [currentImage, setCurrentImage] = useState<string | undefined>(image);
    const [prevImage, setPrevImage] = useState<string | undefined>(undefined);
    const [isCrossfading, setIsCrossfading] = useState<boolean>(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
      if (image !== currentImage) {
        setPrevImage(currentImage);
        setCurrentImage(image);
        setIsCrossfading(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          setIsCrossfading(false);
          setPrevImage(undefined);
        }, crossfade * 1000);
      }
    }, [image, currentImage, crossfade]);

    return (
      <div
        style={{
          flex: `0 0 ${widthPercent}%`,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          contain: 'layout paint',
          padding: '8px 0',
        }}
      >
        <div
          className={cn(
            'relative w-full max-h-full overflow-hidden p-1.5 transition-all duration-500 backdrop-blur-2xl',
            mode === 'dark'
              ? 'bg-zinc-900/60 border border-zinc-800/80 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10'
              : mode === 'custom'
              ? 'bg-[#fff6ec]/75 border border-[#e8792e]/20 shadow-[0_20px_50px_-12px_rgba(180,84,30,0.15)] ring-1 ring-[#e8792e]/10'
              : 'bg-white/60 border border-zinc-200/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] ring-1 ring-black/5'
          )}
          style={{
            borderRadius: radius + 6,
            aspectRatio: aspect,
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
          }}
        >
          <div
            className="relative w-full h-full overflow-hidden transition-colors duration-500"
            style={{
              borderRadius: radius,
              background: panel,
            }}
          >
            {prevImage && (
              <img
                src={prevImage}
                alt=""
                decoding="async"
                loading="eager"
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-all',
                  isCrossfading ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'
                )}
                style={{
                  transitionDuration: `${crossfade}s`,
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform, opacity, filter',
                }}
              />
            )}

            {currentImage ? (
              <img
                src={currentImage}
                alt={label || '4K Minimal Spatial Photography'}
                decoding="async"
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  animation: isCrossfading
                    ? `liquidPhotoEnter ${crossfade}s cubic-bezier(0.16, 1, 0.3, 1)`
                    : 'none',
                  willChange: 'transform, opacity, filter',
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-end p-6 text-muted-foreground bg-gradient-to-br from-zinc-900 to-zinc-950 text-sm">
                {label}
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/10 mix-blend-overlay pointer-events-none" />

            {isCrossfading && (
              <div
                className="absolute -inset-1/4 pointer-events-none mix-blend-screen bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.08)_45%,transparent_70%)]"
                style={{
                  animation: `liquidWavePulse ${crossfade}s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                }}
              />
            )}

            {category && (
              <div className="absolute bottom-3 left-3 pointer-events-none">
                <Badge
                  className={cn(
                    'shadow-sm',
                    isDark
                      ? 'bg-zinc-950/80 border-zinc-800 text-zinc-200'
                      : 'bg-white/90 border-zinc-200 text-zinc-900'
                  )}
                >
                  {category}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PhotoCard.displayName = 'PhotoCard';

export const WheelCarousel = forwardRef<WheelCarouselRef, WheelCarouselProps>(
  (
    {
      items = defaultCarouselItems,
      mode = 'light',
      photoSide = 'left',
      photoWidth = 24,
      photoAspect = '3/4',
      contentWidth = 960,
      gap = 0,
      photoRadius = 12,
      crossfade = 0.45,
      radius = 330,
      spacing = 14,
      visibleItems = 7,
      apexInset = 34,
      itemFont = {
        fontSize: '28px',
        fontWeight: 600,
        letterSpacing: '-0.028em',
        lineHeight: '1.15em',
        fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      },
      textColor,
      selectedColor,
      showMarker = true,
      markerColor,
      markerSize = 16,
      markerGap = 22,
      background,
      scrollSpeed = 0.007,
      dragSpeed = 0.016,
      snap = true,
      momentum = true,
      edgeFade = true,
      edgeFadeSize = 30,
      initialIndex = 0,
      onItemChange,
      onItemClick,
      className = '',
      style = {},
    },
    ref
  ) => {
    const list = items && items.length > 0 ? items : defaultCarouselItems;
    const total = list.length;

    const theme =
      mode === 'custom'
        ? {
            bg: background || '#fff6ec',
            text: textColor || 'rgba(180, 90, 20, 0.45)',
            sel: selectedColor || '#b4541e',
            marker: markerColor || '#e8792e',
            panel: background || '#fff6ec',
          }
        : THEME_PRESETS[mode] || THEME_PRESETS.light;

    const startingIndex = ((Math.round(initialIndex) % total) + total) % total;

    const containerRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const rotPos = useRef<number>(startingIndex);
    const velocity = useRef<number>(0);
    const isDragging = useRef<boolean>(false);
    const animFrameId = useRef<number | null>(null);
    const lastTimestamp = useRef<number>(0);
    const dragStartY = useRef<number>(0);
    const dragStartRot = useRef<number>(startingIndex);
    const prevRot = useRef<number>(startingIndex);
    const targetSnapIndex = useRef<number | null>(null);
    const velocitySamples = useRef<{ delta: number; dt: number }[]>([]);

    const configRef = useRef({
      scrollSpeed,
      dragSpeed,
      snap,
      momentum,
      total,
      radius,
      spacing,
      visibleItems,
      apexInset,
      theme,
    });

    configRef.current = {
      scrollSpeed,
      dragSpeed,
      snap,
      momentum,
      total,
      radius,
      spacing,
      visibleItems,
      apexInset,
      theme,
    };

    const [selectedIndex, setSelectedIndex] = useState<number>(startingIndex);

    useEffect(() => {
      for (let offset = -3; offset <= 3; offset++) {
        const idx = ((selectedIndex + offset) % total + total) % total;
        const imgUrl = list[idx]?.image;
        if (imgUrl) {
          const preloader = new Image();
          preloader.src = imgUrl;
        }
      }
    }, [selectedIndex, list, total]);

    const getShortestDistance = useCallback((diff: number, count: number) => {
      let n = ((diff % count) + count) % count;
      if (n > count / 2) n -= count;
      return n;
    }, []);

    const applyTransforms = useCallback(
      (currentRot: number, currentVelocity: number) => {
        const { total: count, radius: r, spacing: sp, visibleItems: vis, apexInset: apex, theme: th } =
          configRef.current;

        if (markerRef.current) {
          const v = currentVelocity;
          const absV = Math.abs(v);
          const stretchY = 1 + Math.min(absV * 18, 1.35);
          const squishX = 1 / Math.sqrt(stretchY);
          const translateYOffset = v * 35;

          markerRef.current.style.transform = `translate3d(0, -50%, 0) translateY(${translateYOffset.toFixed(2)}px) scale(${squishX.toFixed(3)}, ${stretchY.toFixed(3)})`;
          markerRef.current.style.borderRadius =
            absV > 0.005 ? (v > 0 ? '50% 50% 65% 65%' : '65% 65% 50% 50%') : '50%';
        }

        for (let i = 0; i < count; i++) {
          const el = itemRefs.current[i];
          if (!el) continue;

          const dist = getShortestDistance(i - currentRot, count);
          const absDist = Math.abs(dist);

          if (absDist > vis + 1.2) {
            if (el.style.display !== 'none') el.style.display = 'none';
            continue;
          }

          if (el.style.display !== 'block') el.style.display = 'block';

          const angleDeg = dist * sp;
          const angleRad = (angleDeg * Math.PI) / 180;
          const translateX = -r * (1 - Math.cos(angleRad));
          const translateY = r * Math.sin(angleRad);
          const normalizedDist = Math.min(absDist / vis, 1);
          const opacity = Math.cos((normalizedDist * Math.PI) / 2);
          const scale = 1 - Math.min(absDist * 0.038, 0.42);
          const isSelected = absDist < 0.5;

          el.style.transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0px) translateY(-50%) rotate(${angleDeg.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
          el.style.opacity = Math.max(0, opacity).toFixed(3);
          el.style.color = isSelected ? th.sel : th.text;
          el.style.left = `${apex}%`;
        }
      },
      [getShortestDistance]
    );

    const stepPhysics = useCallback(
      (timestamp: number) => {
        if (!lastTimestamp.current) lastTimestamp.current = timestamp;
        const dt = Math.min(Math.max(timestamp - lastTimestamp.current, 0.5), 32);
        lastTimestamp.current = timestamp;
        const dtSeconds = dt / 1000;

        let keepGoing = false;

        if (isDragging.current) {
          keepGoing = true;
        } else if (targetSnapIndex.current !== null) {
          const diff = getShortestDistance(
            targetSnapIndex.current - rotPos.current,
            configRef.current.total
          );
          if (Math.abs(diff) > 0.0003) {
            const springDecay = 1 - Math.exp(-15 * dtSeconds);
            rotPos.current += diff * springDecay;
            velocity.current = diff * springDecay * 0.5;
            keepGoing = true;
          } else {
            rotPos.current =
              ((targetSnapIndex.current % configRef.current.total) +
                configRef.current.total) %
              configRef.current.total;
            targetSnapIndex.current = null;
            velocity.current = 0;
          }
        } else if (Math.abs(velocity.current) > 0.0003) {
          rotPos.current += velocity.current * (dt / 16.667);
          const decay = configRef.current.momentum ? 0.955 : 0.75;
          velocity.current *= Math.pow(decay, dt / 16.667);
          keepGoing = true;
        } else {
          velocity.current = 0;
          if (configRef.current.snap) {
            const nearest = Math.round(rotPos.current);
            const snapDiff = nearest - rotPos.current;
            if (Math.abs(snapDiff) > 0.0003) {
              const snapEase = 1 - Math.exp(-18 * dtSeconds);
              rotPos.current += snapDiff * snapEase;
              keepGoing = true;
            } else {
              rotPos.current = nearest;
            }
          }
        }

        const currentPos = rotPos.current;
        applyTransforms(currentPos, velocity.current);

        const count = configRef.current.total;
        const rounded = ((Math.round(currentPos) % count) + count) % count;
        setSelectedIndex((prev) => (prev === rounded ? prev : rounded));

        if (keepGoing) {
          animFrameId.current = requestAnimationFrame(stepPhysics);
        } else {
          animFrameId.current = null;
          lastTimestamp.current = 0;
          applyTransforms(currentPos, 0);
        }
      },
      [applyTransforms, getShortestDistance]
    );

    const scheduleLoop = useCallback(() => {
      if (animFrameId.current === null) {
        lastTimestamp.current = 0;
        animFrameId.current = requestAnimationFrame(stepPhysics);
      }
    }, [stepPhysics]);

    const prevSelectedIndexRef = useRef(selectedIndex);
    useEffect(() => {
      if (prevSelectedIndexRef.current !== selectedIndex) {
        prevSelectedIndexRef.current = selectedIndex;
        if (onItemChange) {
          onItemChange(list[selectedIndex], selectedIndex);
        }
      }
    }, [selectedIndex, list, onItemChange]);

    useEffect(() => {
      applyTransforms(rotPos.current, 0);
    }, [theme, applyTransforms]);

    const scrollToIndex = useCallback(
      (idx: number) => {
        targetSnapIndex.current = idx;
        velocity.current = 0;
        scheduleLoop();
      },
      [scheduleLoop]
    );

    const next = useCallback(() => {
      scrollToIndex(selectedIndex + 1);
    }, [scrollToIndex, selectedIndex]);

    const prev = useCallback(() => {
      scrollToIndex(selectedIndex - 1);
    }, [scrollToIndex, selectedIndex]);

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex,
        next,
        prev,
        getSelectedIndex: () => selectedIndex,
        getSelectedItem: () => list[selectedIndex],
      }),
      [scrollToIndex, next, prev, selectedIndex, list]
    );

    const handleWheel = useCallback(
      (e: WheelEvent) => {
        e.preventDefault();
        targetSnapIndex.current = null;
        const delta = e.deltaY;
        rotPos.current += delta * configRef.current.scrollSpeed;
        velocity.current = delta * configRef.current.scrollSpeed * 0.26;
        scheduleLoop();
      },
      [scheduleLoop]
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        isDragging.current = true;
        targetSnapIndex.current = null;
        velocity.current = 0;
        dragStartY.current = e.clientY;
        dragStartRot.current = rotPos.current;
        prevRot.current = rotPos.current;
        velocitySamples.current = [];

        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
        scheduleLoop();
      },
      [scheduleLoop]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current) return;
        const delta = e.clientY - dragStartY.current;
        const nextRot = dragStartRot.current - delta * configRef.current.dragSpeed;
        const rotDelta = nextRot - prevRot.current;

        velocitySamples.current.push({ delta: rotDelta, dt: 16.667 });
        if (velocitySamples.current.length > 4) {
          velocitySamples.current.shift();
        }

        let sumDelta = 0;
        let weightSum = 0;
        velocitySamples.current.forEach((sample, idx) => {
          const weight = idx + 1;
          sumDelta += sample.delta * weight;
          weightSum += weight;
        });

        velocity.current = weightSum > 0 ? (sumDelta / weightSum) * 1.15 : rotDelta;
        prevRot.current = nextRot;
        rotPos.current = nextRot;

        scheduleLoop();
      },
      [scheduleLoop]
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging.current) {
          isDragging.current = false;
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {}
          scheduleLoop();
        }
      },
      [scheduleLoop]
    );

    useEffect(() => {
      const node = containerRef.current;
      if (!node) return;

      node.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        node.removeEventListener('wheel', handleWheel);
        if (animFrameId.current !== null) {
          cancelAnimationFrame(animFrameId.current);
        }
      };
    }, [handleWheel]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
        } else if (e.key === 'Home') {
          e.preventDefault();
          scrollToIndex(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          scrollToIndex(total - 1);
        }
      },
      [next, prev, scrollToIndex, total]
    );

    const activeItem = list[selectedIndex];

    const verticalMask = `linear-gradient(to bottom, transparent 0%, black ${edgeFadeSize}%, black ${100 - edgeFadeSize}%, transparent 100%)`;
    const horizontalMask = `linear-gradient(to right, transparent 0%, black ${edgeFadeSize}%, black ${100 - edgeFadeSize}%, transparent 100%)`;
    const maskValue = edgeFade ? `${verticalMask}, ${horizontalMask}` : 'none';

    return (
      <motion.div
        className={cn(
          'wheel-carousel-container relative w-full h-full flex items-center justify-center overflow-hidden',
          className
        )}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'transparent',
          ...style,
        }}
      >
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex h-full items-stretch select-none touch-none outline-none cursor-grab active:cursor-grabbing"
          style={{
            flexDirection: photoSide === 'right' ? 'row-reverse' : 'row',
            gap,
            width: `min(100%, ${contentWidth}px)`,
            contain: 'layout size',
          }}
        >
          <PhotoCard
            image={activeItem?.image}
            label={activeItem?.label}
            category={activeItem?.category}
            aspect={photoAspect}
            radius={photoRadius}
            widthPercent={photoWidth}
            crossfade={crossfade}
            panel={theme.panel}
            isDark={mode === 'dark'}
            mode={mode}
          />

          <div
            className="relative flex-1 h-full overflow-hidden"
            style={{
              WebkitMaskImage: maskValue,
              maskImage: maskValue,
              WebkitMaskComposite: edgeFade ? 'source-in' : undefined,
              maskComposite: edgeFade ? 'intersect' : undefined,
              contain: 'layout paint',
            }}
          >
            {showMarker && (
              <div
                ref={markerRef}
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300"
                style={{
                  left: `calc(${apexInset}% - ${markerGap}px)`,
                  width: markerSize,
                  height: markerSize,
                  marginLeft: -markerSize,
                  background: theme.marker,
                  borderRadius: '50%',
                  boxShadow: `
                    0 0 24px ${theme.marker}80,
                    0 2px 8px ${theme.marker}50,
                    inset 0 1.5px 2px rgba(255,255,255,0.9),
                    inset 0 -1.5px 2px rgba(0,0,0,0.3)
                  `,
                  willChange: 'transform, border-radius, background-color',
                }}
              />
            )}

            {list.map((item, index) => {
              return (
                <div
                  key={item.id ?? index}
                  ref={(el) => (itemRefs.current[index] = el)}
                  onClick={() => {
                    scrollToIndex(index);
                    if (onItemClick) onItemClick(item, index);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 cursor-pointer select-none whitespace-nowrap will-change-transform"
                  style={{
                    left: `${apexInset}%`,
                    transformOrigin: 'left center',
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                    ...itemFont,
                  }}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }
);

WheelCarousel.displayName = 'WheelCarousel';

export const WheelCarouselDemo: React.FC = () => {
  const [mode, setMode] = useState<WheelCarouselMode>('light');

  const modes: { key: WheelCarouselMode; label: string }[] = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'custom', label: 'Custom' },
  ];

  const customBg = '#fff6ec';
  const customText = 'rgba(180, 90, 20, 0.45)';
  const customSelected = '#b4541e';
  const customMarker = '#e8792e';

  const currentBgColor =
    mode === 'dark' ? '#09090b' : mode === 'custom' ? customBg : '#ffffff';

  const isDark = mode === 'dark';

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBodyBg = body.style.backgroundColor;
    const prevHtmlBg = html.style.backgroundColor;

    body.style.transition = 'background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    html.style.transition = 'background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    body.style.backgroundColor = currentBgColor;
    html.style.backgroundColor = currentBgColor;

    return () => {
      body.style.backgroundColor = prevBodyBg;
      html.style.backgroundColor = prevHtmlBg;
    };
  }, [currentBgColor]);

  return (
    <div
      className="relative w-screen h-screen flex flex-col overflow-hidden transition-colors duration-500 font-sans"
      style={{ backgroundColor: currentBgColor }}
    >
      <div
        className="absolute top-[12%] left-[10%] w-[450px] h-[450px] rounded-full blur-[70px] pointer-events-none opacity-60 transition-all duration-700 animate-pulse"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
            : mode === 'custom'
            ? 'radial-gradient(circle, rgba(232, 121, 46, 0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none opacity-60 transition-all duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(147, 51, 234, 0.12) 0%, transparent 70%)'
            : mode === 'custom'
            ? 'radial-gradient(circle, rgba(180, 84, 30, 0.14) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(191, 219, 254, 0.4) 0%, transparent 70%)',
        }}
      />

      <div className="flex-1 w-full h-full flex items-center justify-center min-h-0 z-10">
        <WheelCarousel
          items={defaultCarouselItems}
          mode={mode}
          photoSide="left"
          photoWidth={24}
          photoAspect="3/4"
          contentWidth={960}
          gap={0}
          photoRadius={12}
          crossfade={0.45}
          radius={330}
          spacing={14}
          visibleItems={7}
          apexInset={34}
          showMarker={true}
          markerSize={16}
          markerGap={22}
          scrollSpeed={0.007}
          dragSpeed={0.016}
          snap={true}
          momentum={true}
          edgeFade={true}
          edgeFadeSize={30}
          background={customBg}
          textColor={customText}
          selectedColor={customSelected}
          markerColor={customMarker}
          style={{ width: '1000px', height: '100%', maxHeight: '900px' }}
        />
      </div>

      <div className="flex justify-center items-center pb-20 pt-2 z-50">
        <div
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-full p-1 shadow-lg backdrop-blur-2xl transition-all duration-300',
            isDark
              ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-400'
              : mode === 'custom'
              ? 'bg-[#fff6ec]/80 border border-[#e8792e]/25 text-[#b4541e]/70'
              : 'bg-zinc-100/90 border border-zinc-200 text-zinc-600'
          )}
        >
          {modes.map(({ key, label }) => {
            const isSelected = key === mode;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? isDark
                      ? 'bg-zinc-100 text-zinc-950 shadow-md'
                      : 'bg-zinc-950 text-zinc-50 shadow-md'
                    : isDark
                    ? 'hover:text-zinc-100 hover:bg-zinc-800/50'
                    : 'hover:text-zinc-900 hover:bg-zinc-200/50'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WheelCarouselDemo;
