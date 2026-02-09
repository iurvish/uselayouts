import Hero from "@/components/hero";
import ProductBenefits from "@/components/product-benefits";
import Footer from "@/components/footer";
import { Testimonial } from "@/components/testimonial";
import Bento2 from "@/components/todo/bento-2";
import ProcessSteps from "@/components/process-steps";

export default function Page() {
  return (
    <main className="min-h-screen light bg-white font-[family-name:var(--font-geist-sans)]">
      {/* <Hero />
      <Testimonial />
      <ProductBenefits />
      <Footer /> */}
      <ProcessSteps />
    </main>
  );
}
