"use client";

import { useState } from "react";
import { Dice5, Hand } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { addTicket } from "@/redux/slices/cartSlice";
import { v4 as uuidv4 } from "uuid";
import type { Game } from "@/types/game";
import ManualPicker from "./create-your-own/ManualPicker";
import { Toaster } from "@/hooks/Toaster";
import { generateNumbers } from "@/utils/generateNumbers";

interface PlayOptionsProps {
  game: Game;
}

export default function PlayOptions({ game }: PlayOptionsProps) {
  const [mode, setMode] = useState<"quick" | "custom">("quick");
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
          numbers: main,
          specialNumbers: special,
          priceCents: game.priceCents,
        })
      );
    }
    showToast(`🎟️ ${entries} entries added to your cart`);
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 text-center">
      {/* Toggle Buttons */}
      <div className="flex justify-center gap-6 flex-wrap mb-10 ">
        <button
          onClick={() => setMode("quick")}
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition cursor-pointer ${
            mode === "quick"
              ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
              : "border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          }`}
        >
          <Dice5 className="w-5 h-5" />
          Quick Play
        </button>
        <button
          onClick={() => setMode("custom")}
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition cursor-pointer ${
            mode === "custom"
              ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
              : "border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          }`}
        >
          <Hand className="w-5 h-5" />
          Create Your Own
        </button>
      </div>

      {/* QUICK PLAY MODE */}
      {mode === "quick" && (
        <div>
          <h3 className="text-2xl font-semibold text-yellow-400">
            Choose your Quick Play package
          </h3>{" "}
          <p className="text-gray-400 text-sm my-4">
            Each package automatically generates random entries for you.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-center">
            {quickPlays.map((pack) => (
              <button
                key={pack.label}
                onClick={() => handleQuickPlay(pack.entries)}
                className="bg-white/10 hover:bg-yellow-400/20 border border-white/10 rounded-xl py-5 px-3 transition flex flex-col items-center space-y-1 cursor-pointer"
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
          <ManualPicker game={game} />
        </div>
      )}
      <Toast />
    </div>
  );
}
