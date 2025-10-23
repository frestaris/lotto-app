import type { Game, Draw } from "@/types/game";
import { baseApi } from "../api/baseApi";

export const gameApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllGames: builder.query<Game[], void>({
      query: () => ({ url: "/games" }),
      providesTags: ["Game"],
    }),

    getGameBySlug: builder.query<Game, string>({
      query: (slug) => ({ url: `/games/${slug}` }),
      providesTags: ["Game"],
    }),

    getDrawsByGameId: builder.query<Draw[], string>({
      query: (gameId) => ({ url: `/draws/game/${gameId}` }),
      providesTags: ["Draw"],
    }),

    createTicket: builder.mutation<
      { success: boolean; id?: string },
      {
        userId: string;
        gameId: string;
        drawId: string;
        numbers: number[];
        specialNumbers: number[];
        priceCents: number;
      }
    >({
      query: (body) => ({
        url: "/tickets",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Ticket"],
    }),

    getUserTickets: builder.query<
      {
        id: string;
        gameId: string;
        drawId: string;
        numbers: number[];
        specialNumbers: number[];
        priceCents: number;
        createdAt: string;
      }[],
      string
    >({
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
