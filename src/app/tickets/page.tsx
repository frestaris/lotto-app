"use client";

import { useGetUserTicketsQuery } from "@/redux/slices/gameApi";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function MyTicketsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.email ?? null;

  const { data: tickets = [], isLoading } = useGetUserTicketsQuery(userId!, {
    skip: !userId,
  });

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
    return (
      <div className="text-center text-gray-400 py-10">
        Loading your tickets...
      </div>
    );

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
    <div className="max-w-5xl mx-auto py-10 text-white">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">My Tickets</h1>

      <div className="grid sm:grid-cols-2 gap-6">
        {tickets.map((t) => {
          const status = t.result;

          const statusColor =
            status === "WON"
              ? "text-green-400"
              : status === "LOST"
              ? "text-red-400"
              : "text-yellow-400";

          const drawDate = t.draw?.drawDate
            ? new Date(t.draw.drawDate).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })
            : "Unknown date";

          return (
            <div
              key={t.id}
              className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition"
            >
              {/* Game Header */}
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={t.game.logoUrl || "/images/default-logo.png"}
                  alt={t.game.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain rounded-md"
                />
                <div>
                  <h2 className="text-lg font-semibold">{t.game.name}</h2>
                  <p className="text-sm text-gray-400">
                    Draw {t.draw?.drawNumber ?? "?"} — {drawDate}
                  </p>
                </div>
              </div>

              {/* Numbers */}
              <div className="flex flex-wrap gap-2 mb-4">
                {t.numbers.map((n: number, i: number) => (
                  <div
                    key={i}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 text-black font-bold text-sm"
                  >
                    {n}
                  </div>
                ))}
                {t.specialNumbers.length > 0 && (
                  <span className="text-yellow-400 font-semibold px-1">+</span>
                )}
                {t.specialNumbers.map((n: number, i: number) => (
                  <div
                    key={i}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-white font-bold text-sm"
                  >
                    {n}
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className={`text-sm font-semibold ${statusColor}`}>
                {status === "WON"
                  ? "🏆 Congratulations! You Won!"
                  : status === "LOST"
                  ? "❌ No Win"
                  : "🟡 Awaiting Draw Results"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
