"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import { ArrowUp, Check, ChevronDown, ChevronRight, Mic } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { ClaudeAI, Cursor, OpenAI } from "./prompt-box-icons";

const SHELL_SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
  mass: 1.5,
};

const SETTINGS_PANEL_SPRING = {
  type: "spring" as const,
  stiffness: 480,
  damping: 24,
  mass: 0.85,
};

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const EASE_OUT_QUAD = [0.25, 0.46, 0.45, 0.94] as const;

const FAST_TRANSITION = {
  duration: 0.16,
  ease: EASE_OUT_QUAD,
};

const COLLAPSED_HEIGHT = 48;
/** Approximate settle time for SHELL_SPRING height collapse before hover affordances. */
const SHELL_COLLAPSE_SETTLE_MS = 320;
const FOOTER_HEIGHT = 46;
/** One line: pt-4 (16px) + sm:leading-[17px] */
const SINGLE_LINE_TEXTAREA_HEIGHT = 33;
const MIN_EXPANDED_HEIGHT = SINGLE_LINE_TEXTAREA_HEIGHT + FOOTER_HEIGHT;
const MAX_TEXTAREA_HEIGHT = 254;
const MAX_EXPANDED_HEIGHT = MAX_TEXTAREA_HEIGHT + FOOTER_HEIGHT;

const promptFieldClassName =
  "field-sizing-content w-full border-0 bg-transparent text-base leading-5 text-foreground shadow-none outline-none placeholder:font-medium placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-0 sm:text-sm sm:leading-[17px]";

const promptFieldCollapsedClassName =
  "w-full border-0 bg-transparent text-base text-muted-foreground shadow-none outline-none placeholder:font-medium placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-0 sm:text-sm";

const promptFieldCollapsedRowClassName =
  "min-w-0 flex-1 cursor-text border-0 bg-transparent p-0 font-medium leading-none text-muted-foreground placeholder:text-muted-foreground placeholder:leading-none";

export type PromptSettingOption = {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
};

export type PromptSettingGroup = {
  id: string;
  label: string;
  options: PromptSettingOption[];
  /** Render options as selectable rows in the main panel. */
  display?: "featured" | "submenu";
};

export type PromptMenuAction = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
};

export type PromptPlusMenuOption = {
  value: string;
  label: string;
};

export type PromptPlusMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  onSelect?: () => void;
  options?: PromptPlusMenuOption[];
  onOptionSelect?: (value: string) => void;
};

function getDefaultSettings(
  groups: PromptSettingGroup[],
  defaults?: Record<string, string>
) {
  return groups.reduce<Record<string, string>>((settings, group) => {
    const preferred = defaults?.[group.id];
    const hasPreferred = group.options.some(
      (option) => option.value === preferred
    );

    settings[group.id] =
      hasPreferred && preferred ? preferred : (group.options[0]?.value ?? "");

    return settings;
  }, {});
}

function getOptionLabel(group: PromptSettingGroup, value: string) {
  return group.options.find((option) => option.value === value)?.label ?? value;
}

function getSelectedSettingIcon(
  groups: PromptSettingGroup[],
  values: Record<string, string>
) {
  const featuredGroup = groups.find((group) => group.display === "featured");
  const group = featuredGroup ?? groups[0];
  if (!group) return null;

  const selectedValue = values[group.id] ?? "";
  return group.options.find((option) => option.value === selectedValue)?.icon ?? null;
}

function CollapsedSelectedModelIcon({
  icon,
  reduceMotion,
  visible,
}: {
  icon: ReactNode;
  reduceMotion: boolean;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none flex size-4 shrink-0 items-center justify-center [&_svg]:size-4 text-muted-foreground"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, x: 28, rotate: -360 }
          }
          animate={
            reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, rotate: 0 }
          }
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, x: 22, rotate: 120 }
          }
          transition={
            reduceMotion
              ? { duration: 0.15, ease: EASE_OUT_QUAD }
              : { duration: 0.38, ease: EASE_OUT }
          }
        >
          {icon}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

const dropdownPanelClassName =
  "fixed z-[400] w-[min(17rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-2xl border border-border/60 bg-card py-1.5 text-sm shadow-[0_10px_28px_-20px_rgba(0,0,0,0.14)] outline-none [-webkit-overflow-scrolling:touch]";

const settingsDropdownPanelClassName =
  "fixed z-[400] w-[min(13rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-xl bg-card p-1 text-[13px] leading-tight shadow-[var(--shadow-elevated)] outline-none [-webkit-overflow-scrolling:touch]";

const DROPDOWN_SIDE_OFFSET = 8;
const DROPDOWN_VIEWPORT_MARGIN = 12;
const DROPDOWN_SUBMENU_OFFSET = 4;
const DROPDOWN_PANEL_WIDTH = 272;
const DROPDOWN_ESTIMATED_HEIGHT = 280;
const COMPACT_VIEWPORT_WIDTH = 640;
const DROPDOWN_MIN_PANEL_HEIGHT = 160;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isCompactViewport() {
  return window.innerWidth < COMPACT_VIEWPORT_WIDTH;
}

function getPanelWidth(viewportWidth: number) {
  return Math.min(
    DROPDOWN_PANEL_WIDTH,
    viewportWidth - DROPDOWN_VIEWPORT_MARGIN * 2
  );
}

function useCompactViewport() {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.matchMedia(`(max-width: ${COMPACT_VIEWPORT_WIDTH - 1}px)`)
      .matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${COMPACT_VIEWPORT_WIDTH - 1}px)`
    );
    const update = () => setIsCompact(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isCompact;
}

function usePrefersHover() {
  const [prefersHover, setPrefersHover] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setPrefersHover(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersHover;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

function getPanelMotion({
  offsetX = 0,
  offsetY = 0,
  openingEase,
  reduceMotion = false,
  instantDismiss = false,
}: {
  offsetX?: number;
  offsetY?: number;
  openingEase?: {
    type: "spring";
    stiffness: number;
    damping: number;
    mass: number;
  };
  reduceMotion?: boolean;
  instantDismiss?: boolean;
}) {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0, transition: { duration: instantDismiss ? 0 : 0.12 } },
      transition: { duration: instantDismiss ? 0 : 0.12 },
    };
  }

  return {
    initial: { opacity: 0, scale: 0.94, x: offsetX, y: offsetY },
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    exit: instantDismiss
      ? { opacity: 0, scale: 1, x: 0, y: 0, transition: { duration: 0 } }
      : {
          opacity: 0,
          scale: 0.98,
          x: offsetX * 0.55,
          y: offsetY * 0.65,
          transition: { duration: 0.14, ease: EASE_OUT_QUAD },
        },
    transition: instantDismiss
      ? { duration: 0 }
      : (openingEase ?? { duration: 0.24, ease: EASE_OUT }),
  };
}

function isInsideDropdownPanel(node: Node | null) {
  return (
    node instanceof Element &&
    Boolean(node.closest("[data-prompt-dropdown-panel]"))
  );
}

function useDropdownDismiss({
  open,
  onClose,
  onEscape,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  onEscape?: () => boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target)) return;
      if (isInsideDropdownPanel(target)) return;

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.stopPropagation();

      if (onEscape?.()) return;

      onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, onEscape, open, triggerRef]);
}

function preventFocusSteal(event: React.MouseEvent) {
  event.preventDefault();
}

function activateOnEnterOrSpace(
  event: React.KeyboardEvent,
  action: () => void
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

const BAR_XS = [1.5, 5.75, 10] as const;
const BAR_WIDTH = 2.5;
const BAR_BOTTOM = 12.5;

type EffortLevel = "low" | "medium" | "high";

const BAR_HEIGHTS = [4.5, 7.5, 10.5] as const;

const EFFORT_BAR_LEVELS: Record<
  EffortLevel,
  Array<{ height: number; visible: boolean }>
> = {
  low: [
    { height: 3.25, visible: true },
    { height: 4.75, visible: true },
    { height: 0, visible: false },
  ],
  medium: [
    { height: BAR_HEIGHTS[0], visible: true },
    { height: BAR_HEIGHTS[1], visible: true },
    { height: 0, visible: false },
  ],
  high: [
    { height: BAR_HEIGHTS[0], visible: true },
    { height: BAR_HEIGHTS[1], visible: true },
    { height: BAR_HEIGHTS[2], visible: true },
  ],
};

function normalizeEffortLevel(value: string): EffortLevel {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
}

function getEffortGroupId(groups: PromptSettingGroup[]) {
  return (
    groups.find((group) => group.id === "effort")?.id ??
    groups.find((group) => group.display === "submenu")?.id
  );
}

function EffortBarsIcon({ level }: { level: EffortLevel }) {
  const bars = EFFORT_BAR_LEVELS[level];

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      viewBox="0 0 14 14"
      width="14"
    >
      {bars.map((bar, index) => (
        <motion.rect
          animate={{
            height: bar.visible ? bar.height : 0,
            opacity: bar.visible ? 1 : 0,
            y: bar.visible ? BAR_BOTTOM - bar.height : BAR_BOTTOM,
          }}
          fill="currentColor"
          initial={{
            height: bar.visible ? bar.height : 0,
            opacity: bar.visible ? 1 : 0,
            y: bar.visible ? BAR_BOTTOM - bar.height : BAR_BOTTOM,
          }}
          key={BAR_XS[index]}
          rx={1}
          transition={{ duration: 0.26, ease: EASE_OUT }}
          width={BAR_WIDTH}
          x={BAR_XS[index]}
        />
      ))}
    </svg>
  );
}

const dropdownSubmenuTriggerClassName =
  "relative flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:outline-none";

const dropdownOptionClassName =
  "relative flex min-h-11 w-full cursor-pointer scroll-m-1 touch-manipulation items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:text-foreground focus-visible:outline-none";

const settingsDropdownOptionClassName =
  "relative flex min-h-10 w-full cursor-pointer scroll-m-1 touch-manipulation items-center justify-between gap-2 rounded-lg py-2 pl-2 pr-2.5 text-left text-[13px] outline-none transition-[color,transform] duration-150 ease-out active:scale-[0.96] focus-visible:text-foreground focus-visible:outline-none";

const settingsDropdownHighlightClassName =
  "absolute inset-0 rounded-lg bg-accent/65";

const dropdownOptionHighlightClassName =
  "absolute inset-x-1 inset-y-0.5 rounded-lg bg-accent/65";

const dropdownPanelSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.72,
};

type SubmenuOrigin = "left" | "right" | "below";

type SubmenuPosition = {
  left: number;
  top: number;
  maxHeight: number;
  origin: SubmenuOrigin;
};

function getFlyoutSubmenuMotion(origin: SubmenuOrigin, instantClose = false) {
  const offsetX = origin === "right" ? -12 : 12;

  return {
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      scale: instantClose ? 1 : 0.98,
      x: instantClose ? 0 : offsetX * 0.55,
    },
    initial: {
      opacity: 0,
      scale: 0.96,
      x: offsetX,
    },
    transition: instantClose ? { duration: 0 } : dropdownPanelSpring,
  };
}

function getSubmenuPosition(
  triggerRect: DOMRect,
  panelHeight: number,
  panelWidth: number
) {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const effectiveWidth = Math.min(panelWidth, getPanelWidth(viewportWidth));

  if (isCompactViewport()) {
    const left = clamp(
      triggerRect.left,
      DROPDOWN_VIEWPORT_MARGIN,
      viewportWidth - effectiveWidth - DROPDOWN_VIEWPORT_MARGIN
    );
    const top = triggerRect.bottom + DROPDOWN_SIDE_OFFSET;
    const maxHeight = Math.max(
      DROPDOWN_MIN_PANEL_HEIGHT,
      viewportHeight - top - DROPDOWN_VIEWPORT_MARGIN
    );

    return {
      left,
      maxHeight,
      origin: "below" as const,
      top,
    };
  }

  const spaceRight =
    viewportWidth -
    triggerRect.right -
    DROPDOWN_SUBMENU_OFFSET -
    DROPDOWN_VIEWPORT_MARGIN;
  const openRight = spaceRight >= effectiveWidth;

  const left = openRight
    ? triggerRect.right + DROPDOWN_SUBMENU_OFFSET
    : triggerRect.left - effectiveWidth - DROPDOWN_SUBMENU_OFFSET;

  const clampedLeft = clamp(
    left,
    DROPDOWN_VIEWPORT_MARGIN,
    viewportWidth - effectiveWidth - DROPDOWN_VIEWPORT_MARGIN
  );

  const maxTop = Math.max(
    DROPDOWN_VIEWPORT_MARGIN,
    viewportHeight - panelHeight - DROPDOWN_VIEWPORT_MARGIN
  );
  const top = clamp(triggerRect.top, DROPDOWN_VIEWPORT_MARGIN, maxTop);
  const maxHeight = Math.max(
    DROPDOWN_MIN_PANEL_HEIGHT,
    viewportHeight - top - DROPDOWN_VIEWPORT_MARGIN
  );

  return {
    left: clampedLeft,
    maxHeight,
    origin: openRight ? ("right" as const) : ("left" as const),
    top,
  };
}

function DropdownMenuDivider() {
  return <hr className="mx-2 h-px border-0 bg-border" />;
}

function DropdownOption({
  compact = false,
  icon,
  label,
  reveal = false,
  reduceMotion = false,
  selected,
  staggerIndex,
  onSelect,
  activeItemId,
  highlightLayoutId,
  setActiveItemId,
}: {
  compact?: boolean;
  icon?: ReactNode;
  label: string;
  reveal?: boolean;
  reduceMotion?: boolean;
  selected: boolean;
  staggerIndex?: number;
  onSelect: () => void;
  activeItemId: string | null;
  highlightLayoutId: string;
  setActiveItemId: (itemId: string | null) => void;
}) {
  const itemId = useId();
  const isActive = activeItemId === itemId;
  const shouldReveal = compact && staggerIndex !== undefined && reveal;
  const revealMotion = shouldReveal
    ? reduceMotion
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.12, ease: EASE_OUT_QUAD },
        }
      : {
          initial: { opacity: 0, y: 8, filter: "blur(4px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: {
            delay: staggerIndex * 0.08,
            duration: 0.22,
            ease: EASE_OUT,
          },
        }
    : undefined;

  return (
    <motion.button
      aria-checked={selected}
      className={`${compact ? settingsDropdownOptionClassName : dropdownOptionClassName} ${selected ? "text-foreground" : "text-muted-foreground"}`}
      onClick={onSelect}
      onKeyDown={(event) => activateOnEnterOrSpace(event, onSelect)}
      onMouseDown={preventFocusSteal}
      onMouseEnter={() => setActiveItemId(itemId)}
      onPointerMove={() => setActiveItemId(itemId)}
      role="menuitemradio"
      tabIndex={-1}
      type="button"
      {...revealMotion}
    >
      {isActive ? (
        <motion.span
          className={
            compact
              ? settingsDropdownHighlightClassName
              : dropdownOptionHighlightClassName
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          layoutId={highlightLayoutId}
          transition={FAST_TRANSITION}
        />
      ) : null}
      <span
        className={`relative z-10 flex min-w-0 flex-1 items-center truncate ${compact ? "gap-2" : "gap-2.5"}`}
      >
        {icon ? (
          <span
            className={`flex shrink-0 items-center justify-center text-muted-foreground ${compact ? "size-4" : "size-5"}`}
          >
            {icon}
          </span>
        ) : null}
        <span className="truncate">{label}</span>
      </span>
      <AnimatePresence>
        {selected ? (
          <motion.span
            animate={
              reduceMotion
                ? { opacity: 1 }
                : compact
                  ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                  : { opacity: 1, scale: 1, y: 0 }
            }
            className={`relative z-10 flex shrink-0 items-center justify-center text-foreground ${compact ? "size-4" : "size-5"}`}
            exit={{ opacity: 0, scale: 0.85 }}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : compact
                  ? { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                  : { opacity: 0, scale: 0.78, y: 1 }
            }
            transition={{ duration: compact ? 0.3 : 0.18, ease: EASE_OUT }}
          >
            <Check className={compact ? "size-3.5" : "h-4 w-4"} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

function DropdownActionItem({
  label,
  icon,
  shortcut,
  onSelect,
  activeItemId,
  highlightLayoutId,
  setActiveItemId,
}: {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
  activeItemId: string | null;
  highlightLayoutId: string;
  setActiveItemId: (itemId: string | null) => void;
}) {
  const itemId = useId();
  const isActive = activeItemId === itemId;

  return (
    <button
      className={`${dropdownOptionClassName} text-foreground`}
      onClick={onSelect}
      onKeyDown={(event) => activateOnEnterOrSpace(event, onSelect)}
      onMouseDown={preventFocusSteal}
      onMouseEnter={() => setActiveItemId(itemId)}
      onPointerMove={() => setActiveItemId(itemId)}
      role="menuitem"
      tabIndex={-1}
      type="button"
    >
      {isActive ? (
        <motion.span
          className={dropdownOptionHighlightClassName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          layoutId={highlightLayoutId}
          transition={FAST_TRANSITION}
        />
      ) : null}
      <span
        className="relative z-10 flex min-w-0 flex-1 items-center gap-2.5 truncate"
      >
        {icon ? (
          <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <span className="truncate">{label}</span>
      </span>
      {shortcut ? (
        <span className="relative z-10 shrink-0 text-muted-foreground text-xs tabular-nums">
          {shortcut}
        </span>
      ) : null}
    </button>
  );
}

function useSubmenuPosition({
  isCompact,
  isOpen,
  submenuRef,
  triggerRef,
}: {
  isCompact: boolean;
  isOpen: boolean;
  submenuRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [submenuPosition, setSubmenuPosition] = useState<SubmenuPosition>({
    left: 0,
    maxHeight: DROPDOWN_ESTIMATED_HEIGHT,
    origin: "right",
    top: 0,
  });

  const updateSubmenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    const submenu = submenuRef.current;
    if (!trigger) return;

    const panelHeight = submenu?.offsetHeight ?? DROPDOWN_ESTIMATED_HEIGHT;
    const panelWidth = submenu?.offsetWidth ?? DROPDOWN_PANEL_WIDTH;

    setSubmenuPosition(
      getSubmenuPosition(
        trigger.getBoundingClientRect(),
        panelHeight,
        panelWidth
      )
    );
  }, [submenuRef, triggerRef]);

  useLayoutEffect(() => {
    if (!isOpen || isCompact) return;

    updateSubmenuPosition();

    const submenu = submenuRef.current;
    let observer: ResizeObserver | undefined;

    if (submenu) {
      observer = new ResizeObserver(updateSubmenuPosition);
      observer.observe(submenu);
    }

    window.addEventListener("resize", updateSubmenuPosition);
    window.addEventListener("scroll", updateSubmenuPosition, true);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateSubmenuPosition);
      window.removeEventListener("scroll", updateSubmenuPosition, true);
    };
  }, [isCompact, isOpen, submenuRef, updateSubmenuPosition]);

  return { submenuPosition, updateSubmenuPosition };
}

function SubmenuInlinePanel({
  isOpen,
  submenuOptions,
}: {
  isOpen: boolean;
  submenuOptions: ReactNode;
}) {
  if (!isOpen) return null;

  return <div className="px-1 pb-1">{submenuOptions}</div>;
}

function SubmenuFlyoutPanel({
  flyoutSubmenuMotion,
  groupLabel,
  isOpen,
  itemId,
  onOpenChange,
  prefersHover,
  setActiveItemId,
  submenuHighlightLayoutId,
  submenuId,
  submenuOptions,
  submenuPosition,
  submenuRef,
  triggerRef,
}: {
  flyoutSubmenuMotion: ReturnType<typeof getFlyoutSubmenuMotion>;
  groupLabel: string;
  isOpen: boolean;
  itemId: string;
  onOpenChange: (open: boolean) => void;
  prefersHover: boolean;
  setActiveItemId: (itemId: string | null) => void;
  submenuHighlightLayoutId: string;
  submenuId: string;
  submenuOptions: ReactNode;
  submenuPosition: SubmenuPosition;
  submenuRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={flyoutSubmenuMotion.animate}
          aria-label={groupLabel}
          className={dropdownPanelClassName}
          data-prompt-dropdown-panel=""
          exit={flyoutSubmenuMotion.exit}
          initial={flyoutSubmenuMotion.initial}
          key={submenuId}
          onMouseEnter={() => setActiveItemId(itemId)}
          onMouseLeave={
            prefersHover
              ? (event) => {
                  const related = event.relatedTarget as Node | null;
                  if (triggerRef.current?.contains(related)) return;
                  if (isInsideDropdownPanel(related)) return;
                  onOpenChange(false);
                }
              : undefined
          }
          ref={submenuRef}
          role="menu"
          style={{
            left: submenuPosition.left,
            maxHeight: submenuPosition.maxHeight,
            top: submenuPosition.top,
            transformOrigin:
              submenuPosition.origin === "right" ? "left top" : "right top",
            zIndex: 401,
          }}
          transition={flyoutSubmenuMotion.transition}
        >
          <LayoutGroup id={submenuHighlightLayoutId}>
            <div className="space-y-0.5">{submenuOptions}</div>
          </LayoutGroup>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DropdownSubmenu({
  group,
  selectedValue,
  triggerLabel,
  valueLabel,
  icon,
  submenuId,
  isOpen,
  onOpenChange,
  onSelect,
  activeItemId,
  highlightLayoutId,
  submenuHighlightLayoutId,
  setActiveItemId,
}: {
  group: PromptSettingGroup;
  selectedValue: string;
  triggerLabel: string;
  valueLabel?: string;
  icon?: ReactNode;
  submenuId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
  activeItemId: string | null;
  highlightLayoutId: string;
  submenuHighlightLayoutId: string;
  setActiveItemId: (itemId: string | null) => void;
}) {
  const itemId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const isCompact = useCompactViewport();
  const prefersHover = usePrefersHover();
  const mounted = useIsMounted();
  const { submenuPosition, updateSubmenuPosition } = useSubmenuPosition({
    isCompact,
    isOpen,
    submenuRef,
    triggerRef,
  });
  const isActive = activeItemId === itemId || isOpen;
  const flyoutSubmenuMotion = getFlyoutSubmenuMotion(submenuPosition.origin);
  const wasCompactRef = useRef<boolean | null>(null);

  useEffect(() => {
    const previousCompact = wasCompactRef.current;
    wasCompactRef.current = isCompact;

    if (previousCompact === false && isCompact && isOpen) {
      onOpenChange(false);
    }
  }, [isCompact, isOpen, onOpenChange]);

  const openSubmenu = useCallback(() => {
    if (isCompact) return;
    updateSubmenuPosition();
    onOpenChange(true);
  }, [isCompact, onOpenChange, updateSubmenuPosition]);

  const toggleSubmenu = useCallback(() => {
    setActiveItemId(itemId);
    onOpenChange(!isOpen);
  }, [isOpen, itemId, onOpenChange, setActiveItemId]);

  const handleTriggerMouseLeave = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const related = event.relatedTarget as Node | null;
      if (submenuRef.current?.contains(related)) return;
      if (isInsideDropdownPanel(related)) return;
      if (isOpen) onOpenChange(false);
    },
    [isOpen, onOpenChange]
  );

  const handleOptionSelect = useCallback(
    (value: string) => {
      flushSync(() => {
        onOpenChange(false);
      });
      onSelect(value);
    },
    [onOpenChange, onSelect]
  );

  const submenuOptions = (
    <div className="space-y-0.5">
      {group.options.map((option) => (
        <DropdownOption
          activeItemId={activeItemId}
          highlightLayoutId={submenuHighlightLayoutId}
          key={option.value}
          label={option.label}
          onSelect={() => handleOptionSelect(option.value)}
          selected={selectedValue === option.value}
          setActiveItemId={setActiveItemId}
        />
      ))}
    </div>
  );

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`${dropdownSubmenuTriggerClassName} touch-manipulation text-foreground`}
        onClick={toggleSubmenu}
        onKeyDown={(event) => activateOnEnterOrSpace(event, toggleSubmenu)}
        onMouseDown={preventFocusSteal}
        onMouseEnter={
          prefersHover
            ? () => {
                setActiveItemId(itemId);
                openSubmenu();
              }
            : undefined
        }
        onMouseLeave={prefersHover ? handleTriggerMouseLeave : undefined}
        onPointerMove={prefersHover ? () => setActiveItemId(itemId) : undefined}
        ref={triggerRef}
        tabIndex={-1}
        type="button"
      >
        {isActive ? (
          <motion.span
            className={dropdownOptionHighlightClassName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            layoutId={highlightLayoutId}
            transition={FAST_TRANSITION}
          />
        ) : null}
        <span
          className="relative z-10 flex min-w-0 flex-1 items-center gap-2.5 truncate"
        >
          {icon ? (
            <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
              {icon}
            </span>
          ) : null}
          <span className="truncate">{triggerLabel}</span>
        </span>
        <span className="relative z-10 flex shrink-0 items-center gap-1.5">
          {valueLabel ? (
            <span className="max-w-[5.5rem] truncate text-muted-foreground sm:max-w-none">
              {valueLabel}
            </span>
          ) : null}
          <ChevronRight
            aria-hidden="true"
            className={`size-4 text-muted-foreground transition-transform ${isCompact && isOpen ? "rotate-90" : ""}`}
          />
        </span>
      </button>
      {isCompact ? (
        <SubmenuInlinePanel isOpen={isOpen} submenuOptions={submenuOptions} />
      ) : null}
      {!isCompact && mounted
        ? createPortal(
            <SubmenuFlyoutPanel
              flyoutSubmenuMotion={flyoutSubmenuMotion}
              groupLabel={group.label}
              isOpen={isOpen}
              itemId={itemId}
              onOpenChange={onOpenChange}
              prefersHover={prefersHover}
              setActiveItemId={setActiveItemId}
              submenuHighlightLayoutId={submenuHighlightLayoutId}
              submenuId={submenuId}
              submenuOptions={submenuOptions}
              submenuPosition={submenuPosition}
              submenuRef={submenuRef}
              triggerRef={triggerRef}
            />,
            document.body
          )
        : null}
    </>
  );
}

type DropdownSide = "top" | "bottom";

type DropdownPosition = {
  left: number;
  side: DropdownSide;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

function getDropdownPosition({
  align = "start",
  panelHeight,
  panelWidth,
  triggerRect,
}: {
  align?: "end" | "start";
  panelHeight: number;
  panelWidth: number;
  triggerRect: DOMRect;
}): DropdownPosition {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const effectiveWidth = Math.min(panelWidth, getPanelWidth(viewportWidth));

  const spaceBelow =
    viewportHeight -
    triggerRect.bottom -
    DROPDOWN_SIDE_OFFSET -
    DROPDOWN_VIEWPORT_MARGIN;
  const spaceAbove =
    triggerRect.top - DROPDOWN_SIDE_OFFSET - DROPDOWN_VIEWPORT_MARGIN;

  const openBelow =
    spaceBelow >= panelHeight
      ? true
      : spaceAbove >= panelHeight
        ? false
        : spaceBelow >= spaceAbove;

  const desiredLeft =
    align === "end" ? triggerRect.right - effectiveWidth : triggerRect.left;

  const left = clamp(
    desiredLeft,
    DROPDOWN_VIEWPORT_MARGIN,
    viewportWidth - effectiveWidth - DROPDOWN_VIEWPORT_MARGIN
  );

  const maxHeight = Math.max(
    DROPDOWN_MIN_PANEL_HEIGHT,
    openBelow ? spaceBelow : spaceAbove
  );

  if (openBelow) {
    return {
      left,
      maxHeight,
      side: "bottom",
      top: triggerRect.bottom + DROPDOWN_SIDE_OFFSET,
    };
  }

  return {
    left,
    maxHeight,
    side: "top",
    bottom: viewportHeight - triggerRect.top + DROPDOWN_SIDE_OFFSET,
  };
}

function SettingsDropdown({
  groups,
  values,
  menuActions = [],
  onOpenChange,
  onValueChange,
}: {
  groups: PromptSettingGroup[];
  values: Record<string, string>;
  menuActions?: PromptMenuAction[];
  onOpenChange: (open: boolean) => void;
  onValueChange: (groupId: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const highlightLayoutId = useId();
  const [position, setPosition] = useState<DropdownPosition>({
    left: 0,
    maxHeight: DROPDOWN_ESTIMATED_HEIGHT,
    side: "bottom",
    top: 0,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuLayoutRef = useRef<HTMLDivElement>(null);
  const prefersHover = usePrefersHover();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isCompact = useCompactViewport();
  const mounted = useIsMounted();
  const [instantDismiss, setInstantDismiss] = useState(false);
  const settingsPanelMotion = getPanelMotion({
    instantDismiss,
    offsetY: position.side === "bottom" ? -8 : 8,
    openingEase: SETTINGS_PANEL_SPRING,
    reduceMotion: prefersReducedMotion,
  });

  const handleActiveItemChange = useCallback((itemId: string | null) => {
    setActiveItemId(itemId);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      onOpenChange(nextOpen);

      if (!nextOpen) {
        setActiveItemId(null);
        setOpenSubmenuId(null);
      }
    },
    [onOpenChange]
  );

  const dismissDropdown = useCallback(
    (instant = false) => {
      if (instant) {
        setInstantDismiss(true);
      }
      handleOpenChange(false);
    },
    [handleOpenChange]
  );

  useEffect(() => {
    if (open) {
      setInstantDismiss(false);
    }
  }, [open]);

  const handleSubmenuSelect = useCallback(
    (groupId: string, value: string) => {
      onValueChange(groupId, value);
      setOpenSubmenuId(null);

      if (!isCompact) {
        dismissDropdown(true);
      }
    },
    [dismissDropdown, isCompact, onValueChange]
  );

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const panel = panelRef.current;
    const panelHeight = panel?.offsetHeight ?? DROPDOWN_ESTIMATED_HEIGHT;
    const panelWidth = panel?.offsetWidth ?? DROPDOWN_PANEL_WIDTH;

    setPosition(
      getDropdownPosition({
        panelHeight,
        panelWidth,
        triggerRect,
      })
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();

    const panel = panelRef.current;
    let observer: ResizeObserver | undefined;

    if (panel) {
      observer = new ResizeObserver(() => {
        updatePosition();
      });
      observer.observe(panel);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const handleEscape = useCallback(() => {
    if (openSubmenuId) {
      setOpenSubmenuId(null);
      return true;
    }

    return false;
  }, [openSubmenuId]);

  useDropdownDismiss({
    onClose: () => handleOpenChange(false),
    onEscape: handleEscape,
    open,
    triggerRef,
  });

  const toggleOpen = useCallback(() => {
    if (open) {
      handleOpenChange(false);
      return;
    }

    updatePosition();
    handleOpenChange(true);
  }, [handleOpenChange, open, updatePosition]);

  const selectedLabels = groups.map((group) =>
    getOptionLabel(group, values[group.id] ?? "")
  );
  const triggerLabel = selectedLabels.join(", ");
  const effortGroupId = getEffortGroupId(groups);
  const effortLevel = normalizeEffortLevel(
    effortGroupId ? (values[effortGroupId] ?? "medium") : "medium"
  );

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Select settings: ${triggerLabel}`}
        className="flex min-h-10 min-w-0 max-w-[calc(100%-3rem)] cursor-pointer items-center gap-1 rounded-full py-1 pl-0 pr-0.5 text-sm leading-none transition-colors hover:text-foreground"
        onClick={toggleOpen}
        onMouseDown={(event) => event.preventDefault()}
        ref={triggerRef}
        type="button"
      >
        <span className="shrink-0 text-muted-foreground">
          {effortGroupId ? <EffortBarsIcon level={effortLevel} /> : null}
        </span>
        {groups.map((group, index) => {
          const label = getOptionLabel(group, values[group.id] ?? "");

          return (
            <span
              className={`truncate font-medium leading-none ${index === 0 ? "text-foreground" : "text-muted-foreground"}`}
              key={group.id}
            >
              {label}
            </span>
          );
        })}
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out ${open ? "rotate-180 text-foreground" : ""}`}
        />
      </button>
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  animate={settingsPanelMotion.animate}
                  aria-label="Prompt settings"
                  className={settingsDropdownPanelClassName}
                  data-prompt-dropdown-panel=""
                  exit={settingsPanelMotion.exit}
                  initial={settingsPanelMotion.initial}
                  key="prompt-settings-dropdown"
                  ref={panelRef}
                  role="menu"
                  style={{
                    left: position.left,
                    maxHeight: position.maxHeight,
                    transformOrigin:
                      position.side === "bottom" ? "top left" : "bottom left",
                    ...(position.side === "bottom"
                      ? { top: position.top }
                      : { bottom: position.bottom }),
                  }}
                  transition={settingsPanelMotion.transition}
                >
                  <LayoutGroup id={highlightLayoutId}>
                    <div
                      className="space-y-0"
                      onMouseLeave={
                        prefersHover
                          ? (event) => {
                              const related = event.relatedTarget as Node | null;
                              if (
                                related instanceof Element &&
                                related.closest("[data-prompt-dropdown-panel]")
                              ) {
                                return;
                              }

                              setActiveItemId(null);
                              setOpenSubmenuId(null);
                            }
                          : undefined
                      }
                      ref={menuLayoutRef}
                    >
                      {menuActions.map((action, index) => (
                        <DropdownActionItem
                          activeItemId={activeItemId}
                          highlightLayoutId={`${highlightLayoutId}-action-${index}`}
                          icon={action.icon}
                          key={`${action.label}-${index}`}
                          label={action.label}
                          onSelect={() => {
                            action.onSelect();
                            handleOpenChange(false);
                          }}
                          setActiveItemId={handleActiveItemChange}
                        />
                      ))}
                      {menuActions.length > 0 && groups.length > 0 ? (
                        <DropdownMenuDivider />
                      ) : null}
                      {groups
                        .filter((group) => group.display === "featured")
                        .map((group) => (
                          <Fragment key={group.id}>
                            {group.options.map((option, optionIndex) => (
                              <DropdownOption
                                activeItemId={activeItemId}
                                compact
                                highlightLayoutId={`${highlightLayoutId}-${group.id}`}
                                icon={option.icon}
                                key={option.value}
                                label={option.label}
                                onSelect={() => {
                                  onValueChange(group.id, option.value);
                                  handleOpenChange(false);
                                }}
                                reduceMotion={prefersReducedMotion}
                                reveal={open}
                                selected={values[group.id] === option.value}
                                setActiveItemId={handleActiveItemChange}
                                staggerIndex={optionIndex}
                              />
                            ))}
                          </Fragment>
                        ))}
                      {groups
                        .filter((group) => group.display === "submenu")
                        .map((group) => (
                          <Fragment key={group.id}>
                            <DropdownMenuDivider />
                            <DropdownSubmenu
                              activeItemId={activeItemId}
                              group={group}
                              highlightLayoutId={highlightLayoutId}
                              isOpen={openSubmenuId === group.id}
                              onOpenChange={(nextOpen) => {
                                setOpenSubmenuId(nextOpen ? group.id : null);
                              }}
                              onSelect={(value) => {
                                handleSubmenuSelect(group.id, value);
                              }}
                              selectedValue={values[group.id] ?? ""}
                              setActiveItemId={handleActiveItemChange}
                              submenuHighlightLayoutId={`${highlightLayoutId}-${group.id}-sub`}
                              submenuId={group.id}
                              triggerLabel={group.label}
                              valueLabel={getOptionLabel(
                                group,
                                values[group.id] ?? ""
                              )}
                            />
                          </Fragment>
                        ))}
                    </div>
                  </LayoutGroup>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}

function PlusMenuDropdown({
  items,
  onOpenChange,
}: {
  items: PromptPlusMenuItem[];
  onOpenChange: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const highlightLayoutId = useId();
  const prefersHover = usePrefersHover();
  const [position, setPosition] = useState<DropdownPosition>({
    left: 0,
    maxHeight: DROPDOWN_ESTIMATED_HEIGHT,
    side: "top",
    top: 0,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuLayoutRef = useRef<HTMLDivElement>(null);
  const isCompact = useCompactViewport();
  const mounted = useIsMounted();
  const [instantDismiss, setInstantDismiss] = useState(false);
  const plusPanelMotion = getPanelMotion({
    instantDismiss,
    offsetY: position.side === "bottom" ? -10 : 10,
  });

  const handleActiveItemChange = useCallback((itemId: string | null) => {
    setActiveItemId(itemId);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      onOpenChange(nextOpen);

      if (!nextOpen) {
        setActiveItemId(null);
        setOpenSubmenuId(null);
      }
    },
    [onOpenChange]
  );

  const dismissDropdown = useCallback(
    (instant = false) => {
      if (instant) {
        setInstantDismiss(true);
      }
      handleOpenChange(false);
    },
    [handleOpenChange]
  );

  useEffect(() => {
    if (open) {
      setInstantDismiss(false);
    }
  }, [open]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const panel = panelRef.current;
    const panelHeight = panel?.offsetHeight ?? DROPDOWN_ESTIMATED_HEIGHT;
    const panelWidth = panel?.offsetWidth ?? DROPDOWN_PANEL_WIDTH;

    setPosition(
      getDropdownPosition({
        align: "end",
        panelHeight,
        panelWidth,
        triggerRect,
      })
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();

    const panel = panelRef.current;
    let observer: ResizeObserver | undefined;

    if (panel) {
      observer = new ResizeObserver(updatePosition);
      observer.observe(panel);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const handleEscape = useCallback(() => {
    if (openSubmenuId) {
      setOpenSubmenuId(null);
      return true;
    }

    return false;
  }, [openSubmenuId]);

  useDropdownDismiss({
    onClose: () => handleOpenChange(false),
    onEscape: handleEscape,
    open,
    triggerRef,
  });

  const toggleOpen = useCallback(() => {
    if (open) {
      handleOpenChange(false);
      return;
    }

    updatePosition();
    handleOpenChange(true);
  }, [handleOpenChange, open, updatePosition]);

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Add attachment"
        className={`flex size-8 items-center justify-center rounded-full transition-colors ${open ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        onClick={toggleOpen}
        onMouseDown={(event) => event.preventDefault()}
        ref={triggerRef}
        type="button"
      >
        <PlusIcon />
      </button>
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  animate={plusPanelMotion.animate}
                  aria-label="Add options"
                  className={dropdownPanelClassName}
                  data-prompt-dropdown-panel=""
                  exit={plusPanelMotion.exit}
                  initial={plusPanelMotion.initial}
                  key="prompt-plus-dropdown"
                  ref={panelRef}
                  role="menu"
                  style={{
                    left: position.left,
                    maxHeight: position.maxHeight,
                    transformOrigin:
                      position.side === "bottom" ? "top right" : "bottom right",
                    ...(position.side === "bottom"
                      ? { top: position.top }
                      : { bottom: position.bottom }),
                  }}
                  transition={plusPanelMotion.transition}
                >
                  <LayoutGroup id={highlightLayoutId}>
                    <div
                      className="space-y-0.5"
                      onMouseLeave={
                        prefersHover
                          ? (event) => {
                              const related = event.relatedTarget as Node | null;
                              if (
                                related instanceof Element &&
                                related.closest("[data-prompt-dropdown-panel]")
                              ) {
                                return;
                              }

                              setActiveItemId(null);
                              setOpenSubmenuId(null);
                            }
                          : undefined
                      }
                      ref={menuLayoutRef}
                    >
                      {items.map((item) => {
                        if (item.options?.length) {
                          const group: PromptSettingGroup = {
                            id: item.id,
                            label: item.label,
                            display: "submenu",
                            options: item.options.map((option) => ({
                              value: option.value,
                              label: option.label,
                            })),
                          };

                          return (
                            <DropdownSubmenu
                              activeItemId={activeItemId}
                              group={group}
                              highlightLayoutId={highlightLayoutId}
                              icon={item.icon}
                              isOpen={openSubmenuId === item.id}
                              key={item.id}
                              onOpenChange={(nextOpen) => {
                                setOpenSubmenuId(nextOpen ? item.id : null);
                              }}
                              onSelect={(value) => {
                                item.onOptionSelect?.(value);
                                setOpenSubmenuId(null);

                                if (!isCompact) {
                                  dismissDropdown(true);
                                }
                              }}
                              selectedValue=""
                              setActiveItemId={handleActiveItemChange}
                              submenuHighlightLayoutId={`${highlightLayoutId}-${item.id}-sub`}
                              submenuId={item.id}
                              triggerLabel={item.label}
                            />
                          );
                        }

                        return (
                          <DropdownActionItem
                            activeItemId={activeItemId}
                            highlightLayoutId={`${highlightLayoutId}-plus-${item.id}`}
                            icon={item.icon}
                            key={item.id}
                            label={item.label}
                            onSelect={() => {
                              item.onSelect?.();
                              handleOpenChange(false);
                            }}
                            setActiveItemId={handleActiveItemChange}
                            shortcut={item.shortcut}
                          />
                        );
                      })}
                    </div>
                  </LayoutGroup>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      viewBox="0 0 14 14"
      width="14"
    >
      <path
        d="M7 2.5V11.5M2.5 7H11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export type PromptInputProps = {
  onSubmit?: (value: string) => void;
  placeholder?: string;
  menuActions?: PromptMenuAction[];
  plusMenuItems?: PromptPlusMenuItem[];
  settingGroups?: PromptSettingGroup[];
  settings?: Record<string, string>;
  defaultSettings?: Record<string, string>;
  onSettingsChange?: (settings: Record<string, string>) => void;
};

export function PromptInput({
  onSubmit,
  placeholder,
  menuActions = [],
  plusMenuItems = [],
  settingGroups = [],
  settings: settingsProp,
  defaultSettings,
  onSettingsChange,
}: PromptInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const valueRef = useRef(value);
  valueRef.current = value;
  const [internalSettings, setInternalSettings] = useState(() =>
    getDefaultSettings(settingGroups, defaultSettings)
  );
  const isSettingsControlled = settingsProp !== undefined;
  const settings = isSettingsControlled ? settingsProp : internalSettings;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const settingsOpenRef = useRef(settingsOpen);
  const plusOpenRef = useRef(plusOpen);
  settingsOpenRef.current = settingsOpen;
  plusOpenRef.current = plusOpen;
  const [expandedHeight, setExpandedHeight] = useState(MIN_EXPANDED_HEIGHT);
  const [collapsedHover, setCollapsedHover] = useState(false);
  const [collapsedHoverReady, setCollapsedHoverReady] = useState(!expanded);
  const hasValue = value.trim() !== "";
  const inputRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const showSettings = settingGroups.length > 0 || menuActions.length > 0;
  const prefersHover = usePrefersHover();
  const prefersReducedMotion = usePrefersReducedMotion();
  const shellTransition = prefersReducedMotion
    ? { duration: 0.2, ease: EASE_OUT_QUAD }
    : SHELL_SPRING;
  const selectedModelIcon = useMemo(
    () => getSelectedSettingIcon(settingGroups, settings),
    [settingGroups, settings]
  );

  useEffect(() => {
    if (expanded) {
      setCollapsedHover(false);
      setCollapsedHoverReady(false);
      return;
    }

    setCollapsedHover(false);
    const timeout = window.setTimeout(() => {
      setCollapsedHoverReady(true);
    }, SHELL_COLLAPSE_SETTLE_MS);

    return () => window.clearTimeout(timeout);
  }, [expanded]);

  const updateSettings = useCallback(
    (groupId: string, nextValue: string) => {
      const nextSettings = { ...settings, [groupId]: nextValue };

      if (!isSettingsControlled) {
        setInternalSettings(nextSettings);
      }

      onSettingsChange?.(nextSettings);
    },
    [isSettingsControlled, onSettingsChange, settings]
  );

  useEffect(() => {
    if (isSettingsControlled) return;

    setInternalSettings((previous) => {
      const defaults = getDefaultSettings(settingGroups, defaultSettings);
      const next = { ...defaults };

      for (const group of settingGroups) {
        const previousValue = previous[group.id];
        const isValid = group.options.some(
          (option) => option.value === previousValue
        );

        if (isValid && previousValue) {
          next[group.id] = previousValue;
        }
      }

      return next;
    });
  }, [defaultSettings, isSettingsControlled, settingGroups]);

  const syncExpandedHeight = useCallback(() => {
    const element = inputRef.current;
    if (!(element instanceof HTMLTextAreaElement)) return;

    const panelHeight = element.getBoundingClientRect().height;
    const nextHeight = Math.min(
      MAX_EXPANDED_HEIGHT,
      Math.max(MIN_EXPANDED_HEIGHT, Math.ceil(panelHeight) + FOOTER_HEIGHT)
    );

    setExpandedHeight(nextHeight);
  }, []);

  useLayoutEffect(() => {
    if (!expanded) {
      setExpandedHeight(MIN_EXPANDED_HEIGHT);
      return;
    }

    const element = inputRef.current;
    if (!(element instanceof HTMLTextAreaElement)) return;

    const observer = new ResizeObserver(() => {
      syncExpandedHeight();
    });

    observer.observe(element);
    syncExpandedHeight();

    return () => {
      observer.disconnect();
    };
  }, [expanded, syncExpandedHeight]);

  const handleValueChange = useCallback((nextValue: string) => {
    setValue(nextValue);
  }, []);

  const expand = () => {
    setExpanded(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const maybeCollapse = useCallback(() => {
    requestAnimationFrame(() => {
      if (settingsOpenRef.current || plusOpenRef.current) return;
      if (valueRef.current.trim() !== "") return;

      const active = document.activeElement;
      if (active instanceof Element) {
        if (isInsideDropdownPanel(active)) return;
        if (containerRef.current?.contains(active)) return;
      }

      setExpanded(false);
    });
  }, []);

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const related = event.relatedTarget as Node | null;

      if (related instanceof Element) {
        if (isInsideDropdownPanel(related)) return;
        if (containerRef.current?.contains(related)) return;
      }

      maybeCollapse();
    },
    [maybeCollapse]
  );

  const handleSubmit = useCallback(() => {
    if (settingsOpenRef.current || plusOpenRef.current) return;
    if (value.trim() === "") return;

    onSubmit?.(value);
    setValue("");
    setExpanded(false);
  }, [onSubmit, value]);

  const handleTextareaKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
        return;
      }

      if (event.key === "Escape") {
        if (settingsOpenRef.current || plusOpenRef.current) return;
        if (value.trim() === "") {
          setExpanded(false);
        }
      }
    },
    [handleSubmit, value]
  );

  useEffect(() => {
    if (!expanded) {
      setSettingsOpen(false);
      setPlusOpen(false);
    }
  }, [expanded]);

  return (
    <motion.div
      animate={{ maxWidth: expanded ? 440 : 320 }}
      className="relative mx-auto w-full"
      initial={false}
      transition={shellTransition}
    >
      <motion.div
        animate={{ height: expanded ? expandedHeight : COLLAPSED_HEIGHT }}
        className="relative overflow-hidden rounded-[24px] border-[0.5px] border-border bg-background p-0.5"
        data-prompt-input-root=""
        initial={false}
        onBlur={handleBlur}
        ref={containerRef}
        transition={shellTransition}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-accent">
        {expanded ? (
          <InputPrimitive
            aria-label="Prompt"
            className="relative w-full"
            key="textarea"
            onValueChange={handleValueChange}
            placeholder={placeholder}
            ref={inputRef}
            render={(props) => (
              <textarea
                {...props}
                className={`${props.className ?? ""} ${promptFieldClassName} block w-full resize-none pt-4 pr-5 pl-5 outline-none overflow-y-auto overscroll-contain`}
                onKeyDown={(event) => {
                  props.onKeyDown?.(event);
                  handleTextareaKeyDown(event);
                }}
                rows={1}
                style={{ maxHeight: MAX_TEXTAREA_HEIGHT }}
              />
            )}
            value={value}
          />
        ) : (
        <div
          className="group/collapsed absolute inset-x-0 top-0 flex items-center overflow-hidden px-5"
          key="placeholder"
          onMouseEnter={
            prefersHover ? () => setCollapsedHover(true) : undefined
          }
          onMouseLeave={
            prefersHover ? () => setCollapsedHover(false) : undefined
          }
          style={{ height: COLLAPSED_HEIGHT }}
        >
            <InputPrimitive
              aria-label="Open prompt input"
              className={`${promptFieldCollapsedClassName} ${promptFieldCollapsedRowClassName} ${selectedModelIcon && collapsedHoverReady ? "pr-7" : ""}`}
              onMouseDown={(event) => {
                event.preventDefault();
                expand();
              }}
              placeholder={placeholder}
              readOnly
            />
            {selectedModelIcon && collapsedHoverReady ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-5 flex size-4 -translate-y-1/2 items-center justify-center opacity-80"
              >
                <CollapsedSelectedModelIcon
                  icon={selectedModelIcon}
                  reduceMotion={prefersReducedMotion}
                  visible={prefersHover && collapsedHover}
                />
              </div>
            ) : null}
        </div>
      )}

      <AnimatePresence>
        {expanded ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-x-0 bottom-0 flex items-center pl-5 pr-2"
            exit={{ opacity: 0, transition: { duration: 0.16, ease: EASE_OUT_QUAD } }}
            initial={{ opacity: 0 }}
            key="footer"
            style={{ height: FOOTER_HEIGHT }}
            transition={{ duration: 0.2, delay: 0.08, ease: EASE_OUT_QUAD }}
          >
            {showSettings ? (
              <SettingsDropdown
                groups={settingGroups}
                menuActions={menuActions}
                onOpenChange={(nextOpen) => {
                  setSettingsOpen(nextOpen);
                  if (nextOpen) {
                    setPlusOpen(false);
                    return;
                  }
                  maybeCollapse();
                }}
                onValueChange={updateSettings}
                values={settings}
              />
            ) : null}
            <div className="ml-auto flex items-center gap-0.5">
              {plusMenuItems.length > 0 ? (
                <PlusMenuDropdown
                  items={plusMenuItems}
                  onOpenChange={(nextOpen) => {
                    setPlusOpen(nextOpen);
                    if (nextOpen) {
                      setSettingsOpen(false);
                      return;
                    }
                    maybeCollapse();
                  }}
                />
              ) : null}
              <motion.button
                animate={{ opacity: 1, scale: 1 }}
                aria-label={hasValue ? "Send prompt" : "Use voice input"}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-foreground text-background shadow-xs transition-opacity hover:opacity-90"
                exit={{ opacity: 0, scale: 0.85 }}
                initial={{ opacity: 0, scale: 0.85 }}
                onClick={handleSubmit}
                transition={{ duration: 0.15, ease: EASE_OUT_QUAD }}
                type="button"
              >
                <AnimatePresence initial={false} mode="wait">
                  {hasValue ? (
                    <motion.span
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center"
                      exit={{ opacity: 0, scale: 0.5 }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      key="arrow"
                      transition={{ duration: 0.15, ease: EASE_OUT_QUAD }}
                    >
                      <ArrowUp className="size-4" strokeWidth={2.25} />
                    </motion.span>
                  ) : (
                    <motion.span
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center"
                      exit={{ opacity: 0, scale: 0.5 }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      key="mic"
                      transition={{ duration: 0.15, ease: EASE_OUT_QUAD }}
                    >
                      <Mic className="size-4" strokeWidth={2.25} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

const MODEL_PLACEHOLDERS: Record<string, string> = {
  "fable-5": "Send to Claude",
  "composer-2.5": "Send to Cursor",
  "gpt-5.5": "Send to Codex",
};

const defaultSettingGroups: PromptSettingGroup[] = [
  {
    id: "model",
    label: "Model",
    display: "featured",
    options: [
      {
        value: "fable-5",
        label: "Fable 5",
        icon: <ClaudeAI className="size-4 shrink-0" />,
      },
      {
        value: "composer-2.5",
        label: "Composer 2.5",
        icon: <Cursor className="size-4 shrink-0" />,
      },
      {
        value: "gpt-5.5",
        label: "GPT 5.5",
        icon: <OpenAI className="size-4 shrink-0" />,
      },
    ],
  },
];

const defaultPromptSettings = { model: "fable-5" };

export default function PromptBox() {
  const [settings, setSettings] =
    useState<Record<string, string>>(defaultPromptSettings);
  const placeholder =
    MODEL_PLACEHOLDERS[settings.model ?? ""] ?? "Ask Anything";

  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      <PromptInput
        defaultSettings={defaultPromptSettings}
        onSettingsChange={setSettings}
        placeholder={placeholder}
        settingGroups={defaultSettingGroups}
      />
    </div>
  );
}
