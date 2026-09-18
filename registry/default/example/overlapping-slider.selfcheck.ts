import assert from "node:assert/strict";

import { sliderStep, snapSliderIndex } from "./overlapping-slider";

assert.equal(sliderStep(340, 0.55, 18), 171);
assert.equal(sliderStep(100, 0.5, 10), 60);

assert.equal(snapSliderIndex(0, 100, 0, 6), 0);
assert.equal(snapSliderIndex(-140, 100, 0, 6), 1);
assert.equal(snapSliderIndex(-40, 100, -400, 6), 1);
assert.equal(snapSliderIndex(-40, 100, 400, 6), 0);
assert.equal(snapSliderIndex(-900, 100, 0, 6), 5);
assert.equal(snapSliderIndex(80, 100, 0, 6), 0);
assert.equal(snapSliderIndex(0, 100, 0, 1), 0);

console.log("overlapping-slider.selfcheck ok");
