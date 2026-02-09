"use client";

import Image from "next/image";
import Bucket from "./bucket";
import Link from "next/link";
import { Button } from "./ui/button";
import Header from "./header";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useMotionTemplate,
} from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";

const Hero = () => {
  const { scrollY } = useScroll();
  const { isMobile } = useIsMobile();

  const insetVal = useTransform(scrollY, [0, 300], isMobile ? [8, 0] : [14, 0]);
  const bottomInsetVal = useTransform(
    scrollY,
    [0, 300],
    isMobile ? [0, 0] : [16, 0]
  );
  const radius = useTransform(scrollY, [0, 300], isMobile ? [24, 0] : [32, 0]);

  const clipPathSpec = useMotionTemplate`inset(0px ${insetVal}px ${bottomInsetVal}px ${insetVal}px round ${radius}px)`;

  return (
    <>
      <Header />
      <motion.section
        style={{
          clipPath: clipPathSpec,
          transform: "translateZ(0)",
        }}
        className="relative border min-h-[calc(100svh-4rem)] overflow-hidden bg-background py-8 md:py-16 lg:py-24 flex flex-col will-change-transform squircle"
      >
        <div className="absolute inset-0 z-0 ">
          <Image
            src="https://raw.githubusercontent.com/iurvish/uselayouts/refs/heads/main/public/background.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 w-full px-4 md:px-8 lg:pl-12 lg:pr-0 xl:pl-20 xl:pr-14 flex-1 flex flex-col justify-center  max-sm:px-2">
          <div className="flex flex-col justify-center gap-auto flex-1 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center max-sm:gap-12">
            <div className="flex-1 flex flex-col gap-4 items-start justify-center max-lg:items-center max-lg:text-center text-left max-lg:w-full  max-sm:justify-end ">
              <div className="">
                <h1 className=" tracking-tighter text-balance text-4xl font-medium md:text-5xl lg:text-6xl text-foreground ">
                  A micro-interaction UI library for professionals.
                </h1>
                <p className="mt-3 text-pretty text-lg max-lg:text-center max-md:text-md leading-tight text-shadow-2xs text-foreground/50 max-sm:px-2">
                  People don’t fall in love with components. They fall in love
                  with how something feels.
                </p>
              </div>

              <div className="mt-4 flex  items-center justify-center gap-2  lg:justify-start">
                <Button size="lg" className="px-5 text-base rounded-full">
                  <Link href="/docs/introduction">
                    <span className="text-nowrap">Get Started</span>
                  </Link>
                </Button>
                <Button
                  key={2}
                  size="lg"
                  variant="secondary"
                  className="px-5 text-base rounded-full "
                >
                  <Link
                    href="https://github.com/iurvish/uselayouts"
                    className="flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={GithubIcon} />
                    <span className="text-nowrap">Github</span>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex-1  flex justify-end items-end lg:justify-end w-full h-full max-lg:items-center max-lg:justify-center max-md:pb-2 max-md:landscape:hidden h-full md:justify-center md:items-center lg:items-end max-sm:justify-end max-sm:items-end">
              <div className="w-full max-w-[600px] lg:max-w-none">
                <Bucket />
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
};

export default Hero;
