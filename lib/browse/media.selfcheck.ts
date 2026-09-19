import assert from "node:assert/strict";

import { DEFAULT_MEDIA_ASPECT, posterMediaHeight } from "./media";

assert.equal(posterMediaHeight(400, 2, 0), 200);
assert.equal(posterMediaHeight(400, 4 / 5, 0), 500);
assert.equal(
  posterMediaHeight(400, undefined, 0),
  Math.round(400 / DEFAULT_MEDIA_ASPECT),
);

console.log("browse media self-check ok");
