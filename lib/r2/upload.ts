import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { cdnUrl, r2Bucket, r2Client } from "@/lib/r2/client";

export type UploadInput = {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  /** Default: long-lived immutable cache for CDN. */
  cacheControl?: string;
};

/** Upload one object to R2; returns the public CDN URL. */
export async function uploadToR2(input: UploadInput): Promise<string> {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: r2Bucket(),
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: input.cacheControl ?? "public, max-age=31536000, immutable",
    }),
  );
  return cdnUrl(input.key);
}
