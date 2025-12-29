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
    <motion.span className="inline-flex overflow-hidden">
      {letters.map((letter, index) => (
        <motion.span
          key={`${text}-${index}`}
          initial={{
            opacity: 0,
            rotateX: "80deg",
            y: 8,
            filter: "blur(3px)",
          }}
          exit={{
            opacity: 0,
            rotateX: "-80deg",
            filter: "blur(3px)",
            y: -8,
          }}
          animate={{
            opacity: 1,
            rotateX: "0deg",
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: 0.015 * index,

            type: "spring",
            damping: 16,
            stiffness: 240,
            mass: 1.2,
          }}
          style={{
            willChange: "transform",
          }}
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
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
    <div className="bg-muted w-full max-w-sm py-1 flex justify-center items-center rounded-full px-1">
      <motion.button
        className="bg-background p-2.5 px-2.5 rounded-full flex items-center justify-center gap-1.5 transition-colors overflow-hidden cursor-default shadow-sm"
        onClick={handleIconClick}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentConfig.id}
            exit={{
              filter: "blur(5px)",
              opacity: 0,
            }}
            initial={{
              opacity: 0,
              filter: "blur(5px)",
            }}
            animate={{
              filter: "blur(0px)",
              opacity: 1,
            }}
            transition={{
              ease: "easeInOut",

              duration: 0.35,
            }}
            className="flex items-center justify-center gap-1"
          >
            <HugeiconsIcon
              icon={IconComponent}
              className="w-5 h-5 text-foreground"
            />
          </motion.div>
        </AnimatePresence>
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          className="w-3 h-3 text-muted-foreground"
        />
      </motion.button>
      <div className="flex-1 relative min-w-0">
        {!inputValue && (
          <div className="absolute left-0 top-0 w-full h-full flex items-center pointer-events-none pl-1.5 bg-transparent overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentConfig.id}
                className="text-sm text-muted-foreground whitespace-nowrap"
              >
                <AnimatedPlaceholder text={currentConfig.placeholder} />
              </motion.div>
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
