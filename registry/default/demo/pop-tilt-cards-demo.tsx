"use client";

import { PreviewHint } from "@/components/open/preview-hint";
import PopTiltCards from "@/registry/default/example/pop-tilt-cards";

export default function PopTiltCardsDemo() {
  return (
    <div className="h-full w-full min-w-0 overflow-hidden">
      <PreviewHint
        tone="light"
        heading="Interaction study"
        description="Pop and tilt on hover"
      >
        <PopTiltCards />
      </PreviewHint>
    </div>
  );
}
