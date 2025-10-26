import type { Game, Draw, LatestDraw, DivisionResult } from "@/types/game";
import type { UserTicket } from "@/types/ticket";
import { baseApi } from "../api/baseApi";

/**
 * Extends Draw with optional divisionResults for completed draws
 */
export interface DrawWithResults extends Draw {
  divisionResults?: DivisionResult[] | null;
}

export const gameApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // 🎯 All games
    getAllGames: builder.query<Game[], void>({
      query: () => ({ url: "/games" }),
      providesTags: ["Game"],
    }),

    // 🎯 Game by slug
    getGameBySlug: builder.query<Game, string>({
      query: (slug) => ({ url: `/games/${slug}` }),
      providesTags: ["Game"],
    }),

    // 🗓️ Draws for a specific game (now includes divisionResults)
    getDrawsByGameId: builder.query<DrawWithResults[], string>({
      query: (gameId) => ({ url: `/draws/game/${gameId}` }),
      providesTags: ["Draw"],
    }),

    // 🆕 Latest draws (home page / dashboard)
    getLatestDraws: builder.query<LatestDraw[], void>({
      query: () => ({ url: "/draws/latest" }),
      providesTags: ["Draw"],
    }),

    // 👤 User tickets (basic)
    getUserTickets: builder.query<UserTicket[], string>({
      query: () => ({ url: `/tickets/user` }),
      providesTags: ["Ticket"],
    }),

    // 👤 User tickets (detailed)
    getUserTicketsDetailed: builder.query<UserTicket[], void>({
      query: () => ({ url: "/tickets/user" }),
      providesTags: ["Ticket"],
    }),

    // ➕ Create new ticket
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

    // 🎟️ Tickets by draw (still useful for user lists)
    getTicketsByDrawId: builder.query<
      { tickets: UserTicket[]; divisionResults: DivisionResult[] },
      string
    >({
      query: (drawId) => ({ url: `/tickets/draw/${drawId}` }),
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
  useGetLatestDrawsQuery,
  useGetUserTicketsDetailedQuery,
  useGetTicketsByDrawIdQuery,
} = gameApi;
