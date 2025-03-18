import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CartItem {
  id: string;
  title: string;
  price: string; // Assuming price is in string format
}

/**
 * Formats the cart payload into a description string.
 * @param cart - The original cart payload
 * @param currency - The currency to use for the price
 * @returns A formatted description string
 */
export function formatCartDescription(
  cart: CartItem[],
  currency: string = "INR"
): string {
  return cart
    .map((item) => `${item.title} - ${currency} ${item.price}`) // Format each item
    .join(", "); // Join items with a comma
}
