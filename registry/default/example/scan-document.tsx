"use client";

import type { TargetAndTransition, Transition } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export type Status = "idle" | "scanning" | "done";

type ScanBarProps = {
  transition: Transition;
  z: number;
};

const SCAN_DURATION_MS = 5000;
const REDUCED_SCAN_DURATION_MS = 900;
const SCAN_EXIT_DURATION_SECONDS = 0.4;
const REDUCED_SCAN_EXIT_DURATION_SECONDS = 0.2;
const DONE_RESET_DELAY_MS = 1100;
const SCAN_BAR_TRAVEL = 132;

const LABELS: Record<Status, string> = {
  idle: "Scan",
  scanning: "Scanning",
  done: "Done",
};

const SCAN_MOVE_TIMES = [0, 0.1, 0.45, 0.55, 0.9, 1];
const SCAN_CONTAINER_TIMES = [0, 0.55, 1];
const DOCUMENT_ROTATE_Y = [0, 0, 180, 180, 360, 360];
const SCAN_BAR_Y = [0, 0, 1, 1, 0, 0].map(
  (progress) => progress * SCAN_BAR_TRAVEL
);

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const EASE_IN_OUT = [0.645, 0.045, 0.355, 1] as const;

export function ScanBar({ transition, z }: ScanBarProps) {
  return (
    <motion.div
      animate={{ y: SCAN_BAR_Y }}
      className="absolute top-0 h-[7px] w-[124px] rounded-full bg-gradient-to-b from-orange-500 via-orange-400 to-orange-600 shadow-[0_0_16px_3px_var(--color-orange-200),0_5px_9px_-1px_var(--color-orange-100)]"
      style={{ left: "50%", x: "-50%", z }}
      transition={transition}
    >
      <div className="absolute top-[1px] right-3 left-3 h-[1.5px] rounded-full bg-white/70 blur-[0.5px]" />
      <div className="absolute top-1/2 -left-[1px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-orange-200 blur-[1px]" />
      <div className="absolute top-1/2 -right-[1px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-orange-100 blur-[1px]" />
    </motion.div>
  );
}

export function ScanningDocument({
  reduceMotion,
}: {
  reduceMotion: boolean;
}) {
  const scanCycle = useMemo<Transition>(
    () => ({
      duration: reduceMotion
        ? REDUCED_SCAN_DURATION_MS / 1000 - REDUCED_SCAN_EXIT_DURATION_SECONDS
        : SCAN_DURATION_MS / 1000 - SCAN_EXIT_DURATION_SECONDS,
      ease: EASE_IN_OUT,
      times: SCAN_MOVE_TIMES,
    }),
    [reduceMotion]
  );

  const scanContainerExit = useMemo<TargetAndTransition>(
    () => ({
      scaleX: 0.16,
      scaleY: reduceMotion ? 0.12 : 0,
      y: 30,
      opacity: 0,
      transition: {
        duration: reduceMotion
          ? REDUCED_SCAN_EXIT_DURATION_SECONDS
          : SCAN_EXIT_DURATION_SECONDS,
        ease: EASE_OUT,
      },
    }),
    [reduceMotion]
  );

  const scanContainerTransition = useMemo<Transition>(
    () => ({
      duration: reduceMotion ? 0.2 : 0.5,
      ease: EASE_OUT,
      times: SCAN_CONTAINER_TIMES,
    }),
    [reduceMotion]
  );

  return (
    <motion.div
      animate={{
        scaleX: reduceMotion ? [1, 1, 1] : [0.16, 0.16, 1],
        scaleY: reduceMotion ? [1, 1, 1] : [0.12, 1, 1],
        y: reduceMotion ? [0, 0, 0] : [30, 0, 0],
        opacity: 1,
      }}
      aria-hidden="true"
      exit={scanContainerExit}
      initial={
        reduceMotion
          ? { scaleX: 1, scaleY: 1, y: 0, opacity: 0 }
          : { scaleX: 0.16, scaleY: 0.12, y: 30, opacity: 1 }
      }
      style={{ transformOrigin: "bottom center" }}
      transition={scanContainerTransition}
    >
      <div className="h-[150px] w-[110px] [perspective:900px]">
        <motion.div
          animate={{
            rotateY: reduceMotion ? [0, 0, 0, 0, 0, 0] : DOCUMENT_ROTATE_Y,
          }}
          className="relative h-full w-full will-change-transform [transform-style:preserve-3d]"
          transition={scanCycle}
        >
          <div className="absolute top-0 left-1/2 h-full w-[7px] -translate-x-1/2 rounded-sm bg-gradient-to-r from-zinc-300 via-zinc-500 to-zinc-300 shadow-[0_8px_24px_rgba(0,0,0,0.18)]" />

          <div className="absolute inset-0 overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] [backface-visibility:hidden]">
            <div className="mt-4 ml-4 h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <div className="mt-4 ml-4 h-[3px] w-12 rounded bg-zinc-300" />
            <div className="mt-2 ml-4 h-[3px] w-16 rounded bg-zinc-200" />
            <div className="mt-1.5 ml-4 h-[3px] w-14 rounded bg-zinc-200" />
            <div className="mt-1.5 ml-4 h-[3px] w-16 rounded bg-zinc-200" />
            <div className="mt-1.5 ml-4 h-[3px] w-10 rounded bg-zinc-200" />
            <div className="mt-8 ml-5 h-4 w-12 -rotate-6 rounded-full border-b-2 border-zinc-300" />
          </div>

          <div className="absolute inset-0 [transform:rotateY(180deg)] rounded-md bg-zinc-300 shadow-[0_8px_24px_rgba(0,0,0,0.18)] [backface-visibility:hidden]" />

          <ScanBar transition={scanCycle} z={3} />
          <ScanBar transition={scanCycle} z={-3} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Icon({
  size = 24,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  const clipId = useId().replace(/:/g, "");

  return (
    <svg
      aria-hidden="true"
      fill={color}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M2.77 10C2.34 10 2 9.66 2 9.23V6.92C2 4.21 4.21 2 6.92 2H9.23C9.66 2 10 2.34 10 2.77C10 3.2 9.66 3.54 9.23 3.54H6.92C5.05 3.54 3.54 5.06 3.54 6.92V9.23C3.54 9.66 3.19 10 2.77 10Z"
          fill="currentColor"
        />
        <path
          d="M21.23 10C20.81 10 20.46 9.66 20.46 9.23V6.92C20.46 5.05 18.94 3.54 17.08 3.54H14.77C14.34 3.54 14 3.19 14 2.77C14 2.35 14.34 2 14.77 2H17.08C19.79 2 22 4.21 22 6.92V9.23C22 9.66 21.66 10 21.23 10Z"
          fill="currentColor"
        />
        <path
          d="M17.0799 21.9997H15.6899C15.2699 21.9997 14.9199 21.6597 14.9199 21.2297C14.9199 20.8097 15.2599 20.4597 15.6899 20.4597H17.0799C18.9499 20.4597 20.4599 18.9397 20.4599 17.0797V15.6997C20.4599 15.2797 20.7999 14.9297 21.2299 14.9297C21.6499 14.9297 21.9999 15.2697 21.9999 15.6997V17.0797C21.9999 19.7897 19.7899 21.9997 17.0799 21.9997Z"
          fill="currentColor"
        />
        <path
          d="M9.23 22H6.92C4.21 22 2 19.79 2 17.08V14.77C2 14.34 2.34 14 2.77 14C3.2 14 3.54 14.34 3.54 14.77V17.08C3.54 18.95 5.06 20.46 6.92 20.46H9.23C9.65 20.46 10 20.8 10 21.23C10 21.66 9.66 22 9.23 22Z"
          fill="currentColor"
        />
        <path
          d="M18.46 11.2305H17.1H6.90002H5.54002C5.11002 11.2305 4.77002 11.5805 4.77002 12.0005C4.77002 12.4205 5.11002 12.7705 5.54002 12.7705H6.90002H17.1H18.46C18.89 12.7705 19.23 12.4205 19.23 12.0005C19.23 11.5805 18.89 11.2305 18.46 11.2305Z"
          fill="currentColor"
        />
        <path
          d="M6.8999 13.9405V14.2705C6.8999 15.9305 8.2399 17.2705 9.8999 17.2705H14.0999C15.7599 17.2705 17.0999 15.9305 17.0999 14.2705V13.9405C17.0999 13.8205 17.0099 13.7305 16.8899 13.7305H7.1099C6.9899 13.7305 6.8999 13.8205 6.8999 13.9405Z"
          fill="currentColor"
        />
        <path
          d="M6.8999 10.0605V9.73047C6.8999 8.07047 8.2399 6.73047 9.8999 6.73047H14.0999C15.7599 6.73047 17.0999 8.07047 17.0999 9.73047V10.0605C17.0999 10.1805 17.0099 10.2705 16.8899 10.2705H7.1099C6.9899 10.2705 6.8999 10.1805 6.8999 10.0605Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect fill="white" height="24" width="24" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function ScanDocumentButton() {
  const [status, setStatus] = useState<Status>("idle");
  const scanTimeoutRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const clearScanTimeout = useCallback(() => {
    if (scanTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    return clearScanTimeout;
  }, [clearScanTimeout]);

  const handleScan = useCallback(() => {
    if (status !== "idle") {
      return;
    }

    setStatus("scanning");
    clearScanTimeout();

    const scanMs = reduceMotion ? REDUCED_SCAN_DURATION_MS : SCAN_DURATION_MS;

    scanTimeoutRef.current = window.setTimeout(() => {
      setStatus("done");
      scanTimeoutRef.current = window.setTimeout(() => {
        setStatus("idle");
        scanTimeoutRef.current = null;
      }, DONE_RESET_DELAY_MS);
    }, scanMs);
  }, [clearScanTimeout, reduceMotion, status]);

  return (
    <section
      aria-label="Document scanner"
      className="relative flex h-[320px] flex-col items-center justify-center gap-8"
    >
      <div className="flex h-[170px] items-end">
        <AnimatePresence>
          {status === "scanning" ? (
            <ScanningDocument key="scanning-document" reduceMotion={reduceMotion} />
          ) : null}
        </AnimatePresence>
      </div>

      <button
        aria-label={LABELS[status]}
        className="flex cursor-pointer items-center gap-2 rounded-md border border-b-4 border-lime-500 bg-primary px-5 py-1.5 text-sm font-medium text-primary-foreground outline-none transition-[transform,opacity] duration-200 ease-out active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100 motion-reduce:active:scale-100"
        disabled={status !== "idle"}
        onClick={handleScan}
        type="button"
      >
        <Icon size={16} />
        {LABELS[status]}
      </button>
    </section>
  );
}

export default function ScanDocument() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ScanDocumentButton />
    </div>
  );
}
