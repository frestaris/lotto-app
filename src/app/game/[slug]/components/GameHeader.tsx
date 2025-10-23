"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CalendarDays, ChevronDown, CheckCircle2 } from "lucide-react";
import type { Game } from "@/types/game";
import { getNextDrawDates } from "@/utils/getNextDrawDates";

interface GameHeaderProps {
  game: Game;
  selectedDraw: string | null;
  setSelectedDraw: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function GameHeader({
  game,
  selectedDraw,
  setSelectedDraw,
}: GameHeaderProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [draws, setDraws] = useState<string[]>([]);

  // Generate next 6 draws based on drawFrequency (e.g., "Thursday 8 PM")
  useEffect(() => {
    if (game.drawFrequency) {
      const now = new Date();
      const futureDraws = getNextDrawDates(game.drawFrequency, 6)
        .map((d) => d.toISOString())
        .filter((iso) => new Date(iso) > now); // ✅ only future draws

      setDraws(futureDraws);

      if (futureDraws.length && !selectedDraw) {
        setSelectedDraw(futureDraws[0]);
      }
    }
  }, [game.drawFrequency, selectedDraw, setSelectedDraw]);

  if (!draws.length) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400">
        No upcoming draws found.
      </div>
    );
  }
  const nextDraw = draws[0];
  const nextDrawFormatted = new Date(nextDraw).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const displayDraw = selectedDraw || nextDraw;
  // Format display date
  const displayDrawDate = new Date(displayDraw);
  const displayDrawFormatted = displayDrawDate.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const jackpotAmount = `$${(8_000_000).toLocaleString()}`;

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white py-12 border-b border-white/10">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        {/* Title + Logo */}
        <div className="flex flex-col items-center justify-center gap-4">
          {game.logoUrl && (
            <div className="relative w-20 h-20">
              <Image
                src={game.logoUrl}
                alt={game.name}
                fill
                sizes="80px"
                className="object-contain rounded-full border border-yellow-400/30 bg-black/20 p-2"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold text-yellow-400">{`Play ${game.name}`}</h1>
        </div>

        {/* Date + Draw Info */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-200">
              {displayDrawFormatted}
            </h2>
            <button
              onClick={() => setShowCalendar((p) => !p)}
              className="flex items-center gap-1 px-2 py-1 border border-white/20 rounded-md text-gray-400 hover:text-yellow-400 hover:border-yellow-400 transition cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <span className="text-gray-400 text-sm">
            Draw {draws.findIndex((d) => d === (selectedDraw || draws[0])) + 1}
          </span>

          <div className="ml-4 flex items-center gap-2">
            <span className="text-yellow-400 text-2xl font-bold">
              {jackpotAmount}
            </span>
            <span className="text-gray-400 text-sm">COMING UP</span>
          </div>
        </div>
      </div>

      {/* Calendar modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#121212] text-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative border border-white/10">
            <button
              onClick={() => setShowCalendar(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-yellow-400"
            >
              ✕
            </button>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              {/* Left Column — Next Draw */}
              <div>
                <h3 className="font-bold text-lg mb-2 text-yellow-400">
                  Play the next available draw:
                </h3>
                <div
                  onClick={() => {
                    setSelectedDraw(nextDraw);
                    setShowCalendar(false);
                  }}
                  className={`flex items-center gap-3 border-t border-white/10 pt-3 cursor-pointer rounded-md p-2 transition ${
                    selectedDraw === nextDraw
                      ? "bg-yellow-400/10 border border-yellow-400"
                      : "hover:bg-white/10"
                  }`}
                >
                  <CheckCircle2 className="text-yellow-400 w-5 h-5" />
                  <div>
                    <p className="font-semibold text-white">
                      {nextDrawFormatted}
                    </p>
                    <p className="text-yellow-400 text-sm">
                      Jackpot: {jackpotAmount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column — Upcoming Draws */}
              <div>
                <h3 className="font-bold text-lg mb-2 text-yellow-400">
                  Upcoming draws:
                </h3>
                <ul className="space-y-2 border-t border-white/10 pt-3">
                  {draws.slice(1).map((date, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setSelectedDraw(date);
                        setShowCalendar(false);
                      }}
                      className={`hover:bg-white/10 p-2 rounded cursor-pointer transition text-gray-300 ${
                        selectedDraw === date
                          ? "bg-yellow-400/10 border border-yellow-400"
                          : ""
                      }`}
                    >
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      — Draw #{i + 2}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
