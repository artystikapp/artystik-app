// Define the cart item interface
export interface CartItem {
  id: string;
  title: string;
  price: string;
  image: string;
}

// Define the cart state
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

// Define the cart actions
export interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

// Combine state and actions
export type CartSlice = CartState & CartActions;

// Calculate cart totals
const calculateCartTotals = (items: CartItem[]) => {
  return {
    totalItems: items.length,
    totalAmount: items.reduce((sum, item) => sum + parseFloat(item.price), 0),
  };
};

// Create the cart slice
export const createCartSlice = (
  set: (fn: (state: CartSlice) => Partial<CartSlice>) => void,
  get: () => CartSlice
) => ({
  // Initial state
  items: [] as CartItem[],
  totalItems: 0,
  totalAmount: 0,

  // Actions
  addItem: (item: CartItem) => {
    const currentItems = get().items;
    // Check if item already exists (by id)
    const existingItem = currentItems.find((i) => i.id === item.id);

    if (existingItem) {
      // If item already exists, don't add it again (since each item is unique)
      return;
    }

    // Add the new item
    const newItems = [...currentItems, item];
    const { totalItems, totalAmount } = calculateCartTotals(newItems);

    set(() => ({
      items: newItems,
      totalItems,
      totalAmount,
    }));
  },

  removeItem: (id: string) => {
    const currentItems = get().items;
    const newItems = currentItems.filter((item) => item.id !== id);
    const { totalItems, totalAmount } = calculateCartTotals(newItems);

    set(() => ({
      items: newItems,
      totalItems,
      totalAmount,
    }));
  },

  clearCart: () => {
    set(() => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
    }));
  },
});
