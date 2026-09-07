"use client";

import { PreviewHint } from "@/components/open/preview-hint";
import { CardStack, DEFAULT_CARDS } from "@/registry/default/example/accessible-action";

export default function AccessibleActionDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden">
      <PreviewHint
        heading="Swipe & Explore"
        description="Drag or click to cycle through the stack"
      >
        <CardStack items={DEFAULT_CARDS} />
      </PreviewHint>
    </div>
  );
}
