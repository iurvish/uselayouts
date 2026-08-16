export function stripCodeAnnotations(code: string): string {
  const result: string[] = [];

  for (const originalLine of code.split("\n")) {
    let cleaned = originalLine.replace(/\s*\/\/\s*\[!code\s+[^\]]+\]\s*$/, "");
    cleaned = cleaned.replace(/\s*\{?\s*\/\*\s*\[!code\s+[^\]]+\]\s*\*\/\s*\}?\s*$/, "");
    cleaned = cleaned.replace(/\s*<!--\s*\[!code\s+[^\]]+\]\s*-->\s*$/, "");

    const isWordAnnotationLine = /^\s*(?:\/\/|\/\*|{\/\*|<!--)\s*\[!code\s+word:/.test(
      originalLine,
    );
    if (isWordAnnotationLine && cleaned.trim() === "") continue;

    result.push(cleaned);
  }

  return result.join("\n");
}
