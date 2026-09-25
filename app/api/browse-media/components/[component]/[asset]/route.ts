import { NextResponse } from "next/server";

const CDN_ORIGIN = "https://cdn.uselayouts.com";
const SITE_REFERER = "https://uselayouts.com/browse";
const ONE_YEAR = "public, max-age=31536000, immutable";

type Params = { params: Promise<{ component: string; asset: string }> };

function isKnownComponentAsset(component: string, asset: string) {
  return (
    /^[a-z0-9-]+$/.test(component) &&
    /^(poster|video)(-[a-f0-9]{10})?\.(avif|mp4)$/.test(asset)
  );
}

/**
 * Same-origin bridge for the upstream component-media CDN.
 *
 * The upstream enables hotlink protection and accepts requests from
 * uselayouts.com only. The route is deliberately not a general proxy: it
 * permits just the catalog's poster/video key format, forwards Range for video
 * seeking, and lets browsers cache immutable media for one year.
 */
export async function GET(request: Request, { params }: Params) {
  const { component, asset } = await params;
  if (!isKnownComponentAsset(component, asset)) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const range = request.headers.get("range");
  const upstream = await fetch(`${CDN_ORIGIN}/components/${component}/${asset}`, {
    headers: {
      Referer: SITE_REFERER,
      ...(range ? { Range: range } : {}),
    },
  });

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: "Media unavailable" }, { status: upstream.status });
  }

  const headers = new Headers({
    "Cache-Control": upstream.headers.get("cache-control") ?? ONE_YEAR,
    "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
  });

  for (const name of ["accept-ranges", "content-length", "content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
