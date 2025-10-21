"use client";

import { useState } from "react";
import { Sparkles, Trash2, XCircle } from "lucide-react";
import type { Game } from "@/types/game";

export default function ManualPicker({ game }: { game: Game }) {
  const [gamesCount, setGamesCount] = useState(3);
  const [selectedNumbers, setSelectedNumbers] = useState<(number | null)[][]>(
    Array.from({ length: 3 }, () => Array(game.mainPickCount).fill(null))
  );
  const [selectedSpecialNumbers, setSelectedSpecialNumbers] = useState<
    (number | null)[]
  >(Array.from({ length: gamesCount }, () => null));

  const [openGameIndex, setOpenGameIndex] = useState<number | null>(0);

  // Toggle a number
  const toggleNumber = (gameIndex: number, num: number) => {
    setSelectedNumbers((prev) => {
      const updated = [...prev];
      const current = [...(updated[gameIndex] || [])];

      const positioned: (number | null)[] = Array.from(
        { length: game.mainPickCount },
        (_, i) => current[i] ?? null
      );

      const existingIndex = positioned.findIndex((n) => n === num);
      if (existingIndex !== -1) {
        positioned[existingIndex] = null;
      } else {
        const firstEmptyIndex = positioned.findIndex((n) => n === null);
        if (firstEmptyIndex !== -1) {
          positioned[firstEmptyIndex] = num;
        }
      }

      updated[gameIndex] = positioned;
      return updated;
    });
  };

  // Toggle special number
  const toggleSpecialNumber = (gameIndex: number, num: number) => {
    setSelectedSpecialNumbers((prev) => {
      const updated = [...prev];
      updated[gameIndex] = prev[gameIndex] === num ? null : num;
      return updated;
    });
  };

  // Fast select numbers for all games
  const fastSelect = () => {
    const updated = Array.from({ length: selectedNumbers.length }, () => {
      const nums: number[] = [];
      while (nums.length < game.mainPickCount) {
        const rand =
          Math.floor(
            Math.random() * (game.mainRangeMax - game.mainRangeMin + 1)
          ) + game.mainRangeMin;
        if (!nums.includes(rand)) nums.push(rand);
      }
      return nums.sort((a, b) => a - b);
    });
    setSelectedNumbers(updated);
  };

  // Clear all
  const clearAll = () => {
    setSelectedNumbers(
      Array.from({ length: selectedNumbers.length }, () => [])
    );
  };

  // Clear one game
  const clearGame = (index: number) => {
    setSelectedNumbers((prev) => {
      const updated = [...prev];
      updated[index] = [];
      return updated;
    });
  };

  // Remove game entirely
  const removeGame = (index: number) => {
    if (selectedNumbers.length <= 1) return; // except the last one

    const updatedGames = selectedNumbers.filter((_, i) => i !== index);
    setSelectedNumbers(updatedGames);
    setGamesCount(updatedGames.length);

    // adjust open index
    if (openGameIndex === index) setOpenGameIndex(null);
    else if ((openGameIndex ?? 0) > index)
      setOpenGameIndex((openGameIndex ?? 1) - 1);
  };

  // Handle game count dropdown changes
  const handleGamesCountChange = (value: number) => {
    // If reducing games, slice off extras
    if (value < selectedNumbers.length) {
      setSelectedNumbers((prev) => prev.slice(0, value));
    } else if (value > selectedNumbers.length) {
      // If increasing games, add empty arrays
      const diff = value - selectedNumbers.length;
      setSelectedNumbers((prev) => [
        ...prev,
        ...Array.from({ length: diff }, () => []),
      ]);
    }
    setGamesCount(value);

    // Make sure the open game index remains valid
    if (openGameIndex !== null && openGameIndex >= value) {
      setOpenGameIndex(value - 1);
    }
  };

  return (
    <div className="max-w-5xl lg:mx-auto mx-4 text-left space-y-8 text-white">
      {/* STEP 1 */}
      <div>
        <h2 className="flex items-center gap-2 text-md sm:text-xl font-semibold mb-2">
          <span className="w-8 h-8 flex items-center justify-center rounded-full font-semibold bg-green-600 text-white">
            1
          </span>
          Choose how many games:
        </h2>
        <select
          value={gamesCount}
          onChange={(e) => handleGamesCountChange(Number(e.target.value))}
          className="bg-black border border-white/20 text-gray-200 rounded-lg px-4 py-2 cursor-pointer"
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} Game{n > 1 && "s"} – $
              {(n * (game.priceCents / 100)).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {/* STEP 2 */}
      <div>
        <h2 className="flex items-center gap-2 text-md sm:text-xl font-semibold mb-2">
          <span className="w-8 h-8 flex items-center justify-center rounded-full font-semibold bg-green-600 text-white">
            2
          </span>
          Choose your numbers:
        </h2>
        <p className="text-gray-400 mb-6 text-sm">
          Pick your own numbers or use fast select to auto-fill.
        </p>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={fastSelect}
              className="flex items-center justify-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 hover:cursor-pointer transition w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              Fast select unfilled
            </button>
            <button
              onClick={clearAll}
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-gray-300 hover:bg-white/20 hover:cursor-pointer transition w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>

        {/* Accordion Games */}
        <div className="space-y-3">
          {selectedNumbers.map((nums, i) => {
            const isOpen = openGameIndex === i;

            return (
              <div
                key={i}
                className="border border-white/10 rounded-lg overflow-hidden bg-white/5"
              >
                {/* Accordion Header */}
                <div
                  className={`flex flex-wrap justify-between items-center gap-2 px-3 py-2 transition ${
                    isOpen ? "bg-white/10" : "hover:bg-white/10"
                  }`}
                >
                  {/* Left section (Game label + Numbers) */}
                  <button
                    onClick={() => setOpenGameIndex(isOpen ? null : i)}
                    className="flex flex-wrap items-center gap-2 sm:gap-3 text-left hover:cursor-pointer flex-1"
                  >
                    {/* Game label */}
                    <span className="text-yellow-400 font-medium text-sm sm:text-base md:text-lg whitespace-nowrap">
                      Game {i + 1}
                    </span>

                    {/* Number slots */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {Array.from({ length: game.mainPickCount }).map(
                        (_, idx) => {
                          const num = nums[idx];
                          return (
                            <span
                              key={idx}
                              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border font-medium text-[10px] sm:text-xs md:text-sm transition-all duration-200 ${
                                num
                                  ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                                  : "border-white/20 text-gray-500 bg-transparent shadow-[0_0_4px_rgba(255,255,255,0.15)]"
                              }`}
                            >
                              {num || ""}
                            </span>
                          );
                        }
                      )}

                      {/* Special number bubble (always shown, filled or empty) */}
                      <span
                        className={`ml-3 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border font-medium text-[10px] sm:text-xs md:text-sm transition-all duration-200 ${
                          selectedSpecialNumbers[i]
                            ? "bg-orange-500 text-black border-orange-500 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                            : " text-gray-500 bg-transparent"
                        }`}
                      >
                        {selectedSpecialNumbers[i] || ""}
                      </span>
                    </div>
                  </button>

                  {/* Right section (icons) */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => clearGame(i)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-yellow-400 cursor-pointer transition"
                      title="Clear this game's numbers"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {selectedNumbers.length > 1 && (
                      <button
                        onClick={() => removeGame(i)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 cursor-pointer transition"
                        title="Remove this game"
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Accordion Body */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[800px] py-4" : "max-h-0 py-0"
                  }`}
                >
                  {isOpen && (
                    <>
                      {/* 🎯 MAIN NUMBERS */}
                      <div className="flex justify-center">
                        <div className="flex flex-wrap justify-start gap-2 sm:gap-2.5 md:gap-3 p-2 sm:p-3 max-w-[600px] w-full mx-auto">
                          {Array.from(
                            {
                              length: game.mainRangeMax - game.mainRangeMin + 1,
                            },
                            (_, j) => game.mainRangeMin + j
                          ).map((num) => (
                            <button
                              key={num}
                              onClick={() => toggleNumber(i, num)}
                              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border font-medium text-xs sm:text-sm md:text-base transition cursor-pointer ${
                                nums.includes(num)
                                  ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                                  : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/20"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ⭐ SPECIAL NUMBERS (only if game has them) */}
                      {game.specialPickCount > 0 && (
                        <>
                          <p className="text-center text-sm text-gray-400 mt-6 mb-2">
                            Select your special number
                            {game.specialPickCount > 1 && "s"}:
                          </p>
                          <div className="flex justify-center">
                            <div className="flex flex-wrap justify-start gap-2 sm:gap-2.5 md:gap-3 p-2 sm:p-3 max-w-[600px] w-full mx-auto">
                              {Array.from(
                                {
                                  length:
                                    (game.specialRangeMax ?? 0) -
                                    (game.specialRangeMin ?? 0) +
                                    1,
                                },
                                (_, j) => (game.specialRangeMin ?? 1) + j
                              ).map((num) => (
                                <button
                                  key={`special-${num}`}
                                  onClick={() => toggleSpecialNumber(i, num)}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border font-medium text-xs sm:text-sm md:text-base transition cursor-pointer ${
                                    selectedSpecialNumbers[i] === num
                                      ? "bg-orange-500 text-black border-orange-500 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/20"
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
