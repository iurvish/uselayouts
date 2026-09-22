import { NextResponse } from "next/server";
import { dodoClient } from "@/lib/sponsor/dodo";

export async function POST(request: Request) {
  const raw = await request.text();
  let event: unknown;
  try {
    event = dodoClient().webhooks.unwrap(raw, {
      headers: {
        "webhook-id": request.headers.get("webhook-id") ?? "",
        "webhook-signature": request.headers.get("webhook-signature") ?? "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = event as {
    type?: string;
    data?: { custom_field_responses?: unknown; product_id?: string };
  };
  if (
    payload.type === "subscription.active" ||
    payload.type === "payment.succeeded"
  ) {
    console.info("[sponsor]", payload.type, {
      product_id: payload.data?.product_id,
      custom_field_responses: payload.data?.custom_field_responses,
    });
  }

  return NextResponse.json({ ok: true });
}
