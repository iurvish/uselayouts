"use client";

import { CardStack, DEFAULT_CARDS } from "@/registry/default/example/accessible-action";

export default function AccessibleActionDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden">
      <CardStack items={DEFAULT_CARDS} />
    </div>
  );
}
