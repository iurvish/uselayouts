import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isLocalImageValue } from "@/lib/admin/dial-extract";

type Params = { params: Promise<{ name: string }> };

function bakeValuesIntoSource(
  source: string,
  values: Record<string, unknown>,
) {
  const cleaned = { ...values };
  for (const [key, value] of Object.entries(cleaned)) {
    if (isLocalImageValue(value)) delete cleaned[key];
  }

  if (!Object.keys(cleaned).length) return source;

  if (/export\s+const\s+dialConfig\s*=/.test(source)) {
    return source.replace(
      /export\s+const\s+dialConfig\s*=\s*(\{[\s\S]*?\n\})(?:\s*as\s+const)?\s*;?/,
      () => {
        return `export const dialConfig = ${JSON.stringify(
          mergeDialDefaults(source, cleaned),
          null,
          2,
        )} as const;\n\n/* Exported dial values */\nexport const exportedDialValues = ${JSON.stringify(
          cleaned,
          null,
          2,
        )} as const;`;
      },
    );
  }

  return `${source}\n\n/* Exported dial values */\nexport const exportedDialValues = ${JSON.stringify(
    cleaned,
    null,
    2,
  )} as const;\n`;
}

function mergeDialDefaults(
  source: string,
  values: Record<string, unknown>,
): Record<string, unknown> {
  try {
    const match = source.match(
      /export\s+const\s+dialConfig\s*=\s*(\{[\s\S]*?\n\})(?:\s*as\s+const)?\s*;?/,
    );
    if (!match) return values;
    // eslint-disable-next-line no-new-func
    const current = new Function(`return (${match[1]})`)() as Record<
      string,
      unknown
    >;
    return patchConfig(current, values);
  } catch {
    return values;
  }
}

function patchConfig(
  config: Record<string, unknown>,
  values: Record<string, unknown>,
  prefix = "",
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...config };
  for (const [key, value] of Object.entries(config)) {
    if (key === "_collapsed") continue;
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (pathKey in values) {
      const incoming = values[pathKey];
      if (Array.isArray(value) && typeof incoming === "number") {
        next[key] = [incoming, value[1], value[2], value[3]];
      } else if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        typeof incoming === "object"
      ) {
        next[key] = { ...(value as object), ...(incoming as object) };
      } else if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        "type" in (value as object)
      ) {
        const typed = value as { type: string };
        if (typed.type === "text" || typed.type === "color" || typed.type === "select") {
          next[key] = { ...(value as object), default: incoming };
        } else {
          next[key] = incoming;
        }
      } else {
        next[key] = incoming;
      }
      continue;
    }

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !("type" in (value as object))
    ) {
      next[key] = patchConfig(
        value as Record<string, unknown>,
        values,
        pathKey,
      );
    }
  }

  for (const [key, incoming] of Object.entries(values)) {
    if (key.includes(".")) continue;
    if (!(key in next)) continue;
    const value = next[key];
    if (Array.isArray(value) && typeof incoming === "number") {
      next[key] = [incoming, value[1], value[2], value[3]];
    } else if (typeof value === "string" || typeof value === "boolean") {
      next[key] = incoming;
    }
  }

  return next;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { name } = await params;
    const registry = JSON.parse(
      await fs.readFile(path.join(process.cwd(), "registry.json"), "utf8"),
    ) as {
      items: { name: string; files: { path: string }[] }[];
    };
    const entry = registry.items.find((item) => item.name === name);
    if (!entry?.files?.[0]?.path) {
      return NextResponse.json({ error: "Component not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({ values: {} }));
    const filePath = path.join(process.cwd(), entry.files[0].path);
    const source = await fs.readFile(filePath, "utf8");
    const code = bakeValuesIntoSource(source, body.values ?? {});

    return NextResponse.json({ code });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
