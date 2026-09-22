import { toPascal } from "@/lib/admin/slug";

type GenerateMdxInput = {
  name: string;
  title: string;
  description: string;
  features?: string[];
};

export function generateComponentMdx({
  name,
  title,
  description,
  features = [],
}: GenerateMdxInput) {
  const component = toPascal(name);
  const featureList =
    features.length > 0
      ? features.map((f) => `- ${f}`).join("\n")
      : `- Motion-powered interactions`;

  return `---
title: ${title}
description: ${description}
---

## Usage

\`\`\`tsx
import ${component} from "@/components/${name}";

export default function Example() {
  return <${component} />;
}
\`\`\`

## Features

${featureList}
`;
}
