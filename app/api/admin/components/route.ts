import { NextResponse } from "next/server";
import { assertDevOnly } from "@/lib/admin/guard";
import {
  listComponents,
  upsertComponent,
} from "@/lib/admin/components-fs";
import { extractControlsFromSource } from "@/lib/admin/dial-extract";

export async function GET() {
  try {
    assertDevOnly();
    const items = await listComponents();
    return NextResponse.json({ items });
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
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
