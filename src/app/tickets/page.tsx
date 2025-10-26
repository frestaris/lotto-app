"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { getGameColor } from "@/utils/getGameColor";
import { useGetUserTicketsQuery } from "@/redux/slices/gameApi";
import type { UserTicket } from "@/types/ticket";

/**
 * Groups tickets by their purchase month/year
 */
function groupTicketsByMonth(
  tickets: UserTicket[]
): Record<string, UserTicket[]> {
  const groups: Record<string, UserTicket[]> = {};
  for (const t of tickets) {
    const date = new Date(t.createdAt);
    const key = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}

export default function MyTicketsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.email ?? "";

  const { data: tickets = [], isLoading } = useGetUserTicketsQuery(userId, {
    skip: !userId,
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Group tickets by month
  const grouped = useMemo(() => groupTicketsByMonth(tickets), [tickets]);
  const months = Object.keys(grouped);
  const defaultMonth = months.length ? months[0] : "";
  const activeMonth = selectedMonth || defaultMonth;
  const filteredTickets = grouped[activeMonth] || [];

  if (!session)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <p className="mb-4">Please sign in to view your tickets.</p>
        <Link
          href="/login"
          className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
        >
          Sign In
        </Link>
      </div>
    );

  if (isLoading)
    return <div className="text-center text-gray-400 py-10">Loading...</div>;

  if (tickets.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <p>No tickets found. Go play a game!</p>
        <Link
          href="/"
          className="mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Play Now
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-10 text-white">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">My Tickets</h1>

      {/* Month Selector */}
      <div className="flex overflow-x-auto gap-3 pb-3 mb-6 border-b border-white/10 scrollbar-hide">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition ${
              month === activeMonth
                ? "bg-yellow-400 text-black border-yellow-400"
                : "border-white/20 text-gray-400 hover:text-white"
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      <h2 className="text-lg text-gray-300 font-semibold mb-4">
        Showing tickets purchased in{" "}
        <span className="text-yellow-400">{activeMonth || "…"}</span>
      </h2>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          No tickets found for {activeMonth}.
        </p>
      ) : (
        filteredTickets.map((t) => {
          const status = t.result;
          const draw = t.draw;
          const drawDate = draw?.drawDate
            ? new Date(draw.drawDate).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })
            : "Unknown date";

          const statusLabel =
            status === "WON"
              ? "Win"
              : status === "LOST"
              ? "❌ No Win"
              : "🟡 Pending";

          const statusColor =
            status === "WON"
              ? "text-green-400"
              : status === "LOST"
              ? "text-red-400"
              : "text-yellow-400";

          const matchedMain =
            draw?.winningMainNumbers?.filter((n) => t.numbers.includes(n)) ??
            [];

          const matchedSpecial =
            draw?.winningSpecialNumbers?.filter((n) =>
              t.specialNumbers.includes(n)
            ) ?? [];

          return (
            <div
              key={t.id}
              className="bg-white/5 rounded-xl border border-white/10 p-5 mb-4 hover:bg-white/10 transition"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    // ✅ Pick the correct Lucide icon from the game’s iconName
                    const Icon =
                      (Icons[
                        t.game.iconName as keyof typeof Icons
                      ] as React.ElementType) || Icons.Ticket;

                    // ✅ Apply the global color
                    const iconColor = getGameColor(t.game.slug);

                    return (
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border border-yellow-400/30 bg-black/20">
                        <Icon
                          className={`w-6 h-6 ${iconColor} drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]`}
                        />
                      </div>
                    );
                  })()}

                  <div>
                    <h3 className="font-semibold">{t.game.name}</h3>
                    <p className="text-sm text-gray-400">
                      Draw {draw?.drawNumber ?? "?"} — {drawDate}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold flex items-center gap-2 ${statusColor}`}
                >
                  {statusLabel}
                  {status === "WON" && (t.payoutCents ?? 0) > 0 && (
                    <span className="text-green-400 font-bold">
                      ${((t.payoutCents ?? 0) / 100).toLocaleString()}
                    </span>
                  )}
                </span>
              </div>

              {expandedId === t.id && (
                <div className="mt-4 border-t border-white/10 pt-3 text-sm">
                  {/* Draw Winning Numbers */}
                  {draw?.status === "COMPLETED" && (
                    <div className="mb-4">
                      <p className="text-gray-400 mb-2 font-medium">
                        Winning Numbers:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {draw.winningMainNumbers.map((n, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 text-black font-bold text-sm"
                          >
                            {n}
                          </div>
                        ))}
                        {draw.winningSpecialNumbers.length > 0 && (
                          <span className="text-yellow-400 font-semibold px-1">
                            +
                          </span>
                        )}
                        {draw.winningSpecialNumbers.map((n, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-white font-bold text-sm"
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User’s Picked Numbers */}
                  <p className="text-gray-400 mb-2 font-medium">
                    Your Numbers:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {t.numbers.map((n, i) => {
                      const matched = matchedMain.includes(n);
                      return (
                        <div
                          key={i}
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                            matched
                              ? "bg-green-500 text-black"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {n}
                        </div>
                      );
                    })}

                    {t.specialNumbers.length > 0 && (
                      <span className="text-yellow-400 font-semibold px-1">
                        +
                      </span>
                    )}

                    {t.specialNumbers.map((n, i) => {
                      const matched = matchedSpecial.includes(n);
                      return (
                        <div
                          key={i}
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                            matched
                              ? "bg-purple-500 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {n}
                        </div>
                      );
                    })}
                  </div>

                  {/* Cost + Purchase Date */}
                  <p className="text-gray-400">
                    Total cost:{" "}
                    <span className="text-yellow-400 font-semibold">
                      ${(t.priceCents / 100).toFixed(2)}
                    </span>
                  </p>

                  <p className="text-gray-500 text-xs mt-1">
                    Purchased on{" "}
                    {new Date(t.createdAt).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
