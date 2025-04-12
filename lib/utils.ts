import { clsx, type ClassValue } from "clsx";
import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSize(size: number | string) {
  if (typeof size === "string") size = parseInt(size);
  console.log(size);

  if (size < 1024) return `${size} B`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  else if (size < 1024 * 1024 * 1024)
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  else return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function getDateString(date: string) {
  return date; //todo: human readable
}
