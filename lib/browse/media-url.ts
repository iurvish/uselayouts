const COMPONENT_CDN_ORIGIN = "https://cdn.uselayouts.com";
const COMPONENT_CDN_PREFIX = `${COMPONENT_CDN_ORIGIN}/components/`;

/**
 * Component media is protected against third-party hotlinking by the upstream
 * CDN. Serve those known public files from our own origin so local development,
 * preview deployments, and forks render the same previews as uselayouts.com.
 */
export function browseMediaUrl(url: string): string {
  if (!url.startsWith(COMPONENT_CDN_PREFIX)) return url;

  return `/api/browse-media${new URL(url).pathname}`;
}
