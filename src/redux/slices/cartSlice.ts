import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* --------------------------------------------
   🧩 Types
-------------------------------------------- */
export interface TicketItem {
  id: string;
  gameId: string;
  gameName: string;
  slug: string;
  iconName: string;
  drawId?: string | null;
  drawDate: string | null;
  numbers: number[];
  specialNumbers: number[];
  priceCents: number;
}

interface CartState {
  tickets: TicketItem[];
}

/* --------------------------------------------
   🧠 Local Storage Helpers
-------------------------------------------- */
const CART_KEY = "lotto_cart";

function loadCartFromStorage(): TicketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("❌ Failed to load cart:", err);
    return [];
  }
}

function saveCartToStorage(tickets: TicketItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error("❌ Failed to save cart:", err);
  }
}

/* --------------------------------------------
   🧱 Initial State
-------------------------------------------- */
const initialState: CartState = {
  tickets: loadCartFromStorage(),
};

/* --------------------------------------------
   🪄 Slice
-------------------------------------------- */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<TicketItem>) => {
      if (state.tickets.length >= 50) return;
      state.tickets.push(action.payload);
      saveCartToStorage(state.tickets); // ✅ persist after add
    },

    removeTicket: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter((t) => t.id !== action.payload);
      saveCartToStorage(state.tickets); // ✅ persist after remove
    },

    clearCart: (state) => {
      state.tickets = [];
      saveCartToStorage(state.tickets); // ✅ persist after clear
    },

    // ✅ Optional: Used when syncing across tabs
    syncFromStorage: (state, action: PayloadAction<TicketItem[]>) => {
      state.tickets = action.payload;
    },
  },
});

/* --------------------------------------------
   🧾 Exports
-------------------------------------------- */
export const { addTicket, removeTicket, clearCart, syncFromStorage } =
  cartSlice.actions;

export default cartSlice.reducer;
