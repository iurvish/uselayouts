"use client";

import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  FlashIcon,
  CopyIcon,
  CodeIcon,
  ColorsIcon,
  CpuIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface Benefit {
  title: string;
  description: string;
  icon: any;
}

const benefits: Benefit[] = [
  {
    title: "Built on Shadcn UI",
    description:
      "Extending Shadcn with meaningful motion and professional depth.",
    icon: DashboardSquare01Icon,
  },
  {
    title: "Framer Motion Powered",
    description:
      "Buttery smooth transitions using industry-standard libraries.",
    icon: FlashIcon,
  },
  {
    title: "Copy & Paste Simplicity",
    description: "Copy and paste to give your app a premium feel instantly.",
    icon: CopyIcon,
  },
  {
    title: "Type Inference Ready",
    description:
      "Fully typed with TypeScript for a seamless developer experience.",
    icon: CodeIcon,
  },
  {
    title: "Customizable Aesthetics",
    description:
      "Tweak colors and timings easily with Tailwind and CSS variables.",
    icon: ColorsIcon,
  },
  {
    title: "Performance Optimized",
    description: "Lightweight 60FPS animations optimized for performance.",
    icon: CpuIcon,
  },
];

export default function ProductBenefits() {
  return (
    <section className="relative w-full py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="h-full w-full opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="tracking-tighter text-balance text-4xl font-medium md:text-5xl lg:text-6xl text-foreground mb-4">
            Built to Ship, Not Just Look Good{" "}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Stop settling for static. Give your UI more life with professional
            animations made for your projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-dashed border-l border-t border-muted-foreground/20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 md:p-8 border-dashed border-r border-b border-muted-foreground/20 flex flex-col items-center text-center group relative overflow-hidden h-full min-h-[200px] sm:min-h-[250px] justify-center"
            >
              <div className="absolute inset-0 bg-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="mb-6 p-3.5 rounded-2xl  group-hover:scale-110 transition-all duration-300 z-10">
                <HugeiconsIcon
                  icon={benefit.icon}
                  className="w-8 h-8 text-foreground"
                  size={32}
                />
              </div>

              <h3 className="text-xl font-medium mb-3 text-foreground transition-colors z-10">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-md z-10 max-w-[300px] sm:max-w-[320px]">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
