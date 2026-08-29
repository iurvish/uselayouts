"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowUpRight,
  Maximize2,
  X,
  ExternalLink,
  Tag,
  ChevronDown,
} from "lucide-react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Self-contained shadcn cn() utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ScrollStackItem {
  id: string | number;
  tabLabel?: string;
  category: string;
  title: string;
  subtitle?: string;
  description: string;
  detailedOverview?: string;
  tags: string[];
  image: string;
  link?: string;
  linkText?: string;
  accentColor: string;
  ambientGlow?: string;
  textColor?: string;
  year?: string;
  metrics?: { label: string; value: string }[];
}

export interface ScrollStackDeckProps {
  items?: ScrollStackItem[];
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  showScrollPrompt?: boolean;
  scrollPromptText?: string;
  cardOffsetPx?: number;
  scaleFactor?: number;
  enableTilt3D?: boolean;
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
}

export const DEFAULT_STACK_ITEMS: ScrollStackItem[] = [
  {
    id: "aster-house",
    tabLabel: "Aster House",
    category: "Architecture & Web",
    title: "Aster House — Digital Experience for Slow Coastal Living",
    subtitle: "A digital retreat inspired by the quiet Pacific coastline.",
    description:
      "A serene, editorial-first web experience crafted for an architectural coastal sanctuary. Balances organic layout rhythms, bespoke typography, and peaceful micro-interactions.",
    detailedOverview:
      "Aster House was envisioned as an architectural retreat where time decelerates. The digital experience mirrors the physical space: expansive negative space, tactile serif typography, and soundscapes recorded on-site. Built with sub-second transitions and responsive kinetic layouts.",
    tags: ["Web Architecture", "Hospitality", "Editorial Direction", "Kinetic Typography"],
    image:
      "https://framerusercontent.com/images/0wTKAwU0zpsKorADDlDt9S8.jpg?width=4402&height=2935",
    link: "#",
    linkText: "Launch Experience",
    accentColor: "#EDC89A",
    ambientGlow: "rgba(237, 200, 154, 0.45)",
    textColor: "#1A1612",
    year: "2026",
    metrics: [
      { label: "Performance", value: "99/100" },
      { label: "Recognition", value: "Site of the Day" },
      { label: "Location", value: "Big Sur, CA" },
    ],
  },
  {
    id: "morrow-finance",
    tabLabel: "Morrow",
    category: "Fintech & Product",
    title: "Morrow — Next-Gen Financial Studio for Creative Solopreneurs",
    subtitle: "Automated liquidity and contextual invoice streams.",
    description:
      "An intelligent, tactile financial operating platform that frees independent creators from spreadsheets through predictive cash flows and frictionless payout pipelines.",
    detailedOverview:
      "Morrow combines banking primitives with modern design sensibilities. We replaced traditional multi-column ledger tables with visual energy currents and interactive spatial charts, resulting in a 4.2x increase in daily active session duration.",
    tags: ["Fintech OS", "Design System", "Product Strategy", "Spatial UI"],
    image:
      "https://framerusercontent.com/images/s7ebKR0Yv0JQR2hvDhVOcYzhgKQ.jpg?width=6000&height=3376",
    link: "#",
    linkText: "Explore Platform",
    accentColor: "#EDE89A",
    ambientGlow: "rgba(237, 232, 154, 0.45)",
    textColor: "#17180F",
    year: "2026",
    metrics: [
      { label: "Processed", value: "$42M+" },
      { label: "Avg Payout", value: "< 2.4s" },
      { label: "Active Nodes", value: "18.4K" },
    ],
  },
  {
    id: "sunday-journal",
    tabLabel: "Sunday Journal",
    category: "Editorial & Culture",
    title: "Sunday Journal — Visual Essays on Slow Living & Modern Craft",
    subtitle: "Curated essays, photography, and culinary meditations.",
    description:
      "A weekly publication celebrating intimate architecture, culinary journeys, and quiet weekends around the globe with fluid kinetic reading spreads.",
    detailedOverview:
      "Designed to counter digital burnout, Sunday Journal incorporates warm editorial pacing and variable column widths. Each issue is composed like a physical art monograph with zero intrusive UI or popups.",
    tags: ["Digital Monograph", "Photography", "Cultural Archive", "Reading OS"],
    image:
      "https://framerusercontent.com/images/SJ0tPexoZP6OUVLMj2QpyqnQ.jpg?width=4928&height=3264",
    link: "#",
    linkText: "Read Edition",
    accentColor: "#DBF0C2",
    ambientGlow: "rgba(219, 240, 194, 0.45)",
    textColor: "#121A0F",
    year: "2026",
    metrics: [
      { label: "Readership", value: "120K+" },
      { label: "Avg Read Time", value: "8.4m" },
      { label: "Issues", value: "Vol. 54" },
    ],
  },
  {
    id: "fieldwork",
    tabLabel: "Fieldwork",
    category: "Spatial Archive",
    title: "Fieldwork — Spatial Archive of Modern Minimalist Habitats",
    description:
      "An interactive architectural archive documenting contemporary brutalist and biophilic spaces, raw stone materials, and sustainable monolithic structures.",
    detailedOverview:
      "Fieldwork acts as an open research catalogue for architects. Users can inspect material textures, sunlight ray paths, and geographic elevation contours across 500+ archived structures worldwide.",
    tags: ["Spatial Archive", "Brutalist Materiality", "3D Space", "Preservation"],
    image:
      "https://framerusercontent.com/images/csnszvg1pOTB5qMDCqIGxJ363g.jpg?width=2400&height=1600",
    link: "#",
    linkText: "Browse Archive",
    accentColor: "#9AEDEA",
    ambientGlow: "rgba(154, 237, 225, 0.45)",
    textColor: "#0C1B1A",
    year: "2025",
    metrics: [
      { label: "Spaces", value: "540+" },
      { label: "Materials", value: "82 Types" },
      { label: "Locations", value: "48 Countries" },
    ],
  },
  {
    id: "globe-magazine",
    tabLabel: "Globe Magazine",
    category: "Documentary",
    title: "Globe Magazine — Global Perspectives on Art, Humanity & City",
    description:
      "A digital-first world magazine bridging global photography, human-interest features, and immersive documentary style layouts.",
    detailedOverview:
      "Globe Magazine captures cultural transformations across six continents. Featuring high-bitrate responsive photography, custom audio narrations, and collaborative artist commentaries.",
    tags: ["Global Narrative", "Documentary", "Interactive Spreads", "Art Direction"],
    image:
      "https://framerusercontent.com/images/5LXO6WAWN78YFs8shb0pacqVaTc.jpg?width=2592&height=1728",
    link: "#",
    linkText: "Open Edition",
    accentColor: "#DDA7EB",
    ambientGlow: "rgba(221, 167, 235, 0.45)",
    textColor: "#1B101E",
    year: "2025",
    metrics: [
      { label: "Global Reach", value: "240K" },
      { label: "Writers", value: "65 Artists" },
      { label: "Editions", value: "Issue #18" },
    ],
  },
];

interface CardProps {
  item: ScrollStackItem;
  index: number;
  totalCards: number;
  smoothProgress: MotionValue<number>;
  cardOffsetPx: number;
  scaleFactor: number;
  enableTilt3D: boolean;
  manualActiveIndex: number | null;
  onTabClick?: (index: number) => void;
  onExpand?: (item: ScrollStackItem) => void;
}

const UniqueStackCard: React.FC<CardProps> = ({
  item,
  index,
  totalCards,
  smoothProgress,
  cardOffsetPx,
  scaleFactor,
  enableTilt3D,
  manualActiveIndex,
  onTabClick,
  onExpand,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [4, -4]), {
    stiffness: 250,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-4, 4]), {
    stiffness: 250,
    damping: 25,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current || !enableTilt3D) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  const transitionsCount = Math.max(1, totalCards - 1);
  const slotSize = 0.9 / transitionsCount;

  const inputRange: number[] = [0];
  const yRange: number[] = [];
  const scaleRange: number[] = [];
  const opacityRange: number[] = [];

  if (index === 0) {
    yRange.push(0);
    scaleRange.push(1);
    opacityRange.push(1);
  } else {
    yRange.push(1000);
    scaleRange.push(1);
    opacityRange.push(0);
  }

  for (let t = 1; t <= transitionsCount; t++) {
    const slotStart = 0.05 + (t - 1) * slotSize;
    const slotEnd = slotStart + slotSize * 0.85;

    inputRange.push(slotStart);
    if (index < t) {
      const depth = t - 1 - index;
      yRange.push(-depth * cardOffsetPx);
      scaleRange.push(Math.max(0.78, 1 - depth * scaleFactor));
      opacityRange.push(1);
    } else if (index === t) {
      yRange.push(1000);
      scaleRange.push(1);
      opacityRange.push(0);
    } else {
      yRange.push(1000);
      scaleRange.push(1);
      opacityRange.push(0);
    }

    inputRange.push(slotEnd);
    if (index <= t) {
      const depth = t - index;
      yRange.push(-depth * cardOffsetPx);
      scaleRange.push(Math.max(0.78, 1 - depth * scaleFactor));
      opacityRange.push(1);
    } else {
      yRange.push(1000);
      scaleRange.push(1);
      opacityRange.push(0);
    }
  }

  inputRange.push(1.0);
  const finalDepth = totalCards - 1 - index;
  yRange.push(-finalDepth * cardOffsetPx);
  scaleRange.push(Math.max(0.78, 1 - finalDepth * scaleFactor));
  opacityRange.push(1);

  const scrollY = useTransform(smoothProgress, inputRange, yRange);
  const scrollScale = useTransform(smoothProgress, inputRange, scaleRange);
  const scrollOpacity = useTransform(smoothProgress, inputRange, opacityRange);

  const isManualOverride = manualActiveIndex !== null;
  let manualY = 0;
  let manualScale = 1;
  let manualOpacity = 1;

  if (isManualOverride) {
    if (index < manualActiveIndex) {
      const depth = manualActiveIndex - index;
      manualY = -depth * cardOffsetPx;
      manualScale = Math.max(0.78, 1 - depth * scaleFactor);
      manualOpacity = 1;
    } else if (index === manualActiveIndex) {
      manualY = 0;
      manualScale = 1;
      manualOpacity = 1;
    } else {
      manualY = 1000;
      manualScale = 1;
      manualOpacity = 0;
    }
  }

  const y = isManualOverride ? manualY : scrollY;
  const scale = isManualOverride ? manualScale : scrollScale;
  const opacity = isManualOverride ? manualOpacity : scrollOpacity;

  const zIndex = 700 + index * 10;
  const accentColor = item.accentColor || "#EDC89A";

  return (
    <motion.div
      style={{
        y,
        scale,
        opacity,
        zIndex,
        transformOrigin: "center top",
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
      }}
      className="absolute top-0 left-0 right-0 w-full select-none"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative w-full pt-[52px] sm:pt-[59.5px] box-border"
        style={{ perspective: 1200 }}
      >
        {/* Solid Stepped Folder Tab Header */}
        <button
          type="button"
          onClick={() => onTabClick?.(index)}
          style={{
            backgroundColor: accentColor,
            opacity: 1,
          }}
          className="absolute top-0 left-0 w-[190px] sm:w-[240px] md:w-[270px] h-[52px] sm:h-[59.5px] rounded-t-[18px] flex items-center justify-between px-4 sm:px-6 shadow-[0_-2px_6px_rgba(0,0,0,0.06),_inset_0_-1px_0_rgba(0,0,0,0.08)] font-sans text-sm sm:text-base font-semibold text-neutral-900 tracking-tight transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer z-20"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-neutral-900/40 inline-block shrink-0" />
            <span className="truncate">{item.tabLabel || `Card 0${index + 1}`}</span>
          </div>
          <span className="text-xs font-mono opacity-50 font-normal shrink-0">
            0{index + 1}
          </span>
        </button>

        {/* 100% Solid Card Body */}
        <motion.div
          style={{
            backgroundColor: accentColor,
            rotateX: enableTilt3D ? rotateX : 0,
            rotateY: enableTilt3D ? rotateY : 0,
            transformStyle: "preserve-3d",
            opacity: 1,
          }}
          className="relative rounded-b-[24px] rounded-tr-[24px] shadow-[0px_16px_40px_-10px_rgba(0,0,0,0.22),_0px_2px_8px_rgba(0,0,0,0.06)] p-6 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] gap-6 md:gap-10 items-center min-h-[480px] md:min-h-[535px] overflow-hidden border border-black/10"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Left Column: Content */}
          <div className="flex flex-col items-start gap-4 z-10 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 text-xs font-medium tracking-wide uppercase text-neutral-900">
                <Tag className="w-3 h-3 opacity-70" />
                {item.category}
              </span>
              {item.year && (
                <span className="font-mono text-xs text-black/60 px-2 py-1 rounded-md bg-black/5">
                  {item.year}
                </span>
              )}
            </div>

            <h3 className="m-0 font-sans text-2xl sm:text-3xl md:text-[30px] font-semibold leading-[1.12] text-neutral-900 tracking-tight">
              {item.title}
            </h3>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 my-1">
                {item.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/80 font-sans text-xs sm:text-sm font-medium tracking-tight text-neutral-800 shadow-sm border border-black/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="m-0 font-sans text-sm sm:text-base md:text-lg font-normal leading-relaxed text-neutral-800/85 max-w-xl">
              {item.description}
            </p>

            {item.metrics && (
              <div className="grid grid-cols-3 gap-3 w-full pt-3 mt-1 border-t border-black/10">
                {item.metrics.map((meta, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-black/50 font-mono">
                      {meta.label}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-black/85 truncate">
                      {meta.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 w-full pt-3">
              <button
                type="button"
                onClick={() => onExpand?.(item)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white font-medium text-xs sm:text-sm shadow-md transition-all duration-200 hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Quick View</span>
              </button>

              {item.link && item.link !== "#" && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-neutral-900 font-medium text-xs sm:text-sm shadow-sm border border-black/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group/link cursor-pointer"
                >
                  <span>{item.linkText || "Visit Site"}</span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Visual Frame */}
          <div
            onClick={() => onExpand?.(item)}
            className="relative w-full h-[240px] sm:h-[290px] md:h-[360px] lg:h-[390px] rounded-[16px] overflow-hidden bg-black/10 border border-black/10 shadow-inner group/img cursor-pointer"
          >
            <img
              src={item.image}
              alt={item.title}
              decoding="async"
              loading={index === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover rounded-[16px] block transition-transform duration-700 ease-out group-hover/img:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="text-white text-xs font-medium flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                <Maximize2 className="w-3 h-3" /> Click to Expand
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const ScrollStackDeck: React.FC<ScrollStackDeckProps> = ({
  items = DEFAULT_STACK_ITEMS,
  title = "Scroll Stack Deck",
  subtitle = "A scroll-driven project showcase crafted with tactile depth, dynamic atmosphere, and spatial interaction.",
  showScrollPrompt = true,
  scrollPromptText = "SCROLL TO EXPLORE",
  cardOffsetPx = 48,
  scaleFactor = 0.038,
  enableTilt3D = true,
  className,
  containerClassName,
  headerClassName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [manualActiveIndex, setManualActiveIndex] = useState<number | null>(null);
  const [expandedItem, setExpandedItem] = useState<ScrollStackItem | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    mass: 0.2,
    restDelta: 0.0001,
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest > 0.01) {
        setManualActiveIndex(null);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const handleJumpToCard = (index: number) => {
    setManualActiveIndex(index);

    if (!containerRef.current || typeof window === "undefined") return;
    const container = containerRef.current;
    const containerTop = container.offsetTop;
    const containerHeight = container.offsetHeight - window.innerHeight;

    if (containerHeight > 50) {
      const targetScroll =
        containerTop + (index / Math.max(1, items.length - 1)) * containerHeight;

      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={cn(
        "relative bg-[#F6EBE1] text-neutral-900 w-full min-h-screen antialiased selection:bg-neutral-900 selection:text-white transition-colors duration-700",
        className
      )}
    >
      {/* Hero Header */}
      <section
        className={cn(
          "relative z-10 h-screen w-full flex flex-col items-center justify-center px-4 text-center",
          headerClassName
        )}
      >
        <div className="max-w-3xl flex flex-col items-center gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="m-0 font-sans text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-neutral-900"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="m-0 font-sans text-lg sm:text-xl md:text-2xl text-neutral-700 leading-relaxed font-normal max-w-2xl"
          >
            {subtitle}
          </motion.p>

          {showScrollPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 mt-8 text-neutral-700 text-xs sm:text-sm font-semibold tracking-widest"
            >
              <span>{scrollPromptText}</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Sticky Deck Scroll Showcase */}
      <section
        ref={containerRef}
        aria-label="Stacked project showcase"
        className={cn("relative z-10 w-full", containerClassName)}
        style={{
          height: `${Math.max(items.length, 1) * 120}vh`,
        }}
      >
        <div className="sticky top-0 h-screen min-h-screen w-full grid place-items-center pointer-events-none px-4">
          <div className="relative w-[min(calc(100%-32px),1020px)] min-h-[595px] h-[595px] pointer-events-auto overflow-visible">
            {items.map((item, index) => (
              <UniqueStackCard
                key={item.id}
                item={item}
                index={index}
                totalCards={items.length}
                smoothProgress={smoothProgress}
                cardOffsetPx={cardOffsetPx}
                scaleFactor={scaleFactor}
                enableTilt3D={enableTilt3D}
                manualActiveIndex={manualActiveIndex}
                onTabClick={handleJumpToCard}
                onExpand={setExpandedItem}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick-View Detailed Modal */}
      <AnimatePresence>
        {expandedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              style={{ backgroundColor: expandedItem.accentColor }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[24px] p-6 sm:p-10 shadow-2xl border border-black/10 text-neutral-900"
            >
              <button
                type="button"
                onClick={() => setExpandedItem(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/10 text-xs font-semibold uppercase tracking-wider">
                    {expandedItem.category}
                  </span>
                  {expandedItem.year && (
                    <span className="text-xs font-mono opacity-60">
                      {expandedItem.year}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {expandedItem.title}
                </h2>

                <div className="rounded-2xl overflow-hidden h-[260px] sm:h-[340px] shadow-inner bg-black/5">
                  <img
                    src={expandedItem.image}
                    alt={expandedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-black/60">
                    Project Overview
                  </h4>
                  <p className="text-base sm:text-lg leading-relaxed text-black/85">
                    {expandedItem.detailedOverview || expandedItem.description}
                  </p>
                </div>

                {expandedItem.metrics && (
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-black/5">
                    {expandedItem.metrics.map((m, i) => (
                      <div key={i}>
                        <div className="text-[11px] font-mono uppercase text-black/50">
                          {m.label}
                        </div>
                        <div className="text-sm sm:text-base font-semibold">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {expandedItem.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-white/70 text-xs font-medium text-black/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {expandedItem.link && expandedItem.link !== "#" && (
                  <div className="pt-2">
                    <a
                      href={expandedItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white font-medium text-sm shadow-md hover:bg-neutral-800 transition-all hover:scale-[1.02]"
                    >
                      <span>{expandedItem.linkText || "Visit Project"}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 h-[50vh] flex flex-col items-center justify-center text-neutral-500 text-sm gap-2">
        <p className="font-sans font-medium text-neutral-800">
          Scroll Stack Deck
        </p>
        <p className="text-xs text-neutral-500"> 
          Interactive Portfolio & Case Study Showcase
        </p>
      </footer>
    </div>
  );
};

export default ScrollStackDeck;