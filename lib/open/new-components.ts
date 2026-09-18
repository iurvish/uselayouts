/** Components uploaded in the latest friend commit on feat/revive. */
export const NEW_COMPONENT_SLUGS = new Set([
  "accessible-action",
  "accordionos",
  "card-folder",
  "confidential-folder",
  "corner-video",
  "focus-testimonials",
  "infinite-grid",
  "logoshift",
  "polaroid-drag",
  "pop-tilt-cards",
  "rolling-card-stack",
  "scroll-stack-deck",
  "stack-scroll-reveal",
  "perspective-text-scroll",
  "wheel-carousel",
  "editorial-deck",
  "client-card",
  "coverflow-drag",
  "create-menu",
  "liquid-index",
  "photo-albums",
  "slide-subscribe",
  "overlapping-slider",
]);

export function isNewComponent(slug: string) {
  return NEW_COMPONENT_SLUGS.has(slug);
}
