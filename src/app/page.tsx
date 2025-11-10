"use client";

import { useGetAllGamesQuery, usePrefetch } from "@/redux/api/gameApi";
import { getGameColor } from "@/utils/getGameColor";
import * as Icons from "lucide-react";
import Link from "next/link";
import type { Game } from "@/types/game";
import GameCard from "@/components/GameCard";
import Skeleton from "@/components/Skeleton";
import { useState } from "react";
import Modal from "@/components/Modal";

export default function HomePage() {
  const { data: games = [], isLoading, error } = useGetAllGamesQuery();
  const prefetchGame = usePrefetch("getGameFull");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleInfoClick = (game: Game, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedGame(game);
  };

  const closeModal = () => setSelectedGame(null);

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
      <section
        className="flex flex-col justify-evenly items-center text-center px-6 py-12 gap-10"
        style={{ minHeight: "calc(100vh - 72px)" }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.12)_0%,rgba(0,0,0,1)_70%)] pointer-events-none" />

        {/* Hero Content */}
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
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3 animate-pulse"
                >
                  <Skeleton height="h-12" width="w-12 mx-auto" />
                  <Skeleton height="h-5" width="w-3/4 mx-auto" />
                  <Skeleton height="h-6" width="w-1/2 mx-auto" />
                  <Skeleton height="h-4" width="w-2/3 mx-auto" />
                  <Skeleton height="h-3" width="w-1/3 mx-auto" />
                </div>
              ))
            : games.slice(0, 8).map((game: Game) => {
                const Icon =
                  (Icons[
                    game.iconName as keyof typeof Icons
                  ] as React.ElementType) || Icons.Ticket;

                return (
                  <Link
                    key={game.id}
                    href={`/game/${game.slug}`}
                    onMouseEnter={() => prefetchGame(game.slug)}
                  >
                    <GameCard
                      description={
                        <button
                          onClick={(e) => handleInfoClick(game, e)}
                          className="p-1.5 rounded-full bg-white/10 hover:bg-yellow-400 hover:text-black hover:cursor-pointer transition"
                          title="Game info"
                        >
                          <Icons.Info className="w-4 h-4" />
                        </button>
                      }
                    >
                      {/* Icon */}
                      <div className="transition-transform duration-300 group-hover:scale-110">
                        <Icon
                          className={`w-12 h-12 ${getGameColor(
                            game.slug
                          )} drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]`}
                        />
                      </div>

                      {/* Game name */}
                      <h2 className="text-lg font-semibold group-hover:text-yellow-400 transition-colors duration-200">
                        {game.name}
                      </h2>

                      {/* ✅ Jackpot restored */}
                      {game.jackpotCents && (
                        <p className="text-xl font-bold text-yellow-400 transition-opacity duration-300 group-hover:opacity-90">
                          $
                          {(game.jackpotCents / 100).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      )}

                      <p className="text-sm text-gray-400">
                        {game.drawFrequency}
                      </p>

                      {/* ✅ Divider + ticket price restored */}
                      <div className="h-[3px] w-1/2 bg-yellow-400/30 mt-2 rounded-full"></div>
                      <p className="text-xs text-gray-500">
                        ${(game.priceCents / 100).toFixed(2)} per ticket
                      </p>
                    </GameCard>
                  </Link>
                );
              })}
        </div>
        {/* INFO MODAL */}
        {selectedGame && (
          <Modal isOpen={true} onClose={closeModal} title={selectedGame.name}>
            <div className="space-y-5 text-gray-300 text-center">
              {/* Icon + Name */}
              <div className="flex flex-col items-center justify-center">
                {(() => {
                  const Icon =
                    (Icons[
                      selectedGame.iconName as keyof typeof Icons
                    ] as React.ElementType) || Icons.Ticket;
                  return (
                    <Icon
                      className={`w-12 h-12 mb-3 ${getGameColor(
                        selectedGame.slug
                      )} drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]`}
                    />
                  );
                })()}
              </div>
              {/* Description */}
              <p className="leading-relaxed text-gray-300">
                {selectedGame.description}
              </p>
            </div>
          </Modal>
        )}
      </section>
    </div>
  );
}
