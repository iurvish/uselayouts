"use client";

import React, { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

/** diff = index − activeExact. Cards to the left recede; the rest stay put. */
export function cardLeave(diff: number) {
  const t = Math.min(1, Math.max(0, -diff));
  return {
    scale: 1 - t * 0.16,
    y: t * 36,
    rotate: 0,
  };
}

export type CardProfile = {
  id: string;
  name: string;
  handle: string;
  role: string;
  image: string;
  gradient?: string;
};

const shot = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

export const DEFAULT_PROFILES: CardProfile[] = [
  {
    id: "1",
    name: "Sophie Bennett",
    handle: "@sophie34",
    role: "Product Designer",
    image: shot("1534528741775-53994a69daeb"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(212, 123, 91) 96.8%)",
  },
  {
    id: "2",
    name: "Luna Hart",
    handle: "@lunahart",
    role: "UI/UX Designer",
    image: shot("1529626455594-4ff0802cfb7e"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(184, 212, 91) 96.8%)",
  },
  {
    id: "3",
    name: "Maya Rivera",
    handle: "@mayacodes",
    role: "Frontend Developer",
    image: shot("1494790108377-be9c29b29330"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(153, 209, 255) 96.8%)",
  },
  {
    id: "4",
    name: "Zoe Bennett",
    handle: "@zoe",
    role: "Product Designer",
    image: shot("1438761681033-6461ffad8d80"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(156, 122, 214) 96.8%)",
  },
  {
    id: "5",
    name: "Isla Morgan",
    handle: "@islaui",
    role: "UI/UX Designer",
    image: shot("1580489944761-15a19d654956"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(214, 176, 72) 96.8%)",
  },
  {
    id: "6",
    name: "Sofia Laurent",
    handle: "@itssofia",
    role: "Product Designer",
    image: shot("1544005313-94ddf0286df2"),
    gradient: "linear-gradient(rgba(255, 252, 252, 0) 0%, rgb(214, 132, 148) 96.8%)",
  },
];

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

export function OverlappingSlider<T = CardProfile>({
  items,
  renderItem,
  children,
  cardWidth = 340,
  cardHeight = 460,
  overlapFactor = 0.04,
  cardGap = 18,
  maxRotation = 0,
  transformOrigin = "50% 90%",
  showDots = false,
  showArrows = true,
  className = "",
  onActiveChange,
}: OverlappingSliderProps<T>) {
  const childArray = React.Children.toArray(children);
  // Docs call `<OverlappingSlider />` with no props — fall back to demo profiles.
  const usingDefaults = items == null && childArray.length === 0;
  const resolvedItems = usingDefaults
    ? (DEFAULT_PROFILES as unknown as T[])
    : items;
  const resolvedRenderItem = usingDefaults
    ? ((item: T) => <ProfileCard card={item as CardProfile} />)
    : renderItem;
  const total = resolvedItems ? resolvedItems.length : childArray.length;
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
    const transition = animate ? "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    track.style.transition = transition;
    track.style.setProperty("--ox", `${x}px`);
    const activeExact = -x / step;
    const active = Math.max(0, Math.min(Math.round(activeExact), total - 1));
    for (let i = 0; i < track.children.length; i++) {
      const card = track.children[i] as HTMLElement;
      const diff = i - activeExact;
      const leave = cardLeave(diff);
      const rotate = maxRotation
        ? Math.min(Math.max(diff * 1.6, -maxRotation), maxRotation)
        : 0;
      card.style.transition = transition;
      card.style.zIndex = String(i);
      card.style.setProperty("--y", `${leave.y}px`);
      card.style.setProperty("--r", `${rotate}deg`);
      card.style.setProperty("--s", String(leave.scale));
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
    <div className={`relative flex w-full select-none flex-col ${className}`}>
      <div
        className="flex w-full cursor-grab touch-pan-y items-center overflow-hidden py-10 active:cursor-grabbing"
        style={{ minHeight: cardHeight + 72 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={trackRef}
          className="flex items-end pl-8 sm:pl-12"
          style={{ transform: "translate3d(var(--ox, 0px), 0, 0)" }}
        >
          {Array.from({ length: total }, (_, index) => (
            <div
              key={
                resolvedItems
                  ? String((resolvedItems[index] as { id?: string }).id ?? index)
                  : index
              }
              className="shrink-0"
              style={{
                width: cardWidth,
                height: cardHeight,
                marginRight: cardGap - cardWidth * overlapFactor,
                zIndex: index,
                transformOrigin,
                transform: "translateY(var(--y, 0px)) rotate(var(--r, 0deg)) scale(var(--s, 1))",
              }}
              onClick={() => {
                if (dragRef.current.moved < 8) goTo(index);
              }}
            >
              {resolvedItems && resolvedRenderItem
                ? resolvedRenderItem(resolvedItems[index], index, activeIndex === index)
                : childArray[index]}
            </div>
          ))}
        </div>
      </div>

      {(showDots || showArrows) && (
        <div className="mt-1 flex w-full items-center px-8 sm:px-12">
          {showArrows && (
            <div className="flex items-center gap-2">
              <ArrowButton
                label="Previous"
                disabled={activeIndex === 0}
                onClick={() => goTo(activeIndex - 1)}
              >
                <ChevronLeft className="size-4" strokeWidth={2.25} />
              </ArrowButton>
              <ArrowButton
                label="Next"
                disabled={activeIndex === total - 1}
                onClick={() => goTo(activeIndex + 1)}
              >
                <ChevronRight className="size-4" strokeWidth={2.25} />
              </ArrowButton>
            </div>
          )}
          {showDots && (
            <div className="ml-auto flex items-center gap-2">
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
      className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white transition enabled:hover:bg-neutral-800 enabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
    >
      {children}
    </button>
  );
}

export function ProfileCard({ card }: { card: CardProfile }) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[40px] bg-neutral-900 p-5">
      <img
        src={card.image}
        alt=""
        draggable={false}
        referrerPolicy="no-referrer"
        className="pointer-events-none absolute inset-0 size-full object-cover object-[50%_18%]"
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
            referrerPolicy="no-referrer"
            className="size-11 shrink-0 rounded-full object-cover object-[50%_18%] ring-2 ring-white/20"
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
          className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-medium shadow transition active:scale-[0.96] ${
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
    <div className="flex h-full w-full flex-col justify-center bg-white">
      <OverlappingSlider
        items={DEFAULT_PROFILES}
        renderItem={(card) => <ProfileCard card={card} />}
      />
    </div>
  );
}
