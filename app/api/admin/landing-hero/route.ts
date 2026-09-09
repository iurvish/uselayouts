import { NextResponse } from "next/server";
import { isDev } from "@/lib/admin/guard";
import {
  LANDING_HERO_LIMIT,
  readLandingHeroConfig,
  writeLandingHeroConfig,
} from "@/lib/landing/hero-components";
import { browseItems } from "@/lib/browse/items";

export async function GET() {
  if (!isDev()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const config = await readLandingHeroConfig();
  return NextResponse.json({
    slugs: config.slugs,
    limit: LANDING_HERO_LIMIT,
    catalog: browseItems.map((item) => ({
      slug: item.slug,
      title: item.title,
      poster: item.poster,
    })),
  });
}

export async function PUT(req: Request) {
  if (!isDev()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json()) as { slugs?: unknown };
  if (!Array.isArray(body.slugs) || body.slugs.some((s) => typeof s !== "string")) {
    return NextResponse.json({ error: "slugs must be a string array" }, { status: 400 });
  }
  const known = new Set(browseItems.map((item) => item.slug));
  const slugs = body.slugs.filter((slug): slug is string => known.has(slug));
  const saved = await writeLandingHeroConfig(slugs);
  return NextResponse.json(saved);
}
