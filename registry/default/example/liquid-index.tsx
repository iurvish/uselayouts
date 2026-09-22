"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react"
import {
  BookOpen,
  Camera,
  Droplets,
  Flame,
  SwatchBook,
  type LucideIcon,
} from "lucide-react"
import { LiquidGradientCanvas } from "./liquid-index-canvas"

const SPRING = { type: "spring" as const, bounce: 0, duration: 0.36 }
const COLOR_EASE = [0.25, 0.1, 0.25, 1] as const
const IMG = "auto=format&fit=crop&w=800&q=80"

type Item = {
  title: string
  description: string
  image: string
  icon: LucideIcon
  seed: number
  colors: [number, number, number][]
}

const ITEMS: Item[] = [
  {
    title: "Marbling",
    description: "Wet color that settles into the grain instead of sitting on top.",
    image: `https://images.unsplash.com/photo-1541701494587-cb58502866ab?${IMG}`,
    icon: Droplets,
    seed: 648,
    colors: [
      [0, 0, 26],
      [41, 98, 255],
      [64, 188, 255],
    ],
  },
  {
    title: "Darkroom",
    description: "Trays, safelight, and a print that only appears in the last minute.",
    image: `https://images.unsplash.com/photo-1557672172-298e090bd0f1?${IMG}`,
    icon: Camera,
    seed: 732,
    colors: [
      [22, 11, 0],
      [255, 138, 0],
      [255, 193, 79],
    ],
  },
  {
    title: "Kiln",
    description: "Clay that is unfinished until it comes back from the fire.",
    image: `https://images.unsplash.com/photo-1574169208507-84376144848b?${IMG}`,
    icon: Flame,
    seed: 516,
    colors: [
      [18, 10, 36],
      [124, 58, 237],
      [255, 139, 209],
    ],
  },
  {
    title: "Binding",
    description: "Signatures sewn so the book can open flat on a desk.",
    image: `https://images.unsplash.com/photo-1550684848-fac1c5b4e853?${IMG}`,
    icon: BookOpen,
    seed: 884,
    colors: [
      [6, 19, 13],
      [0, 200, 83],
      [182, 255, 106],
    ],
  },
  {
    title: "Proofing",
    description: "One last pass on the sheet before the press run starts.",
    image: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?${IMG}`,
    icon: SwatchBook,
    seed: 291,
    colors: [
      [11, 16, 32],
      [51, 65, 85],
      [148, 163, 184],
    ],
  },
]

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 809px)")
    const update = () => setIsPhone(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return isPhone
}

export default function LiquidIndex() {
  const isPhone = useIsPhone()
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState<number | null>(null)
  const [offsetY, setOffsetY] = useState(0)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const current = active == null ? ITEMS[0] : ITEMS[active]
  const Icon = current.icon
  const transition = reduceMotion ? { duration: 0 } : SPRING

  useLayoutEffect(() => {
    if (isPhone || active == null) {
      setOffsetY(0)
      return
    }

    const first = itemRefs.current[0]
    const item = itemRefs.current[active]
    if (!first || !item) return

    setOffsetY(item.offsetTop - first.offsetTop)
  }, [active, isPhone])

  return (
    <div
      className={
        isPhone
          ? "flex w-full max-w-[931px] flex-col items-start gap-[27px]"
          : "flex w-full max-w-[931px] flex-row items-stretch gap-12"
      }
    >
      <div
        className={
          isPhone
            ? "relative flex w-[120px] shrink-0 flex-col items-center"
            : "relative flex w-[220px] shrink-0 flex-col items-center"
        }
      >
        <motion.div
          className={
            isPhone
              ? "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[24px] bg-muted opacity-0"
              : "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[32px] bg-muted opacity-0"
          }
          initial={false}
          animate={{
            opacity: active == null ? 0 : 1,
            y: isPhone || active == null ? 0 : offsetY,
          }}
          transition={transition}
        >
          <AnimatePresence initial={false} mode="sync">
            <motion.img
              key={current.image}
              src={current.image}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.18,
                ease: COLOR_EASE,
              }}
              className="absolute inset-0 size-full object-cover"
              draggable={false}
            />
          </AnimatePresence>
          <div className="absolute inset-0 mix-blend-soft-light">
            <LiquidGradientCanvas
              colors={current.colors}
              seed={current.seed}
              paused={!!reduceMotion}
            />
          </div>
          <div
            className={
              isPhone
                ? "relative z-[2] flex size-9 items-center justify-center text-white"
                : "relative z-[2] flex size-14 items-center justify-center text-white"
            }
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.span
                key={current.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.18,
                  ease: COLOR_EASE,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Icon
                  className={isPhone ? "size-7" : "size-10"}
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden
                />
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div
        className={
          isPhone
            ? "flex min-w-0 flex-1 flex-col items-start gap-[19px] py-0"
            : "flex min-w-0 flex-1 flex-col items-start gap-[25px] py-[81px]"
        }
        onMouseLeave={() => {
          if (!isPhone) setActive(null)
        }}
      >
        <div className="flex w-full flex-col items-start">
          {ITEMS.map((item, index) => {
            const isActive = active === index
            const inactive = active != null && !isActive

            return (
              <motion.button
                key={item.title}
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                type="button"
                onMouseEnter={() => {
                  if (!isPhone) setActive(index)
                }}
                onClick={() => {
                  if (isPhone) setActive(isActive ? null : index)
                }}
                className={
                  isPhone
                    ? "flex w-full cursor-pointer flex-col items-start gap-[5px] py-[5px] text-left"
                    : "flex w-auto cursor-pointer flex-col items-start gap-0 py-[7px] text-left"
                }
                animate={{ paddingLeft: isActive ? 8 : 0 }}
                transition={transition}
              >
                <motion.span
                  className={
                    isPhone
                      ? "w-full select-none text-[26px] font-semibold leading-[1.14em] tracking-[-0.03em] whitespace-pre-wrap"
                      : "w-auto select-none text-[44px] font-semibold leading-[1.1em] tracking-[-0.04em] whitespace-nowrap"
                  }
                  animate={{
                    color: inactive
                      ? "var(--muted-foreground)"
                      : "var(--foreground)",
                  }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.18,
                    ease: COLOR_EASE,
                  }}
                >
                  {item.title}
                </motion.span>
                <AnimatePresence initial={false}>
                  {isPhone && isActive ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={transition}
                      className="max-w-[520px] overflow-hidden text-[17px] font-medium leading-[1.45em] tracking-[-0.018em] text-pretty text-muted-foreground"
                    >
                      {item.description}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>

        <div
          className={
            isPhone
              ? "hidden"
              : "min-h-[62px] w-full max-w-[520px]"
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            {active != null ? (
              <motion.p
                key={current.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={transition}
                className="text-[22px] font-medium leading-[1.42em] tracking-[-0.025em] text-pretty text-muted-foreground"
              >
                {current.description}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
