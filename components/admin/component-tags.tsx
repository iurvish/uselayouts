"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeTags } from "@/lib/component-tags";

export function ComponentTags({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = React.useState("");
  const tags = normalizeTags(value);

  function commit() {
    const next = normalizeTags([...tags, ...draft.split(/[,\n]/)]);
    if (next.length === tags.length && !draft.trim()) return;
    onChange(next);
    setDraft("");
  }

  function remove(tag: string) {
    onChange(tags.filter((entry) => entry !== tag));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Tags</span>
      </div>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 py-1 pr-1 pl-2.5 text-xs"
            >
              <span className="font-medium">{tag}</span>
              <button
                type="button"
                className="grid size-5 place-items-center rounded-full hover:bg-background"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No tags yet — add ones people would search, like delete or carousel.
        </p>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="delete, button"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
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
