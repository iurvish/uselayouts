"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Row = {
  name: string;
  title: string;
  description: string;
  poster: string;
  video: string;
  copies: number;
  lastCopiedAt: string | null;
  addedAt: string | null;
  isNew: boolean;
  hasMdx: boolean;
  controlsCount: number;
  tags: string[];
};

type Totals = {
  totalCopies: number;
  copied: number;
  never: number;
  components: number;
  topCopies: number | null;
};

/** "3 days ago" from an ISO stamp, or null when there is nothing to say. */
function ago(iso: string | null) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * The thumbnail. Shows the still, and swaps to the uploaded clip on hover
 * where one exists — autoplaying every card at once would mean dozens of
 * simultaneous video decodes on a catalogue this size.
 */
function Thumb({ row }: { row: Row }) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-44"
      onMouseEnter={() => {
        if (row.video) void video.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        const el = video.current;
        if (!el) return;
        el.pause();
        el.currentTime = 0;
      }}
    >
      {row.poster && !failed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={row.poster}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
          No media
        </div>
      )}

      {row.video ? (
        <video
          ref={video}
          src={row.video}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 hover:opacity-100"
        />
      ) : null}
    </div>
  );
}

export default function AdminCopiesPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [onlyCopied, setOnlyCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/copies")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setItems(data.items);
        setTotals(data.totals);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (onlyCopied && item.copies === 0) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.includes(q))
      );
    });
  }, [items, query, onlyCopied]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading copy counts…</p>;
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  const top = totals?.topCopies ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Copies</h1>
          <p className="text-sm text-muted-foreground">
            What people actually take. Ranked by total copies, counted only when
            someone signed in copies a component.
          </p>
        </div>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          All components
        </Link>
      </div>

      {totals ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total copies", value: totals.totalCopies },
            { label: "Components copied", value: totals.copied },
            { label: "Never copied", value: totals.never },
            { label: "In catalogue", value: totals.components },
          ].map((stat) => (
            <Card key={stat.label} className="py-0">
              <CardContent className="px-4 py-3">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-semibold tabular-nums">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by title, slug, or tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={onlyCopied ? "secondary" : "outline"}
            size="sm"
            onClick={() => setOnlyCopied((prev) => !prev)}
          >
            {onlyCopied ? "Showing copied only" : "Show copied only"}
          </Button>
          <p className="text-xs text-muted-foreground tabular-nums">
            {filtered.length} of {items.length}
          </p>
        </div>
      </div>

      {totals && totals.totalCopies === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-sm font-medium">No copies recorded yet</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Copies are logged against a signed-in user. Either nobody has
              copied anything yet, or this environment is not pointed at the
              Supabase project that holds the counts.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-medium">No components match</p>
            <Button variant="outline" size="sm" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <ul className="divide-y divide-border">
            {filtered.map((row) => {
              // Rank comes from the unfiltered list, so filtering never
              // renumbers a component and makes it look like it moved.
              const rank = items.indexOf(row) + 1;
              const share = top && top > 0 ? (row.copies / top) * 100 : 0;
              const last = ago(row.lastCopiedAt);

              return (
                <li
                  key={row.name}
                  className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex w-8 shrink-0 items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground tabular-nums">
                      {rank}
                    </span>
                  </div>

                  <Thumb row={row} />

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{row.title}</p>
                      <code className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {row.name}
                      </code>
                      {row.isNew ? <Badge>New</Badge> : null}
                      {row.video ? null : (
                        <Badge variant="outline" className="font-normal">
                          Still only
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold tabular-nums">
                        {row.copies}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {row.copies === 1 ? "copy" : "copies"}
                        {last ? ` · last ${last}` : " · never copied"}
                        {row.addedAt ? ` · added ${row.addedAt}` : ""}
                      </span>
                    </div>

                    {/* Share of the most-copied component, so the gap between
                        first and fifth is visible without reading figures. */}
                    <div
                      className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${Math.round(share)}% of the most copied component`}
                    >
                      <div
                        className="h-full rounded-full bg-foreground/70"
                        style={{ width: `${Math.max(share, row.copies > 0 ? 2 : 0)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/docs/components/${row.name}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Open
                    </Link>
                    <Link
                      href={`/admin/${row.name}`}
                      className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
