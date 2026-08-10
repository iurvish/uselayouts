import { source } from "@/lib/source";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import Footer from "@/components/mdx/footer";
import { DocsPageShell } from "@/components/docs-page-shell";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const doc = page.data;
  const MDX = page.data.body;
  const isComponentDoc = params.slug?.[0] === "components";

  return (
    <DocsPageShell showDial={isComponentDoc} toc={doc.toc}>
      <div className="flex flex-row items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight xl:text-4xl">
            {doc.title}
          </h1>
          {doc.description && (
            <p className="text-[15px] text-muted-foreground">
              {doc.description}
            </p>
          )}
        </div>
      </div>
      <div className="prose mt-8 w-full min-w-0 max-w-none flex-1 overflow-x-clip text-[14px] text-primary/80 *:data-[slot=alert]:first:mt-0">
        <MDX components={{ ...defaultMdxComponents }} />
      </div>
      <div className="mt-20 flex flex-col gap-8">
        <Footer />
      </div>
    </DocsPageShell>
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
