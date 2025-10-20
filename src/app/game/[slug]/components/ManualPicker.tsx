"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Game } from "@prisma/client";

interface ManualPickerProps {
  game: Game;
}

export default function ManualPicker({ game }: ManualPickerProps) {
  const [selectedMain, setSelectedMain] = useState<number[]>([]);
  const [selectedSpecial, setSelectedSpecial] = useState<number[]>([]);

  const toggleNumber = (num: number, type: "main" | "special") => {
    if (type === "main") {
      setSelectedMain((prev) =>
        prev.includes(num)
          ? prev.filter((n) => n !== num)
          : prev.length < (game.mainPickCount || 0)
          ? [...prev, num]
          : prev
      );
    } else {
      setSelectedSpecial((prev) =>
        prev.includes(num)
          ? prev.filter((n) => n !== num)
          : prev.length < (game.specialPickCount || 0)
          ? [...prev, num]
          : prev
      );
    }
  };

  const handleConfirm = () => {
    alert(
      `✅ Your ticket:\nMain: ${selectedMain.join(", ")}${
        selectedSpecial.length
          ? ` | Special: ${selectedSpecial.join(", ")}`
          : ""
      }`
    );
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 text-center">
      <h3 className="text-xl font-semibold mb-6 text-gray-200">
        Pick your {game.mainPickCount} main numbers
      </h3>
      <div className="grid grid-cols-10 gap-3 justify-center">
        {Array.from(
          { length: game.mainRangeMax - game.mainRangeMin + 1 },
          (_, i) => game.mainRangeMin + i
        ).map((num) => (
          <button
            key={num}
            onClick={() => toggleNumber(num, "main")}
            className={`w-10 h-10 flex items-center justify-center rounded-full border font-semibold transition ${
              selectedMain.includes(num)
                ? "bg-yellow-400 text-black border-yellow-500"
                : "bg-white/5 text-gray-300 hover:bg-white/20 border-white/10"
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {game.specialPickCount > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-10 mb-6 text-gray-200">
            Pick your {game.specialPickCount} special number
          </h3>
          <div className="grid grid-cols-10 gap-3 justify-center">
            {Array.from(
              {
                length:
                  (game.specialRangeMax || 10) -
                  (game.specialRangeMin || 1) +
                  1,
              },
              (_, i) => (game.specialRangeMin || 1) + i
            ).map((num) => (
              <button
                key={`special-${num}`}
                onClick={() => toggleNumber(num, "special")}
                className={`w-10 h-10 flex items-center justify-center rounded-full border font-semibold transition ${
                  selectedSpecial.includes(num)
                    ? "bg-orange-500 text-black border-orange-400"
                    : "bg-white/5 text-gray-300 hover:bg-white/20 border-white/10"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-10">
        <button
          disabled={
            selectedMain.length < game.mainPickCount ||
            (game.specialPickCount > 0 &&
              selectedSpecial.length < game.specialPickCount)
          }
          onClick={handleConfirm}
          className="flex items-center gap-2 px-6 py-3 mx-auto rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition disabled:opacity-40"
        >
          <Check className="w-5 h-5" />
          Confirm Selection
        </button>
      </div>
    </div>
  );
}
