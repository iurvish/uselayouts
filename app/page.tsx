import Hero from "@/components/hero";
import { ComponentExample } from "@/components/component-example";
import { SaveButton } from "@/registry/default/example/save-button";
import InputSwitch from "@/registry/default/example/input-switch";
import TwentyThreeFour from "@/registry/default/example/frequency-selector";

export default function Page() {
  return (
    <main className="min-h-screen dark    font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <div className="min-h-screen"></div>
      <div className="min-h-screen"></div>
      <SaveButton />

      {/* <TwentyEightOne /> */}
      <InputSwitch />
      <TwentyThreeFour />

      {/* <ComponentExample /> */}
    </main>
  );
}
