"use client";
import { motion, MotionConfig } from "motion/react";
// import { FilterKey } from "../constants";
import { Dispatch, SetStateAction, useState } from "react";
import clsx from "clsx";

import {
  Appointment01Icon,
  BalloonsIcon,
  GoogleMapsIcon,
  ZoomIcon,
  ReminderIcon,
  TaskDaily01Icon,
  Tick02Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsFreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type FilterKey = (typeof filterKeys)[number];

export const filterKeys = [
  {
    name: "tasks",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={TaskDaily01Icon} size={size} />
    ),
  },
  {
    name: "events",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={GoogleMapsIcon} size={size} />
    ),
  },
  {
    name: "reminders",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={ReminderIcon} size={size} />
    ),
  },
  {
    name: "appointments",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={Appointment01Icon} size={size} />
    ),
  },
  {
    name: "meetings",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={ZoomIcon} size={size} />
    ),
  },
  {
    name: "celebrations",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={BalloonsIcon} size={size} />
    ),
  },
];

function ListItem(props: {
  index: number;
  filterKey: FilterKey;
  selectedFilterKey: FilterKey;
  setSelectedFilterKey: Dispatch<SetStateAction<FilterKey>>;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    index,
    filterKey,
    selectedFilterKey,
    setSelectedFilterKey,
    setIsOpened,
  } = props;
  const delay = (index + 8) * 0.025;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.1, duration: 0.65, delay }}
      onClick={() => {
        setSelectedFilterKey(filterKey);

        setTimeout(() => {
          setIsOpened(false);
        }, 150);
      }}
      className="px-3 py-2 rounded-lg flex justify-between items-center cursor-default hover:bg-accent text-foreground"
    >
      <div className="flex items-center gap-x-3">
        <span>
          <filterKey.Icon size={24} />
        </span>
        <span className="capitalize">{filterKey.name}</span>
      </div>
      <div
        className={clsx(
          "relative border-border w-6 h-6 overflow-hidden rounded-full",
          selectedFilterKey.name == filterKey.name
            ? "border-none"
            : "border-[2px]"
        )}
      >
        {selectedFilterKey.name == filterKey.name && (
          <div className="absolute inset-0 bg-primary flex justify-center items-center text-primary-foreground">
            <HugeiconsIcon icon={Tick02Icon} size={16} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

const FilterInteraction = () => {
  const [selectedFilterKey, setSelectedFilterKey] = useState(filterKeys[0]);
  const [isOpened, setIsOpened] = useState(false);

  return (
    <section className="flex justify-center items-center fill-muted-foreground/70">
      <MotionConfig
        transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
      >
        <div
          onClick={() => setIsOpened(true)}
          className="relative left-2.5 w-20 h-20 flex justify-center items-center"
        >
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            className="text-foreground relative z-10 fill-none"
            size={36}
          />
          <motion.div
            layoutId="wrapper"
            className="absolute inset-0 z-[2] bg-background border-border"
            style={{ borderRadius: 40, borderWidth: 1 }}
          />
        </div>
        <motion.div
          initial={{ x: 0 }}
          animate={{
            x: isOpened ? -20 : 0,
            // transition: { delay: isOpened ? 0 : 0.2 },
          }}
          transition={{ type: "spring", bounce: 0.3, duration: 1.5 }}
          className="relative right-2.5 w-20 h-20 border border-border rounded-full flex justify-center items-center bg-background text-foreground"
        >
          <selectedFilterKey.Icon size={36} />
        </motion.div>

        {isOpened && (
          <motion.section
            layoutId="wrapper"
            className="absolute z-20 w-72 px-1 py-2 bg-card border border-border text-xl overflow-hidden"
            style={{ borderRadius: 20, borderWidth: 1 }}
          >
            {filterKeys.map((item, index) => (
              <ListItem
                key={item.name}
                index={index}
                filterKey={item}
                selectedFilterKey={selectedFilterKey}
                setSelectedFilterKey={setSelectedFilterKey}
                setIsOpened={setIsOpened}
              />
            ))}
          </motion.section>
        )}
      </MotionConfig>
    </section>
  );
};

export default FilterInteraction;
