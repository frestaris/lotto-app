"use client";

import { useAppDispatch } from "@/redux/store";
import { addTicket } from "@/redux/slices/cartSlice";
import { v4 as uuidv4 } from "uuid";
import { Check } from "lucide-react";

interface AutoPickResultProps {
  mainNumbers: number[];
  specialNumbers: number[];
  game: {
    id: string;
    name: string;
    priceCents: number;
  };
}

export default function AutoPickResult({
  mainNumbers,
  specialNumbers,
  game,
}: AutoPickResultProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    const ticket = {
      id: uuidv4(),
      gameId: game.id,
      gameName: game.name,
      numbers: mainNumbers,
      specialNumbers,
      priceCents: game.priceCents,
    };

    dispatch(addTicket(ticket));

    // Optional smooth toast or in-page message
    console.log("🎟️ Auto Pick added to cart!");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 text-center">
      <h3 className="text-xl font-semibold mb-4 text-gray-200">
        Your Auto Pick Numbers
      </h3>
      <div className="flex justify-center flex-wrap gap-3 mb-8">
        {mainNumbers.map((num) => (
          <span
            key={num}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-400 text-black font-bold text-lg"
          >
            {num}
          </span>
        ))}
        {specialNumbers.map((num) => (
          <span
            key={`special-${num}`}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-500 text-black font-bold text-lg"
          >
            {num}
          </span>
        ))}
      </div>

      <button
        onClick={handleAddToCart}
        className="flex items-center gap-2 px-6 py-3 mx-auto rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition"
      >
        <Check className="w-5 h-5" />
        Add to Cart
      </button>
    </div>
  );
}
