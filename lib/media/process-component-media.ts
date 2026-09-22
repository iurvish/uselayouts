import "server-only";

import { createHash } from "crypto";

import { firstFrameJpeg } from "@/lib/media/video-frame";
import { reencodeVideoToMp4 } from "@/lib/media/reencode-video";
import { deleteCdnObject, uploadToR2 } from "@/lib/r2/upload";

/** 2× a ~640px browse column — enough for retina without smearing UI text. */
const POSTER_WIDTH = 1280;
/** AVIF 85 ≈ visually lossless for screenshots; much smaller than PNG/JPEG. */
const POSTER_QUALITY = 85;

export type ComponentMediaResult = {
  posterUrl: string;
  videoUrl: string | null;
  posterBytes: number;
  videoSourceBytes: number | null;
  videoDeliveryBytes: number | null;
};

async function encodePoster(input: Buffer) {
  // Dynamic import keeps sharp out of Next's build-time page-data graph and
  // avoids loading the wrong platform binary during `next build` on Vercel.
  const sharp = (await import("sharp")).default;
  return sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: POSTER_WIDTH, withoutEnlargement: true })
    .avif({ quality: POSTER_QUALITY, effort: 5 })
    .toBuffer();
}

function shortHash(buf: Buffer) {
  return createHash("sha1").update(buf).digest("hex").slice(0, 10);
}

/**
 * Compress + upload component browse media to R2:
 * - Image → AVIF poster
 * - Video → H.264 CRF 23, ≤1080p, ≤45s, muted, +faststart
 * - Optional first-frame poster fallback if no image provided
 *
 * Keys are content-hashed so re-uploads bust CDN/browser cache.
 * Previous CDN URLs are deleted after a successful replace.
 */
export async function processComponentMedia(input: {
  slug: string;
  image?: Buffer | null;
  video?: Buffer | null;
  previousPosterUrl?: string | null;
  previousVideoUrl?: string | null;
}): Promise<ComponentMediaResult> {
  const keyPrefix = `components/${input.slug}`;
  let posterUrl: string | null = null;
  let posterBytes = 0;
  let videoUrl: string | null = null;
  let deliveryVideo: Buffer | null = null;
  let videoSourceBytes: number | null = null;
  let videoDeliveryBytes: number | null = null;

  if (input.video && input.video.length > 0) {
    videoSourceBytes = input.video.length;
    deliveryVideo = await reencodeVideoToMp4(input.video);
    videoDeliveryBytes = deliveryVideo.length;
    videoUrl = await uploadToR2({
      key: `${keyPrefix}/video-${shortHash(deliveryVideo)}.mp4`,
      body: deliveryVideo,
      contentType: "video/mp4",
    });
  }

  if (input.image && input.image.length > 0) {
    const posterAvif = await encodePoster(input.image);
    posterBytes = posterAvif.length;
    posterUrl = await uploadToR2({
      key: `${keyPrefix}/poster-${shortHash(posterAvif)}.avif`,
      body: posterAvif,
      contentType: "image/avif",
    });
  } else if (deliveryVideo) {
    const frame = await firstFrameJpeg(deliveryVideo);
    if (frame) {
      const posterAvif = await encodePoster(frame);
      posterBytes = posterAvif.length;
      posterUrl = await uploadToR2({
        key: `${keyPrefix}/poster-${shortHash(posterAvif)}.avif`,
        body: posterAvif,
        contentType: "image/avif",
      });
    }
  }

  if (!posterUrl && !videoUrl) {
    throw new Error("Upload an image (or a video we can posterize).");
  }

  // Keep previous poster when only a video was uploaded and we couldn't posterize.
  if (!posterUrl && input.previousPosterUrl) {
    posterUrl = input.previousPosterUrl;
  }

  if (!posterUrl) {
    throw new Error("Upload an image (or a video we can posterize).");
  }

  if (posterUrl !== input.previousPosterUrl) {
    await deleteCdnObject(input.previousPosterUrl);
  }
  if (videoUrl && videoUrl !== input.previousVideoUrl) {
    await deleteCdnObject(input.previousVideoUrl);
  }

  return {
    posterUrl,
    videoUrl,
    posterBytes,
    videoSourceBytes,
    videoDeliveryBytes,
  };
}
