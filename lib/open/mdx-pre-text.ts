import { isValidElement, type ReactNode } from "react";

/** Plain text from rehype/Shiki MDX `pre` children (line spans → newlines). */
export function extractMdxPreText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractMdxPreText).join("");
  if (!isValidElement(node)) return "";

  const props = node.props as {
    children?: ReactNode;
    className?: string;
    "data-line"?: unknown;
  };
  const text = extractMdxPreText(props.children);
  const isLine =
    "data-line" in props ||
    (typeof props.className === "string" &&
      /(^|\s)line(\s|$)/.test(props.className));
  if (isLine && text && !text.endsWith("\n")) return `${text}\n`;
  return text;
}

/** Language from `data-language` / `language-*` on nested code. */
export function extractMdxPreLang(node: ReactNode): string {
  if (Array.isArray(node)) {
    for (const child of node) {
      const lang = extractMdxPreLang(child);
      if (lang) return lang;
    }
    return "";
  }
  if (!isValidElement(node)) return "";
  const props = node.props as {
    children?: ReactNode;
    className?: string;
    "data-language"?: string;
  };
  if (typeof props["data-language"] === "string" && props["data-language"]) {
    return props["data-language"];
  }
  const match = /(?:^|\s)language-([\w-]+)/.exec(props.className ?? "");
  if (match) return match[1];
  return extractMdxPreLang(props.children);
}
