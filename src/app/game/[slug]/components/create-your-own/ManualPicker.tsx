"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch } from "@/redux/store";
import { addTicket } from "@/redux/slices/cartSlice";
import type { Draw, Game } from "@/types/game";
import { getNextDrawDates } from "@/utils/getNextDrawDates";

import GameAccordion from "./GameAccordion";
import PickerFooter from "./PickerFooter";
import PickerSetup from "./PickerSetup";

export default function ManualPicker({
  game,
  selectedDraw,
}: {
  game: Game;
  selectedDraw: Draw | null;
}) {
  const dispatch = useAppDispatch();

  const [gamesCount, setGamesCount] = useState(3);
  const [selectedNumbers, setSelectedNumbers] = useState<(number | null)[][]>(
    Array.from({ length: 3 }, () => Array(game.mainPickCount).fill(null))
  );
  const [selectedSpecialNumbers, setSelectedSpecialNumbers] = useState<
    (number | null)[]
  >(Array.from({ length: gamesCount }, () => null));
  const [openGameIndex, setOpenGameIndex] = useState<number | null>(0);

  // --- Core Handlers ---
  const toggleNumber = (gameIndex: number, num: number) => {
    setSelectedNumbers((prev) => {
      const updated = [...prev];
      const current = [...(updated[gameIndex] || [])];
      const positioned: (number | null)[] = Array.from(
        { length: game.mainPickCount },
        (_, i) => current[i] ?? null
      );

      const existingIndex = positioned.findIndex((n) => n === num);
      if (existingIndex !== -1) positioned[existingIndex] = null;
      else {
        const emptyIndex = positioned.findIndex((n) => n === null);
        if (emptyIndex !== -1) positioned[emptyIndex] = num;
      }

      updated[gameIndex] = positioned;
      return updated;
    });
  };

  const toggleSpecialNumber = (gameIndex: number, num: number) => {
    setSelectedSpecialNumbers((prev) => {
      const updated = [...prev];
      updated[gameIndex] = prev[gameIndex] === num ? null : num;
      return updated;
    });
  };

  const fastSelect = () => {
    try {
      const updatedMain = selectedNumbers.map((nums) => {
        const filled: (number | null)[] = Array.from(
          { length: game.mainPickCount },
          (_, i) => nums[i] ?? null
        );
        const min = game.mainRangeMin;
        const max = game.mainRangeMax;

        const emptyCount = filled.filter((n) => n === null).length;
        if (emptyCount === 0) return filled;

        const picked = new Set(filled.filter((n) => n !== null) as number[]);
        while (filled.some((n) => n === null)) {
          const rand = Math.floor(Math.random() * (max - min + 1)) + min;
          if (!picked.has(rand)) {
            const emptyIndex = filled.findIndex((n) => n === null);
            if (emptyIndex === -1) break;
            filled[emptyIndex] = rand;
            picked.add(rand);
          }
        }
        return filled;
      });

      setSelectedNumbers(updatedMain);

      if (game.specialPickCount > 0) {
        setSelectedSpecialNumbers((prev) => {
          const next = Array.from(
            { length: updatedMain.length },
            (_, i) => prev[i] ?? null
          );
          const sMin = game.specialRangeMin ?? 1;
          const sMax = game.specialRangeMax ?? 10;

          for (let i = 0; i < next.length; i++) {
            if (next[i] == null) {
              next[i] = Math.floor(Math.random() * (sMax - sMin + 1)) + sMin;
            }
          }
          return next;
        });
      }
    } catch (err) {
      console.error("fastSelect crashed", { err });
    }
  };

  const clearAll = () => {
    setSelectedNumbers(Array.from({ length: gamesCount }, () => []));
    setSelectedSpecialNumbers(Array.from({ length: gamesCount }, () => null));
  };
  // Remove a game entirely
  const removeGame = (index: number) => {
    if (selectedNumbers.length <= 1) return; // keep at least one game

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
          drawId: selectedDraw?.id || null,
          drawDate:
            selectedDraw?.drawDate ||
            (typeof game.drawFrequency === "string"
              ? getNextDrawDates(game.drawFrequency, 1)[0].toISOString()
              : null),
          numbers: mainNumbers,
          specialNumbers: specialNumber ? [specialNumber] : [],
          priceCents: game.priceCents,
        };
        dispatch(addTicket(ticket));
        addedCount++;
      }
    });
    if (addedCount > 0) clearAll();
  };

  return (
    <div className="max-w-5xl lg:mx-auto mx-4 text-left space-y-8 text-white">
      <PickerSetup
        gamesCount={gamesCount}
        game={game}
        onCountChange={setGamesCount}
        onAdjust={setSelectedNumbers}
        setSpecials={setSelectedSpecialNumbers}
        onFastSelect={fastSelect}
        onClearAll={clearAll}
      />
      <div className="space-y-3">
        {selectedNumbers.map((nums, i) => (
          <GameAccordion
            key={i}
            index={i}
            nums={nums}
            special={selectedSpecialNumbers[i]}
            isOpen={openGameIndex === i}
            onToggle={() => setOpenGameIndex(openGameIndex === i ? null : i)}
            game={game}
            onToggleNumber={toggleNumber}
            onToggleSpecial={toggleSpecialNumber}
            onClear={() => {
              const copy = [...selectedNumbers];
              copy[i] = [];
              setSelectedNumbers(copy);
              const specials = [...selectedSpecialNumbers];
              specials[i] = null;
              setSelectedSpecialNumbers(specials);
            }}
            onRemove={() => removeGame(i)}
          />
        ))}
      </div>
      <PickerFooter
        selectedNumbers={selectedNumbers}
        selectedSpecialNumbers={selectedSpecialNumbers}
        game={game}
        selectedDraw={selectedDraw}
        onAdd={handleAddToCart}
      />
    </div>
  );
}
