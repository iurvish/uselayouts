import fs from "fs/promises";
import path from "path";
import { CodeBlock } from "fumadocs-ui/components/codeblock";
import { codeToHtml } from "shiki";
import { Index } from "@/registry/__index__";

export async function SourceCode({
  name,
  filePath: providedFilePath,
  title,
}: {
  name?: string;
  filePath?: string;
  title?: string;
}) {
  let filePath = providedFilePath;

  if (name && Index[name]) {
    filePath = `registry/default/${Index[name].files[0].path}`;
  }

  if (!filePath) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-md">
        Error: No name or filePath provided to SourceCode.
      </div>
    );
  }

  const fullPath = path.join(process.cwd(), filePath);
  let content = "";
  try {
    content = await fs.readFile(fullPath, "utf-8");
  } catch (err) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-md">
        Error reading file: {filePath}
      </div>
    );
  }

  const ext = path.extname(filePath).slice(1);
  const lang = ext === "tsx" || ext === "ts" ? "tsx" : ext;

  const html = await codeToHtml(content, {
    lang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  });

  return (
    <CodeBlock title={title || path.basename(filePath)}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </CodeBlock>
  );
}
