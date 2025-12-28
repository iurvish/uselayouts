"use client";

import {
  Add01Icon,
  MinusPlus01Icon,
  Tick02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const plans = [
  {
    id: "plus",
    name: "Plus",
    description: "for Individuals",
    monthlyPrice: 8.99,
    yearlyPrice: 6.99,
    features: [
      "1TB of Space",
      "30 days of file recovery",
      "256-bit AES and SSL/TLS",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    description: "for Teams",
    monthlyPrice: 12.99,
    yearlyPrice: 9.99,
    features: [
      "1TB of Space",
      "30 days of file recovery",
      "256-bit AES and SSL/TLS",
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "for Teams",
    monthlyPrice: 24.99,
    yearlyPrice: 19.99,
    features: [
      "1TB of Space",
      "30 days of file recovery",
      "256-bit AES and SSL/TLS",
    ],
  },
];

const TRANSITION = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
};

function PricingCard() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [userCount, setUserCount] = useState(3);

  return (
    <div className="w-full max-w-[440px] flex flex-col gap-6 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border bg-muted/30 shadow-sm transition-colors duration-300">
      <div className="flex flex-col gap-4 mb-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Select a Plan
        </h1>

        <div className="bg-muted p-1 h-10 w-full rounded-xl ring-1 ring-border flex">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`flex-1 h-full rounded-lg text-sm font-bold relative transition-colors duration-300 ${
              billingCycle === "monthly"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {billingCycle === "monthly" && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-background rounded-lg shadow-sm ring-1 ring-border"
                transition={TRANSITION}
              />
            )}
            <span className="relative z-10">Monthly</span>
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`flex-1 h-full rounded-lg text-sm font-bold relative transition-colors duration-300 flex items-center justify-center gap-2 ${
              billingCycle === "yearly"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {billingCycle === "yearly" && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-background rounded-lg shadow-sm ring-1 ring-border"
                transition={TRANSITION}
              />
            )}
            <span className="relative z-10">Yearly</span>
            <span className="relative z-10 bg-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase text-white tracking-tight whitespace-nowrap">
              20% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Plans List */}
      <div className="flex flex-col gap-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const price =
            billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

          return (
            <motion.div
              layout
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              animate={{
                boxShadow: isSelected
                  ? "0 4px 12px -2px rgba(0,0,0,0.1)"
                  : "0 0 0 0 rgba(0,0,0,0)",
              }}
              transition={{
                layout: TRANSITION,
              }}
              className={`relative cursor-pointer rounded-[1.75rem] border-2 bg-card transition-all duration-300 ${
                isSelected
                  ? "border-foreground shadow-xl z-20"
                  : "border-transparent hover:border-foreground/10 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="p-5">
                {/* Plan Info Header */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    {/* Radio Icon */}
                    <div className="mt-1 shrink-0">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? "border-primary"
                            : "border-muted-foreground/15"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-3.5 h-3.5 rounded-full bg-primary"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {plan.name}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground/60">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">
                      <NumberFlow
                        value={price}
                        format={{ style: "currency", currency: "USD" }}
                      />
                    </div>
                    <div className="text-[9px] mt-0.5 font-bold text-muted-foreground/30 flex items-center justify-end gap-1 uppercase tracking-widest">
                      <span>User</span>
                      <span className="opacity-40 font-normal">|</span>
                      <span>Month</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      className="overflow-hidden w-full"
                    >
                      <div className="pt-6 flex flex-col gap-6">
                        <div className="flex flex-col gap-3.5">
                          {plan.features.map((feature, idx) => (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: idx * 0.05,
                                duration: 0.3,
                              }}
                              key={idx}
                              className="flex items-center gap-3 text-sm text-foreground/80 font-semibold"
                            >
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={16}
                                className="text-primary"
                              />
                              {feature}
                            </motion.div>
                          ))}
                        </div>

                        <div className="h-px bg-muted" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted shrink-0 flex items-center justify-center">
                              <HugeiconsIcon
                                icon={UserGroupIcon}
                                size={18}
                                className="text-muted-foreground/60"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[15px] font-bold text-foreground leading-none">
                                Users
                              </span>
                              <span className="text-[10px] text-muted-foreground/50 font-semibold mt-1">
                                Starting at {userCount} users
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 bg-muted p-1.5 rounded-xl border border-border">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserCount(Math.max(1, userCount - 1));
                              }}
                              className="p-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all text-muted-foreground/60 hover:text-foreground active:scale-95"
                            >
                              <HugeiconsIcon icon={MinusPlus01Icon} size={14} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center tabular-nums text-foreground/80">
                              <NumberFlow value={userCount} />
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserCount(userCount + 1);
                              }}
                              className="p-1.5 rounded-lg hover:bg-background hover:shadow-sm transition-all text-muted-foreground/60 hover:text-foreground active:scale-95"
                            >
                              <HugeiconsIcon icon={Add01Icon} size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default PricingCard;
