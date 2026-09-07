"use client";

import { useRef } from "react";

import { PreviewHint } from "@/components/open/preview-hint";
import ScrollStackDeck from "@/registry/default/example/scroll-stack-deck";

export default function ScrollStackDeckDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollerRef}
      className="relative h-full min-h-0 w-full self-stretch overflow-y-auto overscroll-contain bg-[#F4F6F8]"
    >
      <PreviewHint
        tone="light"
        heading="Scroll the stack"
        description="Five project cards pin in the viewport. Keep scrolling — each new card slides up and the others settle behind it."
      />
      <ScrollStackDeck
        title=""
        subtitle=""
        scrollIndicatorText=""
        showFooter={false}
        enableLenis={false}
        container={scrollerRef}
      />
    </div>
  );
}
