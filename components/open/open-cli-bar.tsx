"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  PACKAGE_MANAGERS,
  cliInstallCommand,
  type PackageManager,
} from "@/lib/open/package-manager";
import { PackageManagerMark } from "@/components/open/pm-marks";
import { openPress } from "@/components/open/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Figma 91:4608 default / 91:4640 success — package manager + command + copy */
export function OpenCliBar({
  registryItem,
  manager,
  onManagerChange,
}: {
  registryItem: string;
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const command = cliInstallCommand(manager, registryItem);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative flex items-start justify-center gap-px rounded-xl border border-[hsl(240_4%_29%)] bg-[hsl(240_5%_21%)] py-0.5 pr-0.5 pl-1 text-foreground"
    >
      <Tooltip>
        <TooltipTrigger
          delay={0}
          className={cn(
            "flex items-center justify-center gap-1 self-stretch rounded-lg px-1.5 py-1 text-foreground",
            openPress,
          )}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-label={`Package manager: ${manager}`}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <PackageManagerMark manager={manager} className="size-5" />
          <img
            src="/open/expand.svg"
            alt=""
            width={18}
            height={18}
            className="size-[18px] object-contain opacity-70"
          />
        </TooltipTrigger>
        <TooltipContent>Package manager</TooltipContent>
      </Tooltip>

      <div className="flex items-center">
        <button
          type="button"
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-l-[10px] bg-[hsl(0_20%_1%)] px-2.5 py-1.5 text-[hsl(240_5%_69%)] shadow-[0_0.5px_0_0_hsla(0,0%,100%,0.15)]",
            openPress,
            "hover:text-foreground",
          )}
          onClick={copyCommand}
          aria-label={copied ? "Copied" : "Copy install command"}
        >
          <code
            title={command}
            className="block max-w-[min(42vw,420px)] truncate font-mono text-sm leading-5 tracking-[-0.42px]"
          >
            {command}
          </code>
        </button>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center rounded-r-[9px] border-l border-[hsl(240_4%_11%)] bg-[hsl(0_20%_1%)] p-2 shadow-[0_0.5px_0_0_hsla(0,0%,100%,0.15)]",
            openPress,
          )}
          onClick={copyCommand}
          aria-label={copied ? "Copied" : "Copy"}
        >
          {/* Figma 91:4640 — success is icon-only (green check), no toast text */}
          <img
            src={copied ? "/open/check.svg" : "/open/copy.svg"}
            alt=""
            width={16}
            height={16}
            className="size-4"
          />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            role="listbox"
            aria-label="Package managers"
            className="absolute right-0 bottom-[calc(100%+8px)] left-0 w-44 origin-bottom-left rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, transform: "scale(0.96) translateY(6px)" }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : { opacity: 1, transform: "scale(1) translateY(0px)" }
            }
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, transform: "scale(0.96) translateY(6px)" }
            }
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          >
            {PACKAGE_MANAGERS.map((option) => (
              <PmOption
                key={option}
                option={option}
                active={option === manager}
                onSelect={() => {
                  onManagerChange(option);
                  setMenuOpen(false);
                }}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PmOption({
  option,
  active,
  onSelect,
}: {
  option: PackageManager;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={cn(
        "flex min-h-8 w-full items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground",
        openPress,
        active && "bg-accent text-accent-foreground",
      )}
      onClick={onSelect}
    >
      <PackageManagerMark manager={option} className="size-4" />
      <span>{option}</span>
    </button>
  );
}
