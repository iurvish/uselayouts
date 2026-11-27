/**
 * A stateless MCP server over JSON-RPC: one request in, one response out, no
 * session to keep. Enough of the Streamable HTTP transport for every client
 * that speaks it, without the SDK and its SSE machinery we would never use.
 */

export type RegistryEntry = {
  name: string;
  title: string;
  description: string;
  dependencies?: string[];
};

export type RegistryFile = { path: string; content?: string };

export type McpContext = {
  items: RegistryEntry[];
  siteUrl: string;
  /** Resolves the built `public/r/<name>.json`, which carries the source. */
  fetchFiles: (name: string) => Promise<RegistryFile[] | null>;
};

type JsonRpcId = string | number | null;

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: { code: number; message: string };
};

const SUPPORTED_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const PACKAGE_RUNNERS = {
  npm: "npx shadcn@latest add",
  pnpm: "pnpm dlx shadcn@latest add",
  yarn: "yarn dlx shadcn@latest add",
  bun: "bunx --bun shadcn@latest add",
} as const;

type PackageManager = keyof typeof PACKAGE_RUNNERS;

const TOOLS = [
  {
    name: "list_components",
    description:
      "List every uselayouts component: animated React micro-interactions built with Motion and Tailwind CSS.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "search_components",
    description:
      "Find uselayouts components by what they do, e.g. 'delete confirmation', 'tabs', 'image gallery'.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What the component should do." },
        limit: { type: "number", description: "Most results to return (default 10)." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_component",
    description:
      "Get a component's full source, npm dependencies, docs link and install command.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Component name, e.g. 'discrete-tabs'." },
      },
      required: ["name"],
    },
  },
  {
    name: "get_install_command",
    description:
      "Get the shadcn CLI command that installs one or more components into the current project.",
    inputSchema: {
      type: "object",
      properties: {
        names: { type: "array", items: { type: "string" } },
        packageManager: { type: "string", enum: Object.keys(PACKAGE_RUNNERS) },
      },
      required: ["names"],
    },
  },
] as const;

class ToolError extends Error {}

function text(value: string) {
  return { content: [{ type: "text", text: value }] };
}

function tokens(value: string) {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/** Name and title hits outrank a word buried in the description. */
export function searchItems(items: RegistryEntry[], query: string, limit = 10) {
  const terms = tokens(query);
  if (!terms.length) return [];

  return items
    .map((item) => {
      const name = tokens(`${item.name} ${item.title}`);
      const description = tokens(item.description);
      let score = 0;
      for (const term of terms) {
        if (name.some((word) => word.startsWith(term))) score += 3;
        if (description.some((word) => word.startsWith(term))) score += 1;
      }
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, Math.max(1, Math.min(limit, 50)))
    .map((entry) => entry.item);
}

/** Full registry URLs, so the command works without a components.json entry. */
export function installCommand(
  names: string[],
  siteUrl: string,
  packageManager: PackageManager = "npm",
) {
  const urls = names.map((name) => `${siteUrl}/r/${name}.json`);
  return `${PACKAGE_RUNNERS[packageManager]} ${urls.join(" ")}`;
}

function summarise(item: RegistryEntry) {
  return `- ${item.name} — ${item.title}: ${item.description}`;
}

function findItem(ctx: McpContext, name: unknown) {
  const slug = typeof name === "string" ? name.replace(/^@uselayouts\//, "").trim() : "";
  const item = ctx.items.find((entry) => entry.name === slug);
  if (!item) {
    throw new ToolError(
      `No component named "${slug}". Call search_components or list_components to find one.`,
    );
  }
  return item;
}

async function callTool(ctx: McpContext, name: unknown, args: Record<string, unknown>) {
  switch (name) {
    case "list_components":
      return text(
        `${ctx.items.length} components:\n\n${ctx.items.map(summarise).join("\n")}`,
      );

    case "search_components": {
      const query = typeof args.query === "string" ? args.query : "";
      const limit = typeof args.limit === "number" ? args.limit : 10;
      const hits = searchItems(ctx.items, query, limit);
      return text(
        hits.length
          ? `${hits.length} matches for "${query}":\n\n${hits.map(summarise).join("\n")}`
          : `Nothing matched "${query}". Try a broader word, or call list_components.`,
      );
    }

    case "get_component": {
      const item = findItem(ctx, args.name);
      const files = await ctx.fetchFiles(item.name);
      if (!files) throw new ToolError(`Could not load the source for ${item.name}.`);

      const sources = files
        .map((file) => `### ${file.path}\n\n\`\`\`tsx\n${file.content ?? ""}\n\`\`\``)
        .join("\n\n");
      return text(
        [
          `# ${item.title}`,
          item.description,
          `Docs: ${ctx.siteUrl}/docs/components/${item.name}`,
          `Install: ${installCommand([item.name], ctx.siteUrl)}`,
          `npm dependencies: ${item.dependencies?.join(", ") || "none"}`,
          sources,
        ].join("\n\n"),
      );
    }

    case "get_install_command": {
      const names = Array.isArray(args.names) ? args.names : [];
      if (!names.length) throw new ToolError("Pass at least one component name.");
      const slugs = names.map((entry) => findItem(ctx, entry).name);
      const manager =
        typeof args.packageManager === "string" && args.packageManager in PACKAGE_RUNNERS
          ? (args.packageManager as PackageManager)
          : "npm";
      return text(installCommand(slugs, ctx.siteUrl, manager));
    }

    default:
      throw new ToolError(`Unknown tool: ${String(name)}`);
  }
}

/** Returns null for notifications, which take no response. */
export async function handleRpc(
  message: JsonRpcRequest,
  ctx: McpContext,
): Promise<JsonRpcResponse | null> {
  const id = message.id ?? null;
  if (message.id === undefined) return null;

  const params = message.params ?? {};

  switch (message.method) {
    case "initialize": {
      const requested = params.protocolVersion;
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion:
            typeof requested === "string" && SUPPORTED_VERSIONS.includes(requested)
              ? requested
              : SUPPORTED_VERSIONS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "uselayouts", version: "1.0.0" },
          instructions:
            "uselayouts is a library of animated React components. Search for one, read its source with get_component, then install it with the command get_install_command returns.",
        },
      };
    }

    case "ping":
      return { jsonrpc: "2.0", id, result: {} };

    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };

    case "tools/call": {
      const args =
        params.arguments && typeof params.arguments === "object"
          ? (params.arguments as Record<string, unknown>)
          : {};
      try {
        return { jsonrpc: "2.0", id, result: await callTool(ctx, params.name, args) };
      } catch (error) {
        // Tool failures go back as results so the model can read and recover.
        if (error instanceof ToolError) {
          return { jsonrpc: "2.0", id, result: { ...text(error.message), isError: true } };
        }
        throw error;
      }
    }

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${message.method}` },
      };
  }
}
