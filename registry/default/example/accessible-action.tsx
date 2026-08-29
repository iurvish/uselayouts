"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardStackItem {
  id?: string | number;
  color?: string;
  bg?: string;
  content?: React.ReactNode;
}

export interface CardStackProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  items?: CardStackItem[];
  cardWidth?: number | string;
  cardHeight?: number | string;
  sensitivity?: number;
  randomRotation?: boolean;
  sendToBackOnClick?: boolean;
  maxVisible?: number;
  cardClassName?: string;
  headerClassName?: string;
  onSwipe?: (item: CardStackItem, index: number) => void;
}

export const DEFAULT_CARDS: CardStackItem[] = [
  {
    id: "card-0",
    color: "#6366f1",
  },
  {
    id: "card-1",
    color: "#ec4899",
  },
  {
    id: "card-2",
    color: "#3b82f6",
  },
  {
    id: "card-3",
    color: "#10b981",
  },
  {
    id: "card-4",
    color: "#f59e0b",
  },
];

function getDeterministicRotation(index: number, id?: string | number): number {
  if (typeof id === "string") {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return ((Math.abs(hash) % 1000) / 100) - 5;
  }
  if (typeof id === "number") {
    return ((Math.abs(id * 9301 + 49297) % 1000) / 100) - 5;
  }
  const presets = [2.66, -1.05, -2.8, 1.93, -0.59, 3.12, -2.4];
  return presets[index % presets.length];
}

interface DraggableCardWrapperProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}

const DraggableCardWrapper: React.FC<DraggableCardWrapperProps> = ({
  children,
  onSendToBack,
  sensitivity,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      className="absolute top-0 left-0 cursor-grab select-none touch-none active:cursor-grabbing"
      style={{
        x,
        y,
        rotateX,
        rotateY,
      }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
};

export const CardStack = React.forwardRef<HTMLDivElement, CardStackProps>(
  (
    {
      items = DEFAULT_CARDS,
      title = "Swipe & Explore",
      subtitle = "Drag or click to cycle through the stack",
      cardWidth = 300,
      cardHeight = 300,
      sensitivity = 180,
      randomRotation = true,
      sendToBackOnClick = true,
      maxVisible = 5,
      cardClassName,
      headerClassName,
      className,
      onSwipe,
      ...props
    },
    ref
  ) => {
    const [deck, setDeck] = useState<CardStackItem[]>(items);

    useEffect(() => {
      setDeck(items);
    }, [items]);

    const rotationOffsets = useMemo(() => {
      return items.map((item, index) =>
        randomRotation ? getDeterministicRotation(index, item.id) : 0
      );
    }, [items, randomRotation]);

    const sendToBack = (index: number) => {
      const swipedItem = deck[index];
      onSwipe?.(swipedItem, index);

      setDeck((currentDeck) => {
        const nextDeck = [...currentDeck];
        const [removed] = nextDeck.splice(index, 1);
        nextDeck.unshift(removed);
        return nextDeck;
      });
    };

    const visibleDeck = deck.slice(0, maxVisible);

    return (
      <div className="flex flex-col items-center justify-center gap-6">
        {(title || subtitle) && (
          <div
            className={cn(
              "flex flex-col items-center text-center gap-1 select-none",
              headerClassName
            )}
          >
            {title && (
              <h3 className="text-xl font-medium tracking-tight text-white/90 sm:text-2xl">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-white/50 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div
          ref={ref}
          className={cn(
            "relative flex items-center justify-center [perspective:600px]",
            className
          )}
          style={{
            width: typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
            height: typeof cardHeight === "number" ? `${cardHeight}px` : cardHeight,
          }}
          {...props}
        >
          {visibleDeck.map((item, index) => {
            const offset = rotationOffsets[index] ?? 0;
            const rotateZ = (visibleDeck.length - index - 1) * 4 + offset;
            const scale = 1 + index * 0.06 - visibleDeck.length * 0.06;
            const cardBg = item.color || item.bg || "#000000";

            return (
              <DraggableCardWrapper
                key={item.id || index}
                onSendToBack={() => sendToBack(index)}
                sensitivity={sensitivity}
              >
                <motion.div
                  onClick={() => {
                    if (sendToBackOnClick) {
                      sendToBack(index);
                    }
                  }}
                  animate={{
                    rotateZ,
                    scale,
                    transformOrigin: "90% 90%",
                  }}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  style={{
                    width: typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
                    height: typeof cardHeight === "number" ? `${cardHeight}px` : cardHeight,
                    background: cardBg,
                  }}
                  className={cn(
                    "relative overflow-hidden rounded-[20px] border-4 border-white shadow-2xl transition-shadow hover:shadow-3xl",
                    cardClassName
                  )}
                >
                  {item.content ? item.content : null}
                </motion.div>
              </DraggableCardWrapper>
            );
          })}
        </div>
      </div>
    );
  }
);

CardStack.displayName = "CardStack";

export default function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[#212121]">
      <CardStack
        title="Swipe & Explore"
        subtitle="Drag or click to cycle through the stack"
        items={DEFAULT_CARDS}
        cardWidth={300}
        cardHeight={300}
        sensitivity={180}
        randomRotation={true}
        sendToBackOnClick={true}
      />
    </div>
  );
}