import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartSlice, createCartSlice } from "./slices/cart-slice";

// Create the store with persistence
export const useStore = create<CartSlice>()(
  persist((set, get) => createCartSlice(set, get), {
    name: "artystik-app-storage", // Name for localStorage key
    storage: createJSONStorage(() => localStorage),
    // Only persist specific paths
    partialize: (state) => ({
      items: state.items,
      totalItems: state.totalItems,
      totalAmount: state.totalAmount,
    }),
  })
);
