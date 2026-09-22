import "server-only";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { cdnUrl, r2Bucket, r2Client, r2Configured } from "@/lib/r2/client";

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

/** Map a public CDN URL back to its R2 object key, or null if not ours. */
export function keyFromCdnUrl(url: string | null | undefined): string | null {
  if (!url || !r2Configured()) return null;
  try {
    const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
    if (!url.startsWith(`${base}/`)) return null;
    const key = url.slice(base.length + 1).split("?")[0];
    return key || null;
  } catch {
    return null;
  }
}

/** Best-effort delete. Ignores missing objects and misconfigured R2. */
export async function deleteFromR2(key: string | null | undefined): Promise<void> {
  if (!key || !r2Configured()) return;
  try {
    await r2Client().send(
      new DeleteObjectCommand({
        Bucket: r2Bucket(),
        Key: key,
      }),
    );
  } catch {
    // Replace/clear should not fail because cleanup failed.
  }
}

/** Delete the R2 object behind a CDN URL, if it belongs to this bucket. */
export async function deleteCdnObject(url: string | null | undefined): Promise<void> {
  await deleteFromR2(keyFromCdnUrl(url));
}
