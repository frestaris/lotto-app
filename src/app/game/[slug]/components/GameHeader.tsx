"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { CalendarDays, ChevronDown, CheckCircle2 } from "lucide-react";
import type { Game, Draw } from "@/types/game";
import { useGetDrawsByGameIdQuery } from "@/redux/slices/gameApi";

interface GameHeaderProps {
  game: Game;
  selectedDraw: Draw | null;
  setSelectedDraw: React.Dispatch<React.SetStateAction<Draw | null>>;
}

export default function GameHeader({
  game,
  selectedDraw,
  setSelectedDraw,
}: GameHeaderProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const { data: draws = [], isLoading } = useGetDrawsByGameIdQuery(game.id) as {
    data: Draw[] | undefined;
    isLoading: boolean;
  };

  // Filter out past draws and sort upcoming ones
  const upcomingDraws = useMemo(() => {
    const now = new Date();
    return draws
      .filter((d) => new Date(d.drawDate) > now)
      .sort(
        (a, b) =>
          new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime()
      );
  }, [draws]);

  // Pick next upcoming draw by default
  useEffect(() => {
    if (upcomingDraws.length && !selectedDraw) {
      setSelectedDraw(upcomingDraws[0]);
    }
  }, [upcomingDraws, selectedDraw, setSelectedDraw]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-10 text-gray-400">
        Loading draws...
      </div>
    );

  if (!upcomingDraws.length)
    return (
      <div className="flex items-center justify-center py-10 text-gray-400">
        No upcoming draws found.
      </div>
    );

  const currentDraw =
    upcomingDraws.find((d) => d.id === selectedDraw?.id) || upcomingDraws[0];

  const displayDrawDate = new Date(currentDraw.drawDate).toLocaleDateString(
    undefined,
    { weekday: "long", day: "numeric", month: "short", year: "numeric" }
  );

  const jackpotAmount = `$${(
    (currentDraw?.jackpotCents ??
      game.currentJackpotCents ??
      game.baseJackpotCents ??
      0) / 100
  ).toLocaleString()}`;

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white py-12 border-b border-white/10">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        {/* Logo + title */}
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

        {/* Current draw info */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-200">
              {displayDrawDate}
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
            Draw {currentDraw.drawNumber}
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
              {/* Left — next draw */}
              <div>
                <h3 className="font-bold text-lg mb-2 text-yellow-400">
                  Play the next available draw:
                </h3>
                {upcomingDraws.slice(0, 1).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDraw(d);
                      setShowCalendar(false);
                    }}
                    className={`flex items-center gap-3 border-t border-white/10 pt-3 cursor-pointer rounded-md p-2 transition ${
                      selectedDraw?.id === d.id
                        ? "bg-yellow-400/10 border border-yellow-400"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <CheckCircle2 className="text-yellow-400 w-5 h-5" />
                    <div>
                      <p className="font-semibold text-white">
                        {new Date(d.drawDate).toLocaleDateString(undefined, {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      <p className="text-yellow-400 text-sm">
                        Jackpot: $
                        {(
                          (d.jackpotCents ??
                            game.currentJackpotCents ??
                            game.baseJackpotCents ??
                            0) / 100
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right — rest of draws */}
              <div>
                <h3 className="font-bold text-lg mb-2 text-yellow-400">
                  Upcoming draws:
                </h3>
                <ul className="space-y-2 border-t border-white/10 pt-3">
                  {upcomingDraws.slice(1).map((d) => (
                    <li
                      key={d.id}
                      onClick={() => {
                        setSelectedDraw(d);
                        setShowCalendar(false);
                      }}
                      className={`hover:bg-white/10 p-2 rounded cursor-pointer transition text-gray-300 ${
                        selectedDraw?.id === d.id
                          ? "bg-yellow-400/10 border border-yellow-400"
                          : ""
                      }`}
                    >
                      {new Date(d.drawDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      — Draw {d.drawNumber}
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
