"use client";

interface MonthSelectorProps {
  months: string[];
  activeMonth: string;
  onSelect: (month: string) => void;
}

export default function MonthSelector({
  months,
  activeMonth,
  onSelect,
}: MonthSelectorProps) {
  return (
    <div className="flex overflow-x-auto gap-3 pb-3 mb-6 border-b border-white/10 scrollbar-hide ">
      {months.map((month) => (
        <button
          key={month}
          onClick={() => onSelect(month)}
          className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition cursor-pointer ${
            month === activeMonth
              ? "bg-yellow-400 text-black border-yellow-400"
              : "border-white/20 text-gray-400 hover:text-white"
          }`}
        >
          {month}
        </button>
      ))}
    </div>
  );
}
