import "server-only";

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlink, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ffmpegBin } from "@/lib/media/ffmpeg-bin";

/** Max long-edge for delivery MP4. */
const MAX_EDGE = 1080;
/** Cap so a single clip can't blow R2 storage. */
const MAX_DURATION_SEC = 45;
/** H.264 quality — CRF 23 stays visually strong for UI/motion. */
const CRF = "23";
/**
 * x264 preset. Measured against near-lossless 1920x1200/60 sources, holding CRF
 * at 23 and scoring the result with VMAF against a lossless scaled reference:
 *
 *   clip          fast        veryslow            size     VMAF
 *   UI motion     282 KB      231 KB    94.75 -> 95.58     -18%    +0.8
 *   gradient pan  907 KB      526 KB    95.17 -> 94.98     -42%    -0.2
 *   high detail  1203 KB      953 KB    93.28 -> 94.53     -21%    +1.3
 *
 * Smaller and no worse perceptually on the content these cards actually show
 * (flat panels, UI text, eased motion). The cost is encode time, ~3-5x, which
 * a 45s cap keeps well inside ENCODE_TIMEOUT_MS. Full-frame photographic pans
 * are the one case that grows (+19%, at +1.0 VMAF); browse previews are not that.
 */
const PRESET = "veryslow";
/** 4K screen recordings need headroom after scale+libx264. */
const ENCODE_TIMEOUT_MS = 240_000;

function sniffExt(buf: Buffer) {
  if (buf.length >= 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return ".webm";
  }
  return ".mp4";
}

/**
 * Re-encode source video to a lean progressive H.264 MP4 for R2.
 * Audio stripped — browse cards play muted.
 */
export async function reencodeVideoToMp4(input: Buffer): Promise<Buffer> {
  if (input.length === 0) throw new Error("Empty video.");
  const bin = ffmpegBin();

  const id = randomUUID();
  const inPath = join(tmpdir(), `ul-in-${id}${sniffExt(input)}`);
  const outPath = join(tmpdir(), `ul-out-${id}.mp4`);

  try {
    await writeFile(inPath, input);

    const stderrChunks: Buffer[] = [];
    let spawnError = "";
    const code = await new Promise<number | null>((resolve) => {
      const proc = spawn(
        bin,
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
          PRESET,
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

      proc.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

      let settled = false;
      const finish = (exit: number | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(exit);
      };

      proc.on("error", (err) => {
        spawnError = err.message;
        finish(null);
      });
      proc.on("close", (exit) => finish(exit));

      const timer = setTimeout(() => {
        spawnError = `timed out after ${ENCODE_TIMEOUT_MS / 1000}s`;
        try {
          proc.kill("SIGKILL");
        } catch {
          /* already gone */
        }
        finish(null);
      }, ENCODE_TIMEOUT_MS);
    });

    if (code !== 0) {
      const detail = Buffer.concat(stderrChunks).toString("utf8").trim();
      throw new Error(
        [detail, spawnError, code == null ? null : `exit ${code}`]
          .filter(Boolean)
          .join(" — ") || "ffmpeg re-encode failed.",
      );
    }
    return await readFile(outPath);
  } finally {
    unlink(inPath).catch(() => {});
    unlink(outPath).catch(() => {});
  }
}
