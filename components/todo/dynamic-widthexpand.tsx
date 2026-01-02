"use client";

import React, { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
}

const ITEMS: GalleryItem[] = [
  {
    id: "grassy",
    title: "Highlands",
    subtitle: "Golden fields under the giant",
    image:
      "https://images.unsplash.com/photo-1755441172753-ac9b90dcd930?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8OHx8fGVufDB8fHx8fA%3D%3D",
    color: "#84cc16",
  },
  {
    id: "misty",
    title: "Crimson",
    subtitle: "A scarlet flame in the mountains",
    image:
      "https://plus.unsplash.com/premium_photo-1667423711653-1ffb899172bc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MjZ8fHxlbnwwfHx8fHw%3D",
    color: "#10b981",
  },
  {
    id: "desert",
    title: "Deep Sea",
    subtitle: "Floating gracefully in the abyss",
    image:
      "https://images.unsplash.com/photo-1757263005786-43d955f07fb1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mjd8fHxlbnwwfHx8fHw%3D",
    color: "#0369a1",
  },
];

export default function DynamicWidthExpand() {
  const [layout, setLayout] = useState({
    row1: ["grassy", "misty"],
    row2: ["desert"],
  });

  const handleExpand = (id: string) => {
    const inRow1 = layout.row1.includes(id);
    const inRow2 = layout.row2.includes(id);

    if (
      (inRow1 && layout.row1.length === 1) ||
      (inRow2 && layout.row2.length === 1)
    )
      return;

    if (inRow1) {
      const neighbor = layout.row1.find((i) => i !== id)!;
      setLayout({
        row1: [id],
        row2: [...layout.row2, neighbor],
      });
    } else {
      const neighbor = layout.row2.find((i) => i !== id)!;
      setLayout({
        row1: [...layout.row1, neighbor],
        row2: [id],
      });
    }
  };

  return (
    <div className="flex items-center justify-center  overflow-hidden">
      <div className="w-full max-w-2xl px-6">
        <LayoutGroup id="gallery-v5">
          <motion.div
            layout
            className="grid grid-cols-2 gap-6 h-[340px] sm:h-[540px]"
          >
            {ITEMS.map((item) => {
              const isRow1 = layout.row1.includes(item.id);
              const rowArr = isRow1 ? layout.row1 : layout.row2;
              const isSelected = rowArr.length === 1 && rowArr[0] === item.id;

              const gridRow = isRow1 ? 1 : 2;
              let gridColumn = "";
              if (isSelected) {
                gridColumn = "1 / span 2";
              } else {
                if (item.id === "grassy") gridColumn = "1";
                else if (item.id === "misty") gridColumn = "2";
                else {
                  // Desert fills the remaining slot
                  const otherInRow = rowArr.find((id) => id !== "desert");
                  gridColumn = otherInRow === "grassy" ? "2" : "1";
                }
              }

              return (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  onClick={() => handleExpand(item.id)}
                  style={{ gridRow, gridColumn } as any}
                  className={cn(
                    "relative cursor-pointer group",
                    isSelected ? "z-30" : "z-50 "
                  )}
                  transition={{
                    layout: {
                      type: "spring",
                      stiffness: 85,
                      damping: 24,
                      mass: 1,
                    },
                  }}
                >
                  <motion.div
                    layoutId={item.id + "-mask-wrapper"}
                    className="absolute inset-0 overflow-hidden bg-zinc-100"
                    style={{ borderRadius: 32 }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-1000 ease-in-out",
                        isSelected
                          ? "object-[center_35%]"
                          : "object-[center_50%]"
                      )}
                    />
                    <motion.div
                      layoutId={item.id + "-mask"}
                      className={cn(
                        "absolute inset-0 transition-colors duration-700",
                        isSelected ? "bg-black/0" : "bg-black/10"
                      )}
                    />
                  </motion.div>

                  <motion.div
                    layout="position"
                    className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10 select-none"
                  >
                    <motion.div layout="position" className="overflow-hidden">
                      <motion.h3
                        layout="position"
                        className="text-3xl font-medium mb-1 tracking-tight"
                      >
                        {item.title}
                      </motion.h3>
                      <motion.p
                        layout="position"
                        className="text-sm text-white/80 font-normal whitespace-nowrap"
                      >
                        {item.subtitle}
                      </motion.p>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    layoutId={item.id + "-overlay"}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      borderRadius: 32,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)",
                    }}
                  />
                  <motion.div
                    layoutId={item.id + "-border"}
                    className="absolute inset-0 border border-white/10 group-hover:border-white/20 transition-colors duration-500 pointer-events-none"
                    style={{ borderRadius: 32 }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </LayoutGroup>
      </div>
    </div>
  );
}
