"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LANDING_HERO_LIMIT } from "@/lib/landing/constants";
import type { LandingCategoryId } from "@/lib/landing/categories";

type CatalogItem = {
  slug: string;
  title: string;
  poster: string;
  category?: string;
  hasVideo?: boolean;
};

type CategoryMeta = {
  id: LandingCategoryId;
  title: string;
  browseCategory: string;
  defaultSlug: string;
};

export default function AdminLandingHeroPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [categoryMeta, setCategoryMeta] = useState<CategoryMeta[]>([]);
  const [categorySlugs, setCategorySlugs] = useState<
    Partial<Record<LandingCategoryId, string>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingCategories, setSavingCategories] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [categoriesSavedAt, setCategoriesSavedAt] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/landing-hero").then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load hero");
        return data as { catalog: CatalogItem[]; slugs: string[] };
      }),
      fetch("/api/admin/landing-categories").then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load categories");
        return data as {
          catalog: CatalogItem[];
          slugs: Record<LandingCategoryId, string>;
          categories: CategoryMeta[];
        };
      }),
    ])
      .then(([hero, cats]) => {
        setCatalog(cats.catalog.length ? cats.catalog : hero.catalog);
        setSelected(hero.slugs);
        setCategoryMeta(cats.categories);
        setCategorySlugs(cats.slugs);
      })
      .catch((err) => setError(err.message));
  }, []);

  const catalogBySlug = useMemo(
    () => new Map(catalog.map((item) => [item.slug, item])),
    [catalog],
  );

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

  async function saveCategories() {
    setSavingCategories(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/landing-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: categorySlugs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setCategorySlugs(data.slugs);
      setCategoriesSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingCategories(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Landing</h1>
          <p className="text-sm text-muted-foreground">
            Hero spotlight components and category-card preview videos.
          </p>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Hero spotlight</h2>
            <p className="text-sm text-muted-foreground">
              Pick up to {LANDING_HERO_LIMIT} components. Order is selection order.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {selected.length}/{LANDING_HERO_LIMIT}
              {savedAt ? ` · saved ${savedAt}` : null}
            </p>
            <Button onClick={save} disabled={saving || selected.length === 0}>
              {saving ? "Saving…" : "Save hero"}
            </Button>
          </div>
        </div>

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
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Category cards</h2>
            <p className="text-sm text-muted-foreground">
              Choose which component video/poster each homepage category card shows. Clicking the
              card opens that component.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {categoriesSavedAt ? `saved ${categoriesSavedAt}` : "unsaved"}
            </p>
            <Button onClick={saveCategories} disabled={savingCategories}>
              {savingCategories ? "Saving…" : "Save categories"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {categoryMeta.map((cat) => {
            const slug = categorySlugs[cat.id] ?? cat.defaultSlug;
            const picked = catalogBySlug.get(slug);
            const options = catalog;
            return (
              <Card key={cat.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{cat.title}</CardTitle>
                  <CardDescription>
                    Browse category: {cat.browseCategory}
                    {picked?.hasVideo ? " · has uploaded video" : " · poster only until video upload"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {picked ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={picked.poster}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                    </div>
                  ) : null}
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Preview component
                    </span>
                    <select
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                      value={slug}
                      onChange={(event) => {
                        setCategorySlugs((prev) => ({
                          ...prev,
                          [cat.id]: event.target.value,
                        }));
                        setCategoriesSavedAt(null);
                      }}
                    >
                      {options.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.title}
                          {item.hasVideo ? "" : " (no video)"}
                        </option>
                      ))}
                    </select>
                  </label>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
