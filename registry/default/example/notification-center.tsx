"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  ChartNoAxesCombined,
  CircleDollarSign,
  Copy,
  MessageCircle,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

const notifications = [
  {
    id: "comment",
    title: 'New comment on "Landing Page..."',
    description: "Sarah left feedback on your design",
    icon: MessageCircle,
    iconClass: "bg-[#dce5ff] text-[#5877f3] dark:bg-[#26345f] dark:text-[#a9bbff]",
  },
  {
    id: "credits",
    title: "Copy credits running low...",
    description: "You have 3 credits remaining this month",
    icon: TriangleAlert,
    iconClass: "bg-[#ffebc3] text-[#f59e0b] dark:bg-[#593c0b] dark:text-[#ffbf4b]",
  },
  {
    id: "copied",
    title: "Someone copied your block",
    description: '"Pricing Card — Minimal" was added to a Fig...',
    icon: Copy,
    iconClass: "bg-[#e5d4ff] text-[#8b5cf6] dark:bg-[#3f246e] dark:text-[#b698ff]",
  },
  {
    id: "analytics",
    title: "Weekly analytics ready...",
    description: "Your creator dashboard has new insights...",
    icon: ChartNoAxesCombined,
    iconClass: "bg-[#dedede] text-[#737373] dark:bg-[#3a3a3d] dark:text-[#c3c3c7]",
  },
  {
    id: "payout",
    title: "Payout processed",
    description: "$42.00 sent to your connected account...",
    icon: CircleDollarSign,
    iconClass: "bg-[#b9ffc7] text-[#00b83f] dark:bg-[#064c26] dark:text-[#6cf59d]",
  },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(true);
  const [unread, setUnread] = useState(5);

  return (
    <div className="flex min-h-[400px] w-full items-start justify-center bg-[#e5e7eb] px-5 pt-5 font-sans transition-colors duration-300 dark:bg-[#242426] sm:min-h-[508px] sm:pt-14">
      <div className="relative flex flex-col items-center">
        <motion.button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close notifications" : "Open notifications"}
          onClick={() => setOpen((value) => !value)}
          whileTap={{ scale: 0.94 }}
          className="relative z-10 grid size-[52px] place-items-center rounded-full border border-white bg-white text-[#44444a] shadow-[0_10px_22px_rgba(34,44,60,0.14),0_2px_5px_rgba(34,44,60,0.06)] transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5877f3] focus-visible:ring-offset-2 dark:border-transparent dark:bg-[#353538] dark:text-[#eeeeef] dark:shadow-[0_7px_15px_rgba(0,0,0,0.35)] dark:hover:bg-[#424247] dark:focus-visible:ring-[#a9bbff] dark:focus-visible:ring-offset-[#242426]"
        >
          <motion.span
            animate={open ? { rotate: [0, -8, 8, -4, 0] } : { rotate: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <Bell className="size-6 stroke-[1.65]" />
          </motion.span>
          <AnimatePresence initial={false}>
            {unread > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.45, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.45, y: 5 }}
                transition={{ type: "spring", stiffness: 520, damping: 25 }}
                className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-[#e94358] text-[13px] font-medium text-white shadow-sm dark:bg-[#ff5a6d]"
              >
                {unread}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -18, scale: 0.96, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 12, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, scale: 0.96, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
              className="w-[min(358px,calc(100vw-40px))] overflow-hidden rounded-[20px] border border-white/80 bg-[#fbfbfc] shadow-[0_18px_34px_rgba(34,44,60,0.16),0_3px_8px_rgba(34,44,60,0.06)] transition-colors duration-300 dark:border-transparent dark:bg-[#2d2d30] dark:shadow-[0_14px_28px_rgba(0,0,0,0.42)]"
            >
              <div className="divide-y divide-[#e7e8eb] dark:divide-[#424246]">
                {notifications.map((notification, index) => {
                  const Icon = notification.icon;

                  return (
                    <motion.button
                      type="button"
                      key={notification.id}
                      onClick={() => setUnread((count) => Math.max(0, count - 1))}
                      initial={{ opacity: 0, x: -14 }}
                      whileHover={{
                        backgroundColor: "var(--notification-hover)",
                        boxShadow: "var(--notification-shadow)",
                        scale: 1.012,
                        zIndex: 10,
                      }}
                      animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
                      transition={{
                        delay: 0.08 + index * 0.065,
                        type: "spring",
                        stiffness: 420,
                        damping: 30,
                      }}
                      className="relative flex w-full [--notification-hover:#ffffff] [--notification-shadow:0_8px_20px_rgba(34,44,60,0.15)] items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5877f3] dark:[--notification-hover:rgba(62,62,66,0.98)] dark:[--notification-shadow:0_7px_18px_rgba(0,0,0,0.45)] dark:focus-visible:ring-[#a9bbff]"
                    >
                      <span className={`grid size-11 shrink-0 place-items-center rounded-full ${notification.iconClass}`}>
                        <Icon className="size-[21px] stroke-[2]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium leading-5 tracking-[-0.025em] text-[#22232a] dark:text-[#f2f2f3]">
                          {notification.title}
                        </span>
                        <span className="block truncate text-[13px] leading-5 tracking-[-0.025em] text-[#626570] dark:text-[#b7b7bc]">
                          {notification.description}
                        </span>
                      </span>
                      <span className="self-start pt-1 text-[11px] text-[#727580] dark:text-[#ababaf]">2m ago</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default NotificationCenter;
