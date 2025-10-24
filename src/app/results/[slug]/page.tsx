"use client";
import { useParams } from "next/navigation";
import {
  useGetGameBySlugQuery,
  useGetDrawsByGameIdQuery,
} from "@/redux/slices/gameApi";
import { useState, useEffect } from "react";
import Image from "next/image";
import type { Draw } from "@/types/game";

export default function GameResultsPage() {
  const { slug } = useParams() as { slug: string };
  const { data: game } = useGetGameBySlugQuery(slug);
  const { data: draws = [] } = useGetDrawsByGameIdQuery(game?.id ?? "", {
    skip: !game?.id,
  });

  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);

  useEffect(() => {
    if (draws.length) {
      // 🗓️ Sort by date ascending to normalize order
      const sorted = [...draws].sort(
        (a, b) =>
          new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime()
      );

      const now = new Date();

      // ✅ Find most recent completed or next upcoming
      const mostRecentCompleted =
        sorted
          .filter(
            (d) => d.status === "COMPLETED" && new Date(d.drawDate) <= now
          )
          .at(-1) || // last completed
        sorted.find((d) => new Date(d.drawDate) >= now) || // next upcoming
        sorted[0];

      setSelectedDraw(mostRecentCompleted);
    }
  }, [draws]);

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

  return (
    <div className="max-w-4xl mx-auto py-10 text-white">
      {/* Header */}
      <div className="text-center mb-8">
        <Image
          src={game.logoUrl ?? "/images/default-logo.png"}
          alt={game.name}
          width={80}
          height={80}
          priority
          className="w-20 h-20 object-contain mx-auto rounded-md"
        />

        <h1 className="text-3xl font-bold text-yellow-400 mt-4">{game.name}</h1>

        <p className="text-gray-400">
          Draw {selectedDraw.drawNumber} — {formattedDate}{" "}
        </p>
      </div>

      {/* Winning Numbers */}
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
        // 🕒 If no draws completed yet
        <div className="text-center text-gray-400 mb-10">
          Results will appear here after the draw!
        </div>
      )}

      {/* Dropdown for past draws */}
      <div className="text-center">
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
          {draws
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
