"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { useAppDispatch, useAppSelector } from "@/redux/store";

export default function ChangePasswordCard() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
  };

  return (
    <>
      <GameCard onClick={() => setOpen(true)}>
        <KeyRound className="w-6 h-6 text-yellow-400 mb-2" />
        <h3 className="text-sm text-gray-400">Password</h3>
        <p className="text-base text-white font-medium">••••••••</p>
        <span className="text-yellow-400 font-semibold text-sm mt-2">
          Change Password
        </span>
      </GameCard>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-yellow-400 outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
          >
            Update Password
          </button>
        </form>
      </Modal>
    </>
  );
}
