export function detectDependencies(code: string): string[] {
  const found = new Set<string>();
  const importRe =
    /import\s+(?:type\s+)?(?:[^'"\n]+from\s+)?['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRe.exec(code))) {
    const spec = match[1];
    if (!spec || spec.startsWith(".") || spec.startsWith("@/")) continue;
    if (spec.startsWith("@")) {
      const parts = spec.split("/");
      found.add(parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0]);
      continue;
    }
    found.add(spec.split("/")[0]);
  }

  // Always useful for registry components in this project.
  for (const pkg of ["motion", "clsx", "tailwind-merge"]) {
    if (code.includes(pkg) || code.includes("@/lib/utils")) found.add(pkg);
  }
  if (code.includes("framer-motion")) {
    found.add("framer-motion");
    found.delete("motion");
  }

  return Array.from(found).sort((a, b) => a.localeCompare(b));
}

export function detectComponentName(code: string): string | null {
  const patterns = [
    /export\s+default\s+function\s+([A-Z][A-Za-z0-9]*)/,
    /export\s+default\s+([A-Z][A-Za-z0-9]*)/,
    /function\s+([A-Z][A-Za-z0-9]*)\s*\(/,
    /const\s+([A-Z][A-Za-z0-9]*)\s*=\s*(?:forwardRef|memo|function|\()/,
  ];
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}
