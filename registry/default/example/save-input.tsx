"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Edit01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

function SaveInput() {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("this.urvish");

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full flex justify-center items-center text-xl">
      <motion.div
        layout
        initial={{
          boxShadow: "0px 0px 2px hsl(var(--foreground) / 0.1)",
        }}
        animate={{
          boxShadow: isEditing
            ? " none border border-foreground"
            : "0px 0px 2px hsl(var(--foreground) / 0.1)",
        }}
        className={cn(
          "flex items-center relative  overflow-hidden border-2 bg-background",
          isEditing &&
            "outline-none ring-2 ring-ring ring-offset-2 ring-offset-background"
        )}
        style={{ borderRadius: 60 }}
      >
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={!isEditing}
          className={cn(
            "h-12 border-0 shadow-none focus-visible:ring-0 bg-transparent p-0 text-base w-full min-w-32 pl-4 pr-12",
            isEditing ? "text-foreground" : "text-muted-foreground"
          )}
          placeholder="username"
        />
        <AnimatePresence initial={false}>
          {!isEditing ? (
            <motion.span
              key="pen"
              layout="position"
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              exit={{ x: 50 }}
              transition={{ type: "spring", bounce: 0.1 }}
              onClick={() => {
                setIsEditing(true);

                if (inputRef.current) inputRef.current.select();
              }}
              className="absolute right-1 flex items-center justify-center h-10 w-10 rounded-full bg-card/80 border border-[0.2px] hover:bg-card cursor-pointer text-muted-foreground"
            >
              <HugeiconsIcon icon={Edit01Icon} size={20} />
            </motion.span>
          ) : (
            <motion.span
              key="check"
              layout="position"
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              exit={{ x: 50 }}
              transition={{ type: "spring", bounce: 0.1 }}
              onClick={() => setIsEditing(false)}
              className="absolute z-20 right-1 flex items-center justify-center h-10 w-10 rounded-full border-[0.2px]  bg-primary hover:bg-primary/90 cursor-pointer text-primary-foreground"
            >
              <HugeiconsIcon icon={Tick02Icon} size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default SaveInput;
