import { source } from "@/lib/source";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import Footer from "@/components/mdx/footer";
import { DocsPageShell } from "@/components/docs-page-shell";
import { OpenMdxPre } from "@/components/open/open-mdx";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const doc = page.data;
  const MDX = page.data.body;
  return (
    <DocsPageShell toc={doc.toc}>
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] tracking-wide text-[#4B565E]/85 uppercase">
          Documentation
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-[#071A31] sm:text-5xl sm:leading-[1.05]">
          {doc.title}
        </h1>
        {doc.description && (
          <p className="text-[15px] leading-7 text-[#4B565E]">{doc.description}</p>
        )}
      </div>
      <div
        className="prose prose-neutral mt-8 w-full min-w-0 max-w-none flex-1 overflow-x-clip text-[15px] leading-7 text-[#4B565E] *:data-[slot=alert]:first:mt-0 [&_a]:text-[#071A31] [&_code]:text-[#071A31] [&_h2]:scroll-mt-28 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[#071A31] [&_h3]:scroll-mt-28 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-[#071A31] [&_strong]:text-[#071A31]"
      >
        <MDX components={{ ...defaultMdxComponents, pre: OpenMdxPre }} />
      </div>
      <div className="mt-20 flex flex-col gap-8">
        <Footer />
      </div>
    </DocsPageShell>
  );
}

export async function generateStaticParams() {
  return source
    .generateParams()
    .filter((entry) => entry.slug?.[0] !== "components");
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
