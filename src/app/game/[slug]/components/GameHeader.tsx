"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, ChevronDown, CheckCircle2 } from "lucide-react";
import type { Game } from "@/types/game";

export default function GameHeader({ game }: { game: Game }) {
  const [showCalendar, setShowCalendar] = useState(false);

  // Dummy draw data
  const draws = [
    {
      date: "Tuesday, 21 Oct 2025",
      jackpot: "$8 MILLION THIS TUESDAY",
      active: true,
    },
    { date: "Tuesday, 28 Oct 2025" },
    { date: "Tuesday, 4 Nov 2025" },
    { date: "Tuesday, 11 Nov 2025" },
    { date: "Tuesday, 18 Nov 2025" },
    { date: "Tuesday, 25 Nov 2025" },
    { date: "Tuesday, 2 Dec 2025" },
    { date: "Tuesday, 9 Dec 2025" },
  ];

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
              Tue, 21 Oct 2025
            </h2>
            <button
              onClick={() => setShowCalendar((p) => !p)}
              className="flex items-center gap-1 px-2 py-1 border border-white/20 rounded-md text-gray-400 hover:text-yellow-400 hover:border-yellow-400 transition cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <span className="text-gray-400 text-sm">Draw 1653</span>

          <div className="ml-4 flex items-center gap-2">
            <span className="text-yellow-400 text-2xl font-bold">
              $8 MILLION
            </span>
            <span className="text-gray-400 text-sm">THIS TUESDAY</span>
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
              {/* Left Column */}
              <div>
                <h3 className="font-bold text-lg mb-2 text-yellow-400">
                  Play the next available draw:
                </h3>
                {draws.slice(0, 1).map((draw) => (
                  <div
                    key={draw.date}
                    className="flex items-center gap-3 border-t border-white/10 pt-3"
                  >
                    <CheckCircle2 className="text-yellow-400 w-5 h-5" />
                    <div>
                      <p className="font-semibold text-white">{draw.date}</p>
                      <p className="text-yellow-400 text-sm">{draw.jackpot}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div>
                <h3 className="font-bold text-lg mb-2 text-yellow-400">
                  Or select an upcoming draw:
                </h3>
                <ul className="space-y-2 border-t border-white/10 pt-3">
                  {draws.slice(1).map((draw) => (
                    <li
                      key={draw.date}
                      className="hover:bg-white/10 p-2 rounded cursor-pointer transition text-gray-300"
                    >
                      {draw.date}
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
