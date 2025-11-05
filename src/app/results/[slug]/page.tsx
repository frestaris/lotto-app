"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import * as Icons from "lucide-react";
import {
  useGetTicketsByDrawIdQuery,
  useGetGameFullQuery,
} from "@/redux/api/gameApi";
import { getGameColor } from "@/utils/getGameColor";
import type { Draw } from "@/types/game";
import { formatDate } from "@/utils/formatDate";
import Spinner from "@/components/Spinner";

export default function GameResultsPage() {
  const { slug } = useParams() as { slug: string };

  // 🎯 Fetch game and draw data
  const {
    data: game,
    isLoading: isGameLoading,
    isFetching: isGameFetching,
    isError: isGameError,
  } = useGetGameFullQuery(slug);

  const draws = useMemo(() => game?.draws ?? [], [game?.draws]);

  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const drawId = selectedDraw?.id ?? "";
  const skipTickets = !selectedDraw?.id;

  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    isFetching: isTicketsFetching,
  } = useGetTicketsByDrawIdQuery(drawId, { skip: skipTickets });

  const divisionResults = ticketsData?.divisionResults ?? [];
  const loading =
    isGameLoading || isGameFetching || isTicketsLoading || isTicketsFetching;

  // 🧩 Auto-select most recent completed or next upcoming draw
  useEffect(() => {
    if (draws.length) {
      const sorted = [...draws].sort(
        (a, b) =>
          new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime()
      );

      const now = new Date();
      const mostRecentCompleted =
        sorted
          .filter(
            (d) => d.status === "COMPLETED" && new Date(d.drawDate) <= now
          )
          .at(-1) ||
        sorted.find((d) => new Date(d.drawDate) >= now) ||
        sorted[0];

      setSelectedDraw(mostRecentCompleted);
    }
  }, [draws]);

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="h-[calc(100vh-72px)] flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-400">
        <Spinner
          variant="accent"
          size="lg"
          message="Fetching game results..."
        />
      </div>
    );
  }

  // ❌ Error state
  if (isGameError) {
    return (
      <div className="h-[calc(100vh-72px)] flex items-center justify-center text-red-400 bg-[#0a0a0a]">
        Failed to load game results. Please try again later.
      </div>
    );
  }

  // 🕳️ No data state
  if (!game || !selectedDraw) {
    return (
      <div className="h-[calc(100vh-72px)] flex items-center justify-center text-gray-400 bg-[#0a0a0a]">
        No draw data available.
      </div>
    );
  }

  // 🎨 Normal rendering
  const isUpcoming = selectedDraw.status === "UPCOMING";
  const formattedDate = formatDate(selectedDraw.drawDate);
  const jackpot = selectedDraw.jackpotCents ?? game.currentJackpotCents ?? 0;

  const Icon =
    (Icons[game.iconName as keyof typeof Icons] as React.ElementType) ||
    Icons.Ticket;
  const iconColor = getGameColor(game.slug);

  return (
    <div className="max-w-4xl mx-auto py-10 text-white">
      {/* 🎯 Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 flex items-center justify-center rounded-full border border-yellow-400/30 bg-black/20">
            <Icon
              className={`w-12 h-12 ${iconColor} drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]`}
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-yellow-400 mt-4">{game.name}</h1>

        <p className="text-gray-400">
          Draw {selectedDraw.drawNumber} — {formattedDate}
          <br />
          <span className="text-yellow-400 font-semibold">
            Jackpot: ${Math.round(jackpot / 100).toLocaleString()}
          </span>
        </p>
      </div>

      {/* 🏆 Winning Numbers */}
      {!isUpcoming ? (
        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {selectedDraw.winningMainNumbers.map((n, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-400 text-black font-bold"
            >
              {n}
            </div>
          ))}

          {selectedDraw.winningSpecialNumbers.length > 0 && (
            <div className="w-10 h-10 flex items-center justify-center font-bold text-yellow-400">
              +
            </div>
          )}

          {selectedDraw.winningSpecialNumbers.map((n, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500 text-black font-bold"
            >
              {n}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 mb-10">
          Results will appear here after the draw!
        </div>
      )}

      {/* 🧮 Division Prizes */}
      {game.prizeDivisions && (
        <div className="max-w-3xl mx-auto mt-8 border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-xs sm:text-sm text-gray-300">
            <thead className="bg-[#1a1a1a] text-yellow-400 uppercase text-xs sm:text-sm">
              <tr>
                <th className="px-4 py-2 text-left">Division</th>

                {/* Hide on small screens */}
                <th className="px-4 py-2 text-center hidden sm:table-cell">
                  Match
                </th>

                <th className="px-4 py-2 text-center">Prize Pool</th>
                <th className="px-4 py-2 text-center">Winners</th>

                {/* Hide on small screens */}
                <th className="px-4 py-2 text-center hidden sm:table-cell">
                  Each
                </th>
              </tr>
            </thead>

            <tbody>
              {game.prizeDivisions.map((div, i) => {
                const result =
                  divisionResults.find((r) => r.type === div.type) ?? null;

                const pool =
                  result?.poolCents ??
                  (div.fixed
                    ? div.fixed
                    : Math.floor(jackpot * (div.percentage ?? 0))) ??
                  0;

                const winners = result?.winnersCount ?? 0;
                const each =
                  result?.eachCents ??
                  (winners > 0 ? Math.floor(pool / winners) : 0);

                return (
                  <tr
                    key={i}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    {/* Division */}
                    <td className="px-4 py-2 font-semibold">{div.type}</td>

                    {/* Match (hidden on small screens) */}
                    <td className="px-4 py-2 text-center hidden sm:table-cell">
                      <div className="flex items-start gap-2">
                        <div className="flex flex-wrap justify-start gap-[4px] max-w-[60px]">
                          {Array.from({ length: div.matchMain }).map((_, i) => (
                            <div
                              key={`main-${i}`}
                              className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(255,215,0,0.4)]"
                            />
                          ))}
                        </div>

                        {(div.matchSpecial ?? 0) > 0 && (
                          <span className="text-yellow-400 font-semibold">
                            +
                          </span>
                        )}

                        {(div.matchSpecial ?? 0) > 0 && (
                          <div className="flex flex-wrap justify-start gap-[4px] max-w-[60px]">
                            {Array.from({ length: div.matchSpecial ?? 0 }).map(
                              (_, i) => (
                                <div
                                  key={`special-${i}`}
                                  className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_4px_rgba(168,85,247,0.4)]"
                                />
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Prize Pool */}
                    <td className="px-4 py-2 text-center text-green-400">
                      ${Math.round(pool / 100).toLocaleString()}
                    </td>

                    {/* Winners */}
                    <td className="px-4 py-2 text-center text-yellow-400 font-semibold">
                      {winners}
                    </td>

                    {/* Each (hidden on small screens) */}
                    <td className="px-4 py-2 text-center text-blue-400 hidden sm:table-cell">
                      {each > 0 ? `$${(each / 100).toLocaleString()}` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 🗓️ Past Draws Dropdown */}
      <div className="text-center mt-10">
        <label
          htmlFor="pastDraws"
          className="block text-sm text-gray-400 mb-2 uppercase tracking-wider"
        >
          Past Draws
        </label>
        <select
          id="pastDraws"
          value={selectedDraw.id}
          onChange={(e) => {
            const next = draws.find((d) => d.id === e.target.value);
            setSelectedDraw(next ?? draws[0]);
          }}
          className="bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-gray-300 hover:cursor-pointer"
        >
          {[...draws]
            .filter((d) => d.status === "COMPLETED")
            .sort(
              (a, b) =>
                new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
            )
            .map((d) => (
              <option key={d.id} value={d.id}>
                Draw {d.drawNumber} — {formatDate(d.drawDate)}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
