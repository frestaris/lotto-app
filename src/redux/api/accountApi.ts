import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Account"],
  endpoints: (builder) => ({
    updateAccount: builder.mutation({
      query: (body) => ({
        url: "/account",
        method: "PATCH",
        body, // { action: "editEmail" | "changePassword" | "addCredits", ... }
      }),
      invalidatesTags: ["Account"],
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: "/account",
        method: "DELETE",
      }),
      invalidatesTags: ["Account"],
    }),
  }),
});

export const { useUpdateAccountMutation, useDeleteAccountMutation } =
  accountApi;
