"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "../../../components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  UnfoldMoreIcon,
  Album02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

interface PlaceholderConfig {
  id: number;
  placeholder: string;
  icon: any;
}

// Change Here
const placeholderOptions: PlaceholderConfig[] = [
  { id: 1, placeholder: "Search anything...", icon: SparklesIcon },
  { id: 2, placeholder: "Generate Image", icon: Album02Icon },
];

const AnimatedPlaceholder = ({ text }: { text: string }) => {
  const letters = text.split("");

  return (
    <span className="inline-flex overflow-hidden">
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: 0.02 * index,
            duration: 0.2,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
};

const InputSwitch = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const currentConfig = placeholderOptions[activeIndex];

  const handleIconClick = () => {
    setActiveIndex((prev) => (prev + 1) % placeholderOptions.length);
  };

  const IconComponent = currentConfig.icon;

  return (
    <div className="flex w-full max-w-sm items-center justify-center overflow-hidden rounded-full bg-muted px-1 py-1">
      <motion.button
        type="button"
        className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-full bg-background p-2.5 shadow-sm"
        onClick={handleIconClick}
        whileTap={{ scale: 0.96 }}
      >
        <span className="relative size-5 shrink-0 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={currentConfig.id}
              initial={{ opacity: 0, scale: 0.85, filter: "blur(3px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.85, filter: "blur(3px)" }}
              transition={{ type: "spring", duration: 0.25, bounce: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <HugeiconsIcon
                icon={IconComponent}
                className="size-5 text-foreground"
              />
            </motion.span>
          </AnimatePresence>
        </span>
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          className="size-3 shrink-0 text-muted-foreground"
        />
      </motion.button>
      <div className="flex-1 relative min-w-0">
        {!inputValue && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex w-full items-center overflow-hidden pl-1.5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={currentConfig.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                className="block overflow-hidden text-sm whitespace-nowrap text-muted-foreground"
              >
                <AnimatedPlaceholder text={currentConfig.placeholder} />
              </motion.span>
            </AnimatePresence>
          </div>
        )}
        <Input
          type="text"
          value={inputValue}
          onChange={(e: any) => setInputValue(e.target.value)}
          className="!border-0 outline-none border-none bg-transparent! m-0 !pl-1.5 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
        />
      </div>
      <button className="bg-background py-2.5 px-3 rounded-full flex shadow-sm items-center justify-center self-stretch cursor-pointer active:scale-95 transition-transform ease-in-out duration-150">
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          className="h-4 w-4 text-foreground"
        />
      </button>
    </div>
  );
};

export default InputSwitch;
