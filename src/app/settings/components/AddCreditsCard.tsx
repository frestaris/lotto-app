"use client";

import { useState } from "react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { useAppDispatch, useAppSelector } from "@/redux/store";

interface Props {
  credits: number;
}

export default function AddCreditsCard({ credits }: Props) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
  };

  return (
    <>
      <GameCard onClick={() => setOpen(true)}>
        <span className="text-3xl font-extrabold text-yellow-400 block mb-2">
          ${(credits / 100).toFixed(2)}
        </span>
        <h3 className="text-sm text-gray-400">Available Credits</h3>
        <span className="text-yellow-400 font-semibold text-sm mt-2">
          Add Credits
        </span>
      </GameCard>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Credits">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={amount}
            min={1}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-yellow-400 outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
          >
            Add Credits
          </button>
        </form>
      </Modal>
    </>
  );
}
