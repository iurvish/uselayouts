import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip static assets; refresh auth cookies on app routes.
     *
     * Admin media upload is skipped too: when middleware runs, Next clones the
     * request body through `cloneBodyStream()`, which truncates it at
     * `experimental.proxyClientMaxBodySize` and leaves the route handler a cut-off
     * multipart body ("Failed to parse body as FormData"). Cookie refresh buys
     * that dev-only, filesystem-backed route nothing, so it stays out of the path.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/admin/components/[^/]+/media|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4)$).*)",
  ],
};
