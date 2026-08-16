"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  parseDependencyTag,
  serializeDependencyTag,
} from "@/lib/open/package-manager";
import { cn } from "@/lib/utils";

export function DependencyTags({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const tags = React.useMemo(
    () =>
      value
        .split(",")
        .map((part) => parseDependencyTag(part))
        .filter((tag) => tag.name),
    [value],
  );
  const [name, setName] = React.useState("");
  const [version, setVersion] = React.useState("");

  function commit() {
    const next = serializeDependencyTag(name, version);
    if (!next) return;
    const exists = tags.some((tag) => tag.name === parseDependencyTag(next).name);
    const list = exists
      ? tags.map((tag) =>
          tag.name === parseDependencyTag(next).name ? parseDependencyTag(next) : tag,
        )
      : [...tags, parseDependencyTag(next)];
    onChange(list.map((tag) => serializeDependencyTag(tag.name, tag.version)).join(", "));
    setName("");
    setVersion("");
  }

  function remove(pkg: string) {
    onChange(
      tags
        .filter((tag) => tag.name !== pkg)
        .map((tag) => serializeDependencyTag(tag.name, tag.version))
        .join(", "),
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Dependencies</span>
        <Tooltip>
          <TooltipTrigger
            type="button"
            className="inline-flex size-5 items-center justify-center rounded-full border text-[11px] text-muted-foreground"
            aria-label="About dependencies"
          >
            ?
          </TooltipTrigger>
          <TooltipContent>
            External packages this component needs. Key is the package name, value is an optional version. Manual install on the public page uses these.
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.name}
            className="inline-flex items-center gap-1 rounded-full border bg-muted/40 py-1 pr-1 pl-2.5 text-xs"
          >
            <span className="font-medium">{tag.name}</span>
            {tag.version ? <span className="text-muted-foreground">{tag.version}</span> : null}
            <button
              type="button"
              className="grid size-5 place-items-center rounded-full hover:bg-background"
              onClick={() => remove(tag.name)}
              aria-label={`Remove ${tag.name}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-[1.4fr_0.8fr_auto] gap-2">
        <input
          className={cn(
            "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          )}
          placeholder="Package (motion)"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
        />
        <input
          className={cn(
            "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          )}
          placeholder="Version (optional)"
          value={version}
          onChange={(event) => setVersion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
        />
        <button
          type="button"
          onClick={commit}
          className="rounded-lg border px-3 text-sm hover:bg-muted"
        >
          Add
        </button>
      </div>
    </div>
  );
}
