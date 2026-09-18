"use client";

import "@ncdai/react-wheel-picker/style.css";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as WheelPickerPrimitive from "@ncdai/react-wheel-picker";
import { cn } from "@/lib/utils";

type WheelPickerValue = WheelPickerPrimitive.WheelPickerValue;
type WheelPickerOption<T extends WheelPickerValue = string> =
  WheelPickerPrimitive.WheelPickerOption<T>;

type TimerMode = "compact" | "picker" | "running" | "paused";

const SURFACE_DIMENSIONS: Record<
  TimerMode,
  { width: number; height: number; borderRadius: number }
> = {
  compact: { width: 300, height: 84, borderRadius: 42 },
  picker: { width: 342, height: 286, borderRadius: 48 },
  running: { width: 390, height: 180, borderRadius: 48 },
  paused: { width: 390, height: 180, borderRadius: 48 },
};

const SURFACE_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 1.5,
} as const;

const MIN_MINUTES = 1;
const MAX_MINUTES = 60;
const DEFAULT_MINUTES = 5;
const OPTION_ITEM_HEIGHT = 44;
const PROGRESS_COLOR = "#ff9f0a";

const MINUTE_OPTIONS: WheelPickerOption<number>[] = Array.from(
  { length: MAX_MINUTES - MIN_MINUTES + 1 },
  (_, index) => {
    const value = MIN_MINUTES + index;
    return { label: String(value), value, textValue: `${value} minutes` };
  },
);

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

function WheelPickerWrapper({
  className,
  ...props
}: ComponentProps<typeof WheelPickerPrimitive.WheelPickerWrapper>) {
  return (
    <WheelPickerPrimitive.WheelPickerWrapper
      className={cn(
        "w-56 rounded-lg border border-zinc-200 bg-white px-1 shadow-xs dark:border-zinc-700/80 dark:bg-zinc-900",
        "*:data-rwp:first:*:data-rwp-highlight-wrapper:rounded-s-2xl",
        "*:data-rwp:last:*:data-rwp-highlight-wrapper:rounded-e-2xl",
        className,
      )}
      {...props}
    />
  );
}

function WheelPicker<T extends WheelPickerValue = string>({
  classNames,
  ...props
}: WheelPickerPrimitive.WheelPickerProps<T>) {
  return (
    <WheelPickerPrimitive.WheelPicker
      classNames={{
        optionItem: cn(
          "text-zinc-400 dark:text-zinc-500 data-disabled:opacity-40",
          classNames?.optionItem,
        ),
        highlightWrapper: cn(
          "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50",
          "data-rwp-focused:inset-ring-2 data-rwp-focused:inset-ring-zinc-300 dark:data-rwp-focused:inset-ring-zinc-600",
          classNames?.highlightWrapper,
        ),
        highlightItem: cn("data-disabled:opacity-40", classNames?.highlightItem),
      }}
      {...props}
    />
  );
}

function TimerIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="20" cy="20" r="20" fill="white" fillOpacity={0.16} />
      <rect x="16.5" y="8" width="7" height="2.75" rx="1.375" fill="white" />
      <circle cx="20" cy="22" r="9" fill="white" />
      <path
        d="M20 22v-4.75"
        stroke="#2c2c2c"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ContentLayerProps = {
  children: ReactNode;
  isVisible: boolean;
  className?: string;
};

function ContentLayer({ children, isVisible, className }: ContentLayerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden={!isVisible}
      inert={!isVisible}
      initial={false}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible || reduceMotion ? 1 : 0.95,
      }}
      transition={
        reduceMotion
          ? { duration: 0.1 }
          : isVisible
            ? { duration: 0.22, delay: 0.08, ease: "easeOut" }
            : { duration: 0.15, ease: "easeIn" }
      }
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        isVisible ? "pointer-events-auto" : "pointer-events-none",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

type BlurLayerProps = {
  blur: number;
  maskFrom: number;
  maskTo: number;
  side: "top" | "bottom";
};

// Mask runs from the center row outward, so the heaviest band sits at the wheel's edge.
function BlurLayer({ blur, maskFrom, maskTo, side }: BlurLayerProps) {
  const ramp = (maskTo - maskFrom) / 3;
  const mask = `linear-gradient(to ${side}, transparent ${maskFrom}%, black ${maskFrom + ramp}%, black ${maskTo - ramp}%, transparent ${maskTo}%)`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

const BLUR_BANDS = [
  { blur: 2, maskFrom: 0, maskTo: 35 },
  { blur: 4, maskFrom: 30, maskTo: 65 },
  { blur: 7, maskFrom: 60, maskTo: 95 },
];

type MinutePickerProps = {
  selectedMinutes: number;
  onChange: (minutes: number) => void;
};

function MinutePicker({ selectedMinutes, onChange }: MinutePickerProps) {
  const bandHeight = `calc(50% - ${OPTION_ITEM_HEIGHT / 2}px)`;

  return (
    <div className="relative w-[176px]">
      <WheelPickerWrapper className="w-full rounded-none border-0 bg-transparent px-0 shadow-none dark:bg-transparent">
        <WheelPicker<number>
          options={MINUTE_OPTIONS}
          value={selectedMinutes}
          onValueChange={onChange}
          infinite
          visibleCount={20}
          optionItemHeight={OPTION_ITEM_HEIGHT}
          dragSensitivity={4}
          scrollSensitivity={10}
          classNames={{
            optionItem:
              "pr-16! text-[40px]! font-normal leading-none text-white/30 tabular-nums dark:text-white/30",
            highlightWrapper:
              "bg-white/[0.08] text-white dark:bg-white/[0.08] dark:text-white data-rwp-focused:inset-ring-white/30 dark:data-rwp-focused:inset-ring-white/30",
            highlightItem:
              "pr-16! text-[40px] font-normal leading-none text-white tabular-nums",
          }}
        />
      </WheelPickerWrapper>

      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: bandHeight }}
      >
        {BLUR_BANDS.map((band) => (
          <BlurLayer key={band.blur} side="top" {...band} />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ height: bandHeight }}
      >
        {BLUR_BANDS.map((band) => (
          <BlurLayer key={band.blur} side="bottom" {...band} />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#2c2c2c_0%,transparent_22%,transparent_78%,#2c2c2c_100%)]"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[92px] top-1/2 mt-1.5 -translate-y-1/2 text-[20px] font-medium text-white"
      >
        mins
      </span>
    </div>
  );
}

type TimerBorderProps = {
  remainingSeconds: number;
  totalSeconds: number;
  width: number;
  height: number;
  borderRadius: number;
};

const BORDER_STROKE = 6;

function TimerBorder({
  remainingSeconds,
  totalSeconds,
  width,
  height,
  borderRadius,
}: TimerBorderProps) {
  const reduceMotion = useReducedMotion();
  const progress = totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds;
  const clamped = Math.min(1, Math.max(0, progress));

  // Inset by half the stroke so it isn't clipped; starts at top center, clockwise.
  const s = BORDER_STROKE / 2;
  const r = Math.max(0, Math.min(borderRadius - s, height / 2 - s, width / 2 - s));
  const path = [
    `M ${width / 2} ${s}`,
    `H ${width - s - r}`,
    `A ${r} ${r} 0 0 1 ${width - s} ${s + r}`,
    `V ${height - s - r}`,
    `A ${r} ${r} 0 0 1 ${width - s - r} ${height - s}`,
    `H ${s + r}`,
    `A ${r} ${r} 0 0 1 ${s} ${height - s - r}`,
    `V ${s + r}`,
    `A ${r} ${r} 0 0 1 ${s + r} ${s}`,
    "Z",
  ].join(" ");

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="pointer-events-none absolute inset-0"
    >
      <path d={path} stroke="black" strokeOpacity={0.3} strokeWidth={BORDER_STROKE} />
      <motion.path
        d={path}
        stroke={PROGRESS_COLOR}
        strokeWidth={BORDER_STROKE}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        initial={false}
        animate={{ strokeDashoffset: 1 - clamped, opacity: clamped > 0 ? 1 : 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: "linear" }}
      />
    </svg>
  );
}

const buttonBase =
  "flex items-center justify-center rounded-full text-[18px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2c2c2c]";

export const SetTimer = () => {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<TimerMode>("compact");
  const [selectedMinutes, setSelectedMinutes] = useState(DEFAULT_MINUTES);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_MINUTES * 60);
  const deadlineRef = useRef<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_MINUTES * 60);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);

  const isTimerActive = mode === "running" || mode === "paused";
  const dimensions = SURFACE_DIMENSIONS[mode];

  useEffect(() => {
    if (mode !== "running") return;

    const tick = () => {
      if (deadlineRef.current === null) return;
      const next = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000),
      );
      setRemainingSeconds(next);

      if (next === 0) {
        deadlineRef.current = null;
        restoreFocusRef.current =
          surfaceRef.current?.contains(document.activeElement) ?? false;
        setMode("picker");
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [mode]);

  // The layer that held focus just went inert, so hand keyboard focus to the new one.
  useEffect(() => {
    if (!restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    const layer = isTimerActive ? "running" : mode;
    surfaceRef.current
      ?.querySelector<HTMLElement>(
        `[data-timer-layer="${layer}"] :is(button, [tabindex="0"])`,
      )
      ?.focus({ preventScroll: true });
  }, [mode, isTimerActive]);

  // detail === 0 means the click came from the keyboard.
  const trackFocus = (event: MouseEvent) => {
    restoreFocusRef.current = event.detail === 0;
  };

  const handleOpenPicker = (event: MouseEvent) => {
    trackFocus(event);
    setTotalSeconds(selectedMinutes * 60);
    setRemainingSeconds(selectedMinutes * 60);
    setMode("picker");
  };

  const handleStart = (event: MouseEvent) => {
    trackFocus(event);
    const seconds = selectedMinutes * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    deadlineRef.current = Date.now() + seconds * 1000;
    setMode("running");
  };

  const handlePauseResume = () => {
    if (mode === "running") {
      deadlineRef.current = null;
      setMode("paused");
      return;
    }

    if (mode === "paused") {
      deadlineRef.current = Date.now() + remainingSeconds * 1000;
      setMode("running");
    }
  };

  const handleCancel = (event: MouseEvent) => {
    trackFocus(event);
    deadlineRef.current = null;
    // remainingSeconds stays put so the border doesn't flash full while the layer fades out.
    setMode("compact");
  };

  const handleMinutesChange = (minutes: number) => {
    setTotalSeconds(minutes * 60);
    setSelectedMinutes(minutes);
    setRemainingSeconds(minutes * 60);
  };

  return (
    <div className="flex h-[500px] w-full items-center justify-center overflow-hidden bg-[#e9e9e9]">
      <motion.div
        ref={surfaceRef}
        role="group"
        aria-label="Timer"
        initial={{ opacity: 0, ...SURFACE_DIMENSIONS.compact }}
        animate={{ opacity: 1, ...dimensions }}
        transition={
          reduceMotion
            ? { duration: 0.15 }
            : { ...SURFACE_SPRING, opacity: { duration: 0.2 } }
        }
        className="relative min-w-[250px] overflow-hidden bg-[#2c2c2c] shadow-sm"
      >
        <ContentLayer isVisible={mode === "compact"}>
          <div data-timer-layer="compact" style={SURFACE_DIMENSIONS.compact}>
            <button
              type="button"
              onClick={handleOpenPicker}
              className="flex size-full items-center gap-4 rounded-[42px] pl-[22px] pr-8 text-[28px] font-medium tracking-tight text-white outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
            >
              <TimerIcon />
              Set timer
            </button>
          </div>
        </ContentLayer>

        <ContentLayer isVisible={mode === "picker"}>
          <div
            data-timer-layer="picker"
            className="flex items-center justify-between pl-4 pr-6"
            style={SURFACE_DIMENSIONS.picker}
          >
            <MinutePicker
              selectedMinutes={selectedMinutes}
              onChange={handleMinutesChange}
            />
            <motion.button
              type="button"
              onClick={handleStart}
              whileTap={{ scale: 0.96 }}
              className={cn(
                buttonBase,
                "h-14 w-[96px] bg-[#34c759]/20 text-[#34c759] hover:bg-[#34c759]/30",
              )}
            >
              Start
            </motion.button>
          </div>
        </ContentLayer>

        <ContentLayer isVisible={isTimerActive}>
          <div
            data-timer-layer="running"
            className="relative flex items-center justify-between gap-2 px-5"
            style={SURFACE_DIMENSIONS.running}
          >
            <TimerBorder
              remainingSeconds={remainingSeconds}
              totalSeconds={totalSeconds}
              {...SURFACE_DIMENSIONS.running}
            />

            <motion.button
              type="button"
              onClick={handlePauseResume}
              whileTap={{ scale: 0.96 }}
              className={cn(
                buttonBase,
                "relative h-14 w-[100px] overflow-hidden",
                mode === "paused"
                  ? "bg-[#34c759]/20 text-[#34c759] hover:bg-[#34c759]/30"
                  : "bg-[#ff9f0a]/20 text-[#ff9f0a] hover:bg-[#ff9f0a]/30",
              )}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={mode === "paused" ? "resume" : "pause"}
                  initial={{ y: reduceMotion ? "0%" : "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: reduceMotion ? "0%" : "-100%", opacity: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0.1 }
                      : { type: "spring", stiffness: 500, damping: 35 }
                  }
                  className="block"
                >
                  {mode === "paused" ? "Resume" : "Pause"}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <span
              role="timer"
              aria-label={`${formatTime(remainingSeconds)} remaining${mode === "paused" ? ", paused" : ""}`}
              className="relative text-[48px] font-light leading-none tracking-tight text-white tabular-nums"
            >
              {formatTime(remainingSeconds)}
            </span>

            <motion.button
              type="button"
              onClick={handleCancel}
              whileTap={{ scale: 0.96 }}
              className={cn(
                buttonBase,
                "relative h-14 w-[92px] bg-white/10 text-white hover:bg-white/15",
              )}
            >
              Cancel
            </motion.button>
          </div>
        </ContentLayer>
      </motion.div>
    </div>
  );
};

export default SetTimer;
