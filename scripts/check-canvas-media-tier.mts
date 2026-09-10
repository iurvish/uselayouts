import assert from "node:assert/strict";
import { canvasAllowVideo, canvasMediaTier } from "../lib/browse/canvas-media-tier";

assert.equal(canvasMediaTier(100, 100, 300, 400, 1200, 800, 480), "video");
assert.equal(canvasMediaTier(-400, 100, 300, 400, 1200, 800, 480), "image");
assert.equal(canvasMediaTier(-900, 100, 300, 400, 1200, 800, 480), null);
assert.equal(canvasMediaTier(1250, 100, 300, 400, 1200, 800, 480), "image");
assert.equal(canvasMediaTier(1800, 100, 300, 400, 1200, 800, 480), null);

assert.equal(canvasAllowVideo("video", false), true);
assert.equal(canvasAllowVideo("video", true), false);
assert.equal(canvasAllowVideo("image", false), false);
assert.equal(canvasAllowVideo("image", true), false);
console.log("canvas-media-tier: ok");
