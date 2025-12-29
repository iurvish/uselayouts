"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Layout,
  Copy,
  Code2,
  Palette,
  Cpu,
  LayoutGrid,
  BookOpen,
  History,
  Github,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface Benefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

const benefits: Benefit[] = [
  {
    title: "Built on Shadcn UI",
    description:
      "Extending Shadcn with meaningful motion and professional depth.",
    icon: Layout,
  },
  {
    title: "Framer Motion Powered",
    description:
      "Buttery smooth transitions using industry-standard libraries.",
    icon: Zap,
  },
  {
    title: "Copy & Paste Simplicity",
    description: "Copy and paste to give your app a premium feel instantly.",
    icon: Copy,
  },
  {
    title: "Type Inference Ready",
    description:
      "Fully typed with TypeScript for a seamless developer experience.",
    icon: Code2,
  },
  {
    title: "Customizable Aesthetics",
    description:
      "Tweak colors and timings easily with Tailwind and CSS variables.",
    icon: Palette,
  },
  {
    title: "Performance Optimized",
    description: "Lightweight 60FPS animations optimized for performance.",
    icon: Cpu,
  },
];

const dockItems = [
  { id: "components", icon: LayoutGrid, label: "Components" },
  { id: "docs", icon: BookOpen, label: "Docs" },
  { id: "changelog", icon: History, label: "Changelog" },
  { id: "github", icon: Github, label: "GitHub" },
  { id: "help", icon: HelpCircle, label: "Help" },
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
            Built for Motion
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

              <div className="mb-6 p-3.5 rounded-2xl bg-muted/40 group-hover:bg-background/80 group-hover:scale-110 transition-all duration-300 z-10">
                <benefit.icon
                  className="w-7 h-7 text-foreground"
                  strokeWidth={1.5}
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
