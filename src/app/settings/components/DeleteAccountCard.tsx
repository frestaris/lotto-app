"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";

export default function DeleteAccountCard() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText === "DELETE") {
      router.push("/login");
    }
  };

  return (
    <>
      <GameCard onClick={() => setOpen(true)}>
        <Trash2 className="w-6 h-6 text-red-400 mb-2" />
        <h3 className="text-sm text-gray-400">Account</h3>
        <span className="text-red-400 font-semibold text-sm mt-2">
          Delete Account
        </span>
      </GameCard>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete Account"
      >
        <form onSubmit={handleSubmit}>
          <p className="text-gray-300 text-sm mb-4">
            Type <strong>DELETE</strong> to confirm.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-red-400 outline-none mb-4"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition"
          >
            Permanently Delete
          </button>
        </form>
      </Modal>
    </>
  );
}
