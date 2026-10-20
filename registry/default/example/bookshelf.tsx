"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from "react";

/* ───────────── Paper: a sheet turned by one corner ───────────── */

// Geometry of a sheet of paper being turned by one corner.
//
// Page space: the turning page spans x ∈ [0, W] measured from the spine, y ∈ [0, H] downward.
// Its free corner C = (W, cy) (cy = 0 for the top corner, H for the bottom) is pulled to M.
//
// 1. Paper doesn't stretch. The corner stays within W of the spine corner on its own edge, and within
//    the page diagonal √(W²+H²) of the spine corner on the opposite edge.
// 2. A flat sheet folded so C lands on M creases along the perpendicular bisector of CM:
//    midpoint m = (C+M)/2, unit normal n = (M−C)/|M−C|, crease = { p : (p−m)·n = 0 }.
// 3. Points with (p−m)·n < 0 (C's side) are lifted; they lie reflected across the crease,
//    R(p) = p − 2((p−m)·n)n, showing the back of the leaf. The rest of the page stays flat.

export type Pt = { x: number; y: number };

/** Keep p within distance r of c (projects onto the circle when it would stretch the paper). */
function tether(p: Pt, c: Pt, r: number): Pt {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const d = Math.hypot(dx, dy);
  return d > r ? { x: c.x + (dx / d) * r, y: c.y + (dy / d) * r } : p;
}

/** Sutherland–Hodgman against one half-plane: keep the part of `poly` where f(p) ≥ 0. */
function cut(poly: Pt[], f: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}

export function fold(W: number, H: number, cy: number, pull: Pt) {
  const C = { x: W, y: cy };
  const M = tether(tether(pull, { x: 0, y: cy }, W), { x: 0, y: H - cy }, Math.hypot(W, H));

  const len = Math.hypot(M.x - C.x, M.y - C.y);
  const n = len < 1e-6 ? { x: -1, y: 0 } : { x: (M.x - C.x) / len, y: (M.y - C.y) / len };
  const m = { x: (M.x + C.x) / 2, y: (M.y + C.y) / 2 };
  const side = (p: Pt) => (p.x - m.x) * n.x + (p.y - m.y) * n.y;

  const page = [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: H },
    { x: 0, y: H },
  ];

  return {
    /** Where the corner actually is after the no-stretch constraint. */
    M,
    /** Unit normal of the crease, pointing away from the lifted corner. */
    n,
    /** A point on the crease. */
    m,
    /** Part of the page still lying flat. */
    flat: cut(page, side),
    /** Part of the page lifted off (in its original, unfolded position). */
    flap: cut(page, (p) => -side(p)),
    reflect: (p: Pt): Pt => {
      const s = 2 * side(p);
      return { x: p.x - s * n.x, y: p.y - s * n.y };
    },
    /** 0 = lying flat on the right, 1 = landed on the other side. */
    progress: Math.min(1, Math.max(0, (W - M.x) / (2 * W))),
  };
}

/** A CSS clip-path for a polygon in px (an empty triangle when there's nothing to show). */
export const polygon = (pts: Pt[]) =>
  pts.length < 3 ? "polygon(0 0, 0 0, 0 0)" : `polygon(${pts.map((p) => `${p.x}px ${p.y}px`).join(", ")})`;

/** A CSS gradient running along unit direction `g`, with stops placed in px from point `p0`, in a W×H box. */
export function ramp(g: Pt, p0: Pt, W: number, H: number, stops: [string, number][]) {
  const angle = (Math.atan2(g.x, -g.y) * 180) / Math.PI;
  const length = Math.abs(W * g.x) + Math.abs(H * g.y);
  const t0 = (p0.x - W / 2) * g.x + (p0.y - H / 2) * g.y + length / 2;
  return `linear-gradient(${angle}deg, ${stops.map(([c, s]) => `${c} ${t0 + s}px`).join(", ")})`;
}

/** Area of a polygon (shoelace), used by the self-check. */
export function area(poly: Pt[]) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

/* ───────────── Book: covers on a hinge, leaves that fold ───────────── */

const GAP = 96; // px between CSS columns; each column is one printed page of the essay
const WIDE = "(min-width: 768px)";

// A paper leaf follows the hand on a critically damped spring (ζ = 1): quick, no overshoot.
const LEAF_K = 170;
// Each cover is a rigid board hinged at the spine. Gravity's torque on a uniform board of width L gives
// θ'' = −(3g / 2L)·cos θ, with θ measured from lying flat on the right. For L ≈ 0.15 m that is
// ≈ 98 rad/s²: weakest upright, strongest near the desk. A hand lifts a board just past upright and lets
// go, hinge friction bleeds a little speed, and the desk stops it with a small bounce.
const GRAVITY = (3 * 9.81) / (2 * 0.15);
const HINGE_FRICTION = 1.5; // 1/s
const RESTITUTION = 0.2; // share of speed a board keeps when it hits the desk
const HAND_K = 190; // how firmly the hand steers a board toward just past upright
const SHIFT_K = 60; // the book sliding to stay centred on the desk
const damp = (k: number) => 2 * Math.sqrt(k);
// Boards are seen in perspective. A point lifted toward the reader by z scales by d / (d − z); with
// d = 3600px a ~500px board standing upright grows ≤ 1.16×: enough depth to read as a solid board.
const EYE = 3600;
const THICKNESS = 8; // px ≈ 2.5mm of board

/** Cloth with the light that falls near a spine: a dark edge and a thin highlight just inside it. */
const spineLight = (dir: "90deg" | "270deg", cloth: string) =>
  `linear-gradient(${dir}, rgb(0 0 0/.35), rgb(255 255 255/.1) 3%, rgb(0 0 0/0) 7%), ${cloth}`;

/** Physical page index for the plain back of a paper leaf. */
const BLANK = -3;

const paper = "bg-[#f3ecdd] text-[#3a342c]";
const faint = "text-[#8a8072]";

const subscribe = (onChange: () => void) => {
  const query = matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

type Side = "left" | "right";
type Board = "front" | "back";
/** A leaf in motion. `geo` is which half it starts on; indexes are physical pages. */
type Turn = {
  geo: Side;
  to: number;
  front: number;
  back: number;
  under: [number, number];
  cy: number;
  W: number;
  H: number;
  /** Narrow screens turning back: the leaf starts fully turned and comes back over. */
  reverse: boolean;
};
type Grab =
  | { kind: "cover"; board: Board; spine: number; reach: number; x: number; t: number; moved: boolean }
  | { kind: "page"; x: number; y: number; t: number; dir: "next" | "prev"; cy: number; dragging: boolean };

/** One sheet of paper: running head, the page's content, and its number. */
function Frame({
  side,
  head,
  folio,
  contentRef,
  children,
}: {
  side: Side;
  head?: string;
  folio?: number;
  contentRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${paper} flex h-full flex-col px-8 pt-7 pb-4 md:px-10 ${
        side === "left"
          ? "rounded-l-[3px] shadow-[inset_-28px_0_28px_-24px_rgb(0_0_0/.28)]"
          : "rounded-r-[3px] shadow-[inset_28px_0_28px_-24px_rgb(0_0_0/.28)]"
      }`}
    >
      <p
        className={`h-4 truncate font-mono text-[10px] tracking-[0.1em] uppercase ${faint} ${
          side === "left" ? "text-left" : "text-right"
        }`}
      >
        {head}
      </p>
      <div ref={contentRef} className="relative mt-5 min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
      <p className={`mt-3 h-4 text-center font-mono text-[10px] tabular-nums ${faint}`}>{folio}</p>
    </div>
  );
}

// A real book. It arrives closed; the front cover swings open on its spine (drag it, click it, or wait).
// Physical pages: title page, the text flowed into as many pages as it needs, then a closing page.
// Wide screens show spreads; phones show one page. Pages never scroll: they turn, following the paper
// geometry above (drag a page by its outer half, click it, or use the arrow keys). Shut the book
// by clicking outside it or pressing Esc: from the front cover mid-book, or with the back cover once
// you've reached the last spread (also: drag the last right page, or press → there).
export function Book({
  cloth,
  foil,
  title,
  author,
  series,
  blurb,
  runningHead,
  front,
  back,
  onClose,
  children,
}: {
  cloth: string;
  foil: string;
  title: string;
  /** Foil-stamped at the foot of the front cover. */
  author: string;
  /** Running head on left pages and the foot of the back cover. */
  series: string;
  /** Printed on the back cover. */
  blurb: string;
  /** Running head on right pages. */
  runningHead: string;
  front: ReactNode;
  back: ReactNode;
  /** Called once the book is shut, with the rect it occupies and which way up, so the shelf can carry it
      back from exactly where it lies. */
  onClose?: (from: DOMRect, backUp: boolean) => void;
  children: ReactNode;
}) {
  const wide = useSyncExternalStore(subscribe, () => matchMedia(WIDE).matches, () => true);
  const measure = useRef<HTMLDivElement>(null);
  const boardEl = useRef<HTMLDivElement>(null);
  const leftHalf = useRef<HTMLDivElement>(null);
  const rightHalf = useRef<HTMLDivElement>(null);
  const rightPage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, pages: 1 });
  const [at, setAt] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [open, setOpen] = useState(false);

  // Boards and their light, styled directly every frame (no React render per frame).
  const frontBoard = useRef<HTMLDivElement>(null);
  const frontOuterShade = useRef<HTMLSpanElement>(null);
  const frontInnerShade = useRef<HTMLSpanElement>(null);
  const frontEdgeShade = useRef<HTMLSpanElement>(null);
  const frontCast = useRef<HTMLSpanElement>(null);
  const backBoard = useRef<HTMLDivElement>(null);
  const backOuterShade = useRef<HTMLSpanElement>(null);
  const backInnerShade = useRef<HTMLSpanElement>(null);
  const backEdgeShade = useRef<HTMLSpanElement>(null);
  const backCast = useRef<HTMLSpanElement>(null);

  // The turning leaf's layers.
  const frontEl = useRef<HTMLDivElement>(null);
  const frontShade = useRef<HTMLSpanElement>(null);
  const castEl = useRef<HTMLSpanElement>(null);
  const backEl = useRef<HTMLDivElement>(null);
  const backShade = useRef<HTMLSpanElement>(null);

  // Physical state. Leaf: corner position and velocity in page space (px, px/s). Boards: hinge angle
  // θ ∈ [0, π] from lying on the right, and angular velocity ω. The front board starts shut (θ = 0), the
  // back board lies open (θ = 0). `shift`: where the book sits on the desk, in % of its width.
  const leaf = useRef({ M: { x: 0, y: 0 }, v: { x: 0, y: 0 } });
  const boards = useRef({ front: { θ: 0, ω: 0 }, back: { θ: 0, ω: 0 } });
  const desk = useRef({ shift: -25, v: 0 });
  const leafFrame = useRef(0);
  const boardFrame = useRef(0);
  const moveFrame = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const afterLayout = useRef<(() => void) | null>(null);
  const grab = useRef<Grab | null>(null);
  /** Runs once the moving board comes to rest (used to put the book away after it shuts). */
  const afterRest = useRef<(() => void) | null>(null);
  const cursor = useRef("");


  // Count essay pages from a hidden page with the same frame as the real ones.
  useEffect(() => {
    const el = measure.current!;
    const observer = new ResizeObserver(() => {
      const flow = el.firstElementChild as HTMLElement;
      const width = el.clientWidth;
      const pages = Math.max(1, Math.round((flow.scrollWidth + GAP) / (width + GAP)));
      setBox((b) => (b.width === width && b.pages === pages ? b : { width, pages }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Endpaper pasted inside both covers: paper dyed a pale tint of the cloth.
  const endpaper = `linear-gradient(rgb(243 236 221/.8), rgb(243 236 221/.8)), ${cloth}`;

  const total = box.pages + 2; // title page + essay pages + closing page
  const last = wide ? Math.floor(total / 2) : total - 1;
  const pos = Math.min(at, last);
  const leftOf = (s: number) => (s === 0 ? -1 : 2 * s - 1);
  const rightOf = (s: number) => 2 * s;

  /* ───────────── Boards: rigid covers hinged at the spine ───────────── */

  // Last opacity/visibility written, so a frame only touches styles that actually change.
  const shown = useRef({ front: "", back: "", left: "", right: "" });
  const setOnce = (key: keyof typeof shown.current, el: HTMLElement | null, prop: "opacity" | "visibility", v: string) => {
    if (!el || shown.current[key] === v) return;
    shown.current[key] = v;
    el.style[prop] = v;
  };

  /** Where the book sits: shut front-up it slides right to centre, shut back-up it slides left, open it's centred. */
  const deskTarget = () => {
    const { front, back } = boards.current;
    if (!wide) return 0;
    return front.θ < Math.PI / 2 ? -25 : back.θ > Math.PI / 2 ? 25 : 0;
  };

  const paintBoards = () => {
    const board = boardEl.current;
    if (!board) return; // the book has left the page (navigation or hot reload mid-motion)
    const { front, back } = boards.current;
    board.style.translate = `${wide ? desk.current.shift : 0}% 0`;

    // Lambert shading, light from the reader's side: brightness ∝ how directly a face's normal points at
    // the viewer. For a board at θ: the face up when flat on the right has normal·view = cos θ, the other
    // face −cos θ, the outer edge sin θ. A lifting board also shades the page it is leaving.
    const fc = Math.cos(front.θ);
    frontBoard.current!.style.transform = `rotateY(${-front.θ}rad)`;
    frontOuterShade.current!.style.opacity = `${0.32 * (1 - Math.max(0, fc))}`;
    frontInnerShade.current!.style.opacity = `${0.32 * (1 - Math.max(0, -fc))}`;
    frontEdgeShade.current!.style.opacity = `${0.45 * (1 - Math.sin(front.θ))}`;
    frontCast.current!.style.opacity = `${Math.max(0, fc)}`;
    frontCast.current!.style.width = `${Math.max(0, fc) * 100}%`;

    if (backBoard.current) {
      const bc = Math.cos(back.θ);
      backBoard.current.style.transform = `rotateY(${-back.θ}rad)`;
      backInnerShade.current!.style.opacity = `${0.32 * (1 - Math.max(0, bc))}`;
      backOuterShade.current!.style.opacity = `${0.32 * (1 - Math.max(0, -bc))}`;
      backEdgeShade.current!.style.opacity = `${0.45 * (1 - Math.sin(back.θ))}`;
      backCast.current!.style.opacity = `${Math.max(0, -bc)}`;
      backCast.current!.style.width = `${Math.max(0, -bc) * 100}%`;
    }

    // A board lying flat is exactly what the half beneath it draws, so they hand over only when flat;
    // while a board (and the pages on it) is lifted, the desk shows beneath it, never a second copy.
    // Opacity, not visibility: a face setting `visibility: visible` would show through a hidden parent.
    const frontFlat = front.θ > Math.PI - 1e-3;
    const backFlat = back.θ < 1e-3;
    setOnce("front", frontBoard.current, "opacity", frontFlat ? "0" : "1");
    setOnce("left", leftHalf.current, "visibility", frontFlat ? "visible" : "hidden");
    setOnce("back", backBoard.current, "opacity", backFlat ? "0" : "1");
    setOnce("right", rightHalf.current, "visibility", backFlat ? "visible" : "hidden");
  };

  /**
   * Run one board under gravity until it rests on the desk (θ = 0 or π). `hand` first lifts it past
   * upright toward "over" (θ → π) or "home" (θ → 0); without one (a released drag) it simply falls
   * from where it is, at its own speed.
   */
  const swing = (which: Board, hand: "over" | "home" | null) => {
    cancelAnimationFrame(boardFrame.current);
    const b0 = boards.current[which];
    const lift = hand === "over" ? Math.PI / 2 + 0.4 : Math.PI / 2 - 0.4;
    let holding = hand === "over" ? b0.θ < Math.PI / 2 : hand === "home" ? b0.θ > Math.PI / 2 : false;
    // Exactly upright and still is a balance point; the slightest tilt decides which way it falls.
    if (!holding && Math.abs(b0.ω) < 0.05 && Math.abs(b0.θ - Math.PI / 2) < 0.02)
      b0.ω = b0.θ >= Math.PI / 2 ? 0.1 : -0.1;
    let prev = performance.now();
    const step = (now: number) => {
      if (!boardEl.current) return; // unmounted: let the loop end
      const dt = Math.min(0.032, (now - prev) / 1000);
      prev = now;
      const b = boards.current[which];
      // Gravity is strongest near the desk, so integrate in substeps (semi-implicit Euler).
      const h = dt / 8;
      for (let i = 0; i < 8; i++) {
        let α = -GRAVITY * Math.cos(b.θ) - HINGE_FRICTION * b.ω;
        if (holding) {
          α += HAND_K * (lift - b.θ) - damp(HAND_K) * b.ω;
          if (hand === "over" ? b.θ >= Math.PI / 2 : b.θ <= Math.PI / 2) holding = false; // lets go past upright
        }
        b.ω += α * h;
        b.θ += b.ω * h;
        // The desk: the board stops dead and rebounds with a fraction of its speed.
        if (b.θ >= Math.PI) {
          b.θ = Math.PI;
          b.ω = Math.abs(b.ω) * RESTITUTION < 0.4 ? 0 : -Math.abs(b.ω) * RESTITUTION;
        } else if (b.θ <= 0) {
          b.θ = 0;
          b.ω = Math.abs(b.ω) * RESTITUTION < 0.4 ? 0 : Math.abs(b.ω) * RESTITUTION;
        }
      }
      const d = desk.current;
      const target = deskTarget();
      d.v += (-SHIFT_K * (d.shift - target) - damp(SHIFT_K) * d.v) * dt;
      d.shift += d.v * dt;
      // The board is down well before the book has finished sliding to its place on the desk, and
      // whoever is waiting on the board (the shelving flight) should not sit through that slide.
      const down = b.ω === 0 && (b.θ === 0 || b.θ === Math.PI);
      const resting = down && Math.abs(d.shift - target) < 0.05;
      if (resting) Object.assign(d, { shift: target, v: 0 });
      paintBoards();
      if (down) {
        const then = afterRest.current;
        afterRest.current = null;
        then?.();
      }
      if (resting) {
        const { front, back } = boards.current;
        setOpen(front.θ === Math.PI && back.θ === 0);
      } else boardFrame.current = requestAnimationFrame(step);
    };
    boardFrame.current = requestAnimationFrame(step);
  };

  // Arrive shut, then open by itself once the book has come up (animation frames only run while the
  // page is visible, so nobody misses it).
  useLayoutEffect(() => {
    paintBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wide]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      boards.current.front.θ = Math.PI;
      desk.current.shift = 0;
      paintBoards();
      setOpen(true);
      return;
    }
    const id = setTimeout(() => swing("front", "over"), 650);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Stop every animation loop when the book leaves the page, whichever path mounted it.
  useEffect(
    () => () => {
      cancelAnimationFrame(boardFrame.current);
      cancelAnimationFrame(leafFrame.current);
      cancelAnimationFrame(moveFrame.current);
    },
    [],
  );

  /* ───────────── Leaves: flexible paper, see lib/paper ───────────── */

  const plan = (dir: "next" | "prev", cy: number): Turn | null => {
    const to = pos + (dir === "next" ? 1 : -1);
    const rect = rightPage.current?.getBoundingClientRect();
    if (to < 0 || to > last || !rect) return null;
    const base = { to, cy: cy * rect.height, W: rect.width, H: rect.height, reverse: false };
    if (wide)
      return dir === "next"
        ? { ...base, geo: "right", front: rightOf(pos), back: leftOf(to), under: [leftOf(pos), rightOf(to)] }
        : { ...base, geo: "left", front: leftOf(pos), back: rightOf(to), under: [leftOf(to), rightOf(pos)] };
    return dir === "next"
      ? { ...base, geo: "right", front: pos, back: BLANK, under: [-2, to] }
      : { ...base, geo: "right", front: to, back: BLANK, under: [-2, pos], reverse: true };
  };

  /** Lay the leaf out for a corner pulled to `pull` (page space). Returns the constrained corner. */
  const draw = (t: Turn, pull: Pt) => {
    if (!frontEl.current || !backEl.current) return pull; // the leaf layers are gone (unmounted or turn ended)
    const { W, H } = t;
    const f = fold(W, H, t.cy, pull);
    const mirror = t.geo === "left";
    // Page space → the front page's own box, and the back of the leaf's own box.
    const frontLocal = (p: Pt) => (mirror ? { x: W - p.x, y: p.y } : p);
    const frontVec = (p: Pt) => (mirror ? { x: -p.x, y: p.y } : p);
    const backLocal = (p: Pt) => (mirror ? p : { x: W - p.x, y: p.y }); // its own inverse
    const backVec = (p: Pt) => (mirror ? p : { x: -p.x, y: p.y });
    const world = (p: Pt) => (mirror ? { x: -p.x, y: p.y } : p);

    // The back of the leaf is an affine image of its own box: flip onto page space, reflect in the crease.
    const image = (u: number, v: number) => world(f.reflect(backLocal({ x: u, y: v })));
    const o = image(0, 0);
    const ex = image(1, 0);
    const ey = image(0, 1);

    // Light: the curl darkens at the crease and catches a highlight just past it; the lifted leaf
    // throws a shadow on the page it uncovers, strongest mid-turn (sin πp) and gone when it lands.
    const lift = Math.sin(Math.PI * f.progress);
    const away = { x: -f.n.x, y: -f.n.y }; // from the crease toward the lifted corner

    frontEl.current!.style.clipPath = polygon(f.flat.map(frontLocal));
    frontShade.current!.style.background = ramp(frontVec(f.n), frontLocal(f.m), W, H, [
      [`rgb(0 0 0/${0.16 * lift})`, 0],
      ["rgb(0 0 0/0)", 36],
    ]);
    castEl.current!.style.clipPath = polygon(f.flap.map(frontLocal));
    castEl.current!.style.background = ramp(frontVec(away), frontLocal(f.m), W, H, [
      [`rgb(0 0 0/${0.1 + 0.3 * lift})`, 0],
      ["rgb(0 0 0/0)", 24 + 90 * lift],
    ]);
    backEl.current!.style.transform = `matrix(${ex.x - o.x}, ${ex.y - o.y}, ${ey.x - o.x}, ${ey.y - o.y}, ${o.x}, ${o.y})`;
    backEl.current!.style.clipPath = polygon(f.flap.map(backLocal));
    backShade.current!.style.background = ramp(backVec(away), backLocal(f.m), W, H, [
      [`rgb(0 0 0/${0.22 * lift})`, 0],
      [`rgb(255 255 255/${0.28 * lift})`, 10 + 10 * lift],
      ["rgb(255 255 255/0)", 30 + 40 * lift],
    ]);
    return f.M;
  };

  /** Let the corner fly to `target` on the spring, then land (or fall back). */
  const release = (t: Turn, target: Pt, turned: boolean) => {
    cancelAnimationFrame(leafFrame.current);
    let prev = performance.now();
    const step = (now: number) => {
      if (!backEl.current) return; // unmounted: let the loop end
      const dt = Math.min(0.032, (now - prev) / 1000);
      prev = now;
      const { M, v } = leaf.current;
      // Semi-implicit Euler on a = −k(x − target) − c·v
      v.x += (-LEAF_K * (M.x - target.x) - damp(LEAF_K) * v.x) * dt;
      v.y += (-LEAF_K * (M.y - target.y) - damp(LEAF_K) * v.y) * dt;
      leaf.current.M = draw(t, { x: M.x + v.x * dt, y: M.y + v.y * dt });
      if (Math.hypot(M.x - target.x, M.y - target.y) < 0.75 && Math.hypot(v.x, v.y) < 20) {
        if (turned) setAt(t.to);
        setTurn(null);
        return;
      }
      leafFrame.current = requestAnimationFrame(step);
    };
    leafFrame.current = requestAnimationFrame(step);
  };

  const start = (t: Turn, then: () => void) => {
    afterLayout.current = then;
    setTurn(t);
  };

  useLayoutEffect(() => {
    if (!turn) return;
    leaf.current.M = draw(turn, leaf.current.M);
    afterLayout.current?.();
    afterLayout.current = null;
  }, [turn]);

  /** Hand the shut book's place on the desk over to the shelf, which carries it back into its slot. */
  const putAway = () => {
    // A shut book is only one half of its box: the right half front-up, the left half once it has been
    // read to the end and the back cover came over onto the pages — and then it is lying blurb upward,
    // with its spine on the right, which is where the shelf has to pick it up from.
    const backUp = boards.current.back.θ > Math.PI / 2;
    const half = (backUp ? leftHalf.current : rightHalf.current) ?? boardEl.current;
    if (half) onClose?.(half.getBoundingClientRect(), backUp);
  };

  /** Click, key or outside-click intents. Pages get a flick across and slightly up; boards get a hand. */
  const flip = (dir: "next" | "prev" | "close" | "shelve") => {
    if (turn || grab.current) return;
    const { front, back } = boards.current;
    if (dir === "shelve") {
      const shut = (front.θ === 0 && front.ω === 0) || (back.θ === Math.PI && back.ω === 0);
      if (shut) return putAway();
      if (!open) return;
      // Shut it first (the physics decides when it's down), then put it away.
      afterRest.current = putAway;
      return flip("close");
    }
    if (front.θ < Math.PI / 2) return dir === "next" && swing("front", "over"); // shut front-up: only opens
    if (back.θ > Math.PI / 2) return dir === "prev" && swing("back", "home"); // shut back-up: only reopens
    if (!open) return;
    // Shut the book: with the back cover once the last spread is reached (or turning past it), otherwise
    // with the front cover, taking every page read so far with it.
    const backShut = wide && pos === last && (dir === "close" || dir === "next");
    if (backShut || dir === "close" || (dir === "prev" && pos === 0)) {
      setOpen(false);
      return swing(backShut ? "back" : "front", backShut ? "over" : "home");
    }
    const t = plan(dir, 1);
    if (!t) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setAt(t.to);
    const home = { x: t.W, y: t.cy };
    const away = { x: -t.W, y: t.cy };
    const from = t.reverse ? away : home;
    const to = t.reverse ? home : away;
    leaf.current = { M: from, v: { x: (to.x - from.x) * 2.4, y: -t.H * 0.35 } };
    start(t, () => release(t, to, true));
  };

  const flipRef = useRef(flip);
  const overBookRef = useRef<(clientX: number) => boolean>(() => true);
  useEffect(() => {
    flipRef.current = flip;
    overBookRef.current = overBook;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Arrow keys move the caret while typing an address; only turn pages otherwise.
      if (e.target instanceof Element && e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") flipRef.current("next");
      if (e.key === "ArrowLeft") flipRef.current("prev");
      if (e.key === "Escape") flipRef.current("close");
    };
    // Setting the book down: a click anywhere off the book shuts it (links and controls keep their jobs).
    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return;
      // Inside the book's box but on the empty half beside a shut book is still the desk.
      if (boardEl.current?.contains(e.target) && overBookRef.current(e.clientX)) return;
      if (e.target.closest("a, button, input, textarea, nav")) return;
      flipRef.current("shelve");
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  /* ───────────── Pointer: one grab at a time ───────────── */

  /** The spine's screen x and a page's width, from the right half (no padding on its spine side when wide). */
  const spineAt = () => {
    const half = rightHalf.current!.getBoundingClientRect();
    const spine = wide ? half.left : half.left + 10;
    return { half, spine, W: half.right - spine };
  };

  /**
   * Whether `clientX` is over the book itself rather than the empty desk inside its box. The box is always a
   * full spread wide, but a book shut front-up is only its right half and one shut back-up only its left.
   */
  const overBook = (clientX: number) => {
    const { spine, W } = spineAt();
    const x = clientX - spine;
    const reach = W + 12; // a page plus its board's edge
    if (!wide) return x >= -12 && x <= reach;
    const { front, back } = boards.current;
    if (front.θ < Math.PI / 2) return x >= 0 && x <= reach;
    if (back.θ > Math.PI / 2) return x <= 0 && x >= -reach;
    return x >= -reach && x <= reach;
  };

  /**
   * What a hand at `clientX` takes hold of. A board that isn't lying in place; otherwise the inside of the
   * front cover (first spread, outer half), the left board's outer edge (later spreads: the pages read shut
   * with it), the last right page's outer half (the back cover, at the last spread), or a page's outer half.
   */
  const hit = (clientX: number): { board: Board } | { dir: "next" | "prev" } | null => {
    if (!overBook(clientX)) return null; // the desk beside a shut book: nothing to take hold of
    const { spine, W } = spineAt();
    const x = clientX - spine;
    const { front, back } = boards.current;
    if (front.θ !== Math.PI) return { board: "front" };
    if (back.θ !== 0) return { board: "back" };
    if (pos === 0 && (wide ? x < -W / 2 : x < W * 0.3)) return { board: "front" };
    if (pos > 0 && wide && x < -(W - 24)) return { board: "front" };
    if (wide && pos === last && x > W / 2) return { board: "back" };
    if (!open) return null;
    if (x >= 0) {
      if (x > W / 2) return pos < last ? { dir: "next" } : null;
      return !wide && pos > 0 ? { dir: "prev" } : null;
    }
    return wide && -x > W / 2 && pos > 0 ? { dir: "prev" } : null;
  };

  const setCursor = (c: string) => {
    if (cursor.current === c || !boardEl.current) return;
    cursor.current = c;
    boardEl.current.style.cursor = c;
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (turn || e.button !== 0 || (e.target as Element).closest("a, button, input, label, form")) return;
    const h = hit(e.clientX);
    if (!h) return;
    afterRest.current = null;
    setCursor("grabbing");
    const { half, spine } = spineAt();

    if ("board" in h) {
      cancelAnimationFrame(boardFrame.current);
      const θ = boards.current[h.board].θ;
      // A point `reach` from the spine on a board at angle θ projects to reach·cos θ.
      const reach = Math.max(40, Math.abs(e.clientX - spine) / Math.max(0.25, Math.abs(Math.cos(θ))));
      grab.current = { kind: "cover", board: h.board, spine, reach, x: e.clientX, t: performance.now(), moved: false };
      setOpen(false);
    } else {
      const top = half.top + 10;
      grab.current = {
        kind: "page",
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
        dir: h.dir,
        cy: e.clientY - top < (half.height - 20) / 2 ? 0 : 1,
        dragging: false,
      };
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const g = grab.current;
    // Not holding anything: show an open hand wherever there is something to take hold of.
    if (!g) {
      const onControl = (e.target as Element).closest("a, button, input, label, form");
      return setCursor(!turn && !onControl && hit(e.clientX) ? "grab" : "");
    }
    pending.current = { x: e.clientX, y: e.clientY };
    if (moveFrame.current) return;
    // Coalesce pointer events: one layout per frame.
    moveFrame.current = requestAnimationFrame(() => {
      moveFrame.current = 0;
      if (!boardEl.current) return; // unmounted between the pointer event and this frame
      const p = pending.current!;
      const now = performance.now();

      if (g.kind === "cover") {
        if (!g.moved && Math.abs(p.x - g.x) < 5) return;
        g.moved = true;
        const b = boards.current[g.board];
        const θ = Math.acos(Math.min(1, Math.max(-1, (p.x - g.spine) / g.reach)));
        const dt = Math.max(0.001, (now - g.t) / 1000);
        b.ω = 0.7 * ((θ - b.θ) / dt) + 0.3 * b.ω;
        b.θ = θ;
        g.t = now;
        paintBoards();
        return;
      }

      if (!g.dragging) {
        if (Math.hypot(p.x - g.x, p.y - g.y) < 6 || (!wide && g.dir === "prev")) return;
        const t = plan(g.dir, g.cy);
        if (!t) return;
        g.dragging = true;
        g.t = now;
        leaf.current = { M: { x: t.W, y: t.cy }, v: { x: 0, y: 0 } };
        start(t, () => {});
        return;
      }
      if (!turn) return;
      const sign = turn.geo === "left" ? -1 : 1;
      const pull = { x: turn.W + sign * (p.x - g.x), y: turn.cy + (p.y - g.y) };
      const prevM = leaf.current.M;
      const M = draw(turn, pull);
      const dt = Math.max(0.001, (now - g.t) / 1000);
      // Exponentially smoothed finger velocity, for the flick on release.
      leaf.current = {
        M,
        v: {
          x: 0.7 * ((M.x - prevM.x) / dt) + 0.3 * leaf.current.v.x,
          y: 0.7 * ((M.y - prevM.y) / dt) + 0.3 * leaf.current.v.y,
        },
      };
      g.t = now;
    });
  };

  const onPointerUp = () => {
    const g = grab.current;
    grab.current = null;
    setCursor("");
    cancelAnimationFrame(moveFrame.current);
    moveFrame.current = 0;
    if (!g) return;

    if (g.kind === "cover") {
      // A click is a hand turning the board over; a drag lets go and gravity takes it from there.
      if (g.moved) return swing(g.board, null);
      return swing(g.board, boards.current[g.board].θ < Math.PI / 2 ? "over" : "home");
    }
    if (!g.dragging) return flip(g.dir);
    if (!turn) return;
    // Past the spine, or flicked toward it hard enough, the page goes over; otherwise it falls back.
    const { M, v } = leaf.current;
    const over = turn.reverse ? M.x < 0 : M.x < 0 || v.x < -900;
    release(turn, { x: over ? -turn.W : turn.W, y: turn.cy }, over);
  };

  /** Physical page `i` (0-based). -1 is the inside of the front cover and anything past the last page
      the inside of the back cover; BLANK is the plain back of a leaf. */
  const page = (i: number, side: Side) => {
    if (i === BLANK) return <Frame side={side} />;
    if (i < 0 || i >= total)
      return (
        <div
          className={`h-full ${
            side === "left"
              ? "rounded-l-[3px] shadow-[inset_-28px_0_28px_-24px_rgb(0_0_0/.35)]"
              : "rounded-r-[3px] shadow-[inset_28px_0_28px_-24px_rgb(0_0_0/.35)]"
          }`}
          style={{ background: endpaper }}
        />
      );
    if (i === 0) return <Frame side={side}>{front}</Frame>;
    if (i === total - 1) return <Frame side={side} folio={i + 1}>{back}</Frame>;
    return (
      <Frame side={side} folio={i + 1} head={side === "left" ? series : runningHead}>
        <div
          className="h-full font-serif text-base leading-7 [column-count:1] [column-fill:auto]"
          style={{ columnGap: GAP, translate: `${-(i - 1) * (box.width + GAP)}px 0` }}
        >
          {children}
        </div>
      </Frame>
    );
  };

  const under = turn?.under ?? (wide ? [leftOf(pos), rightOf(pos)] : [-2, pos]);
  const ear = "absolute bottom-2.5 size-16 cursor-pointer";
  const earFold =
    "absolute bottom-0 size-6 bg-[#e3d9c5] shadow-[0_0_4px_rgb(0_0_0/.2)] transition-[width,height] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover/ear:size-10";

  return (
    <div
      ref={boardEl}
      style={{ perspective: EYE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="bookshelf-rise relative mx-auto flex h-[min(640px,calc(100svh_-_160px))] w-full touch-pan-y select-none [will-change:translate] md:h-[calc(min(720px,100svh_-_200px)+20px)] md:w-[calc(min(720px,100svh_-_200px)*1.4+20px)] md:max-w-full md:-translate-x-1/4"
    >
      {/* Each half has its own board, so a shut book is only one half. */}
      {wide && (
        <div
          ref={leftHalf}
          className="invisible h-full min-w-0 flex-1 rounded-l-md p-2.5 pr-0"
          style={{ background: cloth }}
        >
          <div className="relative h-full">
            {page(under[0], "left")}
            {/* Shadow of the back cover coming over onto this page. */}
            <span
              ref={backCast}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 bg-[linear-gradient(270deg,rgb(0_0_0/.28),rgb(0_0_0/.12)_60%,rgb(0_0_0/0))] opacity-0"
            />
          </div>
        </div>
      )}
      <div
        ref={rightHalf}
        className={`h-full min-w-0 flex-1 p-2.5 ${wide ? "rounded-r-md pl-0" : "rounded-md"}`}
        style={{ background: cloth }}
      >
        <div ref={rightPage} className="relative h-full">
          {page(under[1], "right")}
          {/* Shadow of the lifting front cover on the page beneath it. */}
          <span
            ref={frontCast}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 bg-[linear-gradient(90deg,rgb(0_0_0/.28),rgb(0_0_0/.12)_60%,rgb(0_0_0/0))] opacity-0"
          />
        </div>
      </div>

      {/* Invisible copy of a page, used only to count how many pages the essay fills. */}
      <div
        aria-hidden
        className="pointer-events-none invisible absolute top-2.5 right-2.5 bottom-2.5 w-[calc(100%-20px)] md:w-[calc(50%-10px)]"
      >
        <Frame side="right" contentRef={measure}>
          <div className="h-full font-serif text-base leading-7 [column-count:1] [column-fill:auto]" style={{ columnGap: GAP }}>
            {children}
          </div>
        </Frame>
      </div>

      {/* The turning leaf, anchored at the spine. */}
      {turn && (
        <div aria-hidden className="pointer-events-none absolute top-2.5" style={{ left: wide ? "50%" : 10 }}>
          <div
            ref={frontEl}
            className="absolute top-0 will-change-[clip-path]"
            style={{ left: turn.geo === "left" ? -turn.W : 0, width: turn.W, height: turn.H }}
          >
            {page(turn.front, turn.geo)}
            <span ref={frontShade} className="absolute inset-0" />
          </div>
          <span
            ref={castEl}
            className="absolute top-0"
            style={{ left: turn.geo === "left" ? -turn.W : 0, width: turn.W, height: turn.H }}
          />
          <div
            ref={backEl}
            className="absolute top-0 left-0 origin-top-left will-change-transform"
            style={{ width: turn.W, height: turn.H }}
          >
            {page(turn.back, turn.geo === "left" ? "right" : "left")}
            <span ref={backShade} className="absolute inset-0" />
          </div>
        </div>
      )}

      {/* Dog-eared outer corners hint that the pages turn. */}
      {open && pos < last && (
        <button type="button" aria-label="Next page" onClick={() => flip("next")} className={`group/ear right-2.5 ${ear}`}>
          <span className={`right-0 ${earFold} [clip-path:polygon(0_100%,100%_0,100%_100%)]`} />
        </button>
      )}
      {open && pos > 0 && (
        <button type="button" aria-label="Previous page" onClick={() => flip("prev")} className={`group/ear left-2.5 ${ear}`}>
          <span className={`left-0 ${earFold} [clip-path:polygon(0_0,100%_100%,0_100%)]`} />
        </button>
      )}

      {/* Back cover (wide only): lies open under the right half; closes over onto the pages at the end. */}
      {wide && (
        <div
          ref={backBoard}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-0 [transform-style:preserve-3d] will-change-transform"
          style={{ transformOrigin: "left center" }}
        >
          {/* Inside of the back board with the page lying on it: the right half itself. */}
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <div className="absolute inset-0 rounded-r-md p-2.5 pl-0" style={{ background: cloth }}>
              {page(rightOf(pos), "right")}
            </div>
            <span ref={backInnerShade} className="absolute inset-0 rounded-r-md bg-black opacity-0" />
          </div>
          {/* Outside of the back cover, a board's thickness below the pages; face up once shut. */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-l-md px-14 text-center [backface-visibility:hidden]"
            style={{
              background: spineLight("270deg", cloth),
              color: foil,
              transform: `rotateY(180deg) translateZ(${THICKNESS}px)`,
            }}
          >
            <p className="max-w-[28ch] font-serif text-xl leading-8 text-balance">{blurb}</p>
            <span className="h-px w-16 bg-current opacity-60" />
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-80">{series}</p>
            <span ref={backOuterShade} className="absolute inset-0 rounded-l-md bg-black opacity-0" />
          </div>
          {/* Outer edge of the back board, THICKNESS deep below the pages. */}
          <div
            className="absolute top-0 left-full h-full origin-left rounded-[1px]"
            style={{
              width: THICKNESS,
              transform: "rotateY(90deg)",
              background: `linear-gradient(90deg, rgb(0 0 0/.3), rgb(0 0 0/.12)), ${cloth}`,
            }}
          >
            <span ref={backEdgeShade} className="absolute inset-0 bg-black opacity-0" />
          </div>
        </div>
      )}

      {/* Front cover: shut over the right half (θ = 0), lying open on the left (θ = π). */}
      <div
        ref={frontBoard}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-full [transform-style:preserve-3d] will-change-transform md:w-1/2"
        style={{ transformOrigin: "left center" }}
      >
        {/* Outside of the board, raised by its thickness above the pages. */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-r-md px-12 text-center [backface-visibility:hidden]"
          style={{ background: spineLight("90deg", cloth), color: foil, transform: `translateZ(${THICKNESS}px)` }}
        >
          <span className="h-px w-24 bg-current opacity-60" />
          <p className="font-serif text-4xl leading-[1.15] text-balance">{title}</p>
          <span className="h-px w-24 bg-current opacity-60" />
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-80">{author}</p>
          <span ref={frontOuterShade} className="absolute inset-0 rounded-r-md bg-black opacity-0" />
        </div>
        {/* Inside of the board with whatever lies on it: the endpaper at the first spread, later the block
            of pages already read. It is the left half itself, turned 180° so that once open (another 180°)
            it reads the right way round. */}
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }}>
          <div className="absolute inset-0 rounded-l-md p-2.5 pr-0" style={{ background: cloth }}>
            {page(wide ? leftOf(pos) : -1, "left")}
          </div>
          <span ref={frontInnerShade} className="absolute inset-0 rounded-l-md bg-black opacity-0" />
        </div>
        {/* Outer edge of the board: THICKNESS deep, standing from the pages up to the outside face. */}
        <div
          className="absolute top-0 left-full h-full origin-left rounded-[1px]"
          style={{
            width: THICKNESS,
            transform: "rotateY(-90deg)",
            background: `linear-gradient(90deg, rgb(0 0 0/.3), rgb(0 0 0/.12)), ${cloth}`,
          }}
        >
          <span ref={frontEdgeShade} className="absolute inset-0 bg-black opacity-0" />
        </div>
      </div>
    </div>
  );
}

/* ───────────── Shelf: spines in a row, pull one out to read it ───────────── */

export type ShelfBook = {
  id: string;
  title: string;
  author: string;
  /** Cover cloth and the foil its lettering is stamped in. */
  cloth: string;
  foil: string;
  /** Spine size in px. */
  height?: number;
  width?: number;
  /** Short line under the title on the spine. */
  label?: string;
  /** Printed on the back cover. */
  blurb: string;
  /** The text, flowed into as many pages as it needs. */
  content: ReactNode;
};

// Light falling on a rounded spine: dark at both edges, a soft highlight just off the left.
const spineShade =
  "linear-gradient(90deg, rgb(0 0 0/.38), rgb(255 255 255/.14) 14%, rgb(255 255 255/0) 34%, rgb(0 0 0/0) 70%, rgb(0 0 0/.32))";
const ease = "ease-[cubic-bezier(0.2,0,0,1)]";
/** Default spine size in px, when a book doesn't give its own. */
const SPINE_W = 52;
const SPINE_H = 320;
/** The page block seen from the side: stacked leaves, shaded where the boards press them. */
const foreEdge =
  "linear-gradient(90deg, rgb(0 0 0/.24), rgb(0 0 0/0) 45%, rgb(0 0 0/.14)), repeating-linear-gradient(90deg, #e3d9c2 0 1px, #f3ecdd 1px 3px)";

/**
 * How a shut book fits its slot: how far it shrinks on the way, and the thickness that makes its spine
 * exactly fill that slot once it has turned fully edge-on — so swapping it for the real spine is seamless.
 */
function fit(book: ShelfBook, from: DOMRect) {
  const shrink = (book.height ?? SPINE_H) / from.height;
  return { shrink, depth: (book.width ?? SPINE_W) / shrink };
}

/** Two thin foil bands, like the rules printed near a spine's head and tail. */
function Bands() {
  return (
    <span className="flex w-full flex-col gap-[3px] px-2 opacity-60">
      <span className="h-px bg-current" />
      <span className="h-px bg-current" />
    </span>
  );
}

const keyframes = `
.bookshelf-rise { animation: bookshelf-rise 650ms cubic-bezier(0.2, 0, 0, 1) backwards; }
.bookshelf-settle { animation: bookshelf-settle 420ms; }
@keyframes bookshelf-rise {
  from { opacity: 0; transform: perspective(1600px) translateY(90px) rotateX(18deg) scale(0.94); }
}
/* The book has just dropped into the row and rebounds off the shelf three times, each kick about a third
   of the last and rising slower than it falls, which is what makes it read as weight rather than a wobble.
   The spine's origin-bottom pivots the tilt on its foot. */
@keyframes bookshelf-settle {
  0% { transform: translateY(0) rotate(0deg); animation-timing-function: cubic-bezier(0, 0.6, 0.4, 1); }
  28% { transform: translateY(-13px) rotate(1.3deg); animation-timing-function: cubic-bezier(0.6, 0, 1, 0.4); }
  56% { transform: translateY(0) rotate(0deg); animation-timing-function: cubic-bezier(0, 0.6, 0.4, 1); }
  74% { transform: translateY(-5px) rotate(0.5deg); animation-timing-function: cubic-bezier(0.6, 0, 1, 0.4); }
  88% { transform: translateY(0) rotate(0deg); animation-timing-function: cubic-bezier(0, 0.6, 0.4, 1); }
  95% { transform: translateY(-1.5px) rotate(0.15deg); animation-timing-function: cubic-bezier(0.6, 0, 1, 0.4); }
  100% { transform: translateY(0) rotate(0deg); }
}
@media (prefers-reduced-motion: reduce) {
  .bookshelf-rise, .bookshelf-settle { animation: none; }
}`;

/** How long the shut book takes to travel from the desk back into its slot. */
const FLIGHT = 480;

/**
 * An invisible line for the book to follow home, as a CSS `offset-path`. Both control points sit level,
 * `lift` above the higher end, which makes the tangents vertical at both ends: the book leaves the desk
 * straight up and comes straight back down into the row, rather than sliding there in a dull diagonal.
 *
 * A cubic with P1y = P2y peaks at t = ½, at (y₀ + y₁ + 6·apex) / 8 — only three quarters of the way up to
 * its controls, so `lift` always buys less height than it looks like it should.
 *
 * Coordinates are the viewport's, which is what the path of a `position: fixed` element resolves against.
 */
export function homeward(from: Pt, to: Pt, lift: number) {
  const apex = Math.min(from.y, to.y) - lift;
  return `path("M ${from.x} ${from.y} C ${from.x} ${apex}, ${to.x} ${apex}, ${to.x} ${to.y}")`;
}

const caption = `font-mono text-[10px] tracking-[0.1em] uppercase ${faint}`;

/** A shelf of books. Point at a spine and it slides up; click it and the book comes off the shelf and
    opens on the desk. Shut it (Esc, or click outside) and it is carried back into its slot. */
export function Bookshelf({
  books = DEFAULT_BOOKS,
  series = "The reading room",
}: {
  books?: ShelfBook[];
  /** Running head on left pages and the foot of every back cover. */
  series?: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [reading, setReading] = useState<ShelfBook | null>(null);
  /** A book that has been shut and is in the air, with the place on the desk it left from and which of
      its boards was facing up as it got there. */
  const [flying, setFlying] = useState<{ book: ShelfBook; from: DOMRect; backUp: boolean } | null>(null);
  const [shelved, setShelved] = useState<string | null>(null);
  const slot = useRef<HTMLButtonElement | null>(null);
  const flier = useRef<HTMLDivElement>(null);
  const solid = useRef<HTMLDivElement>(null);
  const dimFront = useRef<HTMLSpanElement>(null);
  const dimBack = useRef<HTMLSpanElement>(null);
  const dimSpine = useRef<HTMLSpanElement>(null);

  // Carry the shut book home: the wrapper flies along `homeward` while the book inside it turns spine-first
  // into the row, the way a hand puts one back. Nothing fades in mid-air.
  useLayoutEffect(() => {
    if (!flying) return;
    const { from } = flying;
    const { shrink } = fit(flying.book, from);
    const to = slot.current!.getBoundingClientRect();
    const centre = (r: DOMRect) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
    // Thrown, not carried. The obvious pair here — decelerate up, accelerate down — flattens to a stop on
    // both sides of the apex and the book visibly hangs there. These leave the junction moving instead:
    // `climb` is still running at 0.36 when it hands over, and `fall` picks it up at the same speed and
    // carries it into the row. The arc already slows the eye at the top; the clock shouldn't do it twice.
    const climb = "cubic-bezier(0.15, 0.45, 0.45, 0.8)";
    const fall = "cubic-bezier(0.4, 0.15, 0.7, 0.85)";
    const timing = { duration: FLIGHT, fill: "forwards" as const };
    // At the apex it is already near spine size, so it recedes toward the shelf rather than filling the
    // window on its way over.
    const high = shrink + (1 - shrink) * 0.26;
    // Face up on the desk → spine out in the row, by the shorter way round: a book shut on its back cover
    // is already turned over, and both boards are on the box, so only the angle it starts at changes.
    const spin = flying.backUp ? 180 : 0;
    const land = 90;
    const mid = spin + (land - spin) * 0.38;
    // Lambert: a face is lit by how squarely it faces the reader. The boards look along ±z, so they go by
    // cos θ; the spine looks along −x, so it goes by sin θ — dark while it is edge-on and full by the time
    // it is square to the row, which is also what leaves it matching the spines it lands among.
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const shade = (deg: number, facing: 1 | -1) => `${0.5 * (1 - Math.max(0, facing * Math.cos(rad(deg))))}`;
    const spineShade_ = (deg: number) => `${0.5 * (1 - Math.max(0, Math.sin(rad(deg))))}`;

    // Well up and over before it drops in, so the last stretch of the path is a fall, not a slide.
    flier.current!.style.offsetPath = homeward(centre(from), centre(to), Math.max(210, Math.abs(to.x - from.x) * 0.5));
    flier.current!.animate(
      [
        { offsetDistance: "0%", easing: climb },
        { offsetDistance: "52%", easing: fall },
        { offsetDistance: "100%" },
      ],
      timing,
    );
    // Turning its spine to the reader as it goes, and square-on to the row by the time it lands: at 90°
    // only the spine shows, and `fit` sized it to fill the slot exactly.
    const run = solid.current!.animate(
      [
        { transform: `scale(1) rotateY(${spin}deg)`, easing: climb },
        { transform: `scale(${high}) rotateY(${mid}deg)`, easing: fall },
        { transform: `scale(${shrink}) rotateY(${land}deg)` },
      ],
      timing,
    );
    for (const [el, lit] of [
      [dimFront.current!, (deg: number) => shade(deg, 1)],
      [dimBack.current!, (deg: number) => shade(deg, -1)],
      [dimSpine.current!, spineShade_],
    ] as const)
      el.animate(
        [
          { opacity: lit(spin), easing: climb },
          { opacity: lit(mid), easing: fall },
          { opacity: lit(land) },
        ],
        timing,
      );
    run.onfinish = () => {
      setShelved(flying.book.id);
      setFlying(null);
    };
    return () => run.cancel();
  }, [flying]);

  if (reading)
    return (
      <div className="w-full overflow-x-clip px-4 py-10 md:overflow-x-visible">
        <style>{keyframes}</style>
        <Book
          cloth={reading.cloth}
          foil={reading.foil}
          title={reading.title}
          author={reading.author}
          series={series}
          blurb={reading.blurb}
          runningHead={reading.title}
          onClose={(from, backUp) => {
            if (matchMedia("(prefers-reduced-motion: reduce)").matches) setShelved(reading.id);
            else setFlying({ book: reading, from, backUp });
            setReading(null);
          }}
          front={
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className={caption}>{series}</p>
              <p className="font-serif text-3xl leading-tight text-balance text-[#221e19]">{reading.title}</p>
              <span className="h-px w-12 bg-[#221e19]/30" />
              <p className="font-serif italic">{reading.author}</p>
            </div>
          }
          back={
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-serif text-xl italic">The end.</p>
              <p className={caption}>Esc or click outside to shelve it</p>
            </div>
          }
        >
          {reading.content}
        </Book>
      </div>
    );

  // The flying book's thickness, which has to be in hand to lay out its faces before the effect runs.
  const depth = flying ? fit(flying.book, flying.from).depth : 0;

  return (
    <div className="w-full max-w-3xl px-4 py-10" onPointerLeave={() => setPicked(null)}>
      <style>{keyframes}</style>
      <div className="flex h-[400px] items-end justify-center gap-[3px] px-6 drop-shadow-[0_6px_6px_rgb(0_0_0/.25)]">
        {books.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Read ${b.title} by ${b.author}`}
            onPointerEnter={() => setPicked(b.id)}
            onFocus={() => setPicked(b.id)}
            onBlur={() => setPicked(null)}
            onClick={() => {
              setShelved(null);
              setReading(b);
            }}
            // The slot keeps its place in the row while the book is in the air above it.
            ref={flying?.book.id === b.id ? slot : undefined}
            style={{
              width: b.width ?? SPINE_W,
              height: b.height ?? SPINE_H,
              color: b.foil,
              background: `${spineShade}, ${b.cloth}`,
              visibility: flying?.book.id === b.id ? "hidden" : undefined,
            }}
            className={`flex shrink-0 origin-bottom cursor-pointer flex-col items-center justify-between rounded-[2px] py-3 transition-[translate,rotate] duration-500 outline-none focus-visible:ring-2 focus-visible:ring-current ${ease} ${
              b.id === picked ? "-translate-y-5" : ""
            } ${b.id === shelved ? "bookshelf-settle" : ""}`}
          >
            <Bands />
            <span className="line-clamp-2 max-h-[220px] rotate-180 text-left font-serif text-[13px] leading-[17px] [writing-mode:vertical-rl]">
              {b.title}
            </span>
            <span className="flex w-full flex-col items-center gap-2">
              {b.label && (
                <span className="rotate-180 font-mono text-[9px] tracking-[0.1em] uppercase opacity-75 [writing-mode:vertical-rl]">
                  {b.label}
                </span>
              )}
              <Bands />
            </span>
          </button>
        ))}
      </div>
      {/* Wooden shelf: top face catching light, then the front lip. */}
      <div className="h-2 rounded-t-[2px] bg-[linear-gradient(#a07b55,#8a6644)]" />
      <div className="h-3 rounded-b-[3px] bg-[linear-gradient(#6d4f33,#553d27)] shadow-[0_14px_24px_-12px_rgb(0_0_0/.5)]" />

      {/* The shut book in the air, following `homeward` into the slot above: a real board-and-paper box, so
          that turning it toward the row shows its spine and the page block rather than a flat card. Fixed,
          so the path can be written in viewport coordinates and it flies over whatever the shelf sits in. */}
      {flying && (
        <div
          ref={flier}
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-50 [will-change:offset-distance]"
          style={{
            width: flying.from.width,
            height: flying.from.height,
            perspective: EYE / 2,
            // Upright all the way: `offset-rotate: auto` would bank it to the path, which starts straight up.
            offsetRotate: "0deg",
          }}
        >
          {/* Faces of the shut book, half its thickness either side of z = 0, so it turns about its own
              middle rather than swinging out from the back board. */}
          <div ref={solid} className="relative h-full w-full [transform-style:preserve-3d] [will-change:transform]">
            {/* Back board, turned to read the right way round from behind: this is the face up when the
                book was shut on its last page, so it has to carry the blurb the reader just had in front
                of them. */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-l-md px-14 text-center"
              style={{
                transform: `translateZ(${-depth / 2}px) rotateY(180deg)`,
                background: spineLight("270deg", flying.book.cloth),
                color: flying.book.foil,
              }}
            >
              <p className="max-w-[28ch] font-serif text-xl leading-8 text-balance">{flying.book.blurb}</p>
              <span className="h-px w-16 bg-current opacity-60" />
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-80">{series}</p>
              <span ref={dimBack} className="absolute inset-0 rounded-l-md bg-black opacity-0" />
            </div>
            {/* The page block, along the fore-edge away from the hinge. */}
            <div
              className="absolute top-0 left-full h-full origin-left rounded-r-[2px]"
              style={{ width: depth, transform: `translateZ(${-depth / 2}px) rotateY(-90deg)`, background: foreEdge }}
            />
            {/* The spine, on the hinge side: the face that ends up looking out of the row, so it wears the
                same cloth and bands as the shelved spines it is joining. */}
            <div
              className="absolute top-0 left-0 flex h-full origin-left flex-col justify-between rounded-l-[2px] py-3"
              style={{
                width: depth,
                transform: `translateZ(${-depth / 2}px) rotateY(-90deg)`,
                background: `${spineShade}, ${flying.book.cloth}`,
                color: flying.book.foil,
              }}
            >
              <Bands />
              <Bands />
              <span ref={dimSpine} className="absolute inset-0 rounded-l-[2px] bg-black opacity-0" />
            </div>
            {/* Front board, a whole book's thickness above the back one. */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-r-md px-12 text-center shadow-[0_24px_40px_-16px_rgb(0_0_0/.45)]"
              style={{
                transform: `translateZ(${depth / 2}px)`,
                background: spineLight("90deg", flying.book.cloth),
                color: flying.book.foil,
              }}
            >
              <span className="h-px w-24 bg-current opacity-60" />
              <p className="font-serif text-4xl leading-[1.15] text-balance">{flying.book.title}</p>
              <span className="h-px w-24 bg-current opacity-60" />
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-80">{flying.book.author}</p>
              <span ref={dimFront} className="absolute inset-0 rounded-r-md bg-black opacity-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── Sample library ───────────── */

const P = ({ children, first }: { children: ReactNode; first?: boolean }) => (
  <p
    className={`mt-4 first:mt-0 ${
      first
        ? "first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:text-[56px] first-letter:leading-[0.8] first-letter:text-[#221e19]"
        : ""
    }`}
  >
    {children}
  </p>
);
const H = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-8 font-serif text-xl leading-7 text-[#221e19] [break-after:avoid]">{children}</h2>
);

export const DEFAULT_BOOKS: ShelfBook[] = [
  {
    id: "small-hours",
    title: "The Small Hours",
    author: "Ada Wren",
    label: "Essays",
    cloth: "#6f2d2a",
    foil: "#ead6a4",
    height: 336,
    width: 60,
    blurb: "On the work that only gets done after everyone else has gone to sleep.",
    content: (
      <>
        <P first>
          There is a particular quiet that arrives a little after midnight. The street stops arguing with itself, the
          phone goes still, and the room seems to lean in. Most of what I have ever finished, I finished in that quiet.
        </P>
        <P>
          It is not that the night is magic. It is that nobody asks anything of it. The day is a queue of small
          requests, each reasonable, each a little theft. The night has no queue. It has only the thing in front of you
          and the question of whether you will look at it long enough.
        </P>
        <H>The first hour</H>
        <P>
          The first hour is always wasted, and I have stopped minding. It is the hour in which the day drains out:
          the half-written replies, the tabs, the thing someone said at lunch. You cannot skip it. You can only make it
          shorter by not fighting it.
        </P>
        <P>
          Then, usually without warning, the work becomes the loudest thing in the room. That is the moment to
          protect. Close the door, turn the screen away from anything that glows on its own, and keep going.
        </P>
        <H>The last hour</H>
        <P>
          The last hour is for leaving a note to the morning. Not a plan, just a sentence: where you stopped and what
          you were about to try. The person who wakes up tomorrow is a stranger, and strangers need directions.
        </P>
        <P>
          Close the book. Put it back on the shelf. It will be there when you come back.
        </P>
      </>
    ),
  },
  {
    id: "field-notes",
    title: "Field Notes on Making Things",
    author: "Theo Marsh",
    label: "Craft",
    cloth: "#29463b",
    foil: "#e6d9b2",
    height: 304,
    width: 48,
    blurb: "Short notes from a workshop: on tools, patience, and knowing when to stop.",
    content: (
      <>
        <P first>
          A good tool disappears. You notice a chisel only when it is dull, a pen only when it skips. The best
          interfaces are the same: you remember the work you did with them, not the clicks.
        </P>
        <H>On patience</H>
        <P>
          Glue needs an hour. Paint needs a day. Most ruined pieces were ruined by someone checking too early. The
          hardest skill in any workshop is leaving a thing alone while it becomes what it is going to be.
        </P>
        <H>On stopping</H>
        <P>
          There is always one more pass you could make. The trick is noticing when each pass costs more than it
          gives. Finished is a decision, not a discovery.
        </P>
        <P>
          Sweep the floor. Hang the tools where you will find them. Tomorrow begins with a clean bench.
        </P>
      </>
    ),
  },
  {
    id: "linen",
    title: "A Year of Letters",
    author: "June Okafor",
    label: "Letters",
    cloth: "#e4d9c1",
    foil: "#3b3026",
    height: 352,
    width: 56,
    blurb: "Fifty-two letters to a friend across the sea, one for every week of a long year.",
    content: (
      <>
        <P first>
          Dear M, the post office here has a bell over the door that rings twice, once going in and once coming out,
          as if to make sure you meant it. I have decided to mean it every Sunday.
        </P>
        <P>
          You asked what the town is like. It is like a town that has never been in a hurry. The baker closes when the
          bread runs out. The ferry leaves when it is full. I am learning to be on time for things that do not keep time.
        </P>
        <H>Week two</H>
        <P>
          It rained for six days. I read four books and wrote you three letters, of which I am sending one. The other
          two were mostly about the rain.
        </P>
        <P>Write back. Tell me something small. Yours, J.</P>
      </>
    ),
  },
  {
    id: "navy",
    title: "Maps of Quiet Places",
    author: "Ren Ito",
    label: "Travel",
    cloth: "#253755",
    foil: "#e9d7a8",
    height: 320,
    width: 44,
    blurb: "A walker's guide to libraries, lighthouses, and other rooms built for listening.",
    content: (
      <>
        <P first>
          Every city has a room where people go to be quiet together. Find it on your first day and the city will
          make sense faster.
        </P>
        <H>Libraries</H>
        <P>
          Sit near the windows, not the stacks. Watch who comes in at opening time; they are the ones who know the
          building best.
        </P>
        <H>Lighthouses</H>
        <P>
          Climb at dusk. The keeper, if there still is one, will tell you the light was never for the ships that made
          it, but for the ones still deciding whether to try.
        </P>
      </>
    ),
  },
  {
    id: "mustard",
    title: "Slow Mornings",
    author: "Ines Calder",
    label: "Notes",
    cloth: "#a87a3a",
    foil: "#2c2116",
    height: 296,
    width: 40,
    blurb: "Small rituals for the first hour of the day.",
    content: (
      <>
        <P first>
          Boil the water before you look at anything with a screen. It takes four minutes. They are yours.
        </P>
        <P>
          Open a window, even in winter. Let the room know the day has started. Then, and only then, decide what the
          day is for.
        </P>
      </>
    ),
  },
];

export default function BookshelfDemo() {
  return <Bookshelf />;
}
