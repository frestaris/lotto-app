"use client";

import { useState } from "react";
import {
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
} from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { setAccount } from "@/redux/slices/accountSlice";

export default function DeleteAccountCard() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [hasCredits, setHasCredits] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmText !== "DELETE") {
      setStatus("error");
      setMessage('Please type "DELETE" exactly to confirm.');
      return;
    }

    setStatus("loading");
    setMessage("");
    setHasCredits(false);

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.remainingCredits > 0) {
          // 🚫 User still has credits
          setHasCredits(true);
          setStatus("error");
          setMessage(
            `You still have $${(data.remainingCredits / 100).toFixed(
              2
            )} in your account. Please use your credits before deleting.`
          );
          return;
        }
        throw new Error(data.error || "Failed to delete account");
      }

      // ✅ Successful deletion
      setStatus("success");
      setMessage("Account deleted successfully.");

      // Clear Redux + sign out
      dispatch(setAccount(null));
      await signOut({ redirect: false });

      router.push("/login");
    } catch (err: unknown) {
      console.error("❌ Delete account error:", err);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setConfirmText("");
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
                : "bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white"
            }`}
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting...
              </div>
            ) : (
              "Permanently Delete"
            )}
          </button>

          {/* 🧠 Feedback Section */}
          {status !== "idle" && (
            <div className="flex flex-col items-center justify-center gap-2 mt-3 text-sm text-center">
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

                  {/* 🎮 Button appears if user has credits */}
                  {hasCredits && (
                    <button
                      type="button"
                      onClick={() => router.push("/")}
                      className="mt-3 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded-lg transition"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      Play a Game
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}
