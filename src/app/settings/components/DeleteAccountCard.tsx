"use client";

import { useState } from "react";
import { Trash2, Gamepad2, AlertTriangle } from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { setAccount } from "@/redux/slices/accountSlice";
import { useDeleteAccountMutation } from "@/redux/api/accountApi";
import { toast } from "@/components/Toaster";
import Spinner from "@/components/Spinner";

interface DeleteError {
  status: number;
  data?: {
    remainingCredits?: number;
    error?: string;
  };
}

export default function DeleteAccountCard() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const router = useRouter();

  const [deleteAccount] = useDeleteAccountMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmText !== "DELETE") {
      toast('Please type "DELETE" to confirm.', "error");
      return;
    }

    setStatus("loading");
    setRemainingCredits(null);

    try {
      await deleteAccount(null).unwrap();

      setOpen(false);

      // Successful deletion
      toast("Account deleted successfully.", "success");
      dispatch(setAccount(null));
      await signOut({ redirect: false });
    } catch (error) {
      const err = error as DeleteError;
      console.error("❌ Delete account error:", err);

      // User still has credits
      if (err.status === 403 && err.data?.remainingCredits) {
        const credits = err.data.remainingCredits;
        setRemainingCredits(credits);
        setStatus("idle");
        return;
      }

      toast("Something went wrong. Please try again.", "error");
    } finally {
      setConfirmText("");
      setStatus("idle");
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
        onClose={() => {
          setOpen(false);
          setRemainingCredits(null);
        }}
        title="Delete Account"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-300 text-sm">
            This action <strong>cannot be undone</strong>. Type{" "}
            <strong>DELETE</strong> to confirm permanent deletion of your
            account.
          </p>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-red-400 outline-none"
            required
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              status === "loading"
                ? "bg-red-600/50 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 hover:cursor-pointer text-white"
            }`}
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Deleting...
              </div>
            ) : (
              "Permanently Delete"
            )}
          </button>

          {/* 🚫 Warning if user has remaining credits */}
          {remainingCredits !== null && remainingCredits > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-red-900/30 border border-red-600/40">
              <div className="flex flex-col items-center justify-center text-center gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">
                  You still have{" "}
                  <span className="font-bold text-yellow-400">
                    ${(remainingCredits / 100).toFixed(2)}
                  </span>{" "}
                  in your account.
                </p>
                <p className="text-sm text-gray-300">
                  Please use your credits before deleting your account.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-3 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded-lg transition hover:cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Play a Game
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}
