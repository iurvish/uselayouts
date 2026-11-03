import { NextResponse } from "next/server";
import { assertDevOnly } from "@/lib/admin/guard";
import {
  listComponents,
  upsertComponent,
} from "@/lib/admin/components-fs";
import { extractControlsFromSource } from "@/lib/admin/dial-extract";
import { getComponentCopyStats } from "@/lib/supabase/admin";
import { DATES, latestBatch } from "@/lib/browse/ranking";

export async function GET() {
  try {
    assertDevOnly();
    const [items, copyStats] = await Promise.all([
      listComponents(),
      getComponentCopyStats(),
    ]);
    const fresh = latestBatch();
    // Newest batch first here, not the blended browse score: this list is for
    // editing, and what you just added is what you are most likely to open.
    // /admin/copies is the view ranked by how well things are doing.
    const ranked = items
      .map((item) => ({
        ...item,
        copies: copyStats[item.name]?.copies ?? 0,
        lastCopiedAt: copyStats[item.name]?.lastCopiedAt ?? null,
        addedAt: DATES[item.name] ?? null,
        isNew: fresh.has(item.name),
      }))
      .sort(
        (a, b) =>
          Number(b.isNew) - Number(a.isNew) ||
          (b.addedAt ?? "").localeCompare(a.addedAt ?? "") ||
          b.copies - a.copies ||
          a.title.localeCompare(b.title),
      );
    return NextResponse.json({ items: ranked });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    assertDevOnly();
    const body = await request.json();
    const {
      name,
      title,
      description,
      code,
      dependencies,
      features,
      dialConfig,
      disabledControls,
      previewBackground,
      hintTop,
      showHint,
      hintKind,
      hintHeading,
      hintDescription,
      hintHideOnScroll,
      tags,
    } = body;

    if (!title || !description || !code) {
      return NextResponse.json(
        { error: "title, description, and code are required" },
        { status: 400 },
      );
    }

    const extracted = extractControlsFromSource(code);
    const result = await upsertComponent({
      name,
      title,
      description,
      code,
      dependencies,
      features,
      dialConfig: dialConfig ?? extracted.dialConfig,
      disabledControls: disabledControls ?? [],
      previewBackground,
      hintTop,
      showHint,
      hintKind,
      hintHeading,
      hintDescription,
      hintHideOnScroll,
      tags,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
