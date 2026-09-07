/** Components uploaded in the latest friend commit on feat/revive. */
export const NEW_COMPONENT_SLUGS = new Set([
  "accessible-action",
  "accordionos",
  "card-folder",
  "confidential-folder",
  "corner-vidoe",
  "focus-testimonials",
  "infinite-grid",
  "logoshift",
  "polaroid-drag",
  "pop-tilt-cards",
  "rollingcardstack",
  "scroll-stack-deck",
  "perspective-text-scroll",
  "wheel-carousel",
  "editorial-deck",
]);

export function isNewComponent(slug: string) {
  return NEW_COMPONENT_SLUGS.has(slug);
}
