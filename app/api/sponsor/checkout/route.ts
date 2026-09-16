import { NextResponse } from "next/server";
import { dodoClient, appUrl } from "@/lib/sponsor/dodo";
import {
  isSponsorTier,
  SPONSOR_COLLECTION_ID,
  SPONSOR_PLANS,
} from "@/lib/sponsor/plans";

const CUSTOM_FIELDS = [
  {
    key: "display_name",
    label: "Name to show on the sponsors page",
    field_type: "text" as const,
    placeholder: "Acme Inc.",
    required: true,
  },
  {
    key: "logo_url",
    label: "Logo URL",
    field_type: "url" as const,
    placeholder: "https://… (PNG or SVG)",
    required: true,
  },
  {
    key: "website",
    label: "Website",
    field_type: "url" as const,
    placeholder: "https://",
    required: false,
  },
];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tierRaw = (body as { tier?: unknown }).tier;
  if (typeof tierRaw !== "string" || !isSponsorTier(tierRaw)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const plan = SPONSOR_PLANS[tierRaw];
  const origin = appUrl();

  let session;
  try {
    session = await dodoClient().checkoutSessions.create({
      product_collection_id: SPONSOR_COLLECTION_ID,
      // Collection checkout requires an empty cart; Dodo preselects the first
      // product in the collection. The clicked tier is metadata only — the
      // customer can switch Gold/Silver/Bronze on the hosted page.
      product_cart: [],
      custom_fields: CUSTOM_FIELDS,
      feature_flags: {
        allow_discount_code: true,
        redirect_immediately: true,
      },
      customization: { theme: "dark" },
      metadata: {
        sponsor_tier_clicked: tierRaw,
        sponsor_product_clicked: plan.productId,
      },
      cancel_url: `${origin}/sponsor`,
      return_url: `${origin}/sponsor/thanks`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    const status = message.includes("DODO_PAYMENTS_API_KEY") ? 503 : 502;
    return NextResponse.json(
      {
        error:
          status === 503
            ? "Checkout is not configured"
            : "Could not start checkout",
      },
      { status },
    );
  }

  if (!session.checkout_url) {
    return NextResponse.json({ error: "Checkout URL missing" }, { status: 502 });
  }

  return NextResponse.json({ checkoutUrl: session.checkout_url });
}
