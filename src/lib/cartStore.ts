import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'maxStock'>, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === item.id);
          const safeQty = Math.max(1, quantity);
          if (existingIndex > -1) {
            const existing = state.items[existingIndex];
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...existing,
              quantity: existing.quantity + safeQty,
            };
            return { items: updatedItems };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: safeQty,
                maxStock: 999999, // Unlimited stock while available is ON
              },
            ],
          };
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) => {
              if (i.id === id) {
                return { ...i, quantity };
              }
              return i;
            }),
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'karadi_crackers_cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
