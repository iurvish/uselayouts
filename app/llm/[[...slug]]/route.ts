import { notFound } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";

import { convertMdxToMarkdown } from "@/lib/llm";
import { source } from "@/lib/source";

export const revalidate = false;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  const cleanSlug = slug.map((s, i) =>
    i === slug.length - 1 ? s.replace(/\.md$/, "") : s
  );

  const page = source.getPage(cleanSlug);

  if (!page) {
    notFound();
  }

  const processedContent = convertMdxToMarkdown(await page.data.getText("raw"));

  return new NextResponse(processedContent, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
