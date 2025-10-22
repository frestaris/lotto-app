"use client";

import { Sparkles, Trash2 } from "lucide-react";
import type { Game } from "@/types/game";

interface PickerSetupProps {
  gamesCount: number;
  game: Game;
  onCountChange: (value: number) => void;
  onAdjust: React.Dispatch<React.SetStateAction<(number | null)[][]>>;
  setSpecials: React.Dispatch<React.SetStateAction<(number | null)[]>>;
  onFastSelect: () => void;
  onClearAll: () => void;
}

export default function PickerSetup({
  gamesCount,
  game,
  onCountChange,
  onAdjust,
  setSpecials,
  onFastSelect,
  onClearAll,
}: PickerSetupProps) {
  // Handle game count change
  const handleCountChange = (value: number) => {
    // Adjust main numbers
    onAdjust((prev) => {
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

    // Adjust specials
    setSpecials((prev) => {
      if (value < prev.length) return prev.slice(0, value);
      if (value > prev.length) {
        const diff = value - prev.length;
        return [...prev, ...Array(diff).fill(null)];
      }
      return prev;
    });

    onCountChange(value);
  };

  return (
    <div className="space-y-10">
      {/* STEP 1 — Choose number of games */}
      <div>
        <h2 className="flex items-center gap-2 text-md sm:text-xl font-semibold mb-2">
          <span className="w-8 h-8 flex items-center justify-center rounded-full font-semibold bg-green-600 text-white">
            1
          </span>
          Choose how many games:
        </h2>

        <select
          value={gamesCount}
          onChange={(e) => handleCountChange(Number(e.target.value))}
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

      {/* STEP 2 — Controls */}
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onFastSelect}
              className="flex items-center justify-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition w-full sm:w-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Fast select unfilled
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-gray-300 hover:bg-white/20 transition w-full sm:w-auto cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
