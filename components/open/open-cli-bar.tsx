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
import { shikiCommandSurface } from "@/components/open/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGatedCopy } from "@/hooks/use-gated-copy";
import { Confetti, type ConfettiRef } from "@/registry/magicui/confetti";
import { cn } from "@/lib/utils";

/** Figma 91:4608 default / 91:4640 success — package manager + command + copy */
export function OpenCliBar({
  registryItem,
  manager,
  onManagerChange,
  html = {},
}: {
  registryItem: string;
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
  /** Pre-highlighted shell HTML per manager (same Shiki surface as DocsCodeBlock). */
  html?: Partial<Record<PackageManager, string>>;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const confettiRef = React.useRef<ConfettiRef>(null);
  const reduce = useReducedMotion();
  const command = cliInstallCommand(manager, registryItem);
  const gatedCopy = useGatedCopy({
    componentSlug: registryItem,
    source: "cli",
  });

  React.useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  function fireConfetti() {
    if (reduce) return;
    confettiRef.current?.fire({
      particleCount: 55,
      spread: 70,
      startVelocity: 28,
      origin: { x: 0.5, y: 0.92 },
    });
  }

  async function copyCommand() {
    try {
      const ok = await gatedCopy(command);
      if (!ok) return;
      // Fire before setState so burst isn't racing a re-render.
      fireConfetti();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <Confetti
        ref={confettiRef}
        manualstart
        className="pointer-events-none absolute inset-x-[-120px] bottom-0 z-30 h-[280px] w-[calc(100%+240px)]"
      />
      <div
        ref={rootRef}
        className="relative z-20 flex items-start justify-center gap-px rounded-[12px] border border-solid border-[#47474d] bg-[#323239] py-0.5 pr-0.5 pl-1 text-foreground"
      >
        <Tooltip>
          <TooltipTrigger
            delay={0}
            className="flex cursor-pointer items-center justify-center gap-1 self-stretch rounded-lg px-1.5 py-1 text-foreground"
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
              /* Figma 102:699 — command segment; Shiki tokens only (bg stays #030202) */
              "flex max-w-[min(42vw,420px)] cursor-pointer items-center justify-center overflow-hidden rounded-l-[10px] bg-[#030202] px-2.5 py-1.5 shadow-[0_0.5px_0_0_rgba(255,255,255,0.15)]",
              "hover:bg-[#030202]",
            )}
            onClick={copyCommand}
            aria-label={copied ? "Copied" : "Copy install command"}
            title={command}
          >
            <div
              className={cn(
                shikiCommandSurface,
                "overflow-hidden whitespace-nowrap [&_pre]:overflow-hidden [&_pre]:whitespace-nowrap [&_code]:whitespace-nowrap",
              )}
              dangerouslySetInnerHTML={{
                __html: html[manager] || `<pre><code>${command}</code></pre>`,
              }}
            />
          </button>
          <button
            type="button"
            className={cn(
              /* Figma 102:701 — copy control; match command segment surface */
              "flex cursor-pointer items-center justify-center rounded-r-[9px] border-l border-solid border-[#1b1b1d] bg-[#030202] p-2 shadow-[0_0.5px_0_0_rgba(255,255,255,0.15)]",
              "hover:bg-[#030202]",
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
              className="absolute right-0 bottom-[calc(100%+8px)] left-0 flex w-44 origin-bottom-left flex-col gap-1 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
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
        "flex min-h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors duration-150",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
      )}
      onClick={onSelect}
    >
      <PackageManagerMark manager={option} className="size-4" />
      <span>{option}</span>
    </button>
  );
}
