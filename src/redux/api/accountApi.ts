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
  }),
});

export const { useUpdateAccountMutation, useDeleteAccountMutation } =
  accountApi;
