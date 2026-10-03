import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ============================================================================
// Tick Audio Synthesizer (Web Audio API)
// ============================================================================

class TickPlayer {
  private ctx: AudioContext | null = null;

  prepare() {
    if (typeof window === "undefined") return;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext unavailable
    }
  }

  play(intensity = 0.5) {
    if (typeof window === "undefined") return;
    try {
      this.prepare();
      if (!this.ctx || this.ctx.state !== "running") return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const baseFreq = 800 + intensity * 400;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.015);

      const volume = Math.min(0.2, 0.03 + intensity * 0.12);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.016);
    } catch {
      // Audio error ignored
    }
  }
}

let tickPlayerInstance: TickPlayer | null = null;
export function getTickPlayer(): TickPlayer {
  if (!tickPlayerInstance) {
    tickPlayerInstance = new TickPlayer();
  }
  return tickPlayerInstance;
}

// ============================================================================
// Types
// ============================================================================

export interface WheelDatePickerValue {
  month: string;
  day: string;
  year: string;
}

export interface WheelDatePickerProps {
  value?: WheelDatePickerValue;
  defaultValue?: WheelDatePickerValue;
  onChange?: (value: WheelDatePickerValue) => void;
  /** Enable directional motion blur during fast glides */
  motionBlur?: boolean;
  /** Speed multiplier for slow-motion inspection (1 = normal, 0.2 = 5x slower) */
  speedMultiplier?: number;
  /** Synthesized mechanical click on every detent */
  sound?: boolean;
  /** Short vibration pulse on every detent (supported mobile browsers) */
  haptics?: boolean;
  className?: string;
  disabled?: boolean;
}

export type WheelPickerOption = string | { label: string; value: string };

// ============================================================================
// Constants & Date Helpers
// ============================================================================

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const YEARS = Array.from({ length: 40 }, (_, i) => String(2015 + i));

function getOptionValue(opt: WheelPickerOption): string {
  return typeof opt === "string" ? opt : opt.value;
}

function getOptionLabel(opt: WheelPickerOption): string {
  return typeof opt === "string" ? opt : opt.label;
}

function getDaysInMonth(monthName: string, yearStr: string): number {
  const monthIdx = MONTHS.indexOf(monthName);
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  if (monthIdx === -1) return 31;
  return new Date(year, monthIdx + 1, 0).getDate();
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

// ============================================================================
// Motion model: "Flywheel + Magnetic Detents"
//
//   drag   → finger position is mapped through a detent curve, so the list
//            feels notched: it sticks briefly at each row, then slips to the next.
//   glide  → on release the column coasts like a flywheel (exponential friction).
//   snap   → once slow enough, a slightly under-damped magnet catches the
//            nearest row with a tiny settle wobble.
//
// Visuals are flat (no 3D drum): rows sit on a fisheye lens that compresses
// toward the edges, bend along a gentle arc, and spread apart with speed.
// The selection lens squashes on each detent and stretches with velocity.
// ============================================================================

const GLIDE_TAU = 0.325; // s — flywheel friction time constant
const SNAP_VELOCITY = 5; // rows/s — below this the magnet takes over
const SPRING_K = 230; // magnet stiffness
const SPRING_C = 22; // magnet damping (ζ ≈ 0.73 → one soft wobble)
const DETENT = 0.38; // 0 = smooth drag, 1 = hard notches
const RUBBER = 0.32; // overscroll resistance
const MAX_VELOCITY = 42; // rows/s
const VELOCITY_WINDOW_MS = 90;
const WHEEL_SENSITIVITY = 0.0065;
const TAP_SLOP_PX = 5;

type Mode = "idle" | "drag" | "wheel" | "glide" | "spring";

/** Notched mapping: slope is (1 - DETENT) on a row and (1 + DETENT) between rows */
const detent = (x: number) => x - (DETENT * Math.sin(2 * Math.PI * x)) / (2 * Math.PI);

const inverseDetent = (y: number) => {
  let x = y;
  for (let i = 0; i < 4; i++) {
    x -= (detent(x) - y) / (1 - DETENT * Math.cos(2 * Math.PI * x));
  }
  return x;
};

interface WheelColumnProps {
  id: string;
  options: WheelPickerOption[];
  value?: string;
  onValueChange?: (val: string) => void;
  itemHeight: number;
  height: number;
  /** Arc direction: 1 bends rows right toward the edges, -1 bends left */
  curve: -1 | 0 | 1;
  /** Endless wheel: wraps from the last option back to the first */
  loop?: boolean;
  textAlign: "left" | "center" | "right";
  motionBlur: boolean;
  speedMultiplier: number;
  sound: boolean;
  haptics: boolean;
  reducedMotion: boolean;
  disabled: boolean;
  ariaLabel: string;
  className?: string;
}

const WheelColumn: React.FC<WheelColumnProps> = (props) => {
  const {
    id,
    options,
    value,
    itemHeight,
    height,
    textAlign,
    disabled,
    ariaLabel,
    className = "",
  } = props;

  const lastIndex = Math.max(0, options.length - 1);
  const findIndex = (val: string | undefined) => {
    const idx = options.findIndex((opt) => getOptionValue(opt) === val);
    return idx >= 0 ? idx : 0;
  };

  // Latest props for the animation loop (which outlives renders)
  const propsRef = useRef(props);
  propsRef.current = props;
  const lastIndexRef = useRef(lastIndex);
  lastIndexRef.current = lastIndex;

  // Looping helpers: positions are unbounded, indexes wrap into [0, n)
  const isLoop = () => !!propsRef.current.loop && lastIndexRef.current > 0;
  const count = () => lastIndexRef.current + 1;
  const wrap = (x: number) => ((x % count()) + count()) % count();
  /** Signed shortest distance on the ring, in [-n/2, n/2) */
  const ringDelta = (x: number) => wrap(x + count() / 2) - count() / 2;
  const toIndex = (pos: number) =>
    isLoop() ? wrap(Math.round(pos)) : clamp(Math.round(pos), 0, lastIndexRef.current);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const feBlurRef = useRef<SVGFEGaussianBlurElement>(null);
  const itemsRef = useRef<HTMLLIElement[]>([]);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const initialIndex = findIndex(value);
  const s = useRef({
    pos: initialIndex,
    vel: 0, // rows/s, physical
    visV: 0, // rows/s, smoothed for visuals
    framePos: initialIndex,
    target: initialIndex,
    mode: "idle" as Mode,
    kick: 0, // detent impulse, decays to 0
    tickIndex: initialIndex,
    userDriven: false,
    hover: -1, // row under the mouse cursor
    typed: "", // type-ahead buffer
    typedAt: 0,
    n: options.length, // option count the current position was measured against
    touch: false, // last gesture came from a finger (haptics only make sense then)
    emitted: value,
    raf: 0,
    last: 0,
    blur: -1,
    drag: null as null | {
      startY: number;
      startRaw: number;
      moved: number;
      tapIndex: number;
      samples: [number, number][]; // [clientY, time]
    },
    wheelTimer: 0 as ReturnType<typeof setTimeout> | 0,
  }).current;

  // ---------------------------------------------------------------- painting

  const half = height / 2;
  const lensRadius = half * 1.06;
  const fadeRows = half / itemHeight + 0.6;

  const setBlur = (amount: number) => {
    const rounded = propsRef.current.motionBlur ? Math.round(clamp(amount, 0, 12) * 10) / 10 : 0;
    if (rounded === s.blur) return;
    s.blur = rounded;
    feBlurRef.current?.setAttribute("stdDeviation", `0 ${rounded}`);
    if (listRef.current) listRef.current.style.filter = rounded > 0.2 ? `url(#${id})` : "none";
  };

  const paint = () => {
    const { curve, reducedMotion } = propsRef.current;
    const speed = Math.abs(s.visV);
    const stretch = reducedMotion ? 0 : Math.min(0.42, speed * 0.014);
    const spacing = itemHeight * (1 + stretch);
    const items = itemsRef.current;

    for (let i = 0; i < items.length; i++) {
      const li = items[i];
      const d = isLoop() ? ringDelta(i - s.pos) : i - s.pos;
      const ad = Math.abs(d);

      if (ad > fadeRows + 1) {
        if (li.style.visibility !== "hidden") li.style.visibility = "hidden";
        continue;
      }
      if (li.style.visibility !== "visible") li.style.visibility = "visible";

      const focus = Math.max(0, 1 - ad);
      const y = lensRadius * Math.tanh((d * spacing) / lensRadius) - itemHeight / 2;
      const x = curve * 26 * (1 - Math.cos(Math.min(ad, 6) * 0.32));
      const scale = 0.68 + 0.32 / (1 + 0.18 * d * d);
      let opacity = Math.pow(clamp(1 - ad / fadeRows, 0, 1), 1.5) * (0.6 + 0.4 * focus);
      if (i === s.hover && ad > 0.5) opacity = Math.min(0.92, opacity * 1.7 + 0.12);
      const weight = String(Math.round((440 + 260 * focus) / 10) * 10);

      li.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      li.style.opacity = opacity.toFixed(3);
      if (li.style.fontWeight !== weight) li.style.fontWeight = weight;
    }

    // Selection lens: stretches with velocity, squashes on each detent
    const lens = lensRef.current;
    if (lens) {
      const k = reducedMotion ? 0 : s.kick;
      const sy = 1 + (reducedMotion ? 0 : Math.min(0.5, speed * 0.018)) - k * 0.07;
      const sx = 1 - (reducedMotion ? 0 : Math.min(0.08, speed * 0.003)) + k * 0.04;
      lens.style.transform = `translateY(-50%) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = Math.min(1, speed * 0.045 + s.kick * 0.5).toFixed(3);
    }

    setBlur(((speed * itemHeight) / 1000) * 3.5);
  };

  // ---------------------------------------------------------------- feedback

  const setActiveDescendant = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.setAttribute("aria-activedescendant", `${id}-opt-${idx}`);
    itemsRef.current.forEach((li, i) => li.setAttribute("aria-selected", String(i === idx)));
  };

  const checkDetent = () => {
    const idx = toIndex(s.pos);
    if (idx === s.tickIndex) return;
    s.tickIndex = idx;
    s.kick = 1;
    setActiveDescendant(idx);
    if (!s.userDriven) return;
    const { sound, haptics } = propsRef.current;
    const speed = Math.abs(s.vel);
    if (sound) getTickPlayer().play(Math.min(1, speed / 20));
    const activated = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
      .userActivation?.hasBeenActive ?? true;
    if (haptics && s.touch && activated && "vibrate" in navigator) {
      try {
        navigator.vibrate(speed > 15 ? 3 : 6);
      } catch {}
    }
  };

  const emit = (idx: number) => {
    const { options: opts, onValueChange } = propsRef.current;
    const opt = opts[isLoop() ? wrap(idx) : clamp(idx, 0, opts.length - 1)];
    if (!opt) return;
    const val = getOptionValue(opt);
    if (val === s.emitted) return;
    s.emitted = val;
    onValueChange?.(val);
  };

  // ---------------------------------------------------------------- loop

  const stepRef = useRef<(now: number) => void>(() => {});
  const frame = useRef((now: number) => stepRef.current(now)).current;

  stepRef.current = (now: number) => {
    const last = lastIndexRef.current;
    const rawDt = Math.min(0.034, (now - s.last) / 1000);
    s.last = now;
    if (rawDt <= 0) {
      s.raf = requestAnimationFrame(frame);
      return;
    }
    const dt = rawDt * clamp(propsRef.current.speedMultiplier, 0.05, 4);

    if (s.mode === "drag" || s.mode === "wheel") {
      // Position is set by input handlers; estimate velocity for visuals
      const inst = (s.pos - s.framePos) / rawDt;
      s.vel += (inst - s.vel) * Math.min(1, rawDt * 18);
    } else if (s.mode === "glide") {
      s.vel *= Math.exp(-dt / GLIDE_TAU);
      s.pos += s.vel * dt;
      const outOfBounds = !isLoop() && (s.pos < 0 || s.pos > last);
      if (outOfBounds || Math.abs(s.vel) < SNAP_VELOCITY) {
        if (outOfBounds) s.vel *= 0.35;
        const rest = Math.round(s.pos + s.vel * GLIDE_TAU);
        s.target = isLoop() ? rest : clamp(rest, 0, last);
        s.mode = "spring";
      }
    } else if (s.mode === "spring") {
      const x = s.pos - s.target;
      s.vel += (-SPRING_K * x - SPRING_C * s.vel) * dt;
      s.pos += s.vel * dt;
      if (Math.abs(x) < 0.0015 && Math.abs(s.vel) < 0.03) {
        // Re-centre looping wheels so positions never drift far from [0, n)
        s.pos = s.target = isLoop() ? wrap(s.target) : s.target;
        s.vel = 0;
        s.mode = "idle";
        emit(s.target);
      }
    }

    s.framePos = s.pos;
    s.visV += (s.vel - s.visV) * Math.min(1, rawDt * 14);
    s.kick *= Math.exp(-dt * 11);

    checkDetent();
    paint();

    if (s.mode === "idle" && s.kick < 0.004 && Math.abs(s.visV) < 0.02) {
      s.kick = 0;
      s.visV = 0;
      paint();
      s.raf = 0;
      return;
    }
    s.raf = requestAnimationFrame(frame);
  };

  const ensureLoop = () => {
    if (s.raf) return;
    s.last = performance.now();
    s.framePos = s.pos;
    s.raf = requestAnimationFrame(frame);
  };

  const goTo = (idx: number, userDriven: boolean) => {
    s.userDriven = userDriven;
    if (isLoop()) {
      // Take the short way round the ring
      const base = s.mode === "spring" ? s.target : Math.round(s.pos);
      s.target = base + ringDelta(idx - base);
    } else {
      s.target = clamp(idx, 0, lastIndexRef.current);
    }
    s.mode = "spring";
    ensureLoop();
  };

  // ---------------------------------------------------------------- input

  const mapRaw = (raw: number) => {
    if (isLoop()) return detent(raw);
    const last = lastIndexRef.current;
    if (raw < 0) return raw * RUBBER;
    if (raw > last) return last + (raw - last) * RUBBER;
    return detent(raw);
  };

  const unmapPos = (pos: number) => {
    if (isLoop()) return inverseDetent(pos);
    const last = lastIndexRef.current;
    if (pos < 0) return pos / RUBBER;
    if (pos > last) return last + (pos - last) / RUBBER;
    return inverseDetent(pos);
  };

  const beginDrag = (clientY: number, target: EventTarget | null) => {
    if (s.wheelTimer) clearTimeout(s.wheelTimer);
    const li = (target as HTMLElement | null)?.closest?.("li[data-index]");
    s.drag = {
      startY: clientY,
      startRaw: unmapPos(s.pos),
      moved: 0,
      tapIndex: li ? Number(li.getAttribute("data-index")) : -1,
      samples: [[clientY, performance.now()]],
    };
    s.mode = "drag";
    s.userDriven = true;
    s.vel = 0;
    setIsGrabbing(true);
    if (propsRef.current.sound) getTickPlayer().prepare();
    ensureLoop();
  };

  const moveDrag = (clientY: number) => {
    const d = s.drag;
    if (!d) return;
    d.moved = Math.max(d.moved, Math.abs(clientY - d.startY));
    d.samples.push([clientY, performance.now()]);
    if (d.samples.length > 10) d.samples.shift();
    s.pos = mapRaw(d.startRaw + (d.startY - clientY) / itemHeight);
    ensureLoop();
  };

  const endDrag = () => {
    const d = s.drag;
    if (!d) return;
    s.drag = null;
    setIsGrabbing(false);

    if (d.moved < TAP_SLOP_PX && d.tapIndex >= 0) {
      goTo(d.tapIndex, true);
      return;
    }

    // Release velocity over a short sliding window ending *now*, so a finger
    // that pauses before lifting doesn't fling
    const pts = d.samples;
    pts.push([pts[pts.length - 1][0], performance.now()]);
    const latest = pts[pts.length - 1];
    let ref = latest;
    for (let i = pts.length - 2; i >= 0; i--) {
      if (latest[1] - pts[i][1] > VELOCITY_WINDOW_MS) break;
      ref = pts[i];
    }
    const dtSec = (latest[1] - ref[1]) / 1000;
    const release =
      dtSec > 0.008
        ? clamp((ref[0] - latest[0]) / itemHeight / dtSec, -MAX_VELOCITY, MAX_VELOCITY)
        : 0;

    s.vel = release;
    const last = lastIndexRef.current;
    const outOfBounds = !isLoop() && (s.pos < 0 || s.pos > last);
    if (outOfBounds || Math.abs(release) < SNAP_VELOCITY) {
      const rest = Math.round(s.pos + release * 0.12);
      s.target = isLoop() ? rest : clamp(rest, 0, last);
      s.mode = "spring";
    } else {
      s.mode = "glide";
    }
    ensureLoop();
  };

  const onWheel = (e: WheelEvent) => {
    if (propsRef.current.disabled) return;
    e.preventDefault();
    s.touch = false;
    const last = lastIndexRef.current;
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    s.mode = "wheel";
    s.userDriven = true;
    const next = s.pos + delta * WHEEL_SENSITIVITY;
    s.pos = isLoop() ? next : clamp(next, -0.3, last + 0.3);
    ensureLoop();
    if (s.wheelTimer) clearTimeout(s.wheelTimer);
    s.wheelTimer = setTimeout(() => {
      s.wheelTimer = 0;
      if (s.mode === "wheel") goTo(Math.round(s.pos), true);
    }, 110);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const base = s.mode === "idle" ? Math.round(s.pos) : s.target;
    const steps: Record<string, number> = {
      ArrowDown: 1,
      ArrowUp: -1,
      PageDown: 5,
      PageUp: -5,
    };
    s.touch = false;
    if (e.key in steps) goTo(base + steps[e.key], true);
    else if (e.key === "Home") goTo(0, true);
    else if (e.key === "End") goTo(lastIndexRef.current, true);
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // Type-ahead: "ma" → March, "2" then "5" → 25
      const now = performance.now();
      s.typed = (now - s.typedAt > 800 ? "" : s.typed) + e.key.toLowerCase();
      s.typedAt = now;
      const labels = propsRef.current.options.map((o) => getOptionLabel(o).toLowerCase());
      let idx = labels.findIndex((l) => l === s.typed);
      if (idx < 0) idx = labels.findIndex((l) => l.startsWith(s.typed));
      if (idx < 0) {
        // Fall back to a fresh search with just this key
        s.typed = e.key.toLowerCase();
        idx = labels.findIndex((l) => l.startsWith(s.typed));
      }
      if (idx >= 0) goTo(idx, true);
    } else return;
    e.preventDefault();
  };

  // Pointer events cover mouse, pen and touch (touch-action: none on container)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    s.touch = e.pointerType === "touch";
    s.hover = -1;
    beginDrag(e.clientY, e.target);
  };
  const setHover = (idx: number) => {
    if (idx === s.hover) return;
    s.hover = idx;
    if (!s.raf) paint();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (s.drag) {
      moveDrag(e.clientY);
      return;
    }
    if (e.pointerType !== "mouse") return;
    const li = (e.target as HTMLElement).closest?.("li[data-index]");
    setHover(li ? Number(li.getAttribute("data-index")) : -1);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    endDrag();
  };

  // ---------------------------------------------------------------- effects

  // Cache rows and repaint whenever the option list changes (e.g. 31 → 28 days)
  useLayoutEffect(() => {
    if (listRef.current) {
      itemsRef.current = Array.from(listRef.current.children) as HTMLLIElement[];
    }
    const idx = findIndex(propsRef.current.value);
    if (s.n !== options.length) {
      // List length changed (e.g. 31 → 28 days): fold the old ring position
      // back into range so the wheel doesn't jump to an unrelated row
      const fold = (x: number) => clamp(((x % s.n) + s.n) % s.n, 0, lastIndex);
      if (propsRef.current.loop && s.n > 0) {
        s.pos = fold(s.pos);
        s.target = fold(s.target);
        s.framePos = s.pos;
      }
      s.n = options.length;
    }
    s.tickIndex = toIndex(s.pos);
    setActiveDescendant(s.tickIndex);
    paint();
    if (s.mode === "idle" && (s.pos > lastIndex || toIndex(s.pos) !== idx)) goTo(idx, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, height, itemHeight]);

  // Sync externally controlled value (ignore echoes of our own emissions)
  useEffect(() => {
    if (value === s.emitted) return;
    s.emitted = value;
    if (s.mode === "drag" || s.mode === "wheel") return;
    goTo(findIndex(value), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Non-passive wheel listener + cleanup
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => onWheelRef.current(e);
    el.addEventListener("wheel", handler, { passive: false });
    return () => {
      el.removeEventListener("wheel", handler);
      if (s.raf) cancelAnimationFrame(s.raf);
      if (s.wheelTimer) clearTimeout(s.wheelTimer);
      s.raf = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onWheelRef = useRef(onWheel);
  onWheelRef.current = onWheel;

  // Repaint when visual-only props change while idle
  useEffect(() => {
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.motionBlur, props.reducedMotion, props.curve, props.loop]);

  const justify =
    textAlign === "left"
      ? "justify-start pl-5 origin-left"
      : textAlign === "right"
      ? "justify-end pr-5 origin-right"
      : "justify-center origin-center";

  const fadeMask =
    "linear-gradient(to bottom, transparent 0%, black 26%, black 74%, transparent 100%)";

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => setHover(-1)}
      onKeyDown={onKeyDown}
      className={`group relative touch-none select-none outline-none ${
        isGrabbing ? "cursor-grabbing" : "cursor-grab"
      } ${disabled ? "pointer-events-none opacity-40" : ""} ${className}`}
      style={{ height }}
    >
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id={id} x="-10%" y="-50%" width="120%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur ref={feBlurRef} stdDeviation="0 0" />
          </filter>
        </defs>
      </svg>

      {/* Selection lens */}
      <div
        ref={lensRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1 top-1/2 rounded-[16px] border border-white/[0.09] bg-gradient-to-b from-white/[0.085] to-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_30px_-10px_rgba(0,0,0,0.8)] ring-0 ring-white/60 transition-[box-shadow] group-focus-visible:ring-2 will-change-transform"
        style={{ height: itemHeight + 2, transform: "translateY(-50%)" }}
      >
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-[16px] bg-[radial-gradient(120%_90%_at_50%_50%,rgba(255,255,255,0.16),transparent_70%)]"
          style={{ opacity: 0 }}
        />
      </div>

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
      >
        <ul ref={listRef} className="absolute inset-x-0 top-1/2 m-0 h-0 list-none p-0">
          {options.map((option, i) => (
            <li
              key={getOptionValue(option)}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={false}
              data-index={i}
              className={`absolute inset-x-0 top-0 flex cursor-pointer items-center whitespace-nowrap text-[17px] tabular-nums tracking-[-0.01em] text-white will-change-transform ${justify}`}
              style={{ height: itemHeight, fontWeight: 440 }}
            >
              {getOptionLabel(option)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// Main Export: WheelDatePicker
// ============================================================================

export const WheelDatePicker: React.FC<WheelDatePickerProps> = ({
  value,
  defaultValue = { month: "December", day: "10", year: "2024" },
  onChange,
  motionBlur = false,
  speedMultiplier = 1,
  sound = false,
  haptics = true,
  className = "",
  disabled = false,
}) => {
  const baseId = useId().replace(/:/g, "_");
  const reducedMotion = usePrefersReducedMotion();
  const [internalState, setInternalState] = useState<WheelDatePickerValue>(defaultValue);
  const currentState = value ?? internalState;
  const { month, day, year } = currentState;

  // Columns can settle in the same frame; merge into the freshest state
  const latestRef = useRef(currentState);
  latestRef.current = currentState;

  const daysInMonth = useMemo(() => getDaysInMonth(month, year), [month, year]);
  const daysList = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => String(i + 1)),
    [daysInMonth]
  );

  const commit = (next: WheelDatePickerValue) => {
    const maxDay = getDaysInMonth(next.month, next.year);
    const safe = parseInt(next.day, 10) > maxDay ? { ...next, day: String(maxDay) } : next;
    latestRef.current = safe;
    if (!value) setInternalState(safe);
    onChange?.(safe);
  };

  useEffect(() => {
    if (parseInt(day, 10) > daysInMonth) commit(currentState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysInMonth, day]);

  const itemHeight = 44;
  const height = 320;
  const shared = {
    itemHeight,
    height,
    motionBlur,
    speedMultiplier,
    sound,
    haptics,
    reducedMotion,
    disabled,
  };

  return (
    <div className={`relative mx-auto w-full max-w-[340px] select-none sm:max-w-[370px] ${className}`}>
      <div className="relative flex w-full items-center justify-between gap-1.5">
        <div className="w-[150px] sm:w-[160px]">
          <WheelColumn
            {...shared}
            id={`month_${baseId}`}
            options={MONTHS}
            value={month}
            onValueChange={(m) => commit({ ...latestRef.current, month: m })}
            textAlign="left"
            curve={1}
            loop
            ariaLabel="Month"
          />
        </div>
        <div className="w-[72px] sm:w-[78px]">
          <WheelColumn
            {...shared}
            id={`day_${baseId}`}
            options={daysList}
            value={day}
            onValueChange={(d) => commit({ ...latestRef.current, day: d })}
            textAlign="center"
            curve={0}
            loop
            ariaLabel="Day"
          />
        </div>
        <div className="w-[96px] sm:w-[104px]">
          <WheelColumn
            {...shared}
            id={`year_${baseId}`}
            options={YEARS}
            value={year}
            onValueChange={(y) => commit({ ...latestRef.current, year: y })}
            textAlign="right"
            curve={-1}
            ariaLabel="Year"
          />
        </div>
      </div>
    </div>
  );
};

export default WheelDatePicker;
