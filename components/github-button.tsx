"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import NumberFlow from "@number-flow/react";

const GithubStarButton = () => {
  const [starCount, setStarCount] = useState<number>(74);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("https://api.github.com/repos/iurvish/uselayouts")
        .then((res) => res.json())
        .then((data) => {
          if (data.stargazers_count !== undefined) {
            setStarCount(data.stargazers_count);
          }
        })
        .catch((err) => console.error("Error fetching stars:", err));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Link
      href="https://github.com/iurvish/uselayouts"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center"
    >
      <ButtonGroup aria-label="Github Stars" className="items-center">
        <Button
          variant="outline"
          size="default"
          className="px-3 gap-2 font-medium text-zinc-900 group-hover:bg-muted/50 transition-colors h-8 flex items-center justify-center"
        >
          <HugeiconsIcon
            icon={StarIcon}
            className="size-4 text-zinc-400 fill-zinc-400 transition-all duration-300 group-hover:text-[#FFD700] group-hover:fill-[#FFD700] group-hover:drop-shadow-[0_0_8px_rgba(255,215,0,0.3)] group-hover:scale-110"
          />
          <span className="relative ">Star</span>
        </Button>
        <Button
          variant="outline"
          size="default"
          className="px-3 font-medium text-muted-foreground group-hover:bg-muted/50 transition-colors tabular-nums h-8 flex items-center justify-center"
        >
          <NumberFlow value={starCount} />
        </Button>
      </ButtonGroup>
    </Link>
  );
};

export default GithubStarButton;
