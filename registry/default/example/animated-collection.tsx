"use client";

import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type Transition,
} from "motion/react";
import {
  Playlist01Icon,
  GridViewIcon,
  Layers01Icon,
  StarIcon,
  Ticket01Icon,
  Camera01Icon,
  BrushIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  idNumber: string;
  image: string;
  icon: any;
}

// Change Here
const ITEMS: CollectionItem[] = [
  {
    id: "1",
    title: "Cinematic Horizons",
    subtitle: "Photography",
    idNumber: "209",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&h=400&auto=format&fit=crop",
    icon: Camera01Icon,
  },
  {
    id: "2",
    title: "Abstract Dreams",
    subtitle: "Digital Art",
    idNumber: "808",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&h=400&auto=format&fit=crop",
    icon: BrushIcon,
  },
];
type ViewMode = "list" | "card" | "pack";

const snappySpring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 1,
};

const fastFade: Transition = {
  duration: 0.1,
  ease: "linear",
};

export default function LayoutSwitcher() {
  const [view, setView] = useState<ViewMode>("list");
  return (
    <div className="w-full max-w-xl mx-auto p-4 md:p-8 font-sans selection:bg-primary/10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-medium text-foreground ">
            My Collection
          </h2>

          <div className="flex p-1 bg-muted rounded-full w-fit border border-border">
            <Tab
              active={view === "list"}
              onClick={() => setView("list")}
              icon={Playlist01Icon}
              label="List view"
            />
            <Tab
              active={view === "card"}
              onClick={() => setView("card")}
              icon={GridViewIcon}
              label="Card view"
            />
            <Tab
              active={view === "pack"}
              onClick={() => setView("pack")}
              icon={Layers01Icon}
              label="Pack view"
            />
          </div>
        </div>
        <div className="h-px bg-border w-full" />
        {/* Content Section */}
        <div className="relative min-h-[350px] flex flex-col items-center">
          <LayoutGroup>
            <motion.div
              layout
              transition={snappySpring}
              className={cn(
                "w-full relative",
                view === "list" && "flex flex-col gap-4",
                view === "card" && "grid grid-cols-2 gap-4",
                view === "pack" && "h-64 flex items-center justify-center mt-8"
              )}
            >
              {ITEMS.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  transition={snappySpring}
                  className={cn(
                    "relative flex items-center z-10",
                    view === "list" && "flex-row gap-4 w-full",
                    view === "card" && "flex-col gap-3 w-full items-start",
                    view === "pack" &&
                      "absolute w-56 h-56 items-center justify-center"
                  )}
                  style={{
                    zIndex: view === "pack" ? ITEMS.length - index : 1,
                  }}
                  animate={
                    view === "pack"
                      ? {
                          rotate: index === 0 ? -12 : 6,
                          x: index === 0 ? -25 : 25,
                          y: index === 0 ? -5 : 5,
                        }
                      : {
                          rotate: 0,
                          x: 0,
                          y: 0,
                        }
                  }
                >
                  <motion.div
                    layout
                    transition={snappySpring}
                    className={cn(
                      "relative overflow-hidden shrink-0 bg-background",
                      view === "list" &&
                        "w-16 h-16 rounded-2xl border border-border/50 ",
                      view === "card" &&
                        "w-full aspect-square rounded-[1.8rem] border border-border/50 shadow-sm",
                      view === "pack" &&
                        "w-full h-full rounded-[2rem] border border-border/50  shadow-xl"
                    )}
                  >
                    <motion.img
                      layout
                      transition={snappySpring}
                      src={item.image}
                      alt={item.title}
                      className={cn(
                        "w-full h-full object-cover m-0! p-0! block",
                        view === "list" && "rounded-2xl",
                        view === "card" && "rounded-[1.8rem]",
                        view === "pack" && "rounded-[2rem]"
                      )}
                    />
                  </motion.div>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {view !== "pack" && (
                      <motion.div
                        key={`${item.id}-info`}
                        layout
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                          filter: "blur(4px)",
                        }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                        transition={fastFade}
                        className={cn(
                          "flex flex-1 justify-between items-center min-w-0",
                          view === "card" ? "w-full px-1" : "px-0"
                        )}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <motion.h3
                            layout
                            className="font-medium text-[15px] text-foreground leading-tight truncate"
                          >
                            {item.title}
                          </motion.h3>
                          <motion.div
                            layout
                            className="text-muted-foreground font-medium text-xs flex items-center gap-1.5"
                          >
                            <HugeiconsIcon
                              icon={item.icon}
                              size={12}
                              className="text-primary/70"
                            />
                            <span className="truncate">{item.subtitle}</span>
                          </motion.div>
                        </div>

                        <motion.div
                          layout
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold shrink-0 ml-2"
                        >
                          <HugeiconsIcon
                            icon={StarIcon}
                            size={10}
                            className="text-yellow-500 fill-yellow-500"
                          />
                          <span>#{item.idNumber}</span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {view === "list" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -bottom-2 left-18 right-0 h-px bg-border/40"
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>

            <AnimatePresence>
              {view === "pack" && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 5, filter: "blur(5px)" }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-16 text-center space-y-3 px-4 relative z-0"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wide">
                    <HugeiconsIcon icon={Ticket01Icon} size={12} />
                    <span>Bundle unlocked</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 text-sm font-normal  uppercase transition-all rounded-full outline-none",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {active && (
        <motion.div
          layoutId="active-tab"
          className="absolute inset-0 bg-primary rounded-full shadow-md"
          transition={snappySpring}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <HugeiconsIcon
          icon={icon}
          size={16}
          className={cn(
            "transition-transform duration-300",
            active && "scale-110"
          )}
        />
        {label}
      </span>
    </button>
  );
}
