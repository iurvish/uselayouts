import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get absolute URL for a given path
 * @param path - The relative path (e.g., "/docs/components/bucket")
 * @returns Absolute URL (e.g., "https://uselayouts.com/docs/components/bucket")
 */
export function absoluteUrl(path: string) {
  const baseUrl = "https://uselayouts.com";
  return `${baseUrl}${path}`;
}
