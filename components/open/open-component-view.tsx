"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/auth-provider";
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
import { hintToneForBackground } from "@/lib/open/preview-hint-config";
import { cn } from "@/lib/utils";

export function OpenComponentView({
  data,
  seoContent,
}: {
  data: OpenComponentData;
  /**
   * Server-rendered docs section under the hero. It carries the MDX prose that
   * used to render inside the code drawer, so the drawer is now code + install
   * only and the text is not duplicated on the page.
   */
  seoContent?: React.ReactNode;
}) {
  const { panel, setPanel, stage } = useOpenPanel();
  const { user, configured } = useAuth();
  const [manager, setManager] = usePackageManager();
  const backgrounds = React.useMemo(
    () => parsePreviewBackgrounds(data.previewBackground),
    [data.previewBackground],
  );
  const previewBackground = resolvePreviewBackground(backgrounds, "dark");
  const hintTone = hintToneForBackground(previewBackground);
  const codeOpen = panel === "code" && (!configured || Boolean(user));

  React.useEffect(() => {
    if (panel === "code" && configured && !user) setPanel(null);
  }, [panel, configured, user, setPanel]);

  return (
    <>
      {/* Viewport-height hero. `relative` so the CLI bar anchors here and not
          to the (now much taller) page, and the preview keeps its own
          `overflow-auto` so tall sticky demos still scroll <main>. */}
      <div className="relative h-dvh shrink-0">
        <main
          className={cn(
            "grid h-full min-h-0 w-full min-w-0 overflow-auto",
            scrollbarMinimal,
          )}
          style={
            {
              ...(previewBackground ? { background: previewBackground } : {}),
              "--preview-hint-top": `${data.hintTop ?? 80}px`,
            } as React.CSSProperties
          }
        >
          <OpenPreview
            name={data.slug}
            hintTop={data.hintTop}
            hint={stage ? null : data.previewHint}
            hintTone={hintTone}
          />
        </main>

        {stage ? null : (
          <div className="pointer-events-none absolute bottom-[18px] left-1/2 z-20 -translate-x-1/2 *:pointer-events-auto">
            <OpenCliBar
              registryItem={data.registryItem}
              manager={manager}
              onManagerChange={setManager}
            />
          </div>
        )}
      </div>

      {stage ? null : seoContent}

      <OpenDrawer
        open={codeOpen}
        onClose={() => setPanel(null)}
        title="Get this Component"
        wide
      >
        <OpenCodePanel
          description={data.description}
          usage={data.usage}
          usageHtml={data.usageHtml}
          code={data.code}
          codeHtml={data.codeHtml}
          cliHtml={data.cliHtml}
          manualHtml={data.manualHtml}
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
