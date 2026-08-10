type GenerateMdxInput = {
  name: string;
  title: string;
  description: string;
  dependencies?: string[];
  features?: string[];
  installFileName?: string;
};

export function generateComponentMdx({
  name,
  title,
  description,
  dependencies = ["motion", "clsx", "tailwind-merge"],
  features = [],
  installFileName,
}: GenerateMdxInput) {
  const fileName = installFileName ?? `${name}.tsx`;
  const deps = dependencies.join(" ");
  const featureList =
    features.length > 0
      ? features.map((f) => `- ${f}`).join("\n")
      : `- DialKit controls for live customization\n- Motion-powered interactions`;

  return `---
title: ${title}
description: ${description}
---

import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { SourceCode } from "@/components/source-code";
import { ComponentPreview } from "@/components/component-preview";

<Tabs items={["Preview", "Code"]}>
  <Tab value="Preview">
    <ComponentPreview name="${name}" full />
  </Tab>
  <Tab value="Code">
    <SourceCode name="${name}" />
  </Tab>
</Tabs>

## Installation

<Tabs items={['CLI', 'Manual']}>
  <Tab value="CLI">
    \`\`\`bash
    npx shadcn@latest add "https://uselayouts.com/r/${name}.json"
    \`\`\`
  </Tab>
  <Tab value="Manual">
    <Steps>
      <Step>
        ### Install dependencies

        \`\`\`bash
        npm install ${deps}
        \`\`\`
      </Step>
      <Step>
        ### Copy the code

        Copy the code from the **Code** tab above into \`components/${fileName}\`.
      </Step>
      <Step>
        ### Update imports

        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </Tab>
</Tabs>

## Usage

\`\`\`tsx
import ${toPascal(name)} from "@/components/${fileName.replace(/\.tsx$/, "")}";

export default function Example() {
  return <${toPascal(name)} />;
}
\`\`\`

## Features

${featureList}
`;
}

function toPascal(slug: string) {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}
