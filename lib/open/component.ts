import { getComponent, listComponents } from "@/lib/admin/components-fs";
import { toPascal } from "@/lib/admin/slug";
import { browseItems } from "@/lib/browse/items";
import { highlightCode } from "@/lib/open/highlight";
import { isNewComponent } from "@/lib/open/new-components";
import { extractUsageSnippet } from "@/lib/open/mdx-extract";
import { registryItem } from "@/lib/open/package-manager";
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
  previewBackground?: string | PreviewBackgrounds;
};

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

  const [usageHtml, codeHtml] = await Promise.all([
    highlightCode(usage, "tsx", { showLineNumbers: false }),
    code ? highlightCode(code, "tsx", { showLineNumbers: false }) : Promise.resolve(""),
  ]);

  return {
    slug,
    title,
    description,
    dependencies,
    registryItem: registryItem(slug),
    usage,
    usageHtml,
    code,
    codeHtml,
    previewBackground: record?.controls?.previewBackground,
  };
}
