import Hero from "@/components/hero";
import ProductBenefits from "@/components/product-benefits";
import Footer from "@/components/footer";
import ExpandableGalleryDemo from "@/registry/default/demo/expandable-gallery-demo";
import MemberWidget from "@/components/todo/member-widget";
import DynamicWidthExpand from "@/components/todo/dynamic-widthexpand";
import { Testimonial } from "@/components/testimonial";

export default function Page() {
  return (
    <main className="min-h-screen light bg-white font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <ProductBenefits />
      <Testimonial />

      <Footer />

      <Testimonial />
    </main>
  );
}
