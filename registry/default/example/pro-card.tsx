import React, { useEffect, useRef, useId } from 'react';

export interface ProCardProps {
  /** Line 1 of the title (default: "You're Pro.") */
  titleLine1?: React.ReactNode;
  /** Line 2 of the title with staggered animation (default: "No more walls.") */
  titleLine2?: React.ReactNode;
  /** Subtitle description copy */
  description?: React.ReactNode;
  /** Call to action button label (default: "Keep researching") */
  ctaText?: string;
  /** Callback triggered when CTA is clicked */
  onCtaClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Callback triggered when the card closes/dismisses */
  onDismiss?: () => void;
  /** Callback triggered when replay is initiated */
  onReplay?: () => void;
  /** Whether to show the floating replay button after dismiss (default: true) */
  showReplay?: boolean;
  /** Wrap in full-screen centering backdrop (default: true) */
  standalone?: boolean;
  /** Optional custom class name */
  className?: string;
  /** Optional custom inline styles */
  style?: React.CSSProperties;
}

interface StrokeDef { d: string; delay: number; dur: number; }
interface StrokeEvent { type: 'draw' | 'erase'; t0: number; dur: number; }
interface StrokeState extends StrokeDef { events: StrokeEvent[]; }

const STROKES: StrokeDef[] = [
  { d: 'M62 198 V42 H112 A53 53 0 0 1 112 148 H62', delay: 0.0, dur: 0.85 }, // P
  { d: 'M214 198 V42 H264 A53 53 0 0 1 264 148 H214', delay: 0.8, dur: 0.8 }, // R
  { d: 'M262 150 L322 198', delay: 1.5, dur: 0.3 }, // R leg
  { d: 'M370 120 A68 78 0 1 1 506 120 A68 78 0 1 1 370 120', delay: 1.75, dur: 0.95 }, // O
];

const LAGS = [0, 0.05, 0.1, 0.16, 0.23, 0.31, 0.4, 0.5];
const WIDTHS = [8, 14, 20, 26, 32, 37, 41, 44];
const GAP = 0.7;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t = clamp(t), t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const now = () => performance.now() / 1000;

export const ProCard: React.FC<ProCardProps> = ({
  titleLine1 = "You're Pro.",
  titleLine2 = 'No more walls.',
  description = (
    <>
      Every screen, flow, and style is yours now.
      <br />
      The references, the patterns, the confidence to ship.
    </>
  ),
  ctaText = 'Keep researching',
  onCtaClick,
  onDismiss,
  onReplay,
  showReplay = true,
  standalone = true,
  className = '',
  style = {},
}) => {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const irisId = `iris-${safeId}`;
  const glassId = `glass-${safeId}`;

  const cardRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lightRef = useRef<SVGFEPointLightElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const probeRef = useRef<SVGCircleElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[][]>([[], [], [], []]);

  const strokesRef = useRef<StrokeState[]>(STROKES.map((def) => ({ ...def, events: [] })));
  const phaseRef = useRef<'idle' | 'live' | 'cool'>('idle');
  const nextWaveRef = useRef<number>(Infinity);
  const busyUntilRef = useRef<number>(0);
  const exciteRef = useRef<number>(0);
  const exciteTRef = useRef<number>(0);
  const pulseRef = useRef<number>(0);
  const pRef = useRef({ x: -200, y: -200, tx: -200, ty: -200, power: 0, target: 0 });
  const lRef = useRef({ x: 200, y: -60 });
  const timersRef = useRef<number[]>([]);

  const stateAt = (st: StrokeState, t: number) => {
    let a = 0, b = 0;
    for (const e of st.events) {
      if (t < e.t0) break;
      const k = e.dur ? easeInOut((t - e.t0) / e.dur) : 1;
      if (e.type === 'draw') { a = 0; b = k; } else { a = k; b = 1; }
    }
    return [a, b];
  };

  const pushEvent = (st: StrokeState, ev: StrokeEvent) => {
    st.events.push(ev);
    st.events.sort((x, y) => x.t0 - y.t0);
    if (st.events.length > 6) st.events.splice(0, st.events.length - 6);
  };

  const lastEnd = () => Math.max(...strokesRef.current.map((s) => s.delay + s.dur));

  const drawIn = (T: number, speed = 1, reduce = false) => {
    strokesRef.current.forEach((st) => {
      st.events = [];
      pushEvent(st, { type: 'draw', t0: T + st.delay * speed, dur: reduce ? 0 : st.dur * speed });
    });
    busyUntilRef.current = T + lastEnd() * speed + LAGS[LAGS.length - 1];
  };

  const wave = (T: number) => {
    strokesRef.current.forEach((st) => {
      pushEvent(st, { type: 'erase', t0: T + st.delay, dur: st.dur });
      pushEvent(st, { type: 'draw', t0: T + st.delay + st.dur + GAP, dur: st.dur });
    });
    busyUntilRef.current = T + lastEnd() + GAP + Math.max(...strokesRef.current.map((s) => s.dur)) + LAGS[LAGS.length - 1];
    nextWaveRef.current = busyUntilRef.current + 3.2;
  };

  const eraseOut = (T: number) => {
    strokesRef.current.forEach((st) => {
      st.events = [{ type: 'draw', t0: T - 10, dur: 0 }];
      pushEvent(st, { type: 'erase', t0: T + st.delay * 0.45, dur: st.dur * 0.6 });
    });
  };

  const openCard = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (replayRef.current) replayRef.current.classList.remove('show');
    const card = cardRef.current;
    const cta = ctaRef.current;
    if (!card || !cta) return;

    card.classList.add('reset');
    card.classList.remove('out', 'in');
    cta.classList.remove('ready');
    void card.offsetWidth;
    card.classList.remove('reset');
    void card.offsetWidth;
    card.classList.add('in');

    phaseRef.current = 'live';
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    drawIn(now() + 0.3, 0.75, reduce);
    nextWaveRef.current = busyUntilRef.current + 2.4;
    timersRef.current.push(window.setTimeout(() => cta.classList.add('ready'), 1500));
    onReplay?.();
  };

  const closeCard = () => {
    if (phaseRef.current !== 'live') return;
    phaseRef.current = 'cool';
    exciteTRef.current = 0;
    nextWaveRef.current = Infinity;
    eraseOut(now());

    const card = cardRef.current;
    const replay = replayRef.current;
    if (!card) return;

    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timersRef.current.push(window.setTimeout(() => card.classList.add('out'), reduce ? 0 : 1250));
    if (showReplay && replay) {
      timersRef.current.push(window.setTimeout(() => {
        replay.classList.add('show');
        replay.focus({ preventScroll: true });
      }, reduce ? 0 : 1750));
    }
    onDismiss?.();
  };

  const toSvgCoords = (e: { clientX: number; clientY: number }) => {
    if (!svgRef.current) return { x: -200, y: -200 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: -200, y: -200 };
    const s = pt.matrixTransform(ctm.inverse());
    s.y = Math.min(s.y, 200);
    return s;
  };

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId: number;

    const frame = () => {
      const t = now();
      if (phaseRef.current === 'live' && !reduce && t >= nextWaveRef.current) wave(t);

      for (let stIdx = 0; stIdx < strokesRef.current.length; stIdx++) {
        const st = strokesRef.current[stIdx];
        const els = pathRefs.current[stIdx];
        if (!els) continue;
        for (let k = 0; k < els.length; k++) {
          const el = els[k];
          if (!el) continue;
          const [a, b] = stateAt(st, t - LAGS[k]);
          const len = b - a;
          if (len < 0.002) { el.style.opacity = '0'; continue; }
          el.style.opacity = '1';
          el.style.strokeDasharray = `${len.toFixed(4)} 3`;
          el.style.strokeDashoffset = (-a).toFixed(4);
        }
      }

      exciteRef.current = lerp(exciteRef.current, exciteTRef.current, 0.08);
      pulseRef.current *= 0.92;

      const idleX = 270 + Math.cos(t * 0.45) * 190;
      const idleY = -50 + Math.sin(t * 0.7) * 25;
      lRef.current.x = lerp(lRef.current.x, lerp(idleX, pRef.current.tx, pRef.current.power), 0.08);
      lRef.current.y = lerp(lRef.current.y, lerp(idleY, pRef.current.ty - 110, pRef.current.power), 0.08);

      if (lightRef.current) {
        lightRef.current.setAttribute('x', lRef.current.x.toFixed(1));
        lightRef.current.setAttribute('y', lRef.current.y.toFixed(1));
        lightRef.current.setAttribute('z', (170 - exciteRef.current * 40).toFixed(1));
      }

      const f1 = 0.011 + Math.sin(t * 0.55) * 0.0018 + exciteRef.current * 0.002;
      const f2 = 0.015 + Math.cos(t * 0.42) * 0.0018;
      if (turbRef.current) {
        turbRef.current.setAttribute('baseFrequency', `${f1.toFixed(5)} ${f2.toFixed(5)}`);
      }

      pRef.current.x = lerp(pRef.current.x, pRef.current.tx, 0.16);
      pRef.current.y = lerp(pRef.current.y, pRef.current.ty, 0.16);
      pRef.current.power = lerp(pRef.current.power, phaseRef.current === 'cool' ? 0 : pRef.current.target, 0.09);

      if (probeRef.current) {
        probeRef.current.setAttribute('cx', pRef.current.x.toFixed(1));
        probeRef.current.setAttribute('cy', pRef.current.y.toFixed(1));
        probeRef.current.setAttribute('r', Math.max(0, pRef.current.power * 17 + pulseRef.current * 22 + Math.sin(t * 4) * 1.2 * pRef.current.power).toFixed(1));
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    timersRef.current.push(window.setTimeout(openCard, 200));

    const handleKeyDown = (e: KeyboardEvent) => {
      const card = cardRef.current;
      if (!card || !card.classList.contains('in') || card.classList.contains('out')) return;
      if (e.key === 'Escape') closeCard();
      if (e.key === 'Enter' && document.activeElement === document.body) ctaRef.current?.click();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      timersRef.current.forEach(clearTimeout);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePointerEnterHero = (e: React.PointerEvent) => {
    const s = toSvgCoords(e);
    pRef.current.x = pRef.current.tx = s.x; pRef.current.y = pRef.current.ty = s.y; pRef.current.target = 1;
  };
  const handlePointerMoveHero = (e: React.PointerEvent) => {
    const s = toSvgCoords(e);
    pRef.current.tx = s.x; pRef.current.ty = s.y; pRef.current.target = 1;
  };
  const handlePointerLeaveHero = () => { pRef.current.target = 0; };
  const handlePointerDownHero = (e: React.PointerEvent) => {
    const s = toSvgCoords(e);
    pRef.current.x = pRef.current.tx = s.x; pRef.current.y = pRef.current.ty = s.y; pRef.current.target = 1; pulseRef.current = 1;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (phaseRef.current === 'live' && !reduce && now() > busyUntilRef.current) wave(now());
  };
  const handlePointerUpHero = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') pRef.current.target = 0;
  };

  const handleCtaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const cta = ctaRef.current;
    if (cta) {
      const r = cta.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.4;
      const rip = document.createElement('span');
      rip.className = 'ripple';
      rip.style.width = rip.style.height = `${size}px`;
      rip.style.left = `${(e.clientX || r.left + r.width / 2) - r.left - size / 2}px`;
      rip.style.top = `${(e.clientY || r.top + r.height / 2) - r.top - size / 2}px`;
      cta.appendChild(rip);
      rip.addEventListener('animationend', () => rip.remove());
    }
    closeCard();
    onCtaClick?.(e);
  };

  return (
    <div
      className={`pro-card-scope ${standalone ? 'pro-card-standalone' : ''} ${className}`}
      style={style}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500&display=swap');
        .pro-card-scope {
          --ink: #0a0a0b;
          --muted: #7a7b84;
          --serif: "Instrument Serif", Georgia, serif;
          --sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          --out: cubic-bezier(0.16, 1, 0.3, 1);
          --spring: cubic-bezier(0.34, 1.5, 0.64, 1);
          box-sizing: border-box;
          font-family: var(--sans);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }
        .pro-card-scope *, .pro-card-scope *::before, .pro-card-scope *::after { box-sizing: border-box; }
        .pro-card-standalone {
          display: grid; place-items: center; min-height: 100vh; width: 100%;
          padding: 24px; background: #8d8e9a; overflow: hidden; position: relative;
        }
        .pro-card-scope button { font: inherit; border: 0; background: none; cursor: pointer; color: inherit; }
        .pro-card-scope .card {
          position: relative; width: min(480px, 100%); background: #fff; border-radius: 22px; overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 24px 48px -12px rgba(15,15,35,0.35), 0 60px 120px -40px rgba(15,15,35,0.45);
          transform: translateY(28px) scale(0.94); opacity: 0; filter: blur(6px);
          transition: transform 0.95s var(--spring), opacity 0.5s var(--out), filter 0.6s var(--out);
        }
        .pro-card-scope .card.in { transform: none; opacity: 1; filter: none; }
        .pro-card-scope .card.reset, .pro-card-scope .card.reset * { transition: none !important; }
        .pro-card-scope .card.out {
          transform: translateY(16px) scale(0.96); opacity: 0; filter: blur(4px);
          transition: transform 0.45s var(--out), opacity 0.4s var(--out), filter 0.45s var(--out);
        }
        .pro-card-scope .hero {
          position: relative; display: block; width: 100%; aspect-ratio: 516 / 248; cursor: pointer; touch-action: none;
        }
        .pro-card-scope .hero svg { position: relative; display: block; width: 100%; height: 100%; }
        .pro-card-scope .hero::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(40% 60% at 20% 30%, #dcd0ff 0%, transparent 70%),
                      radial-gradient(45% 65% at 80% 40%, #c9eeff 0%, transparent 70%),
                      radial-gradient(40% 55% at 50% 90%, #ffd6ec 0%, transparent 70%), #fbfbfd;
          background-size: 160% 160%;
          animation: proCardAurora 14s ease-in-out infinite alternate;
        }
        .pro-card-scope .hero::after {
          content: ""; position: absolute; inset: auto 0 0 0; height: 40%;
          background: linear-gradient(to bottom, rgba(255,255,255,0), #fff); pointer-events: none;
        }
        @keyframes proCardAurora {
          0% { background-position: 0% 0%, 100% 0%, 50% 100%, 0 0; }
          50% { background-position: 60% 40%, 30% 70%, 20% 40%, 0 0; }
          100% { background-position: 100% 100%, 0% 50%, 80% 20%, 0 0; }
        }
        .pro-card-scope .body { padding: 6px 36px 36px; text-align: center; }
        .pro-card-scope .title {
          font-family: var(--serif); font-weight: 400; font-size: clamp(38px, 9.5vw, 48px);
          line-height: 1.08; letter-spacing: -0.02em; margin: 0;
        }
        .pro-card-scope .line { display: block; overflow: hidden; padding-bottom: 0.08em; }
        .pro-card-scope .line > span { display: inline-block; transform: translateY(110%); transition: transform 1s var(--out); }
        .pro-card-scope .card.in .line > span { transform: none; transition-delay: calc(0.55s + var(--d, 0s)); }
        .pro-card-scope .sub {
          margin-top: 16px; font-family: var(--sans); color: var(--muted); font-size: 15px; line-height: 1.6;
          opacity: 0; transform: translateY(8px); transition: opacity 0.7s var(--out), transform 0.7s var(--out);
        }
        .pro-card-scope .card.in .sub { opacity: 1; transform: none; transition-delay: 0.8s; }
        .pro-card-scope .cta {
          position: relative; overflow: hidden; margin-top: 32px; width: 100%; height: 60px;
          border-radius: 12px; background: var(--ink); color: #fff; font-family: var(--sans); font-size: 16px; font-weight: 500;
          letter-spacing: -0.01em; opacity: 0; transform: translateY(10px);
          transition: opacity 0.6s var(--out), transform 0.6s var(--out), box-shadow 0.3s var(--out); outline: none;
        }
        .pro-card-scope .card.in .cta { opacity: 1; transform: none; transition-delay: 0.95s, 0.95s, 0s; }
        .pro-card-scope .card.in .cta.ready { transition-delay: 0s; }
        .pro-card-scope .cta:hover { box-shadow: 0 12px 28px -12px rgba(0,0,0,0.6); }
        .pro-card-scope .cta:focus-visible { box-shadow: 0 0 0 3px #fff, 0 0 0 5px #2f7dff; }
        .pro-card-scope .cta-label {
          position: relative; z-index: 2; display: inline-flex; align-items: center; justify-content: center; gap: 0;
          transition: transform 0.3s var(--out), gap 0.45s var(--spring);
        }
        .pro-card-scope .cta:hover .cta-label { gap: 10px; }
        .pro-card-scope .cta:active .cta-label { transform: scale(0.965); }
        .pro-card-scope .cta .arrow {
          width: 0; height: 16px; opacity: 0; stroke: currentColor; stroke-width: 2; fill: none;
          transform: translateX(-6px); transition: width 0.45s var(--spring), opacity 0.3s var(--out), transform 0.45s var(--spring);
        }
        .pro-card-scope .cta:hover .arrow { width: 16px; opacity: 1; transform: none; }
        .pro-card-scope .cta::before {
          content: ""; position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(100deg, transparent 20%, rgba(255,150,230,0.28) 38%, rgba(170,140,255,0.3) 48%, rgba(120,220,255,0.3) 58%, transparent 76%);
          transform: translateX(-110%);
        }
        .pro-card-scope .cta:hover::before { transform: translateX(110%); transition: transform 0.9s var(--out); }
        .pro-card-scope .ripple {
          position: absolute; z-index: 1; border-radius: 50%; pointer-events: none;
          background: rgba(255,255,255,0.3); transform: scale(0); animation: proCardRipple 0.7s var(--out) forwards;
        }
        @keyframes proCardRipple { to { transform: scale(1); opacity: 0; } }
        .pro-card-scope .replay {
          position: fixed; left: 50%; bottom: 32px; translate: -50% 0; padding: 11px 18px; border-radius: 999px;
          background: rgba(255,255,255,0.9); color: var(--ink); font-family: var(--sans); font-size: 14px; font-weight: 500;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.35); opacity: 0; transform: translateY(10px); pointer-events: none;
          transition: opacity 0.4s var(--out), transform 0.5s var(--spring); z-index: 999;
        }
        .pro-card-scope .replay.show { opacity: 1; transform: none; pointer-events: auto; }
        @media (max-width: 480px) {
          .pro-card-scope .body { padding: 4px 22px 24px; }
          .pro-card-scope .sub { font-size: 14px; }
          .pro-card-scope .cta { height: 54px; margin-top: 26px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pro-card-scope *, .pro-card-scope *::before, .pro-card-scope *::after {
            transition-duration: 0.001ms !important; transition-delay: 0ms !important; animation-duration: 0.001ms !important;
          }
        }
      `,
        }}
      />

      <section
        ref={cardRef}
        className="card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${safeId}-title`}
        aria-describedby={`${safeId}-desc`}
      >
        <div
          ref={heroRef}
          className="hero"
          aria-hidden="true"
          onPointerEnter={handlePointerEnterHero}
          onPointerMove={handlePointerMoveHero}
          onPointerLeave={handlePointerLeaveHero}
          onPointerDown={handlePointerDownHero}
          onPointerUp={handlePointerUpHero}
        >
          <svg ref={svgRef} viewBox="22 -2 516 248" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id={irisId} gradientUnits="userSpaceOnUse" x1={20} y1={0} x2={540} y2={240} spreadMethod="reflect">
                <stop offset="0" stopColor="#8f7bff" />
                <stop offset="0.35" stopColor="#ff8fd8" />
                <stop offset="0.65" stopColor="#6fd6ff" />
                <stop offset="1" stopColor="#9d8cff" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  values="0 0; 260 60; 0 0"
                  dur="9s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                />
              </linearGradient>

              {/* Liquid glass filter */}
              <filter id={glassId} filterUnits="userSpaceOnUse" x="-40" y="-60" width="620" height="380" colorInterpolationFilters="sRGB">
                <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.011 0.015" numOctaves={2} seed={7} result="noise" />
                <feDisplacementMap in="SourceAlpha" in2="noise" scale={9} xChannelSelector="R" yChannelSelector="G" result="wob" />
                <feGaussianBlur in="wob" stdDeviation={6} result="b" />
                <feColorMatrix in="b" type="matrix" result="goo" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 26 -11" />
                <feGaussianBlur in="goo" stdDeviation={7} result="h" />
                <feSpecularLighting in="h" surfaceScale={8} specularConstant={1.7} specularExponent={38} lightingColor="#ffffff" result="spec">
                  <fePointLight ref={lightRef} x={200} y={-60} z={170} />
                </feSpecularLighting>
                <feComposite in="spec" in2="goo" operator="in" result="specIn" />
                <feColorMatrix in="h" type="matrix" result="hl" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 0" />
                <feComponentTransfer in="hl" result="tintRaw">
                  <feFuncR type="table" tableValues="1 1 1 1 0.50 0.40 0.34 0.62 0.96 0.99 1" />
                  <feFuncG type="table" tableValues="1 1 1 1 0.40 0.34 0.74 0.90 0.84 0.95 1" />
                  <feFuncB type="table" tableValues="1 1 1 1 1 1 1 0.98 0.98 1 1" />
                  <feFuncA type="table" tableValues="0 0 0 0 0.9 0.82 0.62 0.42 0.3 0.26 0.28" />
                </feComponentTransfer>
                <feComposite in="tintRaw" in2="goo" operator="in" result="tint" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale={9} xChannelSelector="R" yChannelSelector="G" result="wobC" />
                <feGaussianBlur in="wobC" stdDeviation={10} result="colB" />
                <feComposite in="colB" in2="goo" operator="in" result="colIn" />
                <feComponentTransfer in="colIn" result="body"><feFuncA type="linear" slope={0.42} /></feComponentTransfer>
                <feOffset in="goo" dy={3} result="gooDown" />
                <feComposite in="goo" in2="gooDown" operator="out" result="topEdge" />
                <feFlood floodColor="#ffffff" floodOpacity={0.95} />
                <feComposite in2="topEdge" operator="in" result="rim" />
                <feOffset in="goo" dy={-2} result="gooUp" />
                <feComposite in="goo" in2="gooUp" operator="out" result="botEdge" />
                <feFlood floodColor="#5b4bb5" floodOpacity={0.35} />
                <feComposite in2="botEdge" operator="in" result="lip" />
                <feGaussianBlur in="goo" stdDeviation={9} result="sb" />
                <feOffset in="sb" dy={12} result="so" />
                <feFlood floodColor="#4a3aa8" floodOpacity={0.16} />
                <feComposite in2="so" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="body" />
                  <feMergeNode in="tint" />
                  <feMergeNode in="lip" />
                  <feMergeNode in="rim" />
                  <feMergeNode in="specIn" />
                </feMerge>
              </filter>
            </defs>

            {/* Strokes stack */}
            <g filter={`url(#${glassId})`} fill="none" stroke={`url(#${irisId})`} strokeLinecap="round" strokeLinejoin="round">
              {STROKES.map((def, stIdx) =>
                LAGS.map((_, k) => (
                  <path
                    key={`${stIdx}-${k}`}
                    ref={(el) => {
                      if (!pathRefs.current[stIdx]) pathRefs.current[stIdx] = [];
                      pathRefs.current[stIdx][k] = el;
                    }}
                    d={def.d}
                    pathLength={1}
                    strokeWidth={WIDTHS[k]}
                    style={{ opacity: 0 }}
                  />
                ))
              )}
              {/* Cursor droplet */}
              <circle ref={probeRef} cx="-200" cy="-200" r="0" fill={`url(#${irisId})`} stroke="none" />
            </g>
          </svg>
        </div>

        <div className="body">
          <h2 className="title" id={`${safeId}-title`}>
            <span className="line"><span>{titleLine1}</span></span>
            <span className="line"><span style={{ ['--d' as any]: '0.08s' }}>{titleLine2}</span></span>
          </h2>
          <p className="sub" id={`${safeId}-desc`}>{description}</p>
          <button
            ref={ctaRef}
            className="cta"
            type="button"
            onClick={handleCtaClick}
            onPointerEnter={() => { exciteTRef.current = 1; }}
            onPointerLeave={() => { exciteTRef.current = 0; }}
          >
            <span className="cta-label">
              {ctaText}
              <svg className="arrow" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        </div>
      </section>

      {showReplay && (
        <button ref={replayRef} className="replay" type="button" onClick={openCard}>
          ↺ Replay
        </button>
      )}
    </div>
  );
};

export default ProCard;