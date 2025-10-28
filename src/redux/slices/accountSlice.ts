import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the account state type
interface AccountState {
  account: {
    id?: string;
    name?: string | null;
    email?: string | null;
    creditCents?: number;
    image?: string | null;
  } | null;
}

const initialState: AccountState = {
  account: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<AccountState["account"]>) => {
      state.account = action.payload;
    },
    updateEmailSuccess: (state, action: PayloadAction<string>) => {
      if (state.account) state.account.email = action.payload;
    },
    updateCreditsSuccess: (state, action: PayloadAction<number>) => {
      if (state.account)
        state.account.creditCents =
          (state.account.creditCents || 0) + Math.floor(action.payload * 100);
    },
  },
});

export const { setAccount, updateEmailSuccess, updateCreditsSuccess } =
  accountSlice.actions;
export default accountSlice.reducer;
