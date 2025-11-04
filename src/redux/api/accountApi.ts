import type { TransactionsResponse } from "@/types/transaction";
import { baseApi } from "../api/baseApi";

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateAccount: builder.mutation({
      query: (body) => ({
        url: "/account",
        method: "PATCH",
        data: body,
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

    // ✅ Updated to accept optional month
    getUserTransactions: builder.query<TransactionsResponse, string | void>({
      query: (month) => ({
        url: month ? `/transactions/user?month=${month}` : "/transactions/user",
      }),
      providesTags: ["Transaction"],
    }),
  }),
});

export const {
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useGetUserTransactionsQuery,
} = accountApi;
