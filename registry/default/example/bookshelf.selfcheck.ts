import assert from "node:assert/strict";

import { area, fold, homeward } from "./bookshelf";

const W = 500;
const H = 700;
const close = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;

// Untouched page: nothing lifted.
let f = fold(W, H, H, { x: W, y: H });
assert.ok(close(area(f.flat), W * H));
assert.equal(area(f.flap), 0);

// Pulled halfway straight across: vertical crease at 3W/4, flat + flap = whole page.
f = fold(W, H, H, { x: W / 2, y: H });
assert.ok(close(f.m.x, (3 * W) / 4));
assert.ok(close(area(f.flat) + area(f.flap), W * H));

// The reflection lands the corner exactly on the pull point, and fixes points on the crease.
f = fold(W, H, H, { x: 120, y: 520 });
const corner = f.reflect({ x: W, y: H });
assert.ok(close(corner.x, f.M.x) && close(corner.y, f.M.y));
const onCrease = f.reflect(f.m);
assert.ok(close(onCrease.x, f.m.x) && close(onCrease.y, f.m.y));

// Paper can't stretch: pulling far away keeps the corner within W of its spine corner.
f = fold(W, H, H, { x: -3000, y: -3000 });
assert.ok(Math.hypot(f.M.x, f.M.y - H) <= W + 1e-6);
assert.ok(Math.hypot(f.M.x, f.M.y) <= Math.hypot(W, H) + 1e-6);

// Fully turned: the whole page is lifted and progress reads 1.
f = fold(W, H, H, { x: -W, y: H });
assert.ok(close(area(f.flap), W * H, 1e-3));
assert.ok(close(f.progress, 1));

// The flight home: starts on the desk, ends in the slot, and bows above both ends so the book goes up
// and over rather than sliding across. M x0 y0 C cx1 cy1, cx2 cy2, x1 y1.
const desk = { x: 900, y: 520 };
const slotAt = { x: 300, y: 260 };
const LIFT = 210;
const [x0, y0, cx1, cy1, cx2, cy2, x1, y1] = homeward(desk, slotAt, LIFT)
  .match(/-?\d+(?:\.\d+)?/g)!
  .map(Number);
assert.deepEqual([x0, y0], [desk.x, desk.y]);
assert.deepEqual([x1, y1], [slotAt.x, slotAt.y]);
// Control points directly above each end: it leaves straight up and arrives straight down.
assert.equal(cx1, desk.x);
assert.equal(cx2, slotAt.x);
assert.equal(cy1, cy2, "both controls sit level, so the arc is symmetric about its apex");
// What the eye follows is the curve, not the controls: a cubic with level controls peaks at t = ½, only
// three quarters of the way up to them. That peak is what has to clear the slot for the drop to read.
const peak = (desk.y + slotAt.y + 6 * cy1) / 8;
assert.ok(peak < slotAt.y - 100, `the book rises well above the slot before dropping in (peak ${peak})`);

console.log("bookshelf.selfcheck ok");
