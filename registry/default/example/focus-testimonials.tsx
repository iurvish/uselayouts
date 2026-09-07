"use client";

import React, { useState, useRef, useCallback, memo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Testimonial {
  id: number;
  author: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
}

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 0,
    author: "Cristiano Ronaldo",
    role: "Athlete & Entrepreneur",
    company: "CR7 Brand",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "This product has completely transformed how we work. The interface is intuitive and the features are exactly what we needed.",
  },
  {
    id: 1,
    author: "Jensen Huang",
    role: "CEO & Founder",
    company: "NVIDIA",
    avatar: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "I've tried many solutions, but this one stands out for its simplicity and power. Highly recommended!",
  },
  {
    id: 2,
    author: "Antony Raphy",
    role: "Staff Product Designer",
    company: "Studio Craft",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "The team behind this is incredibly responsive and the product keeps getting better with each update.",
  },
  {
    id: 3,
    author: "Leo Das",
    role: "Managing Director",
    company: "Das Capital",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "Best investment we've made this year. The ROI has been incredible and our team loves using it.",
  },
];

const ADDITIONAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 4,
    author: "Sarah Chen",
    role: "VP of Product",
    company: "Apex Systems",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "Switching to this platform cut our team onboarding time in half. New members are productive on day one.",
  },
  {
    id: 5,
    author: "Marcus Williams",
    role: "Principal Architect",
    company: "HyperScale",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "The analytics engine alone is worth it. We finally have real-time visibility across our entire architecture.",
  },
  {
    id: 6,
    author: "Priya Nair",
    role: "Head of Design",
    company: "Design Lab",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "Customer support is phenomenal. Every single question is resolved within minutes with exceptional care.",
  },
  {
    id: 7,
    author: "Tom Eriksson",
    role: "Founder & CEO",
    company: "NorthTech",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "We evaluated dozens of tools before picking this one. Nothing else even comes close to its polish and speed.",
  },
  {
    id: 8,
    author: "Aisha Okafor",
    role: "Director of Operations",
    company: "GlobalSync",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "The mobile workflows are seamless. I manage mission-critical deployments on the go without missing a beat.",
  },
  {
    id: 9,
    author: "David Park",
    role: "Group PM",
    company: "Flowstate",
    avatar: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "Our entire engineering and design staff adopted it without friction. That has never happened with prior tooling.",
  },
  {
    id: 10,
    author: "Lena Müller",
    role: "Chief Technology Officer",
    company: "Quantum Labs",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "Automation features save us over 25 hours every single week. It paid for itself in less than a month.",
  },
  {
    id: 11,
    author: "Ravi Shankar",
    role: "Creative Director",
    company: "Luminary",
    avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=120&h=120&auto=format&fit=crop&crop=faces&q=80",
    quote: "Incredible attention to detail. Every transition and gesture feels silky, fluid, and delightful.",
  },
];

const ALL_ITEMS = [...INITIAL_TESTIMONIALS, ...ADDITIONAL_TESTIMONIALS];

const TestimonialSpanItem = memo(function TestimonialSpanItem({
  item,
  isHovered,
  hasHover,
  onHover,
}: {
  item: Testimonial;
  isHovered: boolean;
  hasHover: boolean;
  onHover: (id: number) => void;
}) {
  const stateClass = !hasHover
    ? "opacity-75 blur-0 text-[rgb(115,115,122)]"
    : isHovered
    ? "opacity-100 blur-0 text-[rgb(10,10,14)]"
    : "opacity-30 blur-[2.8px] text-[rgb(175,175,175)]";

  const avatarClass = !hasHover
    ? "grayscale-[25%] opacity-90 scale-100"
    : isHovered
    ? "grayscale-0 opacity-100 scale-110 shadow-none"
    : "grayscale-[70%] blur-[1.2px] opacity-35 scale-95 shadow-none";

  return (
    <span
      onMouseEnter={() => onHover(item.id)}
      className={cn(
        "inline cursor-pointer select-none transition-[opacity,filter,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,filter,color]",
        stateClass
      )}
    >
      <span
        className={cn(
          "inline-block align-middle mr-2.5 overflow-hidden rounded-full transition-[transform,filter,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,filter,opacity]",
          avatarClass
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.avatar}
          alt={item.author}
          width={44}
          height={44}
          loading="eager"
          className="inline-block w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full object-cover align-middle border-0 outline-none shadow-none ring-0 scale-110"
        />
      </span>
      {item.quote}
      <span className="relative inline-block w-0 h-0 align-baseline" />{" "}
    </span>
  );
});

export default function FocusTestimonials() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 320, mass: 0.45 };
  const smoothX = useSpring(rawMouseX, springConfig);
  const smoothY = useSpring(rawMouseY, springConfig);

  const activeItem =
    hoveredId !== null ? ALL_ITEMS.find((t) => t.id === hoveredId) : null;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      rawMouseX.set(e.clientX - rect.left);
      rawMouseY.set(e.clientY - rect.top);
    },
    [rawMouseX, rawMouseY]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handleHover = useCallback((id: number) => {
    setHoveredId(id);
  }, []);

  const handleToggleShowMore = () => {
    setShowMore((prev) => {
      const nextState = !prev;
      if (
        !nextState &&
        hoveredId !== null &&
        hoveredId >= INITIAL_TESTIMONIALS.length
      ) {
        setHoveredId(null);
      }
      return nextState;
    });
  };

  const hasHover = hoveredId !== null;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-transparent p-4 sm:p-8 md:p-14 lg:p-20 select-none">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 flex w-full max-w-[1400px] flex-col rounded-3xl border border-black/[0.06] bg-white p-6 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-all sm:p-10 md:p-14"
      >
        <AnimatePresence>
          {activeItem && (
            <motion.div
              key="author-tooltip"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.85,
                y: 6,
                transition: { duration: 0.15, ease: "easeOut" },
              }}
              transition={{
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                x: smoothX,
                y: smoothY,
                translateX: 18,
                translateY: -56,
              }}
              className="pointer-events-none absolute left-0 top-0 z-50 flex items-center gap-2.5 rounded-full border border-white/20 bg-neutral-950/90 px-4 py-2 text-white shadow-2xl backdrop-blur-xl will-change-[transform,opacity]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={activeItem.avatar}
                  alt={activeItem.author}
                  width={28}
                  height={28}
                  className="h-full w-full object-cover border-0 outline-none shadow-none ring-0 scale-110"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-white whitespace-nowrap">
                  {activeItem.author}
                </span>
                <span className="text-[10px] sm:text-xs font-normal text-slate-300 whitespace-nowrap">
                  {activeItem.role} ·{" "}
                  <span className="font-medium text-white">
                    {activeItem.company}
                  </span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex-1 text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-medium leading-[148%] tracking-[-0.025em] text-slate-900">
          {INITIAL_TESTIMONIALS.map((item) => (
            <TestimonialSpanItem
              key={item.id}
              item={item}
              isHovered={hoveredId === item.id}
              hasHover={hasHover}
              onHover={handleHover}
            />
          ))}

          <span
            className={cn(
              "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              showMore ? "inline opacity-100" : "hidden opacity-0"
            )}
          >
            {ADDITIONAL_TESTIMONIALS.map((item) => (
              <TestimonialSpanItem
                key={item.id}
                item={item}
                isHovered={hoveredId === item.id}
                hasHover={hasHover}
                onHover={handleHover}
              />
            ))}
          </span>
        </div>

        <div className="mt-8 sm:mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleToggleShowMore}
            className="group inline-flex items-center gap-1.5 text-sm tracking-tight text-slate-500 transition-colors hover:text-slate-900 active:scale-[0.98] focus-visible:outline-none focus-visible:underline"
          >
            <span>
              {showMore
                ? "Show less"
                : `Read all testimonials (${ALL_ITEMS.length})`}
            </span>

            <motion.span
              animate={{ rotate: showMore ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
              className="inline-flex"
            >
              <ChevronDown className="h-3.5 w-3.5 text-current" />
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
}
