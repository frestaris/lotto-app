"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { KeyRound } from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { useUpdateAccountMutation } from "@/redux/api/accountApi";
import Spinner from "@/components/Spinner";
import { toast } from "@/components/Toaster";

export default function ChangePasswordCard() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const { data: session } = useSession();
  const isGoogleUser = session?.user?.provider === "google";
  const [updateAccount] = useUpdateAccountMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGoogleUser) {
      toast("Google accounts cannot change password.");
      return;
    }

    if (!currentPassword.trim() || !newPassword.trim()) {
      toast("Please fill in both current and new passwords.");
      return;
    }

    setStatus("loading");

    try {
      await updateAccount({
        action: "changePassword",
        currentPassword,
        newPassword,
      }).unwrap();

      toast("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setOpen(false);
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { error?: string; message?: string } })?.data?.error ||
        (err as { message?: string })?.message ||
        "Failed to update password. Please try again.";

      toast(errorMessage, "error");
      console.warn("Password change failed:", err);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <>
      <GameCard
        onClick={() => {
          if (isGoogleUser) return;
          // reset form when reopening
          setCurrentPassword("");
          setNewPassword("");
          setStatus("idle");
          setOpen(true);
        }}
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
                : "bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 hover:cursor-pointer"
            }`}
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Updating...
              </div>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </Modal>
    </>
  );
}
