"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

export default function Testimonial() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const pageVariants = {
    spring: { type: "spring" as const, duration: 0.6 },
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-24 px-4">
      <div className="mb-20 text-center">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Wall of{" "}
          <motion.span
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative cursor-default inline-flex items-center gap-2 px-4 py-1 rounded-2xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 hover:border-primary/20 transition-colors duration-300"
          >
            Love
            <motion.span
              animate={
                isHovered
                  ? {
                      scale: [1, 1.1, 1],
                    }
                  : { scale: 1 }
              }
              transition={{
                duration: 0.7,
                repeat: isHovered ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="inline-block"
            >
              💖
            </motion.span>
          </motion.span>
        </h2>
      </div>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-80 h-52 relative group cursor-pointer mb-12"
      >
        <div
          className="folder-back relative w-[87.5%] mx-auto h-full flex justify-center rounded-xl overflow-visible"
          style={{
            background: "#EBEBEB",
            border: "1px solid #D1D1D1",
          }}
        >
          {[
            {
              initial: { rotate: -3, x: -38, y: 2 },
              open: { rotate: -8, x: -70, y: -75 },
              transition: {
                type: "spring" as const,
                bounce: 0.15,
                stiffness: 160,
                damping: 22,
              },
              className: "z-10",
            },
            {
              initial: { rotate: 0, x: 0, y: 0 },
              open: { rotate: 1, x: 2, y: -95 },
              transition: {
                type: "spring" as const,
                duration: 0.55,
                bounce: 0.12,
                stiffness: 190,
                damping: 24,
              },
              className: "z-20",
            },
            {
              initial: { rotate: 3.5, x: 42, y: 1 },
              open: { rotate: 9, x: 75, y: -80 },
              transition: {
                type: "spring" as const,
                duration: 0.58,
                bounce: 0.17,
                stiffness: 170,
                damping: 21,
              },
              className: "z-10",
            },
          ].map((page, i) => (
            <motion.div
              key={i}
              initial={page.initial}
              animate={isOpen ? page.open : page.initial}
              transition={page.transition}
              className={`absolute top-2 w-32 h-fit rounded-xl shadow-lg ${page.className}`}
            >
              <Page />
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ rotateX: isOpen ? -35 : 0 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="absolute inset-x-0 -bottom-[1px] z-30 h-44 rounded-3xl origin-bottom flex justify-center items-center overflow-visible"
        >
          <div className="relative w-full h-full">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 235 121"
              fill="none"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M104.615 0.350494L33.1297 0.838776C32.7542 0.841362 32.3825 0.881463 32.032 0.918854C31.6754 0.956907 31.3392 0.992086 31.0057 0.992096H31.0047C30.6871 0.99235 30.3673 0.962051 30.0272 0.929596C29.6927 0.897686 29.3384 0.863802 28.9803 0.866119L13.2693 0.967682H13.2527L13.2352 0.969635C13.1239 0.981406 13.0121 0.986674 12.9002 0.986237H9.91388C8.33299 0.958599 6.76052 1.22345 5.27423 1.76651H5.27325C4.33579 2.11246 3.48761 2.66213 2.7879 3.37393L2.49689 3.68839L2.492 3.69424C1.62667 4.73882 1.00023 5.96217 0.656067 7.27725C0.653324 7.28773 0.654065 7.29886 0.652161 7.30948C0.3098 8.62705 0.257231 10.0048 0.499817 11.3446L12.2147 114.399L12.2156 114.411L12.2176 114.423C12.6046 116.568 13.7287 118.508 15.3934 119.902C17.058 121.297 19.1572 122.056 21.3231 122.049V122.05H215.379C217.76 122.02 220.064 121.192 221.926 119.698V119.697C223.657 118.384 224.857 116.485 225.305 114.35L225.307 114.339L235.914 53.3798L235.968 53.1093L235.97 53.0985L235.971 53.0888C236.134 51.8978 236.044 50.685 235.705 49.5321C235.307 48.1669 234.63 46.9005 233.717 45.8144L233.383 45.4296C232.58 44.5553 231.614 43.8449 230.539 43.3398C229.311 42.7628 227.971 42.4685 226.616 42.4774H146.746C144.063 42.4705 141.423 41.8004 139.056 40.5263C136.691 39.2522 134.671 37.4127 133.175 35.1689L113.548 5.05948L113.544 5.05362L113.539 5.04776C112.545 3.65165 111.238 2.51062 109.722 1.72061C108.266 0.886502 106.627 0.422235 104.952 0.365143V0.364166L104.633 0.350494H104.615Z"
                fill="#F2F2F2"
                stroke="#D1D1D1"
                strokeWidth="1.5"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
              <div className="flex gap-11 mb-2.5">
                <div className="w-2.5 h-2.5 bg-neutral-600/40 rounded-full" />
                <div className="w-2.5 h-2.5 bg-neutral-600/40 rounded-full" />
              </div>
              <div className="w-9 h-1 bg-neutral-600/40 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-xl text-foreground tracking-tight">
          Oops..There are no testimonials <br />
          <span className="text-muted-foreground text-lg">
            Be the first one to add a testimonial
          </span>
        </p>
        <div className="flex flex-col items-center gap-4">
          <a
            href="https://twitter.com/intent/tweet?text=Recently%20used%20uselayouts.com%20%5Byour%20experience%5D%20by%20%400xUrvish"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-3 rounded-full border border-dashed border-muted-foreground/30 bg-background hover:border-primary hover:bg-primary/5 transition-all duration-300"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-transform duration-300">
              <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={3} />
            </div>
            <span className="text-md font-medium text-foreground group-hover:text-primary transition-colors">
              Add Testimonial
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

const Page = () => (
  <div className="w-full h-full bg-gradient-to-b from-white to-[#F5F5F7] rounded-xl border border-neutral-200 p-4">
    <div className="flex flex-col gap-2">
      <div className="w-full h-1.5 bg-neutral-100 rounded-full" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="flex-1 h-1.5  bg-neutral-100 rounded-full" />
          <div className="flex-1 h-1.5  bg-neutral-100 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);
