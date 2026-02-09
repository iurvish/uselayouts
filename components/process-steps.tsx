"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

// Updated connections - sequential flow as requested
const connections = [
  [0, 1], // Card 1 to Card 2
  [1, 2], // Card 2 to Card 3
  [2, 3], // Card 3 to Card 4
  [3, 4], // Card 4 to Card 5
  // Card 5 to "Your all in one" text will be handled separately
];

export default function ProcessSteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useIsMobile();

  // Draw connecting lines function with animation - modified for alternating curve directions
  useEffect(() => {
    // Animation state
    let animationFrameId: number;
    let startTime = 0;
    const animationDuration = 1000; // Duration for each line animation (ms)
    const staggerDelay = 300; // Delay between starting each line animation (ms)
    const lines: {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      controlX: number;
      controlY: number;
      progress: number;
      index: number;
      solid?: boolean;
      color?: string;
    }[] = [];

    // Flag to track if animation has already run
    let hasAnimated = false;

    const drawLines = () => {
      if (!containerRef.current || hasAnimated) return;

      hasAnimated = true; // Set the flag to prevent future animations

      const container = containerRef.current;
      const canvas = document.getElementById(
        "connection-lines",
      ) as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match container
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Get card elements
      const cards = container.querySelectorAll(".process-card");
      const textElement = container.querySelector(
        ".text-partner",
      ) as HTMLElement;

      if (cards.length < 2) return;

      // Clear previous lines data
      lines.length = 0;

      // Calculate all line positions
      connections.forEach(([fromIndex, toIndex], idx) => {
        const fromCard = cards[fromIndex] as HTMLElement;
        const toCard = cards[toIndex] as HTMLElement;

        if (!fromCard || !toCard) return;

        const fromRect = fromCard.getBoundingClientRect();
        const toRect = toCard.getBoundingClientRect();

        // Default positions
        let startX = fromRect.left - rect.left + fromRect.width / 2;
        let startY = fromRect.top - rect.top + fromRect.height / 2;
        let endX = toRect.left - rect.left + toRect.width / 2;
        let endY = toRect.top - rect.top + toRect.height / 3;

        if (isMobile || isTablet) {
          // For mobile and tablet, connect from bottom of card to top of next card
          startX = fromRect.left - rect.left + fromRect.width / 2;
          startY = fromRect.top - rect.top + fromRect.height;
          endX = toRect.left - rect.left + toRect.width / 2;
          endY = toRect.top - rect.top;
        } else {
          // Custom connection paths for desktop based on card positions
          if (fromIndex === 0 && toIndex === 1) {
            // Card 1 to Card 2: Connect from right of card 1 to left of card 2
            startX = fromRect.left - rect.left + fromRect.width * 0.85;
            startY = fromRect.top - rect.top + fromRect.height * 0.4;
            endX = toRect.left - rect.left + toRect.width * 0.15;
            endY = toRect.top - rect.top + toRect.height * 0.4;
          } else if (fromIndex === 1 && toIndex === 2) {
            // Card 2 to Card 3: Connect from bottom of card 2 to top of card 3
            startX = fromRect.left - rect.left + fromRect.width * 0.3;
            startY = fromRect.top - rect.top + fromRect.height * 0.75;
            endX = toRect.left - rect.left + toRect.width * 0.7;
            endY = toRect.top - rect.top + toRect.height * 0.15;
          } else if (fromIndex === 2 && toIndex === 3) {
            // Card 3 to Card 4: Connect from right of card 3 to left of card 4
            startX = fromRect.left - rect.left + fromRect.width * 0.85;
            startY = fromRect.top - rect.top + fromRect.height * 0.5;
            endX = toRect.left - rect.left + toRect.width * 0.15;
            endY = toRect.top - rect.top + toRect.height * 0.5;
          } else if (fromIndex === 3 && toIndex === 4) {
            // Card 4 to Card 5: Connect from bottom of card 4 to top-right of card 5
            startX = fromRect.left - rect.left + fromRect.width * 0.4;
            startY = fromRect.top - rect.top + fromRect.height * 0.8;
            endX = toRect.left - rect.left + toRect.width * 0.7;
            endY = toRect.top - rect.top + toRect.height * 0.1;
          }
        }

        // Calculate control points for curve
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate control point - alternate curve direction for more natural flow
        // Odd connections curve right, even connections curve left
        const curveMultiplier = isMobile || isTablet ? 0.5 : 0.2;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        // Vector perpendicular to line - alternate direction based on index
        const direction = idx % 2 === 0 ? 1 : -1;
        const perpX = direction * (-dy / distance) * distance * curveMultiplier;
        const perpY = direction * (dx / distance) * distance * curveMultiplier;

        // Add line to array
        lines.push({
          startX,
          startY,
          endX,
          endY,
          controlX: midX + perpX,
          controlY: midY + perpY,
          progress: 0,
          index: idx,
        });
      });

      // Add special line from Card 5 to text element
      if (cards[4] && textElement) {
        const fromCard = cards[4] as HTMLElement;
        const fromRect = fromCard.getBoundingClientRect();
        const toRect = textElement.getBoundingClientRect();

        let startX, startY, endX, endY;

        if (isMobile || isTablet) {
          // For mobile and tablet, connect from bottom of card to above the text
          startX = fromRect.left - rect.left + fromRect.width / 2;
          startY = fromRect.top - rect.top + fromRect.height;
          endX = toRect.left - rect.left + toRect.width / 2;
          // End the line above the text element instead of at its top
          endY = toRect.top - rect.top - 15; // Add some gap
        } else {
          // Desktop positioning
          // Connect from bottom-left of card 5 to top-left of text
          startX = fromRect.left - rect.left + fromRect.width * 0.3;
          startY = fromRect.top - rect.top + fromRect.height * 0.78;
          // Connect to the left side of text, above the text
          endX = toRect.left - rect.left + toRect.width * 0.2;
          endY = toRect.top - rect.top - 10; // Position above the text
        }

        // Calculate curve
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const curveMultiplier = isMobile || isTablet ? 0.3 : 0.15;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        const perpX = (-dy / distance) * distance * curveMultiplier;
        const perpY = (dx / distance) * distance * curveMultiplier;

        // Add solid orange line to array
        lines.push({
          startX,
          startY,
          endX,
          endY,
          controlX: midX + perpX,
          controlY: midY + perpY,
          progress: 0,
          index: lines.length,
          solid: true,
          color: "#3B82F6", // Orange color
        });
      }

      // Animation function
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw each line
        let allComplete = true;
        lines.forEach((line, i) => {
          // Calculate line's animation start time including stagger
          const lineStartTime = i * staggerDelay;
          const lineElapsed = elapsed - lineStartTime;

          // Only start animating this line when it's time
          if (lineElapsed <= 0) {
            allComplete = false;
            return;
          }

          // Update progress
          line.progress = Math.min(lineElapsed / animationDuration, 1);

          if (line.progress < 1) {
            allComplete = false;
          }

          // Set line style
          if (line.solid) {
            ctx.setLineDash([]);
            ctx.strokeStyle = line.color || "#FF5C00";
            ctx.lineWidth = isMobile || isTablet ? 4 : 2; // Increased line width for mobile
          } else {
            ctx.setLineDash([8, 6]); // Increased dash pattern
            ctx.strokeStyle = "#d1d5db";
            ctx.lineWidth = isMobile || isTablet ? 4 : 2; // Increased line width for mobile
          }

          // Draw line with animation
          const endPoint = getPointOnQuadraticCurve(
            line.startX,
            line.startY,
            line.controlX,
            line.controlY,
            line.endX,
            line.endY,
            line.progress,
          );

          ctx.beginPath();
          ctx.moveTo(line.startX, line.startY);

          if (line.progress < 1) {
            // Draw partial curve during animation
            ctx.quadraticCurveTo(
              line.controlX,
              line.controlY,
              endPoint.x,
              endPoint.y,
            );
          } else {
            // Draw full curve when animation is complete
            ctx.quadraticCurveTo(
              line.controlX,
              line.controlY,
              line.endX,
              line.endY,
            );
          }

          ctx.stroke();
        });

        // Continue animation if not all lines are complete
        if (!allComplete) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      // Helper function to get point on a quadratic curve at specific progress
      function getPointOnQuadraticCurve(
        startX: number,
        startY: number,
        controlX: number,
        controlY: number,
        endX: number,
        endY: number,
        progress: number,
      ) {
        const x =
          Math.pow(1 - progress, 2) * startX +
          2 * (1 - progress) * progress * controlX +
          Math.pow(progress, 2) * endX;

        const y =
          Math.pow(1 - progress, 2) * startY +
          2 * (1 - progress) * progress * controlY +
          Math.pow(progress, 2) * endY;

        return { x, y };
      }

      // Start animation
      startTime = 0;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    // Trigger drawing when component is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            drawLines();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Draw on resize
    window.addEventListener("resize", drawLines);

    return () => {
      window.removeEventListener("resize", drawLines);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      observer.disconnect();
    };
  }, [isMobile, isTablet]);

  // Render cards in a stacked layout for mobile, scattered for desktop
  // Updated card styling with smaller width, adjusted padding, larger pushpins and more vertical spacing

  // Render cards in a stacked layout for mobile, scattered for desktop
  // Render cards in a stacked layout for mobile, scattered for desktop
  // Update desktop cards with smaller width and centered pushpin
  // Update renderCards function to fix mobile issues and align pushpin properly
  // Update mobile layout with decreased vertical spacing and better pushpin positioning
  const renderCards = () => {
    if (isMobile || isTablet) {
      return (
        <div
          className={`flex flex-col ${isMobile ? "space-y-60" : "space-y-40"} items-center`}
        >
          {/* Card 1 - Proposal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="process-card max-w-[330px] w-full"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Orange pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              {/* Card with updated styling matching desktop */}
              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-orange-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-orange-600 mb-4">
                    01
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Plan
                  </h3>
                  <p className="text-xl text-gray-600">
                    Understand project goals, user needs, and define clear
                    structure.{" "}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 - Flow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="process-card max-w-[330px] w-full"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Blue pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain filter hue-rotate-[220deg] drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              {/* Card with updated styling matching desktop */}
              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-blue-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-blue-600 mb-4">
                    02
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Flow
                  </h3>
                  <p className="text-xl text-gray-600">
                    Map out key screens and intuitive user experience flows.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3 - Design Concept */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="process-card max-w-[330px] w-full"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Purple pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain filter hue-rotate-[270deg] drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              {/* Card with updated styling matching desktop */}
              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-purple-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-purple-600 mb-4">
                    03
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Design Concept
                  </h3>
                  <p className="text-xl text-gray-600">
                    Design clean, modern UI in Figma for all user roles.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4 - Build */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 4 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 4 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="process-card max-w-[330px] w-full"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Orange pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              {/* Card with updated styling matching desktop */}
              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-orange-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-orange-600 mb-4">
                    04
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Build
                  </h3>
                  <p className="text-xl text-gray-600">
                    Code smooth, responsive, animated UI with reusable
                    components.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 5 - Launch */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="process-card max-w-[330px] w-full"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Blue pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain filter hue-rotate-[220deg] drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              {/* Card with updated styling matching desktop */}
              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-blue-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-blue-600 mb-4">
                    05
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Launch
                  </h3>
                  <p className="text-xl text-gray-600">
                    Deliver with care, offer support, and iterate for
                    improvements.{" "}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* "Your all in one" text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-partner transform -rotate-3 mt-6 p-2"
          >
            <div className="text-3xl text-center font-medium">
              The <span className="text-blue-500">Only Partner</span>
              <br />
              You Need.
            </div>
          </motion.div>
        </div>
      );
    } else {
      // Desktop scattered layout with increased vertical spacing and decreased card width
      return (
        <div className="relative min-h-[1800px]">
          {/* Card 1 - Top left, rotated */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -11 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -11 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="process-card absolute max-w-[320px] left-[3%] top-[2%] md:left-[5%] md:top-[2%]"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Orange pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              {/* Card with fixed height for consistent sizing */}
              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-orange-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-orange-600 mb-4">
                    01
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Proposal
                  </h3>
                  <p className="text-xl text-gray-600">
                    Understand project goals, user needs, and define clear
                    structure.{" "}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 - Top right, rotated opposite */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 11 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 11 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="process-card absolute max-w-[320px] right-[3%] top-[2%] md:right-[5%] md:top-[2%]"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Blue pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain filter hue-rotate-[220deg] drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-blue-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-blue-600 mb-4">
                    02
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Flow
                  </h3>
                  <p className="text-xl text-gray-600">
                    Map out key screens and intuitive user experience flows.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3 - Middle left, rotated */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="process-card absolute max-w-[320px] left-[5%] top-[30%] md:left-[8%] md:top-[28%]"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Purple pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain filter hue-rotate-[270deg] drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-purple-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-purple-600 mb-4">
                    03
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Design Concept
                  </h3>
                  <p className="text-xl text-gray-600">
                    Design clean, modern UI in Figma for all user roles.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4 - Middle right, rotated opposite */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="process-card absolute max-w-[320px] right-[5%] top-[32%] md:right-[8%] md:top-[28%]"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Orange pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-orange-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-orange-600 mb-4">
                    04
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Build
                  </h3>
                  <p className="text-xl text-gray-600">
                    Code smooth, responsive, animated UI with reusable
                    components.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 5 - Bottom center, rotated */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -8 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="process-card absolute max-w-[320px] left-[50%] -translate-x-1/2 top-[65%] md:top-[60%]"
          >
            <div className="relative">
              {/* Pushpin positioned lower and moved more to the right */}
              <div className="absolute left-[55%] -translate-x-1/2 -top-14 z-10 w-44 h-44 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/pushpin.png"
                    alt="Blue pushpin"
                    width={170}
                    height={170}
                    className="w-full h-full object-contain filter hue-rotate-[220deg] drop-shadow-md select-none pointer-events-none"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 rounded-full opacity-30 blur-sm"></div>
                </div>
              </div>

              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white border-[12px] border-white p-1 pt-7">
                <div className="bg-blue-100 rounded-2xl pt-6 pb-7 px-5 relative min-h-[240px]">
                  <div className="text-3xl font-semibold text-blue-600 mb-4">
                    05
                  </div>
                  <h3 className="text-4xl font-medium text-gray-800 mb-4">
                    Launch
                  </h3>
                  <p className="text-xl text-gray-600">
                    Deliver with care, offer support, and iterate for
                    improvements.{" "}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* "Your all in one" text - bottom left with rotation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="absolute p-2 left-[18%] bottom-[15%] md:left-[22%] md:bottom-[20%] transform -rotate-3 text-partner"
          >
            <div className="text-3xl  text-center font-medium">
              The <span className="text-blue-500">Only Partner</span>
              <br />
              You Need.
            </div>
          </motion.div>
        </div>
      );
    }
  };
  return (
    <div
      className="relative py-36 overflow-hidden rounded-t-[2.5rem] max-sm:rounded-t-[1.8rem]"
      ref={containerRef}
    >
      {/* Background texture paper */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(229, 231, 235, 0) 0%, rgba(229, 231, 235, 0.5) 15%, rgba(229, 231, 235, 0.5) 85%, rgba(229, 231, 235, 0) 100%), linear-gradient(0deg, transparent calc(100% - 1px), rgba(229, 231, 235, 0.5) 100%)",
          backgroundSize: "100% 26px",
        }}
      ></div>

      {/* Canvas for connecting lines */}
      <canvas
        id="connection-lines"
        className="absolute inset-0 w-full h-full pointer-events-none"
      ></canvas>

      {/* Process cards container */}
      <div className="relative max-w-7xl mx-auto px-4  ">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2rem,5vw,3.5rem)] mb-4 font-medium w-[70%]  max-sm:w-[100%] text-center mx-auto "
          >
            How I Build Stunning Products{" "}
          </motion.h2>
        </div>

        {/* Render appropriate layout based on screen size */}
        {renderCards()}
      </div>

      {/* Progressive blur gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none">
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              backdropFilter: "blur(0.078125px)",
              WebkitBackdropFilter: "blur(0.078125px)",
              maskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 12.5%, rgba(0, 0, 0, 1) 25%, rgba(0, 0, 0, 0) 37.5%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 12.5%, rgba(0, 0, 0, 1) 25%, rgba(0, 0, 0, 0) 37.5%)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              backdropFilter: "blur(0.15625px)",
              WebkitBackdropFilter: "blur(0.15625px)",
              maskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 12.5%, rgba(0, 0, 0, 1) 25%, rgba(0, 0, 0, 1) 37.5%, rgba(0, 0, 0, 0) 50%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 12.5%, rgba(0, 0, 0, 1) 25%, rgba(0, 0, 0, 1) 37.5%, rgba(0, 0, 0, 0) 50%)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              backdropFilter: "blur(0.3125px)",
              WebkitBackdropFilter: "blur(0.3125px)",
              maskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 1) 37.5%, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 62.5%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 1) 37.5%, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 62.5%)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 4,
              backdropFilter: "blur(0.625px)",
              WebkitBackdropFilter: "blur(0.625px)",
              maskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 37.5%, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 1) 62.5%, rgba(0, 0, 0, 0) 75%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 37.5%, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 1) 62.5%, rgba(0, 0, 0, 0) 75%)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              backdropFilter: "blur(1.25px)",
              WebkitBackdropFilter: "blur(1.25px)",
              maskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 62.5%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 87.5%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 62.5%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 87.5%)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 6,
              backdropFilter: "blur(2.5px)",
              WebkitBackdropFilter: "blur(2.5px)",
              maskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 62.5%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 1) 87.5%, rgba(0, 0, 0, 0) 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 62.5%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 1) 87.5%, rgba(0, 0, 0, 0) 100%)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 7,
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              maskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 1) 87.5%, rgba(0, 0, 0, 1) 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 1) 87.5%, rgba(0, 0, 0, 1) 100%)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 8,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              maskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 87.5%, rgba(0, 0, 0, 1) 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 87.5%, rgba(0, 0, 0, 1) 100%)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
