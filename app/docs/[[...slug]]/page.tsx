import { source } from "@/lib/source";
import type { Metadata } from "next";
import { DocsPage, DocsBody } from "@/components/layout/docs/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { DocsCopyPage } from "@/components/docs-copy-page";
import { absoluteUrl } from "@/lib/utils";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const raw = await page.data.getText("raw");
  const pageUrl = absoluteUrl(page.url);

  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <h1 className="flex-1 min-w-0">{page.data.title}</h1>
          <div className="shrink-0">
            <DocsCopyPage page={raw} url={pageUrl} />
          </div>
        </div>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
