"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  PACKAGE_MANAGERS,
  cliInstallCommand,
  type PackageManager,
} from "@/lib/open/package-manager";
import { PackageManagerMark } from "@/components/open/pm-marks";
import { OpenCopyButton } from "@/components/open/copy-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export function OpenCliBar({
  registryUrl,
  manager,
  onManagerChange,
}: {
  registryUrl: string;
  manager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const command = cliInstallCommand(manager, registryUrl);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  return (
    <div ref={rootRef} className="open-cli">
      <Tooltip>
        <TooltipTrigger
          delay={0}
          className="open-cli-pm"
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

      <div className="open-cli-command">
        <OpenCopyButton value={command} label="Copy install command" className="open-cli-copy">
          <img src="/open/copy.svg" alt="" width={16} height={16} className="size-4" />
        </OpenCopyButton>
        <code title={command}>{command}</code>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            role="listbox"
            aria-label="Package managers"
            className="open-cli-menu"
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
      className={cn("open-cli-option", active && "is-active")}
      onClick={onSelect}
    >
      <PackageManagerMark manager={option} className="size-4" />
      <span>{option}</span>
    </button>
  );
}
