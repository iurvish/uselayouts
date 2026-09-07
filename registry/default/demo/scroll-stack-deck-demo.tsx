"use client";

import { PreviewHint } from "@/components/open/preview-hint";
import ScrollStackDeck from "@/registry/default/example/scroll-stack-deck";

export default function ScrollStackDeckDemo() {
  return (
    <div className="w-full min-w-0 bg-[#F4F6F8]">
      <PreviewHint
        tone="light"
        heading="Selected work"
        description="Five recent builds: soft interfaces, clear systems, and product stories that hold up under a slow scroll."
        className="h-auto"
      >
        <ScrollStackDeck
          title=""
          subtitle=""
          scrollIndicatorText=""
          showFooter={false}
          enableLenis={false}
        />
      </PreviewHint>
    </div>
  );
}
