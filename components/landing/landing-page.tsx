"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
    badge: "bg-[#879F6C]",
    blob: "bg-[#4B6D4E]",
    tags: ["Hero", "Bento", "Sections", "Grid Stack"],
  },
  {
    title: "Navigation",
    count: "20+",
    badge: "bg-[#2495D1]",
    blob: "bg-[#3D78B6]",
    tags: ["Navbar", "Tabs", "Menu", "Sidebar", "Breadcrumbs"],
  },
  {
    title: "Interactions",
    count: "20+",
    badge: "bg-[#BC6147]",
    blob: "bg-[#A3472E]",
    tags: ["Magnetic Hover", "Cursor reveal", "Marquee"],
  },
  {
    title: "User Interface",
    count: "20+",
    badge: "bg-[#B6547A]",
    blob: "bg-[#9C3A57]",
    tags: ["Cards", "Forms", "Pricing Modal", "Testimonials"],
  },
];

const tools = [
  { name: "React", src: "/landing/tool-react.png" },
  { name: "Next.js", src: "/landing/tool-next.png" },
  { name: "TypeScript", src: "/landing/tool-typescript.png" },
  { name: "Tailwind CSS", src: "/landing/tool-tailwind.png" },
  { name: "Motion", src: null, mark: "M" },
  { name: "Shadcn", src: null, mark: "◆" },
  { name: "Framer", src: "/landing/tool-framer.png" },
  { name: "Webflow", src: "/landing/tool-webflow.png" },
] as const;

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
];

const bentoCards = Array.from({ length: 12 }, (_, i) => i);

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
    <section className="px-4 py-20 sm:px-8 lg:px-[120px] lg:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[461px] space-y-4">
          <h2 className="text-[36px] leading-[1.15] tracking-[-0.04em] text-[#071A31] sm:text-[48px]">
            Everything you need to build the interface.
          </h2>
          <p className="text-[16px] leading-relaxed text-[#4B565E]">
            From foundational layouts to expressive interactions, create
            interfaces that feel considered, not cookie-cutter.
          </p>
        </div>
        <Link
          href="/browse"
          className="text-[16px] font-medium text-[#071A31] underline-offset-4 transition-opacity duration-150 hover:opacity-70 hover:underline"
        >
          Explore full library
        </Link>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1200px] gap-6 md:grid-cols-2">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="relative overflow-hidden rounded-2xl bg-[#F2F3F4] p-4"
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-10 -top-16 size-[280px] rounded-full opacity-50 blur-[70px]",
                cat.blob
              )}
              aria-hidden
            />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <span
                  className={cn(
                    "inline-flex h-[22px] items-center rounded-full px-2 font-[family-name:var(--font-geist-mono)] text-[14px] font-medium tracking-[-0.03em] text-white",
                    cat.badge
                  )}
                >
                  {cat.count}
                </span>
                <h3 className="text-[24px] font-medium tracking-[-0.02em] text-[#071A31]">
                  {cat.title}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5 px-2 pb-2">
                {cat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex h-[31px] items-center rounded-md bg-[#F2F3F4] px-3 font-[family-name:var(--font-geist-mono)] text-[16px] tracking-[-0.03em] text-[#3D464C] shadow-[inset_0_0_0_1px_rgba(226,226,226,1)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section className="relative overflow-hidden bg-[#1B1C1D] px-4 py-24 sm:px-8 lg:px-[120px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: "url(/landing/tool-react.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-[520px] flex-col items-center gap-4 text-center">
        <h2 className="text-[36px] leading-[1.15] tracking-[-0.04em] text-white sm:text-[48px]">
          Fits right into the way you build.
        </h2>
        <p className="max-w-[310px] text-[16px] leading-relaxed text-[#BABABB]">
          Uselayouts works with the tools you already know, so you can ship
          faster.
        </p>
        <ExploreButton className="mt-4" />
      </div>

      <div className="relative z-10 mx-auto mt-16 grid max-w-[720px] grid-cols-2 gap-4 sm:grid-cols-4">
        {tools.map((tool, i) => (
          <div
            key={tool.name}
            className="flex aspect-square flex-col items-center justify-center gap-3 rounded-[10px] bg-[#F9F8F6] p-4 shadow-[inset_0_0_0_1px_#fff,0_1px_3px_rgba(102,102,102,0.1),0_6px_6px_rgba(102,102,102,0.09)]"
            style={{
              transform: `rotate(${[-8, 6, -4, 10, 5, -7, 8, -5][i]}deg)`,
            }}
          >
            {"src" in tool && tool.src ? (
              <Image
                src={tool.src}
                alt={tool.name}
                width={72}
                height={72}
                className="size-[72px] object-contain"
              />
            ) : (
              <div className="flex size-[72px] items-center justify-center rounded-xl bg-[#1B1C1D] text-2xl font-medium text-white">
                {"mark" in tool ? tool.mark : "?"}
              </div>
            )}
            <span className="text-[13px] text-[#071A31]">{tool.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const active = testimonials[index] ?? testimonials[0];

  return (
    <section className="bg-[#F5F3EE] px-4 py-20 sm:px-8 lg:px-[120px] lg:py-24">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="max-w-[470px] text-[36px] leading-[1.15] tracking-[-0.04em] text-[#071A31] sm:text-[48px]">
          Developers are already building with it.
        </h2>
        <div className="flex gap-2.5">
          <button
            type="button"
            aria-label="Previous testimonial"
            className="flex size-[45px] items-center justify-center rounded-full bg-[#F9F8F6] shadow-[inset_0_0_0_1px_#fff,0_1px_1px_rgba(97,97,97,0.09)] transition-transform duration-150 active:scale-[0.98]"
            onClick={() =>
              setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
            }
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
            className="flex size-[45px] items-center justify-center rounded-full bg-[#F9F8F6] shadow-[inset_0_0_0_1px_#fff,0_1px_1px_rgba(97,97,97,0.09)] transition-transform duration-150 active:scale-[0.98]"
            onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
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

      <div className="mx-auto mt-12 max-w-[1200px]">
        <article className="relative max-w-[550px] overflow-hidden rounded-2xl bg-[#1B1C1D] p-6">
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
          <div className="relative mt-28 flex flex-col gap-7">
            <p className="max-w-[404px] text-[16px] leading-relaxed text-white">
              {active.quote}
            </p>
            <div className="h-px w-full bg-[repeating-linear-gradient(to_right,#fff_0_3px,transparent_3px_6px)] opacity-20" />
            <div className="flex items-center gap-4">
              <Image
                src={active.avatar}
                alt=""
                width={41}
                height={41}
                className="size-[41px] rounded-full object-cover"
              />
              <div>
                <p className="text-[16px] text-white">{active.name}</p>
                <p className="text-[14px] text-[#BABABB]">{active.role}</p>
              </div>
            </div>
          </div>
        </article>
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
      <ToolsSection />
      <TestimonialsSection />
    </main>
  );
}
