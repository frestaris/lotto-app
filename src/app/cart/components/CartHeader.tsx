"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import type { Session } from "next-auth";

interface CartHeaderProps {
  session: Session | null;
  credits: number;
  onAddCredits: () => void;
}

export default function CartHeader({
  session,
  credits,
  onAddCredits,
}: CartHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left mb-8">
      <h1 className="text-3xl font-bold text-yellow-400">Your Cart</h1>

      {session ? (
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-5 sm:mt-0 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <p className="text-gray-300 text-sm sm:text-base">
              Available Credits:{" "}
              <span className="text-yellow-400 font-semibold">
                ${(credits / 100).toFixed(2)}
              </span>
            </p>
          </div>
          <button
            onClick={onAddCredits}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold px-4 py-2 rounded-lg hover:opacity-90 hover:cursor-pointer transition w-full sm:w-auto"
          >
            Add Credits
          </button>
        </div>
      ) : (
        <Link
          href={`/login?callbackUrl=${encodeURIComponent("/cart")}`}
          className="mt-5 sm:mt-0 inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
        >
          Login to Add Credits
        </Link>
      )}
    </div>
  );
}
