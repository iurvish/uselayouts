import Hero from "@/components/hero";
import PhotoGallery from "@/components/todo/photo-gallery";
import FeatureGallery from "@/components/todo/feature-gallery";
import TabSwitchPhoto from "@/components/todo/tab-swtich-photo";

export default function Page() {
  return (
    <main className="min-h-screen light bg-white font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <TabSwitchPhoto />
      <PhotoGallery />
      <FeatureGallery />
    </main>
  );
}
