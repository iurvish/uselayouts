import { codeToHtml } from "shiki";

export async function highlightCode(code: string, lang = "tsx") {
  const language = lang === "ts" || lang === "jsx" || lang === "js" ? "tsx" : lang;
  return codeToHtml(code, {
    lang: language || "tsx",
    themes: {
      light: "github-dark",
      dark: "github-dark",
    },
    defaultColor: false,
  });
}
