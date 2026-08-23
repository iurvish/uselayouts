"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";

import {
  PACKAGE_MANAGERS,
  cliInstallCommand,
  type PackageManager,
} from "@/lib/open/package-manager";
import { IconSwap, IconSwapItem } from "@/components/open/icon-swap";
import { PackageManagerMark } from "@/components/open/pm-marks";
import { openPress } from "@/components/open/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

  return (
    <div
      ref={rootRef}
      className="relative flex items-center gap-1 rounded-xl bg-[#242424] py-0.5 pr-0.5 pl-2 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.05)]"
    >
      <Tooltip>
        <TooltipTrigger
          delay={0}
          className={cn(
            "flex h-7 items-center gap-1 rounded-2xl bg-transparent px-0.5 text-[#f7f7f7]",
            openPress,
          )}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-label={`Package manager: ${manager}`}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <PackageManagerMark manager={manager} className="size-5" />
          <img src="/open/expand.svg" alt="" width={18} height={18} className="size-[18px] opacity-70" />
        </TooltipTrigger>
        <TooltipContent>Package manager</TooltipContent>
      </Tooltip>

      <motion.button
        type="button"
        className={cn(
          "flex h-[33px] cursor-pointer items-center overflow-hidden rounded-[10px] border-[0.5px] border-[#222] bg-[#0f0f0f] px-3 text-[#8f8f8f]",
          openPress,
          "hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:text-white",
        )}
        layout={reduce ? false : "size"}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          } catch {
            setCopied(false);
          }
        }}
        aria-label={copied ? "Copied successfully!" : "Copy install command"}
      >
        <IconSwap>
          {copied ? (
            <IconSwapItem key="copied" className="flex items-center gap-2 text-[13px] font-medium whitespace-nowrap text-[#f7f7f7]">
              <Check className="size-3.5" strokeWidth={1.75} />
              Copied successfully!
            </IconSwapItem>
          ) : (
            <IconSwapItem key="command" className="flex items-center gap-2 whitespace-nowrap">
              <code
                title={command}
                className="block max-w-[min(42vw,420px)] truncate font-mono text-sm tracking-[-0.03em]"
              >
                {command}
              </code>
            </IconSwapItem>
          )}
        </IconSwap>
      </motion.button>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            role="listbox"
            aria-label="Package managers"
            className="absolute right-0 bottom-[calc(100%+8px)] left-0 w-44 origin-bottom-left rounded-xl border border-white/12 bg-[#030202] p-1"
            initial={{ opacity: 0, transform: "scale(0.96) translateY(6px)" }}
            animate={{ opacity: 1, transform: "scale(1) translateY(0px)" }}
            exit={{ opacity: 0, transform: "scale(0.96) translateY(6px)" }}
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
        "flex min-h-8 w-full items-center gap-2 rounded-lg px-2 text-[13px] text-[#8f8f8f]",
        openPress,
        active && "bg-[#2e2e2e] text-[#f7f7f7]",
      )}
      onClick={onSelect}
    >
      <PackageManagerMark manager={option} className="size-4" />
      <span>{option}</span>
    </button>
  );
}
