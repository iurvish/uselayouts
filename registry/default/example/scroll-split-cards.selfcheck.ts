import assert from "node:assert/strict";

import {
  panelRadius,
  panelRotateY,
  panelScale,
  panelShiftX,
  remap,
} from "./scroll-split-cards";

assert.equal(remap(0, 0, 0.4), 0);
assert.equal(remap(0.4, 0, 0.4), 1);
assert.equal(remap(0.2, 0, 0.4), 0.5);
assert.equal(remap(1, 0.4, 0.8), 1);

assert.equal(panelShiftX(0, 0), 0);
assert.equal(panelShiftX(0, 1), 0);
assert.equal(panelShiftX(0.4, 0), -48);
assert.equal(panelShiftX(0.4, 1), 0);
assert.equal(panelShiftX(0.4, 2), 48);
assert.equal(panelShiftX(0.8, 0), -24);
assert.equal(panelShiftX(0.8, 2), 24);

assert.equal(panelRotateY(0), 0);
assert.equal(panelRotateY(0.4), 0);
assert.equal(panelRotateY(0.8), 180);
assert.equal(panelRotateY(1), 180);

assert.equal(panelScale(0), 1);
assert.equal(panelScale(0.4), 0.92);

assert.equal(panelRadius(0, 0), "16px 0px 0px 16px");
assert.equal(panelRadius(0, 1), "0px");
assert.equal(panelRadius(0, 2), "0px 16px 16px 0px");
assert.equal(panelRadius(0.2, 1), "16px");

console.log("scroll-split-cards.selfcheck ok");
