import { after, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/admin";
import { hashApiKey, readBearerKey } from "@/lib/mcp/keys";
import {
  handleRpc,
  type JsonRpcRequest,
  type McpContext,
  type RegistryFile,
} from "@/lib/mcp/server";
import { SITE_URL } from "@/lib/seo/site";
import registry from "@/registry.json";

const ITEMS = registry.items.map((item) => ({
  name: item.name,
  title: item.title,
  description: item.description,
  dependencies: item.dependencies,
}));

function rpcError(status: number, message: string, code = -32001) {
  return NextResponse.json(
    { jsonrpc: "2.0", id: null, error: { code, message } },
    { status },
  );
}

/** Resolves the key to its owner and stamps `last_used_at` after responding. */
async function authenticate(request: Request) {
  const supabase = createServiceClient();
  // Local dev without Supabase runs open, the same way requireAuth does.
  if (!supabase) return process.env.NODE_ENV === "development" ? "dev" : null;

  const key = readBearerKey(request.headers.get("authorization"));
  if (!key) return null;

  const { data } = await supabase
    .from("api_keys")
    .select("id, user_id")
    .eq("key_hash", hashApiKey(key))
    .maybeSingle();
  if (!data) return null;

  after(async () => {
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id);
  });
  return String(data.user_id);
}

export async function POST(request: Request) {
  const userId = await authenticate(request);
  if (!userId) {
    return rpcError(
      401,
      `Missing or invalid API key. Create one from your profile on ${SITE_URL}/browse and send it as "Authorization: Bearer ul_…".`,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rpcError(400, "Parse error", -32700);
  }

  // The built registry JSON is a static asset, so the CDN serves it, not us.
  const origin = new URL(request.url).origin;
  const ctx: McpContext = {
    items: ITEMS,
    siteUrl: SITE_URL,
    fetchFiles: async (name) => {
      const res = await fetch(`${origin}/r/${name}.json`);
      if (!res.ok) return null;
      const json = (await res.json()) as { files?: RegistryFile[] };
      return json.files ?? null;
    },
  };

  const messages = (Array.isArray(body) ? body : [body]) as JsonRpcRequest[];
  if (!messages.every((message) => message && typeof message.method === "string")) {
    return rpcError(400, "Invalid request", -32600);
  }

  const responses = (await Promise.all(messages.map((message) => handleRpc(message, ctx)))).filter(
    (response) => response !== null,
  );

  // Notifications only: accepted, nothing to say back.
  if (!responses.length) return new Response(null, { status: 202 });
  return NextResponse.json(Array.isArray(body) ? responses : responses[0]);
}

/** No server-initiated stream: every answer rides back on its POST. */
export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
