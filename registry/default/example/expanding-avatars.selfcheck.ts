import assert from "node:assert/strict";

import {
  CLEAR_HALF_HEIGHT,
  CLEAR_HALF_WIDTH,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  layoutAvatars,
} from "./expanding-avatars";

const cx = STAGE_WIDTH / 2;
const cy = STAGE_HEIGHT / 2;

assert.deepEqual(layoutAvatars(0), []);
assert.deepEqual(layoutAvatars(31, 7), layoutAvatars(31, 7));
assert.notDeepEqual(layoutAvatars(31, 7), layoutAvatars(31, 8));

for (const count of [1, 5, 12, 24, 31, 48]) {
  for (const seed of [1, 7, 42]) {
    const slots = layoutAvatars(count, seed);
    assert.equal(slots.length, count);

    for (const s of slots) {
      const r = s.size / 2;
      // Inside the stage.
      assert.ok(s.x - r >= 0 && s.x + r <= STAGE_WIDTH, `x out of stage (${count}/${seed})`);
      assert.ok(s.y - r >= 0 && s.y + r <= STAGE_HEIGHT, `y out of stage (${count}/${seed})`);
      // Never over the headline.
      const dx = Math.max(Math.abs(s.x - cx) - CLEAR_HALF_WIDTH, 0);
      const dy = Math.max(Math.abs(s.y - cy) - CLEAR_HALF_HEIGHT, 0);
      assert.ok(Math.hypot(dx, dy) >= r, `covers headline (${count}/${seed})`);
      assert.ok(s.delay > 0 && s.delay < 1, "delay range");
    }

    // Faces may touch, never stack.
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i]!;
        const b = slots[j]!;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        assert.ok(d >= (a.size + b.size) * 0.3, `stacked faces (${count}/${seed})`);
      }
    }
  }
}

console.log("expanding-avatars.selfcheck ok");
