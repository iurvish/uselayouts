"use client";

// PaddingGlobal — structure captured from https://www.roommaster.com/?ref=saaspo.com
// with Element to React on 2026-10-03. Styling is Tailwind utilities.

import { useId } from "react";
import { Fraunces } from "next/font/google";
import { motion } from "motion/react";

const display = Fraunces({ subsets: ["latin"], weight: ["400"], display: "swap" });

/** Photo by Wes Hicks on Unsplash — unsplash.com/photos/T6WRDVQBn8M */
const PHOTO = "https://images.unsplash.com/photo-1702255489644-392758161f1f";
const img = (w: number) => `${PHOTO}?w=${w}&q=80&fm=webp&fit=crop&auto=format`;

const CARD = {
  href: "https://www.roommaster.com/independent-hotels-software",
  label: "Independent Hotels",
  title: "Independent Hotels",
};

/** The label plate. Everything that must match it — the two concave fillers — reads this. */
const PLATE = "#ffffff";

/** Size of the concave corner pieces, and how far the notch corners round off. */
const FILLER = 19.2;
const CORNER_RADIUS = 9;

const CLIP_REST =
  "[clip-path:polygon(0%_0%,87.75%_0%,100%_0%,100%_12.25%,100%_100%,0%_100%)]";

/** Square with a quarter-disc bitten out of the top-right, so the plate's edge
    curves away into the image instead of ending in a right angle. */
function ConcaveCorner() {
  return (
    <svg width={FILLER} height={FILLER} viewBox={`0 0 ${FILLER} ${FILLER}`} aria-hidden="true" className="block">
      <path
        d={`M0 0 V${FILLER} H${FILLER} A${FILLER} ${FILLER} 0 0 1 0 0 Z`}
        fill={PLATE}
      />
    </svg>
  );
}

export default function PaddingGlobal() {
  const rawId = useId();
  const roundId = `round-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <>
      {/* The filter the original markup referenced as url(#round) but never shipped.
          Blur the alpha, then crush it back to opaque: sharp polygon corners come
          out of that round-trip rounded, which is what clip-path alone cannot do. */}
      <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
        <defs>
          <filter id={roundId} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={CORNER_RADIUS} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="not-prose block px-[5%] py-20 text-[17.6px] font-normal leading-[26.4px] text-black antialiased">
        <div className="mx-auto block w-full max-w-[640px]">
          <motion.a
            className="block max-w-full cursor-pointer text-inherit no-underline"
            href={CARD.href}
            aria-label={CARD.label}
            variants={{ hover: { outline: "0px" } }}
            whileHover="hover"
            whileTap={{ outline: "0px" }}
            transition={{ outline: { duration: 0 } }}
          >
            <div className="relative block overflow-hidden">
              <div className="block w-full max-w-[640px]" style={{ filter: `url(#${roundId})` }}>
                <motion.img
                  className={`inline-block h-full w-full max-w-full object-cover align-middle ${CLIP_REST}`}
                  src={img(1080)}
                  srcSet={`${img(500)} 500w, ${img(800)} 800w, ${img(1080)} 1080w, ${img(1600)} 1600w`}
                  sizes="(max-width: 640px) 100vw, 640px"
                  width={640}
                  height={420}
                  loading="lazy"
                  alt=""
                  variants={{
                    hover: {
                      clipPath:
                        "polygon(0% 0%, 87.75% 0%, 87.75% 12.25%, 100% 12.25%, 100% 100%, 0% 100%)",
                    },
                  }}
                  transition={{ clipPath: { duration: 0.4, ease: [0.684, -0.338, 0.193, 1.322] } }}
                />
              </div>

              <div
                className="absolute bottom-0 left-0 flex items-center justify-start gap-3 rounded-tr-2xl py-4 pl-0 pr-4"
                style={{ backgroundColor: PLATE }}
              >
                <h3
                  className={`block text-[24px] leading-[31.2px] tracking-[-0.5px] ${display.className}`}
                  role="heading"
                  aria-level={3}
                >
                  {CARD.title}
                </h3>

                <motion.div
                  className="block"
                  variants={{ hover: { transform: "rotate(45deg)" } }}
                  transition={{ transform: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }}
                >
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    role="img"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="0 0 24 24"
                  >
                    <path fill="currentColor" d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z" />
                  </svg>
                </motion.div>

                <div className="absolute bottom-0 right-[-19.2px] flex h-[19.2px] w-[19.2px] items-center justify-end">
                  <ConcaveCorner />
                </div>
                <div className="absolute left-0 top-[-19.2px] flex h-[19.2px] w-[19.2px] items-center justify-end">
                  <ConcaveCorner />
                </div>
              </div>
            </div>
          </motion.a>
        </div>
      </div>
    </>
  );
}
