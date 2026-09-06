import { getComponent, listComponents } from "@/lib/admin/components-fs";
import { toPascal } from "@/lib/admin/slug";
import { browseItems } from "@/lib/browse/items";
import { highlightCode } from "@/lib/open/highlight";
import { isNewComponent } from "@/lib/open/new-components";
import { extractUsageSnippet } from "@/lib/open/mdx-extract";
import {
  cliInstallCommand,
  manualInstallCommand,
  PACKAGE_MANAGERS,
  registryItem,
  type PackageManager,
} from "@/lib/open/package-manager";
import type { PreviewBackgrounds } from "@/lib/open/preview-background";
import { source } from "@/lib/source";

export type OpenNavItem = {
  title: string;
  href: string;
  slug: string;
  isNew?: boolean;
};

export type OpenComponentData = {
  slug: string;
  title: string;
  description: string;
  dependencies: string[];
  registryItem: string;
  usage: string;
  usageHtml: string;
  code: string;
  codeHtml: string;
  /** Shiki HTML for CLI install commands (same highlighter as codeHtml). */
  cliHtml: Record<PackageManager, string>;
  /** Shiki HTML for manual dep install commands. */
  manualHtml: Record<PackageManager, string>;
  previewBackground?: string | PreviewBackgrounds;
};

async function highlightShellCommands(
  build: (manager: PackageManager) => string,
): Promise<Record<PackageManager, string>> {
  // Always materialize every PackageManager key — callers index by manager.
  const out = {
    npm: "",
    yarn: "",
    pnpm: "",
    bun: "",
  } satisfies Record<PackageManager, string>;
  await Promise.all(
    PACKAGE_MANAGERS.map(async (manager) => {
      const command = build(manager);
      out[manager] = command
        ? await highlightCode(command, "bash", { showLineNumbers: false })
        : "";
    }),
  );
  return out;
}

function defaultUsage(slug: string) {
  const component = toPascal(slug);
  return `import ${component} from "@/components/${slug}";

export default function Page() {
  return <${component} />;
}`;
}

export function getComponentDocsPage(slug: string) {
  return source.getPage(["components", slug]);
}

export async function getOpenNavItems(): Promise<OpenNavItem[]> {
  const items = await listComponents();
  if (items.length > 0) {
    return items.map((item) => {
      const page = getComponentDocsPage(item.name);
      return {
        slug: item.name,
        title: page?.data.title ?? item.title,
        href: `/docs/components/${item.name}`,
        isNew: isNewComponent(item.name),
      };
    });
  }
  return browseItems.map((item) => {
    const page = getComponentDocsPage(item.slug);
    return {
      slug: item.slug,
      title: page?.data.title ?? item.title,
      href: `/docs/components/${item.slug}`,
      isNew: item.isNew || isNewComponent(item.slug),
    };
  });
}

export async function getOpenComponent(slug: string): Promise<OpenComponentData | null> {
  const record = await getComponent(slug);
  const docsPage = getComponentDocsPage(slug);
  const browse = browseItems.find((item) => item.slug === slug);
  if (!record && !docsPage && !browse) return null;

  const title = docsPage?.data.title ?? record?.item.title ?? browse?.title ?? slug;
  const description =
    docsPage?.data.description ?? record?.item.description ?? browse?.description ?? "";
  const dependencies = record?.item.dependencies?.filter(Boolean) ?? [];
  const code = record?.code ?? "";
  const usage = extractUsageSnippet(record?.mdx ?? "", defaultUsage(slug));

  const item = registryItem(slug);
  const [usageHtml, codeHtml, cliHtml, manualHtml] = await Promise.all([
    highlightCode(usage, "tsx", { showLineNumbers: false }),
    code ? highlightCode(code, "tsx", { showLineNumbers: false }) : Promise.resolve(""),
    highlightShellCommands((manager) => cliInstallCommand(manager, item)),
    highlightShellCommands((manager) => manualInstallCommand(manager, dependencies)),
  ]);

  return {
    slug,
    title,
    description,
    dependencies,
    registryItem: item,
    usage,
    usageHtml,
    code,
    codeHtml,
    cliHtml,
    manualHtml,
    previewBackground: record?.controls?.previewBackground,
  };
}
