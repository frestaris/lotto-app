import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface TicketData {
  gameId: string;
  numbers: number[];
  specialNumbers: number[];
  priceCents: number;
}

export interface ApiTicket {
  id: string;
  userId: string;
  gameId: string;
  drawId: string;
  numbers: number[];
  specialNumbers: number[];
  priceCents: number;
  createdAt: string;
}

interface TicketResponse {
  message: string;
  ticket: ApiTicket;
  updatedBalance: number;
}

interface TicketState {
  loading: boolean;
  success: boolean;
  error: string | null;
  updatedBalance: number | null;
}

const initialState: TicketState = {
  loading: false,
  success: false,
  error: null,
  updatedBalance: null,
};

export const submitTickets = createAsyncThunk<
  TicketResponse, // return type
  TicketData[], // arg type
  { state: RootState; rejectValue: string }
>("tickets/submitTickets", async (tickets, { rejectWithValue }) => {
  try {
    let lastResponse: TicketResponse | null = null;

    // 🧮 process each ticket individually
    for (const t of tickets) {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || `Failed to save ticket: ${res.statusText}`
        );
      }

      lastResponse = data;
    }

    if (!lastResponse) throw new Error("No response from server");

    // ✅ Return the final API response (includes updatedBalance)
    return lastResponse;
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
      state.updatedBalance = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTickets.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(submitTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedBalance = action.payload.updatedBalance;
      })
      .addCase(submitTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ticket submission failed";
      });
  },
});

export const { resetTicketState } = ticketSlice.actions;
export default ticketSlice.reducer;
