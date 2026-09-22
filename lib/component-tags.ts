export function normalizeTags(input: unknown): string[] {
  if (!Array.isArray(input) && typeof input !== "string") return [];
  const parts = Array.isArray(input) ? input : input.split(",");
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of parts) {
    if (typeof part !== "string") continue;
    const tag = part.trim().toLowerCase().replace(/\s+/g, " ");
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }
  return tags;
}

export function rankSearchItems<T>(
  items: readonly T[],
  query: string,
  get: (item: T) => { name: string; tags?: readonly string[]; extra?: string },
): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];
  const name: T[] = [];
  const tag: T[] = [];
  const extra: T[] = [];
  for (const item of items) {
    const fields = get(item);
    if (fields.name.toLowerCase().includes(needle)) {
      name.push(item);
      continue;
    }
    if (normalizeTags(fields.tags).some((entry) => entry.includes(needle))) {
      tag.push(item);
      continue;
    }
    if (fields.extra?.toLowerCase().includes(needle)) extra.push(item);
  }
  return [...name, ...tag, ...extra];
}
