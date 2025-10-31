"use client";

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import cartReducer, { syncFromStorage } from "./slices/cartSlice";
import ticketReducer from "./slices/ticketSlice";
import accountReducer from "./slices/accountSlice";
import { baseApi } from "./api/baseApi";

/* --------------------------------------------
   🧩 Store Configuration
-------------------------------------------- */
export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      tickets: ticketReducer,
      account: accountReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });

export const store = makeStore();

/* --------------------------------------------
   🪄 Cross-tab LocalStorage Sync (Cart)
-------------------------------------------- */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "lotto_cart" && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        store.dispatch(syncFromStorage(parsed));
      } catch (err) {
        console.error("❌ Failed to sync cart from storage:", err);
      }
    }
  });
}

/* --------------------------------------------
   🧾 Hooks
-------------------------------------------- */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
