"use client";

import { useState } from "react";
import { motion } from "motion/react";

interface CardItem {
  id: string | number;
  title: string;
  bgColor: string;
  textColor: string;
}

// Soft bright pastels only (no photos / gradient globe imagery)
const CARDS: CardItem[] = [
  { id: "bloom", title: "Bloom", bgColor: "#C9DFF5", textColor: "#3B5B8C" },
  { id: "mist", title: "Mist", bgColor: "#D4E8F2", textColor: "#3D6480" },
  { id: "meadow", title: "Meadow", bgColor: "#C8EBD8", textColor: "#2F6B4A" },
  { id: "coral", title: "Coral", bgColor: "#F7D4C8", textColor: "#A04A38" },
  { id: "haze", title: "Haze", bgColor: "#F2D4E4", textColor: "#8A4A72" },
  { id: "dawn", title: "Dawn", bgColor: "#F7E0C8", textColor: "#9A6430" },
  { id: "lilac", title: "Lilac", bgColor: "#DDD4F2", textColor: "#5C4890" },
  { id: "studio", title: "Studio", bgColor: "#D8E8F8", textColor: "#3A5A8A" },
];

const CARD_WIDTH = 240;
const CARD_HEIGHT = 360;
const CARD_OFFSET = 56;
const HOVER_SPREAD = 80;
const TILT_ANGLE = 24;
const POP_HEIGHT = 100;

// Settling spring: low bounce so hover does not keep oscillating
const HOVER_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
  bounce: 0,
};

export default function PopTiltCards() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerWidth =
    CARD_WIDTH + (CARDS.length - 1) * CARD_OFFSET + HOVER_SPREAD;
  const containerHeight = CARD_HEIGHT + POP_HEIGHT + 40;

  return (
    <section className="flex h-full w-full min-w-0 flex-col items-center justify-center overflow-x-hidden bg-[#F4F6F8] px-4 py-8 md:px-6">
      <div
        className="flex w-full min-w-0 justify-center [container-type:inline-size]"
        style={{ maxWidth: containerWidth }}
      >
        <div
          className="relative flex w-full justify-center"
          style={{
            height: `calc(${containerHeight}px * min(1, 100cqi / ${containerWidth}px))`,
          }}
        >
          <div
            className="relative flex shrink-0 select-none items-end justify-center [perspective:1200px] [transform-origin:top_center]"
            style={{
              width: `${containerWidth}px`,
              height: `${containerHeight}px`,
              transform: `scale(min(1, calc(100cqi / ${containerWidth}px)))`,
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="relative bottom-5"
              style={{
                width: `${containerWidth}px`,
                height: `${CARD_HEIGHT}px`,
              }}
            >
              {CARDS.map((card, index) => {
                let targetX = index * CARD_OFFSET;
                let targetY = 0;
                let targetRotate = 0;
                let targetScale = 1;
                let zIndex = index + 1;

                if (hoveredIndex !== null) {
                  if (index < hoveredIndex) {
                    targetRotate = TILT_ANGLE;
                    targetX = index * CARD_OFFSET;
                  } else if (index === hoveredIndex) {
                    targetRotate = 0;
                    targetY = -POP_HEIGHT;
                    targetScale = 1.02;
                    targetX = index * CARD_OFFSET;
                    zIndex = 50;
                  } else {
                    targetRotate = -TILT_ANGLE;
                    targetX = index * CARD_OFFSET + HOVER_SPREAD;
                  }
                }

                const isHovered = hoveredIndex === index;

                return (
                  // Hit target stays put; visual layer moves. Prevents hover thrash when the card pops up.
                  <div
                    key={card.id}
                    className="absolute left-0 top-0"
                    style={{
                      width: `${CARD_WIDTH}px`,
                      height: `${CARD_HEIGHT}px`,
                      transform: `translateX(${index * CARD_OFFSET}px)`,
                      zIndex,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onClick={() => setHoveredIndex(index)}
                  >
                    <motion.div
                      className="absolute left-0 top-0 flex cursor-pointer flex-col items-start justify-start overflow-hidden rounded-xl p-4 [transform-origin:50%_90%] will-change-transform"
                      style={{
                        width: `${CARD_WIDTH}px`,
                        height: `${CARD_HEIGHT}px`,
                        backgroundColor: card.bgColor,
                        // Overlapping deck: heavy shadows stack badly
                        boxShadow: isHovered
                          ? "0 6px 16px -8px rgba(0, 0, 0, 0.1)"
                          : "none",
                      }}
                      animate={{
                        // Relative to the static hit slot so neighbors can still spread
                        x: targetX - index * CARD_OFFSET,
                        y: targetY,
                        rotate: targetRotate,
                        scale: targetScale,
                      }}
                      transition={HOVER_SPRING}
                    >
                      <div className="relative z-[2] flex items-center justify-center pointer-events-none">
                        <span
                          className="inline-block whitespace-nowrap text-3xl font-semibold tracking-tight [text-orientation:mixed] [writing-mode:vertical-rl]"
                          style={{ color: card.textColor }}
                        >
                          {card.title}
                        </span>
                      </div>

                      <div
                        className="pointer-events-none absolute inset-0 z-[4] rounded-[inherit] border transition-[border-color] duration-200"
                        style={{
                          borderColor: isHovered
                            ? "rgba(255,255,255,0.55)"
                            : "rgba(255,255,255,0.35)",
                        }}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
