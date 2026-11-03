/**
 * Records when each component first landed, from git.
 *
 * The result is committed as `registry/default/component-dates.json` rather
 * than read from git at build time: a shallow CI clone has no history to walk,
 * and the dates of components already shipped never change. Re-run this after
 * adding components — entries already on file are kept even if their example
 * is later renamed, so a rename cannot silently reset a date and make an old
 * component look new.
 */
import { promises as fs } from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const run = promisify(execFile);
const OUT = path.join(process.cwd(), "registry/default/component-dates.json");

const registry = JSON.parse(
  await fs.readFile(path.join(process.cwd(), "registry.json"), "utf8"),
);

let existing: Record<string, string> = {};
try {
  existing = JSON.parse(await fs.readFile(OUT, "utf8"));
} catch {
  existing = {};
}

/** The example file's own mtime, for a component git has nothing to say about. */
async function mtimeOf(slug: string) {
  try {
    const stat = await fs.stat(
      path.join(process.cwd(), `registry/default/example/${slug}.tsx`),
    );
    return stat.mtime.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

/** First commit that added the component's example file, as YYYY-MM-DD. */
async function addedAt(slug: string) {
  const file = `registry/default/example/${slug}.tsx`;
  try {
    const { stdout } = await run("git", [
      "log",
      "--diff-filter=A",
      "--format=%as",
      "-1",
      "--",
      file,
    ]);
    return stdout.trim();
  } catch {
    return "";
  }
}

const dates: Record<string, string> = {};
let added = 0;

for (const item of registry.items as { name: string }[]) {
  const slug = item.name;
  // Git first, then whatever is already on file, then the file's mtime. The
  // mtime only ever applies to a component git cannot date and that has no
  // recorded date — i.e. one just added — and dating that from the working
  // copy is right. Every component already on file keeps its date, so a
  // shallow CI clone with no history cannot reset the catalogue to "new".
  const date = (await addedAt(slug)) || existing[slug] || (await mtimeOf(slug));
  if (!date) {
    console.warn(`  ! no add date for ${slug} — it will rank as undated`);
    continue;
  }
  if (!existing[slug]) added += 1;
  dates[slug] = date;
}

// Keep dates for slugs no longer in the registry out of the file, but never
// drop one that is still listed just because git went quiet about it.
const sorted = Object.fromEntries(
  Object.entries(dates).sort(([a], [b]) => a.localeCompare(b)),
);

await fs.writeFile(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(
  `🗓️  component-dates.json: ${Object.keys(sorted).length} components (${added} new)`,
);
