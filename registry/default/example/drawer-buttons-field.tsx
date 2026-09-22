"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Minus, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const months = [
  { label: "MM", value: "mm" },
  { label: "01", value: "01" },
  { label: "02", value: "02" },
  { label: "03", value: "03" },
  { label: "04", value: "04" },
  { label: "05", value: "05" },
  { label: "06", value: "06" },
  { label: "07", value: "07" },
  { label: "08", value: "08" },
  { label: "09", value: "09" },
  { label: "10", value: "10" },
  { label: "11", value: "11" },
  { label: "12", value: "12" },
];

const years = [
  { label: "YYYY", value: "yyyy" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
];

const COUPON_CODE = "SAVE10";
const COUPON_DISCOUNT_RATE = 0.1;
const REVEAL_EASE = [0.76, 0, 0.24, 1] as const;
const REVEAL_DURATION = 0.8;
const REVEAL_STAGGER = 0.05;

const initialCartItems = [
  {
    id: "headphones",
    name: "Wireless Headphones",
    variant: "Midnight Black",
    price: 149.99,
    quantity: 1,
    imageClassName: "bg-zinc-900",
  },
  {
    id: "tote",
    name: "Leather Tote Bag",
    variant: "Tan · Medium",
    price: 89,
    quantity: 2,
    imageClassName: "bg-amber-700",
  },
  {
    id: "mug",
    name: "Ceramic Mug Set",
    variant: "4-piece",
    price: 34.5,
    quantity: 1,
    imageClassName: "bg-sky-200",
  },
];

type CartItem = {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  imageClassName: string;
};

type RevealDirection = "left" | "right";

const RevealContext = createContext<RevealDirection>("right");

type DrawerRevealProps = {
  children: ReactNode;
  direction: RevealDirection;
  open?: boolean;
};

const DrawerReveal = ({
  children,
  direction,
  open = false,
}: DrawerRevealProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <RevealContext.Provider value={direction}>
      <motion.div
        initial={false}
        animate={open ? "show" : "hidden"}
        variants={{
          show: {
            transition: shouldReduceMotion
              ? { duration: 0 }
              : { staggerChildren: REVEAL_STAGGER },
          },
          hidden: {
            transition: shouldReduceMotion
              ? { duration: 0 }
              : { staggerChildren: REVEAL_STAGGER, staggerDirection: -1 },
          },
        }}
      >
        {children}
      </motion.div>
    </RevealContext.Provider>
  );
};

const RevealItem = ({
  className,
  children,
  role,
}: {
  className?: string;
  children: ReactNode;
  role?: string;
}) => {
  const direction = useContext(RevealContext);
  const shouldReduceMotion = useReducedMotion();
  const offsetX = direction === "left" ? -42 : 42;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, x: offsetX, filter: "blur(12px)" },
        show: shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, x: 0, filter: "blur(0px)" },
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: REVEAL_DURATION, ease: REVEAL_EASE }
      }
      role={role}
    >
      {children}
    </motion.div>
  );
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

type DrawerFieldContentProps = {
  revealOpen?: boolean;
};

export const FieldDemo = ({ revealOpen }: DrawerFieldContentProps = {}) => {
  return (
    <div className="w-full max-w-md text-foreground [&_input]:text-foreground [&_textarea]:text-foreground [&_[data-slot=select-trigger]]:text-foreground">
      <DrawerReveal direction="right" open={revealOpen}>
        <form>
          <FieldGroup>
            <FieldSet>
              <RevealItem>
                <FieldLegend className="text-foreground">
                  Payment Method
                </FieldLegend>
                <FieldDescription className="text-zinc-500">
                  All transactions are secure and encrypted
                </FieldDescription>
              </RevealItem>
              <FieldGroup>
                <RevealItem>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-card-name-43j"
                      className="text-foreground"
                    >
                      Name on Card
                    </FieldLabel>
                    <Input
                      id="checkout-7j9-card-name-43j"
                      placeholder="John Doe"
                      required
                    />
                  </Field>
                </RevealItem>
                <RevealItem>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-card-number-uw1"
                      className="text-foreground"
                    >
                      Card Number
                    </FieldLabel>
                    <Input
                      id="checkout-7j9-card-number-uw1"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                    <FieldDescription className="text-zinc-500">
                      Enter your 16-digit card number
                    </FieldDescription>
                  </Field>
                </RevealItem>
                <RevealItem className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-exp-month-ts6"
                      className="text-foreground"
                    >
                      Month
                    </FieldLabel>
                    <Select>
                      <SelectTrigger id="checkout-exp-month-ts6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {months.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-exp-year-f59"
                      className="text-foreground"
                    >
                      Year
                    </FieldLabel>
                    <Select>
                      <SelectTrigger id="checkout-7j9-exp-year-f59">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {years.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-cvv"
                      className="text-foreground"
                    >
                      CVV
                    </FieldLabel>
                    <Input id="checkout-7j9-cvv" placeholder="123" required />
                  </Field>
                </RevealItem>
              </FieldGroup>
            </FieldSet>
            <RevealItem>
              <FieldSeparator />
            </RevealItem>
            <RevealItem>
              <FieldSet>
                <FieldLegend className="text-foreground">
                  Billing Address
                </FieldLegend>
                <FieldDescription className="text-zinc-500">
                  The billing address associated with your payment method
                </FieldDescription>
                <FieldGroup>
                  <Field orientation="horizontal">
                    <input
                      id="checkout-7j9-same-as-shipping-wgm"
                      type="checkbox"
                      defaultChecked
                      className="size-4 shrink-0 rounded-[4px] border border-input accent-primary"
                    />
                    <FieldLabel
                      htmlFor="checkout-7j9-same-as-shipping-wgm"
                      className="font-normal text-foreground"
                    >
                      Same as shipping address
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </RevealItem>
            <RevealItem>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel
                      htmlFor="checkout-7j9-optional-comments"
                      className="text-foreground"
                    >
                      Comments
                    </FieldLabel>
                    <Textarea
                      id="checkout-7j9-optional-comments"
                      placeholder="Add any additional comments"
                      className="resize-none"
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
            </RevealItem>
            <RevealItem>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button
                  variant="outline"
                  type="button"
                  className="text-foreground"
                >
                  Cancel
                </Button>
              </Field>
            </RevealItem>
          </FieldGroup>
        </form>
      </DrawerReveal>
    </div>
  );
};

export const CartDemo = ({ revealOpen }: DrawerFieldContentProps = {}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => [
    ...initialCartItems,
  ]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  const discount = appliedCoupon ? subtotal * COUPON_DISCOUNT_RATE : 0;
  const total = subtotal - discount;
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const handleQuantityChange = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }),
    );
  };

  const handleApplyCoupon = () => {
    const normalizedCode = couponInput.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError("Enter a coupon code");
      setAppliedCoupon(null);
      return;
    }

    if (normalizedCode !== COUPON_CODE) {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(normalizedCode);
    setCouponError(null);
  };

  const handlePurchase = () => {};

  return (
    <div className="w-full max-w-md text-foreground [&_input]:text-foreground">
      <DrawerReveal direction="left" open={revealOpen}>
        <div className="space-y-5">
          <RevealItem>
            <h2 className="text-base font-semibold text-foreground">
              Your cart
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {itemCount} {itemCount === 1 ? "item" : "items"} ready for
              checkout
            </p>
          </RevealItem>

          <div className="space-y-3" role="list" aria-label="Cart items">
            {cartItems.map((item) => (
              <RevealItem key={item.id} role="listitem">
                <div className="flex gap-3 rounded-xl border border-border p-3">
                  <div
                    aria-hidden="true"
                    className={cn(
                      "size-14 shrink-0 rounded-lg",
                      item.imageClassName,
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {item.variant}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div
                        className="inline-flex items-center rounded-lg border border-border"
                        role="group"
                        aria-label={`Quantity for ${item.name}`}
                      >
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="flex size-7 items-center justify-center text-foreground transition-colors duration-200 ease hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span
                          className="min-w-8 px-1 text-center text-sm font-medium tabular-nums text-foreground"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="flex size-7 items-center justify-center text-foreground transition-colors duration-200 ease hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 tabular-nums">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </div>

          <RevealItem className="space-y-2 rounded-xl border border-border p-3">
            <FieldLabel htmlFor="cart-coupon-code" className="text-foreground">
              Apply coupon
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id="cart-coupon-code"
                value={couponInput}
                onChange={(event) => {
                  setCouponInput(event.target.value);
                  setCouponError(null);
                }}
                placeholder="Enter code…"
                aria-describedby={
                  couponError
                    ? "cart-coupon-error"
                    : appliedCoupon
                      ? "cart-coupon-success"
                      : undefined
                }
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 text-foreground"
                onClick={handleApplyCoupon}
              >
                Apply
              </Button>
            </div>
            {couponError ? (
              <p id="cart-coupon-error" className="text-xs text-destructive">
                {couponError}
              </p>
            ) : appliedCoupon ? (
              <p id="cart-coupon-success" className="text-xs text-emerald-600">
                {appliedCoupon} applied — {COUPON_DISCOUNT_RATE * 100}% off
              </p>
            ) : (
              <p className="text-xs text-zinc-500">Try SAVE10 for 10% off</p>
            )}
          </RevealItem>

          <RevealItem className="space-y-2 rounded-xl bg-muted/60 p-3 text-sm">
            <div className="flex items-center justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Discount</span>
                <span className="tabular-nums">-{formatPrice(discount)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-border pt-2 font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </div>
          </RevealItem>

          <RevealItem>
            <Button
              type="button"
              className="h-10 w-full"
              onClick={handlePurchase}
            >
              Purchase · {formatPrice(total)}
            </Button>
          </RevealItem>
        </div>
      </DrawerReveal>
    </div>
  );
};
