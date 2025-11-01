"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { clearCart, removeTicket } from "@/redux/slices/cartSlice";
import { submitTickets, resetTicketState } from "@/redux/slices/ticketSlice";
import CartHeader from "./components/CartHeader";
import AddCreditsModal from "./components/AddCreditsModal";
import CartFooter from "./components/CartFooter";
import TicketAccordion from "./components/TicketAccordion";
import { setAccount } from "@/redux/slices/accountSlice";

export default function CartPage() {
  const { data: session, status, update } = useSession();
  const dispatch = useAppDispatch();

  const { tickets } = useAppSelector((s) => s.cart);
  const { loading, success, error, updatedBalance } = useAppSelector(
    (s) => s.tickets
  );
  const account = useAppSelector((s) => s.account.account);

  const [showAddCredits, setShowAddCredits] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const credits =
    updatedBalance ?? account?.creditCents ?? session?.user?.creditCents ?? 0;
  const total = useMemo(
    () => tickets.reduce((a, t) => a + t.priceCents, 0),
    [tickets]
  );
  const hasEnoughCredits = credits >= total;

  const groupedTickets = tickets.reduce<Record<string, typeof tickets>>(
    (acc, t) => {
      acc[t.gameName] = acc[t.gameName] || [];
      acc[t.gameName].push(t);
      return acc;
    },
    {}
  );

  const handleConfirm = async () => {
    if (!session) return alert("Please login first.");
    if (!hasEnoughCredits) return alert("Insufficient credits.");

    const formatted = tickets.map(
      ({ gameId, numbers, specialNumbers, priceCents }) => ({
        gameId,
        numbers,
        specialNumbers,
        priceCents,
      })
    );

    const action = await dispatch(submitTickets(formatted));

    if (submitTickets.fulfilled.match(action)) {
      dispatch(clearCart());
      dispatch(resetTicketState());

      const newSession = await update({ trigger: "update" });
      if (newSession?.user) {
        dispatch(setAccount(newSession.user));
      }
    }
  };

  if (status === "loading")
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center text-gray-400 bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c]">
        Loading your cart...
      </div>
    );

  if (!tickets.length)
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center text-gray-300 bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-center px-4">
        <p className="mb-6 text-lg">No tickets yet. Go play a game!</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90"
        >
          Play a Game
        </Link>
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-[#0a0a0a] to-[#1c1c1c] text-white pb-40 px-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto pt-16">
        <CartHeader
          session={session}
          credits={credits}
          onAddCredits={() => setShowAddCredits(true)}
        />

        {showAddCredits && (
          <AddCreditsModal onClose={() => setShowAddCredits(false)} />
        )}

        {Object.entries(groupedTickets).map(([game, group]) => (
          <TicketAccordion
            key={game}
            gameName={game}
            tickets={group}
            open={openGroups[game]}
            toggleOpen={() =>
              setOpenGroups((p) => ({ ...p, [game]: !p[game] }))
            }
            onRemove={(id: string) => dispatch(removeTicket(id))}
          />
        ))}

        <CartFooter
          total={total}
          ticketsCount={tickets.length}
          loading={loading}
          hasEnoughCredits={hasEnoughCredits}
          onClear={() => dispatch(clearCart())}
          onConfirm={handleConfirm}
          session={session}
        />

        {success && (
          <p className="text-green-400 text-center font-semibold mt-6 animate-pulse">
            ✅ Tickets purchased successfully!
          </p>
        )}
        {error && (
          <p className="text-red-400 text-center font-semibold mt-6">{error}</p>
        )}
      </div>
    </div>
  );
}
