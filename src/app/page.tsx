"use client";

import { useGetAllGamesQuery } from "@/redux/slices/gameApi";
import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/types/game";

export default function HomePage() {
  const { data: games = [], isLoading, error } = useGetAllGamesQuery(undefined);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading games…
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Failed to load games.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white">
      {/* 🏠 Hero Section */}
      <section className="text-center py-16 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Play Your Favourite <span className="text-yellow-400">Lotto</span>{" "}
          Games
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
          Choose your lucky numbers, play online, and check results all in one
          place.
        </p>

        {/* 🎮 CTA Buttons */}

        <Link
          href="/results"
          className="border border-yellow-400 text-yellow-400 font-semibold px-8 py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition"
        >
          Latest Results
        </Link>
      </section>

      {/* 🎲 Games Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {games.map((game: Game) => (
          <Link
            key={game.id}
            href={`/game/${game.slug}`}
            className="group bg-white/10 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-white/10"
          >
            <div className="relative h-48 bg-black">
              <Image
                src={game.logoUrl || "/images/default-logo.png"}
                alt={game.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform"
                priority
              />
            </div>

            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold group-hover:text-yellow-400">
                {game.name}
              </h2>

              {/* Draw frequency */}
              <p className="text-sm text-gray-400">{game.drawFrequency}</p>

              {/* Current Jackpot */}
              {game.currentJackpotCents && (
                <p className="text-lg font-bold text-yellow-400">
                  $
                  {(game.currentJackpotCents / 100).toLocaleString(undefined, {
                    currency: game.jackpotCurrency || "AUD",
                    maximumFractionDigits: 0,
                  })}
                </p>
              )}

              {/* Ticket price */}
              <p className="text-sm text-gray-400">
                ${(game.priceCents / 100).toFixed(2)} per ticket
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
