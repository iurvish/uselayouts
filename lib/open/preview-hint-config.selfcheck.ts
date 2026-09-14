import assert from "node:assert/strict";

import {
  hintToneForBackground,
  parsePreviewHint,
  resolvePreviewHint,
} from "./preview-hint-config";

// ponytail: one runnable check — fails if hint show/preset/custom resolution breaks.
assert.equal(resolvePreviewHint(parsePreviewHint({})), null);
assert.equal(resolvePreviewHint(parsePreviewHint({ showHint: false, hintKind: "click" })), null);

assert.deepEqual(resolvePreviewHint(parsePreviewHint({ showHint: true, hintKind: "click" })), {
  heading: "Click to open",
  description: "Click the folder to read the letter",
});

assert.deepEqual(
  resolvePreviewHint(
    parsePreviewHint({
      showHint: true,
      hintKind: "custom",
      hintHeading: "  Peek inside  ",
      hintDescription: "A short note.",
    }),
  ),
  { heading: "Peek inside", description: "A short note." },
);

assert.equal(
  resolvePreviewHint(parsePreviewHint({ showHint: true, hintKind: "custom", hintHeading: "   " })),
  null,
);

assert.equal(hintToneForBackground("#faf8f5"), "light");
assert.equal(hintToneForBackground("#111111"), "dark");
assert.equal(hintToneForBackground("oklch(0.18 0.012 260)"), "dark");
assert.equal(hintToneForBackground("hsl(225 7% 11%)"), "dark");

console.log("preview-hint-config self-check ok");
