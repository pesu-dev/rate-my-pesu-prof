import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — shadcn/ui-style class merging utility.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 *
 * @param  {...import('clsx').ClassValue} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
