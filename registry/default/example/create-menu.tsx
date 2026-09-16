"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBookIcon,
  AiContentGenerator02Icon,
  AiIdeaIcon,
  AssignmentsIcon,
  LicenseDraftIcon,
  PencilEdit02Icon,
  PlusSignCircleIcon,
} from "@hugeicons/core-free-icons";

export default function CreateMenu() {
  const [view, setView] = useState<"button" | "dropdown">("button");
  const rootRef = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    if (view === "dropdown") return <MenuItems />;
    return <NewButton onClick={() => setView("dropdown")} />;
  }, [view]);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setView("button");
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  return (
    <div className="relative h-10 w-full">
      <motion.div
        ref={rootRef}
        layout
        transition={{ type: "spring", bounce: 0.3 }}
        style={{
          borderRadius: view === "button" ? 22 : 12,
          transformOrigin: "top left",
        }}
        className={
          view === "button"
            ? "absolute z-20 w-fit overflow-hidden rounded-full bg-primary text-primary-foreground shadow-sm"
            : "absolute z-20 w-fit overflow-hidden rounded-[12px] bg-popover text-popover-foreground shadow-sm ring-1 ring-border ring-inset"
        }
      >
        <motion.div
          layout
          key={view}
          initial={{ scaleY: 0.98, opacity: 0, filter: "blur(4px)" }}
          animate={{
            scaleY: 1,
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: 0.2, delay: 0.03 },
          }}
          transition={{ type: "spring" }}
        >
          {content}
        </motion.div>
      </motion.div>
    </div>
  );
}

function NewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="z-10 flex w-fit cursor-pointer items-center justify-center gap-1.5 px-4 py-2 pl-3.5"
      onClick={onClick}
    >
      <HugeiconsIcon icon={PlusSignCircleIcon} className="size-4" />
      Start Creating
    </button>
  );
}

function MenuItems() {
  const items = [
    { label: "New Post", icon: LicenseDraftIcon },
    { label: "Generate Idea", icon: AiIdeaIcon },
    { label: "Create Thread", icon: PencilEdit02Icon },
    { label: "New Template", icon: AssignmentsIcon },
    { label: "Repurpose Content", icon: AiContentGenerator02Icon },
    { label: "AI Quick Tool", icon: AiBookIcon },
  ];

  return (
    <div className="flex w-fit flex-col gap-0.5 rounded-full p-1">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className="flex w-full cursor-pointer items-center gap-2 rounded-md bg-muted px-3 py-2 pl-2.5 text-sm text-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground"
        >
          <HugeiconsIcon icon={item.icon} strokeWidth={1.6} className="size-4" />
          <span className="whitespace-nowrap">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

