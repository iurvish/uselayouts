"use client";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";
import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";

const reviews = [
  {
    name: "Rob Austin",
    bio: "Founder of shadcnblocks",
    body: "Looks amazing 🤩",
    img: "https://pbs.twimg.com/profile_images/1902211854476439552/CTVSPPo1_400x400.jpg",
  },
  {
    name: "Harman",
    bio: "Founder of shadcn-form",
    body: "First 🏅 level discovery of 2026",
    img: "https://pbs.twimg.com/profile_images/1972611039066791936/cwvQHJ0S_400x400.jpg",
  },
  {
    name: "Lucian Devluc",
    bio: "Creator of htmlrev",
    body: "Great work Urvish. Congratulations. I've added uselayouts to htmlrev 👏",
    img: "https://pbs.twimg.com/profile_images/1179462746414432257/HBkrOkaX_400x400.jpg",
  },
  {
    name: "Punit singh bisht",
    bio: "Founder of note creator",
    body: "Smooooth. So good! Just thought of a few places where I can use something like this!",
    img: "https://pbs.twimg.com/profile_images/1754514553503887360/sFqjE3AQ_400x400.jpg",
  },
  {
    name: "Frederik",
    bio: "Create worlds with code",
    body: "That's so sick. \n Every single component hits perfectly. It feels like a master chef put it together with high attention to detail.",
    img: "https://pbs.twimg.com/profile_images/1649670410848333825/yNqgk-ys_400x400.jpg",
  },
  {
    name: "Bilal Bakr",
    bio: "Co-founder of Calendaty",
    body: "Wow looks sickkkk \n Gotta give it a shot",
    img: "https://pbs.twimg.com/profile_images/1965065977436991488/f9FD6oer_400x400.jpg",
  },
  {
    name: "Kushal",
    bio: "25 | Building things",
    body: "Bro, really appreciate your efforts in making the product first, then this great visual hook video and all you are giving away for free. Hats off dude.",
    img: "https://pbs.twimg.com/profile_images/1996490150264889344/KA5Wr5i3_400x400.jpg",
  },
  {
    name: "Patel Meet",
    bio: "web dev | ai & tech enthusiast",
    body: "congrats on shipping it!!! interacted with all the components and it feels smooth throughout. keep building and adding more...",
    img: "https://pbs.twimg.com/profile_images/1451865652457717764/xpBuUbkB_400x400.jpg",
  },
  {
    name: "Zion",
    bio: "akingonzion",
    body: "These are actually amazing💥, definitely using some of these in a project of mine.",
    img: "https://pbs.twimg.com/profile_images/2006752020804354048/0w4PqgY9_400x400.jpg",
  },
  {
    name: "Gurbinder",
    bio: "Founder of Evilcharts ",
    body: "soo damn cool",
    img: "https://pbs.twimg.com/profile_images/1924504051728670720/mqyGd02m_400x400.jpg",
  },
  {
    name: "Dev",
    bio: "Building flowset",
    body: "Damm! Thant's some premium stuff \n Thanks man 💪🏼",
    img: "https://pbs.twimg.com/profile_images/1847198803218071552/Y5ih3vmW_400x400.jpg",
  },
  {
    name: "Tilak Raj Singh  ",
    bio: "Frontend & UI/UX enthusiast",
    body: "Great work Bro . And thanks for keeping it open source .",
    img: "https://pbs.twimg.com/profile_images/2002983266513780736/gwRnmlXg_400x400.jpg",
  },
  {
    name: "Samarth Adsare",
    bio: "Developer",
    body: "It's really sick 🔥, i really liked the animations and i personally think that I'll be using \n mutli-step form more in my projects for user registration",
    img: "https://pbs.twimg.com/profile_images/1860297180722143232/n_knNBFy_400x400.jpg",
  },
  {
    name: "Alazar Tesema",
    bio: "Full-stack React Dev",
    body: "I saw all of them in detail and all are smooth🔥",
    img: "https://pbs.twimg.com/profile_images/1978915706285576192/DHDAvdLj_400x400.jpg",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  bio,
  body,
}: {
  img: string;
  name: string;
  bio: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-72 sm:w-[350px] cursor-pointer overflow-hidden rounded-2xl border p-4 sm:p-6 transition-all duration-300",
        "border-border bg-background/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/10 hover:shadow-md group"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full ring-1 ring-border group-hover:ring-primary/20 transition-all">
          <Image
            className="object-cover"
            fill
            sizes="(max-width: 640px) 36px, 40px"
            alt={name}
            src={img}
          />
        </div>
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-foreground tracking-tight">
            {name}
          </figcaption>
          <p className="text-xs sm:text-sm font-normal text-muted-foreground/80">
            {bio}
          </p>
        </div>
      </div>
      <blockquote className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors whitespace-pre-wrap">
        {body}
      </blockquote>
    </figure>
  );
};

export function Testimonial() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="w-full py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto items-center justify-center flex flex-col">
        <div className="mb-12  sm:mb-20 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Wall of{" "}
            <motion.span
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="relative cursor-default inline-flex items-center gap-2 px-4 py-1 rounded-2xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 hover:border-primary/20 transition-colors duration-300"
            >
              Love
              <motion.span
                animate={
                  isHovered
                    ? {
                        scale: [1, 1.1, 1],
                      }
                    : { scale: 1 }
                }
                transition={{
                  duration: 0.7,
                  repeat: isHovered ? Infinity : 0,
                  ease: "easeInOut",
                }}
                className="inline-block"
              >
                💖
              </motion.span>
            </motion.span>
          </h2>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:40s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.name + review.bio} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:40s] mt-4">
            {secondRow.map((review) => (
              <ReviewCard key={review.name + review.bio} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-background to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-background to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
