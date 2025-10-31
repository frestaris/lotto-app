"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { useGetLatestDrawsQuery } from "@/redux/api/gameApi";
import { getGameColor } from "@/utils/getGameColor";
import Spinner from "@/components/Spinner";
import GameCard from "@/components/GameCard";

export default function ResultsPage() {
  const { data: draws = [], isLoading } = useGetLatestDrawsQuery();

  if (isLoading)
    return (
      <Spinner
        message="Loading latest results…"
        variant="accent"
        size="lg"
        fullScreen
      />
    );

  if (!draws.length)
    return (
      <div className="h-[calc(100vh-72px)] flex items-center justify-center text-gray-400 bg-[#0a0a0a]">
        No draws available yet.
      </div>
    );

  return (
    <div className="relative text-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.12)_0%,rgba(0,0,0,1)_70%)] pointer-events-none" />

      {/* HERO + GRID */}
      <section
        className="flex flex-col justify-center items-center text-center px-6 py-12 gap-10"
        style={{ minHeight: "calc(100vh - 72px)" }}
      >
        {/* HERO HEADING */}
        <div className="z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
            Latest Results
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            See the most recent winning numbers from all your favourite games.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl w-full z-10">
          {draws.slice(0, 8).map((d) => {
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

            const slug = d.gameName.toLowerCase().replace(/\s+/g, "-");
            const Icon =
              (Icons[d.iconName as keyof typeof Icons] as React.ElementType) ||
              Icons.Ticket;
            const iconColor = getGameColor(slug);

            return (
              <Link
                key={`${d.gameId}-${d.drawNumber}`}
                href={`/results/${slug}`}
              >
                <GameCard>
                  {/* Icon with glow */}
                  <div className="relative">
                    <div className="absolute inset-0 blur-xl rounded-full bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Icon
                      className={`relative w-12 h-12 ${iconColor} drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] transition-transform duration-300 group-hover:scale-110`}
                    />
                  </div>

                  <h2 className="text-lg font-semibold group-hover:text-yellow-400">
                    {d.gameName}
                  </h2>

                  {/* Status */}
                  <p className="text-sm text-gray-400">
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
                  {/* Border */}
                  <div className="h-[3px] w-1/2 bg-yellow-400/30 mt-3 rounded-full"></div>

                  {/* Winning numbers */}
                  {isCompleted && d.winningMainNumbers?.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-start gap-2">
                      {d.winningMainNumbers.map((num: number, i: number) => (
                        <span
                          key={i}
                          className="bg-yellow-400 text-black font-semibold w-7 h-7 flex items-center justify-center rounded-full text-sm shadow-[0_0_6px_rgba(255,215,0,0.6)]"
                        >
                          {num}
                        </span>
                      ))}
                      {d.winningSpecialNumbers?.length > 0 && (
                        <span className="bg-orange-500 text-black font-semibold w-7 h-7 flex items-center justify-center rounded-full text-sm ml-2 shadow-[0_0_6px_rgba(255,165,0,0.6)]">
                          {d.winningSpecialNumbers.join(", ")}
                        </span>
                      )}
                    </div>
                  )}
                </GameCard>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
