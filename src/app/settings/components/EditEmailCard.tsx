"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { useUpdateAccountMutation } from "@/redux/api/accountApi";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setAccount, updateEmailSuccess } from "@/redux/slices/accountSlice";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Spinner";
import { toast } from "@/components/Toaster";

export default function EditEmailCard() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const { data: session, update: updateSession } = useSession();
  const account = useAppSelector((s) => s.account.account);
  const isGoogleUser = session?.user?.provider === "google";
  const dispatch = useAppDispatch();
  const [updateAccount] = useUpdateAccountMutation();

  // ✅ hydrate Redux once on login
  useEffect(() => {
    if (session?.user && !account?.email) {
      dispatch(
        setAccount({
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          creditCents: session.user.creditCents,
        })
      );
    }
  }, [session?.user, account?.email, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGoogleUser) {
      toast("Google accounts cannot change email.", "error");
      return;
    }

    setStatus("loading");

    try {
      const res = await updateAccount({
        action: "editEmail",
        newEmail: email,
      }).unwrap();

      const updatedEmail = res.user.email;

      // ✅ Update Redux
      dispatch(updateEmailSuccess(updatedEmail));

      // ✅ Update NextAuth session
      await updateSession({
        ...session,
        user: { ...session?.user, email: updatedEmail },
      });

      // ✅ Sync Redux again
      dispatch(
        setAccount({
          id: session?.user?.id,
          name: session?.user?.name,
          email: updatedEmail,
          image: session?.user?.image,
          creditCents: session?.user?.creditCents,
        })
      );

      toast("Email updated successfully!", "success"); // ✅ success toast
      setEmail("");
      setOpen(false);
    } catch (err: unknown) {
      console.warn("Email change failed:", err);

      const errorMessage =
        (err as { data?: { error?: string; message?: string } })?.data?.error ||
        (err as { message?: string })?.message ||
        "Failed to update email. Please try again.";

      toast(errorMessage, "error"); // ✅ error toast
    } finally {
      setStatus("idle");
    }
  };

  return (
    <>
      <GameCard
        onClick={() => !isGoogleUser && setOpen(true)}
        className={isGoogleUser ? "cursor-not-allowed opacity-50" : ""}
      >
        <Mail className="w-6 h-6 text-yellow-400 mb-2" />
        <h3 className="text-sm text-gray-400">Email</h3>

        <p className="text-base text-white font-medium truncate">
          {account?.email ?? "Not set"}
        </p>

        <span className="text-yellow-400 font-semibold text-sm mt-2">
          {isGoogleUser ? "Cannot edit Google Account" : "Edit Email"}
        </span>
      </GameCard>

      <Modal
        key={account?.email}
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Edit Email"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter new email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                <Spinner size="sm" /> Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </Modal>
    </>
  );
}
