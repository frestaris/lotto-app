import { createSlice } from "@reduxjs/toolkit";
import { signOut } from "next-auth/react";
import { persistStore } from "redux-persist";
import { store } from "../store";

export interface AuthUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
      signOut();
      persistStore(store).purge();
    },
  },
});

export const { setUser, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
