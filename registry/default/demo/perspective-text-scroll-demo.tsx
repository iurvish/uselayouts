"use client";

import { PreviewHint } from "@/components/open/preview-hint";
import PerspectiveTextScroll from "@/registry/default/example/perspective-text-scroll";

export default function PerspectiveTextScrollDemo() {
  return (
    <div className="w-full min-w-0 bg-[#F7F4F2]">
      <PreviewHint
        tone="light"
        heading="Scroll to move through the text"
        description="Perspective tilts and fades as you scroll this section."
        className="h-auto"
      >
        <PerspectiveTextScroll />
      </PreviewHint>
    </div>
  );
}
