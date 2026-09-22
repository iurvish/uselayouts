import { NextResponse } from "next/server";
import { assertDevOnly } from "@/lib/admin/guard";
import { extractControlsFromSource } from "@/lib/admin/dial-extract";

export async function POST(request: Request) {
  try {
    assertDevOnly();
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }
    const result = extractControlsFromSource(code);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
