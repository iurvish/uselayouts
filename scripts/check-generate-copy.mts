import assert from "node:assert/strict";
import { generateComponentCopy } from "../lib/admin/generate-copy";

const a = generateComponentCopy(
  `export default function DeleteButton() { return <button>Delete</button> }`,
);
assert.equal(a.title, "Delete Button");
assert.ok(a.features.some((f) => f.startsWith("Where to use:")));
assert.ok(a.description.length < 120);

const b = generateComponentCopy(
  `export default function FocusTestimonials() { return <div>quote</div> }`,
);
assert.match(b.description, /testimonial|social/i);

console.log("generate-copy ok");
