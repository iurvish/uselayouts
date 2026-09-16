"use client"

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
  MotionValue,
} from "motion/react"

const images = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
]

const N = images.length

export type CarouselConfig = {
  dragDist: number
  xOffset: number
  yOffset: number
  rotateZ: number
  rotateY: number
  scaleStep: number
  opacityStep: number
  blurStep: number
  overlayMax: number
  bounce: number
  duration: number
}

const DRAG_DIST = 200
const X_OFFSET = 130
const Y_OFFSET = 20
const SCALE_STEP = 0.15
const OVERLAY_MAX = 1.0
const BOUNCE = 0.3
const DURATION = 0.5

export default function CoverflowDrag() {
  const containerX = useMotionValue(0)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const currentX = containerX.get()
    const velocity = info.velocity.x

    const predictedX = currentX + velocity * 0.2
    const nearestMultiple = Math.round(predictedX / DRAG_DIST) * DRAG_DIST

    animate(containerX, nearestMultiple, {
      type: "spring",
      bounce: BOUNCE,
      duration: DURATION,
    })
  }

  return (
    <div className="relative flex h-[480px] w-full items-center justify-center overflow-hidden">
      <motion.div
        drag="x"
        style={{ x: containerX }}
        onDragEnd={handleDragEnd}
        dragConstraints={{}}
        className="absolute inset-0 flex cursor-grab items-center justify-center active:cursor-grabbing"
      >
        {images.map((src, i) => (
          <Card key={i} i={i} src={src} containerX={containerX} />
        ))}
      </motion.div>
    </div>
  )
}

function Card({
  i,
  src,
  containerX,
}: {
  i: number
  src: string
  containerX: MotionValue<number>
}) {
  const getDist = (cx: number) => {
    let d = (i * DRAG_DIST + cx) / DRAG_DIST
    d = ((d % N) + N) % N
    if (d > N / 2) d -= N
    return d
  }

  const x = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return d * X_OFFSET - cx
  })

  const y = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return Math.abs(d) * Y_OFFSET
  })

  const scale = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return Math.max(0, 1 - Math.abs(d) * SCALE_STEP)
  })

  const zIndex = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return 100 - Math.round(Math.abs(d) * 10)
  })

  const opacity = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    // Smoothly fade out cards between distance 2 and 3 to prevent popping during bounce
    return Math.max(0, Math.min(1, 3 - Math.abs(d)))
  })

  const overlayOpacity = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return Math.min(OVERLAY_MAX, Math.abs(d) * 0.2)
  })

  const borderOpacity = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return Math.max(0, 1 - Math.abs(d) * 2)
  })

  return (
    <motion.div
      style={{ x, y, scale, zIndex, opacity }}
      className="absolute top-1/2 left-1/2 -mt-[190px] -ml-[140px] h-[380px] w-[280px] origin-center overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl"
    >
      <img
        src={src}
        className="pointer-events-none h-full w-full object-cover select-none"
        alt=""
      />

      {/* Dark overlay for inactive cards */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="pointer-events-none absolute inset-0 bg-black select-none"
      />

      {/* Green active border ring */}
      <motion.div
        style={{ opacity: borderOpacity }}
        className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-white select-none"
      />
    </motion.div>
  )
}
