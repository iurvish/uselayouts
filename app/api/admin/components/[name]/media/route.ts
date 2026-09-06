import { NextResponse } from "next/server";

import { assertDevOnly } from "@/lib/admin/guard";
import {
  clearComponentMedia,
  getComponent,
  updateComponentMedia,
} from "@/lib/admin/components-fs";
import { processComponentMedia } from "@/lib/media/process-component-media";
import { r2Configured } from "@/lib/r2/client";

export const runtime = "nodejs";
/** Video re-encode can take a while. */
export const maxDuration = 120;

type Params = { params: Promise<{ name: string }> };

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

async function fileToBuffer(file: File | null): Promise<Buffer | null> {
  if (!file || file.size === 0) return null;
  return Buffer.from(new Uint8Array(await file.arrayBuffer()));
}

export async function POST(request: Request, { params }: Params) {
  try {
    assertDevOnly();
    if (!r2Configured()) {
      return NextResponse.json(
        {
          error:
            "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, and R2_PUBLIC_URL.",
        },
        { status: 503 },
      );
    }

    const { name } = await params;
    const component = await getComponent(name);
    if (!component) {
      return NextResponse.json({ error: "Component not found" }, { status: 404 });
    }

    const form = await request.formData();
    const imageFile = form.get("image");
    const videoFile = form.get("video");

    const image =
      imageFile instanceof File ? await fileToBuffer(imageFile) : null;
    const video =
      videoFile instanceof File ? await fileToBuffer(videoFile) : null;

    if (!image && !video) {
      return NextResponse.json(
        { error: "Provide an image and/or video file." },
        { status: 400 },
      );
    }
    if (image && image.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be ≤ 12MB." }, { status: 400 });
    }
    if (video && video.length > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: "Video must be ≤ 80MB." }, { status: 400 });
    }

    const existingPoster = component.controls?.posterUrl;
    const existingVideo = component.controls?.videoUrl;

    const processed = await processComponentMedia({
      slug: name,
      image,
      video,
    });

    const posterUrl = processed.posterUrl || existingPoster;
    if (!posterUrl) {
      return NextResponse.json(
        { error: "Could not produce a poster image." },
        { status: 500 },
      );
    }

    const result = await updateComponentMedia(name, {
      posterUrl,
      videoUrl: processed.videoUrl ?? existingVideo ?? null,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message.includes("development")
      ? 403
      : message.includes("Missing R2")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    assertDevOnly();
    const { name } = await params;
    const component = await getComponent(name);
    if (!component) {
      return NextResponse.json({ error: "Component not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      poster?: boolean;
      video?: boolean;
    };

    // Explicit flags; omit both → clear everything.
    const clearAll = body.poster === undefined && body.video === undefined;
    const result = await clearComponentMedia(name, {
      poster: clearAll || body.poster === true,
      video: clearAll || body.video === true,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Remove failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
