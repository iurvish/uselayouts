"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
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

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Components</h1>
          <p className="text-sm text-muted-foreground">
            Upload, edit, and generate MDX locally. No database — files only.
          </p>
        </div>
        <Link href="/admin/new" className={cn(buttonVariants())}>
          New component
        </Link>
      </div>

      <div className="divide-y rounded-xl border">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{item.title}</p>
                <code className="text-xs text-muted-foreground">{item.name}</code>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.controlsCount} dial controls
                {item.disabledCount > 0
                  ? ` · ${item.disabledCount} disabled`
                  : ""}
                {item.hasMdx ? " · MDX ready" : " · missing MDX"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/docs/components/${item.name}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                View
              </Link>
              <Link
                href={`/admin/${item.name}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Edit
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item.name)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
