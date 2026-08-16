import { BrowseExperience } from "@/components/browse/browse-experience";
import { browseItems } from "@/lib/browse/items";

export default function BrowsePage() {
  return <BrowseExperience items={browseItems} />;
}
