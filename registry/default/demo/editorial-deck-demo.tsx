"use client";

import { PreviewHint } from "@/components/open/preview-hint";
import EditorialDeck from "@/registry/default/example/editorial-deck";

export default function EditorialDeckDemo() {
  return (
    <div className="w-full min-w-0 bg-[#F7F4F0]">
      <PreviewHint
        tone="light"
        heading="Drag to flip through stories"
        description="Swipe the front card; it settles into the back of the stack."
        className="h-auto"
      >
        <EditorialDeck title="" subtitle="" />
      </PreviewHint>
    </div>
  );
}
