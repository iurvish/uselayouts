"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Item = {
  name: string;
  title: string;
  description: string;
  hasMdx: boolean;
  controlsCount: number;
  disabledCount: number;
};

export default function AdminHomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/components")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setItems(data.items);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [items, query]);

  async function handleDelete(name: string) {
    if (!confirm(`Delete ${name}? This removes local files and MDX.`)) return;
    const res = await fetch(`/api/admin/components/${name}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }
    setItems((prev) => prev.filter((i) => i.name !== name));
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading components…</p>;
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Components</h1>
          <p className="text-sm text-muted-foreground">
            Local file editor — paste code, generate MDX, upload browse media.
          </p>
        </div>
        <Link href="/admin/new" className={cn(buttonVariants())}>
          <Plus data-icon="inline-start" />
          New component
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by title, slug, or description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} of {items.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-medium">No components match</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {items.length === 0
                ? "Create your first component to start editing locally."
                : "Try a different search, or clear the filter."}
            </p>
            {items.length === 0 ? (
              <Link href="/admin/new" className={cn(buttonVariants({ size: "sm" }))}>
                New component
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <ul className="divide-y divide-border">
            {filtered.map((item) => (
              <li
                key={item.name}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {item.name}
                    </code>
                    {item.hasMdx ? (
                      <Badge variant="secondary">MDX</Badge>
                    ) : (
                      <Badge variant="outline">No MDX</Badge>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {item.controlsCount} dial
                    {item.controlsCount === 1 ? "" : "s"}
                    {item.disabledCount > 0
                      ? ` · ${item.disabledCount} disabled`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/docs/components/${item.name}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Open
                  </Link>
                  <Link
                    href={`/admin/${item.name}`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                  >
                    Edit
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item.name)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
