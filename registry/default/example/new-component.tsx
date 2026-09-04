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
    bg: '#000000',
    text: 'rgba(255, 255, 255, 0.38)',
    sel: '#FFFFFF',
    marker: '#2C6BFF',
    panel: '#121216',
  },
  light: {
    bg: '#FFFFFF',
    text: 'rgba(0, 0, 0, 0.28)',
    sel: '#0A0A0A',
    marker: '#2C6BFF',
    panel: '#EDEDED',
  },
};

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
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: aspect,
            maxHeight: '100%',
            borderRadius: radius + 4,
            padding: 5,
            overflow: 'hidden',
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
            background:
              mode === 'dark'
                ? 'rgba(18, 18, 22, 0.55)'
                : mode === 'custom'
                ? 'rgba(255, 246, 236, 0.6)'
                : 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            border:
              mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.12)'
                : mode === 'custom'
                ? '1px solid rgba(232, 121, 46, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.65)',
            boxShadow:
              mode === 'dark'
                ? '0 25px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 20px 50px -12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: radius,
              overflow: 'hidden',
              background: panel,
              transition: 'background-color 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {prevImage && (
              <img
                src={prevImage}
                alt=""
                decoding="async"
                loading="eager"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: isCrossfading ? 0 : 1,
                  transform: isCrossfading ? 'scale(0.96) translateY(-4px)' : 'scale(1)',
                  filter: isCrossfading ? 'blur(10px)' : 'blur(0px)',
                  transition: `opacity ${crossfade}s cubic-bezier(0.16, 1, 0.3, 1), transform ${crossfade}s cubic-bezier(0.16, 1, 0.3, 1), filter ${crossfade}s ease`,
                  willChange: 'transform, opacity, filter',
                }}
              />
            )}

            {currentImage ? (
              <img
                src={currentImage}
                alt={label || 'Carousel View'}
                decoding="async"
                loading="eager"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 1,
                  transform: 'scale(1)',
                  animation: isCrossfading
                    ? `liquidPhotoEnter ${crossfade}s cubic-bezier(0.16, 1, 0.3, 1)`
                    : 'none',
                  willChange: 'transform, opacity, filter',
                }}
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 24,
                  color: 'rgba(255, 255, 255, 0.6)',
                  background: 'linear-gradient(135deg, #1f1f2e, #0e0e14)',
                  fontSize: 14,
                }}
              >
                {label}
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 35%, transparent 50%, rgba(255,255,255,0.08) 100%)',
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
              }}
            />

            {category && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: isDark ? 'rgba(10, 10, 14, 0.55)' : 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                  border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 8px 24px -4px rgba(0,0,0,0.18)',
                  color: isDark ? '#FFFFFF' : '#111111',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  pointerEvents: 'none',
                }}
              >
                {category}
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
        fontSize: '27px',
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
            bg: background || '#FFF6EC',
            text: textColor || 'rgba(180, 90, 20, 0.45)',
            sel: selectedColor || '#B4541E',
            marker: markerColor || '#E8792E',
            panel: background || '#FFF6EC',
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
            absV > 0.005
              ? v > 0
                ? '50% 50% 65% 65%'
                : '65% 65% 50% 50%'
              : '50%';
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
        className={`wheel-carousel-container ${className}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          ...style,
        }}
      >
        <style>{`
          @keyframes liquidPhotoEnter {
            0% { opacity: 0; transform: scale(1.06) translateY(6px); filter: blur(12px) contrast(1.1); }
            60% { filter: blur(2px) contrast(1.03); }
            100% { opacity: 1; transform: scale(1) translateY(0px); filter: blur(0px) contrast(1); }
          }
        `}</style>

        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            display: 'flex',
            flexDirection: photoSide === 'right' ? 'row-reverse' : 'row',
            gap,
            width: `min(100%, ${contentWidth}px)`,
            height: '100%',
            alignItems: 'stretch',
            touchAction: 'none',
            cursor: isDragging.current ? 'grabbing' : 'grab',
            userSelect: 'none',
            outline: 'none',
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
            style={{
              position: 'relative',
              flex: 1,
              height: '100%',
              overflow: 'hidden',
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
                style={{
                  position: 'absolute',
                  left: `calc(${apexInset}% - ${markerGap}px)`,
                  top: '50%',
                  width: markerSize,
                  height: markerSize,
                  marginLeft: -markerSize,
                  transform: 'translate3d(0, -50%, 0)',
                  borderRadius: '50%',
                  background: theme.marker,
                  pointerEvents: 'none',
                  boxShadow: `
                    0 0 24px ${theme.marker}80,
                    0 2px 8px ${theme.marker}50,
                    inset 0 1.5px 2px rgba(255,255,255,0.9),
                    inset 0 -1.5px 2px rgba(0,0,0,0.3)
                  `,
                  willChange: 'transform, border-radius, background-color',
                  transition: 'background-color 0.35s ease, box-shadow 0.35s ease',
                }}
              />
            )}

            {list.map((item, index) => {
              return (
                <div
                  key={item.id ?? index}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onClick={() => {
                    scrollToIndex(index);
                    if (onItemClick) onItemClick(item, index);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${apexInset}%`,
                    top: '50%',
                    transformOrigin: 'left center',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    userSelect: 'none',
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform, opacity, color',
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
export default function NewComponentDemo({ size }: { size?: string }) {
  return (
    <div
      data-hint-target=""
      className={size === "lg" ? "flex h-[min(78vh,820px)] min-h-[560px] w-full items-center justify-center" : "flex h-[min(70vh,720px)] min-h-[480px] w-full items-center justify-center"}
    >
      <WheelCarousel contentWidth={1100} style={{ width: "100%", height: "100%", maxWidth: "1100px" }} />
    </div>
  );
}
