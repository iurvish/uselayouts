import "server-only";

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import ffmpegStatic from "ffmpeg-static";

const require = createRequire(import.meta.url);

/** Resolve the ffmpeg-static binary even when Next bundles this module. */
export function ffmpegBin(): string {
  const names = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const candidates: string[] = [];
  if (ffmpegStatic) candidates.push(ffmpegStatic);
  if (process.env.FFMPEG_BIN) candidates.push(process.env.FFMPEG_BIN);
  try {
    candidates.push(path.join(path.dirname(require.resolve("ffmpeg-static/package.json")), names));
  } catch {
    /* package not resolvable */
  }

  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      `ffmpeg binary not found. Looked at: ${candidates.join(", ") || "(none)"}.`,
    );
  }
  return found;
}
