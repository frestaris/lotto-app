"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/components/Toaster";
import { XCircle } from "lucide-react";

export default function TopupFailedContent() {
  const params = useSearchParams();
  const redirectUrl = params.get("redirect") || "/";

  useEffect(() => {
    toast("Payment was cancelled or failed. No credits were added.", "error");

    const timeout = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 3000);

    return () => clearTimeout(timeout);
  }, [redirectUrl]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-200">
      <XCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Payment Failed or Cancelled</h1>
      <p className="text-gray-400 mb-6">
        Don’t worry — no credits were charged. Redirecting you back...
      </p>
      <button
        onClick={() => (window.location.href = redirectUrl)}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 font-semibold text-black hover:opacity-90 transition hover:cursor-pointer"
      >
        Go Back Now
      </button>
    </div>
  );
}
