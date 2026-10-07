// ADD-CASH.TSX

"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";

const SP = {
  type: "spring" as const,
  stiffness: 520,
  damping: 42,
  mass: 0.72,
};

const WalletIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-zinc-500 dark:text-zinc-400"
  >
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="3"
    />
    <path d="M16 12h2" />
    <path d="M2 10h20" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const VisaIcon = () => (
  <div className="text-[13px] font-black tracking-[0.18em] text-blue-700 dark:text-blue-400">
    VISA
  </div>
);

const MastercardIcon = () => (
  <div className="flex items-center">
    <div className="h-4 w-4 rounded-full bg-red-500" />
    <div className="-ml-1 h-4 w-4 rounded-full bg-yellow-400" />
  </div>
);

export default function AddCash() {
  const [open, setOpen] =
    useState(false);

  const [selectedCard, setSelectedCard] =
    useState("4632");

  const [selectedAmount, setSelectedAmount] =
    useState<number | null>(300);

  const [customAmount, setCustomAmount] =
    useState("300");

  const inputRef =
    useRef<HTMLInputElement>(null);

  const amounts = [
    50,
    100,
    null,
  ];

  const effectiveAmount =
    selectedAmount === null
      ? parseFloat(customAmount) || 0
      : selectedAmount;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-black p-6">

      <motion.div
        layout="size"
        transition={SP}
        className="relative w-[400px] overflow-hidden rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
      >
        {/* Header */}

        <motion.div
          layout="position"
          transition={SP}
          className="flex items-center gap-3 border-b border-transparent px-[18px] py-[18px]"
        >
          <motion.div
            layout
            transition={SP}
            className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-zinc-100 dark:bg-zinc-900"
          >
            <WalletIcon />
          </motion.div>

          <motion.div
            layout="position"
            transition={SP}
            className="flex-1"
          >
            <div className="mb-0.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              Wallet
            </div>

            <div className="text-[20px] font-bold tracking-[-0.04em] text-zinc-950 dark:text-white">
              $34.00
            </div>
          </motion.div>

          {!open ? (
            <motion.button
              layout
              layoutId="top-action"
              whileTap={{
                scale: 0.96,
              }}
              transition={SP}
              onClick={() =>
                setOpen(true)
              }
              className="flex items-center gap-1.5 rounded-full bg-zinc-950 dark:bg-white px-4 py-2.5 text-[13px] font-semibold text-white dark:text-zinc-950 shadow-sm"
            >
              <PlusIcon />
              Add Cash
            </motion.button>
          ) : (
            <motion.button
              layout
              layoutId="top-action"
              whileTap={{
                scale: 0.9,
              }}
              transition={SP}
              onClick={() =>
                setOpen(false)
              }
              className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400"
            >
              <CloseIcon />
            </motion.button>
          )}
        </motion.div>

        {/* Expanded content */}

        <motion.div
          layout
          animate={{
            height: open
              ? "auto"
              : 0,
            opacity: open
              ? 1
              : 0,
          }}
          transition={{
            ...SP,
            opacity: {
              duration: 0.14,
            },
          }}
          className="overflow-hidden"
        >
          <motion.div
            layout
            transition={SP}
            className="px-[18px] pb-[18px]"
          >
            {/* Payment mode */}

            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                Payment Mode
              </span>

              <button className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                Add Card
              </button>
            </div>

            {/* Cards */}

            <div className="mb-4 flex flex-col gap-2">
              {[
                {
                  id: "6756",
                  icon: <VisaIcon />,
                },
                {
                  id: "4632",
                  icon:
                    <MastercardIcon />,
                },
              ].map((card) => {
                const selected =
                  selectedCard ===
                  card.id;

                return (
                  <motion.div
                    key={card.id}
                    layout
                    transition={SP}
                    onClick={() =>
                      setSelectedCard(
                        card.id
                      )
                    }
                    className="relative cursor-pointer rounded-[14px]"
                  >
                    {selected && (
                      <motion.div
                        layoutId="card-outline"
                        transition={SP}
                        className="absolute inset-0 rounded-[14px] border border-zinc-950 dark:border-white"
                      />
                    )}

                    <motion.div
                      layout="position"
                      transition={SP}
                      whileHover={{
                        backgroundColor:
                          "rgba(0,0,0,0.02)",
                      }}
                      className="flex items-center gap-3 rounded-[14px] px-[14px] py-3 dark:hover:bg-white/[0.03]"
                    >
                      <motion.div
                        animate={{
                          borderWidth:
                            selected
                              ? 5
                              : 1.5,
                        }}
                        transition={SP}
                        className={`h-[18px] w-[18px] rounded-full border ${
                          selected
                            ? "border-zinc-950 dark:border-white"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                      />

                      <span className="flex-1 text-[13px] font-semibold tracking-[0.04em] text-zinc-950 dark:text-white">
                        ···· {card.id}
                      </span>

                      {card.icon}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Cash label */}

            <div className="mb-2 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              Cash
            </div>

            {/* Amounts */}

            <div className="mb-5 flex gap-2">
              {amounts.map(
                (amt, i) => {
                  const selected =
                    selectedAmount ===
                    amt;

                  const isCustom =
                    amt === null;

                  return (
                    <motion.div
                      key={i}
                      layout
                      transition={SP}
                      onClick={() => {
                        setSelectedAmount(
                          amt
                        );

                        if (
                          isCustom
                        ) {
                          setTimeout(
                            () =>
                              inputRef.current?.focus(),
                            40
                          );
                        }
                      }}
                      className="relative flex-1 cursor-pointer"
                    >
                      {selected && (
                        <motion.div
                          layoutId="amount-outline"
                          transition={SP}
                          className="absolute inset-0 rounded-[12px] border border-zinc-950 dark:border-white"
                        />
                      )}

                      <motion.div
                        whileTap={{
                          scale: 0.97,
                        }}
                        transition={SP}
                        className={`flex h-[42px] items-center justify-center rounded-[12px] text-[13px] font-semibold ${
                          selected
                            ? "bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white"
                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {isCustom ? (
                          <span className="flex items-center gap-0.5">
                            $
                            <input
                              ref={
                                inputRef
                              }
                              value={
                                customAmount
                              }
                              onChange={(
                                e
                              ) =>
                                setCustomAmount(
                                  e
                                    .target
                                    .value
                                )
                              }
                              className="w-11 bg-transparent text-center text-[13px] font-semibold outline-none text-zinc-950 dark:text-white"
                            />
                          </span>
                        ) : (
                          `$${amt}`
                        )}
                      </motion.div>
                    </motion.div>
                  );
                }
              )}
            </div>

            {/* CTA */}

            <motion.button
              layout
              whileHover={{
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.985,
              }}
              transition={SP}
              className="h-12 w-full rounded-full bg-zinc-950 dark:bg-white text-[14px] font-semibold text-white dark:text-zinc-950 shadow-[0_2px_12px_rgba(0,0,0,0.22)]"
            >
              Add $
              {effectiveAmount.toFixed(
                0
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}