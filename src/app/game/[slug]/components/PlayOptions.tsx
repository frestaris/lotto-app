"use client";

import { Dice5, Hand } from "lucide-react";
import { Game } from "@prisma/client";

interface PlayOptionsProps {
  game: Game;
  setManualMode: (v: boolean) => void;
  setAutoMainNumbers: (nums: number[]) => void;
  setAutoSpecialNumbers: (nums: number[]) => void;
}

export default function PlayOptions({
  game,
  setManualMode,
  setAutoMainNumbers,
  setAutoSpecialNumbers,
}: PlayOptionsProps) {
  const generateRandomNumbers = (count: number, min: number, max: number) => {
    const numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num)) numbers.push(num);
    }
    return numbers.sort((a, b) => a - b);
  };

  const handleAutoPick = () => {
    const main = generateRandomNumbers(
      game.mainPickCount,
      game.mainRangeMin,
      game.mainRangeMax
    );
    const special =
      game.specialPickCount > 0
        ? generateRandomNumbers(
            game.specialPickCount,
            game.specialRangeMin || 1,
            game.specialRangeMax || 10
          )
        : [];

    setAutoMainNumbers(main);
    setAutoSpecialNumbers(special);
    setManualMode(false);
  };

  const handleManualMode = () => {
    setManualMode(true);
    setAutoMainNumbers([]);
    setAutoSpecialNumbers([]);
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 text-center">
      <h2 className="text-2xl font-semibold mb-6 text-yellow-400">
        Ready to play?
      </h2>
      <div className="flex justify-center gap-6 flex-wrap">
        <button
          onClick={handleManualMode}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
        >
          <Hand className="w-5 h-5" />
          Play Manually
        </button>
        <button
          onClick={handleAutoPick}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-yellow-400 text-yellow-400 font-semibold hover:bg-yellow-400 hover:text-black transition"
        >
          <Dice5 className="w-5 h-5" />
          Auto Pick
        </button>
      </div>
    </div>
  );
}
