"use client";

import { useState, useEffect, useMemo } from "react";
import * as Icons from "lucide-react";
import { CalendarDays, ChevronDown, CheckCircle2 } from "lucide-react";
import type { GameWithDraws } from "@/redux/api/gameApi";
import type { Draw } from "@/types/game";
import { getGameColor } from "@/utils/getGameColor";
import Spinner from "@/components/Spinner";
import { formatDate } from "@/utils/formatDate";

interface GameHeaderProps {
  game: GameWithDraws;
  selectedDraw: Draw | null;
  setSelectedDraw: React.Dispatch<React.SetStateAction<Draw | null>>;
}

export default function GameHeader({
  game,
  selectedDraw,
  setSelectedDraw,
}: GameHeaderProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const draws = useMemo(() => game.draws ?? [], [game.draws]);

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

  const currentDraw =
    upcomingDraws.find((d) => d.id === selectedDraw?.id) ||
    upcomingDraws[0] ||
    null;

  const displayDrawDate = currentDraw ? (
    formatDate(currentDraw.drawDate)
  ) : (
    <Spinner size="sm" />
  );

  const isNextDraw = upcomingDraws[0]?.id === currentDraw?.id;
  const jackpotAmount = currentDraw ? (
    isNextDraw ? (
      `$${(
        (currentDraw.jackpotCents ??
          game.jackpotCents ??
          game.currentJackpotCents ??
          game.baseJackpotCents ??
          0) / 100
      ).toLocaleString()}`
    ) : (
      "Announcing Soon"
    )
  ) : (
    <Spinner size="sm" />
  );

  const Icon =
    (Icons[game.iconName as keyof typeof Icons] as React.ElementType) ||
    Icons.Ticket;
  const iconColor = getGameColor(game.slug);

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white py-12 border-b border-white/10">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        {/* 🎯 Icon + title */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-yellow-400/30 bg-black/20 p-2">
            <Icon
              className={`w-12 h-12 ${iconColor} drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]`}
            />
          </div>
          <h1 className="text-4xl font-bold text-yellow-400">{`Play ${game.name}`}</h1>
        </div>

        {/* 🗓️ Current draw info */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-200">
              {displayDrawDate || "Loading date..."}
            </h2>
            {upcomingDraws.length > 0 && (
              <button
                onClick={() => setShowCalendar((p) => !p)}
                className="flex items-center gap-1 px-2 py-1 border border-white/20 rounded-md text-gray-400 hover:text-yellow-400 hover:border-yellow-400 transition cursor-pointer"
              >
                <CalendarDays className="w-4 h-4" />
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>

          <span className="text-gray-400 text-sm">
            {currentDraw ? `Draw ${currentDraw.drawNumber}` : "Loading draw..."}
          </span>

          <span
            className={`text-2xl font-bold ${
              jackpotAmount === "Announcing Soon"
                ? "text-gray-400 italic"
                : "text-yellow-400"
            }`}
          >
            {jackpotAmount || "Loading jackpot..."}
          </span>

          <span className="text-gray-400 text-sm">
            {jackpotAmount === "Announcing Soon" ? "" : "COMING UP"}
          </span>
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
                        {formatDate(d.drawDate)}
                      </p>
                      <p className="text-yellow-400 text-sm">
                        Jackpot: $
                        {(
                          (d.jackpotCents ??
                            game.jackpotCents ??
                            game.currentJackpotCents ??
                            game.baseJackpotCents ??
                            0) / 100
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right — future draws */}
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
