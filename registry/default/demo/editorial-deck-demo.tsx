"use client";

import type { CSSProperties } from "react";

import { PreviewHint } from "@/components/open/preview-hint";
import EditorialDeck from "@/registry/default/example/editorial-deck";

export default function EditorialDeckDemo() {
  return (
    <div
      className="flex h-full min-h-0 w-full flex-col self-stretch overflow-hidden bg-[#F7F4F0] pt-[28vh] pb-24"
      // 100px above the default 80px overlay inset
      style={{ "--preview-hint-top": "-20px" } as CSSProperties}
    >
      <PreviewHint
        tone="light"
        heading="Drag to flip through stories"
        description="Swipe the front card; it settles into the back of the stack."
        className="flex min-h-0 flex-1 flex-col"
      >
        <EditorialDeck title="" subtitle="" />
      </PreviewHint>
    </div>
  );
}
