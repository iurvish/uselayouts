"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

const Counter = ({
  min = 0,
  max = 99,
  defaultValue = 0,
}) => {
  const [count, setCount] = useState(defaultValue);
  const [direction, setDirection] = useState(1);

  const increment = () => {
    if (count >= max) return;

    setDirection(1);
    setCount((c) => c + 1);
  };

  const decrement = () => {
    if (count <= min) return;

    setDirection(-1);
    setCount((c) => c - 1);
  };

  // Only pad after 10
  const formatted =
    count < 10
      ? count.toString()
      : count.toString().padStart(2, "0");

  const previousFormatted =
    (direction > 0 ? count - 1 : count + 1) < 10
      ? (direction > 0
          ? count - 1
          : count + 1
        ).toString()
      : (direction > 0
          ? count - 1
          : count + 1
        )
          .toString()
          .padStart(2, "0");

  const currentDigits = formatted.split("");
  const previousDigits =
    previousFormatted.split("");

  return (
    <div className="flex items-center gap-4">
      {/* Minus */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        transition={SPRING}
        onClick={decrement}
        disabled={count <= min}
        className="w-11 h-11 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 text-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed select-none bg-white dark:bg-zinc-900 shadow-sm"
      >
        −
      </motion.button>

      {/* Counter */}
      <motion.div
        layout
        transition={SPRING}
        className="relative flex items-center justify-center min-w-[34px] h-[42px]"
      >
        <div className="flex items-center">
          {currentDigits.map((digit, index) => {
            const prevDigit =
              previousDigits[index];

            const changed =
              prevDigit !== digit;

            return (
              <div
                key={index}
                className="relative w-[16px] h-[30px] overflow-hidden flex items-center justify-center"
              >
                <AnimatePresence
                  mode="sync"
                  initial={false}
                >
                  <motion.span
                    key={`${index}-${digit}`}
                    initial={
                      changed
                        ? {
                            y:
                              direction > 0
                                ? 26
                                : -26,
                            opacity: 0,
                            scale: 0.92,
                          }
                        : false
                    }
                    animate={{
                      y: 0,
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={
                      changed
                        ? {
                            y:
                              direction > 0
                                ? -26
                                : 26,
                            opacity: 0,
                            scale: 0.92,
                          }
                        : {}
                    }
                    transition={{
                      ...SPRING,
                      opacity: {
                        duration: 0.14,
                      },
                    }}
                    className="absolute text-[28px] font-semibold tracking-[-0.04em] leading-none text-zinc-950 dark:text-white tabular-nums"
                    style={{
                      willChange:
                        "transform, opacity",
                    }}
                  >
                    {digit}
                  </motion.span>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Plus */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        transition={SPRING}
        onClick={increment}
        disabled={count >= max}
        className="w-11 h-11 rounded-full bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 text-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed select-none shadow-sm"
      >
        +
      </motion.button>
    </div>
  );
};

export default Counter;