import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Lightweight class merger utility (compatible with shadcn `cn` or standalone)
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface BookDemoInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  placeholder?: string;
  buttonText?: string;
  onSubmitEmail?: (email: string) => Promise<void> | void;
  className?: string;
}

export const BookDemoInput: React.FC<BookDemoInputProps> = ({
  placeholder = "Enter your work email...",
  buttonText = "Book a Demo",
  onSubmitEmail,
  className,
  ...props
}) => {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Real-time email validation check
  const isValidEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  // Visible when user focuses input, types text, or during submit/success states
  const isButtonVisible =
    (isFocused || email.trim().length > 0 || status === "loading" || status === "success") &&
    !(status === "idle" && email.trim().length === 0 && !isFocused);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEmail("");
    setStatus("idle");
    setErrorMessage("");
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!email || !isValidEmail) {
      setStatus("error");
      setErrorMessage("Please enter a valid work email (e.g. name@company.com)");
      return;
    }

    try {
      setStatus("loading");
      setErrorMessage("");
      if (onSubmitEmail) {
        await onSubmitEmail(email);
      } else {
        // Simulated API call delay
        await new Promise((resolve) => setTimeout(resolve, 850));
      }
      setStatus("success");
      setEmail(""); // Reset input text

      // After showing "Done" for 1.8s, smoothly suck the button back into the box
      setTimeout(() => {
        setStatus("idle");
        setIsFocused(false);
      }, 1800);
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative w-full max-w-[560px] flex flex-col items-center font-sans select-none", className)}
      {...props}
    >
      {/* Dynamic Ambient Glow */}
      <motion.div
        animate={{
          opacity: isFocused ? 0.6 : isHovered ? 0.35 : 0.15,
          scale: isFocused ? 1.05 : isHovered ? 1.02 : 0.98,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute -inset-2 rounded-full bg-gradient-to-r from-zinc-200/50 via-zinc-100/50 to-zinc-300/50 dark:from-zinc-800/40 dark:to-zinc-800/40 blur-xl pointer-events-none -z-10"
      />

      {/* Horizontal Flex Row Container */}
      <div className="relative flex items-center justify-center w-full gap-2.5">
        {/* Main Input Capsule Box */}
        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{
            x:
              status === "error"
                ? [-10, 10, -7, 7, -3, 3, 0]
                : 0,
            rotate: status === "error" ? [-1.5, 1.5, -1, 1, 0] : 0,
            scale: isFocused ? 1.01 : isHovered ? 1.005 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 22,
            x: { duration: 0.4 },
          }}
          className={cn(
            "relative flex items-center flex-1 h-[52px] px-4 z-20 overflow-hidden",
            "bg-white dark:bg-zinc-900 shadow-sm",
            "border rounded-full transition-all duration-300",
            status === "error"
              ? "border-red-500 ring-2 ring-red-500/30"
              : isValidEmail
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : isFocused
              ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/15 dark:ring-zinc-100/15 shadow-md shadow-zinc-900/5"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
          )}
        >
          {/* Email Icon */}
          <motion.div
            animate={{
              scale: isFocused ? 1.15 : isHovered ? 1.08 : 1,
              rotate: isFocused ? [-8, 8, -4, 4, 0] : isHovered ? [0, -6, 0] : 0,
              color: isValidEmail
                ? "#059669"
                : isFocused
                ? "#18181B"
                : isHovered
                ? "#52525B"
                : "#A1A1AA",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mr-2.5 shrink-0 flex items-center justify-center pointer-events-none text-zinc-400 dark:text-zinc-500"
          >
            {isValidEmail ? (
              <motion.svg
                initial={{ scale: 0.5, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </motion.svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            )}
          </motion.div>

          {/* Input Field */}
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={status === "loading" || status === "success"}
            className={cn(
              "flex-1 h-full bg-transparent border-none outline-none min-w-0 z-10",
              "text-[14.5px] font-normal text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              "selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900"
            )}
          />

          {/* Quick Clear 'X' Button */}
          <AnimatePresence>
            {email.length > 0 && status === "idle" && (
              <motion.button
                type="button"
                onClick={handleClear}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                whileHover={{ scale: 1.15, backgroundColor: "rgba(0,0,0,0.08)" }}
                whileTap={{ scale: 0.9 }}
                className="w-5 h-5 mr-1 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 z-10"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Crisp White Button (Slides out from Left behind input box) */}
        <AnimatePresence>
          {isButtonVisible && (
            <motion.div
              initial={{
                opacity: 0,
                width: 0,
                x: -120, // Slides out from the left (behind input box)
                scale: 0.85,
              }}
              animate={{
                opacity: 1,
                width: "auto",
                x: 0, // Glides smoothly to the right into its position beside the box
                scale: 1,
              }}
              exit={{
                opacity: 0,
                width: 0,
                x: -100, // Retracts back toward the left behind the input box
                scale: 0.85,
                transition: {
                  duration: 0.26,
                  ease: "easeInOut",
                },
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 24,
                mass: 0.8,
              }}
              className="flex items-center shrink-0 h-[52px] z-10"
            >
              <motion.button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSubmit}
                whileHover={status === "idle" ? { scale: 1.03, y: -1 } : {}}
                whileTap={status === "idle" ? { scale: 0.95, y: 1 } : {}}
                disabled={status === "loading"}
                className={cn(
                  "relative h-full min-w-[140px] px-5 rounded-full",
                  "flex items-center justify-center cursor-pointer shrink-0",
                  "text-xs font-semibold tracking-tight whitespace-nowrap overflow-hidden",
                  status === "success"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-500"
                    : "bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-md shadow-zinc-900/5",
                  "transition-all duration-200 disabled:opacity-80 disabled:cursor-not-allowed"
                )}
              >
                <AnimatePresence mode="wait">
                  {status === "loading" && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center"
                    >
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.65, ease: "linear" }}
                        className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100 rounded-full"
                      />
                    </motion.div>
                  )}

                  {status === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ type: "spring", stiffness: 450, damping: 22 }}
                      className="flex items-center gap-1.5 font-bold text-white text-[13px]"
                    >
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                      <span>Done!</span>
                    </motion.div>
                  )}

                  {(status === "idle" || status === "error") && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100"
                    >
                      <span>{buttonText}</span>

                      <motion.div
                        animate={{
                          x: isFocused || isHovered ? [0, 3, 0] : 0,
                        }}
                        transition={{
                          repeat: isFocused || isHovered ? Infinity : 0,
                          duration: 1,
                          ease: "easeInOut",
                        }}
                        className="flex items-center"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Helper Text & Error Badges */}
      <div className="w-full min-h-[22px] flex items-center justify-between px-4 mt-2">
        <AnimatePresence mode="wait">
          {status === "error" && errorMessage ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {errorMessage}
            </motion.div>
          ) : isValidEmail && status === "idle" ? (
            <motion.div
              key="valid"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[11.5px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono font-medium border border-zinc-200 dark:border-zinc-700">↵ Enter</kbd> to submit
            </motion.div>
          ) : isFocused && email.length === 0 ? (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11.5px] text-zinc-400 dark:text-zinc-500 font-normal"
            >
              We'll send a calendar invite instantly
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BookDemoInput;