import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Game } from "@/types/game";

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    // Fetch all games
    getGames: builder.query<Game[], void>({
      query: () => "games",
    }),

    // Fetch single game by slug
    getGameBySlug: builder.query<Game, string>({
      query: (slug) => `games/${slug}`,
    }),
  }),
});

// ✅ Auto-generated hooks
export const { useGetGamesQuery, useGetGameBySlugQuery } = gameApi;
