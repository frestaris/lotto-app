import type { Game, Draw, LatestDraw, DivisionResult } from "@/types/game";
import type { UserTicket } from "@/types/ticket";
import { baseApi } from "../api/baseApi";

/**
 * Extends Draw with optional divisionResults for completed draws
 */
export interface DrawWithResults extends Draw {
  divisionResults?: DivisionResult[] | null;
}

/**
 * ✅ Extended Game type to include its draws directly
 */
export interface GameWithDraws extends Game {
  draws: DrawWithResults[];
  jackpotCents: number;
}

export const gameApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // 🎯 Lightweight games (homepage)
    getAllGames: builder.query<Game[], void>({
      query: () => ({ url: "/games" }), // your new lightweight route
      providesTags: ["Game"],
    }),

    // 🎯 Full game details (includes draws + prize divisions)
    getGameFull: builder.query<GameWithDraws, string>({
      query: (slug) => ({ url: `/games/${slug}` }), // your new merged endpoint
      providesTags: ["Game", "Draw"],
    }),

    // 🆕 Latest draws (dashboard / results)
    getLatestDraws: builder.query<LatestDraw[], void>({
      query: () => ({ url: "/draws/latest" }),
      providesTags: ["Draw"],
    }),
    getCompletedDraws: builder.query<GameWithDraws, string>({
      query: (slug) => ({
        url: `/games/${slug}/completed`,
        method: "GET",
      }),
    }),

    // 👤 User tickets
    getUserTickets: builder.query<
      { tickets: UserTicket[] },
      { month?: string }
    >({
      query: ({ month } = {}) => {
        const params = new URLSearchParams();
        if (month) params.append("month", month);
        return { url: `/tickets/user?${params.toString()}` };
      },
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
        body,
      }),
      invalidatesTags: ["Ticket"],
    }),

    // 🎟️ Tickets by draw (used for results)
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
  useGetGameFullQuery,
  useGetLatestDrawsQuery,
  useGetCompletedDrawsQuery,
  useGetUserTicketsQuery,
  useGetUserTicketsDetailedQuery,
  useCreateTicketMutation,
  useGetTicketsByDrawIdQuery,
  usePrefetch,
} = gameApi;
