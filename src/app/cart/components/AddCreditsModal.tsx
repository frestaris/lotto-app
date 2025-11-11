"use client";

import { useState } from "react";
import { Loader2, Coins } from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "@/components/Toaster";

interface AddCreditsModalProps {
  onClose: () => void;
}

export default function AddCreditsModal({ onClose }: AddCreditsModalProps) {
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
    <Modal isOpen onClose={onClose} title="Add Credits">
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
  );
}
