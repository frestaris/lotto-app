"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { useUpdateAccountMutation } from "@/redux/api/accountApi";

export default function ChangePasswordCard() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const { data: session } = useSession();
  const isGoogleUser = session?.user?.provider === "google";
  const [updateAccount] = useUpdateAccountMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGoogleUser) {
      setStatus("error");
      setMessage("Google accounts cannot change password.");
      return;
    }

    if (!currentPassword.trim() || !newPassword.trim()) {
      setStatus("error");
      setMessage("Please fill in both current and new passwords.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await updateAccount({
        action: "changePassword",
        currentPassword,
        newPassword,
      }).unwrap();

      setStatus("success");
      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        (err as { data?: { error?: string } }).data?.error
      ) {
        setStatus("error");
        setMessage((err as { data: { error: string } }).data.error);
      } else {
        setStatus("error");
        setMessage("Failed to update password. Please try again.");
      }
    }
  };

  return (
    <>
      <GameCard
        onClick={() => !isGoogleUser && setOpen(true)}
        className={isGoogleUser ? "cursor-not-allowed opacity-50" : ""}
      >
        <KeyRound className="w-6 h-6 text-yellow-400 mb-2" />
        <h3 className="text-sm text-gray-400">Password</h3>
        <p className="text-base text-white font-medium">••••••••</p>
        <span className="text-yellow-400 font-semibold text-sm mt-2">
          {isGoogleUser ? "Cannot edit Google Account" : "Change Password"}
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
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-yellow-400 outline-none"
            required
          />

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:border-yellow-400 outline-none"
            required
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className={`w-full py-2 rounded-lg font-semibold text-black transition ${
              status === "loading"
                ? "bg-yellow-400/50 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90"
            }`}
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </div>
            ) : (
              "Update Password"
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
