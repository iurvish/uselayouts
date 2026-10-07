"use client";

import { motion } from "motion/react";
import {
  Bell,
  Flame,
  Folder,
  Hexagon,
  Image,
  Magnet,
  Mic,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { type ComponentType, useMemo, useState } from "react";

type FlowerItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
};

const ITEMS: FlowerItem[] = [
  { id: "bell", icon: Bell },
  { id: "sparkles", icon: Sparkles },
  { id: "mic", icon: Mic },
  { id: "magnet", icon: Magnet },
  { id: "folder", icon: Folder },
  { id: "image", icon: Image },
  { id: "search", icon: Search },
  { id: "flame", icon: Flame },
  { id: "hexagon", icon: Hexagon },
  { id: "dots", icon: Sparkles },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const RADIUS = 88;
const STEP = (Math.PI * 2) / ITEMS.length;

export default function FlowerMenu() {
  const [open, setOpen] = useState(false);

  const points = useMemo(
    () =>
      ITEMS.map((item, index) => {
        const angle = -Math.PI / 2 + index * STEP;

        return {
          ...item,
          x: Math.cos(angle) * RADIUS,
          y: Math.sin(angle) * RADIUS,
        };
      }),
    [],
  );

  return (
    <div className="flex h-[420px] w-full items-center justify-center rounded-xl bg-[#efede5] dark:bg-zinc-900">
      <div className="relative h-[280px] w-[280px]">
        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          {points.map((point, index) => {
            const Icon = point.icon;

            return (
              <motion.button
                key={point.id}
                type="button"
                animate={{
                  x: open ? point.x : 0,
                  y: open ? point.y : 0,
                  opacity: open ? 1 : 0,
                  scale: open ? 1 : 0.5,
                  filter: open ? "blur(0px)" : "blur(4px)",
                }}
                transition={
                            open
                ? {
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    mass: 0.6,
                    delay: index * 0.035,
                  }
                :{
                  duration: 0.5,
                  ease: EASE,
                  delay: open ? index * 0.03 : (points.length - 1 - index) * 0.03,
                }}
                className={`absolute left-0 top-0 flex h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-500 shadow-[0_10px_24px_rgba(0,0,0,0.14)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 ${
                  open ? "pointer-events-auto" : "pointer-events-none"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
              </motion.button>
            );
          })}

          <motion.button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="absolute left-0 top-0 z-20 flex h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[999px] border border-zinc-200 bg-white text-zinc-600 shadow-[0_10px_24px_rgba(0,0,0,0.14)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: open ? 135 : 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <Plus className="h-[22px] w-[22px]" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
