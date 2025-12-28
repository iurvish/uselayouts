import Hero from "@/components/hero";
import ExpandableGallery from "@/registry/default/example/expandable-gallery";
import FeatureCarousel from "@/registry/default/example/feature-carousel";
import VerticalTabs from "@/registry/default/example/vertical-tabs";
import LayoutSwitcher from "@/registry/default/example/animated-collection";
import FolderInteraction from "@/registry/default/example/folder-interaction";
import MorphCollections from "@/components/todo/morph-collections";
import MultiStepForm from "@/components/todo/multistep-form";
import ShakeTestimonial from "@/registry/default/example/shake-testimonial-card";
import PricingCard from "@/registry/default/example/pricing-card";

export default function Page() {
  return (
    <main className="min-h-screen light bg-white font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <div className="flex flex-col min-h-screen items-center justify-center gap-24 py-20 px-4">
        {/* <ShakeTestimonial /> */}

        <PricingCard />
        <LayoutSwitcher />
        <FolderInteraction />
        <MorphCollections />
        <FeatureCarousel />
        <ExpandableGallery />
        <VerticalTabs />

        <ShakeTestimonial />

        <MultiStepForm />
      </div>
    </main>
  );
}
