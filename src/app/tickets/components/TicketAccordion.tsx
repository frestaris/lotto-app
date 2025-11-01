"use client";

import * as Icons from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { UserTicket } from "@/types/ticket";
import { getGameColor } from "@/utils/getGameColor";
import { formatDate } from "@/utils/formatDate";

interface TicketAccordionProps {
  gameName: string;
  tickets: UserTicket[];
  open: boolean;
  toggleOpen: () => void;
}

export default function TicketAccordion({
  gameName,
  tickets,
  open,
  toggleOpen,
}: TicketAccordionProps) {
  const firstTicket = tickets[0];
  const draw = firstTicket?.draw;
  const gameIcon = firstTicket?.game?.iconName ?? "Ticket";

  // Draw info
  const drawNumber = draw?.drawNumber ?? "?";
  const drawDate = draw?.drawDate ? formatDate(draw.drawDate) : "Unknown date";

  const mainNumbers = draw?.winningMainNumbers ?? [];
  const specialNumbers = draw?.winningSpecialNumbers ?? [];

  const Icon =
    (Icons[gameIcon as keyof typeof Icons] as React.ElementType) ||
    Icons.Ticket;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5 mx-2 mb-4">
      {/* HEADER */}
      <div
        onClick={toggleOpen}
        className={`relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-4 py-3 transition cursor-pointer ${
          open ? "bg-white/10" : "hover:bg-white/10"
        }`}
      >
        {/* LEFT: Game + Draw Info + Winning Numbers */}
        <div className="flex flex-col gap-2 my-2 flex-1">
          {/* Game Icon + Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-md border border-yellow-400/30 bg-black/20">
              <Icon
                className={`w-5 h-5 ${getGameColor(
                  firstTicket?.game?.slug
                )} drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]`}
              />
            </div>
            <h3 className="text-lg font-semibold text-yellow-400">
              {gameName}
            </h3>
          </div>

          {/* Draw Info (mobile only) */}
          <div className="text-sm text-gray-400 font-medium sm:hidden">
            Draw {drawNumber} — {drawDate}
          </div>

          {/* Games Count (always visible below draw info) */}
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
            • {tickets.length} Game{tickets.length > 1 ? "s" : ""}
            {draw?.status === "COMPLETED" && (
              <>
                {/* Count how many tickets won */}
                {tickets.some((t) => t.result === "WON") && (
                  <span className="text-green-400 ml-1">
                    • {tickets.filter((t) => t.result === "WON").length} Won
                  </span>
                )}
              </>
            )}
          </div>

          {/* Winning Numbers */}
          {draw?.status === "COMPLETED" && (
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {mainNumbers.map((n, i) => (
                <span
                  key={i}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-black font-semibold text-sm bg-yellow-400 border border-yellow-400 shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                >
                  {n}
                </span>
              ))}
              {specialNumbers.length > 0 && (
                <span className="text-yellow-400 font-semibold px-1">+</span>
              )}
              {specialNumbers.map((n, i) => (
                <span
                  key={i}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-white font-semibold text-sm bg-orange-500 border border-orange-500 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                >
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Draw Info (desktop only) + Chevron */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-sm text-gray-400 absolute sm:static top-3 right-4">
          <span className="hidden sm:inline font-medium">
            Draw {drawNumber} — {drawDate}
          </span>

          <ChevronDown
            className={`w-6 h-6 transform transition-transform duration-300 ${
              open ? "rotate-180 text-yellow-400" : "rotate-0 text-gray-400"
            }`}
          />
        </div>
      </div>

      {/* BODY */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          open ? "max-h-[9999px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="space-y-3 px-4">
          {tickets.map((t, index) => {
            const matchedMain =
              draw?.winningMainNumbers?.filter((n) => t.numbers.includes(n)) ??
              [];
            const matchedSpecial =
              draw?.winningSpecialNumbers?.filter((n) =>
                t.specialNumbers.includes(n)
              ) ?? [];

            const status = t.result;
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

            return (
              <div
                key={t.id}
                className="bg-white/5 rounded-lg border border-white/10 p-3 hover:bg-white/10 transition"
              >
                {/* 🏷️ Game label */}
                <div className="text-xs text-gray-400 font-medium mb-2">
                  Game {index + 1}
                </div>

                {/* Numbers + Status row */}
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Numbers */}
                  <div className="flex flex-wrap items-center gap-2">
                    {t.numbers.map((n, i) => (
                      <span
                        key={`main-${i}`}
                        className={`w-7 h-7 flex items-center justify-center rounded-full font-semibold text-sm ${
                          matchedMain.includes(n)
                            ? "bg-green-500 text-black"
                            : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        {n}
                      </span>
                    ))}

                    {t.specialNumbers.length > 0 && (
                      <span className="text-yellow-400 font-semibold px-1">
                        +
                      </span>
                    )}

                    {t.specialNumbers.map((n, i) => (
                      <span
                        key={`special-${i}`}
                        className={`w-7 h-7 flex items-center justify-center rounded-full font-semibold text-sm ${
                          matchedSpecial.includes(n)
                            ? "bg-purple-500 text-white"
                            : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        {n}
                      </span>
                    ))}
                  </div>

                  {/* Right: Status */}
                  <div
                    className={`text-sm font-medium ${statusColor} text-right sm:min-w-[90px]`}
                  >
                    {statusLabel}
                    {status === "WON" && (t.payoutCents ?? 0) > 0 && (
                      <span className="ml-1 text-green-400 font-bold">
                        ${((t.payoutCents ?? 0) / 100).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
