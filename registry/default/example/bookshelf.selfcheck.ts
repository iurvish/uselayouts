import assert from "node:assert/strict";

import { area, fold } from "./bookshelf";

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

console.log("bookshelf.selfcheck ok");
