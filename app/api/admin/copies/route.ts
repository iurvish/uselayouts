import { NextResponse } from "next/server";

import { assertDevOnly } from "@/lib/admin/guard";
import { listComponents } from "@/lib/admin/components-fs";
import { browseUploadedMedia } from "@/lib/browse/items";
import { DATES, latestBatch } from "@/lib/browse/ranking";
import { getComponentCopyStats } from "@/lib/supabase/admin";

/**
 * How each component is actually doing, ranked by copies.
 *
 * Dev-only like the rest of the admin component tools, because it reads the
 * registry off the filesystem to pair every component with its media and MDX
 * state. The counts themselves come from Supabase, so they are real production
 * numbers even when read locally.
 */
export async function GET() {
  try {
    assertDevOnly();

    const [items, copyStats] = await Promise.all([
      listComponents(),
      getComponentCopyStats(),
    ]);
    const fresh = latestBatch();

    const rows = items
      .map((item) => {
        const media = browseUploadedMedia(item.name);
        const stat = copyStats[item.name];
        return {
          name: item.name,
          title: item.title,
          description: item.description ?? "",
          poster: media.poster,
          // Empty unless a clip was actually uploaded in admin — there are no
          // placeholder videos here, so the card shows a still and says so.
          video: media.video,
          copies: stat?.copies ?? 0,
          lastCopiedAt: stat?.lastCopiedAt ?? null,
          addedAt: DATES[item.name] ?? null,
          isNew: fresh.has(item.name),
          hasMdx: item.hasMdx,
          controlsCount: item.controlsCount,
          tags: item.tags,
        };
      })
      .sort(
        (a, b) =>
          b.copies - a.copies ||
          (b.lastCopiedAt ?? "").localeCompare(a.lastCopiedAt ?? "") ||
          a.title.localeCompare(b.title),
      );

    const totalCopies = rows.reduce((sum, row) => sum + row.copies, 0);
    const copied = rows.filter((row) => row.copies > 0).length;

    return NextResponse.json({
      items: rows,
      totals: {
        totalCopies,
        copied,
        never: rows.length - copied,
        components: rows.length,
        // Null rather than 0 when nothing has been copied, so the page can say
        // "no copies yet" instead of showing a confident 0% share on every row.
        topCopies: rows[0]?.copies || null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
