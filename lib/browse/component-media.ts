import { promises as fs } from "fs";
import path from "path";

import type { ComponentControlsMeta } from "@/lib/admin/components-fs";

const CONTROLS_DIR = path.join(process.cwd(), "registry/default/controls");

export type ComponentBrowseMedia = {
  posterUrl?: string;
  videoUrl?: string;
};

/** Read poster/video CDN URLs from the component controls file (if present). */
export async function readComponentBrowseMedia(
  slug: string,
): Promise<ComponentBrowseMedia> {
  try {
    const raw = await fs.readFile(path.join(CONTROLS_DIR, `${slug}.json`), "utf8");
    const meta = JSON.parse(raw) as ComponentControlsMeta;
    return {
      posterUrl: meta.posterUrl,
      videoUrl: meta.videoUrl,
    };
  } catch {
    return {};
  }
}

/** Sync helper for client-safe modules that already have controls in memory. */
export function mediaFromControls(
  controls: ComponentControlsMeta | null | undefined,
): ComponentBrowseMedia {
  if (!controls) return {};
  return {
    posterUrl: controls.posterUrl,
    videoUrl: controls.videoUrl,
  };
}
