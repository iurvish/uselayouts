"use client";

import { motion, useSpring, useTransform, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import * as React from "react";

const STARTING_MARGIN = 8;
const ITEM_HEIGHT = 26.28;
const ITEM_GAP = 8;
const DEPTH_INDENT = 10;
const INITIAL_OFFSET = 8;
const DEPTH_BEND_LENGTH = 8;
const CENTER_OFFSET = 6.5;

const SPRING_CONFIG = { stiffness: 180, damping: 20 };

const GRADIENT_HEIGHT = ITEM_HEIGHT * 2.5;

interface TocItem {
  title?: React.ReactNode;
  url: string;
  depth: number;
}

interface TocIndicatorProps {
  toc: TocItem[];
  activeIndex: number;
  className?: string;
}

interface PathData {
  path: string;
  totalLength: number;
  itemCenterDistances: number[];
  itemPositions: { x: number; y: number }[];
}

function getXForDepth(depth: number, minDepth: number): number {
  return STARTING_MARGIN + (depth - minDepth) * DEPTH_INDENT;
}

function getRowBottomY(index: number, isLast: boolean): number {
  const baseY = INITIAL_OFFSET + ITEM_HEIGHT * (index + 1) - ITEM_GAP;
  return isLast ? baseY - 8 : baseY;
}

function getDiagonalDistance(deltaX: number): number {
  return Math.sqrt(deltaX ** 2 + DEPTH_BEND_LENGTH ** 2);
}

function getItemCenterY(index: number): number {
  return INITIAL_OFFSET + ITEM_HEIGHT * index + ITEM_HEIGHT / 2 - ITEM_GAP;
}

function generatePathData(toc: TocItem[]): PathData {
  if (toc.length === 0)
    return {
      path: "",
      totalLength: 0,
      itemCenterDistances: [],
      itemPositions: [],
    };

  const minDepth = Math.min(...toc.map((item) => item.depth));
  const pathParts: string[] = [];
  const itemCenterDistances: number[] = [];
  const itemPositions: { x: number; y: number }[] = [];

  let currentX = getXForDepth(toc[0].depth, minDepth);
  let currentY = INITIAL_OFFSET - STARTING_MARGIN;
  let accumulatedLength = 0;

  pathParts.push(`M ${currentX} ${currentY}`);

  for (let i = 0; i < toc.length; i++) {
    const isLastItem = i === toc.length - 1;
    const rowBottomY = getRowBottomY(i, isLastItem);
    const nextItem = toc[i + 1];

    const itemCenterY = getItemCenterY(i);
    // record position at center of item for circle rendering
    const itemX = getXForDepth(toc[i].depth, minDepth);
    itemPositions.push({ x: itemX, y: itemCenterY + 3.9 });

    const distanceToCenter = itemCenterY - currentY;
    itemCenterDistances.push(
      accumulatedLength + distanceToCenter + CENTER_OFFSET,
    );

    const verticalLength = rowBottomY - currentY;
    accumulatedLength += verticalLength;
    pathParts.push(`L ${currentX} ${rowBottomY}`);
    currentY = rowBottomY;

    if (nextItem) {
      const nextX = getXForDepth(nextItem.depth, minDepth);

      if (nextX !== currentX) {
        const deltaX = nextX - currentX;
        accumulatedLength += getDiagonalDistance(deltaX);
        pathParts.push(`L ${nextX} ${currentY + DEPTH_BEND_LENGTH}`);
        currentX = nextX;
        currentY += DEPTH_BEND_LENGTH;
      }
    }
  }

  return {
    path: pathParts.join(" "),
    totalLength: accumulatedLength,
    itemCenterDistances,
    itemPositions,
  };
}

function usePathData(toc: TocItem[]) {
  return React.useMemo(() => generatePathData(toc), [toc]);
}

function getActiveDistance(
  activeIndex: number,
  itemCenterDistances: number[],
): number {
  const isValidIndex =
    activeIndex >= 0 && activeIndex < itemCenterDistances.length;
  return isValidIndex ? itemCenterDistances[activeIndex] : 0;
}

export function TocIndicator({
  toc,
  activeIndex,
  className,
}: TocIndicatorProps) {
  const { path, totalLength, itemCenterDistances, itemPositions } =
    usePathData(toc);

  const activeDistance = getActiveDistance(activeIndex, itemCenterDistances);
  const isActive = activeDistance > 0;

  const animatedDistance = useSpring(0, SPRING_CONFIG);

  React.useEffect(() => {
    animatedDistance.set(activeDistance);
  }, [activeDistance, animatedDistance]);

  const progress = useTransform(
    animatedDistance,
    [0, totalLength || 1],
    [0, 1],
  );
  const offsetDistancePercent = useTransform(progress, (v) => `${v * 100}%`);

  const startY = INITIAL_OFFSET - STARTING_MARGIN;
  const gradientY2 = useTransform(animatedDistance, (v) => startY + v);
  const gradientY1 = useTransform(gradientY2, (y2) =>
    Math.max(0, y2 - GRADIENT_HEIGHT),
  );

  const cssOffsetPath = `path('${path}')`;

  return (
    <div
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0px, currentColor 15px, currentColor 100%)",
      }}
      className={cn(
        "text-accent pointer-events-none absolute h-full w-full",
        className,
      )}
    >
      <svg className="h-full w-full" overflow="visible">
        <defs>
          {/* <marker
            id="toc-end-circle"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="3"
            orient="auto"
          >
            <circle cx="3" cy="3" r="2" fill="currentColor" />
          </marker> */}
          <motion.linearGradient
            id="toc-progress-gradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1={gradientY1}
            y2={gradientY2}
          >
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="1" />
          </motion.linearGradient>
          <mask id="toc-mask">
            <motion.path
              d={path}
              stroke="white"
              strokeWidth="2"
              fill="none"
              style={{ pathLength: progress }}
            />
          </mask>
          <mask id="toc-mask-inverted">
            <rect width="100%" height="100%" fill="white" />
            <motion.path
              d={path}
              stroke="black"
              strokeWidth="2"
              fill="none"
              style={{ pathLength: progress }}
            />
          </mask>
        </defs>
        <path
          d={path}
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeOpacity="1"
          fill="none"
          mask="url(#toc-mask-inverted)"
          markerEnd="url(#toc-end-circle)"
        />
        {/* Solid path that is revealed by the mask */}
        <path
          d={path}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          mask="url(#toc-mask)"
        />

        <motion.path
          d={path}
          stroke="url(#toc-progress-gradient)"
          strokeWidth="1"
          fill="none"
          style={{ pathLength: progress }}
        />
        {/* circles at each item position */}
        <AnimatePresence>
          {itemPositions.map((pos, idx) => {
            const isActiveItem = idx === activeIndex;
            const isCovered = idx < activeIndex;
            const isUpcoming = idx > activeIndex;
            const isLast = idx === toc.length - 1;
            // skip drawing a circle for the active item (airplane will be shown instead)
            if (isActiveItem) return null;
            let fillColor = "currentColor";
            let strokeColor: string | undefined = undefined;
            let strokeWidth = 0;

            if (isUpcoming) {
              fillColor = "var(--background)";
              strokeColor = "currentColor";
              strokeWidth = 1;
            }
            if (isCovered) {
              fillColor = "currentColor";
            }
            if (isLast) {
              fillColor = "var(--primary)";
            }

            return isLast ? (
              <>
                <motion.circle
                  key={`${idx}-outer`}
                  cx={pos.x}
                  cy={pos.y}
                  r={4}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.35 }}
                />
                <motion.circle
                  key={`${idx}-inner`}
                  cx={pos.x}
                  cy={pos.y}
                  r={2.5}
                  fill="var(--primary-foreground)"
                  stroke="var(--currentColor)"
                  strokeWidth={1}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.35 }}
                />
              </>
            ) : (
              <motion.circle
                key={idx}
                cx={pos.x}
                cy={pos.y}
                r={3}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.35 }}
              />
            );
          })}
        </AnimatePresence>
      </svg>
      <motion.div
        className="absolute top-0 left-0"
        style={{
          offsetPath: cssOffsetPath,
          offsetRotate: "0deg",
          marginLeft: 0,
          marginTop: -3,
          offsetDistance: offsetDistancePercent,
          opacity: isActive ? 1 : 0,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_78_315)">
            <path
              d="M15.4443 4.85163L9.14804 6.8146V2.48126L10.7036 1.29608V0.110894L7.96286 0.888672L5.18508 0.110894V1.29608L6.77767 2.48126V6.8146L0.444336 4.85163V6.40719L6.77767 10.3702V14.7035C6.77767 15.0492 6.88878 15.3331 7.111 15.5553C7.33322 15.7776 7.611 15.8887 7.94434 15.8887C8.27767 15.8887 8.56162 15.7776 8.79619 15.5553C9.03076 15.3331 9.14804 15.0492 9.14804 14.7035V10.3702L15.4443 6.40719V4.85163Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_78_315">
              <rect
                width="16"
                height="16"
                fill="white"
                transform="matrix(1 0 0 -1 0 16)"
              />
            </clipPath>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
