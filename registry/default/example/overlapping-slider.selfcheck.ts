import assert from "node:assert/strict";

import { cardLeave, sliderStep, snapSliderIndex } from "./overlapping-slider";

assert.equal(sliderStep(340, 0.55, 18), 171);
assert.equal(sliderStep(100, 0.5, 10), 60);
assert.equal(sliderStep(340, 0.04, 18), 344);

assert.equal(snapSliderIndex(0, 100, 0, 6), 0);
assert.equal(snapSliderIndex(-140, 100, 0, 6), 1);
assert.equal(snapSliderIndex(-40, 100, -400, 6), 1);
assert.equal(snapSliderIndex(-40, 100, 400, 6), 0);
assert.equal(snapSliderIndex(-900, 100, 0, 6), 5);
assert.equal(snapSliderIndex(80, 100, 0, 6), 0);
assert.equal(snapSliderIndex(0, 100, 0, 1), 0);

assert.deepEqual(cardLeave(0), { scale: 1, y: 0, rotate: 0 });
assert.deepEqual(cardLeave(1), { scale: 1, y: 0, rotate: 0 });
assert.deepEqual(cardLeave(-1), { scale: 0.84, y: 36, rotate: 0 });
assert.deepEqual(cardLeave(-0.5), { scale: 0.92, y: 18, rotate: 0 });
assert.deepEqual(cardLeave(-2), { scale: 0.84, y: 36, rotate: 0 });

console.log("overlapping-slider.selfcheck ok");
