import { baseApi } from "../api/baseApi";

export const gameApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllGames: builder.query({
      query: () => ({ url: "/games" }),
      providesTags: ["Game"],
    }),
    getGameBySlug: builder.query({
      query: (slug) => ({ url: `/games/${slug}` }),
      providesTags: ["Game"],
    }),
    getDrawsByGameId: builder.query({
      query: (gameId) => ({ url: `/draws/game/${gameId}` }),
      providesTags: ["Draw"],
    }),
    createTicket: builder.mutation({
      query: (body) => ({
        url: "/tickets",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Ticket"],
    }),
    getUserTickets: builder.query({
      query: (userId) => ({ url: `/tickets/user/${userId}` }),
      providesTags: ["Ticket"],
    }),
  }),
});

export const {
  useGetAllGamesQuery,
  useGetGameBySlugQuery,
  useGetDrawsByGameIdQuery,
  useCreateTicketMutation,
  useGetUserTicketsQuery,
} = gameApi;
