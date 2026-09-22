import assert from "node:assert/strict";

import { canvasGridPeriod, canvasTileIndex } from "./canvas-layout";

// ponytail: fails if a typical viewport window repeats a component.
function windowIndices(
  count: number,
  col0: number,
  row0: number,
  visCols: number,
  visRows: number,
) {
  const seen: number[] = [];
  for (let c = 0; c < visCols; c += 1) {
    for (let r = 0; r < visRows; r += 1) {
      const i = canvasTileIndex(col0 + c, row0 + r, count);
      if (i != null) seen.push(i);
    }
  }
  return seen;
}

assert.deepEqual(canvasGridPeriod(40), { cols: 7, rows: 6 });
assert.equal(canvasTileIndex(0, 0, 40), 0);
assert.equal(canvasTileIndex(1, 0, 40), 1);
assert.equal(canvasTileIndex(0, 1, 40), 7);

const window = windowIndices(40, 0, 0, 4, 3);
assert.equal(new Set(window).size, window.length);

const shifted = windowIndices(40, 2, 1, 4, 3);
assert.equal(new Set(shifted).size, shifted.length);

console.log("canvas-layout self-check ok");
