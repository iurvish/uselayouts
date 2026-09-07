"use client";

import { motion, type Transition } from "motion/react";

interface FolderCardItem {
  id?: string | number;
  number: string;
  title: string;
  description: string;
  bgImage?: string;
  characterImage: string;
  folderColor: string;
  borderColor: string;
  textColor?: string;
  subTextColor?: string;
  href?: string;
}

const OBJECT =
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis";

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
    characterImage: `${OBJECT}/Activities/Artist%20Palette.png`,
  },
  {
    id: "02",
    number: "02",
    title: "Shot List",
    description: "Campaign stills, ready to file.",
    folderColor: "#FFE8D6",
    borderColor: "#FFD4B8",
    textColor: "#5C3D2E",
    subTextColor: "rgba(92, 61, 46, 0.65)",
    characterImage: `${OBJECT}/Objects/Camera.png`,
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
    characterImage: `${OBJECT}/Animals/Potted%20Plant.png`,
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
        animate="initial"
      >
        <div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${card.borderColor}, ${card.folderColor})`,
          }}
        >
          {card.bgImage ? (
            <img
              src={card.bgImage}
              alt=""
              decoding="async"
              loading="eager"
              className="pointer-events-none h-full w-full select-none object-cover"
            />
          ) : null}
        </div>

        <motion.div
          className="pointer-events-none absolute left-1/2 top-[130px] z-10 flex w-[230px] -translate-x-1/2 justify-center transform-gpu will-change-[transform]"
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
            className="flex items-center justify-center"
          >
            <img
              src={card.characterImage}
              alt=""
              decoding="async"
              loading="eager"
              className="pointer-events-none h-44 w-auto max-w-[180px] transform-gpu select-none object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.2)]"
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
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3 p-5 pb-[22px]"
          style={{ color: textColor }}
        >
          <h3
            className="select-none font-sans text-base font-semibold leading-7 tracking-tight"
            style={{ color: textColor }}
          >
            {card.title}
          </h3>
          <p
            className="select-none font-sans text-sm font-normal leading-relaxed opacity-80"
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
    <section className="flex h-full w-full items-center justify-center px-6 py-8">
      <div className="flex flex-wrap items-center justify-center gap-8">
        {DEMO_CARDS.map((card) => (
          <FolderPeek key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
