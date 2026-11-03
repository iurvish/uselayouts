"use client";

/* Gallery of the components this branch adds.
 *
 * globals.css puts the DARK token set on :root and makes light opt-in via .light,
 * so a panel showing a token-themed component must declare which theme it is in —
 * otherwise `text-foreground` resolves to white and disappears on a white panel. */
import FlowerMenu from "@/registry/default/example/flower-menu";
import MemoryCardStack from "@/registry/default/example/memory-card-stack";
import Paywall from "@/registry/default/example/paywall";
import Slider from "@/registry/default/example/slider";

type Item = {
  name: string;
  note: string;
  theme: "light" | "dark";
  flush?: boolean;
  render: () => React.ReactNode;
};

const ITEMS: Item[] = [
  {
    name: "Flower Menu",
    note: "Press the plus: ten satellites bloom outward on a stagger and the plus turns into a cross.",
    theme: "light",
    // Brings its own 420px panel and parchment background.
    flush: true,
    render: () => <FlowerMenu />,
  },
  {
    name: "Memory Card Stack",
    note: "Page through the stack, or expand a card. Themed off the shadcn tokens.",
    theme: "light",
    render: () => <MemoryCardStack />,
  },
  {
    name: "Paywall",
    note: "Switch plans on the segmented control and the price rolls over to match.",
    theme: "light",
    render: () => <Paywall />,
  },
  {
    name: "Slider",
    note: "Drag across the bar: the two shares track the pointer 1:1 and the brighter side is whichever is ahead.",
    theme: "light",
    render: () => <Slider />,
  },
];

export default function ExperimentsPage() {
  return (
    <main className="light min-h-dvh w-full bg-white px-6 py-16">
      <header className="mx-auto mb-16 max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Experiments</h1>
        <p className="mt-2 text-sm text-neutral-500">
          The components on <code className="font-mono">feat/new-components</code>.
        </p>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        {ITEMS.map((item) => (
          <section key={item.name}>
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-medium text-neutral-900">{item.name}</h2>
              <p className="text-sm text-neutral-500">{item.note}</p>
            </div>
            <div
              className={[
                item.theme,
                "grid min-h-80 place-items-center overflow-hidden rounded-2xl",
                item.flush ? "" : "p-10",
                item.theme === "dark"
                  ? "bg-background shadow-[0_0_0_1px_rgb(255_255_255/0.08)]"
                  : "bg-neutral-50 shadow-[0_0_0_1px_rgb(0_0_0/0.06)]",
              ].join(" ")}
            >
              {item.render()}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
