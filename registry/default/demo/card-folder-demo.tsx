"use client";

import { PreviewHint } from "@/components/open/preview-hint";
import FolderCards from "@/registry/default/example/card-folder";

export default function CardFolderDemo() {
  return (
    <div className="h-full w-full min-w-0 overflow-hidden bg-[#FAF8F5]">
      <PreviewHint
        tone="light"
        heading="Hover to peek"
        description="A playful filing system for design ops, research, and launch work."
      >
        <FolderCards />
      </PreviewHint>
    </div>
  );
}
