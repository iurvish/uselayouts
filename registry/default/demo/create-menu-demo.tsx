"use client";

import CreateMenu from "@/registry/default/example/create-menu";

export default function CreateMenuPreview() {
  return (
    <div className="flex aspect-[16/10] w-full max-w-[860px] overflow-hidden rounded-2xl border border-border bg-muted/40">
      <div className="flex w-[240px] shrink-0 flex-col gap-3 border-r border-border bg-background p-3">
        <div className="mb-1 flex items-center gap-2 px-1">
          <div className="size-7 rounded-lg bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
        <CreateMenu />
        <div className="mt-1 space-y-2 px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="size-4 rounded bg-muted" />
              <div
                className="h-3 rounded bg-muted"
                style={{ width: `${58 + (i % 3) * 12}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-2 px-1 pb-1">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-9 w-full rounded-lg bg-muted" />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-8 w-8 rounded-md bg-muted" />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted" />
          <div className="rounded-xl bg-muted" />
          <div className="col-span-2 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
