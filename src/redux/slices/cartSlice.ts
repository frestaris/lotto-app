import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TicketItem {
  id: string;
  gameId: string;
  gameName: string;
  drawDate: string | null;
  numbers: number[];
  specialNumbers: number[];
  priceCents: number;
}

interface CartState {
  tickets: TicketItem[];
}

const initialState: CartState = {
  tickets: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<TicketItem>) => {
      if (state.tickets.length >= 50) return;
      state.tickets.push(action.payload);
    },
    removeTicket: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter((t) => t.id !== action.payload);
    },
    clearCart: (state) => {
      state.tickets = [];
    },
  },
});

export const { addTicket, removeTicket, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
