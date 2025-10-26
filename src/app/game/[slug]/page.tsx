"use client";

import { useParams } from "next/navigation";
import { useGetGameBySlugQuery } from "@/redux/slices/gameApi";
import { useState } from "react";
import { Draw } from "@/types/game";
import GameHeader from "./components/GameHeader";
import PlayOptions from "./components/PlayOptions";
import Skeleton from "@/components/Skeleton";

export default function GameDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const { data: game, isLoading, error } = useGetGameBySlugQuery(slug);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Game not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white pb-16">
      {/* Header Section */}
      {isLoading || !game ? (
        <div className="max-w-5xl mx-auto py-16 px-6 text-center space-y-6">
          <Skeleton height="h-20" width="w-20 mx-auto rounded-full" />
          <Skeleton height="h-8" width="w-1/3 mx-auto" />
          <Skeleton height="h-4" width="w-1/2 mx-auto" />
        </div>
      ) : (
        <GameHeader
          game={game}
          selectedDraw={selectedDraw}
          setSelectedDraw={setSelectedDraw}
        />
      )}

      {/* Play Options Section */}
      {isLoading || !game ? (
        <div className="max-w-4xl mx-auto mt-12 px-6 space-y-4">
          {/* Header skeletons */}
          <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-6 space-y-4 sm:space-y-0">
            <Skeleton height="h-14" width="w-1/3 sm:w-1/4" />
            <Skeleton height="h-14" width="w-1/2 sm:w-1/3" />
          </div>

          <Skeleton height="h-8" width="w-1/2 mx-auto" />
          <Skeleton height="h-4" width="w-1/2 mx-auto" />

          {/* Grid skeletons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="h-30" />
            ))}
          </div>
        </div>
      ) : (
        <PlayOptions game={game} selectedDraw={selectedDraw} />
      )}
    </div>
  );
}
