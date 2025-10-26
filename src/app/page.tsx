"use client";

import { useGetAllGamesQuery } from "@/redux/slices/gameApi";
import { getGameColor } from "@/utils/getGameColor";
import * as Icons from "lucide-react";
import Link from "next/link";
import type { Game } from "@/types/game";
import Spinner from "@/components/Spinner";

export default function HomePage() {
  const { data: games = [], isLoading, error } = useGetAllGamesQuery();

  if (isLoading) return <Spinner message="Loading games…" variant="accent" />;

  if (error)
    return (
      <div className="h-[calc(100vh-72px)] flex items-center justify-center bg-[#0a0a0a] text-red-400 overflow-hidden select-none">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Failed to load games</p>
          <p className="text-sm text-gray-500">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );

  return (
    <div className="relative text-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] overflow-hidden">
      {/* HERO */}
      <section
        className="flex flex-col justify-between items-center text-center px-6 py-12 gap-10"
        style={{ minHeight: "calc(100vh - 72px)" }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.12)_0%,rgba(0,0,0,1)_70%)] pointer-events-none" />

        {/* HERO CONTENT */}
        <div className="z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Play Your Favourite{" "}
            <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
              Lotto
            </span>{" "}
            Games
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Choose your lucky numbers, play online, and check results — all in
            one place.
          </p>

          <Link
            href="/results"
            className="inline-block px-8 py-3 rounded-full font-semibold bg-yellow-400 text-black hover:bg-yellow-500 transition shadow-[0_0_20px_rgba(255,215,0,0.3)]"
          >
            View Latest Results
          </Link>
        </div>

        {/* GAME CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl w-full z-10">
          {games.slice(0, 8).map((game: Game) => {
            const Icon =
              (Icons[
                game.iconName as keyof typeof Icons
              ] as React.ElementType) || Icons.Ticket;

            return (
              <Link
                key={game.id}
                href={`/game/${game.slug}`}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#161616] to-[#0a0a0a] overflow-hidden hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all duration-300"
              >
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <Icon
                      className={`w-12 h-12 ${getGameColor(
                        game.slug
                      )} drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]`}
                    />
                  </div>

                  <h2 className="text-lg font-semibold group-hover:text-yellow-400 transition-colors duration-200">
                    {game.name}
                  </h2>

                  {game.currentJackpotCents && (
                    <p className="text-xl font-bold text-yellow-400 transition-opacity duration-300 group-hover:opacity-90">
                      $
                      {(game.currentJackpotCents / 100).toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </p>
                  )}

                  <p className="text-sm text-gray-400">{game.drawFrequency}</p>
                  <div className="h-[3px] w-1/2 bg-yellow-400/30 mt-2 rounded-full"></div>
                  <p className="text-xs text-gray-500">
                    ${(game.priceCents / 100).toFixed(2)} per ticket
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
