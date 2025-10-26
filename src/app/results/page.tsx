"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { useGetLatestDrawsQuery } from "@/redux/slices/gameApi";
import { getGameColor } from "@/utils/getGameColor";

export default function ResultsPage() {
  const { data: draws = [], isLoading } = useGetLatestDrawsQuery();

  if (isLoading)
    return <div className="text-gray-400 text-center py-10">Loading...</div>;

  if (!draws.length)
    return (
      <div className="text-gray-400 text-center py-10">
        No draws available yet.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-10 text-white">
      <h1 className="text-3xl text-center font-bold mb-6 text-yellow-400">
        Latest Results
      </h1>

      <div className="grid sm:grid-cols-2 gap-6 mx-2">
        {draws.map((d) => {
          const drawDate = new Date(d.drawDate);
          const formattedDate = drawDate.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          const isCompleted = d.displayStatus === "COMPLETED";
          const isToday = d.displayStatus === "TODAY";
          const isAwaiting = d.displayStatus === "AWAITING_RESULTS";

          // ✅ Generate a slug from the name (matches backend slug)
          const slug = d.gameName.toLowerCase().replace(/\s+/g, "-");

          // ✅ Pick correct icon and color
          const Icon =
            (Icons[d.iconName as keyof typeof Icons] as React.ElementType) ||
            Icons.Ticket;
          const iconColor = getGameColor(slug);

          return (
            <Link
              key={`${d.gameId}-${d.drawNumber}`}
              href={`/results/${slug}`}
              className="bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition"
            >
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-md border border-yellow-400/30 bg-black/20">
                  <Icon
                    className={`w-8 h-8 ${iconColor} drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]`}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">{d.gameName}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Draw {d.drawNumber} —{" "}
                    {isCompleted ? (
                      <span className="text-green-400 font-medium">
                        completed on {formattedDate}
                      </span>
                    ) : isToday ? (
                      <span className="text-yellow-400 font-medium">
                        coming today
                      </span>
                    ) : isAwaiting ? (
                      <span className="text-orange-400 font-medium">
                        awaiting results
                      </span>
                    ) : (
                      <span className="text-yellow-400 font-medium">
                        coming {formattedDate}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* 🎯 Winning numbers */}
              {isCompleted && d.winningMainNumbers?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {d.winningMainNumbers.map((num: number, i: number) => (
                    <span
                      key={i}
                      className="bg-yellow-400 text-black font-semibold w-7 h-7 flex items-center justify-center rounded-full text-sm"
                    >
                      {num}
                    </span>
                  ))}

                  {d.winningSpecialNumbers?.length > 0 && (
                    <span className="bg-orange-500 text-black font-semibold w-7 h-7 flex items-center justify-center rounded-full text-sm ml-2">
                      {d.winningSpecialNumbers.join(", ")}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
