"use client";

import * as Icons from "lucide-react";
import { ChevronDown, Trash2 } from "lucide-react";
import { getGameColor } from "@/utils/getGameColor";

interface Ticket {
  id: string;
  priceCents: number;
  numbers: number[];
  specialNumbers: number[];
  iconName?: string | null;
  slug?: string | null;
  gameName?: string;
  game?: {
    name: string;
    slug: string | null;
    iconName: string | null;
  } | null;
}

interface TicketAccordionProps {
  gameName: string;
  tickets: Ticket[];
  open?: boolean;
  toggleOpen: () => void;
  onRemove?: (id: string) => void;
}

export default function TicketAccordion({
  gameName,
  tickets,
  open,
  toggleOpen,
  onRemove,
}: TicketAccordionProps) {
  const first = tickets[0];

  const iconName = first?.iconName ?? first?.game?.iconName ?? "Ticket";

  const slug =
    first?.slug ??
    first?.game?.slug ??
    gameName.toLowerCase().replace(/\s+/g, "-");

  const Icon =
    (Icons[iconName as keyof typeof Icons] as React.ElementType) ||
    Icons.Ticket;

  const color = getGameColor(slug ?? "");
  const gameTotalCents = tickets.reduce(
    (sum, t) => sum + (t.priceCents || 0),
    0
  );

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5 mb-4">
      {/* HEADER */}
      <div
        onClick={toggleOpen}
        className={`flex justify-between items-center gap-2 px-4 py-3 transition cursor-pointer ${
          open ? "bg-white/10" : "hover:bg-white/10"
        }`}
      >
        {/* LEFT: Icon + Game Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-8 h-8 flex items-center justify-center rounded-md border border-yellow-400/30 bg-black/20 group">
            <div className="absolute inset-0 blur-md rounded-full bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Icon
              className={`relative w-5 h-5 ${color} drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-110`}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className="text-yellow-400 font-semibold text-lg leading-tight">
              {gameName}
            </span>
            <span className="text-sm text-gray-400 sm:mt-0 mt-1">
              {tickets.length} Ticket{tickets.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* RIGHT: Total + Chevron */}
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 font-semibold text-sm sm:text-base">
            ${(gameTotalCents / 100).toFixed(2)}
          </span>
          <ChevronDown
            className={`w-5 h-5 transform transition-transform duration-300 ${
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
          {tickets.map((t, index) => (
            <div
              key={t.id}
              className="flex justify-between items-center bg-white/5 rounded-lg p-3 hover:bg-white/10 transition"
            >
              {/* LEFT SIDE */}
              <div className="text-left space-y-1">
                {/* Game label */}
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Game {index + 1}
                </p>

                {/* NUMBERS */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {t.numbers.map((num, idx) => (
                    <span
                      key={`main-${idx}`}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border font-medium text-[10px] sm:text-xs md:text-sm bg-yellow-400 text-black border-yellow-400 shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                    >
                      {num}
                    </span>
                  ))}

                  {t.specialNumbers.length > 0 && (
                    <span className="text-yellow-400 font-semibold px-1">
                      +
                    </span>
                  )}

                  {t.specialNumbers.map((num, idx) => (
                    <span
                      key={`special-${idx}`}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border font-medium text-[10px] sm:text-xs md:text-sm bg-orange-500 text-black border-orange-500 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                    >
                      {num}
                    </span>
                  ))}
                </div>

                {/* PRICE */}
                <p className="text-xs text-gray-500">
                  ${(t.priceCents / 100).toFixed(2)}
                </p>
              </div>

              {/* REMOVE BUTTON */}
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(t.id);
                  }}
                  className="text-red-400 hover:text-red-300 transition hover:cursor-pointer"
                  title="Remove ticket"
                >
                  <Trash2 />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
