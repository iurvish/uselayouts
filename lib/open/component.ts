import { getComponent, listComponents } from "@/lib/admin/components-fs";
import { toPascal } from "@/lib/admin/slug";
import { browseItems } from "@/lib/browse/items";
import { highlightCode } from "@/lib/open/highlight";
import {
  extractDocSections,
  extractHints,
  extractUsageSnippet,
  type DocSection,
} from "@/lib/open/mdx-extract";
import { parseHintConfig, type InteractionHintConfig } from "@/lib/open/hints";
import { registryItem } from "@/lib/open/package-manager";

export type OpenNavItem = {
  title: string;
  href: string;
  slug: string;
};

export type OpenDocSection = DocSection & {
  html: string;
};

export type OpenComponentData = {
  slug: string;
  title: string;
  description: string;
  dependencies: string[];
  registryItem: string;
  hints: string[];
  usage: string;
  usageHtml: string;
  code: string;
  codeHtml: string;
  docs: OpenDocSection[];
  previewBackground?: string;
  interactionHints: InteractionHintConfig;
};

function defaultUsage(slug: string) {
  const component = toPascal(slug);
  return `import ${component} from "@/components/${slug}";

export default function Page() {
  return <${component} />;
}`;
}

async function sectionToHtml(body: string) {
  const parts: string[] = [];
  const fence = /```(\w+)?\n([\s\S]*?)```/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(body))) {
    if (match.index > last) {
      parts.push(proseToHtml(body.slice(last, match.index)));
    }
    parts.push(await highlightCode(match[2].trim(), match[1] || "tsx", { showLineNumbers: false }));
    last = match.index + match[0].length;
  }
  if (last < body.length) {
    parts.push(proseToHtml(body.slice(last)));
  }
  return parts.join("");
}

function proseToHtml(text: string) {
  const blocks = text
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        const items = lines
          .map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inline(lines.join(" "))}</p>`;
    })
    .join("");
}

function inline(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export async function getOpenNavItems(): Promise<OpenNavItem[]> {
  const items = await listComponents();
  if (items.length > 0) {
    return items.map((item) => ({
      slug: item.name,
      title: item.title,
      href: `/docs/components/${item.name}`,
    }));
  }
  return browseItems.map((item) => ({
    slug: item.slug,
    title: item.title,
    href: `/docs/components/${item.slug}`,
  }));
}

export async function getOpenComponent(slug: string): Promise<OpenComponentData | null> {
  const record = await getComponent(slug);
  const browse = browseItems.find((item) => item.slug === slug);
  if (!record && !browse) return null;

  const title = record?.item.title ?? browse?.title ?? slug;
  const description = record?.item.description ?? browse?.description ?? "";
  const dependencies = record?.item.dependencies?.filter(Boolean) ?? [];
  const code = record?.code ?? "";
  const mdx = record?.mdx ?? "";
  const usage = extractUsageSnippet(mdx, defaultUsage(slug));
  const hints = extractHints(mdx);
  const docs = await Promise.all(
    extractDocSections(mdx).map(async (section) => ({
      ...section,
      html: await sectionToHtml(section.body),
    })),
  );

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
    hints,
    usage,
    usageHtml,
    code,
    codeHtml,
    docs,
    previewBackground: record?.controls?.previewBackground,
    interactionHints: parseHintConfig(record?.controls?.interactionHints),
  };
}
