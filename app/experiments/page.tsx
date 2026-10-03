"use client";

/* Gallery of the components this branch adds.
 *
 * globals.css puts the DARK token set on :root and makes light opt-in via .light,
 * so a panel showing a token-themed component must declare which theme it is in —
 * otherwise `text-foreground` resolves to white and disappears on a white panel. */
import ProCard from "@/registry/default/example/pro-card";
import StretchyButton from "@/registry/default/example/stretchy-button";
import WheelDatePicker from "@/registry/default/example/wheel-date-picker";
import PaddingGlobal from "./padding-global";

type Item = {
  name: string;
  note: string;
  theme: "light" | "dark";
  flush?: boolean;
  render: () => React.ReactNode;
};

const ITEMS: Item[] = [
  {
    name: "Stretchy Button",
    note: "Drag the button to stretch it; release to let the spring snap it back.",
    theme: "light",
    // fullInterface would capture drags across the whole page and fight its neighbours here.
    render: () => <StretchyButton fullInterface={false} />,
  },
  {
    name: "Wheel Date Picker",
    note: "Flick a column to glide through detents. Shown on the dark token set.",
    theme: "dark",
    render: () => <WheelDatePicker />,
  },
  {
    name: "Padding Global",
    note: "Hover the card: the notch corners round in and the arrow rotates.",
    theme: "light",
    flush: true,
    render: () => <PaddingGlobal />,
  },
  {
    name: "Pro Card",
    note: "Press the hero to re-trigger the liquid wordmark.",
    theme: "light",
    // standalone would impose its own full-screen backdrop over the gallery.
    render: () => <ProCard standalone={false} showReplay={false} />,
  },
];

export default function ExperimentsPage() {
  return (
    <main className="light min-h-dvh w-full bg-white px-6 py-16">
      <header className="mx-auto mb-16 max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Experiments</h1>
        <p className="mt-2 text-sm text-neutral-500">
          New components on <code className="font-mono">feat/arsenic</code>.
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
