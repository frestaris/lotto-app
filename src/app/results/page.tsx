"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { useGetLatestDrawsQuery } from "@/redux/api/gameApi";
import { getGameColor } from "@/utils/getGameColor";
import GameCard from "@/components/GameCard";
import { formatDate } from "@/utils/formatDate";
import Spinner from "@/components/Spinner";

export default function ResultsPage() {
  const {
    data: draws = [],
    isLoading,
    isFetching,
    isError,
  } = useGetLatestDrawsQuery();

  const loading = isLoading || isFetching;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)]">
        <Spinner
          variant="accent"
          size="lg"
          message="Fetching latest draws..."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-400">
        Failed to load draws. Please try again later.
      </div>
    );
  }

  if (!draws.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        No draws available yet.
      </div>
    );
  }

  return (
    <div className="relative text-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.12)_0%,rgba(0,0,0,1)_70%)] pointer-events-none" />

      <section className="flex flex-col justify-center items-center text-center px-6 py-12 gap-10">
        <div className="z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
            Latest Results
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            See the most recent winning numbers from all your favourite games.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl w-full z-10">
          {draws.slice(0, 8).map((d) => {
            const formattedDate = formatDate(d.drawDate);
            const slug = d.gameName.toLowerCase().replace(/\s+/g, "-");
            const Icon =
              (Icons[d.iconName as keyof typeof Icons] as React.ElementType) ||
              Icons.Ticket;
            const iconColor = getGameColor(slug);

            const isCompleted = d.displayStatus === "COMPLETED";
            const isToday = d.displayStatus === "TODAY";
            const isAwaiting = d.displayStatus === "AWAITING_RESULTS";

            return (
              <Link
                key={`${d.gameId}-${d.drawNumber}`}
                href={`/results/${slug}`}
              >
                <GameCard>
                  <div className="relative group">
                    <div className="absolute inset-0 blur-xl rounded-full bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Icon
                      className={`relative w-12 h-12 ${iconColor} drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] transition-transform duration-300 group-hover:scale-110`}
                    />
                  </div>

                  <h2 className="text-lg font-semibold group-hover:text-yellow-400">
                    {d.gameName}
                  </h2>

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

                  <div className="h-[3px] w-1/2 bg-yellow-400/30 mt-3 rounded-full" />

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
