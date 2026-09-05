"use client";

import * as React from "react";

import { useOpenPanel } from "@/components/open/open-panel-context";
import { OpenCliBar } from "@/components/open/open-cli-bar";
import { OpenDrawer } from "@/components/open/open-drawer";
import { OpenCodePanel } from "@/components/open/open-panels";
import { OpenPreview } from "@/components/open/open-preview";
import { usePackageManager } from "@/components/open/use-package-manager";
import { scrollbarMinimal } from "@/components/open/ui";
import type { OpenComponentData } from "@/lib/open/component";
import {
  parsePreviewBackgrounds,
  resolvePreviewBackground,
} from "@/lib/open/preview-background";
import { cn } from "@/lib/utils";

export function OpenComponentView({
  data,
  docsContent,
}: {
  data: OpenComponentData;
  docsContent?: React.ReactNode;
}) {
  const { panel, setPanel } = useOpenPanel();
  const [manager, setManager] = usePackageManager();
  const backgrounds = React.useMemo(
    () => parsePreviewBackgrounds(data.previewBackground),
    [data.previewBackground],
  );
  const previewBackground = resolvePreviewBackground(backgrounds, "dark");

  return (
    <>
      <main
        className={cn(
          "grid h-dvh w-full flex-1 place-items-center overflow-auto px-[18px] pt-20 pb-[108px]",
          scrollbarMinimal,
        )}
        style={{ background: previewBackground || "hsl(225 7% 11%)" }}
      >
        <OpenPreview name={data.slug} />
      </main>

      <div className="pointer-events-none absolute bottom-[18px] left-1/2 z-20 -translate-x-1/2 *:pointer-events-auto">
        <OpenCliBar
          registryItem={data.registryItem}
          manager={manager}
          onManagerChange={setManager}
        />
      </div>

      <OpenDrawer
        open={panel === "code"}
        onClose={() => setPanel(null)}
        title="Get this Component"
        wide
      >
        <OpenCodePanel
          description={data.description}
          docsContent={docsContent}
          usage={data.usage}
          usageHtml={data.usageHtml}
          code={data.code}
          codeHtml={data.codeHtml}
          registryItem={data.registryItem}
          dependencies={data.dependencies}
          manager={manager}
          onManagerChange={setManager}
          slug={data.slug}
        />
      </OpenDrawer>
    </>
  );
}
