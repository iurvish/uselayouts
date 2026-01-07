import fs from "fs";
import { Index } from "@/registry/__index__";

function replaceComponentTags(content: string): string {
  const regex =
    /<(?:ComponentPreview|SourceCode)[\s\S]*?name=["']([^"']+)["'][\s\S]*?\/>/g;

  return content.replace(regex, (match, name: string) => {
    try {
      const component = Index[name];
      if (!component?.files?.length) return match;

      const src = component.files[0]?.path;
      if (!src) return match;

      const source = fs
        .readFileSync(src, "utf8")
        .replaceAll("@/registry/default/", "@/components/")
        .replaceAll("export default", "export");

      return `\`\`\`tsx\n${source}\n\`\`\``;
    } catch (error) {
      console.error(`Error processing component "${name}":`, error);
      return match;
    }
  });
}

function removeDocImports(content: string): string {
  const patterns = [
    /^\s*import\s*\{[^}]*\}\s*from\s*["']fumadocs-ui\/components\/[^"']+["'];?\s*\n?/gm,
    /^\s*import\s*\{[^}]*\}\s*from\s*["']@\/components\/(source-code|component-preview)["'];?\s*\n?/gm,
  ];

  let result = content;
  for (const pattern of patterns) {
    result = result.replace(pattern, "");
  }

  return result;
}

export function convertMdxToMarkdown(content: string): string {
  let processed = content;

  processed = removeDocImports(processed);
  processed = replaceComponentTags(processed);
  processed = processed.replace(/\n{3,}/g, "\n\n");

  return processed.trim();
}
