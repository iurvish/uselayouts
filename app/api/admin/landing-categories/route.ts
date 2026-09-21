import { NextResponse } from "next/server";
import { isDev } from "@/lib/admin/guard";
import {
  LANDING_CATEGORY_DEFS,
  readLandingCategoriesConfig,
  writeLandingCategoriesConfig,
  type LandingCategoryId,
  type LandingCategoriesConfig,
} from "@/lib/landing/categories";
import { browseItems } from "@/lib/browse/items";

export async function GET() {
  if (!isDev()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const slugs = await readLandingCategoriesConfig();
  return NextResponse.json({
    slugs,
    categories: LANDING_CATEGORY_DEFS.map((def) => ({
      id: def.id,
      title: def.title,
      browseCategory: def.browseCategory,
      defaultSlug: def.defaultSlug,
    })),
    catalog: browseItems.map((item) => ({
      slug: item.slug,
      title: item.title,
      poster: item.poster,
      category: item.category,
      hasVideo: Boolean(
        browseItems.find((entry) => entry.slug === item.slug) &&
          // uploaded only — mirrors browseUploadedMedia
          item.video &&
          !item.video.includes("cloudinary.com/demo") &&
          !item.video.includes("videos.pexels.com"),
      ),
    })),
  });
}

export async function PUT(req: Request) {
  if (!isDev()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json()) as { slugs?: unknown };
  if (!body.slugs || typeof body.slugs !== "object" || Array.isArray(body.slugs)) {
    return NextResponse.json({ error: "slugs must be an object" }, { status: 400 });
  }
  const knownIds = new Set(LANDING_CATEGORY_DEFS.map((def) => def.id));
  const knownSlugs = new Set(browseItems.map((item) => item.slug));
  const next: Partial<LandingCategoriesConfig> = {};
  for (const [id, value] of Object.entries(body.slugs as Record<string, unknown>)) {
    if (!knownIds.has(id as LandingCategoryId)) continue;
    if (typeof value !== "string" || !knownSlugs.has(value)) continue;
    next[id as LandingCategoryId] = value;
  }
  const saved = await writeLandingCategoriesConfig(next);
  return NextResponse.json({ slugs: saved });
}
