import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOrderId(id: string) {
  if (!id) return "";
  const clean = id.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length < 6) return `RL-${clean.toUpperCase()}`;
  // Premium look: RL- followed by the last 6 characters of the ID in uppercase
  return `RL-${clean.slice(-6).toUpperCase()}`;
}
