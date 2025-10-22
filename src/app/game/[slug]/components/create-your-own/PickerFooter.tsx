"use client";
import { ShoppingCart } from "lucide-react";
import type { Game } from "@/types/game";

interface PickerFooterProps {
  selectedNumbers: (number | null)[][];
  selectedSpecialNumbers: (number | null)[];
  game: Game;
  onAdd: () => void;
}

export default function PickerFooter({
  selectedNumbers,
  selectedSpecialNumbers,
  game,
  onAdd,
}: PickerFooterProps) {
  const completedGames = selectedNumbers.filter((nums, i) => {
    const mainFilled =
      nums.filter((n) => n !== null).length === game.mainPickCount;
    const specialFilled =
      game.specialPickCount > 0 ? selectedSpecialNumbers[i] !== null : true;
    return mainFilled && specialFilled;
  });

  if (completedGames.length === 0) return null;

  return (
    <div className="sticky bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 z-50">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-gray-300 text-sm sm:text-base">
            Total Games:{" "}
            <span className="text-yellow-400 font-semibold">
              {completedGames.length}
            </span>
          </span>
          <span className="text-gray-300 text-sm sm:text-base">
            Total Price:{" "}
            <span className="text-yellow-400 font-semibold">
              ${(completedGames.length * (game.priceCents / 100)).toFixed(2)}
            </span>
          </span>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 bg-green-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-green-400 transition w-full sm:w-auto"
        >
          <ShoppingCart />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
