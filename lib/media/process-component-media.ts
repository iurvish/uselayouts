import "server-only";

import sharp from "sharp";

import { firstFrameJpeg } from "@/lib/media/video-frame";
import { reencodeVideoToMp4 } from "@/lib/media/reencode-video";
import { uploadToR2 } from "@/lib/r2/upload";

const POSTER_WIDTH = 880;
const THUMB_WIDTH = 640;

export type ComponentMediaResult = {
  posterUrl: string;
  videoUrl: string | null;
};

/**
 * Compress + upload component browse media to R2 (same technique as internetdesigns):
 * - Image → AVIF poster (long-lived CDN cache)
 * - Video → H.264 CRF 23, ≤1080p, ≤45s, muted, +faststart
 * - Optional first-frame poster fallback if no image provided
 */
export async function processComponentMedia(input: {
  slug: string;
  image?: Buffer | null;
  video?: Buffer | null;
}): Promise<ComponentMediaResult> {
  const keyPrefix = `components/${input.slug}`;
  let posterUrl: string | null = null;
  let videoUrl: string | null = null;
  let deliveryVideo: Buffer | null = null;

  if (input.video && input.video.length > 0) {
    const encoded = await reencodeVideoToMp4(input.video);
    deliveryVideo = encoded ?? input.video;
    if (!encoded) {
      console.warn(
        "[processComponentMedia] re-encode failed or ffmpeg missing; uploading source bytes",
        input.slug,
      );
    }
    videoUrl = await uploadToR2({
      key: `${keyPrefix}/video.mp4`,
      body: deliveryVideo,
      contentType: "video/mp4",
    });
  }

  if (input.image && input.image.length > 0) {
    const posterAvif = await sharp(input.image, { failOn: "none" })
      .rotate()
      .resize({ width: POSTER_WIDTH, withoutEnlargement: true })
      .avif({ quality: 68, effort: 4 })
      .toBuffer();
    posterUrl = await uploadToR2({
      key: `${keyPrefix}/poster.avif`,
      body: posterAvif,
      contentType: "image/avif",
    });
  } else if (deliveryVideo) {
    const frame = await firstFrameJpeg(deliveryVideo);
    if (frame) {
      const posterAvif = await sharp(frame, { failOn: "none" })
        .rotate()
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .avif({ quality: 60, effort: 4 })
        .toBuffer();
      posterUrl = await uploadToR2({
        key: `${keyPrefix}/poster.avif`,
        body: posterAvif,
        contentType: "image/avif",
      });
    }
  }

  if (!posterUrl) {
    throw new Error("Upload an image (or a video we can posterize).");
  }

  return { posterUrl, videoUrl };
}
