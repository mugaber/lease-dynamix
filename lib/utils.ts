import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTermValue(value: number, unit: string) {
  if (typeof value === "number") {
    if (unit === "USD/sqft/year") {
      return `$${value}`;
    }
    if (unit === "years") {
      return `${value} years`;
    }
    return `${value}`;
  }
  return `${value}`;
}
