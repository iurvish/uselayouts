"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Copy, Check, Lock } from "lucide-react";
export interface WalletCardItem {
  id: string;
  name: string;
  brand: "apple" | "mastercard" | "visa" | "custom";
  balance: number;
  currency?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
  material: "titanium" | "obsidian" | "rosegold";
  theme?: {
    background: string;
    textColor: string;
    accentColor?: string;
    chipVariant?: "silver" | "gold";
  };
}

export interface LeatherCardWalletProps {
  cards?: WalletCardItem[];
  defaultCurrency?: string;
  walletColor?: "caramel" | "espresso" | "midnight" | "forest";
  showStitching?: boolean;
  allowCardPullOut?: boolean;
  onCardSelect?: (card: WalletCardItem | null) => void;
  className?: string;
}

export const ALL_MAGSAFE_CARDS: WalletCardItem[] = [
  {
    id: "card-titanium-001",
    name: "Apple Card Titanium",
    brand: "apple",
    balance: 42400,
    currency: "$",
    cardNumber: "4532  8901  2345  7890",
    cardHolder: "JOSH PIGFORD",
    expiry: "10/30",
    cvv: "842",
    material: "titanium",
    theme: {
      background: "bg-gradient-to-br from-[#ffffff] via-[#f1f3f6] to-[#d8dde6]",
      textColor: "text-[#1e293b]",
      accentColor: "#475569",
      chipVariant: "silver",
    },
  },
  {
    id: "card-obsidian-002",
    name: "Obsidian Black Metal",
    brand: "mastercard",
    balance: 85200,
    currency: "$",
    cardNumber: "5412  7534  8920  3456",
    cardHolder: "JOSH PIGFORD",
    expiry: "04/29",
    cvv: "419",
    material: "obsidian",
    theme: {
      background: "bg-gradient-to-br from-[#23262d] via-[#15171b] to-[#0a0a0c]",
      textColor: "text-[#ffffff]",
      accentColor: "#f59e0b",
      chipVariant: "gold",
    },
  },
  {
    id: "card-gold-003",
    name: "Champagne Rose Gold",
    brand: "visa",
    balance: 142500,
    currency: "$",
    cardNumber: "4024  9876  5432  1098",
    cardHolder: "JOSH PIGFORD",
    expiry: "12/31",
    cvv: "931",
    material: "rosegold",
    theme: {
      background: "bg-gradient-to-br from-[#fff3e8] via-[#fbd5b5] to-[#f4a261]",
      textColor: "text-[#431407]",
      accentColor: "#b45309",
      chipVariant: "gold",
    },
  },
];

// Minimal EMV chip
const Chip: React.FC<{ variant?: "gold" | "silver" }> = ({ variant = "gold" }) => (
  <div
    className={`relative w-9 h-7 rounded-[5px] overflow-hidden ${
      variant === "gold"
        ? "bg-gradient-to-br from-[#e9c46a] to-[#b8892b]"
        : "bg-gradient-to-br from-[#e2e8f0] to-[#94a3b8]"
    }`}
  >
    <div className="absolute inset-x-0 top-1/3 h-px bg-black/20" />
    <div className="absolute inset-x-0 top-2/3 h-px bg-black/20" />
    <div className="absolute inset-y-0 left-1/2 w-px bg-black/20" />
  </div>
);

// Debossed checkerboard brand mark
const Emblem: React.FC = () => (
  <div className="relative grid grid-cols-4 gap-[2px]" aria-hidden="true">
    {Array.from({ length: 16 }).map((_, i) => (
      <div
        key={i}
        className={`w-2.5 h-2.5 rounded-[3px] ${
          (Math.floor(i / 4) + i) % 2 === 0
            ? "bg-black/25 shadow-[inset_0_1.5px_1.5px_rgba(0,0,0,0.55),0_1px_0_rgba(255,225,190,0.14)]"
            : ""
        }`}
      />
    ))}
  </div>
);

// Card Brand Emblem Component (Apple / Mastercard / Visa)
const CardBrandLogo: React.FC<{ brand: "apple" | "mastercard" | "visa" | "custom"; material: "titanium" | "obsidian" | "rosegold" }> = ({
  brand,
  material,
}) => {
  if (brand === "apple") {
    return (
      <svg className="w-[15px] h-[18px] fill-current -mt-0.5" viewBox="0 0 20 24" aria-label="Apple">
        <path d="M16.37 12.69c-.03-2.94 2.4-4.36 2.51-4.43-1.37-2-3.5-2.27-4.25-2.3-1.81-.18-3.53 1.07-4.45 1.07-.92 0-2.33-1.04-3.83-1.01-1.97.03-3.79 1.15-4.8 2.91-2.05 3.55-.52 8.8 1.47 11.68.97 1.41 2.13 2.99 3.65 2.93 1.47-.06 2.02-.95 3.79-.95 1.77 0 2.27.95 3.82.92 1.58-.03 2.58-1.43 3.54-2.85 1.12-1.63 1.58-3.21 1.6-3.29-.03-.02-3.07-1.18-3.1-4.68zM13.45 4.07c.81-.98 1.35-2.34 1.2-3.7-1.16.05-2.57.78-3.4 1.75-.75.86-1.4 2.25-1.23 3.58 1.3.1 2.62-.66 3.43-1.63z" />
      </svg>
    );
  }

  if (brand === "mastercard") {
    return (
      <div className="flex items-center -space-x-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#ef4444] to-[#f87171] opacity-90 shadow-sm" />
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] opacity-90 mix-blend-screen shadow-sm" />
      </div>
    );
  }

  if (brand === "visa") {
    return (
      <span className={`text-[13px] font-black italic tracking-widest ${material === "rosegold" ? "text-[#7c2d12]" : "text-sky-600"}`}>
        VISA
      </span>
    );
  }

  return null;
};


const SCAN_DURATION = 1100;
const SUCCESS_HOLD = 650;
const AUTO_LOCK_AFTER = 60_000;
const CARD_PEEK = 36;
const PULLED_OUT_Y = -60;
// Tileable SVG noise used for the leather texture
const noise = (freq: number, octaves: number, alpha: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${octaves}' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${alpha} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const FINE_GRAIN = noise(0.9, 3, 0.45); // pores
const MOTTLE = noise(0.012, 2, 0.28); // uneven dye / natural patina
const CARD_GRAIN = noise(1.2, 2, 0.06); // barely-there metal grain

// Grain, patina, worn centre and soft top-down light over the base leather colour
const LeatherSurface: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`absolute inset-0 pointer-events-none ${className}`}
    style={{
      backgroundImage: [
        "radial-gradient(120% 70% at 50% 40%, rgba(255,215,170,0.07), transparent 70%)",
        "linear-gradient(180deg, rgba(255,235,210,0.06), rgba(0,0,0,0.16))",
        FINE_GRAIN,
        MOTTLE,
      ].join(", "),
      backgroundSize: "auto, auto, 200px 200px, 600px 600px",
      backgroundBlendMode: "normal, normal, multiply, soft-light",
    }}
  />
);

// Positions an SVG outline `inset` px inside its parent.
// `openTop` hides the top run so the line only wraps the sides and bottom.
const Outline: React.FC<{ inset: number; radius: number; openTop?: boolean; children: React.ReactNode }> = ({
  inset,
  radius,
  openTop = false,
  children,
}) => {
  const svg = <svg className="w-full h-full overflow-visible">{children}</svg>;

  if (!openTop) {
    return (
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset }}>
        {svg}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none overflow-hidden"
      style={{ left: inset - 3, right: inset - 3, bottom: inset - 3, top: 12 }}
    >
      <div className="absolute" style={{ left: 3, right: 3, bottom: 3, top: -radius * 2 }}>
        {svg}
      </div>
    </div>
  );
};

// Saddle stitch: pressed groove, needle holes and waxed thread
const Stitch: React.FC<{ inset: number; radius: number; openTop?: boolean }> = (props) => {
  const rect = { width: "100%", height: "100%", rx: props.radius, fill: "none" } as const;
  const dash = { strokeDasharray: "3.6 3.2", strokeLinecap: "round" } as const;
  return (
    <Outline {...props}>
      <rect {...rect} stroke="rgba(0,0,0,0.28)" strokeWidth={3} />
      <rect {...rect} {...dash} stroke="rgba(0,0,0,0.55)" strokeWidth={2.2} transform="translate(0 0.8)" />
      <rect {...rect} {...dash} stroke="#d2ab7f" strokeWidth={1.6} />
      <rect {...rect} {...dash} stroke="rgba(255,240,215,0.35)" strokeWidth={0.6} transform="translate(0 -0.4)" />
    </Outline>
  );
};

// Heated edge creaser line: a pressed groove with a light lip below it
const Crease: React.FC<{ inset: number; radius: number; openTop?: boolean }> = (props) => {
  const rect = { width: "100%", height: "100%", rx: props.radius, fill: "none" } as const;
  return (
    <Outline {...props}>
      <rect {...rect} stroke="rgba(0,0,0,0.38)" strokeWidth={0.9} />
      <rect {...rect} stroke="rgba(255,225,190,0.1)" strokeWidth={0.7} transform="translate(0 0.9)" />
    </Outline>
  );
};

// Painted, burnished edge: darker rim, light bevel on top, worn darker bottom
const EDGE =
  "inset 0 0 0 1.5px rgba(25,10,3,0.65), inset 0 2.5px 0 -1px rgba(255,225,190,0.14), inset 0 -3px 4px -2px rgba(0,0,0,0.35)";

// Half-moon thumb cut-out at the pocket mouth for pushing cards up
const THUMB_CUT = 24;
const POCKET_MASK = `radial-gradient(circle ${THUMB_CUT}px at 50% 0, transparent ${THUMB_CUT - 0.5}px, #000 ${THUMB_CUT}px)`;

// Face ID glyph: corner brackets around a face that turns while scanning,
// then morphs into a drawn check mark once verified.
const FaceIdGlyph: React.FC<{
  state: "idle" | "scanning" | "success";
  strokeWidth?: number;
  className?: string;
}> = ({ state, strokeWidth = 3, className = "" }) => {
  const reduceMotion = useReducedMotion();
  const scanning = state === "scanning" && !reduceMotion;
  const success = state === "success";
  const loop = { repeat: Infinity, duration: 1.4, ease: "easeInOut" } as const;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        animate={scanning ? { scale: [1, 0.92, 1] } : { scale: 1 }}
        transition={scanning ? loop : { duration: 0.2 }}
      >
        <path d="M4 18V12a8 8 0 0 1 8-8h6" />
        <path d="M46 4h6a8 8 0 0 1 8 8v6" />
        <path d="M60 46v6a8 8 0 0 1-8 8h-6" />
        <path d="M18 60h-6a8 8 0 0 1-8-8v-6" />
      </motion.g>

      {/* Face and check are both always mounted and cross-fade, so the check can never get stuck */}
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={success ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
      >
        <motion.g animate={scanning ? { x: [-2.5, 2.5, -2.5] } : { x: 0 }} transition={scanning ? loop : undefined}>
          <path d="M22 23v5" />
          <path d="M42 23v5" />
          <path d="M32 23v10a2 2 0 0 1-2 2h-1.5" />
        </motion.g>
        <path d="M23 43c5 5 13 5 18 0" />
      </motion.g>

      <motion.path
        d="M20 33l8 8 16-17"
        initial={false}
        animate={success ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: success ? 0.35 : 0, delay: success ? 0.12 : 0, ease: "easeOut" }}
      />
    </svg>
  );
};

const lastFour = (num?: string) => num?.replace(/\s+/g, "").slice(-4) ?? "";

export const LeatherCardWallet: React.FC<LeatherCardWalletProps> = ({
  cards = ALL_MAGSAFE_CARDS,
  defaultCurrency = "$",
  allowCardPullOut = true,
  showStitching = true,
  onCardSelect,
  className = "",
}) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const timers = useRef<number[]>([]);
  const wasDragged = useRef(false);
  const reduceMotion = useReducedMotion();

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const selectCard = useCallback(
    (card: WalletCardItem | null) => {
      setActiveCardId(card?.id ?? null);
      onCardSelect?.(card);
    },
    [onCardSelect]
  );

  // Escape slides the active card back into the wallet
  useEffect(() => {
    if (!activeCardId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectCard(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeCardId, selectCard]);

  // Hide details again after a minute without card activity
  useEffect(() => {
    if (!isUnlocked) return;
    const id = window.setTimeout(() => setIsUnlocked(false), AUTO_LOCK_AFTER);
    return () => clearTimeout(id);
  }, [isUnlocked, activeCardId]);

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isScanning) return;

    if (isUnlocked) {
      setIsUnlocked(false);
      return;
    }

    setIsScanning(true);
    setIsSuccess(false);
    later(() => {
      setIsSuccess(true);
      navigator.vibrate?.(12);
      later(() => {
        setIsScanning(false);
        setIsUnlocked(true);
      }, SUCCESS_HOLD);
    }, SCAN_DURATION);
  };

  const toggleCard = (card: WalletCardItem) => {
    if (!allowCardPullOut) return;
    selectCard(activeCardId === card.id ? null : card);
  };

  const handleCopy = async (e: React.MouseEvent, card: WalletCardItem) => {
    e.stopPropagation();
    if (!card.cardNumber) return;
    try {
      await navigator.clipboard.writeText(card.cardNumber.replace(/\s+/g, ""));
      setCopiedCardId(card.id);
      later(() => setCopiedCardId((id) => (id === card.id ? null : id)), 1600);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fail silently
    }
  };

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 34, mass: 0.8 };

  // Slightly springier for cards: a soft overshoot as the card clears the slot
  const cardSpring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 24, mass: 0.9 };

  const hint = activeCardId
    ? "Tap the card or press Esc to put it back"
    : isUnlocked
    ? "Tap a card to pull it out"
    : "Tap a card to pull it out · Face ID to show details";

  return (
    <div className={`flex flex-col items-center pt-20 pb-8 px-4 select-none ${className}`}>
      {/* Leather sleeve */}
      <div className="relative w-[315px] sm:w-[340px] h-[400px] shrink-0 rounded-[36px] bg-[#62301a]"
        style={{ boxShadow: `0 1px 2px rgba(40,20,5,0.12), 0 4px 8px -2px rgba(40,20,5,0.12), 0 16px 32px -8px rgba(40,20,5,0.18), 0 40px 70px -24px rgba(40,20,5,0.45), ${EDGE}` }}
      >
        <LeatherSurface className="rounded-[36px]" />
        <Crease inset={4} radius={32} />
        {showStitching && <Stitch inset={9} radius={27} />}

        {/* Slot interior */}
        <div className="absolute inset-x-3.5 top-3.5 h-28 rounded-t-[26px] bg-black/40 pointer-events-none" />

        {/* Cards */}
        {cards.map((card, index) => {
          const isActive = activeCardId === card.id;
          const isHovered = hoveredCardId === card.id && activeCardId === null;
          const isCopied = copiedCardId === card.id;
          const last4 = lastFour(card.cardNumber);

          // Each card peeks out of the pocket a little further than the one behind it
          const restingY = 20 + index * CARD_PEEK;
          // While one card is out, the rest settle a little deeper into the pocket
          const y = isActive
            ? PULLED_OUT_Y
            : activeCardId
            ? restingY + 6
            : isHovered
            ? restingY - 10
            : restingY;
          // Cards always stay behind the front pocket, so a card dragged down slides back inside it
          const zIndex = isActive ? 19 : 10 + index;

          return (
            <motion.div
              key={card.id}
              role="button"
              tabIndex={allowCardPullOut ? 0 : -1}
              aria-pressed={isActive}
              aria-label={`${card.name}${last4 ? ` ending in ${last4}` : ""}. ${
                isActive ? "Put back in wallet" : "Pull out of wallet"
              }`}
              onPointerDown={() => (wasDragged.current = false)}
              onClick={() => {
                // A drag already handled the toggle — ignore the click that follows it
                if (wasDragged.current) return;
                toggleCard(card);
              }}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleCard(card);
                }
              }}
              onHoverStart={() => setHoveredCardId(card.id)}
              onHoverEnd={() => setHoveredCardId((id) => (id === card.id ? null : id))}
              drag={allowCardPullOut ? "y" : false}
              dragConstraints={{ top: PULLED_OUT_Y, bottom: restingY }}
              dragElastic={0.12}
              onDragStart={() => (wasDragged.current = true)}
              onDragEnd={(_, info) => {
                if (info.offset.y < -25 && !isActive) selectCard(card);
                else if (info.offset.y > 25 && isActive) selectCard(null);
              }}
              style={{ zIndex }}
              initial={false}
              animate={{ y }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              whileDrag={reduceMotion ? undefined : { scale: 1.015 }}
              transition={cardSpring}
              className={`absolute left-3.5 right-3.5 top-0 h-[184px] rounded-[18px] p-4 flex flex-col justify-between outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                allowCardPullOut ? "cursor-grab active:cursor-grabbing" : ""
              } ${card.theme?.background || "bg-zinc-100"} ${card.theme?.textColor ?? ""} ${
                isActive
                  ? "shadow-[0_2px_4px_rgba(0,0,0,0.12),0_12px_24px_-6px_rgba(0,0,0,0.25),0_32px_56px_-16px_rgba(0,0,0,0.4)]"
                  : "shadow-[0_-1px_2px_rgba(0,0,0,0.12),0_4px_12px_-4px_rgba(0,0,0,0.4)]"
              }`}
            >
              {/* Finish: fine metal grain, soft static sheen, edge thickness */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[inherit] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.13) 42%, transparent 58%), ${CARD_GRAIN}`,
                  backgroundSize: "auto, 200px 200px",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.18)]"
              />

              {/* Top: brand, name, balance */}
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <CardBrandLogo brand={card.brand} material={card.material} />
                  <span className="text-[13px] font-medium tracking-[-0.01em] truncate">{card.name}</span>
                </div>
                <span className="text-[13px] font-semibold tabular-nums shrink-0">
                  {isUnlocked
                    ? `${card.currency || defaultCurrency}${card.balance.toLocaleString()}`
                    : "••••"}
                </span>
              </div>

              <Chip variant={card.theme?.chipVariant} />

              {/* Bottom: number, holder, expiry, CVV */}
              <div className="relative">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[14px] tracking-wider tabular-nums">
                    {isUnlocked ? card.cardNumber : `•••• ${last4}`}
                  </span>

                  {isActive && isUnlocked && card.cardNumber && (
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, card)}
                      onPointerDown={(e) => e.stopPropagation()}
                      aria-label={isCopied ? "Card number copied" : "Copy card number"}
                      className="p-1.5 -m-1.5 rounded-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wide opacity-60 tabular-nums">
                  <span className="truncate">{card.cardHolder}</span>
                  <span className="flex gap-3 shrink-0">
                    <span>{card.expiry}</span>
                    <span>CVV {isUnlocked ? card.cvv : "•••"}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Front pocket — drop-shadow wrapper so the shadow follows the thumb cut-out */}
        <div
          onClick={(e) => {
            // Clicking the front pocket returns any active card back into the slot
            if (activeCardId) {
              e.stopPropagation();
              selectCard(null);
            }
          }}
          className="absolute inset-x-0 bottom-0 h-[265px] z-20 [filter:drop-shadow(0_-3px_5px_rgba(0,0,0,0.4))]"
        >
        <div
          style={{ WebkitMask: POCKET_MASK, mask: POCKET_MASK, boxShadow: EDGE }}
          className="relative h-full rounded-b-[36px] rounded-t-[18px] bg-[#7a3b1d] flex flex-col items-center justify-between pt-12 pb-7"
        >
          <LeatherSurface className="rounded-b-[36px] rounded-t-[18px]" />

          {/* Thumb cut-out edge */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0 rounded-full pointer-events-none shadow-[0_0_0_1.5px_rgba(25,10,3,0.65),0_2.5px_0_-1px_rgba(255,225,190,0.14)]"
            style={{ width: THUMB_CUT * 2, height: THUMB_CUT * 2 }}
          />

          <Crease inset={4} radius={32} openTop />
          {showStitching && <Stitch inset={9} radius={27} openTop />}

          <Emblem />

          <button
            type="button"
            onClick={toggleLock}
            disabled={isScanning}
            aria-label={isUnlocked ? "Hide card details" : "Unlock with Face ID to show card details"}
            title={isUnlocked ? "Lock" : "Unlock with Face ID"}
            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.45),0_1px_0_rgba(255,225,190,0.14)] text-[#f3dcc2]/75 hover:bg-black/25 hover:text-[#f3dcc2] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-400 active:scale-95"
          >
            {isUnlocked ? <Lock className="w-4 h-4" /> : <FaceIdGlyph state="idle" strokeWidth={5} className="w-[18px] h-[18px]" />}
          </button>
        </div>
        </div>

        {/* Face ID overlay */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              key="face-id"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="status"
              aria-live="polite"
              aria-label={isSuccess ? "Face ID verified" : "Scanning with Face ID"}
              className="absolute inset-0 z-[60] rounded-[36px] flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={spring}
                className="w-[136px] h-[136px] rounded-[30px] bg-[#1c1c1e]/35 backdrop-blur-xl backdrop-saturate-150 border border-white/15 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] flex flex-col items-center justify-center gap-3 text-white"
              >
                <FaceIdGlyph
                  state={isSuccess ? "success" : "scanning"}
                  className={`w-14 h-14 transition-colors duration-300 ${isSuccess ? "text-[#34c759]" : "text-white"}`}
                />
                <span className="text-[13px] font-medium text-white/85">Face ID</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p aria-live="polite" className="mt-8 text-xs text-zinc-500 text-center">
        {hint}
      </p>
    </div>
  );
};

export default LeatherCardWallet;
