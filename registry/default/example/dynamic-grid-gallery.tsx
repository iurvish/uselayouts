"use client";

import React, { useState } from "react";

export interface GalleryItem {
  id: string | number;
  src: string;
  alt?: string;
  title?: string;
}

export interface DynamicGridGalleryProps {
  /** Array of 6 image items (defaults to curated 4K warm amber landscape collection) */
  items?: GalleryItem[];
  /** Grid gap in pixels (default: 10.1) */
  gap?: number;
  /** Hover expansion ratio for active row/col (default: 1.95) */
  expandFactor?: number;
  /** Border radius tailwind class (default: "rounded-none" for sharp corners) */
  rounded?: string;
  /** Custom container class */
  className?: string;
}

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "Dune Crests",
    src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2560&auto=format&fit=crop",
    alt: "Sculptural desert sand dunes with dramatic warm golden shadows",
  },
  {
    id: 2,
    title: "Canyon Glow",
    src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=2560&auto=format&fit=crop",
    alt: "Smooth flowing sandstone slot canyon with rich terracotta tones",
  },
  {
    id: 3,
    title: "Golden Monolith",
    src: "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?q=80&w=2560&auto=format&fit=crop",
    alt: "Towering desert rock formations in golden hour sunset light",
  },
  {
    id: 4,
    title: "Terracotta Ridges",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2560&auto=format&fit=crop",
    alt: "Vast desert canyon highway framed by warm red rock formations",
  },
  {
    id: 5,
    title: "Sahara Solitude",
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2560&auto=format&fit=crop",
    alt: "Minimalist undulating sand dunes with deep warm contrast",
  },
  {
    id: 6,
    title: "Sedona Sunset",
    src: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2560&auto=format&fit=crop",
    alt: "Warm amber horizon across rugged desert cliffs and plateau",
  },
];

/**
 * DynamicGridGallery - Framer-style interactive dynamic expandable 3x2 grid gallery.
 * Drop-in, fully responsive, Tailwind CSS & Shadcn friendly.
 */
export function DynamicGridGallery({
  items = DEFAULT_GALLERY_ITEMS,
  gap = 10.1,
  expandFactor = 1.95,
  rounded = "rounded-none",
  className = "",
}: DynamicGridGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Dynamic calculation for 3 columns x 2 rows
  const getGridTemplate = () => {
    const cols = 3;
    const rows = 2;

    if (hoveredIndex === null) {
      return {
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr",
      };
    }

    const hoveredRow = Math.floor(hoveredIndex / cols);
    const hoveredCol = hoveredIndex % cols;

    const rowTemplates = Array.from({ length: rows }, (_, r) =>
      r === hoveredRow ? `${expandFactor}fr` : "0.9fr"
    ).join(" ");

    const colTemplates = Array.from({ length: cols }, (_, c) =>
      c === hoveredCol ? `${expandFactor}fr` : "0.9fr"
    ).join(" ");

    return {
      gridTemplateColumns: colTemplates,
      gridTemplateRows: rowTemplates,
    };
  };

  const gridStyles = getGridTemplate();

  return (
    <div
      className={`relative h-full min-h-0 w-full select-none ${className}`}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div
        className="w-full h-full grid transition-[grid-template-columns,grid-template-rows] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          gridTemplateColumns: gridStyles.gridTemplateColumns,
          gridTemplateRows: gridStyles.gridTemplateRows,
          gap: `${gap}px`,
        }}
      >
        {items.slice(0, 6).map((item, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.id || index}
              onMouseEnter={() => setHoveredIndex(index)}
              className={`relative w-full h-full overflow-hidden ${rounded} cursor-pointer select-none bg-neutral-900 group`}
            >
              <img
                src={item.src}
                alt={item.alt || item.title || ""}
                loading={index < 3 ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.98] contrast-[1.04]"
              />
              {/* Subtle ambient lighting vignette */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 transition-opacity duration-300 pointer-events-none ${
                  isHovered ? "opacity-0" : "opacity-40"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DynamicGridGalleryDemo() {
  return (
    <div className="aspect-[3/2] w-[min(100%-3rem,72rem)]">
      <DynamicGridGallery />
    </div>
  );
}
