"use client"

import React, { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
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

const easeOut = [0.32, 0.72, 0, 1] as const

export default function SlideSubscribe() {
  const [selected, setSelected] = useState<string>("pro-yearly")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const reduce = useReducedMotion() ?? false

  return (
    <div className="w-full max-w-[380px] space-y-4">
      <div className="relative flex h-[302px] flex-col overflow-hidden rounded-2xl bg-muted/60 p-3 shadow-inner">
        <AnimatePresence mode="wait" initial={false}>
          {!isUnlocked ? (
            <motion.div
              key="pricing-list"
              className="flex h-full flex-1 flex-col"
              exit={
                reduce
                  ? undefined
                  : {
                      opacity: 0,
                      y: -8,
                      filter: "blur(2px)",
                      transition: { duration: 0.14, ease: "easeIn" },
                    }
              }
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

              <div className="pt-6 pb-2">
                <p className="text-center text-xs font-medium text-muted-foreground">
                  Risk-free trial. Cancel anytime with one click.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              className="flex h-full flex-1 flex-col items-center justify-center p-6 text-center"
              initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.22, ease: easeOut }}
            >
              <motion.div
                initial={
                  reduce ? false : { scale: 0.3, opacity: 0, filter: "blur(3px)" }
                }
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg will-change-transform"
              >
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="size-8 stroke-[3]"
                />
              </motion.div>
              <div className="space-y-2">
                <motion.h3
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: reduce ? 0 : 0.08, ease: easeOut }}
                  className="text-xl font-medium tracking-tight text-balance text-foreground"
                >
                  Subscription Active
                </motion.h3>
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: reduce ? 0 : 0.16, ease: easeOut }}
                  className="text-sm text-pretty text-muted-foreground"
                >
                  Your Pro trial has started. Check your email for next steps.
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-14">
        <AnimatePresence mode="wait" initial={false}>
          {!isUnlocked ? (
            <motion.div
              key="slider"
              exit={
                reduce
                  ? undefined
                  : {
                      opacity: 0,
                      y: -8,
                      filter: "blur(2px)",
                      transition: { duration: 0.14, ease: "easeIn" },
                    }
              }
            >
              <SlideToUnlock
                handleWidth={56}
                onUnlock={() => setIsUnlocked(true)}
                className="w-full overflow-hidden rounded-2xl bg-primary p-1 shadow-lg ring-0"
              >
                <SlideToUnlockTrack className="relative h-12">
                  <SlideToUnlockHandle
                    aria-label="Slide to start trial"
                    className="z-20 h-12 w-14 rounded-xl bg-primary-foreground text-primary shadow-md"
                  >
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-6"
                    />
                  </SlideToUnlockHandle>

                  <SlideToUnlockText className="z-10 flex items-center justify-center pr-4 text-base text-primary-foreground">
                    {({ isDragging }) => (
                      <ShimmeringText
                        text={
                          isDragging
                            ? "Release to confirm"
                            : "Slide to start trial"
                        }
                        isStopped={isDragging}
                        className="font-medium [--color:color-mix(in_oklab,var(--primary-foreground)_42%,transparent)] [--shimmering-color:var(--primary-foreground)]"
                      />
                    )}
                  </SlideToUnlockText>
                </SlideToUnlockTrack>
              </SlideToUnlock>
            </motion.div>
          ) : (
            <motion.button
              key="dashboard-button"
              type="button"
              initial={reduce ? false : { opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              transition={{ duration: 0.2, ease: easeOut }}
              onClick={() => setIsUnlocked(false)}
              className={cn(
                "group flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl font-medium shadow-md",
                "bg-primary text-primary-foreground",
              )}
            >
              <span>Back to Dashboard</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="size-5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
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
        "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl bg-card p-4 text-left transition-all duration-300",
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
