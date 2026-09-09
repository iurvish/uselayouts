"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const avatars = [
  "/landing/avatar-1.png",
  "/landing/avatar-2.png",
  "/landing/avatar-3.png",
  "/landing/avatar-4.png",
];

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[min(720px,calc(100svh-48px))] overflow-hidden rounded-[10px]">
      <Image
        src="/landing/hero-bg.png"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(7,26,49,0.4) 0%, rgba(7,26,49,0.16) 48%, transparent 100%)",
        }}
      />
      <div className="relative z-10 flex h-full max-w-[480px] flex-col p-10 lg:p-12">{children}</div>
    </div>
  );
}

function Copy() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-balance text-[40px] leading-[1.15] tracking-[-0.04em] text-white sm:text-[48px]">
        Build interfaces that feel as good as they look.
      </h1>
      <p className="text-pretty text-[15px] leading-relaxed text-white/80">
        Beautiful, interactive React components built to help you ship polished interfaces.
      </p>
    </div>
  );
}

/** Crisp gel stack: top highlight + bottom inset + short drop (low blur) + optional tint. */
function gelShadow(tint = "7,26,49") {
  return [
    "inset 0 1px 0 rgba(255,255,255,0.55)",
    "inset 0 -1px 0 rgba(0,0,0,0.22)",
    "0 1px 0 rgba(255,255,255,0.12)",
    `0 2px 0 rgba(${tint},0.18)`,
    `0 6px 10px rgba(${tint},0.22)`,
  ].join(", ");
}

function Avatars({ className }: { className?: string }) {
  return (
    <div className={cn("flex", className)}>
      {avatars.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          width={45}
          height={45}
          className={cn("size-[45px] rounded-full object-cover ring-2 ring-white", i > 0 && "-ml-3")}
        />
      ))}
    </div>
  );
}

/** 1 — Navy gel CTA; trusted avatars pulse every 5s. */
export function NavyPulse() {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 5000);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <Stage>
      <div className="flex flex-col gap-8">
        <Copy />
        <Link
          href="/browse"
          className="inline-flex h-[48px] w-fit items-center rounded-full bg-[#071A31] px-5 text-[16px] font-medium text-white transition-transform duration-150 ease-out active:scale-[0.97]"
          style={{
            backgroundImage: "linear-gradient(180deg, #0d2a4a 0%, #071A31 55%, #051221 100%)",
            boxShadow: gelShadow("7,26,49"),
          }}
        >
          Explore Components
        </Link>
      </div>
      <div className="mt-auto flex items-center gap-3">
        <div className="flex">
          {avatars.map((src, i) => (
            <motion.div
              key={`${src}-${tick}`}
              initial={reduce ? false : { scale: 0.92, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={cn(i > 0 && "-ml-3")}
            >
              <Image
                src={src}
                alt=""
                width={45}
                height={45}
                className="size-[45px] rounded-full object-cover ring-2 ring-white"
              />
            </motion.div>
          ))}
        </div>
        <p className="font-[family-name:var(--font-geist-mono)] text-[16px] leading-tight tracking-[-0.03em] text-white">
          Trusted by 100+
          <br />
          Developers
        </p>
      </div>
    </Stage>
  );
}

/** 2 — White porcelain gel (Figma CTA); trusted lifts on hover. */
export function PorcelainHover() {
  return (
    <Stage>
      <div className="flex flex-col gap-8">
        <Copy />
        <Link
          href="/browse"
          className="inline-flex h-[48px] w-fit items-center rounded-full bg-white px-5 text-[16px] font-medium text-[#071A31] transition-transform duration-150 ease-out active:scale-[0.97]"
          style={{
            backgroundImage: "linear-gradient(180deg, #ffffff 0%, #f3f5f8 100%)",
            boxShadow: [
              "inset 0 1px 0 #fff",
              "inset 0 -1px 0 rgba(7,26,49,0.08)",
              "0 2px 0 rgba(7,26,49,0.06)",
              "0 8px 12px rgba(7,26,49,0.14)",
            ].join(", "),
          }}
        >
          Explore Components
        </Link>
      </div>
      <div className="group mt-auto flex w-fit items-center gap-3 rounded-2xl py-1 pr-2 transition-transform duration-150 ease-out hover:-translate-y-0.5">
        <div className="flex">
          {avatars.map((src, i) => (
            <div
              key={src}
              className={cn(
                "transition-transform duration-200 ease-out group-hover:-translate-y-1",
                i > 0 && "-ml-3",
              )}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <Image
                src={src}
                alt=""
                width={45}
                height={45}
                className="size-[45px] rounded-full object-cover ring-2 ring-white"
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
    </Stage>
  );
}

/** 3 — Sky gel + tinted crisp drop; trusted count ticks every 5s. */
export function SkyTicker() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(100);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setCount((c) => (c >= 128 ? 100 : c + 1));
    }, 5000);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <Stage>
      <div className="flex flex-col gap-8">
        <Copy />
        <Link
          href="/browse"
          className="inline-flex h-[48px] w-fit items-center rounded-full px-5 text-[16px] font-medium text-white transition-transform duration-150 ease-out active:scale-[0.97]"
          style={{
            backgroundImage: "linear-gradient(180deg, #4da3e6 0%, #1f7cc4 55%, #1866a3 100%)",
            boxShadow: gelShadow("31,124,196"),
          }}
        >
          Explore Components
        </Link>
      </div>
      <div className="mt-auto flex items-center gap-3">
        <Avatars />
        <p className="font-[family-name:var(--font-geist-mono)] text-[16px] leading-tight tracking-[-0.03em] text-white">
          Trusted by{" "}
          <motion.span
            key={count}
            initial={reduce ? false : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block tabular-nums"
          >
            {count}+
          </motion.span>
          <br />
          Developers
        </p>
      </div>
    </Stage>
  );
}

/** 4 — Mint inset well (toggle ref); trusted ring sweeps every 5s. */
export function MintRing() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % avatars.length), 5000);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <Stage>
      <div className="flex flex-col gap-8">
        <Copy />
        <Link
          href="/browse"
          className="inline-flex h-[48px] w-fit items-center rounded-full px-5 text-[16px] font-semibold text-[#0b3d2c] transition-transform duration-150 ease-out active:scale-[0.97]"
          style={{
            backgroundImage: "linear-gradient(180deg, #b8ffd6 0%, #7dffb5 45%, #5ae89a 100%)",
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.7)",
              "inset 0 -2px 0 rgba(11,61,44,0.18)",
              "0 0 0 1px rgba(11,61,44,0.12)",
              "0 3px 0 rgba(11,61,44,0.16)",
              "0 8px 10px rgba(11,61,44,0.18)",
            ].join(", "),
          }}
        >
          Explore Components
        </Link>
      </div>
      <div className="mt-auto flex items-center gap-3">
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
    </Stage>
  );
}

/**
 * 5 — Combo craft: all four depth moves on one CTA
 * (top inset highlight, bottom inset shade, hairline rim, crisp low-blur drop).
 * Plus secondary (porcelain) + outline siblings. Trusted: mint ring sweep.
 */
export function ComboCraft() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % avatars.length), 5000);
    return () => window.clearInterval(id);
  }, [reduce]);

  const primaryShadow = [
    "inset 0 1.5px 0 rgba(255,255,255,0.28)",
    "inset 0 -2px 0 rgba(0,0,0,0.45)",
    "inset 0 0 0 1px rgba(255,255,255,0.06)",
    "0 1px 0 rgba(255,255,255,0.1)",
    "0 3px 0 rgba(0,0,0,0.25)",
    "0 8px 12px rgba(7,26,49,0.35)",
  ].join(", ");

  const secondaryShadow = [
    "inset 0 1.5px 0 #fff",
    "inset 0 -2px 0 rgba(7,26,49,0.1)",
    "inset 0 0 0 1px rgba(7,26,49,0.06)",
    "0 1px 0 rgba(255,255,255,0.8)",
    "0 3px 0 rgba(7,26,49,0.08)",
    "0 8px 12px rgba(7,26,49,0.14)",
  ].join(", ");

  const outlineShadow = [
    "inset 0 1px 0 rgba(255,255,255,0.45)",
    "inset 0 -1px 0 rgba(0,0,0,0.12)",
    "inset 0 0 0 1.5px rgba(255,255,255,0.55)",
    "0 1px 0 rgba(255,255,255,0.12)",
    "0 4px 8px rgba(0,0,0,0.12)",
  ].join(", ");

  return (
    <Stage>
      <div className="flex flex-col gap-8">
        <Copy />
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/browse"
            className="inline-flex h-[50px] w-fit items-center rounded-full px-5 text-[16px] font-medium text-white transition-transform duration-150 ease-out active:scale-[0.97]"
            style={{
              backgroundImage: "linear-gradient(180deg, #1a3558 0%, #071A31 48%, #040e1a 100%)",
              boxShadow: primaryShadow,
            }}
          >
            Primary
          </Link>
          <Link
            href="/browse"
            className="inline-flex h-[50px] w-fit items-center rounded-full px-5 text-[16px] font-medium text-[#071A31] transition-transform duration-150 ease-out active:scale-[0.97]"
            style={{
              backgroundImage: "linear-gradient(180deg, #ffffff 0%, #f3f5f8 100%)",
              boxShadow: secondaryShadow,
            }}
          >
            Secondary
          </Link>
          <Link
            href="/browse"
            className="inline-flex h-[50px] w-fit items-center rounded-full px-5 text-[16px] font-medium text-white transition-transform duration-150 ease-out active:scale-[0.97]"
            style={{ boxShadow: outlineShadow }}
          >
            Outline
          </Link>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-3">
        <div className="flex">
          {avatars.map((src, i) => (
            <div key={src} className={cn("relative", i > 0 && "-ml-3")}>
              {i === active && !reduce ? (
                <motion.span
                  layoutId="trusted-ring-combo"
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
    </Stage>
  );
}
