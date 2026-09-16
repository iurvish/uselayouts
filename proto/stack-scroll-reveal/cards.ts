export type StackCard = {
  index: string;
  category: string;
  title: string;
  description: string;
  fill: string;
  paper: string;
  ink: string;
  image: string;
};

const IMG = "auto=format&fit=crop&w=1200&q=80";

export const CARDS: StackCard[] = [
  {
    index: "01",
    category: "Fintech",
    title: "Boosted Conversion by 42% with a Product-Led Redesign",
    description:
      "We restructured the onboarding flow and clarified the value proposition, helping the platform turn more visitors into activated users.",
    fill: "oklch(0.52 0.13 55)",
    paper: "oklch(0.94 0.028 75)",
    ink: "oklch(0.28 0.04 55)",
    image: `https://images.unsplash.com/photo-1615529328331-f8917597711f?${IMG}`,
  },
  {
    index: "02",
    category: "SaaS",
    title: "From Confusing to Clear: A Homepage That Actually Converts",
    description:
      "Through sharper messaging and a modular design system, the brand saw a measurable lift in demo requests within weeks.",
    fill: "oklch(0.48 0.09 220)",
    paper: "oklch(0.94 0.022 220)",
    ink: "oklch(0.28 0.04 220)",
    image: `https://images.unsplash.com/photo-1589939705384-5185137a7f0f?${IMG}`,
  },
  {
    index: "03",
    category: "Startup",
    title: "Launched a New Brand That Closed Funding in 90 Days",
    description:
      "We built a high-trust visual identity and pitch narrative that helped the founders move faster with investors.",
    fill: "oklch(0.48 0.14 350)",
    paper: "oklch(0.94 0.03 350)",
    ink: "oklch(0.28 0.05 350)",
    image: `https://images.unsplash.com/photo-1541123603104-512919d6a96c?${IMG}`,
  },
  {
    index: "04",
    category: "Brand strategy",
    title: "Repositioned the Brand for a Higher-Value Audience",
    description:
      "We refined the messaging and visual direction to attract more qualified leads and elevate perceived value.",
    fill: "oklch(0.42 0.12 290)",
    paper: "oklch(0.94 0.025 145)",
    ink: "oklch(0.28 0.04 145)",
    image: `https://images.unsplash.com/photo-1513519245088-0e12902e5a38?${IMG}`,
  },
];
