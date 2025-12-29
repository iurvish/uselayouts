import Hero from "@/components/hero";
import ProductBenefits from "@/components/product-benefits";
import ExpandableGallery from "@/registry/default/example/expandable-gallery";
import FeatureCarousel from "@/registry/default/example/feature-carousel";
import VerticalTabs from "@/registry/default/example/vertical-tabs";
import LayoutSwitcher from "@/registry/default/example/animated-collection";
import FolderInteraction from "@/registry/default/example/folder-interaction";
import MorphCollections from "@/components/todo/morph-collections";
import MultiStepForm from "@/components/todo/multistep-form";
import ShakeTestimonial from "@/registry/default/example/shake-testimonial-card";
import PricingCard from "@/registry/default/example/pricing-card";
import Testimonial from "@/components/testimonial";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <main className="min-h-screen light bg-white font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <ProductBenefits />
      <Testimonial />

      <ExpandableGallery />

      <Footer />
    </main>
  );
}
