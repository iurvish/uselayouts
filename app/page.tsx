import Hero from "@/components/hero";
import PhotoGallery from "@/components/todo/photo-gallery";
import FeatureGallery from "@/components/todo/feature-gallery";
import TabSwitchPhoto from "@/components/todo/tab-swtich-photo";
import FolderInteraction from "@/registry/default/example/folder-interaction";

import MorphCollections from "@/components/todo/morph-collections";

export default function Page() {
  return (
    <main className="min-h-screen light bg-white font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <div className="flex min-h-screen justify-center items-center flex-col gap-12 py-20">
        <MorphCollections />
        <FolderInteraction />
      </div>
    </main>
  );
}
