import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import api from "@/lib/axios";
import { accountApi } from "../api/accountApi";

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
  tickets: ApiTicket[];
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
  TicketResponse,
  TicketData[],
  { state: RootState; rejectValue: string }
>("tickets/submitTickets", async (tickets, { dispatch, rejectWithValue }) => {
  try {
    const res = await api.post<TicketResponse>("/tickets", tickets);

    dispatch(accountApi.util.invalidateTags(["Transaction"]));

    return res.data;
  } catch (error: unknown) {
    return rejectWithValue((error as Error).message || "Something went wrong");
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
