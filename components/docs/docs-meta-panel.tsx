import Link from "next/link";
import type { ReactNode } from "react";

export function DocsMetaPanel({
  description,
  quickCopy,
}: {
  description?: ReactNode;
  quickCopy?: string;
}) {
  return (
    <aside
      className="hidden self-start lg:block"
      style={{ position: "sticky", top: "6rem" }}
    >
      <div className="space-y-6 text-[13px] text-[#4B565E]">
        {description ? (
          <div>
            <p className="mb-2 font-medium text-[#071A31]">On this page</p>
            <p>{description}</p>
          </div>
        ) : null}

        {quickCopy ? (
          <div className="border-t border-[#E2E2E2] pt-5">
            <p className="mb-2 font-medium text-[#071A31]">Quick copy</p>
            <pre className="overflow-x-auto rounded-md border border-[#E2E2E2] bg-white/70 p-3 font-mono text-[11px] leading-relaxed text-[#071A31]/85">
              {quickCopy}
            </pre>
          </div>
        ) : null}

        <div className="border-t border-[#E2E2E2] pt-5">
          <p className="mb-2 font-medium text-[#071A31]">Related</p>
          <ul className="space-y-2">
            <li>
              <Link
                href="/docs/components/pricing-card"
                className="transition-colors duration-150 hover:text-[#071A31]"
              >
                Component gallery
              </Link>
            </li>
            <li>
              <Link
                href="/browse"
                className="transition-colors duration-150 hover:text-[#071A31]"
              >
                Browse all layouts
              </Link>
            </li>
          </ul>
        </div>

        <div className="border-t border-[#E2E2E2] pt-5">
          <p className="font-medium text-[#071A31]">Updated</p>
          <p className="mt-1">March 2026</p>
        </div>
      </div>
    </aside>
  );
}
