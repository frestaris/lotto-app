"use client";

import { ChevronDown, Trash2 } from "lucide-react";

interface CartTicket {
  id: string;
  gameId: string;
  gameName: string;
  numbers: number[];
  specialNumbers: number[];
  priceCents: number;
}

interface TicketAccordionProps {
  gameName: string;
  tickets: CartTicket[];
  open?: boolean;
  toggleOpen: () => void;
  onRemove: (id: string) => void;
}

export default function TicketAccordion({
  gameName,
  tickets,
  open,
  toggleOpen,
  onRemove,
}: TicketAccordionProps) {
  const gameTotalCents = tickets.reduce((sum, t) => sum + t.priceCents, 0);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5 mb-4">
      {/* 🔹 Entire header clickable */}
      {/* 🔹 Entire header clickable */}
      <div
        onClick={toggleOpen}
        className={`flex justify-between items-center gap-2 px-4 py-3 transition cursor-pointer ${
          open ? "bg-white/10" : "hover:bg-white/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-left flex-1">
          <span className="text-yellow-400 font-semibold text-lg leading-tight">
            {gameName}
          </span>
          <span className="text-sm text-gray-400 sm:mt-0 mt-1">
            {tickets.length} Ticket{tickets.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* 🧮 Game total */}
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 font-semibold text-sm sm:text-base">
            ${(gameTotalCents / 100).toFixed(2)}
          </span>

          <ChevronDown
            className={`w-5 h-5 transform transition-transform duration-300 ${
              open ? "rotate-180 text-yellow-400" : "rotate-0"
            }`}
          />
        </div>
      </div>

      {/* 🔽 Accordion content */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          open ? "max-h-[9999px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="space-y-3 px-4">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center bg-white/5 rounded-lg p-3 hover:bg-white/10 transition"
            >
              <div className="text-left space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {t.numbers.map((num, idx) => (
                    <span
                      key={`main-${idx}`}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border font-medium text-[10px] sm:text-xs md:text-sm bg-yellow-400 text-black border-yellow-400 shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                    >
                      {num}
                    </span>
                  ))}

                  {t.specialNumbers.map((num, idx) => (
                    <span
                      key={`special-${idx}`}
                      className="ml-1 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border font-medium text-[10px] sm:text-xs md:text-sm bg-orange-500 text-black border-orange-500 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                    >
                      {num}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  ${(t.priceCents / 100).toFixed(2)}
                </p>
              </div>

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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
