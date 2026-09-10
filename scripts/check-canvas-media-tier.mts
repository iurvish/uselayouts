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

// Infinite canvas tileIndex must visit every item (old col*7+row*3 skipped when gcd>1).
function mod(value: number, length: number) {
  return ((value % length) + length) % length;
}
function tileIndex(col: number, row: number, count: number) {
  return mod(row + col, count);
}
for (const count of [10, 11, 12, 24]) {
  const seen = new Set<number>();
  for (let row = 0; row < count; row++) seen.add(tileIndex(0, row, count));
  assert.equal(seen.size, count, `col0 must cover all ${count} items`);
  const seen2 = new Set<number>();
  for (let row = 0; row < count; row++) seen2.add(tileIndex(3, row, count));
  assert.equal(seen2.size, count, `col3 must cover all ${count} items`);
}
console.log("tileIndex coverage: ok");
