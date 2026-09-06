"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  parseDependencyTag,
  serializeDependencyTag,
} from "@/lib/open/package-manager";

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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Packages</span>
        <Tooltip>
          <TooltipTrigger
            type="button"
            className="inline-flex size-5 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground"
            aria-label="About dependencies"
          >
            ?
          </TooltipTrigger>
          <TooltipContent>
            External packages this component needs. Manual install on the public page uses these.
          </TooltipContent>
        </Tooltip>
      </div>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 py-1 pr-1 pl-2.5 text-xs"
            >
              <span className="font-medium">{tag.name}</span>
              {tag.version ? (
                <span className="text-muted-foreground">{tag.version}</span>
              ) : null}
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
      ) : (
        <p className="text-xs text-muted-foreground">No packages yet — add one or paste code.</p>
      )}
      <div className="grid grid-cols-[1.4fr_0.8fr_auto] gap-2">
        <Input
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
        <Input
          placeholder="Version"
          value={version}
          onChange={(event) => setVersion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={commit}>
          Add
        </Button>
      </div>
    </div>
  );
}
