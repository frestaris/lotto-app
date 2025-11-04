"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useGetUserTransactionsQuery } from "@/redux/api/accountApi";
import Spinner from "@/components/Spinner";
import EmptyState from "../tickets/components/EmptyState";
import MonthSelector from "../tickets/components/MonthSelector";
import { convertToYearMonth } from "@/utils/groupTicketsByMonth";
import TransactionList from "./components/TransactionList";

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [months, setMonths] = useState<string[]>([]);

  useEffect(() => {
    const now = new Date();
    const recentMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      return d.toLocaleString("default", { month: "short", year: "numeric" });
    });
    setMonths(recentMonths.reverse());
  }, []);

  // Pick latest by default
  const activeMonth = selectedMonth || months[months.length - 1];
  const monthParam = activeMonth ? convertToYearMonth(activeMonth) : undefined;

  // Fetch transactions for that month
  const { data, isLoading, isFetching, isError } = useGetUserTransactionsQuery(
    monthParam,
    { skip: !monthParam || !session }
  );

  // Handle session and loading states
  if (status === "loading" || isLoading)
    return <Spinner fullScreen message="Loading transactions..." />;

  if (status === "unauthenticated")
    return (
      <EmptyState
        message="Please sign in to view your transactions."
        buttonLabel="Sign In"
        href="/login"
      />
    );

  if (isError)
    return (
      <EmptyState
        message="Failed to load your transactions."
        buttonLabel="Retry"
        href="/transactions"
      />
    );

  const transactions = data?.transactions ?? [];

  // Render
  return (
    <div className="max-w-4xl mx-auto py-10 text-white">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">Transactions</h1>

      <MonthSelector
        months={months}
        activeMonth={activeMonth}
        onSelect={setSelectedMonth}
      />

      <h2 className="text-lg text-gray-300 font-semibold mb-4">
        Showing transactions for{" "}
        <span className="text-yellow-400">{activeMonth || "…"}</span>
      </h2>

      {isFetching ? (
        <div className="flex justify-center py-10">
          <Spinner message="Loading transactions..." variant="accent" />
        </div>
      ) : (
        <TransactionList transactions={transactions} />
      )}

      <div className="h-10" />
    </div>
  );
}
