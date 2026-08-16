import { codeToHtml } from "shiki";

export async function highlightCode(code: string, lang = "tsx") {
  const language =
    lang === "ts" || lang === "jsx" || lang === "js"
      ? "tsx"
      : lang === "bash" || lang === "sh" || lang === "shell"
        ? "bash"
        : lang || "tsx";
  return codeToHtml(code, {
    lang: language,
    theme: "one-dark-pro",
  });
}
