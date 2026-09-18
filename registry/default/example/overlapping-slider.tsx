"use client";

import React, { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function sliderStep(cardWidth: number, overlapFactor: number, cardGap: number) {
  return Math.round(cardWidth - cardWidth * overlapFactor + cardGap);
}

export function snapSliderIndex(
  offsetX: number,
  step: number,
  velocity: number,
  total: number,
) {
  if (total <= 1) return 0;
  let index = -offsetX / step;
  if (velocity < -350) index = Math.ceil(index);
  else if (velocity > 350) index = Math.floor(index);
  else index = Math.round(index);
  return Math.max(0, Math.min(index, total - 1));
}

export type OverlappingSliderProps<T> = {
  items?: T[];
  renderItem?: (item: T, index: number, isActive: boolean) => ReactNode;
  children?: ReactNode;
  cardWidth?: number;
  cardHeight?: number;
  overlapFactor?: number;
  cardGap?: number;
  maxRotation?: number;
  transformOrigin?: string;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  onActiveChange?: (index: number) => void;
};

export function OverlappingSlider<T>({
  items,
  renderItem,
  children,
  cardWidth = 300,
  cardHeight = 400,
  overlapFactor = 0.55,
  cardGap = 18,
  maxRotation = 5,
  transformOrigin = "0% 80%",
  showDots = true,
  showArrows = true,
  className = "",
  onActiveChange,
}: OverlappingSliderProps<T>) {
  const childArray = React.Children.toArray(children);
  const total = items ? items.length : childArray.length;
  const step = sliderStep(cardWidth, overlapFactor, cardGap);

  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const dragRef = useRef({
    down: false,
    startX: 0,
    origin: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    moved: 0,
  });

  const apply = (x: number, animate: boolean) => {
    offsetRef.current = x;
    const track = trackRef.current;
    if (!track) return;
    const transition = animate ? "transform 300ms ease-out" : "none";
    track.style.transition = transition;
    track.style.setProperty("--ox", `${x}px`);
    for (let i = 0; i < track.children.length; i++) {
      const card = track.children[i] as HTMLElement;
      const diff = (x + i * step) / step;
      const rotate = Math.min(Math.max(diff * 2.2, -maxRotation), maxRotation);
      const scale = Math.max(0.92, 1 - Math.abs(diff) * 0.038);
      const y = Math.abs(diff) * 5;
      card.style.transition = transition;
      card.style.setProperty("--y", `${y}px`);
      card.style.setProperty("--r", `${rotate}deg`);
      card.style.setProperty("--s", String(scale));
    }
  };

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(index, total - 1));
    setActiveIndex(next);
    apply(-next * step, true);
    onActiveChange?.(next);
  };

  useLayoutEffect(() => {
    apply(offsetRef.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drag writes transforms on the track; this only re-paints when card metrics change
  }, [cardWidth, cardHeight, overlapFactor, cardGap, maxRotation, total]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const drag = dragRef.current;
    drag.down = true;
    drag.startX = e.clientX;
    drag.origin = offsetRef.current;
    drag.lastX = e.clientX;
    drag.lastT = performance.now();
    drag.velocity = 0;
    drag.moved = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.down) return;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastT);
    drag.velocity = ((e.clientX - drag.lastX) / dt) * 1000;
    drag.lastX = e.clientX;
    drag.lastT = now;
    drag.moved = Math.max(drag.moved, Math.abs(e.clientX - drag.startX));
    const x = drag.origin + (e.clientX - drag.startX);
    apply(x, false);
    const predicted = Math.max(0, Math.min(Math.round(-x / step), total - 1));
    if (predicted !== activeIndex) {
      setActiveIndex(predicted);
      onActiveChange?.(predicted);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.down) return;
    drag.down = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    goTo(snapSliderIndex(offsetRef.current, step, drag.velocity, total));
  };

  return (
    <div className={`relative flex w-full select-none flex-col items-center ${className}`}>
      <div
        className="flex w-full cursor-grab touch-pan-y items-center overflow-hidden py-6 active:cursor-grabbing"
        style={{ minHeight: cardHeight + 40 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={trackRef}
          className="flex items-center pl-6 sm:pl-14"
          style={{ transform: "translate3d(var(--ox, 0px), 0, 0)" }}
        >
          {Array.from({ length: total }, (_, index) => (
            <div
              key={items ? String((items[index] as { id?: string }).id ?? index) : index}
              className="shrink-0"
              style={{
                width: cardWidth,
                height: cardHeight,
                marginRight: -cardWidth * overlapFactor,
                zIndex: index + 1,
                transformOrigin,
                transform: "translateY(var(--y, 0px)) rotate(var(--r, 0deg)) scale(var(--s, 1))",
              }}
              onClick={() => {
                if (dragRef.current.moved < 8) goTo(index);
              }}
            >
              {items && renderItem
                ? renderItem(items[index], index, activeIndex === index)
                : childArray[index]}
            </div>
          ))}
        </div>
      </div>

      {(showDots || showArrows) && (
        <div className="mt-2 flex w-full max-w-4xl items-center justify-between px-6">
          {showDots && (
            <div className="flex items-center gap-2">
              {Array.from({ length: total }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
                    activeIndex === i
                      ? "w-8 bg-neutral-900"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
          {showArrows && (
            <div className="ml-auto flex items-center gap-2">
              <ArrowButton
                label="Previous"
                disabled={activeIndex === 0}
                onClick={() => goTo(activeIndex - 1)}
              >
                ←
              </ArrowButton>
              <ArrowButton
                label="Next"
                disabled={activeIndex === total - 1}
                onClick={() => goTo(activeIndex + 1)}
              >
                →
              </ArrowButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full border border-black/8 bg-white text-neutral-800 shadow-sm transition enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export type CardProfile = {
  id: string;
  name: string;
  handle: string;
  role: string;
  image: string;
  gradient?: string;
};

export const DEFAULT_PROFILES: CardProfile[] = [
  {
    id: "1",
    name: "Sophie Bennett",
    handle: "@sophie34",
    role: "Product Designer",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    gradient: "linear-gradient(transparent, rgb(212 123 91))",
  },
  {
    id: "2",
    name: "Luna Hart",
    handle: "@lunahart",
    role: "UI/UX Designer",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    gradient: "linear-gradient(transparent, rgb(184 212 91))",
  },
  {
    id: "3",
    name: "Maya Rivera",
    handle: "@mayacodes",
    role: "Frontend Developer",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    gradient: "linear-gradient(transparent, rgb(153 209 255))",
  },
  {
    id: "4",
    name: "Zoe Bennett",
    handle: "@zoe",
    role: "Product Designer",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    gradient: "linear-gradient(transparent, rgb(190 149 255))",
  },
  {
    id: "5",
    name: "Isla Morgan",
    handle: "@islaui",
    role: "UI/UX Designer",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    gradient: "linear-gradient(transparent, rgb(255 175 90))",
  },
  {
    id: "6",
    name: "Sofia Laurent",
    handle: "@itssofia",
    role: "Product Designer",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    gradient: "linear-gradient(transparent, rgb(110 231 183))",
  },
];

export function ProfileCard({ card }: { card: CardProfile }) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-neutral-900 p-5 shadow-2xl">
      <img
        src={card.image}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
        style={{ background: card.gradient }}
      />

      <div className="relative flex items-center justify-center gap-1.5">
        <h3 className="text-[22px] font-bold leading-tight tracking-tight text-white drop-shadow-md">
          {card.name}
        </h3>
        <svg className="size-5 shrink-0 text-white drop-shadow" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M10 0 12.3 2.1c.4.4.9.6 1.4.6h3c.7 0 1.3.6 1.3 1.3v3c0 .5.2 1 .6 1.4L20 10l-2.1 2.3c-.4.4-.6.9-.6 1.4v3c0 .7-.6 1.3-1.3 1.3h-3c-.5 0-1 .2-1.4.6L10 20l-2.3-2.1c-.4-.4-.9-.6-1.4-.6h-3C2.6 17.3 2 16.7 2 16v-3c0-.5-.2-1-.6-1.4L0 10l2.1-2.3c.4-.4.6-.9.6-1.4v-3C2.7 2.6 3.3 2 4 2h3c.5 0 1-.2 1.4-.6L10 0Z" />
          <path fill="#111" d="M8.7 13.2 5.9 10.4l1.1-1.1 1.7 1.7 4.3-4.3 1.1 1.1z" />
        </svg>
      </div>

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={card.image}
            alt=""
            draggable={false}
            className="size-11 shrink-0 rounded-full object-cover ring-2 ring-white/20"
          />
          <div className="min-w-0 text-left">
            <div className="truncate text-sm font-medium text-white drop-shadow">{card.handle}</div>
            <div className="truncate text-xs text-white/90">{card.role}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFollowing((v) => !v);
          }}
          className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-medium shadow transition active:scale-95 ${
            following ? "bg-white/30 text-white backdrop-blur-md" : "bg-white text-black"
          }`}
        >
          <svg className="size-3 fill-current" viewBox="0 0 12 12" aria-hidden>
            <path d="M7 0H5v5H0v2h5v5h2V7h5V5H7z" />
          </svg>
          {following ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
}

export default function OverlappingSliderDemo() {
  return (
    <OverlappingSlider
      items={DEFAULT_PROFILES}
      renderItem={(card) => <ProfileCard card={card} />}
    />
  );
}
