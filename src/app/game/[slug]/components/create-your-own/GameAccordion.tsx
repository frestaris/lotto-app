"use client";

import { Trash2, XCircle } from "lucide-react";
import type { Game } from "@/types/game";

interface GameAccordionProps {
  index: number;
  nums: (number | null)[];
  special: number | null;
  game: Game;
  isOpen: boolean;
  onToggle: () => void;
  onToggleNumber: (i: number, num: number) => void;
  onToggleSpecial: (i: number, num: number) => void;
  onClear: () => void;
  onRemove: () => void;
}

export default function GameAccordion({
  index,
  nums,
  special,
  game,
  isOpen,
  onToggle,
  onToggleNumber,
  onToggleSpecial,
  onClear,
  onRemove,
}: GameAccordionProps) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
      {/* Accordion Header */}
      <div
        onClick={onToggle}
        className={`flex flex-wrap justify-between items-center gap-2 px-3 py-2 transition cursor-pointer ${
          isOpen ? "bg-white/10" : "hover:bg-white/10"
        }`}
      >
        {/* Left section (Game label + Numbers) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          <span className="text-yellow-400 font-medium text-sm sm:text-base md:text-lg whitespace-nowrap">
            Game {index + 1}
          </span>

          {/* Number slots */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {Array.from({ length: game.mainPickCount }).map((_, idx) => {
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
            })}

            {/* Special number bubble */}
            {game.specialPickCount > 0 && (
              <span
                className={`ml-3 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border font-medium text-[10px] sm:text-xs md:text-sm transition-all duration-200 ${
                  special
                    ? "bg-orange-500 text-black border-orange-500 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                    : "text-gray-500 bg-transparent"
                }`}
              >
                {special || ""}
              </span>
            )}
          </div>
        </div>

        {/* Right section (icons) */}
        <div
          className="flex items-center gap-2 sm:gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClear}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-yellow-400 cursor-pointer transition"
            title="Clear this game's numbers"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Hide remove if only one game */}
          {game.mainPickCount > 1 && (
            <button
              onClick={onRemove}
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
                    onClick={() => onToggleNumber(index, num)}
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

            {/* ⭐ SPECIAL NUMBERS */}
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
                        onClick={() => onToggleSpecial(index, num)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border font-medium text-xs sm:text-sm md:text-base transition cursor-pointer ${
                          special === num
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
}
