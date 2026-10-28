import {
  GITHUB_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo/site";

/**
 * JSON-LD has to be in the server-rendered HTML. Most AI crawlers and every
 * schema validator read the raw document, so this renders a plain <script>
 * rather than anything that waits for hydration.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Schema is built from our own constants, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Site-wide entity graph: who publishes this, and what the software is. */
export function SiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: SITE_NAME,
            description: SITE_DESCRIPTION,
            inLanguage: "en",
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: absoluteUrl("/og.jpg"),
            sameAs: [GITHUB_URL, "https://x.com/0xUrvish"],
            founder: {
              "@type": "Person",
              name: "Urvish Mali",
              url: "https://urvish.in",
            },
          },
          {
            "@type": "SoftwareApplication",
            "@id": `${SITE_URL}/#software`,
            name: SITE_NAME,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            description: SITE_DESCRIPTION,
            url: SITE_URL,
            codeRepository: GITHUB_URL,
            license: "https://opensource.org/licenses/MIT",
            isAccessibleForFree: true,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          },
        ],
      }}
    />
  );
}

/** Breadcrumbs give Google the hierarchy the flat URL structure hides. */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}

/**
 * One component page. SoftwareSourceCode is the type that matches what the
 * page actually is — a copyable React source file — and it carries the
 * language and framework that the target queries use.
 */
export function ComponentJsonLd({
  title,
  description,
  slug,
  dependencies,
}: {
  title: string;
  description: string;
  slug: string;
  dependencies?: string[];
}) {
  const url = absoluteUrl(`/docs/components/${slug}`);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        "@id": `${url}#code`,
        name: `${title} — React component`,
        headline: `${title} animated React component`,
        description,
        url,
        codeRepository: GITHUB_URL,
        programmingLanguage: { "@type": "ComputerLanguage", name: "TypeScript" },
        runtimePlatform: "React",
        license: "https://opensource.org/licenses/MIT",
        isAccessibleForFree: true,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        author: { "@id": `${SITE_URL}/#organization` },
        ...(dependencies?.length
          ? { softwareRequirements: dependencies.join(", ") }
          : {}),
      }}
    />
  );
}

/** The components index, as a list Google can read without parsing cards. */
export function ComponentListJsonLd({
  items,
  path,
  name,
  description,
}: {
  items: { title: string; slug: string; description: string }[];
  path: string;
  name: string;
  description: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(path)}#collection`,
        url: absoluteUrl(path),
        name,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${item.title} React component`,
            description: item.description,
            url: absoluteUrl(`/docs/components/${item.slug}`),
          })),
        },
      }}
    />
  );
}

/** FAQ blocks are the single most extractable unit for AI answers. */
export function FaqJsonLd({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  );
}
