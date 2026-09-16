import "server-only";

import sharp from "sharp";

import { firstFrameJpeg } from "@/lib/media/video-frame";
import { reencodeVideoToMp4 } from "@/lib/media/reencode-video";
import { uploadToR2 } from "@/lib/r2/upload";

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
  return sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: POSTER_WIDTH, withoutEnlargement: true })
    .avif({ quality: POSTER_QUALITY, effort: 5 })
    .toBuffer();
}

/**
 * Compress + upload component browse media to R2:
 * - Image → AVIF poster
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
      key: `${keyPrefix}/video.mp4`,
      body: deliveryVideo,
      contentType: "video/mp4",
    });
  }

  if (input.image && input.image.length > 0) {
    const posterAvif = await encodePoster(input.image);
    posterBytes = posterAvif.length;
    posterUrl = await uploadToR2({
      key: `${keyPrefix}/poster.avif`,
      body: posterAvif,
      contentType: "image/avif",
    });
  } else if (deliveryVideo) {
    const frame = await firstFrameJpeg(deliveryVideo);
    if (frame) {
      const posterAvif = await encodePoster(frame);
      posterBytes = posterAvif.length;
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

  return {
    posterUrl,
    videoUrl,
    posterBytes,
    videoSourceBytes,
    videoDeliveryBytes,
  };
}
