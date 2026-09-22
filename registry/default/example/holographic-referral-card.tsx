"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";

const INVITE_BACKGROUND_URL =
  "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg";

export type CardLogo =
  | ReactNode
  | {
      src: string;
      alt: string;
      className?: string;
    };

export type HolographicReferralCardProps = {
  image?: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  logo?: CardLogo;
  logoAlt?: string;
  secondLogo?: CardLogo;
  secondLogoAlt?: string;
  secondLogoHref?: string;
  secondLogoAriaLabel?: string;
  ariaLabel?: string;
  className?: string;
};

const springOptions = {
  stiffness: 260,
  damping: 28,
  mass: 0.7,
};

const DiscountCheckIcon = () => (
  <svg
    aria-hidden="true"
    className="size-16 text-white"
    fill="none"
    focusable="false"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.78"
    viewBox="0 0 24 24"
  >
    <path d="M5 7.2a2.2 2.2 0 0 1 2.2-2.2h1a2.2 2.2 0 0 0 1.55-.64l.7-.7a2.2 2.2 0 0 1 3.12 0l.7.7c.412.41.97.64 1.55.64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58.23 1.138.64 1.55l.7.7a2.2 2.2 0 0 1 0 3.12l-.7.7a2.2 2.2 0 0 0-.64 1.55v1a2.2 2.2 0 0 1-2.2 2.2h-1a2.2 2.2 0 0 0-1.55.64l-.7.7a2.2 2.2 0 0 1-3.12 0l-.7-.7a2.2 2.2 0 0 0-1.55-.64h-1a2.2 2.2 0 0 1-2.2-2.2v-1a2.2 2.2 0 0 0-.64-1.55l-.7-.7a2.2 2.2 0 0 1 0-3.12l.7-.7A2.2 2.2 0 0 0 5 8.2v-1" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CometLogo = () => (
  <svg
    aria-hidden="true"
    className="size-7"
    focusable="false"
    viewBox="0 0 168 125.6"
  >
    <path
      clipRule="evenodd"
      d="m95 34.7h-33c-0.4 0.2-6.7 0.6-7.5 7.6 0.5 7.2 6.3 8.7 7.4 8.8h16.5l0.1 0.1v0.1c6.7 0.5 10.7 5.3 11 10.8 0.1 6.5-4.8 12.3-10.8 13.2h-17.1v0.1c-2.2 0.3-5.7 1.8-7 6-0.7 4 1.3 8.8 6.8 9.7l0.4 0.1h32.6v-6.6h-31.7c-0.7-0.1-1.6-0.5-1.5-1.8 0-0.8 0.5-1.5 1.6-1.5h32.6l0.8-0.1c3.4 0 11.5-2 15-8.8 1.4-2.5 2.3-5.2 2.3-8.9-0.1-10.1-7.6-17.4-17-18.7h-33.7c-0.8-0.1-1.6-0.5-1.6-1.8 0-1.1 0.8-1.7 1.8-1.7h31.3m1.2 34h-4.4c2.6-2.8 4.5-6.7 4.6-11.7 0-4.7-1.8-9.1-4.6-12.4h4.4v0.1c6.1 0.3 11.4 4.9 11.4 12 0 6.2-4.6 11.5-11.4 12z"
      fill="#FBBDA3"
      fillRule="evenodd"
    />
  </svg>
);

const PassNumber = () => (
  <span className="font-serif text-base leading-none text-white/50">01</span>
);

const isImageLogo = (
  logo: CardLogo
): logo is { src: string; alt: string; className?: string } => {
  return typeof logo === "object" && logo !== null && "src" in logo;
};

const renderLogo = (logo: CardLogo, className: string, fallbackAlt: string) => {
  if (typeof logo === "string") {
    return (
      // oxlint-disable-next-line next/no-img-element
      <img alt={fallbackAlt} className={className} loading="lazy" src={logo} />
    );
  }

  if (isImageLogo(logo)) {
    return (
      // oxlint-disable-next-line next/no-img-element
      <img
        alt={logo.alt}
        className={cn(className, logo.className)}
        loading="lazy"
        src={logo.src}
      />
    );
  }

  return logo;
};

export function HolographicReferralCard({
  image = INVITE_BACKGROUND_URL,
  imageAlt = "Invite background",
  title = "Comet",
  description = "Admit One",
  logo = <CometLogo />,
  logoAlt = "Comet avatar",
  secondLogo = <PassNumber />,
  secondLogoAlt = "Pass number",
  secondLogoHref,
  secondLogoAriaLabel,
  ariaLabel = "Comet invite card",
  className,
}: HolographicReferralCardProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const rotateX = useSpring(useMotionValue(0), springOptions);
  const rotateY = useSpring(useMotionValue(0), springOptions);
  const translateZ = useSpring(useMotionValue(0), springOptions);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowOpacity = useSpring(useMotionValue(0), {
    stiffness: 260,
    damping: 30,
  });
  const cardTransform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.9) 10%, rgba(255,255,255,0.75) 20%, rgba(255,255,255,0) 80%)`;

  const secondLogoContent = renderLogo(
    secondLogo,
    "size-5 object-contain text-white",
    secondLogoAlt
  );

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;
    const xProgress = pointerX / bounds.width;
    const yProgress = pointerY / bounds.height;

    glowX.set(xProgress * 100);
    glowY.set(yProgress * 100);
    glowOpacity.set(1);

    if (shouldReduceMotion) {
      return;
    }

    rotateX.set((yProgress - 0.5) * 20);
    rotateY.set((xProgress - 0.5) * -20);
    translateZ.set(20);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    glowOpacity.set(1);
    if (shouldReduceMotion) {
      return;
    }

    translateZ.set(20);
  };

  const handlePointerLeave = () => {
    glowOpacity.set(0);
    rotateX.set(0);
    rotateY.set(0);
    translateZ.set(0);
    glowX.set(50);
    glowY.set(50);
  };

  const handleFocus = () => {
    glowOpacity.set(0.8);
  };

  const handleBlur = () => {
    handlePointerLeave();
  };

  return (
    <div
      className={cn(
        "w-[min(100vw-2rem,375px)] p-5 [perspective:1000px]",
        className
      )}
    >
      <motion.article
        aria-label={ariaLabel}
        className={cn(
          "relative flex w-full flex-col rounded-2xl bg-[#1f2121] p-2 text-left will-change-transform saturate-0 outline-none md:p-4",
          "shadow-[0_520px_146px_rgba(0,0,0,0.01),0_333px_133px_rgba(0,0,0,0.04),0_83px_83px_rgba(0,0,0,0.26),0_21px_46px_rgba(0,0,0,0.29)]",
          "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f2121]"
        )}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        style={{ transform: shouldReduceMotion ? "none" : cardTransform }}
        tabIndex={0}
      >
        <div className="mb-2 flex shrink-0 items-center justify-between p-2">
          {renderLogo(logo, "size-7 rounded-full object-cover", logoAlt)}
          {secondLogoHref ? (
            <a
              aria-label={secondLogoAriaLabel}
              className="rounded-sm outline-none transition-opacity duration-200 ease focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f2121] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-80"
              href={secondLogoHref}
              rel="noreferrer"
              target="_blank"
            >
              {secondLogoContent}
            </a>
          ) : (
            secondLogoContent
          )}
        </div>

        <div className="mx-2 flex-1">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
            {/* oxlint-disable-next-line next/no-img-element */}
            <img
              alt={imageAlt}
              className="absolute inset-0 size-full bg-black object-cover shadow-[0_5px_6px_rgba(0,0,0,0.05)] contrast-75"
              loading="lazy"
              src={image}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <DiscountCheckIcon />
            </div>
          </div>
        </div>

        <div className="mt-2 flex shrink-0 items-center justify-between p-2 text-xs text-white">
          <span className="truncate uppercase">{title}</span>
          <span className="truncate pl-3 font-serif text-base leading-none text-white/50">
            {description}
          </span>
        </div>

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-overlay"
          style={{ background: glowBackground, opacity: glowOpacity }}
        />
      </motion.article>
    </div>
  );
}

export default HolographicReferralCard;
