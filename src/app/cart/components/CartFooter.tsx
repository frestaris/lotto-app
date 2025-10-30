"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, Trash2, CreditCard } from "lucide-react";
import type { Session } from "next-auth";

interface CartFooterProps {
  total: number;
  ticketsCount: number;
  loading: boolean;
  hasEnoughCredits: boolean;
  session: Session | null;
  onClear: () => void;
  onConfirm: () => void;
}

export default function CartFooter({
  total,
  ticketsCount,
  loading,
  hasEnoughCredits,
  session,
  onClear,
  onConfirm,
}: CartFooterProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 py-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 gap-3">
        <div className="text-gray-300 text-sm sm:text-base">
          Total:{" "}
          <span className="text-yellow-400 font-semibold">
            ${(total / 100).toFixed(2)}
          </span>{" "}
          • Games:{" "}
          <span className="text-yellow-400 font-semibold">{ticketsCount}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={onClear}
            disabled={loading || ticketsCount === 0}
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold border border-white/20 text-gray-300 hover:text-red-400 hover:border-red-400 hover:bg-white/10 transition w-full sm:w-auto disabled:opacity-50 hover:cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
            Clear Cart
          </button>

          {session ? (
            <button
              onClick={onConfirm}
              disabled={loading || !hasEnoughCredits}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold transition w-full sm:w-auto ${
                loading
                  ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                  : hasEnoughCredits
                  ? "bg-green-500 text-black hover:cursor-pointer hover:bg-green-400"
                  : "bg-red-500 text-black cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
                  <span>Saving tickets...</span>
                </>
              ) : hasEnoughCredits ? (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay Now</span>
                </>
              ) : (
                "⚠️ Not enough credits"
              )}
            </button>
          ) : (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:opacity-90 transition w-full sm:w-auto"
            >
              <CreditCard className="w-5 h-5" />
              <span>Login to Pay</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
