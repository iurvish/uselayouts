import { promises as fs } from "fs";
import path from "path";

import { browseItems, browseUploadedMedia, type BrowseItem } from "@/lib/browse/items";

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "registry/default/landing-categories.json");

export type LandingCategoryId =
  | "layouts"
  | "navigation"
  | "interactions"
  | "user-interface";

export type LandingCategoryDef = {
  id: LandingCategoryId;
  title: string;
  /** Counts components in this browse category (admin filter / catalog). */
  browseCategory: BrowseItem["category"];
  /** Marketing badge — sum of the four must stay ≤ 64. */
  countLabel: string;
  panel: string;
  badgeGradient: string;
  /** Chips from our real tag vocabulary. */
  tags: string[];
  defaultSlug: string;
};

/** Static chrome for the four homepage category cards. */
export const LANDING_CATEGORY_DEFS: LandingCategoryDef[] = [
  {
    id: "layouts",
    title: "Layouts",
    browseCategory: "Layout",
    countLabel: "12+",
    panel: "#879F6C",
    badgeGradient:
      "linear-gradient(in oklab 167.62deg, oklab(100% 0 0 / 20%) 16.5%, oklab(67.1% -0.048 0.060 / 0%) 93.5%)",
    tags: ["Grid", "Bento", "Hero", "Sections"],
    defaultSlug: "fluid-expanding-grid",
  },
  {
    id: "navigation",
    title: "Navigation",
    browseCategory: "Navigation",
    countLabel: "14+",
    panel: "#2495D1",
    badgeGradient:
      "linear-gradient(in oklab 167.62deg, oklab(100% 0 0 / 20%) 16.5%, oklab(63.7% -0.069 -0.111 / 20%) 93.5%)",
    tags: ["Navbar", "Tabs", "Menu", "Sidebar"],
    defaultSlug: "gooey-navbar",
  },
  {
    id: "interactions",
    title: "Interactions",
    browseCategory: "Button",
    countLabel: "18+",
    panel: "#BC6147",
    badgeGradient:
      "linear-gradient(in oklab 167.62deg, oklab(100% 0 0 / 20%) 16.5%, oklab(59.5% 0.099 0.074 / 20%) 93.5%)",
    tags: ["Hover", "Drag", "Press", "Reveal"],
    defaultSlug: "delete-button",
  },
  {
    id: "user-interface",
    title: "User Interface",
    browseCategory: "Display",
    countLabel: "20+",
    panel: "#B6547A",
    badgeGradient:
      "linear-gradient(in oklab 167.62deg, oklab(100% 0 0 / 20%) 16.5%, oklab(57.9% 0.133 -0.005 / 20%) 93.5%)",
    tags: ["Cards", "Forms", "Gallery", "Pricing"],
    defaultSlug: "pricing-card",
  },
];

export type LandingCategoriesConfig = Record<LandingCategoryId, string>;

function emptyConfig(): LandingCategoriesConfig {
  return {
    layouts: "",
    navigation: "",
    interactions: "",
    "user-interface": "",
  };
}

export async function readLandingCategoriesConfig(): Promise<LandingCategoriesConfig> {
  const base = emptyConfig();
  try {
    const raw = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8")) as Record<
      string,
      unknown
    >;
    for (const def of LANDING_CATEGORY_DEFS) {
      const value = raw[def.id];
      if (typeof value === "string" && value.trim()) base[def.id] = value.trim();
    }
  } catch {
    // missing file → defaults
  }
  return base;
}

export async function writeLandingCategoriesConfig(
  next: Partial<LandingCategoriesConfig>,
): Promise<LandingCategoriesConfig> {
  const known = new Set(browseItems.map((item) => item.slug));
  const current = await readLandingCategoriesConfig();
  const saved = emptyConfig();
  for (const def of LANDING_CATEGORY_DEFS) {
    const slug = (next[def.id] ?? current[def.id] ?? "").trim();
    saved[def.id] = known.has(slug) ? slug : def.defaultSlug;
  }
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(saved, null, 2) + "\n");
  return saved;
}

export type LandingCategoryCard = {
  id: LandingCategoryId;
  title: string;
  countLabel: string;
  panel: string;
  badgeGradient: string;
  tags: string[];
  slug: string;
  href: string;
  poster: string;
  video: string;
};

function resolveSlug(preferred: string, fallback: string): BrowseItem {
  const bySlug = new Map(browseItems.map((item) => [item.slug, item]));
  return bySlug.get(preferred) ?? bySlug.get(fallback) ?? browseItems[0]!;
}

export function resolveLandingCategoryCards(
  config: LandingCategoriesConfig,
): LandingCategoryCard[] {
  return LANDING_CATEGORY_DEFS.map((def) => {
    const item = resolveSlug(config[def.id], def.defaultSlug);
    const media = browseUploadedMedia(item.slug);

    return {
      id: def.id,
      title: def.title,
      countLabel: def.countLabel,
      panel: def.panel,
      badgeGradient: def.badgeGradient,
      tags: def.tags,
      slug: item.slug,
      href: `/docs/components/${item.slug}`,
      poster: media.poster || item.poster,
      video: media.video,
    };
  });
}

export async function getLandingCategoryCards(): Promise<LandingCategoryCard[]> {
  const config = await readLandingCategoriesConfig();
  return resolveLandingCategoryCards(config);
}
