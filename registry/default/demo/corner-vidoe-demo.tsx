"use client";

import { PreviewHint } from "@/components/open/preview-hint";
import CornerVideoPlayer from "@/registry/default/example/corner-vidoe";

export default function CornerVidoeDemo() {
  return (
    <div className="h-full w-full min-w-0 overflow-hidden">
      <PreviewHint
        heading="Corner player with a smooth morph"
        description="Close collapses into a pill without a blank flash. Hover for mute, enlarge, and scrub."
      >
        <CornerVideoPlayer />
      </PreviewHint>
    </div>
  );
}
