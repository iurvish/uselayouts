import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import type { ShikiTransformer } from "shiki";
import { codeToHtml } from "shiki";

import { stripCodeAnnotations } from "@/lib/open/strip-code-annotations";

export { stripCodeAnnotations } from "@/lib/open/strip-code-annotations";

export const transformers = [
  {
    pre(node) {
      if (node.tagName === "pre") {
        const raw = this.source;
        node.properties.__raw__ = stripCodeAnnotations(raw);
      }
    },
    code(node) {
      if (node.tagName === "code") {
        const raw = this.source;
        const cleanedRaw = stripCodeAnnotations(raw);
        node.properties.__raw__ = cleanedRaw;

        if (raw.startsWith("npm install")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npm install", "yarn add");
          node.properties.__pnpm__ = raw.replace("npm install", "pnpm add");
          node.properties.__bun__ = raw.replace("npm install", "bun add");
        }

        if (raw.startsWith("npx create-")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npx create-", "yarn create ");
          node.properties.__pnpm__ = raw.replace("npx create-", "pnpm create ");
          node.properties.__bun__ = raw.replace("npx", "bunx --bun");
        }

        if (raw.startsWith("npm create")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npm create", "yarn create");
          node.properties.__pnpm__ = raw.replace("npm create", "pnpm create");
          node.properties.__bun__ = raw.replace("npm create", "bun create");
        }

        if (raw.startsWith("npx")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npx", "yarn dlx");
          node.properties.__pnpm__ = raw.replace("npx", "pnpm dlx");
          node.properties.__bun__ = raw.replace("npx", "bunx --bun");
        }

        if (raw.startsWith("npm run")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npm run", "yarn");
          node.properties.__pnpm__ = raw.replace("npm run", "pnpm");
          node.properties.__bun__ = raw.replace("npm run", "bun");
        }
      }
    },
    line(node) {
      node.properties["data-line"] = "";
    },
  },
  transformerNotationHighlight(),
  transformerNotationWordHighlight(),
  transformerNotationFocus(),
  transformerNotationDiff(),
  transformerNotationErrorLevel(),
] as ShikiTransformer[];

function normalizeLanguage(lang = "tsx") {
  if (lang === "ts" || lang === "jsx" || lang === "js") return "tsx";
  if (lang === "bash" || lang === "sh" || lang === "shell") return "bash";
  return lang || "tsx";
}

export async function highlightCode(
  code: string,
  language = "tsx",
  options?: { showLineNumbers?: boolean },
) {
  const { showLineNumbers = true } = options ?? {};

  const html = await codeToHtml(code, {
    lang: normalizeLanguage(language),
    themes: {
      light: "min-light",
      dark: "vesper",
    },
    defaultColor: false,
    transformers: [
      {
        code(node) {
          if (showLineNumbers) {
            node.properties["data-line-numbers"] = "";
          }
        },
        line(node) {
          node.properties["data-line"] = "";
        },
        pre(node) {
          const rawClass = node.properties.class;
          const existing = Array.isArray(rawClass)
            ? rawClass.join(" ")
            : typeof rawClass === "string"
              ? rawClass
              : "shiki";
          /* --padding-left:0 kills fumadocs .line gutter (see shiki.css); class alone loses specificity */
          node.properties.class = `${existing} min-w-0 overflow-x-auto py-3.5 text-[.8125rem] outline-none !bg-transparent [--padding-left:0px]!`;
        },
      },
      ...transformers,
    ],
  });

  return html;
}
