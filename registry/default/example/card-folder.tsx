"use client";

import { motion, type Transition } from "motion/react";

interface FolderCardItem {
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

const DEMO_CARDS: FolderCardItem[] = [
  {
    id: "01",
    number: "01",
    title: "Palette Lab",
    description: "Soft color systems for product teams.",
    folderColor: "#E8DFFB",
    borderColor: "#D4C4F5",
    textColor: "#3B2F63",
    subTextColor: "rgba(59, 47, 99, 0.65)",
    bgImage:
      "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=85",
    characterImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "02",
    number: "02",
    title: "Sprint Notes",
    description: "Weekly rituals for focused builders.",
    folderColor: "#FFE8D6",
    borderColor: "#FFD4B8",
    textColor: "#5C3D2E",
    subTextColor: "rgba(92, 61, 46, 0.65)",
    bgImage:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=85",
    characterImage:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "03",
    number: "03",
    title: "Garden UI",
    description: "Components that grow with your roadmap.",
    folderColor: "#D8F5E4",
    borderColor: "#B8EBCE",
    textColor: "#1F4D38",
    subTextColor: "rgba(31, 77, 56, 0.65)",
    bgImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
    characterImage:
      "https://images.unsplash.com/photo-1618004912476-29818d81ae2e?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "04",
    number: "04",
    title: "Cloud Brief",
    description: "Research snapshots for fast alignment.",
    folderColor: "#D6EBFF",
    borderColor: "#B8D9F5",
    textColor: "#1E3A5F",
    subTextColor: "rgba(30, 58, 95, 0.65)",
    bgImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85",
    characterImage:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=85",
  },
];

const gpuSpringTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.75,
  restDelta: 0.0005,
  restSpeed: 0.0005,
};

function FolderPeek({ card }: { card: FolderCardItem }) {
  const textColor = card.textColor ?? "#09090b";
  const subTextColor = card.subTextColor ?? "rgba(9, 9, 11, 0.65)";
  const Component = card.href ? motion.a : motion.div;

  return (
    <div className="relative isolate h-[400px] w-[300px] shrink-0">
      <motion.div
        className="pointer-events-none absolute inset-0 transform-gpu rounded-[32px] shadow-[0_28px_56px_-12px_rgba(0,0,0,0.25)] will-change-[opacity]"
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
        className="group relative block h-[400px] w-[300px] cursor-pointer select-none overflow-hidden rounded-[32px] shadow-lg transform-gpu [backface-visibility:hidden] [contain:paint] [perspective:1000px]"
        style={{
          border: `10px solid ${card.borderColor}`,
          boxSizing: "border-box",
        }}
        initial="initial"
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        animate="initial"
      >
        <motion.div
          className="absolute inset-0 z-0 transform-gpu overflow-hidden will-change-[transform]"
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
            className="pointer-events-none h-full w-full transform-gpu select-none object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-1/2 top-[130px] z-10 w-[230px] -translate-x-1/2 transform-gpu will-change-[transform]"
          variants={{
            initial: { y: 0, scale: 0.96 },
            hover: { y: -72, scale: 1.08 },
          }}
          transition={gpuSpringTransition}
        >
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0] }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex w-full items-center justify-center"
          >
            <img
              src={card.characterImage}
              alt=""
              decoding="async"
              loading="eager"
              className="pointer-events-none h-auto w-full transform-gpu select-none object-contain brightness-105 contrast-125 drop-shadow-[0_24px_28px_rgba(0,0,0,0.35)] grayscale"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[80px] z-20 h-[380px] transform-gpu will-change-[transform]"
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
            className="absolute inset-0 h-full w-full drop-shadow-[0_-10px_20px_rgba(0,0,0,0.15)]"
          >
            <path
              d="M 0,20 C 0,9 9,0 20,0 L 122,0 C 133,0 140,5.5 143.5,15 C 147,24.5 154,30 164,30 L 262,30 C 272,30 280,38 280,48 L 280,380 L 0,380 Z"
              fill={card.folderColor}
            />
          </svg>

          <div
            className="absolute left-6 top-4 font-mono text-[3.5rem] font-bold tabular-nums leading-none tracking-tighter select-none"
            style={{ color: textColor }}
          >
            {card.number}
          </div>

          <motion.div
            className="absolute right-6 top-[46px] flex h-6 w-6 transform-gpu items-center justify-center will-change-[transform]"
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
              className="pointer-events-none h-5 w-5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </motion.div>
        </motion.div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-0.5 p-5 pb-[22px]"
          style={{ color: textColor }}
        >
          <h3
            className="select-none font-sans text-base font-semibold leading-tight tracking-tight"
            style={{ color: textColor }}
          >
            {card.title}
          </h3>
          <p
            className="select-none font-sans text-sm font-normal leading-snug opacity-80"
            style={{ color: subTextColor }}
          >
            {card.description}
          </p>
        </div>
      </Component>
    </div>
  );
}

export default function FolderCards() {
  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FAF8F5] px-6 py-16">
      <div className="mb-12 max-w-2xl text-center">
        <p className="text-sm font-medium tracking-wide text-neutral-500">
          Project folders
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
          Hover to peek inside
        </h2>
        <p className="mt-3 text-base text-neutral-600">
          A playful filing system for design ops, research, and launch work.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8">
        {DEMO_CARDS.map((card) => (
          <FolderPeek key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
