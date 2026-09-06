import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const MEDIA_MAP_PATH = path.join(ROOT, "registry/default/browse-media.json");

export type BrowseMediaOverride = {
  posterUrl: string;
  videoUrl?: string;
};

export type BrowseMediaMap = Record<string, BrowseMediaOverride>;

export async function readBrowseMediaMap(): Promise<BrowseMediaMap> {
  try {
    return JSON.parse(await fs.readFile(MEDIA_MAP_PATH, "utf8")) as BrowseMediaMap;
  } catch {
    return {};
  }
}

export async function writeBrowseMediaOverride(
  slug: string,
  media: BrowseMediaOverride,
): Promise<BrowseMediaMap> {
  const map = await readBrowseMediaMap();
  map[slug] = {
    posterUrl: media.posterUrl,
    ...(media.videoUrl ? { videoUrl: media.videoUrl } : {}),
  };
  await fs.mkdir(path.dirname(MEDIA_MAP_PATH), { recursive: true });
  await fs.writeFile(MEDIA_MAP_PATH, JSON.stringify(map, null, 2) + "\n");
  return map;
}
