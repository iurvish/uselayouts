"use client"; // Required if using Next.js App Router

import React, { useEffect } from "react";
import { motion, type Transition } from "framer-motion";

// ==========================================
// 1. DATASET FOR ALL 3 CARDS
// ==========================================
export interface FolderCardItem {
  id?: string | number;
  number: string;
  title: string;
  description: string;
  bgImage: string;
  characterImage: string;
  folderColor: string;
  borderColor: string;
  textColor?: string;
  subTextColor?: string;
  href?: string;
}

export const ALL_3_CARDS: FolderCardItem[] = [
  {
    id: "01",
    number: "01",
    title: "Intelligence",
    description: "Adaptive multi-agent reasoning systems.",
    folderColor: "#18181b",
    borderColor: "#27272a",
    textColor: "#ffffff",
    subTextColor: "rgba(255, 255, 255, 0.6)",
    bgImage: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=95",
    characterImage: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png",
    href: "https://example.com/card-1", // optional link
  },
  {
    id: "02",
    number: "02",
    title: "Interface",
    description: "Tactile kinetic motion and physics.",
    folderColor: "#f4f4f5",
    borderColor: "#d4d4d8",
    textColor: "#09090b",
    subTextColor: "rgba(9, 9, 11, 0.65)",
    bgImage: "https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?auto=format&fit=crop&w=1200&q=95",
    characterImage: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gem%20Stone.png",
    href: "https://example.com/card-2",
  },
  {
    id: "03",
    number: "03",
    title: "Performance",
    description: "Sub-millisecond global execution.",
    folderColor: "#09090b",
    borderColor: "#1e293b",
    textColor: "#ffffff",
    subTextColor: "rgba(255, 255, 255, 0.6)",
    bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=95",
    characterImage: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png",
    href: "https://example.com/card-3",
  },
];

// ==========================================
// 2. GPU SPRING PHYSICS
// ==========================================
const gpuSpringTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.75,
  restDelta: 0.0005,
  restSpeed: 0.0005,
};

// ==========================================
// 3. SINGLE CARD COMPONENT
// ==========================================
export interface FolderCardProps {
  card?: FolderCardItem;
  className?: string;
  onClick?: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  card = ALL_3_CARDS[0],
  className = "",
  onClick,
}) => {
  const isLight =
    card.textColor === "#121212" ||
    card.textColor === "rgb(18, 18, 18)" ||
    card.textColor === "#09090b" ||
    card.folderColor.toLowerCase() === "#f4f4f5" ||
    card.folderColor.toLowerCase() === "#ffffff";

  const textColor = card.textColor || (isLight ? "#09090b" : "#ffffff");
  const subTextColor =
    card.subTextColor ||
    (isLight ? "rgba(9, 9, 11, 0.65)" : "rgba(255, 255, 255, 0.6)");

  const Component = card.href ? motion.a : motion.div;

  return (
    <div className={`relative flex-none w-[300px] h-[400px] [isolation:isolate] ${className}`}>
      {/* Pre-rendered GPU Hover Shadow Layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[0_28px_56px_-12px_rgba(0,0,0,0.45)] transform-gpu [will-change:opacity]"
        variants={{
          initial: { opacity: 0.3 },
          hover: { opacity: 1 },
        }}
        transition={gpuSpringTransition}
      />

      <Component
        {...(card.href
          ? { href: card.href, target: "_blank", rel: "noopener noreferrer" }
          : {})}
        onClick={onClick}
        className="group relative block h-[400px] w-[300px] cursor-pointer select-none overflow-hidden rounded-[32px] shadow-lg transform-gpu [backface-visibility:hidden] [perspective:1000px] [contain:paint]"
        style={{
          border: `10px solid ${card.borderColor}`,
          boxSizing: "border-box",
        }}
        initial="initial"
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        animate="initial"
      >
        {/* 1. Background Texture Layer (Compositor-only GPU scale) */}
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden transform-gpu [will-change:transform]"
          variants={{
            initial: { scale: 1 },
            hover: { scale: 1.09 },
          }}
          transition={gpuSpringTransition}
        >
          <img
            src={card.bgImage}
            alt={card.title}
            decoding="async"
            loading="eager"
            className="h-full w-full object-cover select-none pointer-events-none transform-gpu"
          />
          {/* Subtle vignette gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />
        </motion.div>

        {/* 2. Floating 3D Graphic (Idle breathing float + hover pop-up) */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[130px] z-10 w-[230px] -translate-x-1/2 transform-gpu [will-change:transform]"
          variants={{
            initial: { y: 0, scale: 0.96 },
            hover: { y: -72, scale: 1.08 },
          }}
          transition={gpuSpringTransition}
        >
          <motion.div
            animate={{
              y: [0, -6, 0],
              rotate: [0, 1.5, -1.5, 0],
            }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full flex items-center justify-center"
          >
            <img
              src={card.characterImage}
              alt=""
              decoding="async"
              loading="eager"
              className="h-auto w-full object-contain grayscale contrast-[1.25] brightness-105 drop-shadow-[0_24px_28px_rgba(0,0,0,0.45)] select-none pointer-events-none transform-gpu"
            />
          </motion.div>
        </motion.div>

        {/* 3. Folder Pocket Flap (Proper S-Curve Vector Path) */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[80px] z-20 h-[380px] transform-gpu [will-change:transform]"
          variants={{
            initial: { y: 0 },
            hover: { y: 100 },
          }}
          transition={gpuSpringTransition}
        >
          <svg
            viewBox="0 0 280 380"
            fill="none"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full drop-shadow-[0_-10px_20px_rgba(0,0,0,0.22)]"
          >
            <path
              d="M 0,20 
                 C 0,9 9,0 20,0 
                 L 122,0 
                 C 133,0 140,5.5 143.5,15 
                 C 147,24.5 154,30 164,30 
                 L 262,30 
                 C 272,30 280,38 280,48 
                 L 280,380 
                 L 0,380 
                 Z"
              fill={card.folderColor}
            />
          </svg>

          {/* Number Badge */}
          <div
            className="absolute left-[24px] top-[16px] font-mono text-[56px] font-bold leading-none tracking-tighter tabular-nums select-none"
            style={{ color: textColor }}
          >
            {card.number}
          </div>

          {/* Top-Right Arrow Action Icon */}
          <motion.div
            className="absolute right-[24px] top-[46px] flex h-6 w-6 items-center justify-center transform-gpu [will-change:transform]"
            variants={{
              initial: { x: 0, scale: 1 },
              hover: { x: 4, scale: 1.15 },
            }}
            transition={gpuSpringTransition}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={textColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 pointer-events-none"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </motion.div>
        </motion.div>

        {/* 4. Text Content */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-0.5 p-[20px] pb-[22px]"
          style={{ color: textColor }}
        >
          <h3
            className="font-sans text-[16px] font-semibold leading-tight tracking-tight select-none"
            style={{ color: textColor }}
          >
            {card.title}
          </h3>
          <p
            className="font-sans text-[13px] font-normal leading-snug select-none opacity-80"
            style={{ color: subTextColor }}
          >
            {card.description}
          </p>
        </div>
      </Component>
    </div>
  );
};

// ==========================================
// 4. MAIN COMPONENT RENDERING ALL 3 CARDS
// ==========================================
export default function InteractiveFolderCards() {
  // Preload all 3 card images in memory for zero-lag 90fps GPU execution
  useEffect(() => {
    ALL_3_CARDS.forEach((card) => {
      const img1 = new Image();
      img1.src = card.bgImage;
      const img2 = new Image();
      img2.src = card.characterImage;
    });
  }, []);

  return (
    <section className="min-h-screen w-full bg-[#0c0c0e] flex flex-row flex-wrap items-center justify-center gap-[16px] p-6 font-sans select-none">
      {ALL_3_CARDS.map((card) => (
        <FolderCard key={card.id} card={card} />
      ))}
    </section>
  );
}