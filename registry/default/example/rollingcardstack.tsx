"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ==========================================
// 1. INLINE HELPER UTILITY (cn)
// ==========================================
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
export interface CardItem {
  id: string | number;
  caption: string;
  title: string;
  description: string;
  image: string;
  accentColor?: string;
  icon?: React.ReactNode;
  tag?: string;
}

export interface RollingCardStackProps extends React.HTMLAttributes<HTMLDivElement> {
  cards?: CardItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDeviceToggle?: boolean;
  defaultDevice?: "desktop" | "mobile";
  showPagination?: boolean;
  onCardChange?: (index: number, card: CardItem) => void;
}

// ==========================================
// 3. INLINE ICONS
// ==========================================
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CpuIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="9" y="9" width="6" height="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" strokeLinecap="round" />
  </svg>
);

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WavesIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" strokeLinecap="round" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="7" y1="17" x2="17" y2="7" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="7 7 17 7 17 17" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ==========================================
// 4. DEFAULT DATASET
// ==========================================
export const DEFAULT_CARDS: CardItem[] = [
  {
    id: "spatial-design",
    caption: "Spatial Architecture",
    tag: "Minimalist Space",
    title: "Sculpting digital calm",
    description:
      "Craft intentional spaces through minimalist geometry, tactile typography, and harmonious micro-interactions.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-orange-500",
    icon: <BuildingIcon />,
  },
  {
    id: "neural-intelligence",
    caption: "Neural Synthesis",
    tag: "AI Inference",
    title: "Autonomous creative engine",
    description:
      "Synthesize complex datasets into high-fidelity generative interfaces with ultra-low latency inference models.",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-indigo-500",
    icon: <CpuIcon />,
  },
  {
    id: "quantum-computing",
    caption: "Quantum Pipeline",
    tag: "High Speed",
    title: "Pure algorithmic speed",
    description:
      "Accelerate mission-critical workflows with quantum-inspired parallel execution and effortless state caching.",
    image:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-sky-500",
    icon: <ZapIcon />,
  },
  {
    id: "organic-materials",
    caption: "Fluid Dynamics",
    tag: "Kinetic Physics",
    title: "Tactile motion & balance",
    description:
      "Experience natural kinetic inertia designed to mimic liquid viscosity and frictionless physics across every viewport.",
    image:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-purple-500",
    icon: <WavesIcon />,
  },
];

// ==========================================
// 5. MAIN COMPONENT (Solid, Opaque, High-Contrast)
// ==========================================
export const RollingCardStack: React.FC<RollingCardStackProps> = ({
  cards = DEFAULT_CARDS,
  autoPlay = false,
  autoPlayInterval = 4000,
  showDeviceToggle = true,
  showPagination = true,
  defaultDevice = "desktop",
  onCardChange,
  className,
  ...props
}) => {
  const [device, setDevice] = useState<"desktop" | "mobile">(defaultDevice);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const totalCards = cards.length;

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % totalCards;
    setActiveIndex(nextIdx);
    onCardChange?.(nextIdx, cards[nextIdx]);
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + totalCards) % totalCards;
    setActiveIndex(prevIdx);
    onCardChange?.(prevIdx, cards[prevIdx]);
  };

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
    onCardChange?.(index, cards[index]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, totalCards]);

  // Autoplay
  useEffect(() => {
    if (!autoPlay || isHovered) return;
    const timer = setInterval(handleNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, isHovered, activeIndex, totalCards]);

  const isMobile = device === "mobile";

  // Tiered Cascading Layout Offsets
  const desktopWidths = ["100%", "90%", "80%", "70%"];
  const desktopOffsets = [0, 50, 100, 150];

  const mobileWidths = ["100%", "92%", "84%", "76%"];
  const mobileOffsets = [0, 42, 84, 126];

  const springConfig = {
    type: "spring",
    stiffness: 380,
    damping: 30,
    mass: 0.75,
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-[#E5E5E0] text-neutral-900 flex flex-col items-center justify-center p-4 md:p-12 font-sans select-none overflow-hidden relative",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-4xl relative z-10">
        {/* Device Switcher (Solid Opaque Pill) */}
        {showDeviceToggle && (
          <div className="mb-6 shrink-0 flex items-center">
            <div className="relative flex items-center bg-[#111111] rounded-full p-1 h-11 w-44 shadow-md overflow-hidden">
              {/* Sliding Pill Indicator */}
              <motion.div
                layout
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 28,
                  mass: 0.7,
                }}
                className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm z-10"
                style={{
                  left: device === "desktop" ? "4px" : "calc(50% + 2px)",
                  width: "calc(50% - 6px)",
                }}
              />

              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={cn(
                  "relative z-20 w-1/2 h-full flex items-center justify-center gap-1.5 text-xs font-semibold tracking-tight transition-colors duration-200",
                  device === "desktop" ? "text-neutral-950" : "text-neutral-300 hover:text-white"
                )}
              >
                <MonitorIcon />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={cn(
                  "relative z-20 w-1/2 h-full flex items-center justify-center gap-1.5 text-xs font-semibold tracking-tight transition-colors duration-200",
                  device === "mobile" ? "text-neutral-950" : "text-neutral-300 hover:text-white"
                )}
              >
                <PhoneIcon />
                Mobile
              </button>
            </div>
          </div>
        )}

        {/* Card Stage Wrapper (Fixed Height - Stationary Toggle Anchor) */}
        <div className="w-full h-[545px] flex items-center justify-center relative">
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex items-center justify-center w-full transition-all duration-300"
            style={{
              width: isMobile ? "380px" : "800px",
              maxWidth: isMobile ? "92vw" : "800px",
              height: "545px",
            }}
          >
            {cards.map((card, index) => {
              const relativePosition = (index - activeIndex + totalCards) % totalCards;
              const zIndex = totalCards - relativePosition;

              const widthPercent = isMobile
                ? mobileWidths[relativePosition]
                : desktopWidths[relativePosition];

              const yOffset = isMobile
                ? mobileOffsets[relativePosition]
                : desktopOffsets[relativePosition];

              const isTop = relativePosition === 0;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDrag={(_, info) => {
                    if (isTop) setDragOffset(info.offset.x);
                  }}
                  onDragEnd={(_, info) => {
                    setDragOffset(0);
                    if (info.offset.x < -80 || info.velocity.x < -400) {
                      handleNext();
                    } else if (info.offset.x > 80 || info.velocity.x > 400) {
                      handlePrev();
                    }
                  }}
                  layout="position"
                  initial={false}
                  animate={{
                    y: -yOffset,
                    width: widthPercent,
                    rotate: isTop ? dragOffset * 0.04 : 0,
                    zIndex: zIndex,
                    opacity: 1,
                  }}
                  whileHover={
                    !isTop
                      ? {
                          y: -yOffset - 8,
                          transition: { type: "spring", stiffness: 450, damping: 25 },
                        }
                      : {}
                  }
                  whileTap={isTop ? { scale: 0.99 } : { scale: 0.98 }}
                  transition={springConfig}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    margin: "0 auto",
                    transformOrigin: "bottom center",
                    willChange: "transform, width",
                  }}
                  className={cn(
                    "cursor-pointer rounded-2xl bg-[#FFFFFF] shadow-[0_12px_40px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] border border-[#E5E5E0] overflow-hidden group",
                    isMobile ? "h-[390px]" : "h-auto"
                  )}
                >
                  {/* Card Header Container (Solid Opaque Header) */}
                  <div
                    className={cn(
                      "flex items-center justify-between bg-[#FAFAF8] border-b border-[#EDEDE8] select-none transition-colors duration-200",
                      !isTop && "group-hover:bg-[#F2F2EC]",
                      isMobile ? "h-11 px-4 py-2" : "h-14 px-6 py-3.5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
                          card.accentColor || "text-neutral-900"
                        )}
                      >
                        {card.icon}
                      </div>
                      <span className="font-semibold text-sm text-neutral-900 tracking-tight truncate">
                        {card.caption}
                      </span>
                    </div>

                    {/* Tag Badge & Index Counter */}
                    <div className="flex items-center gap-2">
                      {card.tag && (
                        <span className="hidden sm:inline-flex items-center text-xs font-medium text-neutral-600 bg-[#EFEFEA] px-2.5 py-0.5 rounded-full border border-black/5">
                          {card.tag}
                        </span>
                      )}
                      <span className="text-xs font-mono font-medium text-neutral-400">
                        0{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div
                    className={cn(
                      "flex bg-[#FFFFFF]",
                      isMobile
                        ? "flex-col p-0 pb-3"
                        : "flex-row items-start gap-2.5 p-0 pb-6"
                    )}
                  >
                    {/* Text Section */}
                    <div
                      className={cn(
                        "flex flex-col gap-2",
                        isMobile ? "w-full p-4 pb-2" : "flex-1 min-w-[250px] p-8"
                      )}
                    >
                      <h3
                        className={cn(
                          "font-semibold text-neutral-950 leading-tight tracking-tight",
                          isMobile ? "text-lg" : "text-2xl"
                        )}
                      >
                        {card.title}
                      </h3>
                      <p className="font-normal text-neutral-600 leading-relaxed text-sm line-clamp-2">
                        {card.description}
                      </p>

                      {/* Explore Action Link */}
                      {!isMobile && (
                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-neutral-900 group-hover:text-black transition-colors">
                          <span>Explore concept</span>
                          <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                            <ArrowUpRightIcon />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Image Section */}
                    <div
                      className={cn(
                        "flex items-center justify-center",
                        isMobile ? "w-full px-4 pb-2.5" : "flex-1 min-w-[250px] p-6 pt-0"
                      )}
                    >
                      <div
                        className={cn(
                          "relative w-full overflow-hidden rounded-xl bg-neutral-100 border border-black/5",
                          isMobile ? "h-40" : "h-64"
                        )}
                        style={{
                          mask: "radial-gradient(83% 69% at 19.8% 32.7%, rgb(0, 0, 0) 77.65%, rgba(0, 0, 0, 0) 100%)",
                          WebkitMask:
                            "radial-gradient(83% 69% at 19.8% 32.7%, rgb(0, 0, 0) 77.65%, rgba(0, 0, 0, 0) 100%)",
                        }}
                      >
                        <motion.img
                          animate={{ scale: isTop ? 1 : 1.04 }}
                          transition={springConfig}
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover object-center block transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer Pagination Controls */}
        {showPagination && (
          <div className="mt-6 flex items-center justify-between w-full max-w-[380px] md:max-w-3xl px-2 text-neutral-500">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {cards.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCardClick(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="p-1 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-full"
                >
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === activeIndex
                        ? "w-7 bg-neutral-900"
                        : "w-2 bg-neutral-400/60 hover:bg-neutral-600"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Card"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFFFFF] hover:bg-[#F2F2EC] text-neutral-800 border border-[#DCDCD6] shadow-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Card"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFFFFF] hover:bg-[#F2F2EC] text-neutral-800 border border-[#DCDCD6] shadow-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RollingCardStack;