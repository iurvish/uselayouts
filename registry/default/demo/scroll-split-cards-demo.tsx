"use client";

import { useRef } from "react";
import { ScrollSplitCards } from "@/registry/default/example/scroll-split-cards";

export default function ScrollSplitCardsDemo() {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} className="absolute inset-0 overflow-y-auto">
      <ScrollSplitCards containerRef={scroller} />
    </div>
  );
}
