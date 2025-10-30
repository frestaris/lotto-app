import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the account state type
interface AccountState {
  account: {
    id?: string;
    name?: string | null;
    email?: string | null;
    creditCents?: number;
    image?: string | null;
    password?: string | null;
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
      state.account = {
        ...state.account,
        ...action.payload,
      };
    },
    updateEmailSuccess: (state, action: PayloadAction<string>) => {
      if (state.account) state.account.email = action.payload;
    },
    updateCreditsSuccess: (state, action) => {
      if (state.account) {
        state.account.creditCents += action.payload;
      }
    },
  },
});

export const { setAccount, updateEmailSuccess, updateCreditsSuccess } =
  accountSlice.actions;
export default accountSlice.reducer;
