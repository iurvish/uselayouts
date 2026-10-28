import type { OpenNavItem } from "@/lib/open/component";

/**
 * Category landing pages.
 *
 * Every page that ranks for the queries we want ("animated button react",
 * "react card component") is a category page, not an individual component
 * page — animata.design/docs/guides/animated-react-buttons,
 * kokonutui.com/docs/buttons, ui.watermelon.sh/.../buttons all follow the same
 * shape. The /components hub used in-page anchors (#button) for this, and an
 * anchor is not a URL Google can rank.
 *
 * Membership comes from the component tag vocabulary in
 * registry/default/controls/*.json, which is finer-grained than the six coarse
 * browse categories (Display alone holds 33 components).
 */
export type ComponentCategory = {
  slug: string;
  /** <h1>, and the phrase the page should win. */
  heading: string;
  /** Noun phrase for mid-page headings, e.g. "button components". */
  shortName: string;
  /** <title>, kept under ~60 chars before the brand suffix. */
  title: string;
  metaDescription: string;
  /** The 40-60 word answer block. AI engines lift this close to verbatim. */
  summary: string;
  /** Tags that put a component in this category. */
  tags: string[];
  /** Prose sections. This is what the ranking competitors have and a bare grid does not. */
  sections: { heading: string; body: string }[];
  faq: { question: string; answer: string }[];
};

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    slug: "buttons",
    shortName: "button components",
    heading: "Animated button components for React",
    title: "Animated React Button Components (Free)",
    metaDescription:
      "Free animated React button components built with Motion and Tailwind CSS — press states, loading and success, confirm and delete. Copy the code or install with the shadcn CLI.",
    summary:
      "A free collection of animated React button components built with Motion and Tailwind CSS. Each one is a single TypeScript file covering a real button problem — press feedback, loading and success states, destructive confirmation — that you copy into your project or install with the shadcn CLI. MIT licensed.",
    tags: [
      "button",
      "press",
      "save",
      "delete",
      "status",
      "loading",
      "discover",
    ],
    sections: [
      {
        heading: "What makes a button feel good to press",
        body: "A button has about 100ms to tell you it heard you. The components here lean on three things to do that: a transform on press rather than a color change, because movement reads faster than hue; a spring rather than a fixed duration, so the return feels physical instead of mechanical; and a state that survives the click, because the slowest part of pressing a button is usually waiting for the request behind it. Buttons that only animate on hover solve the wrong half of the problem — hover does not exist on a phone.",
      },
      {
        heading: "Loading and success states",
        body: "Most button bugs are state bugs, not animation bugs. A button that stays enabled during its request gets double-submitted; one that swaps to a spinner and back gives no confirmation anything worked. The pattern worth copying is idle, loading, success, then back to idle — disabled while in flight, and a visible success beat before it resets. Save Button implements exactly that cycle, including the disable, so you are not wiring it yourself.",
      },
      {
        heading: "Destructive actions",
        body: "Delete needs friction, but a confirm dialog for a single row is heavy. Folding the confirmation into the button itself — press once to arm, again to commit — keeps the interaction in one place and gives an obvious escape, because moving the cursor away disarms it. It suits list rows and inline controls. For anything that cannot be undone at all, use a real dialog.",
      },
      {
        heading: "Accessibility and reduced motion",
        body: "Every button here is a real <button> element, so Enter and Space work, focus order is correct, and screen readers announce it as a button. Keep the visible focus ring: removing the outline to tidy the design makes the control unusable by keyboard. Transforms are also the cheapest thing to drop under prefers-reduced-motion — the state change still reads without the spring, so honour the media query rather than animating regardless.",
      },
    ],
    faq: [
      {
        question: "Are these React button components free?",
        answer:
          "Yes. Every button component is MIT licensed and free for personal and commercial projects, with no attribution required and no sign-up to copy the code.",
      },
      {
        question: "How do I add an animated button to my React project?",
        answer:
          "Run npx shadcn@latest add with the component's registry URL, or open the component page and copy the single .tsx file into your project. You own the file afterwards — there is no package to install and nothing to keep updated.",
      },
      {
        question: "Do these buttons work with shadcn/ui?",
        answer:
          "Yes. They are plain React and Tailwind CSS components with no competing primitives, so they sit alongside shadcn/ui rather than replacing its Button. Most projects use both.",
      },
      {
        question: "What animation library do they use?",
        answer:
          "Motion, previously called Framer Motion. It is the only runtime dependency the animated buttons need, and it is a peer dependency you probably already have.",
      },
    ],
  },
  {
    slug: "cards",
    shortName: "card components",
    heading: "Animated card components for React",
    title: "Animated React Card Components (Free)",
    metaDescription:
      "Free animated React card components built with Motion and Tailwind CSS — card stacks, tilt and hover effects, testimonials, pricing and profile cards. Copy the code or install with the shadcn CLI.",
    summary:
      "A free collection of animated React card components built with Motion and Tailwind CSS. Cards that stack, tilt, expand and reorder, plus testimonial, pricing and profile layouts. Each is a single TypeScript file you copy into your project or install with the shadcn CLI. MIT licensed.",
    tags: ["card", "cards", "testimonial", "crm", "tilt", "stack", "polaroid"],
    sections: [
      {
        heading: "Cards are a layout problem before they are an animation problem",
        body: "A card is a container, so most of what makes one feel good is not the motion — it is the nested radius, the one shadow doing the lifting, and the fact that the whole surface is the click target rather than a small link inside it. Animation should amplify a hierarchy that already works. If a card reads as a flat box when you disable every transition, more motion will not rescue it.",
      },
      {
        heading: "Stacks, shuffles and shared layout",
        body: "The interesting card interactions are transitions between two arrangements: a tidy stack that fans into a grid, an avatar rail that expands into every face. Those are shared-element problems, and the reason they look expensive to build is that people animate position by hand. With layoutId the browser interpolates between the two positions for you, so the work is deciding what the two states are. Polaroid Stack and Client Card both use that approach.",
      },
      {
        heading: "Hover, tilt and the mobile question",
        body: "Tilt and 3D hover effects are genuinely good on a trackpad and completely absent on a phone, which is most of your traffic. Treat them as enhancement rather than the main event: the card must carry its hierarchy without the tilt, and the tilt should come through a hover media query so touch devices never get a stuck transform. Pointer-driven rotation also needs a cheap transform — rotate and scale composite on the GPU; animating box-shadow does not.",
      },
      {
        heading: "Testimonials, pricing and content cards",
        body: "Social proof and pricing cards fail on content, not motion. A testimonial needs a real face, a real name and a specific claim, because a grid of generic quotes reads as filler no matter how well it animates. A pricing card needs one obvious recommendation and a visible difference between tiers. The components here give you the layout and the motion; the specificity is yours to supply.",
      },
    ],
    faq: [
      {
        question: "Are these React card components free?",
        answer:
          "Yes. Every card component is MIT licensed and free for personal and commercial projects, with no attribution required and no sign-up to copy the code.",
      },
      {
        question: "How do I add an animated card to my React project?",
        answer:
          "Run npx shadcn@latest add with the component's registry URL, or copy the single .tsx file from the component page into your project. You own the file afterwards.",
      },
      {
        question: "Do the card animations work on mobile?",
        answer:
          "The stack, expand and drag interactions do, and they are built for touch. Tilt and 3D hover effects need a pointer, so they are applied behind a hover media query and simply do not activate on touch devices.",
      },
      {
        question: "Can I use these cards with Next.js?",
        answer:
          "Yes. They work in Next.js, Vite, Remix and any React 18+ setup. The animated cards are client components, so in the Next.js App Router they need the use client directive, which is already in the file you copy.",
      },
    ],
  },
  {
    slug: "navigation",
    shortName: "navigation components",
    heading: "Animated navigation components for React",
    title: "Animated React Navigation Components (Free)",
    metaDescription:
      "Free animated React navigation components built with Motion and Tailwind CSS — navbars, tabs, dropdowns, drawers, toolbars and bottom menus. Copy the code or install with the shadcn CLI.",
    summary:
      "A free collection of animated React navigation components built with Motion and Tailwind CSS. Navbars, tab bars, dropdowns, drawers, command toolbars and mobile bottom menus. Each is a single TypeScript file you copy into your project or install with the shadcn CLI. MIT licensed.",
    tags: ["nav", "menu", "tabs", "dropdown", "drawer", "filter", "accordion"],
    sections: [
      {
        heading: "Navigation animation has one job: show where you went",
        body: "A tab bar that cross-fades tells you nothing about the relationship between the old tab and the new one. One that slides an indicator to the selected tab tells you the direction you moved and which item you are on, in the same beat. That is the whole reason to animate navigation — continuity, not decoration. It is also why direction matters: an indicator that always slides from the left is lying half the time.",
      },
      {
        heading: "Dropdowns and menus that do not jump",
        body: "Menus break in two predictable ways. They animate height from zero, which cannot be done cheaply and produces a stutter as the browser reflows every frame. And they are positioned in CSS, so near a viewport edge they open off-screen. The fix for the first is animating transform and opacity and letting the height be measured; for the second it is a positioning library that flips the menu when it runs out of room. Smooth Dropdown handles both.",
      },
      {
        heading: "Mobile navigation and safe areas",
        body: "A bottom menu is the right pattern on a phone and the place layout bugs hide. It needs padding for the home indicator through env(safe-area-inset-bottom), tap targets of at least 44px, and a position that survives the software keyboard opening. Bottom Menu and Dynamic Toolbar both account for the inset, which is the part that is easy to miss on a simulator and obvious on real hardware.",
      },
      {
        heading: "Keyboard and focus",
        body: "Navigation is the most keyboard-dependent part of an interface, so it is the worst place to break focus. A menu should trap focus while open, return it to the trigger on close, and respond to Escape. Tabs should move with arrow keys, not Tab, following the ARIA tabs pattern. An animated menu that cannot be closed with Escape is a regression regardless of how it looks.",
      },
    ],
    faq: [
      {
        question: "Are these React navigation components free?",
        answer:
          "Yes. Every navigation component is MIT licensed and free for personal and commercial projects, with no attribution required and no sign-up to copy the code.",
      },
      {
        question: "Do the tabs and menus support keyboard navigation?",
        answer:
          "Yes. Menus trap focus while open, return focus to the trigger on close and respond to Escape, and tab components move between tabs with the arrow keys following the ARIA tabs pattern.",
      },
      {
        question: "How do I add an animated navbar to my React project?",
        answer:
          "Run npx shadcn@latest add with the component's registry URL, or copy the single .tsx file from the component page into your project. You own the file afterwards.",
      },
      {
        question: "Will a bottom menu work correctly on iPhone?",
        answer:
          "Yes. The bottom navigation components pad for the home indicator using env(safe-area-inset-bottom) and use tap targets of at least 44px, so they sit above the gesture area rather than under it.",
      },
    ],
  },
  {
    slug: "carousels",
    shortName: "carousel and slider components",
    heading: "Animated carousel and slider components for React",
    title: "React Carousel & Slider Components (Free)",
    metaDescription:
      "Free animated React carousel and slider components built with Motion and Tailwind CSS — coverflow, drag, wheel and infinite carousels. Copy the code or install with the shadcn CLI.",
    summary:
      "A free collection of animated React carousel and slider components built with Motion and Tailwind CSS. Drag-driven coverflow, wheel pickers, overlapping sliders and infinite grids. Each is a single TypeScript file you copy into your project or install with the shadcn CLI. MIT licensed.",
    tags: ["carousel", "slider", "swipe", "drag", "coverflow"],
    sections: [
      {
        heading: "Most carousels should not be carousels",
        body: "Worth saying before the list: a carousel hides all but one item behind an interaction most people never perform, and on a homepage the second slide is usually seen by a small fraction of visitors. If the content matters, a grid or a scrolling rail beats a carousel. Carousels earn their place where the items are genuinely alternatives — photos, product angles, testimonials — and where the browsing is the point.",
      },
      {
        heading: "Drag that follows the finger",
        body: "The difference between a carousel that feels native and one that feels like a website is whether it tracks the pointer in real time. That means the item follows your finger 1:1 while dragging, momentum carries past the release point, and the snap decision comes from velocity rather than distance alone — a fast flick should advance even if it barely moved. Coverflow Drag and Polaroid Drag both resolve on velocity.",
      },
      {
        heading: "Scroll snap versus a JavaScript carousel",
        body: "For a simple horizontal rail, CSS scroll-snap is the better tool: it is native, it handles momentum and accessibility for free, and it costs no JavaScript. Reach for a JavaScript carousel when you need transforms between slides that scroll cannot express — depth, rotation, overlapping layers — or programmatic control like autoplay and jumping to an index. The components here are the second case.",
      },
      {
        heading: "Autoplay, accessibility and reduced motion",
        body: "Autoplay is the most common accessibility failure in carousels. If it moves on its own it needs a visible pause control, it must stop on hover and on focus, and it must not move at all under prefers-reduced-motion. Slides also need to be reachable by keyboard and announced as a group, which means real focus management rather than a row of divs. A carousel nobody can pause is worse than a static grid.",
      },
    ],
    faq: [
      {
        question: "Are these React carousel components free?",
        answer:
          "Yes. Every carousel and slider component is MIT licensed and free for personal and commercial projects, with no attribution required and no sign-up to copy the code.",
      },
      {
        question: "Do these carousels support touch and drag?",
        answer:
          "Yes. The drag-based carousels track the pointer 1:1, carry momentum past the release point and decide whether to snap forward based on velocity, so a quick flick advances the slide.",
      },
      {
        question: "Should I use a carousel or CSS scroll-snap?",
        answer:
          "Use CSS scroll-snap for a plain horizontal rail — it is native, free and accessible. Use a JavaScript carousel when you need transforms scroll cannot express, such as depth or overlapping layers, or programmatic control like autoplay.",
      },
      {
        question: "How do I add a carousel to my React project?",
        answer:
          "Run npx shadcn@latest add with the component's registry URL, or copy the single .tsx file from the component page into your project. You own the file afterwards.",
      },
    ],
  },
  {
    slug: "galleries",
    shortName: "gallery and grid components",
    heading: "Animated gallery and grid components for React",
    title: "React Image Gallery & Grid Components (Free)",
    metaDescription:
      "Free animated React gallery and grid components built with Motion and Tailwind CSS — bento grids, expanding photo galleries, albums and masonry layouts. Copy the code or install with the shadcn CLI.",
    summary:
      "A free collection of animated React gallery and grid components built with Motion and Tailwind CSS. Bento grids, expanding photo galleries, albums, masonry layouts and lightbox interactions. Each is a single TypeScript file you copy into your project or install with the shadcn CLI. MIT licensed.",
    tags: ["photos", "gallery", "image", "grid", "bento", "album"],
    sections: [
      {
        heading: "Galleries live and die on image performance",
        body: "A gallery is the heaviest thing on most pages, so the component is the easy part. What decides whether it feels fast is serving modern formats, sizing images to their rendered box rather than their source, giving every image explicit width and height so nothing shifts as it loads, and lazy-loading everything below the fold while eagerly loading what is visible. A beautifully animated grid that ships 4MB of JPEG is a slow gallery.",
      },
      {
        heading: "Expanding a thumbnail into a full view",
        body: "The interaction worth getting right is the thumbnail that becomes the full image. Done as a fade between two elements it reads as a new screen; done as a shared-element transition it reads as the same photo growing, and the viewer keeps their place in the grid. That is a layoutId transition on the image itself. Expandable Gallery and Dynamic Grid Gallery both do it this way.",
      },
      {
        heading: "Bento grids without the sameness",
        body: "Bento layouts became a default, which is why so many look identical: equal-weight tiles, same radius, one accent colour, nothing leading the eye. The layout only works when the sizes encode real priority — one tile that genuinely matters most, supporting tiles that are visibly secondary. If every cell is the same importance, a plain grid communicates more honestly and costs less.",
      },
      {
        heading: "Layout shift and aspect ratios",
        body: "Mixed aspect ratios are where grids break. Without a reserved box, each image resizes its cell as it arrives and the whole grid reflows — bad for the viewer and directly measured as Cumulative Layout Shift. Set an aspect-ratio on the cell, or carry real dimensions with the data, so the grid's geometry is known before a single image loads.",
      },
    ],
    faq: [
      {
        question: "Are these React gallery components free?",
        answer:
          "Yes. Every gallery and grid component is MIT licensed and free for personal and commercial projects, with no attribution required and no sign-up to copy the code.",
      },
      {
        question: "Do these galleries handle image optimization?",
        answer:
          "They handle layout and motion, and reserve each cell's box so images cannot shift the grid as they load. Serving the images themselves — modern formats, correct sizes, lazy loading — stays with your framework, for example next/image in Next.js.",
      },
      {
        question: "How do I add an image gallery to my React project?",
        answer:
          "Run npx shadcn@latest add with the component's registry URL, or copy the single .tsx file from the component page into your project, then swap the placeholder image array for your own.",
      },
      {
        question: "Can I use these for a portfolio site?",
        answer:
          "Yes. They are MIT licensed with no attribution required, and the album, polaroid and expanding grid layouts are built for exactly that kind of photographic work.",
      },
    ],
  },
  {
    slug: "inputs",
    shortName: "input and form components",
    heading: "Animated input and form components for React",
    title: "Animated React Input & Form Components (Free)",
    metaDescription:
      "Free animated React input and form components built with Motion and Tailwind CSS — multi-step forms, date and day pickers, inline edit and morphing inputs. Copy the code or install with the shadcn CLI.",
    summary:
      "A free collection of animated React input and form components built with Motion and Tailwind CSS. Multi-step forms, day and date pickers, inline edit fields, morphing inputs and subscribe flows. Each is a single TypeScript file you copy into your project or install with the shadcn CLI. MIT licensed.",
    tags: ["input", "form", "edit", "chips", "picker", "timer"],
    sections: [
      {
        heading: "The two input bugs almost every site ships",
        body: "First: an input with a font size under 16px makes iOS Safari zoom the whole page when it gains focus, which looks like a layout bug and is actually a font-size rule. Second: an input without an associated label is invisible to screen readers and to password managers, and a placeholder is not a label — it disappears exactly when the user needs it. Both are one-line fixes that no amount of animation substitutes for.",
      },
      {
        heading: "Validation timing",
        body: "When you validate matters more than how you animate it. Validating on every keystroke shows an error before the user has finished typing their email; validating only on submit makes them hunt for what went wrong. Validate on blur for the first pass, then live once a field has already errored, so corrections feel immediate without the field shouting at someone mid-word. Keep the error adjacent to the input and keep it specific.",
      },
      {
        heading: "Multi-step forms",
        body: "Splitting a long form reduces the apparent cost of starting it, which is why multi-step works. It only works if progress is visible, Back preserves what was entered, and each step is a real step rather than two fields stretched across four screens. Animating the transition between steps carries direction — forward slides one way, back the other — which is the cheapest way to make the flow legible. Multi Step Form keeps state across the whole sequence.",
      },
      {
        heading: "Submission states",
        body: "A submit button that stays enabled while the request is in flight will be pressed twice, and duplicate submissions are the expensive kind of bug. Disable on submit, show that something is happening, and confirm visibly when it succeeds. Support Enter to submit from a single-line field and Cmd+Enter from a textarea, because that is what people already try.",
      },
    ],
    faq: [
      {
        question: "Are these React form components free?",
        answer:
          "Yes. Every input and form component is MIT licensed and free for personal and commercial projects, with no attribution required and no sign-up to copy the code.",
      },
      {
        question: "Why does my input zoom the page on iPhone?",
        answer:
          "iOS Safari zooms when a focused input has a font size under 16px. Setting the input's font-size to 16px or more removes the zoom. The inputs here are already set accordingly.",
      },
      {
        question: "Do these components work with React Hook Form?",
        answer:
          "Yes. They are controlled React inputs, so they connect to React Hook Form, Formik or your own state the same way a plain input does.",
      },
      {
        question: "How do I add an animated form to my React project?",
        answer:
          "Run npx shadcn@latest add with the component's registry URL, or copy the single .tsx file from the component page into your project. You own the file afterwards.",
      },
    ],
  },
  {
    slug: "lists",
    shortName: "list components",
    heading: "Animated list components for React",
    title: "Animated React List Components (Free)",
    metaDescription:
      "Free animated React list components built with Motion and Tailwind CSS — stacked lists, reorderable items, filtered rows and animated collections. Copy the code or install with the shadcn CLI.",
    summary:
      "A free collection of animated React list components built with Motion and Tailwind CSS. Stacked lists, reorderable collections, filtered rows and list items that respond to the cursor. Each is a single TypeScript file you copy into your project or install with the shadcn CLI. MIT licensed.",
    tags: ["list", "stacked"],
    sections: [
      {
        heading: "Animate list changes, not list rendering",
        body: "A list that animates every row on mount is noise — the viewer has not done anything yet. What deserves motion is change: an item added, removed, reordered or filtered out. Animating those transitions tells the viewer what happened to the thing they were looking at, which is the one piece of information a re-render destroys. Everything else can appear instantly.",
      },
      {
        heading: "Keys, reordering and the stale-animation trap",
        body: "Reorder animations depend entirely on stable keys. Using the array index means React reuses the element at position two for whatever now sits there, so the content swaps while the position stays and the animation describes something that did not happen. Key by a stable id and layout animations resolve correctly for free. This is the most common reason a reorder animation looks wrong.",
      },
      {
        heading: "Long lists and virtualization",
        body: "Beyond a few hundred rows, the cost is the DOM, not the animation. Virtualizing renders only the visible window and keeps scrolling smooth, at the price of complicating enter and exit animations — a row that scrolls out of the window unmounts, and animating that looks like a deletion. The usual resolution is to animate data changes but not scroll-driven mount and unmount.",
      },
      {
        heading: "Filtering and empty states",
        body: "Filtering is the interaction most worth animating in a list, because items leaving and the remainder closing the gap makes the filter's effect legible. It also makes the empty state unavoidable: design the no-results case deliberately, say which filter caused it, and give a way back. An empty list with no explanation reads as a broken page.",
      },
    ],
    faq: [
      {
        question: "Are these React list components free?",
        answer:
          "Yes. Every list component is MIT licensed and free for personal and commercial projects, with no attribution required and no sign-up to copy the code.",
      },
      {
        question: "Why do my list reorder animations look wrong?",
        answer:
          "Almost always because rows are keyed by array index. React then reuses the element at each position, so content swaps while position stays. Key by a stable id and layout animations resolve correctly.",
      },
      {
        question: "Do these lists work with virtualization?",
        answer:
          "They render real DOM rows, so for a few hundred items they are fine as they are. Past that, pair them with a virtualizer and animate data changes rather than scroll-driven mount and unmount.",
      },
      {
        question: "How do I add an animated list to my React project?",
        answer:
          "Run npx shadcn@latest add with the component's registry URL, or copy the single .tsx file from the component page into your project.",
      },
    ],
  },
  {
    slug: "scroll-animations",
    shortName: "scroll animation components",
    heading: "Scroll animation components for React",
    title: "React Scroll Animation Components (Free)",
    metaDescription:
      "Free React scroll animation components built with Motion and Tailwind CSS — scroll-driven card stacks, sticky reveals, split cards and perspective text. Copy the code or install with the shadcn CLI.",
    summary:
      "A free collection of React scroll animation components built with Motion and Tailwind CSS. Scroll-driven card stacks, sticky section reveals, split cards and perspective text. Each is a single TypeScript file you copy into your project or install with the shadcn CLI. MIT licensed.",
    tags: ["scroll", "reveal", "sticky"],
    sections: [
      {
        heading: "Scroll animation is a budget, not a feature",
        body: "Scroll is the one input the viewer is already using to leave, so anything tied to it competes with their intent. The versions that work are driven by position — you scroll, it moves, you stop, it stops — because the viewer stays in control. The versions that fail take control away: hijacked scroll that moves at its own speed, long pinned sections that make the page feel stuck, content that only appears after an animation finishes.",
      },
      {
        heading: "Position-driven versus triggered",
        body: "Two different mechanisms get called scroll animation. Position-driven ties a value continuously to scroll offset, so scrolling back up reverses it exactly — right for parallax, progress and sticky stacks. Triggered fires once when an element enters the viewport, which is what a fade-in reveal should be, and it belongs to IntersectionObserver rather than a scroll listener. Using a scroll handler for a one-shot reveal runs code on every frame to answer a question that gets asked once.",
      },
      {
        heading: "Fade-in-on-scroll is usually a mistake",
        body: "Worth saying plainly, since it is the most copied effect on the web: fading content in as it enters the viewport delays the thing the reader came for, breaks in-page search, and on a slow connection can leave a blank page. If you use it, keep it to one short movement, never apply it to body copy, and make sure the content is visible when JavaScript has not run. The components here animate structure, not paragraphs.",
      },
      {
        heading: "Performance and reduced motion",
        body: "Scroll animation runs during the most jank-prone moment on the page, so it has to stay on transform and opacity — those composite on the GPU, while animating height, top or filter forces layout on every frame. Prefer scroll-driven CSS animations or a library that uses them where support allows. And honour prefers-reduced-motion: scroll effects are a common migraine and nausea trigger, so the reduced-motion path should show the content in its final state, not a faster version of the animation.",
      },
    ],
    faq: [
      {
        question: "Are these React scroll animation components free?",
        answer:
          "Yes. Every scroll animation component is MIT licensed and free for personal and commercial projects, with no attribution required and no sign-up to copy the code.",
      },
      {
        question: "Do scroll animations hurt SEO?",
        answer:
          "Content hidden until a scroll animation runs can be a problem, because it may not be visible when a crawler renders the page and it breaks in-page search. Animating layout and structure rather than body text avoids that.",
      },
      {
        question: "How do I respect prefers-reduced-motion with scroll effects?",
        answer:
          "Show the content in its final state rather than a faster animation. Scroll-linked motion is a common migraine and nausea trigger, so the reduced-motion path should remove the movement, not shorten it.",
      },
      {
        question: "What is the difference between scroll-driven and scroll-triggered?",
        answer:
          "Scroll-driven ties a value continuously to scroll position, so scrolling back reverses it — right for parallax and sticky stacks. Scroll-triggered fires once when an element enters the viewport and belongs to IntersectionObserver.",
      },
    ],
  },
];

export function findCategory(slug: string) {
  return COMPONENT_CATEGORIES.find((category) => category.slug === slug);
}

/**
 * The category a component page should link up to. A component can carry tags
 * from more than one category (a testimonial card that also drags), so this
 * takes the first match in declaration order and treats that as primary.
 */
export function primaryCategory(tags: string[] | undefined) {
  if (!tags?.length) return undefined;
  return COMPONENT_CATEGORIES.find((category) =>
    tags.some((tag) => category.tags.includes(tag)),
  );
}

/**
 * Components in a category, by tag. Sorted by title so the grid is stable
 * between builds rather than following filesystem order.
 */
export function categoryComponents(
  category: ComponentCategory,
  navItems: OpenNavItem[],
) {
  const wanted = new Set(category.tags);
  return navItems
    .filter((item) => (item.tags ?? []).some((tag) => wanted.has(tag)))
    .sort((a, b) => a.title.localeCompare(b.title));
}
