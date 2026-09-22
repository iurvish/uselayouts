export type DocSection = {
  title: string;
  body: string;
};

function stripFrontmatter(mdx: string) {
  return mdx.replace(/^---[\s\S]*?---\s*/, "");
}

function stripImports(mdx: string) {
  return mdx.replace(/^import .+$/gm, "").trim();
}

export function extractMdxSections(mdx: string): DocSection[] {
  const source = stripImports(stripFrontmatter(mdx));
  const chunks = source.split(/^## /m).slice(1);
  return chunks
    .map((chunk) => {
      const newline = chunk.indexOf("\n");
      const title = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
      const body = newline === -1 ? "" : chunk.slice(newline).trim();
      return { title, body };
    })
    .filter((section) => section.title.length > 0);
}

export function extractUsageSnippet(mdx: string, fallback: string) {
  const usage = extractMdxSections(mdx).find((section) =>
    /^usage$/i.test(section.title),
  );
  if (!usage) return fallback;
  const blocks = [...usage.body.matchAll(/```(?:tsx|jsx|ts|js)?\n([\s\S]*?)```/g)];
  const withReturn = blocks.find((block) => /return\s*\(/.test(block[1]) || /return\s+</.test(block[1]));
  const chosen = (withReturn ?? blocks[blocks.length - 1])?.[1]?.trim();
  return chosen || fallback;
}

export function extractHints(mdx: string): string[] {
  const features = extractMdxSections(mdx).find((section) =>
    /^features$/i.test(section.title),
  );
  if (!features) return [];
  return features.body
    .split("\n")
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/\*\*/g, "").trim())
    .filter(Boolean);
}

