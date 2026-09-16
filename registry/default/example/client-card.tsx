"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  name: string;
  country: string;
  image?: string;
  service: string;
  amountPaid: number;
  totalAmount: number;
  plan: "Starter" | "Professional" | "Enterprise";
  deadline: Date;
  startDate: Date;
  className?: string;
}

const GRADIENTS = {
  green: { from: "#22c55e", to: "#4ade80" },
  blue: { from: "#dbeafe", to: "#3b82f6" },
  orange: { from: "#ffedd5", to: "#f97316" },
  primary: { from: "#6366f1", to: "#818cf8" },
} as const;

type GradientVariant = keyof typeof GRADIENTS;

const CLIENT_PROFILES = [
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
];

function CircularProgress({
  value,
  size = 28,
  strokeWidth = 3,
  id,
  variant = "primary",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  id: string;
  variant?: GradientVariant;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const colors = GRADIENTS[variant];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        className="h-full w-full -rotate-90 transform"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="transition-all duration-1000 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={`url(#${id})`}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ filter: `drop-shadow(0 0 2px ${colors.from}40)` }}
        />
      </svg>
    </div>
  );
}

export function ClientCard({
  name,
  country,
  image,
  service,
  amountPaid,
  totalAmount,
  deadline,
  startDate,
  className,
}: ClientCardProps) {
  const paymentPercentage = Math.min((amountPaid / totalAmount) * 100, 100);
  const idPrefix = React.useId().replace(/:/g, "");
  const now = new Date();
  const totalTime = deadline.getTime() - startDate.getTime();
  const elapsedTime = now.getTime() - startDate.getTime();
  const timePercentage = Math.min(
    Math.max((elapsedTime / totalTime) * 100, 0),
    100,
  );
  const diffDays = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  const timeLeftLabel =
    diffDays < 0
      ? "Overdue"
      : diffDays === 0
        ? "Today"
        : diffDays < 30
          ? `${diffDays}d left`
          : diffDays < 365
            ? `${Math.floor(diffDays / 30)}mo left`
            : `${(diffDays / 365).toFixed(1)}y left`;

  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="relative flex items-stretch gap-2.5">
      <div className="relative w-16 shrink-0">
        {!isExpanded && (
          <motion.div
            key="sidebar"
            layoutId="wrapper"
            className="z-10 flex h-full w-full flex-col gap-1.5 bg-card p-1 shadow-sm"
            style={{ borderRadius: "14.4px" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
          >
            {CLIENT_PROFILES.slice(0, 3).map((src, idx) => (
              <motion.div
                key={idx}
                layoutId={`profile-${idx}`}
                className="w-14 flex-1 overflow-hidden"
                style={{ borderRadius: "12px" }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              >
                <motion.img
                  layout
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
            {CLIENT_PROFILES.length > 3 && (
              <motion.div
                layoutId="counter"
                className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsExpanded(true);
                }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              >
                +{CLIENT_PROFILES.length - 3}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {isExpanded && (
          <motion.div
            key="expanded"
            layoutId="wrapper"
            className="absolute inset-0 z-30 flex h-full flex-col gap-3 overflow-hidden bg-card p-3 shadow-xl"
            style={{ borderRadius: "14.4px" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              layout="position"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <motion.button
                type="button"
                layout="position"
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Go Back
              </motion.button>
            </motion.div>

            <div className="flex flex-row flex-wrap content-start gap-1.5 overflow-y-auto pr-1">
              {CLIENT_PROFILES.map((src, idx) => (
                <motion.div
                  key={idx}
                  layoutId={`profile-${idx}`}
                  className="z-40 aspect-square w-[54px] shrink-0 overflow-hidden"
                  style={{ borderRadius: "12px" }}
                  transition={{ type: "spring", stiffness: 350, damping: 35 }}
                >
                  <motion.img
                    layout
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "group relative flex h-fit w-80 flex-col justify-between overflow-hidden rounded-2xl bg-card shadow-sm transition-all",
          className,
        )}
      >
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {name}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>{country}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground/90">
            {service}
          </p>
        </div>

        <div className="mt-2 flex items-center gap-4 bg-muted/50 p-4">
          <div className="flex flex-1 items-center justify-center gap-3">
            <CircularProgress
              id={`paid-${idPrefix}`}
              value={paymentPercentage}
              variant="blue"
              size={34}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs leading-none text-muted-foreground">
                Amount Paid
              </span>
              <span className="text-sm text-foreground">
                {Math.round(paymentPercentage)}%
              </span>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="ml-0.5 flex flex-1 items-center justify-start gap-3">
            <CircularProgress
              id={`deadline-${idPrefix}`}
              value={timePercentage}
              variant="orange"
              size={34}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs leading-none text-muted-foreground">
                Deadline
              </span>
              <span className="text-sm text-foreground">{timeLeftLabel}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ClientCardPreview() {
  return (
    <ClientCard
      name="Sarah Jenkins"
      country="United Kingdom"
      image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80"
      service="Social Media Management & Content Strategy"
      amountPaid={4500}
      totalAmount={6000}
      plan="Professional"
      startDate={new Date("2024-01-01")}
      deadline={new Date("2024-06-01")}
    />
  );
}
