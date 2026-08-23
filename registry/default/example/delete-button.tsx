"use client";

import { Undo03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useDialKit } from "dialkit";
import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";

export const dialConfig = {
  deleteText: "Delete Account",
  cancelText: "Cancel Deletion",
  countdown: [10, 3, 20, 1],
  deleteColor: "#FE322A",
  softColor: "#FFEDF1",
  layout: {
    type: "easing",
    duration: 0.4,
    ease: [0.77, 0, 0.175, 1],
  },
  char: {
    type: "easing",
    duration: 0.3,
    ease: [0.785, 0.135, 0.15, 0.86],
  },
} as const;

type DeleteParams = {
  deleteText: string;
  cancelText: string;
  countdown: number;
  deleteColor: string;
  softColor: string;
  layout: typeof dialConfig.layout;
  char: typeof dialConfig.char;
};

const DeleteButton = () => {
  const params = useDialKit("Delete Button", dialConfig as never) as DeleteParams;
  const [isDeleting, setIsDeleting] = useState(false);
  const [count, setCount] = useState(params.countdown);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isDeleting) return;
    if (count === 0) return;
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isDeleting, count]);

  const handleClick = (newState: boolean) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsDeleting(newState);
    if (newState) setCount(params.countdown);
    setTimeout(() => setIsAnimating(false), params.layout.duration * 1000);
  };

  const deleteText = params.deleteText;
  const cancelText = params.cancelText;

  return (
    <div className="flex items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {!isDeleting ? (
          <motion.button
            key="delete"
            layoutId="deleteButton"
            onClick={() => handleClick(true)}
            whileTap={{ scale: 0.95 }}
            style={{ pointerEvents: isAnimating ? "none" : "auto" }}
            initial={{
              backgroundColor: params.softColor,
              filter: "blur(1px)",
              opacity: 1,
            }}
            animate={{
              backgroundColor: params.deleteColor,
              filter: "blur(0px)",
              opacity: 1,
            }}
            exit={{
              backgroundColor: params.softColor,
              filter: "blur(1px)",
              opacity: 0,
            }}
            className="flex items-center justify-center overflow-hidden rounded-full px-5 py-3 text-white"
            transition={{
              layout: { duration: params.layout.duration, ease: [...params.layout.ease] },
              backgroundColor: { duration: 0.4, ease: "easeInOut" },
              filter: { duration: 0.1, ease: "easeInOut" },
              opacity: { duration: 0.2, ease: "easeOut" },
            }}
          >
            <motion.span
              layoutId="buttonText"
              className="flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {deleteText.split("").map((char, i) => (
                <motion.span
                  key={`delete-${i}-${char}`}
                  initial={{ y: 20, opacity: 0, scale: 0.3 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.3 }}
                  transition={{
                    duration: params.char.duration,
                    ease: [...params.char.ease],
                    delay: i * 0.005,
                  }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </motion.button>
        ) : (
          <motion.button
            key="cancel"
            layoutId="deleteButton"
            onClick={() => handleClick(false)}
            whileTap={{ scale: 0.95 }}
            style={{ pointerEvents: isAnimating ? "none" : "auto" }}
            initial={{
              backgroundColor: params.deleteColor,
              filter: "blur(1px)",
              opacity: 0,
            }}
            animate={{
              backgroundColor: params.softColor,
              filter: "blur(0px)",
              opacity: 1,
            }}
            exit={{
              backgroundColor: params.deleteColor,
              filter: "blur(1px)",
              opacity: 0,
            }}
            className="flex items-center gap-2 overflow-hidden rounded-full px-3 py-3"
            transition={{
              layout: { duration: params.layout.duration, ease: [...params.layout.ease] },
              backgroundColor: { duration: 0.4, ease: "easeInOut" },
              filter: { duration: 0.2, ease: "easeInOut" },
              opacity: { duration: 0.2, ease: "easeIn" },
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="flex shrink-0 items-center justify-center rounded-full p-1.5"
              style={{ backgroundColor: params.deleteColor }}
            >
              <HugeiconsIcon icon={Undo03Icon} className="h-4 w-4 text-white" />
            </motion.div>

            <motion.span
              layoutId="buttonText"
              className="flex font-medium"
              style={{ color: params.deleteColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {cancelText.split("").map((char, i) => (
                <motion.span
                  key={`cancel-${i}-${char}`}
                  initial={{ y: 20, opacity: 0, scale: 0.3 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.3 }}
                  transition={{
                    duration: params.char.duration,
                    ease: [...params.char.ease],
                    delay: i * 0.006,
                  }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>

            <motion.div
              className="relative flex min-w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-full px-4 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: params.deleteColor }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                  className="absolute"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeleteButton;
