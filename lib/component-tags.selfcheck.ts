import assert from "node:assert/strict";

import { normalizeTags, rankSearchItems } from "./component-tags";

assert.deepEqual(normalizeTags([" Delete", "BUTTON", "delete", ""]), [
  "delete",
  "button",
]);
assert.deepEqual(normalizeTags("carousel, Slider, carousel"), [
  "carousel",
  "slider",
]);

const items = [
  {
    title: "Delete Button",
    slug: "delete-button",
    tags: ["button", "delete", "confirm"],
    extra: "Confirmation folded into one tap.",
  },
  {
    title: "Paper Shred Button",
    slug: "paper-shred-button",
    tags: ["button", "delete", "shred"],
    extra: "A delete button that shreds a page into strips.",
  },
  {
    title: "Coverflow Drag",
    slug: "coverflow-drag",
    tags: ["carousel", "coverflow", "slider"],
    extra: "Portraits that coverflow as you drag.",
  },
  {
    title: "Wheel Carousel",
    slug: "wheel-carousel",
    tags: ["carousel", "wheel"],
    extra: "A wheel you can spin through.",
  },
];

const bySlug = (list: typeof items) => list.map((item) => item.slug);
const fields = (item: (typeof items)[number]) => ({
  name: `${item.title} ${item.slug}`,
  tags: item.tags,
  extra: item.extra,
});

assert.deepEqual(bySlug(rankSearchItems(items, "delete", fields)), [
  "delete-button",
  "paper-shred-button",
]);
assert.deepEqual(bySlug(rankSearchItems(items, "carousel", fields)), [
  "wheel-carousel",
  "coverflow-drag",
]);
assert.deepEqual(bySlug(rankSearchItems(items, "shred", fields)), [
  "paper-shred-button",
]);

console.log("component-tags self-check ok");
