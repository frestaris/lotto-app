"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useGetUserTicketsQuery } from "@/redux/api/gameApi";
import EmptyState from "./components/EmptyState";
import MonthSelector from "./components/MonthSelector";
import TicketList from "./components/TicketList";
import { convertToYearMonth } from "@/utils/groupTicketsByMonth";

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [months, setMonths] = useState<string[]>([]);

  // Generate last 6 months dynamically
  useEffect(() => {
    const now = new Date();
    const recentMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      return d.toLocaleString("default", { month: "short", year: "numeric" });
    });
    setMonths(recentMonths.reverse());
  }, []);

  const activeMonth = selectedMonth || months[months.length - 1];
  const monthParam = activeMonth ? convertToYearMonth(activeMonth) : undefined;

  // Fetch tickets for that month
  const { data, isLoading, isFetching, isError } = useGetUserTicketsQuery(
    { month: monthParam },
    { skip: !monthParam || !session }
  );

  // Handle session states
  if (status === "loading" || isLoading) return <EmptyState loading />;

  if (status === "unauthenticated")
    return (
      <EmptyState
        message="Please sign in to view your tickets."
        buttonLabel="Sign In"
        href="/login"
      />
    );

  if (isError)
    return (
      <EmptyState
        message="Failed to load your tickets."
        buttonLabel="Retry"
        href="/tickets"
      />
    );

  const tickets = data?.tickets || [];

  // Main UI
  return (
    <div className="max-w-4xl mx-auto py-10 text-white">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">My Tickets</h1>

      <MonthSelector
        months={months}
        activeMonth={activeMonth}
        onSelect={setSelectedMonth}
      />

      <h2 className="text-lg text-gray-300 font-semibold mb-4">
        Showing draws in{" "}
        <span className="text-yellow-400">{activeMonth || "…"}</span>
      </h2>

      <TicketList tickets={tickets} loading={isFetching} />

      <div className="h-10" />
    </div>
  );
}
