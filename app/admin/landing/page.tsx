"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LANDING_HERO_LIMIT } from "@/lib/landing/constants";

type CatalogItem = { slug: string; title: string; poster: string };

export default function AdminLandingHeroPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/landing-hero")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setCatalog(data.catalog);
        setSelected(data.slugs);
      })
      .catch((err) => setError(err.message));
  }, []);

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= LANDING_HERO_LIMIT) return prev;
      return [...prev, slug];
    });
    setSavedAt(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/landing-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSelected(data.slugs);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Landing hero</h1>
          <p className="text-sm text-muted-foreground">
            Pick up to {LANDING_HERO_LIMIT} components for the homepage spotlight canvas.
            Order is selection order.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {selected.length}/{LANDING_HERO_LIMIT}
            {savedAt ? ` · saved ${savedAt}` : null}
          </p>
          <Button onClick={save} disabled={saving || selected.length === 0}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Components</CardTitle>
          <CardDescription>
            Selected cards show posters immediately; videos load after the page is idle and
            only play on the spotlighted card.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalog.map((item) => {
              const active = selected.includes(item.slug);
              const full = !active && selected.length >= LANDING_HERO_LIMIT;
              return (
                <button
                  key={item.slug}
                  type="button"
                  disabled={full}
                  onClick={() => toggle(item.slug)}
                  className={cn(
                    "overflow-hidden rounded-xl border text-left transition-[box-shadow,border-color] duration-150",
                    active
                      ? "border-foreground shadow-sm"
                      : "border-border hover:border-foreground/40",
                    full && "opacity-40",
                  )}
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image src={item.poster} alt="" fill className="object-cover" sizes="240px" />
                    {active ? (
                      <span className="absolute top-2 left-2 rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium text-background">
                        {selected.indexOf(item.slug) + 1}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-0.5 p-3">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {item.slug}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
