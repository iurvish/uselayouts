import Hero from "@/components/hero";
import { ComponentExample } from "@/components/component-example";
import PhotoGallery from "@/components/todo/photo-gallery";
import FeatureGallery from "@/components/todo/feature-gallery";

export default function Page() {
  return (
    <main className="min-h-screen light bg-white    font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <div className="min-h-screen"></div>
      <div className="min-h-screen"></div>
      <PhotoGallery />
      <FeatureGallery />
    </main>
  );
}
