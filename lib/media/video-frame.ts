import "server-only";

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegStatic from "ffmpeg-static";

const ffmpegPath = ffmpegStatic as unknown as string | null;

function runFfmpeg(inputArgs: string[]): Promise<Buffer | null> {
  if (!ffmpegPath) return Promise.resolve(null);
  return new Promise((resolve) => {
    const proc = spawn(
      ffmpegPath,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        ...inputArgs,
        "-frames:v",
        "1",
        "-f",
        "image2pipe",
        "-vcodec",
        "mjpeg",
        "pipe:1",
      ],
      { stdio: ["ignore", "pipe", "ignore"] },
    );
    const chunks: Buffer[] = [];
    let settled = false;
    const finish = (b: Buffer | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(b);
    };
    proc.stdout.on("data", (c: Buffer) => chunks.push(c));
    proc.on("error", () => finish(null));
    proc.on("close", (code) =>
      finish(code === 0 && chunks.length > 0 ? Buffer.concat(chunks) : null),
    );
    const timer = setTimeout(() => {
      try {
        proc.kill("SIGKILL");
      } catch {
        /* already gone */
      }
      finish(null);
    }, 20_000);
  });
}

/** First frame of a video buffer as JPEG, or null if unavailable. */
export async function firstFrameJpeg(input: Buffer): Promise<Buffer | null> {
  if (!ffmpegPath || input.length === 0) return null;
  const path = join(tmpdir(), `ul-frame-${randomUUID()}.mp4`);
  try {
    await writeFile(path, input);
    return await runFfmpeg(["-i", path]);
  } catch {
    return null;
  } finally {
    unlink(path).catch(() => {});
  }
}
