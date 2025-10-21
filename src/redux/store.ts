"use client";

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import cartReducer from "./slices/cartSlice";
import ticketReducer from "./slices/ticketSlice";
import { gameApi } from "./slices/gameApi";
export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      tickets: ticketReducer,
      [gameApi.reducerPath]: gameApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(gameApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
