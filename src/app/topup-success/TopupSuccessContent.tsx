"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { useUpdateAccountMutation } from "@/redux/api/accountApi";
import { updateCreditsSuccess } from "@/redux/slices/accountSlice";
import { toast } from "@/components/Toaster";
import Spinner from "@/components/Spinner";
import { CheckCircle2, XCircle } from "lucide-react";

export default function TopupSuccessContent() {
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const [updateAccount] = useUpdateAccountMutation();

  const amount = Number(params.get("amount") || 0);
  const redirectUrl = params.get("redirect") || "/";

  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    if (amount > 0) {
      (async () => {
        try {
          await updateAccount({
            action: "addCredits",
            addCredits: amount,
          }).unwrap();

          dispatch(updateCreditsSuccess(Math.round(amount * 100)));
          setStatus("success");
          toast(`Successfully added $${amount.toFixed(2)} credits!`, "success");

          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1500);
        } catch (err) {
          console.error("❌ Credit update failed:", err);
          setStatus("error");
          toast("Payment succeeded, but credit update failed.", "error");

          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
        }
      })();
    }
  }, [amount, redirectUrl, dispatch, updateAccount]);

  // 🌀 UI states
  if (status === "processing") {
    return (
      <Spinner
        message={`Adding $${amount.toFixed(2)} credits to your account...`}
        variant="accent"
        size="lg"
        fullScreen
      />
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-72px)] text-center text-gray-200 animate-fadeIn">
        <CheckCircle2 className="w-16 h-16 text-green-400 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
        <p className="text-gray-400">
          ${amount.toFixed(2)} has been added to your credits.
        </p>
        <p className="text-sm text-gray-500 mt-3">Redirecting you back...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-72px)] text-center text-gray-200 animate-fadeIn">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something Went Wrong</h1>
        <p className="text-gray-400">
          Payment went through, but we couldn’t update your credits.
        </p>
        <p className="text-sm text-gray-500 mt-3">Redirecting you back...</p>
      </div>
    );
  }

  return null;
}
