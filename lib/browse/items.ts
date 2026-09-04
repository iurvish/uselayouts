import { isNewComponent } from "@/lib/open/new-components";

export type BrowseItem = {
  /** Registry name, also the docs slug. */
  slug: string;
  title: string;
  description: string;
  category: string;
  /** Still frame shown before/instead of the video. */
  poster: string;
  /** Muted loop preview. */
  video: string;
  isNew?: boolean;
};

/**
 * Placeholder media pools. These are swapped for Cloudflare-hosted assets once
 * per-component previews are recorded, so every URL lives in this file only.
 */
const POSTERS = [
  "photo-1506744038136-46273834b3fb",
  "photo-1470071459604-3b5ec3a7fe05",
  "photo-1441974231531-c6227db76b6e",
  "photo-1493246507139-91e8fad9978e",
  "photo-1451187580459-43490279c0fa",
  "photo-1518837695005-2083093ee35b",
  "photo-1500530855697-b586d89ba3ee",
  "photo-1502082553048-f009c37129b9",
  "photo-1483728642387-6c3bdd6c93e5",
  "photo-1439066615861-d1af74d74000",
  "photo-1519681393784-d120267933ba",
  "photo-1497436072909-60f360e1d4b1",
].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=880&q=68`);

const VIDEOS = [
  "https://res.cloudinary.com/demo/video/upload/q_auto,w_720/samples/sea-turtle.mp4",
  "https://res.cloudinary.com/demo/video/upload/q_auto,w_720/dog.mp4",
  "https://res.cloudinary.com/demo/video/upload/q_auto,w_720/samples/cld-sample-video.mp4",
  "https://res.cloudinary.com/demo/video/upload/q_auto,w_720/elephants.mp4",
  "https://videos.pexels.com/video-files/857195/857195-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/5527786/5527786-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/6981411/6981411-hd_1920_1080_25fps.mp4",
];

type Seed = { slug: string; title: string; description: string; category: string };

const SEEDS: Seed[] = [
  { slug: "3d-book", title: "3D Book", description: "Page flips with real depth.", category: "Display" },
  { slug: "animated-collection", title: "Animated Collection", description: "Items that rearrange themselves.", category: "List" },
  { slug: "bottom-menu", title: "Bottom Menu", description: "A dock that expands on demand.", category: "Navigation" },
  { slug: "day-picker", title: "Day Picker", description: "Dates chosen without friction.", category: "Input" },
  { slug: "delete-button", title: "Delete Button", description: "Confirmation folded into one tap.", category: "Button" },
  { slug: "discover-button", title: "Discover Button", description: "A button that opens up.", category: "Button" },
  { slug: "discrete-tabs", title: "Discrete Tabs", description: "Sliding between quiet states.", category: "Navigation" },
  { slug: "dynamic-toolbar", title: "Dynamic Toolbar", description: "Resizes around its content.", category: "Navigation" },
  { slug: "expandable-gallery", title: "Expandable Gallery", description: "Photos that grow into place.", category: "Display" },
  { slug: "feature-carousel", title: "Feature Carousel", description: "One idea at a time.", category: "Display" },
  { slug: "folder-interaction", title: "Folder Interaction", description: "Files that feel physical.", category: "Display" },
  { slug: "inline-edit", title: "Inline Edit", description: "Read and write in one field.", category: "Input" },
  { slug: "list-item", title: "List Item", description: "Rows that answer the cursor.", category: "List" },
  { slug: "morphing-input", title: "Morphing Input", description: "One field, many shapes.", category: "Input" },
  { slug: "multi-step-form", title: "Multi Step Form", description: "Long forms made short.", category: "Input" },
  { slug: "pricing-card", title: "Pricing Card", description: "Hierarchy that sells itself.", category: "Display" },
  { slug: "shake-testimonial-card", title: "Shake Testimonial", description: "Praise with a pulse.", category: "Display" },
  { slug: "smooth-dropdown", title: "Smooth Dropdown", description: "Menus that never jump.", category: "Navigation" },
  { slug: "status-button", title: "Status Button", description: "Idle, loading, done.", category: "Button" },
  { slug: "vertical-tabs", title: "Vertical Tabs", description: "Switching along the edge.", category: "Navigation" },
  { slug: "stacked-list", title: "Stacked List", description: "A stack that unfolds.", category: "List" },
  { slug: "bucket", title: "Bucket", description: "Chips tossed with physics.", category: "Display" },
  { slug: "fluid-expanding-grid", title: "Fluid Expanding Grid", description: "A grid that breathes.", category: "Layout" },
  { slug: "bento-card", title: "Bento Card", description: "Tabs inside a single tile.", category: "Layout" },
  { slug: "magnified-bento", title: "Magnified Bento", description: "A lens you can drag.", category: "Layout" },
  { slug: "empty-testimonial", title: "Empty Testimonial", description: "An empty state worth keeping.", category: "Display" },
  { slug: "accessible-action", title: "Accessible Action", description: "A card stack you can tilt and swipe.", category: "Display" },
  { slug: "accordionos", title: "AccordionOS", description: "Accordions with image transitions.", category: "Display" },
  { slug: "business-input", title: "Business Input", description: "A booking form that finishes cleanly.", category: "Input" },
  { slug: "card-folder", title: "Card Folder", description: "A folder card with hover depth.", category: "Display" },
  { slug: "confidential-folder", title: "Confidential Folder", description: "A 3D stack you can drag through.", category: "Display" },
  { slug: "corner-vidoe", title: "Corner Video", description: "A player that morphs from the corner.", category: "Display" },
  { slug: "elevate-testimonial", title: "Elevate Testimonial", description: "Quotes that lift into view.", category: "Display" },
  { slug: "focus-testimonials", title: "Focus Testimonials", description: "Hover to bring one voice forward.", category: "Display" },
  { slug: "infinite-grid", title: "Infinite Grid", description: "A Polaroid wall you can drag.", category: "Layout" },
  { slug: "logoshift", title: "LogoShift", description: "Logos that trade places.", category: "Display" },
  { slug: "polaroid-drag", title: "Polaroid Drag", description: "Photos that stack and tilt.", category: "Display" },
  { slug: "pop-tilt-cards", title: "Pop Tilt Cards", description: "A deck that pops toward the cursor.", category: "Display" },
  { slug: "rollingcardstack", title: "Rolling Card Stack", description: "Cards that roll into place.", category: "Display" },
  { slug: "wheel-carousel", title: "Wheel Carousel", description: "A wheel you can spin through.", category: "Display" },
];

export const browseItems: BrowseItem[] = SEEDS.map((seed, index) => ({
  ...seed,
  poster: POSTERS[index % POSTERS.length],
  video: VIDEOS[index % VIDEOS.length],
  isNew: isNewComponent(seed.slug),
}));

export const browseCategories = [
  "All",
  ...Array.from(new Set(browseItems.map((item) => item.category))).sort(),
];
