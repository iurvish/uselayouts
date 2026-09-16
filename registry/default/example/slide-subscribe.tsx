"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Tick02Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons"
import {
  SlideToUnlock,
  SlideToUnlockHandle,
  SlideToUnlockText,
  SlideToUnlockTrack,
} from "./slide-subscribe-unlock"
import { ShimmeringText } from "./slide-subscribe-shimmer"

interface PricingOption {
  id: string
  title: string
  price: string
  trial: string
  yearlyPrice?: string
}

const pricingOptions: PricingOption[] = [
  {
    id: "pro-yearly",
    title: "Annual",
    price: "$9.99/mo",
    trial: "14-day free trial",
    yearlyPrice: "$89.98/yr",
  },
  {
    id: "pro-monthly",
    title: "Monthly",
    price: "$14.99/mo",
    trial: "7-day free trial",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    price: "Custom",
    trial: "Contact for pricing",
  },
]

export default function SlideSubscribe() {
  const [selected, setSelected] = useState<string>("pro-yearly")
  const [isUnlocked, setIsUnlocked] = useState(false)

  const handleUnlock = () => {
    setIsUnlocked(true)
  }

  return (
    <div className="w-full max-w-[380px] space-y-4">
      {/* Main Selection Container */}
      <div className="relative flex h-[302px] flex-col overflow-hidden rounded-2xl bg-muted/60 p-3 shadow-inner">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div
              key="pricing-list"
              className="flex h-full flex-1 flex-col"
            >
              <div className="relative flex-1 space-y-2">
                {pricingOptions.map((option) => (
                  <PricingCard
                    key={option.id}
                    option={option}
                    isSelected={selected === option.id}
                    onSelect={() => setSelected(option.id)}
                  />
                ))}
              </div>

              {/* Converting Text */}
              <div className="pt-6 pb-2">
                <p className="text-center text-xs font-medium text-zinc-500">
                  Risk-free trial. Cancel anytime with one click.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              className="flex h-full flex-1 flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  delay: 0.2,
                  stiffness: 200,
                  damping: 15,
                }}
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/10"
              >
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="h-8 w-8 stroke-[3]"
                />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">
                  Subscription Active
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Your Pro trial has started. Check your email for next steps.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Area */}
      <div className="h-14">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div
              key="slider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(2px)" }}
              transition={{ duration: 0.3 }}
            >
              <SlideToUnlock
                handleWidth={56}
                onUnlock={handleUnlock}
                className="w-full overflow-hidden rounded-2xl bg-primary p-1 shadow-lg ring-0"
              >
                <SlideToUnlockTrack className="relative h-12">
                  <SlideToUnlockHandle className="z-20 h-12 w-14 rounded-xl bg-white text-primary shadow-md">
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="h-6 w-6"
                    />
                  </SlideToUnlockHandle>

                  <SlideToUnlockText className="-pl-16 z-10 flex items-center justify-center pr-4 text-base text-primary-foreground">
                    {({ isDragging }) => (
                      <ShimmeringText
                        text={
                          isDragging
                            ? "Release to confirm"
                            : "Slide to start trial"
                        }
                        className="font-medium [--color:rgba(255,255,255,0.4)] [--shimmering-color:rgba(255,255,255,1)]"
                      />
                    )}
                  </SlideToUnlockText>
                </SlideToUnlockTrack>
              </SlideToUnlock>
            </motion.div>
          ) : (
            <motion.button
              key="dashboard-button"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                opacity: { duration: 0.3 },
              }}
              onClick={() => setIsUnlocked(false)}
              className={cn(
                "group flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-medium shadow-md",
                "bg-zinc-900 text-white dark:bg-white dark:text-black",
                "[--hover-bg:black] dark:[--hover-bg:#f4f4f5]"
              )}
            >
              <span>Back to Dashboard</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function PricingCard({
  option,
  isSelected,
  onSelect,
}: {
  option: PricingOption
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left transition-all duration-300",
        isSelected
          ? "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]"
          : "hover:bg-card/60"
      )}
    >
      {/* Moving Stroke / Highlight */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            layoutId="pricing-stroke"
            className="pointer-events-none absolute -inset-[1px] z-50 rounded-xl border-[2px] border-primary"
            initial={false}
            transition={{
              type: "spring",
              duration: 0.6,
              bounce: 0.1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Checkmark Circle */}
      <div
        className={cn(
          "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ease-out",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-muted"
        )}
      >
        <AnimatePresence mode="popLayout">
          {isSelected ? (
            <motion.div
              key="checked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring" }}
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                className="h-5 w-5 stroke-[4] will-change-transform"
              />
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-4 w-4"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex-1">
        <div className="mb-0 flex items-baseline justify-between">
          <h3
            className={cn(
              "text-lg font-medium tracking-tight transition-colors duration-300",
              "font-serif",
              isSelected ? "text-foreground" : "text-foreground/90"
            )}
          >
            {option.title}
          </h3>
          <div className="text-right">
            <span className="text-base font-medium tracking-tight text-foreground">
              {option.price}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-normal text-muted-foreground">
            {option.trial}
          </p>
          {option.yearlyPrice && (
            <p className="text-xs font-normal text-muted-foreground">
              {option.yearlyPrice}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
