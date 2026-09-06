import assert from "node:assert/strict";
import { createElement } from "react";

import { extractMdxPreLang, extractMdxPreText } from "./mdx-pre-text";

// ponytail: one runnable check — fails if MDX pre text/lang extraction breaks.
const line = (text: string) =>
  createElement("span", { "data-line": "", className: "line" }, text);

const preChildren = createElement(
  "code",
  { className: "language-tsx" },
  line("const x = 1"),
  line("const y = 2"),
);

assert.equal(extractMdxPreText(preChildren).replace(/\n$/, ""), "const x = 1\nconst y = 2");
assert.equal(extractMdxPreLang(preChildren), "tsx");
assert.equal(
  extractMdxPreLang(createElement("code", { "data-language": "bash" }, "echo hi")),
  "bash",
);

console.log("mdx-pre-text self-check ok");
