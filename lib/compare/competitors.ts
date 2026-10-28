/**
 * Facts for the comparison pages.
 *
 * Every number here was read from the library's own `llms.txt` or the GitHub
 * API on `VERIFIED_ON`, and `sources` records where. Nothing is estimated. If
 * a library does not publish something (Aceternity states no license), the
 * field is omitted rather than guessed, because a wrong claim about a
 * competitor's license is the one mistake that is actually costly.
 *
 * Re-check on the stale date below and bump `VERIFIED_ON`.
 */
export const VERIFIED_ON = "2026-10-28";

export type Competitor = {
  slug: string;
  name: string;
  url: string;
  /** One sentence in their own framing, not ours. */
  positioning: string;
  componentCount?: number;
  componentCountNote?: string;
  license?: string;
  licenseNote?: string;
  githubStars?: number;
  githubRepo?: string;
  stack: string[];
  install: string[];
  hasPaidTier: boolean;
  paidTierNote?: string;
  /** Where useLayouts genuinely differs. Never a claim we cannot defend. */
  differences: string[];
  /** Where they are the better choice. Credibility depends on this. */
  chooseThemWhen: string[];
  sources: string[];
};

export const USELAYOUTS = {
  componentCount: 64,
  license: "MIT",
  githubStars: 705,
  stack: ["React", "TypeScript", "Motion", "Tailwind CSS"],
};

export const COMPETITORS: Competitor[] = [
  {
    slug: "magic-ui",
    name: "Magic UI",
    url: "https://magicui.design",
    positioning:
      "Beautifully designed landing page components built with React & Tailwind CSS.",
    componentCount: 78,
    componentCountNote: "component pages listed in its llms.txt",
    license: "MIT",
    githubStars: 22931,
    githubRepo: "magicuidesign/magicui",
    stack: ["React", "Tailwind CSS", "Motion"],
    install: ["shadcn CLI"],
    hasPaidTier: true,
    paidTierNote:
      "The component library is MIT. Magic UI sells separate paid templates.",
    differences: [
      "Magic UI is aimed at landing pages: marquees, beams, globes, device mockups, text reveals. useLayouts covers in-product interactions as well, like pickers, multi-step forms, inline edit and drawers.",
      "Magic UI has more components (78 against our 64) and far more adoption, at 22.9k GitHub stars against our 705.",
    ],
    chooseThemWhen: [
      "You are building a marketing site and want section-sized pieces rather than single controls.",
      "You want the larger community and the bigger back catalogue of examples.",
    ],
    sources: [
      "https://magicui.design/llms.txt",
      "https://api.github.com/repos/magicuidesign/magicui",
    ],
  },
  {
    slug: "aceternity-ui",
    name: "Aceternity UI",
    url: "https://ui.aceternity.com",
    positioning:
      "A collection of beautiful, animated UI components built with Tailwind CSS and Framer Motion for React and Next.js applications.",
    componentCount: 118,
    componentCountNote:
      "component URLs in its llms.txt; the site states \"114+ UI Components\" alongside 183 pre-built blocks and 17 templates",
    licenseNote:
      "Aceternity UI publishes no license statement in its llms.txt or a public components repository, so we make no claim about its terms. Check with them before shipping commercially.",
    stack: ["React", "Next.js", "Tailwind CSS", "Framer Motion"],
    install: ["Copy and paste", "CLI"],
    hasPaidTier: true,
    paidTierNote: "Aceternity sells templates and a Pro tier.",
    differences: [
      "Aceternity is the larger library at 118 component pages against our 64, and it ships 183 pre-built page blocks, which useLayouts does not have at all.",
      "useLayouts is MIT licensed and says so on every page. Aceternity publishes no license terms we could find, which matters if you are shipping client work.",
    ],
    chooseThemWhen: [
      "You want whole page blocks and templates, not just components.",
      "You need the widest selection of hero and scroll effects.",
    ],
    sources: [
      "https://ui.aceternity.com/llms.txt",
    ],
  },
  {
    slug: "react-bits",
    name: "React Bits",
    url: "https://reactbits.dev",
    positioning:
      "An open source collection of memorable UI elements: components, animations, backgrounds, text animations and micro-interactions.",
    license: "MIT + Commons Clause",
    licenseNote:
      "React Bits is MIT with a Commons Clause restriction: you may use the components commercially, but you may not sell, sublicense or redistribute the components themselves, alone, bundled, or ported to another framework.",
    githubStars: 50521,
    githubRepo: "DavidHDev/react-bits",
    componentCountNote:
      "React Bits ships every component in four variants (JavaScript or TypeScript, each with CSS or Tailwind), so a raw count is not comparable to ours",
    stack: ["React", "Tailwind CSS or plain CSS", "Motion", "GSAP", "Three.js", "OGL"],
    install: ["jsrepo", "shadcn CLI"],
    hasPaidTier: true,
    paidTierNote:
      "The main library is free. React Bits Pro is a separate paid product covering page blocks, application UI and templates.",
    differences: [
      "License is the real difference. useLayouts is plain MIT, so you can do anything with the code including redistributing it. React Bits adds the Commons Clause, which forbids selling or redistributing the components themselves. If you build and sell your own component library or template, read their terms first.",
      "React Bits offers each component in four language and styling variants. useLayouts ships one: TypeScript with Tailwind CSS.",
      "React Bits reaches for GSAP, Three.js and OGL for its heavier effects. useLayouts stays on Motion, so there is less to add to your bundle.",
    ],
    chooseThemWhen: [
      "You are on JavaScript rather than TypeScript, or on plain CSS rather than Tailwind.",
      "You want WebGL backgrounds and shader-driven text effects.",
      "You are not redistributing the components, so the Commons Clause never binds you.",
    ],
    sources: [
      "https://reactbits.dev/llms.txt",
      "https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md",
      "https://api.github.com/repos/DavidHDev/react-bits",
    ],
  },
  {
    slug: "shadcn-ui",
    name: "shadcn/ui",
    url: "https://ui.shadcn.com",
    positioning:
      "A collection of beautifully-designed, accessible components and a code distribution platform, built with TypeScript, Tailwind CSS and Radix UI primitives.",
    componentCount: 59,
    componentCountNote: "component pages listed in its llms.txt",
    license: "MIT",
    githubStars: 126807,
    githubRepo: "shadcn-ui/ui",
    stack: ["React", "TypeScript", "Tailwind CSS", "Radix UI"],
    install: ["shadcn CLI"],
    hasPaidTier: false,
    differences: [
      "These are not competitors. shadcn/ui gives you the accessible primitives an application needs: dialog, select, combobox, form. useLayouts adds the animated layer on top: card stacks, carousels, gooey navbars, drag interactions.",
      "useLayouts installs through the same shadcn CLI and registry format, so the two sit in one project without conflict.",
      "shadcn/ui builds on Radix for accessibility. useLayouts components are presentational and do not aim to replace a primitive library.",
    ],
    chooseThemWhen: [
      "You need the foundational, accessible primitives. Start there, always.",
      "Then add useLayouts for the interactions shadcn/ui does not cover.",
    ],
    sources: [
      "https://ui.shadcn.com/llms.txt",
      "https://api.github.com/repos/shadcn-ui/ui",
    ],
  },
];

export function getCompetitor(slug: string) {
  return COMPETITORS.find((competitor) => competitor.slug === slug);
}
