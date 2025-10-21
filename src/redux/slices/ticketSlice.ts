import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface TicketData {
  gameId: string;
  drawId: string; // placeholder for now
  numbers: number[];
  specialNumbers: number[];
  priceCents: number;
}

interface TicketState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: TicketState = {
  loading: false,
  success: false,
  error: null,
};

export const submitTickets = createAsyncThunk<
  void,
  TicketData[],
  { state: RootState; rejectValue: string }
>("tickets/submitTickets", async (tickets, { rejectWithValue }) => {
  try {
    for (const t of tickets) {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });

      if (!res.ok) {
        throw new Error(`Failed to save ticket: ${res.statusText}`);
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue(
      "An unknown error occurred while submitting tickets"
    );
  }
});

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    resetTicketState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTickets.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(submitTickets.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ticket submission failed";
      });
  },
});

export const { resetTicketState } = ticketSlice.actions;
export default ticketSlice.reducer;
