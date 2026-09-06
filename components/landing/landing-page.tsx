"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
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
  "Framer",
  "Webflow",
] as const;

/** Angles from Figma 1:732 (0° = top, clockwise). Radius 44.4% of 1000px orbit. */
const orbitTools = [
  { name: "Webflow", src: "/landing/tool-webflow.png", angle: 0 },
  { name: "TypeScript", src: "/landing/tool-typescript.png", angle: 30 },
  { name: "Next.js", src: "/landing/tool-next.png", angle: 60 },
  { name: "React", src: "/landing/tool-react.png", angle: 90 },
  { name: "Framer", src: "/landing/tool-framer.png", angle: -30 },
  { name: "Motion", src: "/landing/tool-motion.png", angle: -60 },
  { name: "Tailwind CSS", src: "/landing/tool-tailwind.png", angle: -90 },
] as const;

const ORBIT_RADIUS_PCT = 44.4;
/** Card spacing on the Figma arc — one slot per tick. */
const ORBIT_SLOT_DEG = 30;
const ORBIT_STEP_MS = 2000;
const ORBIT_MOVE_MS = 280;

const orbitCardShadow =
  "inset 0 0 0 1px #fff, 0 1px 3px rgba(102,102,102,0.1), 0 6px 6px rgba(102,102,102,0.09), 0 13px 8px rgba(102,102,102,0.05), 0 23px 9px rgba(102,102,102,0.01)";

const pillShadow =
  "0px 0px 1px 0px rgba(97,97,97,0.1), 0px 1px 1px 0px rgba(97,97,97,0.09), 0px 3px 2px 0px rgba(97,97,97,0.05), 0px 4px 2px 0px rgba(97,97,97,0.01), 0px 7px 2px 0px rgba(97,97,97,0)";

/** Cream page dots — larger than Figma 1px/18px so the grid reads on screen */
const landingDotPattern = {
  backgroundColor: "#F5F3EE",
  backgroundImage: "radial-gradient(circle, #EDEAE3 2px, transparent 2px)",
  backgroundSize: "22px 22px",
} as const;

const orbitMask =
  "linear-gradient(180deg, #d9d9d9 48%, rgba(217,217,217,0.45) 68%, transparent 86%)";

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

const bentoCards = Array.from({ length: 12 }, (_, i) => i);

const WHY_INTERVAL_MS = 6000;

const whyFeatures = [
  {
    title: "Copy. Customize. Ship.",
    description:
      "Start with production-ready components and make them your own. No locked-down abstractions. No fighting the library.",
    image: "/landing/why-media.png",
  },
  {
    title: "Motion that means something.",
    description:
      "Every animation is purposeful — feedback, focus, and flow — not decoration for its own sake.",
    image: "/landing/card-interactions.png",
  },
  {
    title: "Built to be changed.",
    description:
      "Clean, editable source you own. Swap tokens, restyle freely, and keep shipping without fighting abstractions.",
    image: "/landing/card-layouts.png",
  },
  {
    title: "Skip the blank canvas.",
    description:
      "Start from patterns that already work. Less scaffolding, more product — from first commit to polished UI.",
    image: "/landing/card-navigation.png",
  },
] as const;

const whyActiveLine =
  "linear-gradient(in oklab 179.04deg, oklab(43.6% -0.034 -0.138) -260%, oklab(53% 0.114 0.016) 225.3%, oklab(86.5% 0.053 0.047) 720%)";

function ExploreButton({
  className,
  href = "/browse",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-[45px] items-center justify-center rounded-full bg-[#071A31] px-3.5 text-[16px] font-medium text-white transition-transform duration-150 ease-out active:scale-[0.98]",
        className
      )}
    >
      Explore Components
    </Link>
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
        <ExploreButton className="hidden sm:inline-flex" />
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-10 items-center justify-center rounded-full text-[#071A31] lg:hidden"
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
              className="text-[15px] text-[#071A31]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <ExploreButton className="w-full sm:hidden" />
        </div>
      ) : null}
    </header>
  );
}

function HeroBento() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] overflow-hidden md:block"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 66% 66% at 60% 39%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
          maskImage:
            "radial-gradient(ellipse 66% 66% at 60% 39%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div className="absolute left-0 top-[-20%] grid w-[120%] grid-cols-3 gap-3">
          {bentoCards.map((i) => (
            <div
              key={i}
              className="flex flex-col gap-1.5 rounded-xl bg-white/20 p-1.5 backdrop-blur-[2px]"
            >
              <div className="px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[13px] text-white/90">
                Bento Card
              </div>
              <div className="aspect-[326/274] rounded-[10px] bg-white" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="px-4 pb-4 sm:px-4 lg:px-4">
      <div className="relative min-h-[min(814px,calc(100svh-86px))] overflow-hidden rounded-[10px] bg-white">
        <Image
          src="/landing/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#071A31]/25" />
        <HeroBento />

        <div className="relative z-10 flex max-w-[410px] flex-col gap-8 p-6 sm:p-10 lg:p-12">
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

          <div className="flex items-center gap-3">
            <div className="flex">
              {avatars.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={45}
                  height={45}
                  className={cn(
                    "size-[45px] rounded-full object-cover ring-2 ring-white",
                    i > 0 && "-ml-3"
                  )}
                />
              ))}
            </div>
            <p className="font-[family-name:var(--font-geist-mono)] text-[16px] leading-tight tracking-[-0.03em] text-white">
              Trusted by 100+
              <br />
              Developers
            </p>
          </div>
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
          <Link
            href="/browse"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#071A31] px-3.5 py-3 text-[16px] font-medium leading-5 text-white transition-transform duration-150 ease-out active:scale-[0.98]"
          >
            Explore full library
          </Link>
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

function WhySection() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % whyFeatures.length);
      setCycle((c) => c + 1);
    }, WHY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [cycle]);

  const select = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
  };

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
                  className="flex w-full cursor-pointer flex-col gap-8 text-left transition-colors duration-150"
                  onClick={() => select(i)}
                >
                  <div className="flex flex-col gap-4">
                    <span
                      className={cn(
                        "text-[20px] font-medium leading-6 tracking-[-0.02em] transition-colors duration-150",
                        isActive ? "text-white" : "text-[#9F9F9F]"
                      )}
                    >
                      {feature.title}
                    </span>
                    {isActive ? (
                      <p className="landing-why-fade max-w-[459px] text-[16px] leading-[1.5] text-white/80">
                        {feature.description}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className="relative h-0.5 w-full overflow-hidden bg-[#3C3C3C]"
                    aria-hidden
                  >
                    {isActive ? (
                      <span
                        key={cycle}
                        className="landing-why-progress absolute inset-y-0 left-0 h-full"
                        style={{
                          backgroundImage: whyActiveLine,
                          animation: `landing-why-progress ${WHY_INTERVAL_MS}ms linear forwards, landing-why-fade 220ms var(--ease-out) both`,
                        }}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative h-[280px] w-full overflow-hidden rounded-2xl bg-[#0A1739] sm:h-[360px] lg:h-[400px] lg:w-[588px] lg:shrink-0">
            <Image
              key={whyFeatures[active].image}
              src={whyFeatures[active].image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 588px"
              className="landing-why-fade object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolsOrbit() {
  const [offsetDeg, setOffsetDeg] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const id = window.setInterval(
      () => setOffsetDeg((d) => d + ORBIT_SLOT_DEG),
      ORBIT_STEP_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `rotate(${offsetDeg}deg)`,
        transition: `transform ${ORBIT_MOVE_MS}ms ease-out`,
      }}
    >
      {orbitTools.map((tool) => {
        const rad = (tool.angle * Math.PI) / 180;
        const x = 50 + Math.sin(rad) * ORBIT_RADIUS_PCT;
        const y = 50 - Math.cos(rad) * ORBIT_RADIUS_PCT;
        return (
          <div
            key={tool.name}
            className="absolute"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
              <div
                className="size-[96px] overflow-hidden rounded-[10px] bg-[#F9F8F6] lg:size-[112px]"
                style={{
                  boxShadow: orbitCardShadow,
                  transform: `rotate(${-offsetDeg}deg)`,
                  transition: `transform ${ORBIT_MOVE_MS}ms ease-out`,
                }}
              >
                <Image
                  src={tool.src}
                  alt=""
                  width={112}
                  height={112}
                  className="size-full object-contain p-[12%] sm:p-[14%]"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ToolsSection() {
  return (
    <section
      className="relative overflow-x-hidden px-4 py-16 sm:px-8 sm:py-20 lg:px-[120px] lg:py-[100px]"
      style={landingDotPattern}
    >
      {/* Figma 1:732 — orbit inset by ~half-card so rim logos aren't clipped;
          frame < square height; bottom fades via mask.
          Mobile: oversized orbit clipped in this frame so rim cards clear copy. */}
      <div className="relative mx-auto flex min-h-[520px] w-full max-w-[1000px] items-center justify-center overflow-hidden pt-9 sm:min-h-[640px] sm:pt-12 lg:min-h-[783px] lg:pt-14">
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute inset-x-0 top-9 flex justify-center sm:top-12 sm:px-12 lg:top-14 lg:px-14 max-sm:top-6">
            <div
              className="relative aspect-square w-full max-sm:w-[165%] sm:w-full"
              style={{ WebkitMaskImage: orbitMask, maskImage: orbitMask }}
            >
              <ToolsOrbit />
            </div>
          </div>
        </div>

        {/* gap 32px groups, 16px title↔subtitle — Figma 1:757 */}
        <div className="relative z-10 flex w-full flex-col items-center gap-8">
          <div className="flex w-full max-w-[378px] flex-col items-center gap-4 text-center">
            <h2 className="text-balance text-[36px] leading-[1.15] tracking-[-0.04em] text-[#071A31] sm:text-[48px]">
              Fits right into the way you build.
            </h2>
            <p className="max-w-[310px] text-[16px] leading-[1.5] text-[#4B565E]">
              Uselayouts works with the tools you already know, so you can ship
              faster.
            </p>
          </div>

          <div className="relative w-full max-w-[616px] overflow-hidden px-1 sm:px-0">
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

          <ExploreButton />
        </div>
      </div>
    </section>
  );
}

const testimonialCardShadow =
  "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.12), 0 24px 48px rgba(0,0,0,0.08)";

function TestimonialCard({
  quote,
  name,
  role,
  avatar,
}: (typeof testimonials)[number]) {
  return (
    <article
      className="relative flex min-h-[380px] w-[min(calc(100vw-2rem),550px)] shrink-0 flex-col overflow-hidden rounded-2xl bg-[#1B1C1D] p-6"
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
      <div className="relative mt-28 flex flex-1 flex-col justify-between gap-7">
        <p className="max-w-[404px] text-[16px] leading-[1.5] text-white">
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

      {/* Intentional carousel peek: clip to content column, show next card edge */}
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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <WhySection />
      <ToolsSection />
      <TestimonialsSection />
    </main>
  );
}
