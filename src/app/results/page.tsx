"use client";
import Link from "next/link";
import { useGetLatestDrawsQuery } from "@/redux/slices/gameApi";
import Image from "next/image";

export default function ResultsPage() {
  const { data: draws = [], isLoading } = useGetLatestDrawsQuery();

  if (isLoading)
    return <div className="text-gray-400 text-center py-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 text-white">
      <h1 className="text-3xl text-center font-bold mb-6 text-yellow-400">
        Results
      </h1>
      <div className="grid sm:grid-cols-2 gap-6 mx-2">
        {draws.map((g) => {
          const isUpcoming = g.status === "UPCOMING";
          const drawDate = new Date(g.drawDate);
          const formattedDate = drawDate.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
          });

          return (
            <Link
              key={g.gameId}
              href={`/results/${g.gameName.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={g.logoUrl || "/images/default-logo.png"}
                  alt={g.gameName}
                  width={56}
                  height={56}
                  priority
                  className="w-14 h-14 object-contain rounded-md"
                />

                <div>
                  <h2 className="text-xl font-semibold">{g.gameName}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {isUpcoming ? (
                      <>
                        Draw {g.drawNumber} —{" "}
                        <span className="text-yellow-400 font-medium">
                          coming {formattedDate}
                        </span>
                      </>
                    ) : (
                      <>Draw {g.drawNumber}</>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
