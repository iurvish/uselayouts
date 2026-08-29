import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility Helper ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- TypeScript Interfaces ---
export interface LogoItem {
  id: string;
  name: string;
  node?: React.ReactNode;
  src?: string;
  alt?: string;
  href?: string;
}

export interface LogoShiftColumn {
  logos: LogoItem[];
}

export interface LogoShiftProps {
  columns?: LogoShiftColumn[];
  className?: string;
  cellHeight?: number;
  interval?: number; // Time between shifts in ms (default: 2200)
  stagger?: number; // Ripple stagger across columns in ms (default: 110)
  pauseOnHover?: boolean;
  variant?: "grid" | "cards" | "glass" | "minimal";
  animation?: "vertical" | "fade" | "flip";
  direction?: "alternating" | "up" | "down";
  showCornerMarks?: boolean;
  spotlight?: boolean;
}

// --- Built-in Monochromatic Vector Brand Logos ---
export const DefaultLogos = {
  Linear: () => (
    <svg viewBox="0 0 130 30" className="h-6 w-auto fill-current">
      <path d="M4.8 0C2.149 0 0 2.149 0 4.8v20.4C0 27.851 2.149 30 4.8 30h20.4c2.651 0 4.8-2.149 4.8-4.8V4.8C30 2.149 27.851 0 25.2 0H4.8zm1.05 4.8h18.3c.966 0 1.75.784 1.75 1.75v1.2L11.5 22.15H5.85c-.966 0-1.75-.784-1.75-1.75V6.55c0-.966.784-1.75 1.75-1.75zm19.9 8.2v10.45c0 .966-.784 1.75-1.75 1.75H13.6l12.05-12.2z" />
      <text x="38" y="21" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="17" letterSpacing="-0.02em" fill="currentColor">
        Linear
      </text>
    </svg>
  ),
  Stripe: () => (
    <svg viewBox="0 0 130 30" className="h-6 w-auto fill-current">
      <path d="M12.5 10.4c0-1.8 1.4-2.9 3.9-2.9 3.4 0 6.9 1.1 9.8 2.9V4.6C22.9 3.2 19.5 2.5 16 2.5 7.1 2.5 1.5 6.9 1.5 13.2c0 10 13.9 8.4 13.9 12.7 0 2.1-1.9 2.8-4.5 2.8-4 0-8-1.6-11.5-3.9v5.9c4 1.7 8 2.5 12 2.5 9.2 0 15-4.4 15-11-.1-10.7-13.9-8.9-13.9-11.8z" />
      <text x="38" y="21" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" letterSpacing="-0.03em" fill="currentColor">
        stripe
      </text>
    </svg>
  ),
  Vercel: () => (
    <svg viewBox="0 0 130 30" className="h-5 w-auto fill-current">
      <path d="M12 2L24 23H0L12 2Z" />
      <text x="34" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="16" letterSpacing="0.06em" fill="currentColor">
        VERCEL
      </text>
    </svg>
  ),
  Supabase: () => (
    <svg viewBox="0 0 145 30" className="h-6 w-auto fill-current">
      <path d="M13.2 1.1c-.5-.7-1.5-.3-1.6.5l-2 12c-.1.5.4 1 1 1h8.5c.6 0 1 .7.6 1.2L8.9 29.5c-.5.7-1.5.3-1.6-.5l2-12c.1-.5-.4-1-1-1H-.2c-.6 0-1-.7-.6-1.2L11.6 1.1c.4-.5 1.1-.5 1.6 0z" />
      <text x="32" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        supabase
      </text>
    </svg>
  ),
  Raycast: () => (
    <svg viewBox="0 0 135 30" className="h-6 w-auto fill-current">
      <rect x="2" y="3" width="22" height="22" rx="5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M8 14h10M13 9v10M16 11l-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <text x="34" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        Raycast
      </text>
    </svg>
  ),
  Resend: () => (
    <svg viewBox="0 0 130 30" className="h-6 w-auto fill-current">
      <rect x="2" y="5" width="22" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M4 7l8 7 8-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="32" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        Resend
      </text>
    </svg>
  ),
  Figma: () => (
    <svg viewBox="0 0 125 30" className="h-6 w-auto fill-current">
      <circle cx="7" cy="7" r="4.5" fill="currentColor" />
      <circle cx="16" cy="7" r="4.5" fill="currentColor" />
      <circle cx="7" cy="15" r="4.5" fill="currentColor" />
      <circle cx="16" cy="15" r="4.5" fill="currentColor" />
      <circle cx="7" cy="23" r="4.2" fill="currentColor" />
      <text x="30" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        Figma
      </text>
    </svg>
  ),
  GitHub: () => (
    <svg viewBox="0 0 130 30" className="h-6 w-auto fill-current">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.57 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z"
      />
      <text x="32" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        GitHub
      </text>
    </svg>
  ),
  Notion: () => (
    <svg viewBox="0 0 130 30" className="h-6 w-auto fill-current">
      <path d="M2.5 3.5A2.5 2.5 0 0 1 5 1h14a2.5 2.5 0 0 1 2.5 2.5v17a2.5 2.5 0 0 1-2.5 2.5H5a2.5 2.5 0 0 1-2.5-2.5v-17zm3.8 2.2v12.6l3.5.7V8.5l6 10.5h3.4V5.7l-3.5-.7v10.5L9.7 5.7H6.3z" />
      <text x="32" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        Notion
      </text>
    </svg>
  ),
  OpenAI: () => (
    <svg viewBox="0 0 135 30" className="h-6 w-auto fill-current">
      <path d="M22.5 12.3c-.3-2.1-1.7-3.9-3.7-4.6-.5-.2-1-.3-1.6-.3-.3-.8-.8-1.5-1.5-2.1-1.8-1.4-4.2-1.6-6.2-.7-.4.2-.8.5-1.1.8-1.3-.7-2.9-.9-4.4-.5-2.1.5-3.8 2-4.5 4-.4 1.1-.4 2.3-.2 3.4-.6.4-1.2 1-1.6 1.7-1.1 1.9-1.1 4.3 0 6.2.4.7 1 1.3 1.6 1.7-.1 1.1 0 2.3.4 3.4.7 2 2.4 3.5 4.5 4 1.5.4 3.1.2 4.4-.5.3.3.7.6 1.1.8 2 .9 4.4.7 6.2-.7.7-.6 1.2-1.3 1.5-2.1.6 0 1.1-.1 1.6-.3 2-.7 3.4-2.5 3.7-4.6.2-1.2.1-2.4-.4-3.5.6-.4 1.2-1 1.6-1.7 1.1-1.9 1.1-4.3 0-6.2-.4-.7-1-1.3-1.6-1.7.2-1.1.1-2.3-.4-3.4zm-7.6 11.2l-3.5-2v-4.1l3.5 2v4.1zm-4.8 1.4v-4.1l3.5-2 3.5 2v4.1l-3.5 2-3.5-2zm-3.5-6.2l3.5-2v4.1l-3.5 2v-4.1zm-.7-4.8l3.5 2v4.1l-3.5-2v-4.1zm4.2-2.4l3.5-2 3.5 2v4.1l-3.5-2-3.5 2v-4.1zm7.7 2.4v4.1l-3.5 2v-4.1l3.5-2z" />
      <text x="34" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        OpenAI
      </text>
    </svg>
  ),
  Prisma: () => (
    <svg viewBox="0 0 130 30" className="h-6 w-auto fill-current">
      <path d="M12.8 1.2c-.4-.7-1.3-.9-1.9-.4L1.3 8.6c-.6.4-.8 1.2-.5 1.9l8.8 17.5c.3.6 1 .9 1.6.7l12-4.8c.7-.3 1-1 .8-1.7L12.8 1.2zm-.9 4.1l8.5 15.6-8.7 3.5-6.3-12.5 6.5-6.6z" />
      <text x="32" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        Prisma
      </text>
    </svg>
  ),
  Tailwind: () => (
    <svg viewBox="0 0 145 30" className="h-5 w-auto fill-current">
      <path d="M12 4c-4.8 0-7.8 2.4-9 7.2 1.8-2.4 4.2-3.3 7.2-2.7 1.7.3 2.9 1.6 4.3 3 2.2 2.3 4.8 4.9 10.5 4.9 4.8 0 7.8-2.4 9-7.2-1.8 2.4-4.2 3.3-7.2 2.7-1.7-.3-2.9-1.6-4.3-3C20.3 6.6 17.7 4 12 4zM3 13.6c-4.8 0-7.8 2.4-9 7.2 1.8-2.4 4.2-3.3 7.2-2.7 1.7.3 2.9 1.6 4.3 3 2.2 2.3 4.8 4.9 10.5 4.9 4.8 0 7.8-2.4 9-7.2-1.8 2.4-4.2 3.3-7.2 2.7-1.7-.3-2.9-1.6-4.3-3C11.3 16.2 8.7 13.6 3 13.6z" />
      <text x="34" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        Tailwind
      </text>
    </svg>
  ),
  Clerk: () => (
    <svg viewBox="0 0 130 30" className="h-6 w-auto fill-current">
      <rect x="2" y="3" width="22" height="22" rx="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
      <circle cx="13" cy="14" r="4" fill="currentColor" />
      <text x="32" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" letterSpacing="-0.02em" fill="currentColor">
        Clerk
      </text>
    </svg>
  ),
  Cloudflare: () => (
    <svg viewBox="0 0 145 30" className="h-6 w-auto fill-current">
      <path d="M19.5 9.5a7 7 0 0 0-13.4 2.2A5 5 0 0 0 7 21.5h13a4.5 4.5 0 0 0 .5-8.9 6.9 6.9 0 0 0-1-3.1z" />
      <text x="30" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="15" letterSpacing="-0.02em" fill="currentColor">
        Cloudflare
      </text>
    </svg>
  ),
};

const defaultColumns: LogoShiftColumn[] = [
  {
    logos: [
      { id: "linear", name: "Linear", node: <DefaultLogos.Linear /> },
      { id: "stripe", name: "Stripe", node: <DefaultLogos.Stripe /> },
      { id: "prisma", name: "Prisma", node: <DefaultLogos.Prisma /> },
    ],
  },
  {
    logos: [
      { id: "vercel", name: "Vercel", node: <DefaultLogos.Vercel /> },
      { id: "supabase", name: "Supabase", node: <DefaultLogos.Supabase /> },
      { id: "tailwind", name: "Tailwind", node: <DefaultLogos.Tailwind /> },
    ],
  },
  {
    logos: [
      { id: "raycast", name: "Raycast", node: <DefaultLogos.Raycast /> },
      { id: "resend", name: "Resend", node: <DefaultLogos.Resend /> },
      { id: "openai", name: "OpenAI", node: <DefaultLogos.OpenAI /> },
      { id: "clerk", name: "Clerk", node: <DefaultLogos.Clerk /> },
    ],
  },
  {
    logos: [
      { id: "figma", name: "Figma", node: <DefaultLogos.Figma /> },
      { id: "github", name: "GitHub", node: <DefaultLogos.GitHub /> },
      { id: "notion", name: "Notion", node: <DefaultLogos.Notion /> },
      { id: "cloudflare", name: "Cloudflare", node: <DefaultLogos.Cloudflare /> },
    ],
  },
];

interface SingleLogoSlotProps {
  logos: LogoItem[];
  currentIndex: number;
  cellHeight: number;
  variant: "grid" | "cards" | "glass" | "minimal";
  animation: "vertical" | "fade" | "flip";
  colIndex: number;
  direction: "alternating" | "up" | "down";
}

const SingleLogoSlot: React.FC<SingleLogoSlotProps> = ({
  logos,
  currentIndex,
  cellHeight,
  variant,
  animation,
  colIndex,
  direction,
}) => {
  const currentLogo = logos[currentIndex % logos.length];
  
  // Calculate vertical motion direction
  const isUp = direction === "alternating" ? colIndex % 2 === 0 : direction === "up";
  const offset = isUp ? 38 : -38;

  const getVariants = () => {
    switch (animation) {
      case "fade":
        return {
          initial: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
          animate: {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
          },
          exit: {
            opacity: 0,
            scale: 0.95,
            filter: "blur(4px)",
            transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
          },
        };
      case "flip":
        return {
          initial: { rotateX: isUp ? 80 : -80, opacity: 0 },
          animate: {
            rotateX: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 220, damping: 22 },
          },
          exit: {
            rotateX: isUp ? -80 : 80,
            opacity: 0,
            transition: { duration: 0.3 },
          },
        };
      case "vertical":
      default:
        return {
          initial: { y: offset, opacity: 0, filter: "blur(3px)" },
          animate: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
              type: "spring",
              stiffness: 240,
              damping: 26,
              mass: 0.8,
            },
          },
          exit: {
            y: -offset,
            opacity: 0,
            filter: "blur(3px)",
            transition: {
              type: "spring",
              stiffness: 240,
              damping: 26,
              mass: 0.8,
            },
          },
        };
    }
  };

  const slotVariants = getVariants();

  // Exact divider lines between cells
  const gridBorderClasses =
    variant === "grid"
      ? cn(
          "bg-background/50 hover:bg-muted/30",
          colIndex % 2 === 0 ? "border-r border-border" : "border-r-0",
          colIndex !== 3 && "md:border-r md:border-border",
          colIndex < 2 ? "border-b border-border md:border-b-0" : "border-b-0"
        )
      : "";

  return (
    <div
      className={cn(
        "group relative flex w-full items-center justify-center overflow-hidden select-none transition-all duration-300",
        gridBorderClasses,
        variant === "cards" &&
          "rounded-xl border border-border bg-card/60 shadow-sm backdrop-blur-sm hover:border-border hover:shadow-md",
        variant === "glass" &&
          "rounded-xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
        variant === "minimal" && "hover:bg-muted/20"
      )}
      style={{
        height: `${cellHeight}px`,
      }}
    >
      {/* Inner Masked Container (Preserves solid border lines) */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{
          maskImage:
            animation === "vertical"
              ? "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)"
              : undefined,
          WebkitMaskImage:
            animation === "vertical"
              ? "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)"
              : undefined,
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentLogo.id}
            initial={slotVariants.initial}
            animate={slotVariants.animate}
            exit={slotVariants.exit}
            style={{
              willChange: "transform, opacity, filter",
              backfaceVisibility: "hidden",
              transform: "translate3d(0, 0, 0)",
            }}
            className="absolute inset-0 flex items-center justify-center p-3 text-foreground/80 group-hover:text-foreground transition-colors duration-200"
          >
            {currentLogo.href ? (
              <a
                href={currentLogo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center cursor-pointer transition-transform duration-200 group-hover:scale-[1.05]"
              >
                {currentLogo.node ? (
                  currentLogo.node
                ) : (
                  <img
                    src={currentLogo.src}
                    alt={currentLogo.alt || currentLogo.name}
                    className="max-h-7 max-w-[130px] object-contain"
                  />
                )}
              </a>
            ) : currentLogo.node ? (
              <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.05] cursor-default">
                {currentLogo.node}
              </div>
            ) : (
              <img
                src={currentLogo.src}
                alt={currentLogo.alt || currentLogo.name}
                className="max-h-7 max-w-[130px] object-contain transition-transform duration-200 group-hover:scale-[1.05] cursor-default"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export const LogoShift: React.FC<LogoShiftProps> = ({
  columns = defaultColumns,
  className = "",
  cellHeight = 88,
  interval = 2200,
  stagger = 110,
  pauseOnHover = true,
  variant = "grid",
  animation = "vertical",
  direction = "alternating",
  showCornerMarks = true,
  spotlight = true,
}) => {
  const [columnIndices, setColumnIndices] = useState<number[]>(() =>
    new Array(columns.length).fill(0)
  );
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: -1000, y: -1000 });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const timeouts: NodeJS.Timeout[] = [];

    const runWave = () => {
      columns.forEach((col, colIdx) => {
        const timeout = setTimeout(() => {
          if (!pauseOnHover || !isHovered) {
            setColumnIndices((prev) => {
              const updated = [...prev];
              updated[colIdx] = (updated[colIdx] + 1) % col.logos.length;
              return updated;
            });
          }
        }, colIdx * stagger);

        timeouts.push(timeout);
      });
    };

    timer = setInterval(() => {
      if (!pauseOnHover || !isHovered) {
        runWave();
      }
    }, interval);

    return () => {
      clearInterval(timer);
      timeouts.forEach(clearTimeout);
    };
  }, [columns, interval, stagger, isHovered, pauseOnHover]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full select-none",
        variant === "grid" &&
          "grid grid-cols-2 md:grid-cols-4 border border-border rounded-xl overflow-hidden shadow-sm",
        variant === "cards" && "grid grid-cols-2 md:grid-cols-4 gap-3.5",
        variant === "glass" && "grid grid-cols-2 md:grid-cols-4 gap-3",
        variant === "minimal" && "grid grid-cols-2 md:grid-cols-4 gap-4",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Cursor Spotlight Glow */}
      {spotlight && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-0"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.04), transparent 80%)`,
          }}
        />
      )}

      {/* Architectural Corner Crosshairs (+) */}
      {showCornerMarks && variant === "grid" && (
        <>
          <span className="pointer-events-none absolute -top-2.5 -left-2.5 text-xs text-border font-mono select-none">+</span>
          <span className="pointer-events-none absolute -top-2.5 -right-2.5 text-xs text-border font-mono select-none">+</span>
          <span className="pointer-events-none absolute -bottom-2.5 -left-2.5 text-xs text-border font-mono select-none">+</span>
          <span className="pointer-events-none absolute -bottom-2.5 -right-2.5 text-xs text-border font-mono select-none">+</span>
        </>
      )}

      {columns.map((col, idx) => (
        <SingleLogoSlot
          key={idx}
          logos={col.logos}
          currentIndex={columnIndices[idx]}
          cellHeight={cellHeight}
          variant={variant}
          animation={animation}
          colIndex={idx}
          direction={direction}
        />
      ))}
    </div>
  );
};

export default LogoShift;