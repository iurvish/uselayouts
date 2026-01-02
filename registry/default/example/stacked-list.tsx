"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ProfileIcon,
  Search01Icon,
  Cancel01Icon,
  Add01Icon,
  Briefcase01Icon,
  PaintBoardIcon,
  Database01Icon,
  QuillWrite01Icon,
} from "@hugeicons/core-free-icons";

interface Member {
  id: string;
  name: string;
  status: string;
  online: boolean;
  role: string;
  roleType: "pm" | "designer" | "data" | "creator";
  avatar: string;
}

const ALL_MEMBERS: Member[] = [
  {
    id: "01",
    name: "Oliver Smith",
    status: "Online",
    online: true,
    role: "Project Manager",
    roleType: "pm",
    avatar: "https://tapback.co/api/avatar/Oliver.webp",
  },
  {
    id: "02",
    name: "Sophie Chen",
    status: "17m ago",
    online: false,
    role: "Designer",
    roleType: "designer",
    avatar: "https://tapback.co/api/avatar/Sophie.webp",
  },
  {
    id: "03",
    name: "Noah Wilson",
    status: "29m ago",
    online: false,
    role: "Data Specialist",
    roleType: "data",
    avatar: "https://tapback.co/api/avatar/Noah.webp",
  },
  {
    id: "04",
    name: "Emma Davis",
    status: "48m ago",
    online: false,
    role: "Creator",
    roleType: "creator",
    avatar: "https://tapback.co/api/avatar/Emma.webp",
  },
  {
    id: "05",
    name: "Leo Garcia",
    status: "Online",
    online: true,
    role: "Designer",
    roleType: "designer",
    avatar: "https://tapback.co/api/avatar/Leo.webp",
  },
  {
    id: "06",
    name: "Mia Thompson",
    status: "Online",
    online: true,
    role: "Project Manager",
    roleType: "pm",
    avatar: "https://tapback.co/api/avatar/Mia.webp",
  },
  {
    id: "07",
    name: "Ethan Wright",
    status: "5h ago",
    online: false,
    role: "Data Specialist",
    roleType: "data",
    avatar: "https://tapback.co/api/avatar/Ethan.webp",
  },
];

const ACTIVE_MEMBERS = ALL_MEMBERS.filter((m) => m.online);

const sweepSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
  mass: 0.5,
};

const RoleBadge = ({
  type,
  label,
}: {
  type: Member["roleType"];
  label: string;
}) => {
  const styles = {
    pm: {
      bg: "bg-[#FFFCEB]",
      text: "text-[#856404]",
      border: "border-[#FFEBA5]",
      icon: Briefcase01Icon,
    },
    designer: {
      bg: "bg-[#F0F7FF]",
      text: "text-[#004085]",
      border: "border-[#B8DAFF]",
      icon: PaintBoardIcon,
    },
    data: {
      bg: "bg-[#F3FAF4]",
      text: "text-[#155724]",
      border: "border-[#C3E6CB]",
      icon: Database01Icon,
    },
    creator: {
      bg: "bg-[#FCF5FF]",
      text: "text-[#522785]",
      border: "border-[#E8D1FF]",
      icon: QuillWrite01Icon,
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border} shrink-0`}
    >
      <HugeiconsIcon icon={Icon} size={12} strokeWidth={1.8} />
      <span className="text-xs font-regular tracking-tight uppercase whitespace-nowrap truncate max-w-[60px] sm:max-w-none">
        {label}
      </span>
    </div>
  );
};

const MemberItem = ({ member }: { member: Member }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, x: 10, y: 15, rotate: 1 },
      visible: { opacity: 1, x: 0, y: 0, rotate: 0 },
    }}
    transition={sweepSpring}
    style={{ originX: 1, originY: 1 }}
    className="flex items-center group py-4 first:pt-0 border-b border-border/40 last:border-0"
  >
    <div className="relative mr-4 shrink-0">
      <img
        src={member.avatar}
        alt={member.name}
        className="w-12 h-12 rounded-full ring-2 ring-background shadow-sm grayscale-[0.1] group-hover:grayscale-0 transition-all duration-300"
      />
      {member.online && (
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-semibold text-foreground tracking-tight leading-none mb-1.5 truncate">
        {member.name}
      </h3>
      <div className="flex items-center gap-1.5 opacity-80">
        {member.online && (
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        )}
        <p
          className={`text-sm font-medium leading-none ${
            member.online ? "text-green-600" : "text-muted-foreground"
          }`}
        >
          {member.status}
        </p>
      </div>
    </div>
    <div className=" shrink-0">
      <RoleBadge type={member.roleType} label={member.role} />
    </div>
  </motion.div>
);

export default function StackedList() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAllMembers = useMemo(
    () =>
      ALL_MEMBERS.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.role.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-muted/50 p-6 font-sans not-prose">
      <div className="relative w-full max-w-[440px] pb-6 bg-background rounded-[40px] border border-border flex flex-col overflow-hidden shadow-none">
        <div className="flex flex-col h-full bg-background">
          <div className="p-8 pb-3">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                Active Members
                <span className="text-xs bg-muted px-2 py-1 mt-0.5 rounded-full text-muted-foreground leading-none font-normal">
                  {ACTIVE_MEMBERS.length}
                </span>
              </h2>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-border/50 text-muted-foreground hover:bg-muted/50"
              >
                <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2.5} />
              </Button>
            </div>

            <div className="relative mb-4">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 z-10"
                size={16}
              />
              <Input
                placeholder="Search teammates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-11 pr-4 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-border rounded-2xl text-base text-foreground placeholder:text-muted-foreground/50 transition-all w-full box-border"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-20 custom-scrollbar scroll-visible">
            <motion.div
              initial={false}
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              className="space-y-0.5"
            >
              {ACTIVE_MEMBERS.map((member) => (
                <MemberItem key={`active-${member.id}`} member={member} />
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          layout
          initial={false}
          animate={{
            height: isExpanded ? "calc(100% - 20px)" : "68px",
            width: isExpanded ? "calc(100% - 20px)" : "calc(100% - 40px)",
            bottom: isExpanded ? "10px" : "20px",
            left: isExpanded ? "10px" : "20px",
            borderRadius: isExpanded ? "32px" : "24px",
          }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 30,
            mass: 0.8,
            ease: "easeInOut",
          }}
          className="absolute z-50 overflow-hidden border border-border shadow-none flex flex-col group/bar bg-card"
          style={{ cursor: isExpanded ? "default" : "pointer" }}
          onClick={() => !isExpanded && setIsExpanded(true)}
        >
          <div
            className={`flex items-center justify-between px-3 h-[68px] shrink-0 transition-colors ${
              isExpanded ? "border-b border-border/40" : "hover:bg-muted/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-transform group-hover/bar:scale-105`}
              >
                <HugeiconsIcon icon={ProfileIcon} size={20} strokeWidth={2} />
              </div>
              <motion.div layout="position">
                <h4 className="text-base font-medium text-foreground tracking-tight leading-none  ">
                  Member Directory
                </h4>
                <p className="text-xs font-regular leading-none text-muted-foreground  mt-1">
                  8 Members Registered
                </p>
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              {!isExpanded && (
                <div className="flex items-center gap-0">
                  <div className="flex -space-x-3">
                    {ALL_MEMBERS.slice(0, 3).map((m) => (
                      <motion.img
                        key={`sum-${m.id}`}
                        layoutId={`avatar-${m.id}`}
                        src={m.avatar}
                        className="w-10 h-10 rounded-full ring-1 ring-background shadow-sm z-1"
                        alt="avatar"
                      />
                    ))}
                    <div className="w-10 h-10 rounded-full ring-1 ring-background bg-muted flex items-center justify-center shadow-sm relative z-0">
                      <span className="text-sm font-regular leading-none text-muted-foreground">
                        +{ALL_MEMBERS.length - 3}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isExpanded && (
                <button
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground transition-all flex items-center justify-center bg-muted/60 active:scale-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={18}
                    strokeWidth={2.5}
                  />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="px-6 py-4"
                >
                  <div className="relative">
                    <HugeiconsIcon
                      icon={Search01Icon}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 z-10"
                      size={15}
                    />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 transition-all w-full box-border pl-10"
                      autoFocus
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar scroll-visible">
              <motion.div
                initial="hidden"
                animate={isExpanded ? "visible" : "hidden"}
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.03, delayChildren: 0.1 },
                  },
                  hidden: {
                    transition: { staggerChildren: 0.02, staggerDirection: -1 },
                  },
                }}
                className="space-y-0.5"
              >
                {filteredAllMembers.map((member) => (
                  <MemberItem key={`list-${member.id}`} member={member} />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
