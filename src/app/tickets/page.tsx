"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useGetUserTicketsQuery } from "@/redux/api/gameApi";
import { groupTicketsByMonth } from "@/utils/groupTicketsByMonth";
import EmptyState from "./components/EmptyState";
import MonthSelector from "./components/MonthSelector";
import TicketList from "./components/TicketList";

export default function MyTicketsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.email ?? "";

  const { data: tickets = [], isLoading } = useGetUserTicketsQuery(userId, {
    skip: !userId,
  });

  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Group tickets by month
  const grouped = useMemo(() => groupTicketsByMonth(tickets), [tickets]);
  const months = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const defaultMonth = months.length ? months[0] : "";
  const activeMonth = selectedMonth || defaultMonth;
  const filteredTickets = grouped[activeMonth] || [];

  // Not logged in
  if (!session)
    return (
      <EmptyState
        message="Please sign in to view your tickets."
        buttonLabel="Sign In"
        href="/login"
      />
    );

  // Loading
  if (isLoading) return <EmptyState loading />;

  // No tickets at all
  if (tickets.length === 0)
    return (
      <EmptyState
        message="No tickets found. Go play a game!"
        buttonLabel="Play Now"
        href="/"
      />
    );

  // Main content
  return (
    <div className="max-w-4xl mx-auto py-10 text-white">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">My Tickets</h1>

      <MonthSelector
        months={months}
        activeMonth={activeMonth}
        onSelect={setSelectedMonth}
      />

      <h2 className="text-lg text-gray-300 font-semibold mb-4">
        Showing tickets purchased in{" "}
        <span className="text-yellow-400">{activeMonth || "…"}</span>
      </h2>

      <TicketList tickets={filteredTickets} activeMonth={activeMonth} />
    </div>
  );
}
