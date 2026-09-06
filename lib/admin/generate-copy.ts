import { detectComponentName, detectDependencies } from "@/lib/admin/detect-code";

export type GeneratedCopy = {
  title: string;
  description: string;
  features: string[];
};

function titleFromName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Pattern = {
  test: RegExp;
  description: (title: string) => string;
  features: string[];
  where: string;
};

const PATTERNS: Pattern[] = [
  {
    test: /testimonial|quote|review/i,
    description: (t) => `A ${t.toLowerCase()} block with smooth motion for social proof.`,
    features: [
      "Quote-forward layout that keeps avatars and names readable",
      "Motion that supports the story without stealing focus",
    ],
    where: "Landing pages, case studies, and pricing social proof",
  },
  {
    test: /carousel|wheel|stack|gallery|bento|grid/i,
    description: (t) => `A ${t.toLowerCase()} layout for browsing items with fluid motion.`,
    features: [
      "Spatial motion that feels physical, not decorative",
      "Works with images, cards, or mixed media tiles",
    ],
    where: "Featured work, product showcases, and marketing heroes",
  },
  {
    test: /tab|toolbar|nav|menu/i,
    description: (t) => `A ${t.toLowerCase()} control with clear active states and motion.`,
    features: [
      "Active state that reads instantly",
      "Keyboard-friendly structure for real product UIs",
    ],
    where: "App shells, settings, and dense dashboards",
  },
  {
    test: /input|search|command|morph/i,
    description: (t) => `An animated ${t.toLowerCase()} for search and multi-mode entry.`,
    features: [
      "Placeholder and icon motion that stays subtle",
      "Easy to wire into search or command flows",
    ],
    where: "Command palettes, headers, and AI prompt bars",
  },
  {
    test: /button|delete|confirm|cta/i,
    description: (t) => `A ${t.toLowerCase()} with clear feedback for high-stakes actions.`,
    features: [
      "States that communicate idle, confirm, and done",
      "Micro-interactions that reduce accidental clicks",
    ],
    where: "Destructive actions, checkout, and account settings",
  },
  {
    test: /folder|card|book|tilt|expand/i,
    description: (t) => `An interactive ${t.toLowerCase()} with layered depth and motion.`,
    features: [
      "Depth and hover response that feel tactile",
      "Compact by default, expressive on interaction",
    ],
    where: "Portfolios, file UIs, and product detail moments",
  },
  {
    test: /modal|dialog|drawer|sheet|toast/i,
    description: (t) => `A ${t.toLowerCase()} pattern with polished enter and exit motion.`,
    features: [
      "Focus-friendly overlay behavior",
      "Exit motion that mirrors entrance for clarity",
    ],
    where: "Confirmations, detail panels, and secondary flows",
  },
];

const FALLBACK: Omit<Pattern, "test"> = {
  description: (t) =>
    `A polished ${t.toLowerCase()} interaction built with React and Motion.`,
  features: [
    "Motion-first interaction with restrained timing",
    "Drop-in React component for modern product UIs",
  ],
  where: "Marketing pages, product demos, and design systems",
};

/**
 * Brief title / description / features from component source.
 * Heuristic only — no LLM. Good enough for new-component scaffolding.
 */
export function generateComponentCopy(code: string): GeneratedCopy {
  const detected = detectComponentName(code);
  const title = detected ? titleFromName(detected) : "New Component";
  const blob = `${detected ?? ""}\n${code}`;
  const match = PATTERNS.find((p) => p.test.test(blob)) ?? FALLBACK;

  const deps = detectDependencies(code);
  const stackHint = deps.includes("motion") || deps.includes("framer-motion")
    ? "Motion-powered interactions that stay under 300ms feel"
    : deps.length > 0
      ? `Built around ${deps.slice(0, 2).join(" + ")}`
      : "Lightweight React + Tailwind implementation";

  return {
    title,
    description: match.description(title),
    features: [
      ...match.features.slice(0, 2),
      stackHint,
      `Where to use: ${match.where}`,
    ],
  };
}
