"use client";

import { useEffect, useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import GameCard from "@/components/GameCard";
import Modal from "@/components/Modal";
import { useUpdateAccountMutation } from "@/redux/api/accountApi";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setAccount, updateEmailSuccess } from "@/redux/slices/accountSlice";
import { useSession } from "next-auth/react";

export default function EditEmailCard() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const { data: session, update: updateSession } = useSession();
  const account = useAppSelector((s) => s.account.account);
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
    setStatus("loading");
    setMessage("");

    try {
      const res = await updateAccount({
        action: "editEmail",
        newEmail: email,
      }).unwrap();

      const updatedEmail = res.user.email;

      // ✅ Update Redux immediately
      dispatch(updateEmailSuccess(updatedEmail));

      // ✅ Update NextAuth session
      await updateSession({
        ...session,
        user: { ...session?.user, email: updatedEmail },
      });

      // ✅ Keep Redux in sync with updated session
      dispatch(
        setAccount({
          id: session?.user?.id,
          name: session?.user?.name,
          email: updatedEmail,
          image: session?.user?.image,
          creditCents: session?.user?.creditCents,
        })
      );

      setStatus("success");
      setMessage("Email updated successfully!");
      setEmail("");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const apiErr = err as { data?: { error?: string } };
        setStatus("error");
        setMessage(apiErr.data?.error || "Failed to update email.");
      } else {
        setStatus("error");
        setMessage("Something went wrong.");
      }
    }
  };

  return (
    <>
      <GameCard onClick={() => setOpen(true)}>
        <Mail className="w-6 h-6 text-yellow-400 mb-2" />
        <h3 className="text-sm text-gray-400">Email</h3>

        <p className="text-base text-white font-medium truncate">
          {account?.email ?? "Not set"}
        </p>

        <span className="text-yellow-400 font-semibold text-sm mt-2">
          Edit Email
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
                : "bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90"
            }`}
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </div>
            ) : (
              "Save Changes"
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
