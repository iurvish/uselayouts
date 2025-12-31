import Hero from "@/components/hero";
import ProductBenefits from "@/components/product-benefits";
import Testimonial from "@/components/testimonial";
import Footer from "@/components/footer";

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
