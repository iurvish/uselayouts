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

export function CreateMenu() {
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
        className="absolute z-20 w-fit cursor-pointer overflow-hidden rounded-full bg-popover text-foreground shadow-sm ring-1 ring-gray-300/50 ring-inset"
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
      className="z-10 flex w-fit items-center justify-center gap-1.5 px-4 py-2 pl-3.5"
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
          className="flex w-full items-center gap-2 rounded-md bg-muted px-3 py-2 pl-2.5 text-sm text-accent-foreground transition-colors hover:bg-muted/60"
        >
          <HugeiconsIcon icon={item.icon} strokeWidth={1.6} className="size-4" />
          <span className="whitespace-nowrap">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function CreateMenuPreview() {
  return (
    <div className="flex aspect-[16/10] w-full max-w-[860px] overflow-visible rounded-xl border border-zinc-200 bg-zinc-50">
      <div className="flex w-[240px] shrink-0 flex-col gap-3 border-r border-zinc-200 bg-white p-3">
        <div className="mb-1 flex items-center gap-2 px-1">
          <div className="size-7 rounded-lg bg-zinc-100" />
          <div className="h-3 w-24 rounded bg-zinc-100" />
        </div>
        <CreateMenu />
        <div className="mt-1 space-y-2 px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="size-4 rounded bg-zinc-100" />
              <div
                className="h-3 rounded bg-zinc-100"
                style={{ width: `${58 + (i % 3) * 12}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-2 px-1 pb-1">
          <div className="h-3 w-16 rounded bg-zinc-100" />
          <div className="h-9 w-full rounded-lg bg-zinc-100" />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-zinc-200/80" />
          <div className="h-8 w-8 rounded-md bg-zinc-200/70" />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-100" />
          <div className="rounded-xl bg-zinc-100" />
          <div className="col-span-2 rounded-xl bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
