"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "./ui/button";
import Image from "next/image";

const footerLinks = {
  library: [
    { name: "Components", href: "/docs/components/3d-book", badge: "NEW" },
    { name: "Documentation", href: "/docs/introduction" },
    { name: "Star on GitHub", href: "https://github.com/iurvish/uselayouts" },
  ],
};

const Footer = () => {
  return (
    <footer className="w-full bg-background border-t border-border/40">
      <div className="relative overflow-hidden py-28 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight text-foreground mb-10">
            An interaction library <br />
            <span className="text-muted-foreground">your users will love</span>
          </h2>

          <Link href="/docs/components/3d-book">
            <Button
              size="lg"
              className="rounded-full px-10 h-14 text-lg gap-2 group shadow-xl shadow-primary/10 cursor-pointer"
            >
              Browse Components
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-24 border-t border-border/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-8 space-y-6">
            <Link href="/" className="block">
              <Image
                src="/logomark.svg"
                alt="logo"
                width={184}
                height={33}
                className="pointer-events-none select-none"
              />
            </Link>
            <p className="text-muted-foreground text-lg  lg:text-lg md:text-xl max-w-sm leading-relaxed">
              Premium motion components for Shadcn UI. <br />
              Bring your interfaces to life with ease.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-6">
                Library
              </h4>
              <ul className="space-y-4">
                {footerLinks.library.map((link) => (
                  <li key={link.name} className="flex items-center gap-2">
                    <Link
                      href={link.href}
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                    {link.badge && (
                      <span className="text-[10px] font-bold bg-primary px-1.5 py-0.5 rounded text-primary-foreground leading-none">
                        {link.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-10 border-t border-border/40 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center text-sm sm:text-base text-muted-foreground transition-colors whitespace-nowrap">
            <span>&copy; {new Date().getFullYear()} uselayouts.com </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-muted-foreground transition-colors whitespace-nowrap">
            <span className=" xs:inline">Built by</span>
            <Link
              href="https://twitter.com/0xUrvish"
              target="_blank"
              className="font-semibold text-foreground hover:text-primary transition-colors hover:underline"
            >
              @0xUrvish
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
