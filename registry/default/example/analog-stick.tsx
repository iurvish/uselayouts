"use client";

import { cn } from "@/lib/utils";

export type DirectionIcon = {
  className: string;
  path: string;
  viewBox: string;
};

const rowClassName = cn(
  "row relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-transparent",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t1:hover)_.button-wrapper]:[transform:translate(0,-5px)_rotateX(8deg)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t1:hover)_.button-wrapper]:[transform-style:preserve-3d]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t1:hover)_.button-wrapper]:![box-shadow:0_7px_14px_rgba(0,0,0,0.5),0_14px_8px_-5px_rgba(0,0,0,0.3),0_24px_8px_rgba(0,0,0,0.4),0_-6px_10px_rgba(255,255,255,0.5),inset_0_3px_3px_rgba(255,255,255,0.6),inset_0_-3px_3px_rgba(89,91,92,0.6)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t1:hover)_.icon-top]:fill-[#eaa75d]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t1:hover)_.icon-top]:[filter:brightness(0.9)_drop-shadow(0_0_2px_#f1b475)_drop-shadow(0_0_1px_#fff)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t2:hover)_.button-wrapper]:[transform:translate(5px,0)_rotateY(8deg)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t2:hover)_.button-wrapper]:[transform-style:preserve-3d]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t2:hover)_.button-wrapper]:![box-shadow:2px_9px_14px_rgba(0,0,0,0.4),2px_19px_8px_-2px_rgba(0,0,0,0.2),2px_30px_8px_rgba(0,0,0,0.3),-6px_-14px_10px_rgba(255,255,255,0.5),inset_0_3px_3px_rgba(255,255,255,0.6),inset_0_-3px_3px_rgba(89,91,92,0.6)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t2:hover)_.icon-right]:fill-[#e3a560]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t2:hover)_.icon-right]:[filter:brightness(0.9)_drop-shadow(0_0_2px_#e3a15b)_drop-shadow(0_0_1px_#fff)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t3:hover)_.button-wrapper]:[transform:translate(-5px,0)_rotateY(-8deg)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t3:hover)_.button-wrapper]:[transform-style:preserve-3d]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t3:hover)_.button-wrapper]:![box-shadow:-2px_9px_14px_rgba(0,0,0,0.4),-2px_19px_8px_-2px_rgba(0,0,0,0.2),-2px_30px_8px_rgba(0,0,0,0.3),6px_-14px_10px_rgba(255,255,255,0.5),inset_0_3px_3px_rgba(255,255,255,0.6),inset_0_-3px_3px_rgba(89,91,92,0.6)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t3:hover)_.icon-left]:fill-[#e3a560]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t3:hover)_.icon-left]:[filter:brightness(0.9)_drop-shadow(0_0_2px_#e3a15b)_drop-shadow(0_0_1px_#fff)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t4:hover)_.button-wrapper]:[transform:translate(0,5px)_rotateX(-8deg)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t4:hover)_.button-wrapper]:[transform-style:preserve-3d]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t4:hover)_.button-wrapper]:![box-shadow:0_5px_14px_rgba(0,0,0,0.6),0_19px_8px_-2px_rgba(0,0,0,0.3),0_34px_8px_rgba(0,0,0,0.4),0_-14px_10px_rgba(255,255,255,0.65),inset_0_3px_3px_rgba(255,255,255,0.6),inset_0_-3px_3px_rgba(89,91,92,0.6)]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t4:hover)_.icon-bottom]:fill-[#e3a560]",
  "[@media(hover:hover)_and_(pointer:fine)]:[&:has(.t4:hover)_.icon-bottom]:[filter:brightness(0.9)_drop-shadow(0_0_2px_#e3a15b)_drop-shadow(0_0_1px_#fff)]",
  "motion-reduce:[&_.button-wrapper]:transition-none",
  "motion-reduce:[&:has(.t1:hover)_.button-wrapper]:![transform:none]",
  "motion-reduce:[&:has(.t2:hover)_.button-wrapper]:![transform:none]",
  "motion-reduce:[&:has(.t3:hover)_.button-wrapper]:![transform:none]",
  "motion-reduce:[&:has(.t4:hover)_.button-wrapper]:![transform:none]"
);

const dotClassName = cn(
  "absolute size-[8px] -translate-x-1/2 -translate-y-1/2 rounded-[50%]",
  "bg-[#e7ecef]",
  "shadow-[0_2px_2px_rgba(0,0,0,0.3),inset_0_-2px_2px_rgba(0,0,0,0.2)]"
);

const iconClassName = cn(
  "icon absolute w-[30px] -translate-x-1/2 -translate-y-1/2",
  "fill-[#b4b9bd]",
  "[filter:drop-shadow(1px_1px_1px_#f4f4f4)]"
);

const touchZoneClassNames = [
  "t t1 size-[150px]",
  "t t2 size-[150px]",
  "t t3 size-[150px]",
  "t t4 size-[150px]",
];

const dotClassNames = [
  "left-1/2 top-[10%]",
  "left-[90%] top-1/2",
  "left-1/2 top-[90%]",
  "left-[10%] top-1/2",
];

const directionIcons: DirectionIcon[] = [
  {
    className: "icon-top left-1/2 top-[8%]",
    viewBox: "0 0 1024 1024",
    path: "M512 330.666667c14.933333 0 29.866667 4.266667 40.533333 14.933333l277.33333399 234.666667c27.733333 23.466667 29.866667 64 8.53333301 89.6-23.466667 27.733333-64 29.866667-89.6 8.53333299L512 477.866667l-236.8 200.53333299c-27.733333 23.466667-68.266667 19.19999999-89.6-8.53333299-23.466667-27.733333-19.19999999-68.266667 8.53333301-89.6l277.33333399-234.666667c10.666667-10.666667 25.6-14.933333 40.533333-14.933333z",
  },
  {
    className: "icon-right left-[92%] top-1/2",
    viewBox: "0 0 200 200",
    path: "M135.417 100C135.417 102.917 134.583 105.833 132.5 107.917L86.6667 162.083C82.0833 167.5 74.1667 167.917 69.1667 163.75C63.75 159.167 63.3333 151.25 67.5 146.25L106.667 100L67.5 53.75C62.9167 48.3333 63.75 40.4167 69.1667 36.25C74.5833 31.6667 82.5 32.5 86.6667 37.9167L132.5 92.0833C134.583 94.1667 135.417 97.0833 135.417 100Z",
  },
  {
    className: "icon-bottom left-1/2 top-[92%]",
    viewBox: "0 0 200 200",
    path: "M100 135.417C97.0833 135.417 94.1667 134.583 92.0833 132.5L37.9167 86.6667C32.5 82.0833 32.0833 74.1667 36.25 69.1667C40.8333 63.75 48.75 63.3333 53.75 67.5L100 106.667L146.25 67.5C151.667 62.9167 159.583 63.75 163.75 69.1667C168.333 74.5833 167.5 82.5 162.083 86.6667L107.917 132.5C105.833 134.583 102.917 135.417 100 135.417Z",
  },
  {
    className: "icon-left left-[8%] top-1/2",
    viewBox: "0 0 200 200",
    path: "M64.5833 100C64.5833 97.0833 65.4167 94.1667 67.5 92.0833L113.333 37.9167C117.917 32.5 125.833 32.0833 130.833 36.25C136.25 40.8333 136.667 48.75 132.5 53.75L93.3333 100L132.5 146.25C137.083 151.667 136.25 159.583 130.833 163.75C125.417 168.333 117.5 167.5 113.333 162.083L67.5 107.917C65.4167 105.833 64.5833 102.917 64.5833 100Z",
  },
];

export const AnalogStick = () => {
  return (
    <section
      aria-label="Directional pressure button demo"
      className={rowClassName}
    >
      <div
        aria-hidden="true"
        className="touch absolute z-10 flex size-[300px] rotate-45 flex-wrap"
      >
        {touchZoneClassNames.map((className) => (
          <div className={className} key={className} />
        ))}
      </div>

      <div className="relative z-0 flex size-[300px] items-center justify-center">
        <div className="around flex size-50 items-center justify-center rounded-[50%] bg-[linear-gradient(0deg,#f5f8fa,#9da4a8)]">
          <div className="handle flex size-[155px] items-center justify-center rounded-[50%] bg-[#c5d1da] shadow-[0_0_10px_rgba(0,0,0,0.5),0_10px_10px_rgba(0,0,0,0.2),inset_0_0_16px_rgba(0,0,0,0.85),inset_0_0_24px_rgba(0,0,0,0.75),inset_0_0_48px_rgba(0,0,0,0.2)] perspective-near">
            <div className="button-wrapper flex size-25.5 items-center justify-center rounded-[50%] bg-[linear-gradient(0deg,#86969c,#eff1f1)] shadow-[0_9px_14px_rgba(0,0,0,0.5),0_19px_8px_-2px_rgba(0,0,0,0.2),0_33px_8px_rgba(0,0,0,0.4),0_-12px_10px_rgba(255,255,255,0.5),inset_0_3px_3px_rgba(255,255,255,0.6),inset_0_-3px_3px_rgba(89,91,92,0.6)] transition-[transform,box-shadow] duration-[250ms] ease-out motion-reduce:transition-none">
              <div className="inside relative size-[85px] rounded-[50%] bg-[linear-gradient(180deg,#adb9bf,#d4dbdd)] shadow-[inset_0_3px_6px_rgba(152,160,163,0.4),inset_0_-3px_6px_rgba(238,244,246,0.4)]">
                {dotClassNames.map((className) => (
                  <div className={cn(dotClassName, className)} key={className} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {directionIcons.map(({ className, path, viewBox }) => (
          <svg
            aria-hidden="true"
            className={cn(iconClassName, className)}
            focusable="false"
            key={className}
            viewBox={viewBox}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={path} />
          </svg>
        ))}
      </div>
    </section>
  );
};

export default AnalogStick;
