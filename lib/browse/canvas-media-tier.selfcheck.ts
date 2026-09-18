import assert from "node:assert/strict";

import {
  canvasAllowVideo,
  canvasMediaTier,
  canvasMediaWhilePanning,
  capVideoTiles,
} from "./canvas-media-tier";
import {
  isConstrainedDevice,
  maxConcurrentVideos,
  maxMountedVideos,
} from "./video-pool";

assert.equal(canvasMediaTier(10, 10, 100, 100, 800, 600, 720), "video");
assert.equal(canvasMediaTier(-200, 10, 100, 100, 800, 600, 720), "image");
assert.equal(canvasMediaTier(-200, 10, 100, 100, 800, 600, 720, 400), "video");
assert.equal(canvasMediaTier(-500, 10, 100, 100, 800, 600, 720, 400), "image");
assert.equal(canvasMediaTier(-900, 10, 100, 100, 800, 600, 720, 400), null);
assert.equal(canvasAllowVideo("video"), true);
assert.equal(canvasAllowVideo("image"), false);

assert.equal(canvasMediaWhilePanning("video"), "video");
assert.equal(canvasMediaWhilePanning("image"), "image");
assert.equal(canvasMediaWhilePanning("image", "video"), "video");
assert.equal(canvasMediaWhilePanning("video", "image"), "video");
assert.equal(canvasMediaWhilePanning("image", undefined), "image");
assert.equal(canvasMediaWhilePanning("video", "image", true), "image");
assert.equal(canvasMediaWhilePanning("video", "video", true), "video");

const capped = capVideoTiles(
  [
    { media: "video" as const, priority: 100 },
    { media: "video" as const, priority: 900 },
    { media: "image" as const, priority: 0 },
  ],
  1,
);
assert.equal(capped[0].media, "image");
assert.equal(capped[1].media, "video");
assert.equal(capped[2].media, "image");

assert.equal(maxConcurrentVideos({ hardwareConcurrency: 4, deviceMemory: 4 }), 2);
assert.equal(maxConcurrentVideos({ hardwareConcurrency: 8, deviceMemory: 8 }), 6);
assert.equal(maxConcurrentVideos({ hardwareConcurrency: 16, deviceMemory: 16 }), 8);
assert.equal(maxConcurrentVideos({ hardwareConcurrency: 16, connection: { saveData: true } }), 1);
assert.equal(maxConcurrentVideos({ hardwareConcurrency: 8 }, true), 2);
assert.equal(maxMountedVideos({ hardwareConcurrency: 8 }, true), 3);
assert.equal(isConstrainedDevice({ connection: { saveData: true } }), true);
assert.equal(
  isConstrainedDevice({ hardwareConcurrency: 8 }, { innerWidth: 390, matchMedia: (q: string) => ({ matches: q.includes("coarse") }) }),
  true,
);
assert.equal(
  isConstrainedDevice({ hardwareConcurrency: 8, deviceMemory: 16 }, { innerWidth: 1400, matchMedia: () => ({ matches: false }) }),
  false,
);

console.log("canvas media self-check ok");
