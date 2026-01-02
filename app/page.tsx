import Hero from "@/components/hero";
import ProductBenefits from "@/components/product-benefits";
import Footer from "@/components/footer";
import ShakeTestimonial from "@/registry/default/example/shake-testimonial-card";
import Testimonial from "@/components/testimonial";

export default function Page() {
  return (
    <main className="min-h-screen light bg-white font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <ProductBenefits />
      <Testimonial />
      <Footer />
    </main>
  );
}
