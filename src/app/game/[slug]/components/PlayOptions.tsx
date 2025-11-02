"use client";

import { useState } from "react";
import { Dice5, Hand } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { addTicket } from "@/redux/slices/cartSlice";
import { v4 as uuidv4 } from "uuid";
import type { Draw, Game } from "@/types/game";
import ManualPicker from "./create-your-own/ManualPicker";
import { Toaster } from "@/components/Toaster";
import { generateNumbers } from "@/utils/generateNumbers";
import { getNextDrawDates } from "@/utils/getNextDrawDates";

interface PlayOptionsProps {
  game: Game;
  selectedDraw: Draw | null;
}

export default function PlayOptions({ game, selectedDraw }: PlayOptionsProps) {
  const [mode, setMode] = useState<"quick" | "custom">("quick");

  const nextAvailableDraw = (() => {
    if (!game.drawFrequency) return null;
    const nextDates = getNextDrawDates(game.drawFrequency, 1);
    return nextDates?.[0] ? nextDates[0].toISOString() : null;
  })();

  const dispatch = useAppDispatch();
  const { showToast, Toast } = Toaster();

  // Packages for Quick Play
  const quickPlays = [
    { label: "Mini", entries: 6 },
    { label: "Regular", entries: 12 },
    { label: "Super", entries: 18 },
    { label: "Mega", entries: 25 },
    { label: "Jumbo", entries: 36 },
    { label: "Maxi", entries: 50 },
  ];

  const handleQuickPlay = (entries: number) => {
    for (let i = 0; i < entries; i++) {
      const main = generateNumbers(
        game.mainPickCount,
        game.mainRangeMin,
        game.mainRangeMax
      );
      const special =
        game.specialPickCount > 0
          ? generateNumbers(
              game.specialPickCount,
              game.specialRangeMin || 1,
              game.specialRangeMax || 10
            )
          : [];

      dispatch(
        addTicket({
          id: uuidv4(),
          gameId: game.id,
          gameName: game.name,
          slug: game.slug ?? "",
          iconName: game.iconName ?? "",
          drawDate: selectedDraw?.drawDate || nextAvailableDraw,
          numbers: main,
          specialNumbers: special,
          priceCents: game.priceCents,
        })
      );
    }
    showToast(`${entries} entries added to your cart`);
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 text-center">
      {/* Toggle Buttons */}
      <div className="flex justify-center gap-6 flex-wrap mb-10">
        <button
          onClick={() => setMode("quick")}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-lg cursor-pointer transition shadow-[0_0_20px_rgba(255,215,0,0.3)] ${
            mode === "quick"
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          }`}
        >
          <Dice5 className="w-5 h-5" />
          Quick Play
        </button>

        <button
          onClick={() => setMode("custom")}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-lg cursor-pointer transition shadow-[0_0_20px_rgba(255,215,0,0.3)] ${
            mode === "custom"
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          }`}
        >
          <Hand className="w-5 h-5" />
          Create Your Own
        </button>
      </div>

      {/* QUICK PLAY MODE */}
      {mode === "quick" && (
        <div className="px-4 sm:px-0">
          <h3 className="text-2xl font-semibold text-yellow-400 text-center">
            Choose your Quick Play package
          </h3>
          <p className="text-gray-400 text-sm my-4 text-center">
            Each package automatically generates random entries for you.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-center mt-10">
            {quickPlays.map((pack) => (
              <button
                key={pack.label}
                onClick={() => handleQuickPlay(pack.entries)}
                className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md py-6 px-4 flex flex-col items-center justify-center cursor-pointer space-y-2 transition-all duration-300 hover:border-yellow-400/30 hover:shadow-[inset_0_0_20px_rgba(255,215,0,0.2)] hover:scale-[1.04]"
              >
                <span className="text-yellow-400 font-bold text-lg">
                  {pack.label}
                </span>
                <span className="text-sm text-gray-400">
                  {pack.entries} Entries
                </span>
                <span className="text-sm text-green-400 font-semibold">
                  ${(pack.entries * (game.priceCents / 100)).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CREATE YOUR OWN MODE (NUMBER GRID) */}
      {mode === "custom" && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-6 text-yellow-400">
            Pick your numbers
          </h3>
          <ManualPicker game={game} selectedDraw={selectedDraw} />
        </div>
      )}
      <Toast />
    </div>
  );
}
