import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import {
  ensureDialConfigInSource,
  filterDialConfig,
} from "@/lib/admin/dial-extract";
import { generateComponentMdx } from "@/lib/admin/generate-mdx";
import { toSlug, toTitle } from "@/lib/admin/slug";
import {
  parseHintConfig,
  type InteractionHintConfig,
} from "@/lib/open/hints";

const execAsync = promisify(exec);

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "registry.json");
const EXAMPLE_DIR = path.join(ROOT, "registry/default/example");
const CONTROLS_DIR = path.join(ROOT, "registry/default/controls");
const DOCS_DIR = path.join(ROOT, "content/docs/components");

export type ComponentControlsMeta = {
  dialConfig: Record<string, unknown>;
  disabled: string[];
  updatedAt: string;
  previewBackground?: string;
  interactionHints?: InteractionHintConfig;
};

export type RegistryItem = {
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies?: string[];
  files: { path: string; type: string }[];
};

export type UpsertComponentInput = {
  name?: string;
  title: string;
  description: string;
  code: string;
  dependencies?: string[];
  features?: string[];
  dialConfig?: Record<string, unknown>;
  disabledControls?: string[];
  previewBackground?: string;
  interactionHints?: InteractionHintConfig;
};

async function readRegistry(): Promise<{
  $schema?: string;
  name: string;
  homepage?: string;
  items: RegistryItem[];
}> {
  return JSON.parse(await fs.readFile(REGISTRY_PATH, "utf8"));
}

async function writeRegistry(data: unknown) {
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(data, null, 2) + "\n");
}

export async function listComponents() {
  const registry = await readRegistry();
  const items = await Promise.all(
    registry.items.map(async (item) => {
      const controls = await readControls(item.name);
      const mdxPath = path.join(DOCS_DIR, `${item.name}.mdx`);
      let hasMdx = false;
      try {
        await fs.access(mdxPath);
        hasMdx = true;
      } catch {
        hasMdx = false;
      }
      return {
        ...item,
        hasMdx,
        controlsCount: controls
          ? Object.keys(flattenKeys(controls.dialConfig)).length
          : 0,
        disabledCount: controls?.disabled.length ?? 0,
      };
    }),
  );
  return items;
}

export async function getComponent(name: string) {
  const registry = await readRegistry();
  const item = registry.items.find((i) => i.name === name);
  if (!item) return null;

  const filePath = path.join(ROOT, item.files[0].path);
  const code = await fs.readFile(filePath, "utf8");
  const controls = await readControls(name);
  const mdxPath = path.join(DOCS_DIR, `${name}.mdx`);
  let mdx: string | null = null;
  try {
    mdx = await fs.readFile(mdxPath, "utf8");
  } catch {
    mdx = null;
  }

  return { item, code, controls, mdx, filePath: item.files[0].path };
}

export async function readControls(
  name: string,
): Promise<ComponentControlsMeta | null> {
  try {
    const raw = await fs.readFile(
      path.join(CONTROLS_DIR, `${name}.json`),
      "utf8",
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeControls(name: string, meta: ComponentControlsMeta) {
  await fs.mkdir(CONTROLS_DIR, { recursive: true });
  await fs.writeFile(
    path.join(CONTROLS_DIR, `${name}.json`),
    JSON.stringify(meta, null, 2) + "\n",
  );
}

function flattenKeys(
  config: Record<string, unknown>,
  prefix = "",
): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(config)) {
    if (key === "_collapsed") continue;
    const pathKey = prefix ? `${prefix}.${key}` : key;
    keys.push(pathKey);
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !("type" in (value as object))
    ) {
      keys.push(...flattenKeys(value as Record<string, unknown>, pathKey));
    }
  }
  return keys;
}

export async function upsertComponent(input: UpsertComponentInput) {
  const name = toSlug(input.name || input.title);
  if (!name) throw new Error("Invalid component name");

  const title = input.title.trim() || toTitle(name);
  const description = input.description.trim();
  const disabled = input.disabledControls ?? [];
  const exampleRelative = `registry/default/example/${name}.tsx`;
  const examplePath = path.join(ROOT, exampleRelative);
  await fs.mkdir(EXAMPLE_DIR, { recursive: true });
  await fs.writeFile(examplePath, input.code);

  const existingMeta = await readControls(name);
  const background =
    input.previewBackground !== undefined
      ? input.previewBackground.trim() || undefined
      : existingMeta?.previewBackground;
  const interactionHints =
    input.interactionHints !== undefined
      ? parseHintConfig(input.interactionHints)
      : existingMeta?.interactionHints;

  await writeControls(name, {
    dialConfig: input.dialConfig ?? existingMeta?.dialConfig ?? {},
    disabled,
    updatedAt: new Date().toISOString(),
    previewBackground: background,
    interactionHints,
  });

  const mdx = generateComponentMdx({
    name,
    title,
    description,
    features: input.features,
  });
  await fs.mkdir(DOCS_DIR, { recursive: true });
  await fs.writeFile(path.join(DOCS_DIR, `${name}.mdx`), mdx);

  const registry = await readRegistry();
  const existingIndex = registry.items.findIndex((i) => i.name === name);
  const item: RegistryItem = {
    name,
    type: "registry:component",
    title,
    description,
    dependencies: input.dependencies?.length
      ? input.dependencies
      : ["motion", "clsx", "tailwind-merge"],
    files: [{ path: exampleRelative, type: "registry:component" }],
  };

  if (existingIndex >= 0) {
    registry.items[existingIndex] = {
      ...registry.items[existingIndex],
      ...item,
      dependencies:
        input.dependencies ?? registry.items[existingIndex].dependencies,
    };
  } else {
    registry.items.push(item);
    registry.items.sort((a, b) => a.name.localeCompare(b.name));
  }

  await writeRegistry(registry);
  await rebuildRegistry();

  return { name, item };
}

export async function deleteComponent(name: string) {
  const registry = await readRegistry();
  const item = registry.items.find((i) => i.name === name);
  if (!item) throw new Error("Component not found");

  registry.items = registry.items.filter((i) => i.name !== name);
  await writeRegistry(registry);

  for (const file of item.files) {
    try {
      await fs.unlink(path.join(ROOT, file.path));
    } catch {
      // ignore
    }
  }

  for (const extra of [
    path.join(CONTROLS_DIR, `${name}.json`),
    path.join(DOCS_DIR, `${name}.mdx`),
    path.join(ROOT, "public/r", `${name}.json`),
    path.join(ROOT, "registry/default/demo", `${name}-demo.tsx`),
  ]) {
    try {
      await fs.unlink(extra);
    } catch {
      // ignore
    }
  }

  await rebuildRegistry();
  return { name };
}

export async function updateControls(
  name: string,
  disabled: string[],
  dialConfig?: Record<string, unknown>,
) {
  const existing = await getComponent(name);
  if (!existing) throw new Error("Component not found");

  const config = dialConfig ?? existing.controls?.dialConfig ?? {};
  const filtered = filterDialConfig(config, disabled);
  const code = ensureDialConfigInSource(existing.code, filtered);
  await fs.writeFile(path.join(ROOT, existing.filePath), code);
  await writeControls(name, {
    dialConfig: config,
    disabled,
    updatedAt: new Date().toISOString(),
    previewBackground: existing.controls?.previewBackground,
    interactionHints: existing.controls?.interactionHints,
  });
  return { name, disabled };
}

async function rebuildRegistry() {
  await execAsync("npm run build:registry", {
    cwd: ROOT,
  });
}
