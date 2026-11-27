import assert from "node:assert/strict";

import {
  API_KEY_PREFIX,
  displayPrefix,
  generateApiKey,
  hashApiKey,
  readBearerKey,
} from "./keys";

const key = generateApiKey();
assert.ok(key.startsWith(API_KEY_PREFIX));
assert.equal(key.length, API_KEY_PREFIX.length + 43);
assert.notEqual(generateApiKey(), key);

assert.equal(hashApiKey(key), hashApiKey(key));
assert.equal(hashApiKey(key).length, 64);

assert.equal(displayPrefix("ul_abcdefghijkl"), "ul_abcdefgh");

assert.equal(readBearerKey(`Bearer ${key}`), key);
assert.equal(readBearerKey(`  bearer ${key} `), key);
assert.equal(readBearerKey("Bearer sk_live_123"), null);
assert.equal(readBearerKey(key), null);
assert.equal(readBearerKey(null), null);

console.log("mcp keys selfcheck passed");
