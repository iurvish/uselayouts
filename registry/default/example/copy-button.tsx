"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const CopyButton = () => {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (copied) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center">
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        className="px-5 py-3 rounded-full font-medium overflow-hidden"
        animate={{
          backgroundColor: copied ? "#22c55e" : "#18181b",
          color: "#ffffff",
        }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!copied ? (
            <motion.span
              key="copy"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: "block" }}
            >
              Copy
            </motion.span>
          ) : (
            <motion.span
              key="copied"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: "block" }}
            >
              ✓ Copied!
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default CopyButton;