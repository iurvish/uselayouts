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
