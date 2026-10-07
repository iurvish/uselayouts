"use client";

import { useState } from "react";

import ExpandingAvatars from "@/registry/default/example/expanding-avatars";

export default function ExpandingAvatarsDemo() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative flex h-full w-full min-w-0 flex-col items-center justify-center overflow-hidden px-4 py-12">
      <ExpandingAvatars key={run} />
      <button
        className="mt-4 cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        onClick={() => setRun((n) => n + 1)}
        type="button"
      >
        Replay
      </button>
    </div>
  );
}
