import { NextResponse } from "next/server";
import { assertDevOnly } from "@/lib/admin/guard";
import {
  deleteComponent,
  getComponent,
  updateControls,
  upsertComponent,
} from "@/lib/admin/components-fs";

type Params = { params: Promise<{ name: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    assertDevOnly();
    const { name } = await params;
    const component = await getComponent(name);
    if (!component) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(component);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    assertDevOnly();
    const { name } = await params;
    const body = await request.json();

    if (body.mode === "controls") {
      const result = await updateControls(
        name,
        body.disabledControls ?? [],
        body.dialConfig,
      );
      return NextResponse.json({ ok: true, ...result });
    }

    const result = await upsertComponent({
      name,
      title: body.title,
      description: body.description,
      code: body.code,
      dependencies: body.dependencies,
      features: body.features,
      dialConfig: body.dialConfig,
      disabledControls: body.disabledControls,
      previewBackground: body.previewBackground,
      interactionHints: body.interactionHints,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    assertDevOnly();
    const { name } = await params;
    const result = await deleteComponent(name);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
