"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { removeTicket, clearCart } from "@/redux/slices/cartSlice";
import { submitTickets } from "@/redux/slices/ticketSlice";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  const { tickets } = useAppSelector((state) => state.cart);
  const { loading, success, error, updatedBalance } = useAppSelector(
    (state) => state.tickets
  );

  // Local fallback balance (initially from session)
  const [balance, setBalance] = useState(session?.user?.creditCents ?? 0);

  // If Redux has a fresher balance, use it; otherwise show local
  const displayBalance = updatedBalance ?? balance;

  const total = useMemo(
    () => tickets.reduce((acc, t) => acc + t.priceCents, 0),
    [tickets]
  );
  const hasEnoughCredits = displayBalance >= total;

  const handleConfirm = async () => {
    if (!session) return;

    if (!hasEnoughCredits) {
      alert("Insufficient credits. Please add more in Settings → Add Credits.");
      return;
    }

    const formattedTickets = tickets.map((t) => ({
      gameId: t.gameId,
      numbers: t.numbers,
      specialNumbers: t.specialNumbers,
      priceCents: t.priceCents,
    }));

    const action = await dispatch(submitTickets(formattedTickets));

    // If fulfilled, the payload includes updatedBalance from the API
    if (submitTickets.fulfilled.match(action)) {
      setBalance(action.payload.updatedBalance); // keep local fallback in sync
      dispatch(clearCart());
    }
    // If rejected, the slice already stores `error`
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white py-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-yellow-400 mb-8">Your Cart</h1>

        {!session ? (
          <p className="text-gray-400">
            Please sign in to view and confirm your tickets.
          </p>
        ) : tickets.length === 0 ? (
          <div className="space-y-6">
            <p className="text-gray-400">No tickets yet. Go play a game!</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
            >
              🎮 Go Play a Game
            </Link>
          </div>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-300 mb-6">
              💰 Available Credits:{" "}
              <span className="text-yellow-400 font-bold">
                ${(displayBalance / 100).toFixed(2)}
              </span>
            </p>

            <ul className="space-y-4">
              {tickets.map((t) => (
                <li
                  key={t.id}
                  className="bg-white/10 p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="text-left space-y-1">
                    <h3 className="font-semibold text-yellow-300">
                      {t.gameName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Main: {t.numbers.join(", ")}{" "}
                      {t.specialNumbers.length > 0 &&
                        `| Special: ${t.specialNumbers.join(", ")}`}
                    </p>
                  </div>

                  <button
                    onClick={() => dispatch(removeTicket(t.id))}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✖
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-4">
              <p className="text-lg font-semibold">
                Total: ${(total / 100).toFixed(2)}
              </p>

              <button
                onClick={handleConfirm}
                disabled={loading || !hasEnoughCredits}
                className={`mt-6 px-8 py-3 rounded-lg font-semibold transition ${
                  loading
                    ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                    : hasEnoughCredits
                    ? "bg-green-500 text-black hover:bg-green-400"
                    : "bg-red-500 text-black cursor-not-allowed"
                }`}
              >
                {loading
                  ? "Saving tickets..."
                  : hasEnoughCredits
                  ? "✅ Confirm & Buy Tickets"
                  : "⚠️ Not enough credits"}
              </button>

              {success && (
                <p className="text-green-400 font-semibold animate-pulse">
                  ✅ Tickets purchased successfully!
                </p>
              )}
              {error && <p className="text-red-400 font-semibold">{error}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
