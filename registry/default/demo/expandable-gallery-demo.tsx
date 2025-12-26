"use client";

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import React, { useState, useId } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

const PHOTOS = [
  {
    id: "photo-1",
    src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800",
    alt: "Technology setup",
    rotation: -15,
    x: -90,
    y: 10,
    zIndex: 10,
  },
  {
    id: "photo-2",
    src: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800",
    alt: "Design research",
    rotation: -3,
    x: -10,
    y: -15,
    zIndex: 20,
  },
  {
    id: "photo-3",
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800",
    alt: "Code and development",
    rotation: 12,
    x: 75,
    y: 5,
    zIndex: 30,
  },
  {
    id: "photo-4",
    src: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800",
    alt: "Dashboard interface",
  },
  {
    id: "photo-5",
    src: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800",
    alt: "Product design",
  },
  {
    id: "photo-6",
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800",
    alt: "Laptop on desk",
  },
  {
    id: "photo-7",
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800",
    alt: "Team collaboration",
  },
  {
    id: "photo-8",
    src: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800",
    alt: "UX wireframes",
  },
  {
    id: "photo-9",
    src: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800",
    alt: "Developer workspace",
  },
];

const transition = {
  type: "spring",
  stiffness: 160,
  damping: 18,
  mass: 1,
} as const;

export default function ExpandableGalleryDemo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const layoutGroupId = useId();

  return (
    <section className="relative w-full py-8 px-4 bg-background flex flex-col items-center justify-start min-h-[580px] overflow-hidden">
      <LayoutGroup id={layoutGroupId}>
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          <div className="w-full h-10 flex items-center justify-between px-4 mb-2">
            <AnimatePresence>
              {isExpanded && (
                <motion.button
                  key="back-button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all group z-50 text-sm font-medium"
                >
                  <div className="p-1.5 rounded-full bg-muted group-hover:bg-accent transition-colors text-foreground">
                    <HugeiconsIcon
                      icon={ArrowLeft01Icon}
                      width={16}
                      height={16}
                    />
                  </div>
                  <span>Go back</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            layout
            className={cn(
              "relative w-full",
              isExpanded
                ? "grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4"
                : "flex flex-col items-center justify-start pt-4"
            )}
            transition={transition}
          >
            <div
              className={cn(
                "relative",
                isExpanded
                  ? "contents"
                  : "h-[300px] md:h-[350px] w-full flex items-center justify-center mb-4 md:mb-6"
              )}
            >
              {PHOTOS.map((photo, index) => {
                const isPrimary = index < 3;
                if (!isPrimary && !isExpanded) return null;

                return (
                  <motion.div
                    key={`card-${photo.id}`}
                    layoutId={`card-container-${photo.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: !isExpanded ? photo.rotation || 0 : 0,
                      x: !isExpanded ? photo.x || 0 : 0,
                      y: !isExpanded ? photo.y || 0 : 0,
                      zIndex: !isExpanded ? photo.zIndex || index : 10,
                    }}
                    transition={transition}
                    whileHover={
                      !isExpanded
                        ? {
                            scale: 1.05,
                            y: (photo.y || 0) - 12,
                            rotate: (photo.rotation || 0) * 0.8,
                            zIndex: 50,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            },
                          }
                        : { scale: 1.02 }
                    }
                    className={cn(
                      "cursor-pointer overflow-hidden bg-muted",
                      isExpanded
                        ? "relative aspect-square rounded-[1.2rem] md:rounded-[2.5rem] border-3 md:border-[5px] border-background shadow-lg"
                        : "absolute w-36 h-36 md:w-56 md:h-56 rounded-[1.8rem] md:rounded-[2.8rem] border-4 md:border-[6px] border-background shadow-[0_15px_45px_rgba(0,0,0,0.12)]"
                    )}
                    onClick={() => !isExpanded && setIsExpanded(true)}
                  >
                    <motion.div
                      layoutId={`image-inner-${photo.id}`}
                      layout="position"
                      className="w-full h-full relative"
                      transition={transition}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover select-none pointer-events-none m-0! p-0! block"
                        sizes={
                          isExpanded
                            ? "(max-width: 1024px) 50vw, 33vw"
                            : "224px"
                        }
                        priority={isPrimary}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {!isExpanded && (
                <motion.div
                  key="stack-content"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center max-w-xl space-y-4 md:space-y-6"
                >
                  <h2 className="text-lg md:text-2xl lg:text-3xl font-normal tracking-tight text-foreground/90 leading-tight">
                    People don’t fall in love with components.{" "}
                    <br className="hidden md:block" />
                    They fall in love with how something feels.
                  </h2>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsExpanded(true)}
                      className="rounded-full h-9 md:h-11 px-6 md:px-8 border-border/40 hover:border-border/80 hover:bg-muted/30 transition-all duration-300 font-normal group text-sm md:text-base shadow-sm"
                    >
                      Explore more components
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="ml-2 transition-transform group-hover:translate-x-1"
                        width={16}
                        height={16}
                      />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </LayoutGroup>
    </section>
  );
}
