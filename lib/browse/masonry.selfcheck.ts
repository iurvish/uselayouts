import assert from "node:assert/strict";

import { packPinMasonry, pinColumnCount } from "./masonry";

assert.equal(pinColumnCount(320), 1);
assert.equal(pinColumnCount(800), 2);
assert.equal(pinColumnCount(1200), 3);

const heights = [200, 300, 180, 250, 220];
const three = packPinMasonry(3, 2, 100, 10, heights);
const four = packPinMasonry(4, 2, 100, 10, heights);

assert.equal(three.slots.length, 3);
assert.equal(four.slots.length, 4);
for (let i = 0; i < 3; i += 1) {
  assert.deepEqual(three.slots[i], four.slots[i]);
}

assert.equal(three.slots[0]?.x, 0);
assert.equal(three.slots[1]?.x, 110);
assert.equal(three.slots[2]?.y, 210);

console.log("masonry self-check ok");
