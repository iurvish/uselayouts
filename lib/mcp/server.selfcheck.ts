import assert from "node:assert/strict";

import { handleRpc, installCommand, searchItems, type McpContext } from "./server";

const ctx: McpContext = {
  siteUrl: "https://uselayouts.com",
  items: [
    { name: "delete-button", title: "Delete Button", description: "A confirmation button." },
    { name: "discrete-tabs", title: "Discrete Tabs", description: "Tabs that slide." },
    { name: "status-button", title: "Status Button", description: "Shows delete progress." },
  ],
  fetchFiles: async (name) =>
    name === "delete-button" ? [{ path: "delete-button.tsx", content: "export {}" }] : null,
};

// Name matches outrank description matches.
assert.deepEqual(
  searchItems(ctx.items, "delete").map((item) => item.name),
  ["delete-button", "status-button"],
);
assert.deepEqual(searchItems(ctx.items, "  "), []);

assert.equal(
  installCommand(["a", "b"], ctx.siteUrl, "pnpm"),
  "pnpm dlx shadcn@latest add https://uselayouts.com/r/a.json https://uselayouts.com/r/b.json",
);

// tsx runs this as CJS, which has no top-level await.
async function main() {
  const init = await handleRpc(
    { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05" } },
    ctx,
  );
  assert.equal((init?.result as { protocolVersion: string }).protocolVersion, "2024-11-05");

  const unknownVersion = await handleRpc(
    { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "1999-01-01" } },
    ctx,
  );
  assert.equal((unknownVersion?.result as { protocolVersion: string }).protocolVersion, "2025-06-18");

  assert.equal(
    await handleRpc({ jsonrpc: "2.0", method: "notifications/initialized" }, ctx),
    null,
  );

  const listed = await handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/list" }, ctx);
  assert.equal((listed?.result as { tools: unknown[] }).tools.length, 4);

  const got = await handleRpc(
    {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "get_component", arguments: { name: "@uselayouts/delete-button" } },
    },
    ctx,
  );
  const gotText = (got?.result as { content: { text: string }[] }).content[0]!.text;
  assert.match(gotText, /export \{\}/);
  assert.match(gotText, /r\/delete-button\.json/);

  const missing = await handleRpc(
    {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "get_component", arguments: { name: "nope" } },
    },
    ctx,
  );
  assert.equal((missing?.result as { isError: boolean }).isError, true);

  const unknownMethod = await handleRpc({ jsonrpc: "2.0", id: 5, method: "resources/list" }, ctx);
  assert.equal(unknownMethod?.error?.code, -32601);

  console.log("mcp server selfcheck passed");
}

void main();
