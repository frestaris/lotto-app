"use client";

import { useState, useMemo } from "react";
import type { UserTicket } from "@/types/ticket";
import TicketAccordion from "./TicketAccordion";
import Link from "next/link";
import Spinner from "@/components/Spinner";

interface TicketListProps {
  tickets: UserTicket[];
  loading?: boolean;
}

export default function TicketList({
  tickets,
  loading = false,
}: TicketListProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    return tickets.reduce<Record<string, UserTicket[]>>((acc, t) => {
      const name = t.game.name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(t);
      return acc;
    }, {});
  }, [tickets]);

  const gameNames = Object.keys(grouped);

  // Show loading spinner (inside content area, not full page)
  if (loading) {
    return (
      <div className="py-20">
        <Spinner message="Loading your tickets..." variant="accent" size="lg" />
      </div>
    );
  }

  // No tickets found
  if (tickets.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400 mb-6">No tickets found.</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Play Now
        </Link>
      </div>
    );
  }

  // Render grouped accordions
  return (
    <>
      {gameNames.map((gameName) => (
        <TicketAccordion
          key={gameName}
          gameName={gameName}
          tickets={grouped[gameName]}
          open={openGroups[gameName]}
          toggleOpen={() =>
            setOpenGroups((prev) => ({
              ...prev,
              [gameName]: !prev[gameName],
            }))
          }
        />
      ))}
    </>
  );
}
