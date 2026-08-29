'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  PanInfo,
} from 'framer-motion';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PolaroidContextValue {
  containerRef: React.RefObject<HTMLDivElement>;
  bringToFront: (id: string) => void;
  getZIndex: (id: string) => number;
  enableConstraints: boolean;
}

const PolaroidContext = createContext<PolaroidContextValue | null>(null);

function usePolaroid() {
  const context = useContext(PolaroidContext);
  if (!context) {
    throw new Error('Polaroid components must be used within a <PolaroidGallery />');
  }
  return context;
}

export interface PolaroidGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  enableConstraints?: boolean;
}

export const PolaroidGallery = React.forwardRef<HTMLDivElement, PolaroidGalleryProps>(
  ({ children, className, enableConstraints = true, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;
    const [cardOrder, setCardOrder] = useState<string[]>([]);

    const bringToFront = (id: string) => {
      setCardOrder((prev) => [...prev.filter((cardId) => cardId !== id), id]);
    };

    const getZIndex = (id: string) => {
      const index = cardOrder.indexOf(id);
      return index === -1 ? 10 : 10 + index;
    };

    return (
      <PolaroidContext.Provider
        value={{
          containerRef,
          bringToFront,
          getZIndex,
          enableConstraints,
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Dawning+of+a+New+Day&family=Poppins:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <div
          ref={containerRef}
          className={cn(
            'relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#f6f4f6] py-12 px-4 select-none',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </PolaroidContext.Provider>
    );
  }
);
PolaroidGallery.displayName = 'PolaroidGallery';

export interface PolaroidArenaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PolaroidArena = React.forwardRef<HTMLDivElement, PolaroidArenaProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative z-10 flex min-h-[520px] w-full max-w-6xl flex-wrap items-center justify-center gap-8 md:gap-14',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PolaroidArena.displayName = 'PolaroidArena';

export interface PolaroidCardProps {
  id?: string;
  src: string;
  alt?: string;
  caption?: string;
  aspectRatio?: 'square' | 'portrait' | 'classic' | 'landscape';
  rotate?: number;
  initialX?: number;
  initialY?: number;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showTape?: boolean;
  showPin?: boolean;
  className?: string;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  id,
  src,
  alt = 'Polaroid photo',
  caption,
  aspectRatio = 'square',
  rotate = 0,
  initialX = 0,
  initialY = 0,
  textColor,
  size = 'md',
  showTape = false,
  showPin = false,
  className,
}) => {
  const generatedId = useRef(id || `polaroid-${Math.random().toString(36).substring(2, 9)}`);
  const cardId = id || generatedId.current;
  const { containerRef, bringToFront, getZIndex, enableConstraints } = usePolaroid();
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);

  const xVelocity = useVelocity(x);
  const rawTilt = useTransform(xVelocity, [-2000, 0, 2000], [-18, 0, 18]);
  const smoothTilt = useSpring(rawTilt, { stiffness: 350, damping: 25 });
  const dynamicRotate = useTransform(smoothTilt, (v) => (isDragging ? rotate + v : rotate));

  const handleDragStart = () => {
    setIsDragging(true);
    bringToFront(cardId);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
    setIsDragging(false);
  };

  const sizeClasses = {
    sm: 'w-[230px] p-2.5 pb-9',
    md: 'w-[280px] p-3 pb-12',
    lg: 'w-[330px] p-3.5 pb-14',
  }[size];

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    classic: 'aspect-[4/5]',
    landscape: 'aspect-[4/3]',
  }[aspectRatio];

  const captionSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  return (
    <div className="relative flex items-center justify-center [perspective:1000px]">
      <motion.div
        style={{
          x,
          y,
          rotate: dynamicRotate,
          zIndex: getZIndex(cardId),
          touchAction: 'none',
          transformOrigin: 'top center',
        }}
        drag
        dragConstraints={enableConstraints ? containerRef : false}
        dragElastic={0.15}
        dragMomentum={true}
        whileHover={{
          scale: isDragging ? 1.05 : 1.02,
          transition: { duration: 0.2 },
        }}
        whileTap={{
          scale: 1.05,
          cursor: 'grabbing',
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onPointerDown={() => bringToFront(cardId)}
        className={cn(
          'relative rounded-[2px] bg-white cursor-grab active:cursor-grabbing select-none border border-neutral-100/60 transition-shadow duration-300',
          sizeClasses,
          isDragging
            ? 'shadow-[0_30px_60px_-12px_rgba(0,0,0,0.22),0_18px_36px_-18px_rgba(0,0,0,0.18)]'
            : 'shadow-[0_10px_30px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
          className
        )}
      >
        {showTape && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-amber-100/75 backdrop-blur-[1px] border-t border-b border-amber-200/50 -rotate-2 pointer-events-none shadow-xs z-20"
            style={{
              clipPath:
                'polygon(0% 10%, 5% 0%, 95% 0%, 100% 10%, 98% 90%, 95% 100%, 5% 100%, 2% 90%)',
            }}
          />
        )}

        {showPin && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md border-2 border-red-600 z-20 pointer-events-none flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
          </div>
        )}

        <div
          className={cn(
            'relative w-full overflow-hidden rounded-[1px] bg-neutral-100 mb-4',
            aspectClasses
          )}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="h-full w-full object-cover pointer-events-none select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-white/5 to-white/20 pointer-events-none" />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
        </div>

        {caption && (
          <div
            className={cn(
              'w-full text-center select-none font-normal tracking-normal pointer-events-none',
              captionSizes
            )}
            style={{
              fontFamily: '"Dawning of a New Day", cursive, sans-serif',
              color: textColor || 'inherit',
            }}
          >
            {caption}
          </div>
        )}

        <div className="absolute inset-0 rounded-[2px] bg-gradient-to-tr from-stone-100/10 via-transparent to-white/30 pointer-events-none" />
      </motion.div>
    </div>
  );
};

export interface PolaroidInstructionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export const PolaroidInstruction = React.forwardRef<HTMLParagraphElement, PolaroidInstructionProps>(
  ({ children = 'Click and Drag', className, ...props }, ref) => {
    return (
      <div className="z-0 mt-8 pointer-events-none transition-opacity duration-300">
        <p
          ref={ref}
          className={cn(
            'text-[19px] font-medium tracking-wide text-[#c6b9c6]',
            className
          )}
          style={{ fontFamily: '"Poppins", sans-serif' }}
          {...props}
        >
          {children}
        </p>
      </div>
    );
  }
);
PolaroidInstruction.displayName = 'PolaroidInstruction';

export default function PolaroidDragDemo() {
  return (
    <PolaroidGallery className="bg-[#f6f4f6]">
      <PolaroidArena>
        <PolaroidCard
          id="card-1"
          src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800&auto=format&fit=crop"
          alt="Lucidity of dreams"
          caption="Lucidity of dreams"
          aspectRatio="square"
          rotate={-6}
          textColor="rgb(51, 28, 46)"
        />

        <PolaroidCard
          id="card-2"
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
          alt="The garden of memories"
          caption="The garden of memories"
          aspectRatio="portrait"
          rotate={6}
          textColor="rgb(51, 51, 51)"
        />

        <PolaroidCard
          id="card-3"
          src="https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=800&auto=format&fit=crop"
          alt="Whispers of the sea"
          caption="Whispers of the sea"
          aspectRatio="square"
          rotate={-2}
          textColor="rgb(44, 53, 64)"
        />
      </PolaroidArena>

      <PolaroidInstruction>Click and Drag</PolaroidInstruction>
    </PolaroidGallery>
  );
}