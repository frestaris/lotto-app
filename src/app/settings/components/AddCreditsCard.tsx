"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Coins, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { useUpdateAccountMutation } from "@/redux/api/accountApi";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { updateCreditsSuccess } from "@/redux/slices/accountSlice";

interface AddCreditsCardProps {
  credits?: number; // optional so it still works even if prop isn’t passed
}

export default function AddCreditsCard({ credits }: AddCreditsCardProps) {
  const { update } = useSession();
  const dispatch = useAppDispatch();
  const account = useAppSelector((s) => s.account.account);

  // If credits prop exists (from SettingsPage), use it; otherwise fallback to Redux
  const currentCredits = credits ?? account?.creditCents ?? 0;

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const [updateAccount] = useUpdateAccountMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      setStatus("error");
      setMessage("Please enter a valid amount greater than 0.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await updateAccount({
        action: "addCredits",
        addCredits: amount,
      }).unwrap();

      // ✅ Update Redux balance instantly
      dispatch(updateCreditsSuccess(Math.round(amount * 100)));

      // ✅ Refresh NextAuth session from DB (calls trigger="update" on jwt callback)
      await update({ trigger: "update" });

      setStatus("success");
      setMessage(`Successfully added $${amount.toFixed(2)} credits!`);
      setAmount(0);

      setTimeout(() => setOpen(false), 1500);
    } catch (err: unknown) {
      console.log(err);
      setStatus("error");
      setMessage("Failed to add credits. Please try again.");
    } finally {
      // Reset feedback after 3s
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <>
      <GameCard onClick={() => setOpen(true)}>
        <Coins className="w-6 h-6 text-yellow-400 mb-2" />
        <span className="text-3xl font-extrabold text-yellow-400 block mb-2">
          ${(currentCredits / 100).toFixed(2)}
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
            min={1}
            step={0.01}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount to add"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-yellow-400 outline-none"
            required
          />

          <button
            type="submit"
            disabled={status === "loading" || amount <= 0}
            className={`w-full py-2 rounded-lg font-semibold text-black transition ${
              status === "loading" || amount <= 0
                ? "bg-yellow-400/50 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90"
            }`}
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding...
              </div>
            ) : (
              "Add Credits"
            )}
          </button>

          {status !== "idle" && (
            <div className="flex items-center justify-center gap-2 mt-2 text-sm">
              {status === "success" && (
                <>
                  <CheckCircle2 className="text-green-400 w-4 h-4" />
                  <span className="text-green-400">{message}</span>
                </>
              )}
              {status === "error" && (
                <>
                  <AlertCircle className="text-red-400 w-4 h-4" />
                  <span className="text-red-400">{message}</span>
                </>
              )}
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}
