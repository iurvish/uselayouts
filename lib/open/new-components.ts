/** Components uploaded in the latest friend commit on feat/revive. */
export const NEW_COMPONENT_SLUGS = new Set([
  "accessible-action",
  "accordionos",
  "business-input",
  "card-folder",
  "confidential-folder",
  "corner-vidoe",
  "elevate-testimonial",
  "focus-testimonials",
  "infinite-grid",
  "logoshift",
  "polaroid-drag",
  "pop-tilt-cards",
  "rollingcardstack",
  "wheel-carousel",
]);

export function isNewComponent(slug: string) {
  return NEW_COMPONENT_SLUGS.has(slug);
}
