import assert from "node:assert/strict";

import {
  canvasAllowVideo,
  canvasMediaTier,
  canvasMediaWhilePanning,
} from "./canvas-media-tier";
import { maxConcurrentVideos } from "./video-pool";

assert.equal(canvasMediaTier(10, 10, 100, 100, 800, 600, 720), "video");
assert.equal(canvasMediaTier(-200, 10, 100, 100, 800, 600, 720), "image");
assert.equal(canvasMediaTier(-900, 10, 100, 100, 800, 600, 720), null);
assert.equal(canvasAllowVideo("video"), true);
assert.equal(canvasAllowVideo("image"), false);

assert.equal(canvasMediaWhilePanning("video"), "video");
assert.equal(canvasMediaWhilePanning("image"), "image");
assert.equal(canvasMediaWhilePanning("image", "video"), "video");
assert.equal(canvasMediaWhilePanning("video", "image"), "video");
assert.equal(canvasMediaWhilePanning("image", undefined), "image");

assert.equal(maxConcurrentVideos({ hardwareConcurrency: 4, deviceMemory: 4 }), 2);
assert.equal(maxConcurrentVideos({ hardwareConcurrency: 8, deviceMemory: 8 }), 4);
assert.equal(maxConcurrentVideos({ hardwareConcurrency: 16, deviceMemory: 16 }), 6);
assert.equal(maxConcurrentVideos({ hardwareConcurrency: 16, connection: { saveData: true } }), 1);

console.log("canvas media self-check ok");
