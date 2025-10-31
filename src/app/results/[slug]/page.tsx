"use client";

import { useParams } from "next/navigation";
import {
  useGetTicketsByDrawIdQuery,
  useGetGameFullQuery,
} from "@/redux/api/gameApi";
import { useState, useEffect, useMemo } from "react";
import * as Icons from "lucide-react";
import { getGameColor } from "@/utils/getGameColor";
import type { Draw } from "@/types/game";

export default function GameResultsPage() {
  const { slug } = useParams() as { slug: string };
  const { data: game } = useGetGameFullQuery(slug);
  const draws = useMemo(() => game?.draws ?? [], [game?.draws]);

  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const drawId = selectedDraw?.id ?? "";
  const skipTickets = !selectedDraw?.id;

  const { data: ticketsData } = useGetTicketsByDrawIdQuery(drawId, {
    skip: skipTickets,
  });
  const divisionResults = ticketsData?.divisionResults ?? [];

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

  // ⏳ Handle loading state
  if (!game || !selectedDraw)
    return <div className="text-gray-400 text-center py-10">Loading...</div>;

  const isUpcoming = selectedDraw.status === "UPCOMING";
  const formattedDate = new Date(selectedDraw.drawDate).toLocaleDateString(
    undefined,
    {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const jackpot = selectedDraw.jackpotCents ?? game.currentJackpotCents ?? 0;

  // ✅ Icon setup with color theme
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
            <span className="text-yellow-400 font-semibold px-3">+</span>
          )}

          {selectedDraw.winningSpecialNumbers.map((n, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 text-white font-bold"
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
          <table className="w-full text-sm text-gray-300">
            <thead className="bg-white/10 text-yellow-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 text-left">Division</th>
                <th className="px-4 py-2 text-center">Match</th>
                <th className="px-4 py-2 text-center">Prize Pool</th>
                <th className="px-4 py-2 text-center">Winners</th>
                <th className="px-4 py-2 text-center">Each</th>
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
                    <td className="px-4 py-2 font-semibold">{div.type}</td>
                    <td className="px-4 py-2 text-center">
                      {div.matchMain} main
                      {div.matchSpecial ? ` + ${div.matchSpecial} special` : ""}
                    </td>
                    <td className="px-4 py-2 text-center text-green-400">
                      ${Math.round(pool / 100).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center text-yellow-400 font-semibold">
                      {winners}
                    </td>
                    <td className="px-4 py-2 text-center text-blue-400">
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
          className="bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-gray-300"
        >
          {[...draws]
            .filter((d) => d.status === "COMPLETED")
            .sort(
              (a, b) =>
                new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
            )
            .map((d) => (
              <option key={d.id} value={d.id}>
                Draw {d.drawNumber} —{" "}
                {new Date(d.drawDate).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
