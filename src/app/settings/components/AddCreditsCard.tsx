"use client";

import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { useAppSelector } from "@/redux/store";
import { toast } from "@/components/Toaster";

interface AddCreditsCardProps {
  credits?: number;
}

export default function AddCreditsCard({ credits }: AddCreditsCardProps) {
  const account = useAppSelector((s) => s.account.account);
  const currentCredits = credits ?? account?.creditCents ?? 0;

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast("Please enter a valid amount greater than 0.", "error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          returnUrl: window.location.href,
        }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast("Unable to start payment. Please try again.", "error");
        setStatus("idle");
      }
    } catch (err) {
      console.error("❌ Stripe session error:", err);
      toast("Payment setup failed. Please try again.", "error");
      setStatus("idle");
    }
  };

  return (
    <>
      <GameCard onClick={() => setOpen(true)}>
        <Coins className="w-6 h-6 text-yellow-400 mb-2" />
        <span className="text-3xl font-extrabold text-yellow-400 block mb-2">
          $
          {(currentCredits / 100).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
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
                : "bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 hover:cursor-pointer"
            }`}
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-5 h-5" />
                <span>Top Up</span>
              </div>
            )}
          </button>
        </form>
      </Modal>
    </>
  );
}
