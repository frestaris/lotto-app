"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { useUpdateAccountMutation } from "@/redux/api/accountApi";
import { updateCreditsSuccess } from "@/redux/slices/accountSlice";
import Modal from "@/components/Modal";

interface AddCreditsModalProps {
  onClose: () => void;
}

export default function AddCreditsModal({ onClose }: AddCreditsModalProps) {
  const dispatch = useAppDispatch();
  const { update } = useSession();

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

      dispatch(updateCreditsSuccess(Math.round(amount * 100)));

      await update({ trigger: "update" });

      setStatus("success");
      setMessage(`Successfully added $${amount.toFixed(2)} credits!`);
      setAmount(0);
      onClose();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Failed to add credits. Please try again.");
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
              <Loader2 className="w-5 h-5 animate-spin" /> Adding...
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
  );
}
