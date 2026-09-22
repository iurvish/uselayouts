import { BrowseExperience } from "@/components/browse/browse-experience";
import { loadComponentTags } from "@/lib/admin/components-fs";
import { browseItems } from "@/lib/browse/items";

export default async function BrowsePage() {
  const tags = await loadComponentTags();
  const items = browseItems.map((item) => ({
    ...item,
    tags: tags[item.slug] ?? [],
  }));
  return <BrowseExperience items={items} />;
}
