import Hero from "@/components/hero";
import { ComponentExample } from "@/components/component-example";

export default function Page() {
  return (
    <main className="min-h-[200vh] light bg-white font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <div className="min-h-screen"></div>
      <div className="min-h-screen"></div>

      {/* <ComponentExample /> */}
    </main>
  );
}
