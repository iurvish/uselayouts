import "server-only";

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlink, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegStatic from "ffmpeg-static";

const ffmpegPath = ffmpegStatic as unknown as string | null;

/** Max long-edge for delivery MP4. */
const MAX_EDGE = 1080;
/** Cap so a single clip can't blow R2 storage. */
const MAX_DURATION_SEC = 45;
/** H.264 quality — CRF 23 stays visually strong for UI/motion. */
const CRF = "23";

/**
 * Re-encode source video to a lean progressive H.264 MP4 for R2.
 * Audio stripped — browse cards play muted. Returns null if ffmpeg fails.
 */
export async function reencodeVideoToMp4(input: Buffer): Promise<Buffer | null> {
  if (!ffmpegPath || input.length === 0) return null;

  const id = randomUUID();
  const inPath = join(tmpdir(), `ul-in-${id}.mp4`);
  const outPath = join(tmpdir(), `ul-out-${id}.mp4`);

  try {
    await writeFile(inPath, input);

    const ok = await new Promise<boolean>((resolve) => {
      const proc = spawn(
        ffmpegPath!,
        [
          "-hide_banner",
          "-loglevel",
          "error",
          "-y",
          "-i",
          inPath,
          "-t",
          String(MAX_DURATION_SEC),
          "-vf",
          `scale='min(${MAX_EDGE},iw)':'min(${MAX_EDGE},ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`,
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          CRF,
          "-pix_fmt",
          "yuv420p",
          "-an",
          "-movflags",
          "+faststart",
          outPath,
        ],
        { stdio: ["ignore", "ignore", "pipe"] },
      );

      let settled = false;
      const finish = (success: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(success);
      };

      proc.on("error", () => finish(false));
      proc.on("close", (code) => finish(code === 0));

      const timer = setTimeout(() => {
        try {
          proc.kill("SIGKILL");
        } catch {
          /* already gone */
        }
        finish(false);
      }, 120_000);
    });

    if (!ok) return null;
    return await readFile(outPath);
  } catch {
    return null;
  } finally {
    unlink(inPath).catch(() => {});
    unlink(outPath).catch(() => {});
  }
}
