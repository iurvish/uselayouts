"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Cancel01Icon,
  ClosedCaptionAltFreeIcons,
  Menu01FreeIcons,
  Menu11Icon,
  GithubIcon,
  StarIcon,
  NewTwitterRectangleIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import GithubStarButton from "./github-button";

const menuItems = [
  { name: "Components", href: "/docs/components/3d-book" },
  { name: "Documentation", href: "/docs/introduction" },
  { name: "Meet Creator", href: "https://urvishh.me" },
];

const Header = () => {
  const [menuState, setMenuState] = useState(false);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="group sticky top-0 z-50 w-full  bg-transparent  overflow-x-hidden"
      >
        <div className="m-auto w-full px-4 md:px-8 lg:px-12 xl:px-20 max-sm:px-2">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2 "
              >
                {/* <span className="text-xl font-bold tracking-tight text-zinc-900">
                  uselayouts
                </span> */}

                <Image
                  src="/logomark.svg"
                  alt="logo"
                  width={184}
                  height={33}
                  className="pointer-events-none select-none"
                />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 block cursor-pointer p-2.5 lg:hidden text-foreground transition-all duration-700"
              >
                <HugeiconsIcon
                  icon={Menu11Icon}
                  className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200"
                />
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200"
                />
              </button>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-muted/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:pr-4">
                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                <GithubStarButton />

                <Link
                  href="https://twitter.com/0xUrvish"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="icon"
                    variant={"secondary"}
                    className="rounded-md p-1 cursor-pointer"
                  >
                    <HugeiconsIcon icon={NewTwitterIcon} className="size-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
