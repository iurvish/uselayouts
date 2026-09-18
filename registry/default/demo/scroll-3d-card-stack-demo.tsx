"use client";

import { useRef } from "react";
import { Scroll3DCardStack } from "@/registry/default/example/scroll-3d-card-stack";

export default function Scroll3DCardStackDemo() {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} className="absolute inset-0 overflow-y-auto">
      <Scroll3DCardStack containerRef={scroller} />
    </div>
  );
}
