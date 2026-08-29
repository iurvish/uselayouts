import * as React from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardItem {
  id?: string | number;
  title: string;
  bgColor?: string;
  textColor?: string;
  showText?: boolean;
  showImage?: boolean;
  image?: string;
  imageAlt?: string;
  link?: string;
  openInNewTab?: boolean;
  fontSize?: string;
  customContent?: React.ReactNode;
}

export interface PopTiltCardsProps {
  cards?: CardItem[];
  cardWidth?: number;
  cardHeight?: number;
  cardCornerRadius?: number | string;
  tiltAngle?: number;
  popHeight?: number;
  cardOffset?: number;
  hoverSpread?: number;
  springConfig?: {
    type?: "spring";
    stiffness?: number;
    damping?: number;
    mass?: number;
    bounce?: number;
    restDelta?: number;
  };
  fontFamily?: string;
  className?: string;
  cardClassName?: string;
  trackClassName?: string;
  textClassName?: string;
  onCardClick?: (card: CardItem, index: number) => void;
  onCardHover?: (card: CardItem | null, index: number | null) => void;
}

export const DEFAULT_CARDS: CardItem[] = [
  { id: "card-1", title: "Card 1", bgColor: "rgb(181, 208, 245)", textColor: "rgb(59, 107, 186)" },
  { id: "card-2", title: "Card 2", bgColor: "rgb(140, 162, 187)", textColor: "rgb(230, 235, 242)" },
  { id: "card-3", title: "Card 3", bgColor: "rgb(170, 204, 150)", textColor: "rgb(37, 83, 63)" },
  { id: "card-4", title: "Card 4", bgColor: "rgb(247, 112, 84)", textColor: "rgb(255, 242, 201)" },
  { id: "card-5", title: "Card 5", bgColor: "rgb(242, 190, 174)", textColor: "rgb(97, 53, 7)" },
  { id: "card-6", title: "Card 6", bgColor: "rgb(135, 96, 41)", textColor: "rgb(217, 212, 139)" },
  { id: "card-7", title: "Card 7", bgColor: "rgb(255, 122, 172)", textColor: "rgb(5, 51, 33)" },
  { id: "card-8", title: "Hover Cards", bgColor: "rgb(162, 140, 250)", textColor: "rgb(255, 255, 255)" },
];

export const PopTiltCards = React.forwardRef<
  HTMLDivElement,
  PopTiltCardsProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      cards = DEFAULT_CARDS,
      cardWidth = 270,
      cardHeight = 400,
      cardCornerRadius = "16px",
      tiltAngle = 24,
      popHeight = 130,
      cardOffset = 62,
      hoverSpread = 95,
      springConfig = {
        type: "spring",
        stiffness: 260,
        damping: 22,
        mass: 0.4,
        restDelta: 0.0001,
      },
      fontFamily,
      className,
      cardClassName,
      trackClassName,
      textClassName,
      onCardClick,
      onCardHover,
      style,
      ...props
    },
    ref
  ) => {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    const handleCardHover = React.useCallback(
      (index: number) => {
        setHoveredIndex(index);
        onCardHover?.(cards[index], index);
      },
      [cards, onCardHover]
    );

    const handleMouseLeaveContainer = React.useCallback(() => {
      setHoveredIndex(null);
      onCardHover?.(null, null);
    }, [onCardHover]);

    const restingWidth = cardWidth + (cards.length - 1) * cardOffset;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center select-none overflow-visible [transform:translateZ(0)]",
          className
        )}
        style={{
          width: `${restingWidth}px`,
          height: `${cardHeight}px`,
          fontFamily,
          ...style,
        }}
        onMouseLeave={handleMouseLeaveContainer}
        {...props}
      >
        <div
          className={cn(
            "relative block overflow-visible [transform-style:preserve-3d]",
            trackClassName
          )}
          style={{
            width: `${restingWidth}px`,
            height: `${cardHeight}px`,
          }}
        >
          {cards.map((card, index) => {
            let targetX = index * cardOffset;
            let targetY = 0;
            let targetRotate = 0;
            const zIndex = index + 1;

            if (hoveredIndex !== null) {
              if (index < hoveredIndex) {
                targetRotate = -tiltAngle;
                targetX = index * cardOffset;
                targetY = 0;
              } else if (index === hoveredIndex) {
                targetRotate = 0;
                targetY = -popHeight;
                targetX = index * cardOffset;
              } else {
                targetRotate = tiltAngle;
                targetX = index * cardOffset + hoverSpread;
                targetY = 0;
              }
            }

            const CardElement = card.link ? motion.a : motion.div;
            const linkProps = card.link
              ? {
                  href: card.link,
                  target: card.openInNewTab ? "_blank" : undefined,
                  rel: card.openInNewTab ? "noopener noreferrer" : undefined,
                }
              : {};

            return (
              <CardElement
                key={card.id || `card-${index}`}
                {...(linkProps as any)}
                className={cn(
                  "absolute top-0 left-0 cursor-pointer overflow-hidden p-4 flex flex-col items-start justify-start no-underline will-change-transform [transform:translateZ(0)] [backface-visibility:hidden] shadow-[0_10px_30px_-6px_rgba(0,0,0,0.45)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)]",
                  cardClassName
                )}
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  borderRadius:
                    typeof cardCornerRadius === "number"
                      ? `${cardCornerRadius}px`
                      : cardCornerRadius,
                  backgroundColor: card.bgColor || "#18181b",
                  zIndex,
                  transformOrigin: "50% 50%",
                }}
                animate={{
                  x: targetX,
                  y: targetY,
                  rotate: targetRotate,
                }}
                transition={{
                  type: "spring",
                  stiffness: springConfig.stiffness ?? 260,
                  damping: springConfig.damping ?? 22,
                  mass: springConfig.mass ?? 0.4,
                  restDelta: springConfig.restDelta ?? 0.0001,
                }}
                onMouseEnter={() => handleCardHover(index)}
                onClick={(e: React.MouseEvent) => {
                  if (onCardClick) {
                    e.preventDefault();
                    onCardClick(card, index);
                  }
                }}
              >
                {card.showImage && card.image && (
                  <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden rounded-[inherit]">
                    <img
                      src={card.image}
                      alt={card.imageAlt || card.title}
                      className="block w-full h-full object-cover object-center rounded-[inherit] pointer-events-none"
                      loading="eager"
                      decoding="async"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-black/35 pointer-events-none" />
                  </div>
                )}

                {card.showText !== false && (
                  <div className="relative z-10 flex items-center justify-center select-none pointer-events-none">
                    <span
                      className={cn(
                        "[writing-mode:vertical-rl] [text-orientation:mixed] whitespace-nowrap inline-block font-semibold tracking-[-0.03em] leading-none [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]",
                        textClassName
                      )}
                      style={{
                        color: card.textColor || "#ffffff",
                        fontSize: card.fontSize || "40px",
                        fontFamily,
                      }}
                    >
                      {card.title}
                    </span>
                  </div>
                )}

                {card.customContent && (
                  <div className="relative z-20 mt-auto w-full">
                    {card.customContent}
                  </div>
                )}
              </CardElement>
            );
          })}
        </div>
      </div>
    );
  }
);

PopTiltCards.displayName = "PopTiltCards";

export default function Page() {
  return (
    <main className="w-screen h-screen min-h-screen bg-[#1c1c1c] text-[#f5f5f7] flex items-center justify-center overflow-hidden m-0 p-0 relative font-sans">
      <header className="absolute top-[88px] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center gap-2 z-10 select-none">
        <span className="text-sm font-medium text-[#8e8e93] tracking-wide">
          Interaction study
        </span>
        <h1 className="text-3xl sm:text-[32px] font-semibold text-[#f5f5f7] tracking-tight m-0">
          Pop and tilt on hover
        </h1>
      </header>

      <div className="flex items-center justify-center relative overflow-visible">
        <PopTiltCards />
      </div>
    </main>
  );
}
