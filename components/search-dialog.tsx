"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Search01Icon,
  FolderAddIcon,
  FileImportIcon,
  PlusSignCircleIcon,
  ArrowUpRight01Icon,
  File01Icon,
  Heading01Icon,
  TextIcon,
} from "@hugeicons/core-free-icons";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useDocsSearch } from "fumadocs-core/search/client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export default function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { search, setSearch, query } = useDocsSearch({ type: "fetch" });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const onSelect = (url: string) => {
    router.push(url);
    setOpen(false);
  };

  return (
    <>
      <button
        className="inline-flex h-9 w-fit max-sm:max-w-[200px] rounded-md border border-input bg-sidebar px-3 py-2 text-foreground text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:border-ring/50"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="flex grow items-center min-w-0">
          <HugeiconsIcon
            icon={Search01Icon}
            aria-hidden="true"
            className="-ms-1 me-2 sm:me-3 text-muted-foreground/80 shrink-0"
            size={16}
          />
          <span className="font-normal text-muted-foreground/70 truncate whitespace-nowrap">
            Search documentation...
          </span>
        </span>
        <kbd className="-me-1 ms-12 hidden sm:inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit]  font-medium  text-muted-foreground/70 gap-1.5">
          <span className="pt-0.5 text-[0.625rem]">⌘</span>{" "}
          <span className="leading-0 text-xs">K</span>
        </kbd>
      </button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {search === "" && (
            <>
              {/* <CommandGroup heading="Quick start">
                <CommandItem onSelect={() => console.log("New folder")}>
                  <HugeiconsIcon
                    icon={FolderAddIcon}
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>New folder</span>
                  <CommandShortcut className="justify-center">
                    ⌘N
                  </CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => console.log("Import document")}>
                  <HugeiconsIcon
                    icon={FileImportIcon}
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>Import document</span>
                  <CommandShortcut className="justify-center">
                    ⌘I
                  </CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => console.log("Add block")}>
                  <HugeiconsIcon
                    icon={PlusSignCircleIcon}
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>Add block</span>
                  <CommandShortcut className="justify-center">
                    ⌘B
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Navigation">
                <CommandItem onSelect={() => onSelect("/docs")}>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>Go to dashboard</span>
                </CommandItem>
                <CommandItem onSelect={() => onSelect("/docs")}>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>Go to apps</span>
                </CommandItem>
                <CommandItem onSelect={() => onSelect("/docs")}>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>Go to connections</span>
                </CommandItem>
              </CommandGroup> */}
            </>
          )}

          {search !== "" && query.data !== "empty" && query.data && (
            <CommandGroup heading="Documentation">
              {query.data.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => onSelect(item.url)}
                  value={item.id}
                >
                  <HugeiconsIcon
                    icon={
                      item.type === "page"
                        ? File01Icon
                        : item.type === "heading"
                          ? Heading01Icon
                          : TextIcon
                    }
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <div className="flex flex-col">
                    <span>{item.content}</span>
                    {item.type !== "page" && (
                      <span className="text-xs text-muted-foreground">
                        {item.breadcrumbs
                          ? item.breadcrumbs.join(" > ")
                          : item.url}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
