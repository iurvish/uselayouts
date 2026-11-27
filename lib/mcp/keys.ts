import { createHash, randomBytes } from "node:crypto";

export const API_KEY_PREFIX = "ul_";

/** 32 random bytes: as strong as the key needs to be, short enough to paste. */
export function generateApiKey() {
  return `${API_KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
}

/** Keys are random, not passwords, so a plain fast hash is the right tool. */
export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

/** What the dialog shows for a key it can no longer reveal. */
export function displayPrefix(key: string) {
  return key.slice(0, API_KEY_PREFIX.length + 8);
}

/** `Authorization: Bearer ul_…`, tolerant of case and stray whitespace. */
export function readBearerKey(header: string | null) {
  if (!header) return null;
  const match = header.trim().match(/^bearer\s+(\S+)$/i);
  const key = match?.[1];
  return key?.startsWith(API_KEY_PREFIX) ? key : null;
}
