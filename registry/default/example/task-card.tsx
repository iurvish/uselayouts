"use client";

import { useEffect, useId, useState } from "react";
import { motion, AnimatePresence, LayoutGroup, MotionConfig, useReducedMotion } from "motion/react";
import { Flag, Hourglass, ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================
// TYPES & DEFAULTS
// ==========================================
export type Task = { title: string; done?: boolean };
export type Assignee = { name: string; avatar?: string };

export const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
export const STATUSES = ["Todo", "In Progress", "In Review", "Done"] as const;
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface TaskCardProps {
  title?: string;
  tasks?: Task[];
  priority?: Priority;
  status?: Status;
  /** `avatar` is an image URL; initials are shown when it's missing. */
  assignees?: Assignee[];
  /** Called whenever the user changes something. */
  onChange?: (card: { tasks: Task[]; priority: Priority; status: Status }) => void;
  /** Auto-plays progress until the user interacts. Handy for previews. */
  demo?: boolean;
  className?: string;
}

const DEFAULT_TASKS: Task[] = [
  { title: "Design Tokens" },
  { title: "Color System" },
  { title: "Type System" },
  { title: "Documentation" },
];

const DEFAULT_ASSIGNEES: Assignee[] = [{ name: "Urvish" }, { name: "Dhruv" }];

const spring = { type: "spring", stiffness: 300, damping: 28, mass: 0.85 } as const;
const easeOut = [0.16, 1, 0.3, 1] as const;

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background";

// ==========================================
// SMALL PIECES
// ==========================================
// Turns one flat (60°) per finished task — the nut "tightens" as work lands
function NutIcon({ turns }: { turns: number }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
      aria-hidden
      initial={false}
      animate={{ rotate: turns * 60 }}
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
    >
      <path d="M12 2.75L20.25 7.5V16.5L12 21.25L3.75 16.5V7.5L12 2.75Z" />
      <circle cx="12" cy="12" r="3.25" />
    </motion.svg>
  );
}

function Avatar({ person, className }: { person: Assignee; className?: string }) {
  if (person.avatar) {
    return <img src={person.avatar} alt="" className={cn("rounded-full border border-border object-cover", className)} />;
  }
  const initials = person.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-full border border-border bg-muted text-[9px] font-semibold text-muted-foreground",
        className
      )}
    >
      {initials}
    </span>
  );
}

// One segment per task, so the bar reads as steps
function ProgressBar({ done, total, className }: { done: number; total: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={`${done} of ${total} tasks done`}
      className={cn("flex gap-[3px]", className)}
    >
      {Array.from({ length: Math.max(total, 1) }).map((_, i) => (
        <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: i < done ? "100%" : "0%" }}
            transition={spring}
          />
        </div>
      ))}
    </div>
  );
}

function Checkbox({ checked, isNext }: { checked: boolean; isNext: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <span
      className={cn(
        "relative z-10 flex size-[19px] shrink-0 items-center justify-center rounded-full transition-colors",
        checked ? "bg-primary text-primary-foreground" : "bg-card",
        !checked && !isNext && "border-[1.5px] border-muted-foreground/40"
      )}
    >
      {/* Slow dashed ring marks the task that's up next */}
      {isNext && !checked && (
        <motion.svg
          viewBox="0 0 19 19"
          className="absolute inset-0 text-foreground/70"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
        >
          <circle cx="9.5" cy="9.5" r="8.75" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.6 2.6" />
        </motion.svg>
      )}
      <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
        <motion.path
          d="M2.5 7.2L5.5 10.2L11.5 3.8"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.28, ease: easeOut }}
        />
      </svg>
    </span>
  );
}

// A styled native <select>: keyboard and screen-reader support for free
function PillSelect<T extends string>({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  layoutId,
}: {
  layoutId: string;
  label: string;
  icon: typeof Flag;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label
      onClick={(e) => e.stopPropagation()} // using the dropdown shouldn't close the card
      className="flex cursor-default items-center justify-between text-[14px] font-medium text-muted-foreground"
    >
      <span className="flex items-center gap-2">
        <Icon size={16} className="opacity-70" aria-hidden />
        {label}
      </span>
      <motion.span layoutId={layoutId} transition={spring} className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className={cn(
            "cursor-pointer appearance-none rounded-lg border border-border bg-secondary py-0.5 pl-2.5 pr-7 text-[12.5px] font-semibold text-secondary-foreground transition-colors hover:bg-accent",
            focusRing
          )}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-secondary-foreground"
        />
      </motion.span>
    </label>
  );
}

// ==========================================
// TASK CARD
// ==========================================
export default function TaskCard({
  title = "Design System",
  tasks: initialTasks = DEFAULT_TASKS,
  priority: initialPriority = "Urgent",
  status: initialStatus = "In Progress",
  assignees = DEFAULT_ASSIGNEES,
  onChange,
  demo = false,
  className,
}: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [userTookOver, setUserTookOver] = useState(false);
  const groupId = useId(); // keeps layoutIds unique when several cards share a page
  const reduceMotion = useReducedMotion();

  const doneCount = tasks.filter((task) => task.done).length;
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const nextIndex = tasks.findIndex((task) => !task.done);

  // Status follows the checklist: all done → "Done", un-tick one → back to "In Progress"
  const statusFor = (nextTasks: Task[]): Status => {
    const allDone = nextTasks.length > 0 && nextTasks.every((task) => task.done);
    if (allDone) return "Done";
    return status === "Done" ? "In Progress" : status;
  };

  // Single place where user changes land, so `onChange` always gets the full picture
  const update = (changes: { tasks?: Task[]; priority?: Priority; status?: Status }) => {
    const next = {
      tasks: changes.tasks ?? tasks,
      priority: changes.priority ?? priority,
      status: changes.status ?? (changes.tasks ? statusFor(changes.tasks) : status),
    };
    setUserTookOver(true);
    setTasks(next.tasks);
    setPriority(next.priority);
    setStatus(next.status);
    onChange?.(next);
  };

  const toggleTask = (index: number) =>
    update({ tasks: tasks.map((task, i) => (i === index ? { ...task, done: !task.done } : task)) });

  // Demo: tick one task every ~1s, pause when all done, then start over
  useEffect(() => {
    if (!demo || userTookOver || reduceMotion) return;
    const allDone = nextIndex === -1;
    const timer = setTimeout(
      () => {
        const next = allDone
          ? tasks.map((task) => ({ ...task, done: false }))
          : tasks.map((task, i) => (i === nextIndex ? { ...task, done: true } : task));
        setTasks(next);
        setStatus(statusFor(next));
      },
      allDone ? 2200 : 1150
    );
    return () => clearTimeout(timer);
  });

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <LayoutGroup id={groupId}>
        <motion.div
          layout
          style={{ borderRadius: isOpen ? 26 : 20 }}
          // Click anywhere on the card to open or close it
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          className={cn(
            "relative w-full cursor-pointer select-none overflow-hidden border border-border bg-card text-card-foreground shadow-[0_1px_2px_rgba(0,0,0,0.03),0_6px_20px_-4px_rgba(0,0,0,0.05)]",
            isOpen ? "max-w-[390px] p-5 sm:p-6" : "max-w-[410px] px-4 py-3.5 sm:px-5",
            className
          )}
        >
          {/* HEADER */}
          <motion.div layout="position" className="flex items-center justify-between gap-3">
            <h3 className="min-w-0">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
                className={cn("flex min-w-0 max-w-full cursor-pointer items-center gap-3 rounded-xl text-left", focusRing)}
              >
                <motion.span
                  layout="position"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 text-foreground/80"
                >
                  <NutIcon turns={doneCount} />
                </motion.span>
                {/* `layout` lets the title grow/shrink smoothly instead of snapping between sizes */}
                <motion.span
                  layout
                  className={cn(
                    "min-w-0 origin-left truncate tracking-tight text-foreground",
                    isOpen ? "text-[19px] font-bold sm:text-[21px]" : "text-[16px] font-semibold"
                  )}
                >
                  {title}
                </motion.span>
              </button>
            </h3>

            {!isOpen && (
              <div className="flex shrink-0 items-center gap-2.5">
                <motion.div layoutId="progress" className="w-14 sm:w-20">
                  <ProgressBar done={doneCount} total={tasks.length} />
                </motion.div>
                <motion.span
                  layoutId="percent"
                  className="min-w-[34px] text-right text-[13px] font-semibold tabular-nums text-muted-foreground"
                >
                  {percent}%
                </motion.span>
              </div>
            )}
          </motion.div>

          {/* BODY — popLayout pops the outgoing state out of the flow so nothing gets pushed around */}
          <AnimatePresence mode="popLayout" initial={false}>
            {isOpen ? (
              <motion.div
                key="open"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                className="mt-4 space-y-3.5"
              >
                {/* Summary */}
                <div className="flex items-center gap-3 rounded-full border border-border bg-muted/30 px-3 py-1.5">
                  <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold tabular-nums text-foreground">
                    <CheckCircle2 size={15} className="text-muted-foreground" aria-hidden />
                    {doneCount} of {tasks.length}
                  </span>
                  <motion.div layoutId="progress" className="flex-1">
                    <ProgressBar done={doneCount} total={tasks.length} />
                  </motion.div>
                  <motion.span
                    layoutId="percent"
                    className="min-w-[34px] text-right text-[13px] font-semibold tabular-nums text-muted-foreground"
                  >
                    {percent}%
                  </motion.span>
                </div>

                {/* Checklist with a spine that fills in as tasks are finished */}
                <ul className="space-y-3 py-1 pl-5">
                  {tasks.map((task, i) => {
                    const done = Boolean(task.done);
                    const isLast = i === tasks.length - 1;
                    const lineTop = i === 0 ? -4 : -12; // reach up into the gap above the row
                    const lineAboveLit = done && (i === 0 || Boolean(tasks[i - 1].done));
                    const lineBelowLit = done && !isLast && Boolean(tasks[i + 1].done);

                    return (
                      <li key={i} className="relative">
                        {/* Grey spine */}
                        <span
                          aria-hidden
                          className="absolute -left-[2px] w-px bg-border"
                          style={{ top: lineTop, bottom: isLast ? "50%" : 0 }}
                        />
                        {/* Dark trail, above and below this row */}
                        <motion.span
                          aria-hidden
                          className="absolute -left-[2px] w-px origin-top bg-primary"
                          style={{ top: lineTop, bottom: "50%" }}
                          initial={false}
                          animate={{ scaleY: lineAboveLit ? 1 : 0 }}
                          transition={{ duration: 0.3, ease: easeOut }}
                        />
                        {!isLast && (
                          <motion.span
                            aria-hidden
                            className="absolute -left-[2px] bottom-0 top-1/2 w-px origin-top bg-primary"
                            initial={false}
                            animate={{ scaleY: lineBelowLit ? 1 : 0 }}
                            transition={{ duration: 0.3, ease: easeOut }}
                          />
                        )}
                        {/* Branch hook */}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute -left-[2px] top-1/2 size-4 -translate-y-1/2 rounded-bl-lg border-b border-l transition-colors",
                            done ? "border-primary" : "border-border"
                          )}
                        />

                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={done}
                          onClick={(e) => {
                            e.stopPropagation(); // ticking a task shouldn't close the card
                            toggleTask(i);
                          }}
                          className={cn("flex cursor-pointer items-center gap-3 rounded-md text-left", focusRing)}
                        >
                          <Checkbox checked={done} isNext={i === nextIndex} />
                          {/* Strike sweeps in line by line, so wrapped titles work too */}
                          <span
                            className={cn(
                              "bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat text-[14.5px] font-medium tracking-tight transition-[color,background-size] duration-300",
                              done ? "text-muted-foreground" : i === nextIndex ? "text-foreground" : "text-foreground/75"
                            )}
                            style={{ backgroundPosition: "0 55%", backgroundSize: done ? "100% 1px" : "0% 1px" }}
                          >
                            {task.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Priority & status — the pills morph out of the closed card's footer */}
                <div className="space-y-2 border-t border-border pt-2">
                  <PillSelect
                    layoutId="priority"
                    label="Priority"
                    icon={Flag}
                    value={priority}
                    options={PRIORITIES}
                    onChange={(p) => update({ priority: p })}
                  />
                  <PillSelect
                    layoutId="status"
                    label="Status"
                    icon={Hourglass}
                    value={status}
                    options={STATUSES}
                    onChange={(s) => update({ status: s })}
                  />
                </div>

                {/* Assignees — each avatar moves from the stacked row into its own pill */}
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {assignees.map((person, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-0.5 pl-0.5 pr-2.5 text-[12.5px] font-medium text-foreground/80"
                    >
                      <motion.span layoutId={`avatar-${i}`} className="flex">
                        <Avatar person={person} className="size-5.5" />
                      </motion.span>
                      {person.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="closed"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                className="mt-2.5 flex items-center justify-between gap-3 text-[13.5px] font-semibold text-foreground/85"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="flex items-center gap-1.5">
                    <Flag size={15} className="text-muted-foreground" aria-label="Priority" />
                    <motion.span layoutId="priority">{priority}</motion.span>
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Hourglass size={15} className="shrink-0 text-muted-foreground" aria-label="Status" />
                    <motion.span layoutId="status" className="truncate">
                      {status}
                    </motion.span>
                  </span>
                </div>
                <div
                  className="flex shrink-0 -space-x-1.5"
                  aria-label={`Assignees: ${assignees.map((p) => p.name).join(", ")}`}
                >
                  {assignees.slice(0, 3).map((person, i) => (
                    <motion.span key={i} layoutId={`avatar-${i}`} className="flex rounded-full ring-2 ring-card">
                      <Avatar person={person} className="size-6.5" />
                    </motion.span>
                  ))}
                  {assignees.length > 3 && (
                    <span className="flex size-6.5 items-center justify-center rounded-full border border-border bg-muted text-[10px] text-muted-foreground ring-2 ring-card">
                      +{assignees.length - 3}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </MotionConfig>
  );
}
