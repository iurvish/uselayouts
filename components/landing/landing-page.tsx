"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Star } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { BrowseItem } from "@/lib/browse/items";
import { HeroSpotlightCanvas } from "@/components/landing/hero-spotlight-canvas";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Component", href: "/browse" },
  { label: "Documentation", href: "/docs/installation" },
  { label: "Meet Creator", href: "https://urvish.in" },
  { label: "Become a Sponsor", href: "https://github.com/sponsors/iurvish" },
];

const categories = [
  {
    title: "Layouts",
    count: "20+",
    image: "/landing/card-layouts.png",
    panel: "#879F6C",
    badgeGradient:
      "linear-gradient(in oklab 167.62deg, oklab(100% 0 0 / 20%) 16.5%, oklab(67.1% -0.048 0.060 / 0%) 93.5%)",
    tags: ["Hero", "Bento", "Sections", "Grid Stack"],
  },
  {
    title: "Navigation",
    count: "20+",
    image: "/landing/card-navigation.png",
    panel: "#2495D1",
    badgeGradient:
      "linear-gradient(in oklab 167.62deg, oklab(100% 0 0 / 20%) 16.5%, oklab(63.7% -0.069 -0.111 / 20%) 93.5%)",
    tags: ["Navbar", "Tabs", "Menu", "Sidebar", "Breadcrumbs"],
  },
  {
    title: "Interactions",
    count: "20+",
    image: "/landing/card-interactions.png",
    panel: "#BC6147",
    badgeGradient:
      "linear-gradient(in oklab 167.62deg, oklab(100% 0 0 / 20%) 16.5%, oklab(59.5% 0.099 0.074 / 20%) 93.5%)",
    tags: ["Magnetic Hover", "Cursor reveal", "Marquee"],
  },
  {
    title: "User Interface",
    count: "20+",
    image: "/landing/card-user-interface.png",
    panel: "#B6547A",
    badgeGradient:
      "linear-gradient(in oklab 167.62deg, oklab(100% 0 0 / 20%) 16.5%, oklab(57.9% 0.133 -0.005 / 20%) 93.5%)",
    tags: ["Cards", "Forms", "Pricing Modal", "Testimonials"],
  },
];

const toolPills = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Motion",
  "Shadcn",
  "Radix",
  "Lucide",
] as const;

const pillShadow =
  "0px 0px 1px 0px rgba(97,97,97,0.1), 0px 1px 1px 0px rgba(97,97,97,0.09), 0px 3px 2px 0px rgba(97,97,97,0.05), 0px 4px 2px 0px rgba(97,97,97,0.01), 0px 7px 2px 0px rgba(97,97,97,0)";

/** Figma 1:733 Mask group — fade so end cards dissolve into the section. */
const toolsArcMask =
  "linear-gradient(180deg, rgba(217,217,217,1) 73.92%, rgba(115,115,115,0) 100%)";

const toolsArcCardShadow =
  "inset 0 0 0 1px #fff, 0 1px 3px rgba(102,102,102,0.1), 0 6px 6px rgba(102,102,102,0.09), 0 13px 8px rgba(102,102,102,0.05), 0 23px 9px rgba(102,102,102,0.01), 0 36px 10px rgba(102,102,102,0)";

/**
 * OriginKit pivots + matrix on 1000×1000 group (geometry fixed; logos by index).
 * L→R on arc: Lucide → Next → Motion → React → Tailwind → Shadcn → TypeScript.
 */
const toolsArc = [
  {
    name: "Lucide",
    src: "/landing/tool-lucide.svg",
    left: 0,
    top: 556,
    matrix: "matrix(0 -1 1 0 0 0)",
    icon: { left: 14, top: 14, width: 84, height: 84 },
  },
  {
    name: "Next.js",
    src: "/landing/tool-next.png",
    left: 38.99,
    top: 298.5,
    matrix: "matrix(0.5 -0.8660253882408142 0.8660253882408142 0.5 0 0)",
    icon: { left: 16, top: 16, width: 80, height: 80 },
  },
  {
    name: "Motion",
    src: "/landing/tool-motion.png",
    left: 201.5,
    top: 94.98,
    matrix: "matrix(0.866025447845459 -0.5 0.5 0.866025447845459 0 0)",
    icon: { left: 14, top: 14, width: 84, height: 84 },
  },
  {
    name: "React",
    src: "/landing/tool-react.png",
    left: 444,
    top: 0,
    matrix: "matrix(1 0 0 1 0 0)",
    icon: { left: 11, top: 16, width: 90, height: 80 },
  },
  {
    name: "Tailwind CSS",
    src: "/landing/tool-tailwind.png",
    left: 701.5,
    top: 38.99,
    matrix: "matrix(0.866025447845459 0.5 -0.5 0.866025447845459 0 0)",
    icon: { left: 11, top: 28, width: 90, height: 55 },
  },
  {
    name: "Shadcn",
    src: "/landing/tool-shadcn.svg",
    left: 905.01,
    top: 201.5,
    matrix: "matrix(0.5 0.8660253882408142 -0.8660253882408142 0.5 0 0)",
    icon: { left: 14, top: 14, width: 84, height: 84 },
  },
  {
    name: "TypeScript",
    src: "/landing/tool-typescript.png",
    left: 1000,
    top: 444,
    matrix: "matrix(0 1 -1 0 0 0)",
    icon: { left: 16, top: 16, width: 80, height: 80 },
  },
] as const;

/** Cream page dots — Tools + Testimonials; sized to read on screen */
const landingDotPattern = {
  backgroundColor: "#F5F3EE",
  backgroundImage: "radial-gradient(circle, #EDEAE3 3.5px, transparent 3.5px)",
  backgroundSize: "28px 28px",
} as const;

const pillRowMask =
  "linear-gradient(90deg, rgba(217,217,217,0) 0%, rgba(196,196,196,1) 32.94%, rgba(166,166,166,1) 71.5%, rgba(115,115,115,0) 100%)";
const avatars = [
  "/landing/avatar-1.png",
  "/landing/avatar-2.png",
  "/landing/avatar-3.png",
  "/landing/avatar-4.png",
];

const testimonials = [
  {
    quote:
      "The components look great out of the box, but the best part is how easy they are to make your own.",
    name: "Jack Carter",
    role: "VP of Engineering, Bloom & co",
    avatar: "/landing/avatar-4.png",
  },
  {
    quote:
      "The components look great out of the box, but the best part is how easy they are to make your own.",
    name: "Jack Carter",
    role: "VP of Engineering, Bloom & co",
    avatar: "/landing/avatar-1.png",
  },
  {
    quote:
      "The components look great out of the box, but the best part is how easy they are to make your own.",
    name: "Jack Carter",
    role: "VP of Engineering, Bloom & co",
    avatar: "/landing/avatar-2.png",
  },
  {
    quote:
      "The components look great out of the box, but the best part is how easy they are to make your own.",
    name: "Jack Carter",
    role: "VP of Engineering, Bloom & co",
    avatar: "/landing/avatar-3.png",
  },
];

const WHY_INTERVAL_MS = 6000;

const whyFeatures = [
  {
    title: "Copy. Customize. Ship.",
    description:
      "Start with production-ready components and make them your own. No locked-down abstractions. No fighting the library.",
    image: "/landing/why/copy.png",
    short: "Copy",
  },
  {
    title: "Motion that means something.",
    description:
      "Every animation is purposeful — feedback, focus, and flow — not decoration for its own sake.",
    image: "/landing/why/motion.png",
    short: "Motion",
  },
  {
    title: "Built to be changed.",
    description:
      "Clean, editable source you own. Swap tokens, restyle freely, and keep shipping without fighting abstractions.",
    image: "/landing/why/built.png",
    short: "Change",
  },
  {
    title: "Skip the blank canvas.",
    description:
      "Start from patterns that already work. Less scaffolding, more product — from first commit to polished UI.",
    image: "/landing/why/blank.png",
    short: "Start",
  },
] as const;

/** Coral media plate from Figma node 1:670 — base, lighting ellipses, plus grid */
function WhyCoralSurface({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("landing-why-surface relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/why/glow-a.svg"
          alt=""
          className="landing-why-surface-glow-a"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/why/glow-b.svg"
          alt=""
          className="landing-why-surface-glow-b"
        />
        <div className="landing-why-surface-grid" />
        <div className="landing-why-surface-light" />
      </div>
      <div className="relative z-[1] size-full">{children}</div>
    </div>
  );
}

const whyActiveLine =
  "linear-gradient(in oklab 179.04deg, oklab(43.6% -0.034 -0.138) -260%, oklab(53% 0.114 0.016) 225.3%, oklab(86.5% 0.053 0.047) 720%)";

/** Combo craft depth: top inset highlight, bottom inset shade, hairline rim, crisp drop. */
const buttonCraft = {
  primary: {
    className: "bg-[#071A31] text-white hover:brightness-110",
    style: {
      backgroundImage: "linear-gradient(180deg, #1a3558 0%, #071A31 48%, #040e1a 100%)",
      boxShadow: [
        "inset 0 1.5px 0 rgba(255,255,255,0.28)",
        "inset 0 -2px 0 rgba(0,0,0,0.45)",
        "inset 0 0 0 1px rgba(255,255,255,0.06)",
        "0 1px 0 rgba(255,255,255,0.1)",
        "0 3px 0 rgba(0,0,0,0.25)",
        "0 8px 12px rgba(7,26,49,0.35)",
      ].join(", "),
    },
  },
  secondary: {
    className: "bg-white text-[#071A31] hover:brightness-[0.98]",
    style: {
      backgroundImage: "linear-gradient(180deg, #ffffff 0%, #f7f8fa 100%)",
      boxShadow: [
        "inset 0 1px 0 #fff",
        "inset 0 0 0 1px rgba(7,26,49,0.08)",
        "0 1px 2px rgba(7,26,49,0.06)",
        "0 4px 10px rgba(7,26,49,0.08)",
      ].join(", "),
    },
  },
  outline: {
    className: "bg-transparent text-[#071A31] hover:bg-[#071A31]/[0.04]",
    style: {
      backgroundImage: "none",
      boxShadow: [
        "inset 0 1px 0 rgba(255,255,255,0.7)",
        "inset 0 0 0 1.5px rgba(7,26,49,0.2)",
        "0 1px 2px rgba(7,26,49,0.04)",
      ].join(", "),
    },
  },
} as const;

function LandingButton({
  children,
  className,
  href = "/browse",
  variant = "primary",
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  variant?: keyof typeof buttonCraft;
}) {
  const craft = buttonCraft[variant];
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-3.5 text-[15px] font-medium transition-[transform,filter,background-color] duration-150 ease-out active:scale-[0.96]",
        craft.className,
        className,
      )}
      style={craft.style}
    >
      {children}
    </Link>
  );
}

function ExploreButton({
  className,
  href = "/browse",
  variant = "primary",
}: {
  className?: string;
  href?: string;
  variant?: keyof typeof buttonCraft;
}) {
  return (
    <LandingButton
      className={cn("h-12 px-5 text-[16px]", className)}
      href={href}
      variant={variant}
    >
      Explore Components
    </LandingButton>
  );
}

function StarOnGithub({ className }: { className?: string }) {
  const craft = buttonCraft.outline;
  return (
    <a
      href="https://github.com/iurvish/uselayouts"
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-[15px] font-medium transition-[transform,filter,background-color] duration-150 ease-out active:scale-[0.96]",
        craft.className,
        className,
      )}
      style={craft.style}
    >
      <Star className="size-3.5 fill-[#071A31] text-[#071A31]" aria-hidden />
      Star on GitHub
    </a>
  );
}

function TrustedBy() {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % avatars.length), 5000);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="mt-auto hidden items-center gap-3 pb-1 md:flex">
      <div className="flex">
        {avatars.map((src, i) => (
          <div key={src} className={cn("relative", i > 0 && "-ml-3")}>
            {i === active && !reduce ? (
              <motion.span
                layoutId="trusted-ring"
                className="absolute -inset-1 rounded-full ring-2 ring-white/90"
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            ) : null}
            <Image
              src={src}
              alt=""
              width={45}
              height={45}
              className="relative size-[45px] rounded-full object-cover ring-2 ring-white"
            />
          </div>
        ))}
      </div>
      <p className="font-[family-name:var(--font-geist-mono)] text-[16px] leading-tight tracking-[-0.03em] text-white">
        Trusted by 100+
        <br />
        Developers
      </p>
    </div>
  );
}

function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 flex h-[70px] items-center justify-between px-4 sm:px-8 lg:px-12">
      <Link href="/" aria-label="uselayouts home" className="shrink-0">
        <Image
          src="/logomark.svg"
          alt="uselayouts"
          width={162}
          height={36}
          className="h-9 w-auto"
          priority
        />
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-[15px] text-[#071A31] transition-opacity duration-150 hover:opacity-70"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <StarOnGithub className="hidden sm:inline-flex" />
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-10 items-center justify-center rounded-2xl text-[#071A31] transition-opacity duration-150 hover:opacity-70 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            {open ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-4 top-[70px] z-30 flex flex-col gap-4 rounded-2xl border border-black/5 bg-[#F5F3EE] p-5 shadow-lg lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] text-[#071A31] transition-opacity duration-150 hover:opacity-70"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <StarOnGithub className="w-full sm:hidden" />
        </div>
      ) : null}
    </header>
  );
}

function HeroSection({ heroItems }: { heroItems: BrowseItem[] }) {
  return (
    <section className="px-4 pb-4 sm:px-4 lg:px-4">
      <div className="relative h-[calc(100svh-70px-1rem)] min-h-[560px] overflow-hidden rounded-[10px] bg-white">
        <Image
          src="/landing/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <HeroSpotlightCanvas items={heroItems} />

        {/* Mobile: canvas sits higher; hide Trusted-by; keep copy clear of the band */}
        <div className="relative z-10 flex h-full max-w-[480px] flex-col gap-6 p-6 pb-[min(52%,300px)] sm:gap-8 sm:p-10 sm:pb-10 md:pb-12 lg:p-12">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-balance text-[40px] leading-[1.15] tracking-[-0.04em] text-white sm:text-[54px]">
                Build interfaces that feel as good as they look.
              </h1>
              <p className="text-pretty text-[16px] leading-relaxed text-white/85">
                Beautiful, interactive React components built to help you ship
                polished interfaces without building every interaction from
                scratch.
              </p>
            </div>

            <ExploreButton className="w-fit" />
          </div>

          <TrustedBy />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-[#F5F3EE] px-4 py-16 sm:px-8 lg:px-[120px] lg:py-[100px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 lg:gap-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[461px] flex-col gap-4">
            <h2 className="text-[36px] leading-[1.15] tracking-[-0.04em] text-[#071A31] sm:text-[48px]">
              Everything you need to build the interface.
            </h2>
            <p className="text-[16px] leading-[1.5] text-[#4B565E]">
              From foundational layouts to expressive interactions, create
              interfaces that feel considered, not cookie-cutter.
            </p>
          </div>
          <LandingButton href="/browse" variant="secondary" className="shrink-0">
            Explore full library
          </LandingButton>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((cat) => (
            <article
              key={cat.title}
              className="flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-[#E2E2E2] bg-white px-3 pb-6 pt-3"
            >
              <div className="flex flex-col gap-4">
                <div
                  className="relative h-[220px] overflow-hidden rounded-xl sm:h-[320px] lg:h-[430px]"
                  style={{ backgroundColor: cat.panel }}
                >
                  <Image
                    src={cat.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 588px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-4 px-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center rounded-full px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[14px] font-medium leading-[18px] tracking-[-0.03em] text-white"
                      style={{
                        backgroundColor: cat.panel,
                        backgroundImage: cat.badgeGradient,
                      }}
                    >
                      {cat.count}
                    </span>
                    <h3 className="text-[24px] font-medium leading-[30px] tracking-[-0.02em] text-[#071A31]">
                      {cat.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {cat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center justify-center rounded-[6px] border border-[#E2E2E2] bg-[#F2F3F4] px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[16px] leading-5 tracking-[-0.03em] text-[#3D464C]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const WHY_EASE = [0.32, 0.72, 0, 1] as const;

function WhySection() {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [allowMotion, setAllowMotion] = useState(true);
  const fromKeyboardRef = useRef(false);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      fromKeyboardRef.current = false;
      setAllowMotion(true);
      setActive((i) => (i + 1) % whyFeatures.length);
      setCycle((c) => c + 1);
    }, WHY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [cycle, reduce]);

  const select = (i: number) => {
    setAllowMotion(!reduce && !fromKeyboardRef.current);
    setActive(i);
    setCycle((c) => c + 1);
  };

  const motionOn = allowMotion && !reduce;
  const expandMs = motionOn ? 220 : 0;

  return (
    <section className="relative overflow-hidden bg-[#1B1C1D] px-4 py-20 sm:px-8 lg:px-[120px] lg:py-[120px]">
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-12 lg:gap-[72px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-[406px] text-[36px] leading-[1.15] tracking-[-0.04em] text-white sm:text-[48px]">
            Why Developers choose uselayouts
          </h2>
          <p className="max-w-[348px] text-[16px] leading-[1.5] text-white/70">
            You shouldn&apos;t have to spend hours rebuilding the same UI
            patterns before getting to the part that actually makes your product
            yours.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex w-full max-w-[564px] flex-col gap-8">
            {whyFeatures.map((feature, i) => {
              const isActive = i === active;
              return (
                <button
                  key={feature.title}
                  type="button"
                  className="flex w-full cursor-pointer flex-col gap-8 text-left"
                  onPointerDown={() => {
                    fromKeyboardRef.current = false;
                  }}
                  onKeyDown={() => {
                    fromKeyboardRef.current = true;
                  }}
                  onClick={() => select(i)}
                >
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-[20px] font-medium leading-6 tracking-[-0.02em] transition-colors",
                        motionOn ? "duration-150" : "duration-0",
                        isActive ? "text-white" : "text-[#9F9F9F]"
                      )}
                    >
                      {feature.title}
                    </span>
                    <div
                      className="grid transition-[grid-template-rows] ease-[cubic-bezier(0.32,0.72,0,1)]"
                      style={{
                        gridTemplateRows: isActive ? "1fr" : "0fr",
                        transitionDuration: `${expandMs}ms`,
                      }}
                    >
                      <div
                        className="min-h-0 overflow-hidden"
                        aria-hidden={!isActive}
                      >
                        <p
                          className="mt-4 max-w-[459px] text-[16px] leading-[1.5] text-white/80 transition-opacity ease-[cubic-bezier(0.32,0.72,0,1)]"
                          style={{
                            opacity: isActive ? 1 : 0,
                            transitionDuration: `${expandMs}ms`,
                          }}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span
                    className="relative h-0.5 w-full overflow-hidden bg-[#3C3C3C]"
                    aria-hidden
                  >
                    {isActive ? (
                      <span
                        key={cycle}
                        className="landing-why-progress absolute inset-y-0 left-0 h-full w-full origin-left"
                        style={{
                          backgroundImage: whyActiveLine,
                          animation: reduce
                            ? undefined
                            : motionOn
                              ? `landing-why-progress ${WHY_INTERVAL_MS}ms linear forwards, landing-why-fade 220ms var(--ease-out) both`
                              : `landing-why-progress ${WHY_INTERVAL_MS}ms linear forwards`,
                          transform: reduce ? "scaleX(1)" : undefined,
                        }}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative h-[280px] w-full sm:h-[360px] lg:h-[400px] lg:w-[588px] lg:shrink-0">
            <WhyCoralSurface className="size-full rounded-2xl">
              <div className="absolute inset-[4%] sm:inset-[5%]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={whyFeatures[active].image}
                    className="absolute inset-0"
                    initial={motionOn ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      motionOn
                        ? {
                            opacity: 0,
                            y: -8,
                            transition: { duration: 0.16, ease: "easeIn" },
                          }
                        : false
                    }
                    transition={{
                      duration: motionOn ? 0.22 : 0,
                      ease: WHY_EASE,
                    }}
                  >
                    <Image
                      src={whyFeatures[active].image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 588px"
                      className="object-contain"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </WhyCoralSurface>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Figma 1:733 — coded logo arc; copy/CTA match 1:757 spacing. */
function ToolsArc() {
  return (
    <svg
      viewBox="0 0 1000 556"
      className="block aspect-[1000/556] w-full overflow-hidden"
      preserveAspectRatio="xMidYMid meet"
      style={{
        WebkitMaskImage: toolsArcMask,
        maskImage: toolsArcMask,
      }}
      role="presentation"
    >
      {toolsArc.map((tool) => (
        <g
          key={tool.name}
          transform={`translate(${tool.left} ${tool.top}) ${tool.matrix}`}
        >
          <foreignObject width="112" height="112" overflow="visible">
            <div
              className="relative size-[112px] overflow-hidden rounded-[10px] bg-[#F9F8F6]"
              style={{ boxShadow: toolsArcCardShadow }}
              xmlns="http://www.w3.org/1999/xhtml"
            >
              <Image
                src={tool.src}
                alt=""
                width={tool.icon.width}
                height={tool.icon.height}
                unoptimized={tool.src.endsWith(".svg")}
                className="absolute max-w-none object-contain"
                style={tool.icon}
              />
            </div>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}

function ToolsSection() {
  return (
    <section
      id="tools"
      className="relative w-full py-20 lg:py-0"
      style={landingDotPattern}
    >
      <div className="relative mx-auto w-full max-w-[1440px] lg:aspect-[1440/783]">
        {/* Figma 1:733 — x220, y120, 1000×556 within the 1440×783 section. */}
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
          aria-hidden
        >
          <div className="absolute left-1/2 top-[15.3257%] w-[69.4444%] -translate-x-1/2">
            <ToolsArc />
          </div>
        </div>

        {/* Figma 1:757 — top 351, gap 32, text gap 16 */}
        <div className="relative z-10 mx-auto flex w-full max-w-[378px] flex-col items-center gap-8 px-4 lg:absolute lg:left-1/2 lg:top-[44.8276%] lg:-translate-x-1/2 lg:px-0">
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <h2 className="text-balance text-[36px] leading-[1.15] tracking-[-0.04em] text-[#071A31] sm:text-[48px] sm:tracking-[-1.92px]">
              Fits right into the way you build.
            </h2>
            <p className="max-w-[310px] text-[16px] leading-[1.5] text-[#4B565E]">
              Uselayouts works with the tools you already know, so you can ship
              faster.
            </p>
          </div>

          <div className="relative w-[min(100vw-2rem,616px)] overflow-hidden lg:w-[616px]">
            <div
              className="relative h-[45px] w-full overflow-hidden"
              style={{ WebkitMaskImage: pillRowMask, maskImage: pillRowMask }}
            >
              <div className="absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap">
                {toolPills.map((name) => (
                  <span
                    key={name}
                    className="inline-flex h-[29px] shrink-0 items-center justify-center rounded-[6px] bg-white px-3 font-[family-name:var(--font-geist-mono)] text-[16px] leading-none tracking-[-0.03em] text-[#3D464C]"
                    style={{ boxShadow: pillShadow }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ExploreButton className="h-auto rounded-full px-[14px] py-3" />
        </div>
      </div>
    </section>
  );
}

const testimonialCardShadow =
  "0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)";

function TestimonialCard({
  quote,
  name,
  role,
  avatar,
}: (typeof testimonials)[number]) {
  return (
    <article
      className="relative flex min-h-[300px] w-[min(calc(100vw-4rem),300px)] shrink-0 flex-col overflow-hidden rounded-2xl bg-[#1B1C1D] p-5 sm:min-h-[340px] sm:w-[min(calc(100vw-2rem),420px)] sm:p-6 lg:min-h-[380px] lg:w-[min(calc(100vw-2rem),550px)]"
      style={{ boxShadow: testimonialCardShadow }}
    >
      {/* Figma 23:585 — top-left specular shine */}
      <img
        src="/landing/testimonial-shine.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[-33.85px] top-[-26.86px] h-[222.709px] w-[245.282px] max-w-none"
      />
      <div
        className="pointer-events-none absolute left-6 top-6 select-none font-[family-name:var(--font-geist-mono)] text-[120px] leading-none text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(141.5deg, #313335 25.74%, #252628 56.05%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
        aria-hidden
      >
        “
      </div>
      <div className="relative mt-20 flex flex-1 flex-col justify-between gap-5 sm:mt-28 sm:gap-7">
        <p className="max-w-[404px] text-[15px] leading-[1.5] text-white sm:text-[16px]">
          {quote}
        </p>
        <div className="flex flex-col gap-7">
          <div
            className="h-px w-full opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, #fff 0 3px, transparent 3px 6px)",
            }}
            aria-hidden
          />
          <div className="flex items-center gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[16px] text-white">{name}</p>
              <p className="text-[14px] text-[#BABABB]">{role}</p>
            </div>
            <Image
              src={avatar}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

const TESTIMONIAL_GAP_PX = 24;
const TESTIMONIAL_LOOP_MS = 40_000;

function TestimonialsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const reverseRef = useRef(false);
  const ignoreScrollRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Duplicate once for seamless wrap; scrollLeft resets at the midpoint.
  const loop = [...testimonials, ...testimonials];

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = performance.now();

    const halfWidth = () => scroller.scrollWidth / 2;

    const wrap = () => {
      const half = halfWidth();
      if (half <= 0) return;
      if (scroller.scrollLeft >= half) {
        ignoreScrollRef.current = true;
        scroller.scrollLeft -= half;
        requestAnimationFrame(() => {
          ignoreScrollRef.current = false;
        });
      } else if (scroller.scrollLeft <= 0) {
        ignoreScrollRef.current = true;
        scroller.scrollLeft += half;
        requestAnimationFrame(() => {
          ignoreScrollRef.current = false;
        });
      }
    };

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!pausedRef.current && !reduced.matches && !dragRef.current) {
        const half = halfWidth();
        if (half > 0) {
          const delta = (half / TESTIMONIAL_LOOP_MS) * dt;
          scroller.scrollLeft += reverseRef.current ? -delta : delta;
          wrap();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onScroll = () => {
      if (!ignoreScrollRef.current) wrap();
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, []);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    if (!dragRef.current) pausedRef.current = false;
  };

  const stepPx = () => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector("article");
    return (card?.getBoundingClientRect().width ?? 550) + TESTIMONIAL_GAP_PX;
  };

  const nudge = (dir: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    reverseRef.current = dir < 0;
    pause();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollBy({
      left: dir * stepPx(),
      behavior: reduced ? "auto" : "smooth",
    });
    window.setTimeout(resume, reduced ? 0 : 420);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // native touch scroll
    const scroller = scrollerRef.current;
    if (!scroller) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: scroller.scrollLeft,
    };
    pause();
    setDragging(true);
    scroller.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const scroller = scrollerRef.current;
    if (!drag || !scroller || drag.pointerId !== e.pointerId) return;
    scroller.scrollLeft = drag.startScroll - (e.clientX - drag.startX);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      scrollerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (!scrollerRef.current?.matches(":hover")) resume();
  };

  return (
    <section
      className="overflow-x-hidden px-4 py-20 sm:px-8 lg:px-[120px] lg:py-24"
      style={landingDotPattern}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="max-w-[470px] text-[36px] leading-[1.15] tracking-[-0.04em] text-[#071A31] sm:text-[48px]">
          Developers are already building with it.
        </h2>
        <div className="flex gap-2.5">
          <button
            type="button"
            aria-label="Previous testimonial"
            className="flex size-[45px] cursor-pointer items-center justify-center rounded-full bg-[#F9F8F6] shadow-[inset_0_0_0_1px_#fff,0_1px_1px_rgba(97,97,97,0.09)] transition-transform duration-150 active:scale-[0.98]"
            onClick={() => nudge(-1)}
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden>
              <path
                d="M8 1L1 8l7 7"
                stroke="#000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            className="flex size-[45px] cursor-pointer items-center justify-center rounded-full bg-[#F9F8F6] shadow-[inset_0_0_0_1px_#fff,0_1px_1px_rgba(97,97,97,0.09)] transition-transform duration-150 active:scale-[0.98]"
            onClick={() => nudge(1)}
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden>
              <path
                d="M1 1l7 7-7 7"
                stroke="#000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "mx-auto mt-12 max-w-[1200px] cursor-grab overflow-x-auto overflow-y-hidden select-none [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden",
          dragging && "cursor-grabbing"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          if (dragRef.current) endDrag(e);
          else resume();
        }}
        onPointerEnter={pause}
      >
        <div className="flex w-max gap-6 pr-6">
          {loop.map((t, i) => (
            <TestimonialCard key={`${t.avatar}-${i}`} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}

const footerLinks = [
  { label: "Component", href: "/browse" },
  { label: "Documentation", href: "/docs/installation" },
  { label: "Meet Creator", href: "https://urvish.in" },
  { label: "Become a Sponsor", href: "https://github.com/sponsors/iurvish" },
  { label: "0xUrvish", href: "https://x.com/0xUrvish" },
] as const;

/**
 * Figma 47:687 — wordmark layers over #333 grid:
 * 47:690 glow/outline, 47:692 masked rays; 47:825 hero-texture behind band (47:824).
 */
function LandingFooter() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#232323]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 backdrop-blur-[19px]"
      />
      {/* Same border frame as desktop; gutters tighten on small screens */}
      <div className="relative mx-auto w-full max-w-[1440px] border-x border-b border-[rgba(235,233,230,0.08)] px-5 sm:px-[40px] lg:px-[60px]">
        <div className="border-x border-[rgba(235,233,230,0.08)] px-2 sm:px-8 lg:px-[140px]">
          <div className="relative border-x border-[#333] pt-12 sm:pt-[100px]">
            {/* 47:690 — glow/outline; mobile sits near band bottom; desktop restores Figma frame h */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-[5rem] left-[16.4%] z-[2] aspect-[938/170] w-[67.2%] sm:top-[8.9375rem] sm:left-[16.01%] sm:aspect-auto sm:h-[8.9375rem] sm:w-[68.75%]"
            >
              <div className="absolute inset-[0_-15.6%_-19.23%_-15.57%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/footer/glow.svg"
                  alt=""
                  className="block size-full max-w-none"
                />
              </div>
            </div>

            {/* 47:692 — self-contained SVG: rays @ 25.49° clipped by wordmark paths */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-[5.25rem] left-[6%] z-[3] w-[88%] sm:top-[9.21rem] sm:left-[5.4%] sm:w-[90%]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/footer/wordmark-rays-masked.svg"
                alt=""
                className="block h-auto w-full max-w-none"
              />
            </div>

            <span className="sr-only">useLayouts</span>

            {/* 47:824 band — 47:825 hero-texture at back */}
            <div className="relative -mb-px h-[5rem] overflow-hidden border-y border-[#333] sm:h-[11.75rem]">
              <div
                aria-hidden
                className="pointer-events-none absolute top-[-85%] left-[-8.5%] z-0 h-[356%] w-[115%]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/footer/hero-texture.png"
                  alt=""
                  className="absolute inset-0 size-full max-w-none object-cover object-bottom"
                />
              </div>
            </div>

            {/* Site links — smaller type, not wider gutters */}
            <div className="relative flex min-h-[120px] flex-col items-center justify-center border-b border-[#333] px-2 py-10 sm:min-h-[195px] sm:px-4 sm:py-12">
              <nav
                aria-label="Footer"
                className="flex w-full max-w-[560px] flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-x-8"
              >
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="whitespace-nowrap text-[13px] leading-normal tracking-[-0.02em] text-[#ACAFB9] transition-opacity duration-150 hover:opacity-80 sm:text-[14px] sm:tracking-[-0.03em]"
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex h-[59px] items-center justify-center px-4">
              <p className="text-center text-[14px] leading-[27px] tracking-normal text-[#ACAFB9] sm:tracking-[-0.03em]">
                Copyright © 2026 useLayouts
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0.36px_0.36px_rgba(255,255,255,0.06)]"
      />
    </footer>
  );
}

export default function LandingPage({ heroItems }: { heroItems: BrowseItem[] }) {
  return (
    <main className="min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <LandingNav />
      <HeroSection heroItems={heroItems} />
      <FeaturesSection />
      <WhySection />
      <ToolsSection />
      <TestimonialsSection />
      <LandingFooter />
    </main>
  );
}
