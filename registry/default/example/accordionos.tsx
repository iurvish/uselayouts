"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// ==========================================
// 1. HYDRATION-SAFE TOOLTIP COMPONENTS
// ==========================================

export function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

export function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

export function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      suppressHydrationWarning
      {...props}
    />
  );
}

export function TooltipContent({
  className = "",
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={`z-50 overflow-hidden rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-neutral-50 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 ${className}`}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

// ==========================================
// 2. ACTION BUTTON COMPONENT
// ==========================================

export interface ActionButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function ActionButton({
  label,
  active = false,
  disabled = false,
  onClick,
  icon,
  children,
}: ActionButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled={disabled}
        suppressHydrationWarning
        className="inline-flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
      >
        {icon || children}
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild suppressHydrationWarning>
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          suppressHydrationWarning
          className={`inline-flex size-9 items-center justify-center rounded-lg border-0 transition-colors ${
            active
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          } disabled:pointer-events-none disabled:opacity-40`}
        >
          {icon || children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ==========================================
// 3. ACCORDION OS COMPONENT
// ==========================================

export interface AccordionItem {
  id?: string | number;
  title: string;
  badge?: string;
  claim: string;
  image: string;
  alt?: string;
}

export interface AccordionOSProps {
  items?: AccordionItem[];
  staticImage?: string;
  defaultActiveIndex?: number | null;
  className?: string;
  containerHeight?: number | string;
  containerWidth?: number | string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  onItemChange?: (index: number | null) => void;
}

// Direct High-Speed CDN Monochrome Images (Works out of the box everywhere)
const DEFAULT_ITEMS: AccordionItem[] = [
  {
    id: 1,
    title: "Dynamic Visuals",
    badge: "01",
    claim:
      "Transform static layouts into responsive, interactive canvases with fluid spring physics and cinematic transitions.",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    alt: "Dynamic Visuals presentation",
  },
  {
    id: 2,
    title: "Spatial Layering",
    badge: "02",
    claim:
      "Glassmorphic frosted depth with real-time blur, reactive light tracking, and tactile micro-interactions.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    alt: "Spatial Layering presentation",
  },
  {
    id: 3,
    title: "Adaptive Accordion",
    badge: "03",
    claim:
      "Collapsible drawer units that automatically recalculate physics coordinates with layout morphing.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    alt: "Adaptive Accordion presentation",
  },
  {
    id: 4,
    title: "Gestural Control",
    badge: "04",
    claim:
      "Full tactile navigation supporting keyboard shortcuts, rapid arrow stepping, and intuitive touch feedback.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    alt: "Gestural Control presentation",
  },
  {
    id: 5,
    title: "Ultra Performance",
    badge: "05",
    claim:
      "GPU-accelerated hardware layers engineered for 120fps buttery smoothness across all screen resolutions.",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    alt: "Ultra Performance presentation",
  },
];

const DEFAULT_STATIC_IMAGE = "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80";

const springPhysics = {
  type: "spring" as const,
  stiffness: 340,
  damping: 28,
  mass: 0.8,
};

const bouncySpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 22,
};

export function AccordionOS({
  items = DEFAULT_ITEMS,
  staticImage = DEFAULT_STATIC_IMAGE,
  defaultActiveIndex = 0,
  className = "",
  containerHeight = 520,
  containerWidth = 840,
  autoPlay = true,
  autoPlayInterval = 3500,
  pauseOnHover = true,
  onItemChange,
}: AccordionOSProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultActiveIndex);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt / flashlight tracking effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 200, damping: 25 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 200, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleToggle = useCallback(
    (index: number) => {
      setActiveIndex((prev) => {
        const next = prev === index ? null : index;
        onItemChange?.(next);
        return next;
      });
    },
    [onItemChange]
  );

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      const next = prev > 0 ? prev - 1 : items.length - 1;
      onItemChange?.(next);
      return next;
    });
  }, [items.length, onItemChange]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      const next = prev < items.length - 1 ? prev + 1 : 0;
      onItemChange?.(next);
      return next;
    });
  }, [items.length, onItemChange]);

  // Automatic slide changing (AutoPlay)
  useEffect(() => {
    if (!autoPlay || (pauseOnHover && isHovered)) return;

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, pauseOnHover, isHovered, handleNext]);

  // Global Keyboard Navigation (ArrowUp, ArrowDown, W/S, 1-5, Escape)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key.toLowerCase() === "w") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setActiveIndex(null);
        onItemChange?.(null);
      } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
        const num = parseInt(e.key, 10) - 1;
        if (num < items.length) {
          e.preventDefault();
          setActiveIndex(num);
          onItemChange?.(num);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleNext, handlePrev, items.length, onItemChange]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`accordion-os-root ${className}`}
      style={{
        width: typeof containerWidth === "number" ? `${containerWidth}px` : containerWidth,
        maxWidth: "100%",
      }}
    >
      <motion.div
        className="accordion-os-card"
        style={{
          height: typeof containerHeight === "number" ? `${containerHeight}px` : containerHeight,
        }}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Interactive Mouse Light Overlay */}
        <motion.div
          className="accordion-os-glow-effect"
          style={{
            left: smoothMouseX,
            top: smoothMouseY,
          }}
        />

        {/* Left Interactive Column */}
        <div className="accordion-os-sidebar">
          {/* Accordion Items */}
          <div className="accordion-os-items-stack">
            {items.map((item, index) => {
              const isOpen = activeIndex === index;
              return (
                <motion.div
                  key={item.id ?? index}
                  layout
                  transition={springPhysics}
                  onClick={() => handleToggle(index)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isOpen}
                  whileHover={{ scale: isOpen ? 1.01 : 1.03, x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`accordion-os-pill ${isOpen ? "accordion-os-pill-open" : "accordion-os-pill-closed"}`}
                >
                  <div className="accordion-os-title-stack">
                    <motion.div
                      className="accordion-os-icon-btn"
                      animate={{
                        backgroundColor: isOpen ? "rgba(2, 2, 2, 0.9)" : "rgba(255, 255, 255, 0.8)",
                        color: isOpen ? "#ffffff" : "rgb(2, 2, 2)",
                        borderColor: isOpen ? "rgba(0, 0, 0, 0.8)" : "rgba(2, 2, 2, 0.2)",
                      }}
                      whileHover={{ scale: 1.15, rotate: isOpen ? -45 : 90 }}
                      whileTap={{ scale: 0.9 }}
                      transition={bouncySpring}
                    >
                      <motion.svg
                        viewBox="0 0 24 24"
                        className="accordion-os-svg-icon"
                        animate={{ rotate: isOpen ? 135 : 0 }}
                        transition={bouncySpring}
                      >
                        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </motion.svg>
                    </motion.div>

                    <div className="accordion-os-title-wrapper">
                      <span className="accordion-os-title-text">{item.title}</span>
                      {item.badge && (
                        <span className={`accordion-os-pill-badge ${isOpen ? "accordion-os-pill-badge-active" : ""}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="claim-content"
                        initial={{ opacity: 0, height: 0, marginTop: 0, filter: "blur(4px)" }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginTop: 12,
                          filter: "blur(0px)",
                          transition: {
                            height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.3, delay: 0.08 },
                            filter: { duration: 0.3 },
                          },
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          marginTop: 0,
                          filter: "blur(4px)",
                          transition: {
                            height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.18 },
                          },
                        }}
                        className="accordion-os-claim-container"
                      >
                        <motion.p
                          initial={{ y: 8 }}
                          animate={{ y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                          className="accordion-os-claim-text"
                        >
                          {item.claim}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Floating Navigation Deck */}
          <div className="accordion-os-bottom-deck">
            <AnimatePresence>
              {activeIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  transition={bouncySpring}
                  className="accordion-os-nav-stack"
                >
                  <motion.button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous (Up Arrow)"
                    whileHover={{ scale: 1.18, y: -2 }}
                    whileTap={{ scale: 0.88 }}
                    transition={bouncySpring}
                    className="accordion-os-nav-btn"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="accordion-os-nav-svg">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </motion.button>

                  <div className="accordion-os-counter">
                    <span>{String((activeIndex ?? 0) + 1).padStart(2, "0")}</span>
                    <span className="accordion-os-counter-divider">/</span>
                    <span>{String(items.length).padStart(2, "0")}</span>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next (Down Arrow)"
                    whileHover={{ scale: 1.18, y: 2 }}
                    whileTap={{ scale: 0.88 }}
                    transition={bouncySpring}
                    className="accordion-os-nav-btn"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="accordion-os-nav-svg">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Persistent Pre-Decoded Instant GPU Layers */}
        <div className="accordion-os-visual-wrapper">
          {/* Static Default Image */}
          <motion.div
            className="accordion-os-image-layer"
            initial={false}
            animate={{
              opacity: activeIndex === null ? 1 : 0,
              scale: activeIndex === null ? 1 : 1.05,
              zIndex: activeIndex === null ? 2 : 1,
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={staticImage}
              alt="Default Static Visual"
              className="accordion-os-image"
              loading="eager"
              decoding="async"
            />
          </motion.div>

          {/* 5 Slide Images */}
          {items.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <motion.div
                key={item.id ?? idx}
                className="accordion-os-image-layer"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? 1 : 1.05,
                  zIndex: isActive ? 3 : 1,
                }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src={item.image}
                  alt={item.alt || item.title}
                  className="accordion-os-image"
                  loading="eager"
                  decoding="async"
                />
              </motion.div>
            );
          })}

          <div className="accordion-os-vignette-overlay" />
        </div>
      </motion.div>

      {/* Embedded Component Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .accordion-os-root {
          box-sizing: border-box;
          margin: 0 auto;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          user-select: none;
          perspective: 1200px;
        }

        .accordion-os-card {
          position: relative;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: stretch;
          background-color: #f6f6f8;
          border-radius: 36px;
          padding: 24px;
          overflow: hidden;
          box-shadow:
            0 24px 48px -12px rgba(0, 0, 0, 0.08),
            0 4px 16px -2px rgba(0, 0, 0, 0.03),
            inset 0 0 0 1px rgba(255, 255, 255, 0.8),
            inset 0 1px 2px rgba(255, 255, 255, 0.9);
          width: 100%;
          box-sizing: border-box;
        }

        .accordion-os-glow-effect {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%);
          border-radius: 9999px;
          pointer-events: none;
          transform: translate(-50%, -50%);
          z-index: 5;
          mix-blend-mode: overlay;
        }

        .accordion-os-sidebar {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          width: 290px;
          height: 100%;
          flex-shrink: 0;
          pointer-events: auto;
        }

        .accordion-os-items-stack {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
          z-index: 10;
        }

        .accordion-os-pill {
          width: fit-content;
          max-width: 290px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background-color: rgba(245, 245, 247, 0.72);
          border-radius: 22px;
          padding: 13px 18px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          outline: none;
          box-sizing: border-box;
        }

        .accordion-os-pill:hover {
          border-color: rgba(0, 0, 0, 0.12);
          background-color: rgba(255, 255, 255, 0.92);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .accordion-os-pill:focus-visible {
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
        }

        .accordion-os-pill-open {
          width: 290px;
          background-color: rgba(255, 255, 255, 0.9);
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .accordion-os-title-stack {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .accordion-os-icon-btn {
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          border: 1.5px solid rgba(2, 2, 2, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: rgb(2, 2, 2);
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
        }

        .accordion-os-svg-icon {
          width: 13px;
          height: 13px;
        }

        .accordion-os-title-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 8px;
        }

        .accordion-os-title-text {
          font-size: 15px;
          font-weight: 600;
          color: #111111;
          letter-spacing: -0.015em;
          white-space: nowrap;
        }

        .accordion-os-pill-badge {
          font-size: 10px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.35);
          font-variant-numeric: tabular-nums;
        }

        .accordion-os-pill-badge-active {
          color: rgba(0, 0, 0, 0.75);
        }

        .accordion-os-claim-container {
          overflow: hidden;
          width: 100%;
        }

        .accordion-os-claim-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #4b5563;
          word-break: break-word;
        }

        .accordion-os-bottom-deck {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          z-index: 10;
          margin-top: auto;
          padding-top: 18px;
        }

        .accordion-os-nav-stack {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 4px 6px;
          border-radius: 100px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .accordion-os-nav-btn {
          all: unset;
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1f2937;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .accordion-os-nav-svg {
          width: 13px;
          height: 13px;
        }

        .accordion-os-counter {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          padding: 0 4px;
          font-variant-numeric: tabular-nums;
        }

        .accordion-os-counter-divider {
          opacity: 0.4;
        }

        .accordion-os-visual-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .accordion-os-image-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          will-change: opacity, transform;
        }

        .accordion-os-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          border-radius: 36px;
          display: block;
        }

        .accordion-os-vignette-overlay {
          position: absolute;
          inset: 0;
          border-radius: 36px;
          background: linear-gradient(
            to right,
            rgba(246, 246, 248, 0.6) 0%,
            rgba(246, 246, 248, 0.2) 35%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .accordion-os-card {
            flex-direction: column;
            justify-content: flex-start;
            height: auto !important;
            min-height: 560px;
            padding: 18px;
            border-radius: 28px;
          }

          .accordion-os-sidebar {
            width: 100%;
            height: auto;
          }

          .accordion-os-pill {
            max-width: 100%;
          }

          .accordion-os-pill-open {
            width: 100%;
            max-width: 100%;
          }

          .accordion-os-bottom-deck {
            margin-top: 18px;
            margin-bottom: 12px;
          }
        }
      ` }} />
    </div>
  );
}

// ==========================================
// 4. MAIN PAGE / APP EXPORT
// ==========================================

export default function Page() {
  return (
    <TooltipProvider delayDuration={0}>
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#f0f2f5" }}>
        <AccordionOS
          containerWidth={840}
          containerHeight={520}
          autoPlay={true}
          autoPlayInterval={3500}
          pauseOnHover={true}
          onItemChange={(idx) => console.log("Active slide:", idx)}
        />
      </main>
    </TooltipProvider>
  );
}