import Hero from "@/components/hero";
import ExpandableGallery from "@/registry/default/example/expandable-gallery";
import FeatureCarousel from "@/registry/default/example/feature-carousel";
import VerticalTabs from "@/registry/default/example/vertical-tabs";
import LayoutSwitcher from "@/registry/default/example/animated-collection";
import FolderInteraction from "@/registry/default/example/folder-interaction";

export default function Page() {
  return (
    <main className="min-h-screen light bg-white font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <div className="flex flex-col gap-24 py-20 px-4">
        <LayoutSwitcher />
        <FolderInteraction />
        <FeatureCarousel />
        <ExpandableGallery />
        <VerticalTabs />
      </div>
    </main>
  );
}
