import { NextResponse } from "next/server";

import { getSupabaseUrl } from "@/lib/supabase/env";

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || !email.includes("@") || email.length > 320) return null;
  return email;
}

/** Returns whether an auth user already exists for this email (service role). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = normalizeEmail(
    body && typeof body === "object" && "email" in body
      ? (body as { email?: unknown }).email
      : null,
  );
  if (!email) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ exists: false });
  }

  try {
    const res = await fetch(
      `${url}/auth/v1/admin/users?page=1&per_page=1&email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      console.error("[auth/email-exists]", res.status, await res.text());
      return NextResponse.json({ exists: false });
    }

    const json = (await res.json()) as { users?: Array<{ email?: string | null }> };
    const exists = (json.users ?? []).some(
      (user) => user.email?.toLowerCase() === email,
    );

    return NextResponse.json({ exists });
  } catch (err) {
    console.error("[auth/email-exists]", err);
    return NextResponse.json({ exists: false });
  }
}
