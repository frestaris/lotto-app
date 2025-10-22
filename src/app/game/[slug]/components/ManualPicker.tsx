"use client";

import { useState } from "react";
import { Sparkles, Trash2, XCircle, ShoppingCart } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { addTicket } from "@/redux/slices/cartSlice";
import { v4 as uuidv4 } from "uuid";

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
  const dispatch = useAppDispatch();

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
    try {
      // ---- MAIN NUMBERS ----
      const updatedMain = selectedNumbers.map((nums) => {
        // Normalize length with null placeholders
        const filled: (number | null)[] = Array.from(
          { length: game.mainPickCount },
          (_, i) => nums[i] ?? null
        );

        const min = game.mainRangeMin;
        const max = game.mainRangeMax;

        // Skip fully filled games
        const emptyCount = filled.filter((n) => n === null).length;
        if (emptyCount === 0) return filled;

        const picked = new Set(filled.filter((n) => n !== null) as number[]);

        // Only fill the empty slots
        while (filled.some((n) => n === null)) {
          const rand = Math.floor(Math.random() * (max - min + 1)) + min;
          if (!picked.has(rand)) {
            const emptyIndex = filled.findIndex((n) => n === null);
            if (emptyIndex === -1) break; // safety
            filled[emptyIndex] = rand;
            picked.add(rand);
          }
        }

        return filled;
      });

      setSelectedNumbers(updatedMain);

      // ---- SPECIAL NUMBERS ----
      if (game.specialPickCount > 0) {
        setSelectedSpecialNumbers((prev) => {
          const next = Array.from(
            { length: updatedMain.length },
            (_, i) => prev[i] ?? null
          );
          const sMin = game.specialRangeMin ?? 1;
          const sMax = game.specialRangeMax ?? 10;

          for (let i = 0; i < next.length; i++) {
            // Only fill missing specials
            if (next[i] == null) {
              next[i] = Math.floor(Math.random() * (sMax - sMin + 1)) + sMin;
            }
          }
          return next;
        });
      }
    } catch (err) {
      console.error("fastSelect crashed", { err, selectedNumbers, game });
    }
  };

  // Clear all
  const clearAll = () => {
    setSelectedNumbers(
      Array.from({ length: selectedNumbers.length }, () => [])
    );
    setSelectedSpecialNumbers(
      Array.from({ length: selectedSpecialNumbers.length }, () => null)
    );
  };

  // Clear one game
  const clearGame = (index: number) => {
    setSelectedNumbers((prev) => {
      const updated = [...prev];
      updated[index] = [];
      return updated;
    });

    setSelectedSpecialNumbers((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  // Remove game entirely
  const removeGame = (index: number) => {
    if (selectedNumbers.length <= 1) return;

    const updatedGames = selectedNumbers.filter((_, i) => i !== index);
    const updatedSpecials = selectedSpecialNumbers.filter(
      (_, i) => i !== index
    );

    setSelectedNumbers(updatedGames);
    setSelectedSpecialNumbers(updatedSpecials);
    setGamesCount(updatedGames.length);

    // adjust open index
    if (openGameIndex === index) setOpenGameIndex(null);
    else if ((openGameIndex ?? 0) > index)
      setOpenGameIndex((openGameIndex ?? 1) - 1);
  };

  // Handle game count dropdown changes
  const handleGamesCountChange = (value: number) => {
    // Main numbers
    setSelectedNumbers((prev) => {
      if (value < prev.length) return prev.slice(0, value);
      if (value > prev.length) {
        const diff = value - prev.length;
        return [
          ...prev,
          ...Array.from({ length: diff }, () =>
            Array(game.mainPickCount).fill(null)
          ),
        ];
      }
      return prev;
    });

    // Specials
    setSelectedSpecialNumbers((prev) => {
      if (value < prev.length) return prev.slice(0, value);
      if (value > prev.length) {
        const diff = value - prev.length;
        return [...prev, ...Array(diff).fill(null)];
      }
      return prev;
    });

    setGamesCount(value);

    if (openGameIndex !== null && openGameIndex >= value) {
      setOpenGameIndex(value - 1);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    let addedCount = 0;

    selectedNumbers.forEach((nums, i) => {
      const mainNumbers = nums.filter((n): n is number => n !== null);
      const specialNumber = selectedSpecialNumbers[i];

      const isMainFilled = mainNumbers.length === game.mainPickCount;
      const isSpecialFilled =
        game.specialPickCount === 0 || specialNumber !== null;

      if (isMainFilled && isSpecialFilled) {
        const ticket = {
          id: uuidv4(),
          gameId: game.id,
          gameName: game.name,
          numbers: mainNumbers,
          specialNumbers: specialNumber ? [specialNumber] : [],
          priceCents: game.priceCents,
        };

        dispatch(addTicket(ticket));
        addedCount++;
      }
    });

    if (addedCount > 0) {
      console.log(`🎟️ ${addedCount} game(s) added to cart!`);

      // 🧹 Clear everything after successful add
      setSelectedNumbers(
        Array.from({ length: gamesCount }, () =>
          Array(game.mainPickCount).fill(null)
        )
      );
      setSelectedSpecialNumbers(Array.from({ length: gamesCount }, () => null));
    } else {
      console.log("⚠️ No complete games to add!");
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
      {/* 🧾 Sticky Footer */}
      {selectedNumbers.some((nums, i) => {
        const mainFilled =
          nums.filter((n) => n !== null).length === game.mainPickCount;
        const specialFilled =
          game.specialPickCount > 0 ? selectedSpecialNumbers[i] !== null : true;
        return mainFilled && specialFilled;
      }) && (
        <div className="sticky bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 z-50">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-4 gap-4">
            {/* Amount summary */}
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm sm:text-base">
                Total Games:{" "}
                <span className="text-yellow-400 font-semibold">
                  {
                    selectedNumbers.filter((nums, i) => {
                      const mainFilled =
                        nums.filter((n) => n !== null).length ===
                        game.mainPickCount;
                      const specialFilled =
                        game.specialPickCount > 0
                          ? selectedSpecialNumbers[i] !== null
                          : true;
                      return mainFilled && specialFilled;
                    }).length
                  }
                </span>
              </span>

              <span className="text-gray-300 text-sm sm:text-base">
                Total Price:{" "}
                <span className="text-yellow-400 font-semibold">
                  $
                  {(
                    selectedNumbers.filter((nums, i) => {
                      const mainFilled =
                        nums.filter((n) => n !== null).length ===
                        game.mainPickCount;
                      const specialFilled =
                        game.specialPickCount > 0
                          ? selectedSpecialNumbers[i] !== null
                          : true;
                      return mainFilled && specialFilled;
                    }).length *
                    (game.priceCents / 100)
                  ).toFixed(2)}
                </span>
              </span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 bg-green-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-green-400 cursor-pointer transition w-full sm:w-auto"
            >
              <ShoppingCart />
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
