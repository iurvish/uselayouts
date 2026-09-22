import assert from "node:assert/strict";

import {
  DEFAULT_PREVIEW_BACKGROUNDS,
  NONE_PREVIEW_BACKGROUND,
  parsePreviewBackgrounds,
  resolvePreviewBackground,
  serializePreviewBackgrounds,
} from "./preview-background";

assert.equal(
  resolvePreviewBackground({ dark: NONE_PREVIEW_BACKGROUND }, "dark"),
  undefined,
);
assert.equal(
  resolvePreviewBackground({ light: NONE_PREVIEW_BACKGROUND }, "light"),
  undefined,
);
assert.equal(
  resolvePreviewBackground({}, "dark"),
  DEFAULT_PREVIEW_BACKGROUNDS.dark,
);
assert.equal(resolvePreviewBackground({ dark: "#09090b" }, "dark"), "#09090b");

assert.deepEqual(
  serializePreviewBackgrounds({
    light: NONE_PREVIEW_BACKGROUND,
    dark: NONE_PREVIEW_BACKGROUND,
  }),
  { light: "none", dark: "none" },
);
assert.deepEqual(parsePreviewBackgrounds({ light: "none", dark: "none" }), {
  light: "none",
  dark: "none",
});

console.log("preview-background self-check ok");
