"use client";

import { useState, useMemo } from "react";
import type { UserTicket } from "@/types/ticket";
import TicketAccordion from "./TicketAccordion";

interface TicketListProps {
  tickets: UserTicket[];
  activeMonth: string;
}

export default function TicketList({ tickets, activeMonth }: TicketListProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Group tickets by game name
  const grouped = useMemo(() => {
    return tickets.reduce<Record<string, UserTicket[]>>((acc, t) => {
      const name = t.game.name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(t);
      return acc;
    }, {});
  }, [tickets]);

  const gameNames = Object.keys(grouped);

  if (tickets.length === 0) {
    return (
      <p className="text-gray-500 text-center py-6">
        No tickets found for {activeMonth}.
      </p>
    );
  }

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
