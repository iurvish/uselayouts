import assert from "node:assert/strict";

import { formatStarCount } from "./github";

assert.equal(formatStarCount(0), "0");
assert.equal(formatStarCount(42), "42");
assert.equal(formatStarCount(999), "999");
assert.equal(formatStarCount(1000), "1k");
assert.equal(formatStarCount(1200), "1.2k");
assert.equal(formatStarCount(10400), "10k");

console.log("github stars self-check ok");
