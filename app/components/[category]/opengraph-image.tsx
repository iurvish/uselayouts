import { ImageResponse } from "next/og";

import { getOpenNavItems } from "@/lib/open/component";
import {
  COMPONENT_CATEGORIES,
  categoryComponents,
  findCategory,
} from "@/lib/seo/categories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "useLayouts component category";

export function generateStaticParams() {
  return COMPONENT_CATEGORIES.map((category) => ({ category: category.slug }));
}

/**
 * Every page shared the one /og.jpg, so a link to the button category and a
 * link to the gallery category produced the same card. This renders the
 * category name and its real component count instead.
 */
export default async function Image(props: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await props.params;
  const category = findCategory(slug);
  if (!category) return new Response("Not found", { status: 404 });

  const navItems = await getOpenNavItems();
  const count = categoryComponents(category, navItems).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F5F3EE",
          color: "#071A31",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: -0.5 }}>
          useLayouts
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              lineHeight: 1.05,
              letterSpacing: -3,
              maxWidth: 940,
            }}
          >
            {count} {category.heading[0].toLowerCase()}
            {category.heading.slice(1)}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.4,
              color: "#4B565E",
              maxWidth: 860,
            }}
          >
            Free, MIT licensed. Copy the code or install with the shadcn CLI.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["React", "TypeScript", "Tailwind CSS", "Motion"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 24,
                color: "#3D464C",
                background: "#FFFFFF",
                border: "1px solid rgba(7,26,49,0.10)",
                borderRadius: 8,
                padding: "8px 16px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
