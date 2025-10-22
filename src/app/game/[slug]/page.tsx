"use client";

import { useParams } from "next/navigation";
import { useGetGameBySlugQuery } from "@/redux/slices/gameApi";
import { Loader2 } from "lucide-react";
import GameHeader from "./components/GameHeader";
import PlayOptions from "./components/PlayOptions";

export default function GameDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const { data: game, isLoading, error } = useGetGameBySlugQuery(slug);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading game details…
      </div>
    );

  if (error || !game)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Game not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white pb-16">
      <GameHeader game={game} />
      <PlayOptions game={game} />
    </div>
  );
}
