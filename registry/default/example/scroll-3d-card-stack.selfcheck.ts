import assert from "node:assert/strict";

import { mix } from "./scroll-3d-card-stack";

assert.equal(mix(0, [0, 1], [0, 10]), 0);
assert.equal(mix(1, [0, 1], [0, 10]), 10);
assert.equal(mix(0.5, [0, 1], [0, 10]), 5);
assert.equal(mix(-1, [0, 1], [2, 8]), 2);
assert.equal(mix(2, [0, 1], [2, 8]), 8);
assert.equal(mix(0, [-0.33, 0, 0.33], [50, 0, -120]), 0);
assert.equal(mix(-0.33, [-0.33, 0, 0.33], [50, 0, -120]), 50);

console.log("scroll-3d-card-stack.selfcheck ok");
