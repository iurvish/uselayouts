import { source } from "@/lib/source";
import type { Metadata } from "next";
import { DocsPage, DocsBody } from "@/components/layout/docs/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import Footer from "@/components/mdx/footer";
import { DocsTableOfContents } from "@/components/mdx/table-of-content";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const doc = page.data;
  const MDX = page.data.body;

  return (
    <div className="relative flex w-full flex-1 min-w-0 px-4 sm:mt-0">
      <div className="flex w-full min-w-0 flex-1 flex-col py-12 pb-32">
        <div className="flex flex-row items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className=" text-3xl font-semibold tracking-tight xl:text-4xl">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="text-muted-foreground text-[15px]">
                {doc.description}
              </p>
            )}
          </div>
        </div>
        <div className="text-primary/80 mt-8 w-full min-w-0 flex-1 text-[14px] *:data-[slot=alert]:first:mt-0 prose">
          <MDX components={{ ...defaultMdxComponents }} />
        </div>
        <div className="mt-20 flex flex-col gap-8">
          <Footer />
        </div>
      </div>
      <div className="sticky top-26 hidden h-fit shrink-0 self-start xl:flex w-fit pl-4">
        {doc.toc?.length ? (
          <div className="no-scrollbar w-fit overflow-y-auto">
            <DocsTableOfContents toc={doc.toc} />
          </div>
        ) : null}
      </div>
    </div>
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
